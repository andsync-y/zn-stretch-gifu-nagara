#!/usr/bin/env node
/**
 * 来店記録CSVから、回数券の「実売」の集計だけを作る（オープンから現在まで）。
 *
 * 目的：価格表上の「最多販売」ではなく実際に売れた券種・実単価・顧客あたりの累計購入額（実現LTV）を出す。
 *
 * ⚠️ 個人情報
 *   - CSVには顧客名が入る。ダウンロード先はActionsの実行環境（毎回破棄）のみ。
 *   - 出力JSONに含めるのは **集計値だけ**（件数・金額・分布）。顧客名・顧客ID・電話番号は出さない。
 *
 * 期間の取り方（2026-08-20の実測で分かった制約に従う）：
 *   - 「先月」「今月」プリセットは確実に効く。
 *   - 「今年」は件数上限（約347行）で古い行が落ちる。
 *   - 期間入力欄へのスクリプト入力は「画面だけ変わってCSVが変わらない」ことがあった。
 *     ここでは入力欄も試すが、**CSVの中身の日付範囲で検証**し、合わなければ採用しない。
 *   採用できた期間を coverage として出力し、オープン日から覆えていなければ `complete: false` にする。
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { decodeCsv, parseCsv, normalizeDate, normalizeValue, uncoveredRange } from './lib/visit-csv.mjs';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const OPEN_DATE = process.env.OPEN_DATE || '2026-06-20';
const OUT_FILE = process.env.OUT_FILE || 'out/ticket_stats.json';
const selectors = JSON.parse(fs.readFileSync(new URL('./selectors.json', import.meta.url), 'utf8'));

const log = [];
const say = (s) => { console.log(s); log.push(s); };
const jst = (ms) => new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
const TODAY = jst(Date.now());

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ja-JP', acceptDownloads: true });
const page = await context.newPage();

async function login() {
  const conf = selectors.login || {};
  await page.goto(conf.url || BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);
  const passInput = page.locator('input[type="password"]').first();
  if (!USER || !PASS) throw new Error('ZN_SYSTEM_USER / ZN_SYSTEM_PASS が未設定');
  const form = passInput.locator('xpath=ancestor::form[1]');
  const scope = (await form.count()) > 0 ? form : page.locator('body');
  await scope.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').first().fill(USER);
  await passInput.fill(PASS);
  const submit = page.locator('button[type="submit"], input[type="submit"], button:has-text("ログイン")').first();
  if ((await submit.count()) > 0) await submit.click(); else await passInput.press('Enter');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  if ((await page.locator(conf.successCheck || 'button:has-text("ログアウト")').count()) === 0) throw new Error('ログイン失敗');
}

async function openVisitRecords() {
  const ok = await page.evaluate(() => {
    const el = [...document.querySelectorAll('a, button')].find((e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === '来店記録');
    if (!el) return false; el.click(); return true;
  });
  if (!ok) throw new Error('ナビ「来店記録」が見つからない');
  await page.waitForTimeout(3500);
}

async function openRangePanel() {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /\d{4}-\d{2}-\d{2}/.test(e.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(800);
}

async function panelButtons() {
  return page.evaluate(() => [...document.querySelectorAll('button, a')]
    .filter((b) => b.offsetParent !== null)
    .map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((t) => t && t.length <= 20));
}

async function clickPreset(label) {
  for (let i = 0; i < 2; i++) {
    const vis = await page.evaluate((l) => {
      const b = [...document.querySelectorAll('button, a')].find((e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === l);
      return !!b && b.offsetParent !== null;
    }, label);
    if (!vis) { await openRangePanel(); continue; }
    await page.evaluate((l) => {
      const b = [...document.querySelectorAll('button, a')].find((e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === l);
      b.click();
    }, label);
    await page.waitForTimeout(2500);
    return true;
  }
  return false;
}

/** 入力欄に人間と同じ操作（クリック→全選択→タイプ→Enter）で期間を入れてみる。効いたかはCSVで判定する */
async function typeRange(from, to) {
  await openRangePanel();
  const f = page.locator('#vfFromInput');
  const t = page.locator('#vfToInput');
  if ((await f.count()) === 0 || (await t.count()) === 0) return false;
  for (const [loc, v] of [[f, from], [t, to]]) {
    await loc.click({ force: true }).catch(() => {});
    await page.keyboard.press('Control+A');
    await page.keyboard.type(v, { delay: 30 });
    await page.keyboard.press('Tab');
  }
  // 適用ボタンがあれば押す
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^(適用|反映|更新|OK|検索)$/.test((e.textContent || '').trim()));
    if (b && b.offsetParent !== null) b.click();
  });
  await page.keyboard.press('Enter').catch(() => {});
  await page.waitForTimeout(3000);
  return true;
}

async function downloadCsv() {
  let dl;
  try {
    [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 45000 }),
      page.evaluate(() => {
        const el = [...document.querySelectorAll('button, a')].find((e) => (e.textContent || '').includes('CSVダウンロード'));
        if (!el) throw new Error('CSVダウンロードのボタンが見つからない');
        el.click();
      }),
    ]);
  } catch (e) {
    if (String(e).includes('Timeout')) return null;
    throw e;
  }
  const buf = fs.readFileSync(await dl.path());
  return parseCsv(decodeCsv(buf).text);
}

function dateRange(rows) {
  const i = (rows[0] || []).findIndex((h) => String(h).trim() === '来店日');
  const d = rows.slice(1).map((r) => normalizeDate(r[i])).filter(Boolean).sort();
  return d.length ? { from: d[0], to: d[d.length - 1], n: rows.length - 1 } : null;
}

// ---------------------------------------------------------------- 収集
const allRows = new Map(); // 重複除去キー → 行（ヘッダ位置は最初のCSVに合わせる）
let header = null;
const coverage = [];
const attempts = [];

function absorb(rows, label, trustFrom) {
  if (!rows || rows.length < 2) { attempts.push({ label, rows: 0 }); return; }
  if (!header) header = rows[0];
  const r = dateRange(rows);
  const hdr = rows[0];
  if (hdr.join('|') !== header.join('|')) throw new Error(`列構成が異なるCSV（${label}）`);
  for (const row of rows.slice(1)) allRows.set(row.join('\u0001'), row);
  // 件数上限で古い行が落ちている可能性がある場合、CSVの実データ範囲だけを「覆えた」と数える
  const from = trustFrom && r.from <= trustFrom ? trustFrom : r.from;
  coverage.push({ from, to: r.to });
  attempts.push({ label, rows: r.n, csv_from: r.from, csv_to: r.to });
}

try {
  await login();
  say('- ログイン成功');
  await openVisitRecords();
  await openRangePanel();
  const buttons = await panelButtons();
  say(`- 画面のボタン（期間パネル含む）: ${buttons.join(' / ')}`);

  for (const preset of ['先月', '今月', '今年']) {
    if (await clickPreset(preset)) absorb(await downloadCsv(), preset);
    else attempts.push({ label: preset, missing: true });
  }
  // 他のプリセット候補（存在すれば使う）
  for (const preset of buttons.filter((b) => /(先々月|前月|過去|ヶ月|か月|全期間|すべて|前年|昨年)/.test(b))) {
    if (await clickPreset(preset)) absorb(await downloadCsv(), preset);
  }
  // 月単位で入力欄を試す（オープン月〜今月）。CSVの中身が指定月に収まっているときだけ採用
  const months = [];
  for (let d = new Date(`${OPEN_DATE.slice(0, 7)}-01T00:00:00Z`); d.toISOString().slice(0, 7) <= TODAY.slice(0, 7); d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push(d.toISOString().slice(0, 7));
  }
  for (const m of months) {
    const from = `${m}-01`;
    const last = new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 0)).toISOString().slice(0, 10);
    if (!(await typeRange(from, last))) { attempts.push({ label: `入力欄 ${m}`, missing: true }); break; }
    const rows = await downloadCsv();
    const r = rows && dateRange(rows);
    if (r && r.from >= from && r.to <= last) absorb(rows, `入力欄 ${m}`);
    else attempts.push({ label: `入力欄 ${m}`, rejected: true, csv_from: r?.from, csv_to: r?.to, rows: r?.n });
  }
} catch (e) {
  say(`- エラー: ${String(e).slice(0, 300)}`);
}
await browser.close();

// ---------------------------------------------------------------- 集計（顧客名・IDは出力しない）
const H = header || [];
const col = (name) => H.findIndex((h) => String(h).trim() === name);
const C = {
  date: col('来店日'), cid: col('顧客ID'), kind: col('来店種別'), route: col('来店経路'), course: col('コース'),
  ticket: col('回数券購入'), sT: col('施術売上'), sK: col('回数券売上'), sS: col('指名売上'), sAll: col('合計売上'),
};
const rows = [...allRows.values()]
  .map((r) => ({ r, date: normalizeDate(r[C.date]) }))
  .filter((x) => x.date && x.date >= OPEN_DATE && x.date <= TODAY)
  .sort((a, b) => (a.date < b.date ? -1 : 1));

const num = (v) => normalizeValue(v) ?? 0;
const tickets = [];
const cust = new Map();
const kindDist = {};
for (const { r, date } of rows) {
  const id = String(r[C.cid] ?? '').trim() || `(ID無し)${date}`;
  if (!cust.has(id)) cust.set(id, { first: date, visits: 0, total: 0, ticketSpend: 0, tickets: [] });
  const c = cust.get(id);
  c.visits++;
  c.total += C.sAll >= 0 ? num(r[C.sAll]) : num(r[C.sT]) + num(r[C.sK]) + num(r[C.sS]);
  const item = String(r[C.ticket] ?? '').trim();
  if (item) {
    const value = num(r[C.sK]);
    const kind = String(r[C.kind] ?? '').trim() || '(空)';
    kindDist[kind] = (kindDist[kind] || 0) + 1;
    const nth = c.tickets.length + 1;
    c.tickets.push({ date, item, value });
    c.ticketSpend += value;
    tickets.push({ date, item, value, kind, nth });
  }
}

const group = (arr, keyFn) => {
  const m = {};
  for (const t of arr) {
    const k = keyFn(t);
    m[k] ??= { count: 0, sum: 0, prices: {} };
    m[k].count++; m[k].sum += t.value; m[k].prices[t.value] = (m[k].prices[t.value] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1].count - a[1].count)
    .map(([k, v]) => [k, { ...v, avg: v.count ? Math.round(v.sum / v.count) : 0 }]));
};

const buyers = [...cust.values()].filter((c) => c.tickets.length > 0);
const purchasesPerBuyer = {};
for (const b of buyers) purchasesPerBuyer[b.tickets.length] = (purchasesPerBuyer[b.tickets.length] || 0) + 1;
const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0);
const gap = uncoveredRange(coverage, OPEN_DATE, TODAY);

const out = {
  generated_at: new Date().toISOString(),
  period: { from: OPEN_DATE, to: TODAY },
  complete: !gap,
  uncovered: gap,
  coverage_attempts: attempts,
  visit_rows: rows.length,
  customers: cust.size,
  tickets: {
    count: tickets.length,
    sum: tickets.reduce((s, t) => s + t.value, 0),
    avg: avg(tickets.map((t) => t.value)),
    by_item: group(tickets, (t) => t.item),
    by_month: group(tickets, (t) => t.date.slice(0, 7)),
    by_nth_purchase: group(tickets, (t) => (t.nth === 1 ? '1本目（初回購入）' : `${t.nth}本目（更新）`)),
    first_vs_repeat: group(tickets, (t) => (t.nth === 1 ? '初回購入' : '2本目以降')),
    visit_kind_on_ticket_rows: kindDist,
  },
  buyers: {
    count: buyers.length,
    purchases_per_buyer: purchasesPerBuyer,
    avg_ticket_spend: avg(buyers.map((b) => b.ticketSpend)),
    avg_total_spend: avg(buyers.map((b) => b.total)),
    avg_visits: +(buyers.reduce((s, b) => s + b.visits, 0) / (buyers.length || 1)).toFixed(2),
  },
  non_buyers: {
    count: cust.size - buyers.length,
    avg_total_spend: avg([...cust.values()].filter((c) => !c.tickets.length).map((c) => c.total)),
  },
  log,
};
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
say(`- 出力: ${OUT_FILE} / 回数券 ${out.tickets.count}本 / 期間完全=${out.complete}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['# 回数券の実売集計', '', ...log].join('\n') + '\n');
