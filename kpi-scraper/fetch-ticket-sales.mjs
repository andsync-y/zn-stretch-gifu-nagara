#!/usr/bin/env node
/**
 * 店舗システムの「来店記録」からCSVをダウンロードし、回数券の成約を取り出す。
 *
 * 2026-08-20に実物のCSVで確認した構造（19列・UTF-8）:
 *   来店日 / 顧客名 / 顧客ID / 性別 / 年代 / 担当 / 来店種別 / 来店経路 / 指名 / コース /
 *   延長 / 次回予約 / 回数券購入 / 指名チケット / 備考 / 施術売上 / 回数券売上 / 指名売上 / 合計売上
 * 「指名チケット」が別列なので、`回数券購入` が空でない行だけを拾えば
 * 指名回数券（指名料のチケット）は構造的に混入しない。
 *
 * ⚠️ 個人情報の扱い
 *   - CSVには顧客名が入る。ダウンロード先はActionsの実行環境（毎回破棄される）のみで、
 *     リポジトリにもDriveにも保存しない。
 *   - 標準出力・実行サマリー・出力JSONに**顧客名と電話番号を一切出さない**。
 *     出力に含まれるのは 顧客ID / 来店日 / 商品名 / 金額 だけ。
 *   - サロンボード(salonboard.com)には一切アクセスしない（規約で禁止されているため）。
 *
 * モード（環境変数 MODE）:
 *   export（既定）… 直近 DAYS 日の回数券成約を OUT_FILE へJSONで書く。CAPI送信ジョブが読む。
 *   inspect        … CSVの「形」（列名・文字コード・値の分布）だけを報告する。構造が変わった時の調査用。
 *
 * 使い方: node fetch-ticket-sales.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { extractControls } from './lib/page-structure.mjs';
import {
  decodeCsv,
  parseCsv,
  extractTicketPurchases,
  dedupePurchases,
  locateColumns,
  uncoveredRange,
} from './lib/visit-csv.mjs';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const NAV_LABEL = process.env.ZN_NAV_LABEL || '来店記録';
const DL_LABEL = process.env.ZN_DOWNLOAD_LABEL || 'CSVダウンロード';
const MODE = (process.env.MODE || 'export').toLowerCase();
// Metaのオフラインイベントは成約から62日以内のみ受け付ける。取りこぼさないよう少し広めに取る
const DAYS = Number(process.env.DAYS || 70);
const OUT_FILE = process.env.OUT_FILE || 'out/ticket-purchases.json';

const selectors = JSON.parse(fs.readFileSync(new URL('./selectors.json', import.meta.url), 'utf8'));
const out = [];
const say = (s) => { console.log(s); out.push(s); };

const NOW_MS = Date.now();
const jstDate = (ms) => new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
const TODAY = jstDate(NOW_MS);
const SINCE = jstDate(NOW_MS - DAYS * 86400000);

function finish(code) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['# 来店記録CSV', '', ...out].join('\n') + '\n');
  }
  process.exit(code);
}

async function login(page) {
  const conf = selectors.login || {};
  await page.goto(conf.url || BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);
  const passInput = page.locator(conf.passField || 'input[type="password"]').first();
  if ((await passInput.count()) === 0) throw new Error('パスワード欄が見つからない');
  if (!USER || !PASS) throw new Error('ZN_SYSTEM_USER / ZN_SYSTEM_PASS が未設定');
  const form = passInput.locator('xpath=ancestor::form[1]');
  const scope = (await form.count()) > 0 ? form : page.locator('body');
  await scope.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').first().fill(USER);
  await passInput.fill(PASS);
  const submit = page.locator('button[type="submit"], input[type="submit"], button:has-text("ログイン")').first();
  if ((await submit.count()) > 0) await submit.click();
  else await passInput.press('Enter');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  if ((await page.locator(conf.successCheck || 'button:has-text("ログアウト")').count()) === 0) {
    throw new Error('ログインに失敗（ログアウトボタンが見つからない）');
  }
}

/** 画面に表示されている「適用中の期間」を読む。ボタンのラベルが `📅 YYYY-MM-DD 〜 YYYY-MM-DD` になっている */
function readAppliedRange() {
  return page.evaluate(() => {
    for (const b of document.querySelectorAll('button, a')) {
      const m = (b.textContent || '').match(/(\d{4}-\d{2}-\d{2})\s*[〜~-]\s*(\d{4}-\d{2}-\d{2})/);
      if (m) return { from: m[1], to: m[2] };
    }
    return null;
  });
}

/** ラベル完全一致のボタン/リンクが「押せる状態か」を見る。押しはしない */
function presetVisible(label) {
  return page.evaluate((lbl) => {
    const b = [...document.querySelectorAll('button, a')].find(
      (e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === lbl
    );
    return !!b && b.offsetParent !== null;
  }, label);
}

/**
 * 期間プリセット（今月・今年・前年 …）を押す。押せたらtrue。
 * プリセットは日付ラベルのボタンで開くドロップダウンの中にある。
 * このボタンは開閉のトグルなので、「押したら閉じた」場合に備えて2回まで試す。
 */
async function clickPreset(label) {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (!(await presetVisible(label))) {
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((e) => /\d{4}-\d{2}-\d{2}/.test(e.textContent || ''));
        if (b) b.click();
      });
      await page.waitForTimeout(800);
    }
    if (!(await presetVisible(label))) continue;
    await page.evaluate((lbl) => {
      const b = [...document.querySelectorAll('button, a')].find(
        (e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === lbl
      );
      b.click();
    }, label);
    await page.waitForTimeout(2500);
    return true;
  }
  return false;
}

/** CSVダウンロードボタンを押して中身を返す */
async function downloadCsv() {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.evaluate((lbl) => {
      const el = [...document.querySelectorAll('button, a')].find((e) =>
        (e.textContent || '').replace(/\s+/g, ' ').trim().includes(lbl)
      );
      if (!el) throw new Error('CSVダウンロードのボタンが見つからない');
      el.click();
    }, DL_LABEL),
  ]);
  const buf = fs.readFileSync(await download.path());
  const { text, encoding } = decodeCsv(buf);
  return { rows: parseCsv(text), encoding, bytes: buf.length, filename: download.suggestedFilename() };
}

// ---------------------------------------------------------------- main

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ja-JP', acceptDownloads: true });
const page = await context.newPage();

try {
  await login(page);
  say(`- ログイン: 成功 / モード: **${MODE}**`);

  const clicked = await page.evaluate((lbl) => {
    const el = [...document.querySelectorAll('a.nav-item, nav a, aside a, a, button')].find(
      (e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === lbl
    );
    if (!el) return false;
    el.click();
    return true;
  }, NAV_LABEL);
  if (!clicked) throw new Error(`ナビ「${NAV_LABEL}」が見つからない`);
  await page.waitForTimeout(3500);
  say(`- 「${NAV_LABEL}」を開いた`);

  if (MODE === 'inspect') {
    // 画面が変わった時に構造を確認するためのモード。値は出さず、列名と値の“種類”だけ報告する
    const controls = await page.evaluate(extractControls);
    say('');
    say('### 画面の操作部品（入力値は含まない）');
    say('');
    say('| 種別 | type | name | id | placeholder | 選択肢数 |');
    say('|---|---|---|---|---|---|');
    for (const i of controls.inputs) {
      say(`| ${i.tag} | ${i.type ?? ''} | ${i.name ?? ''} | ${i.id ?? ''} | ${i.placeholder} | ${i.optionCount ?? ''} |`);
    }
    say('');
    say(`ボタン: ${controls.buttons.map((b) => b.text).filter(Boolean).join(' / ')}`);

    const { rows, encoding, bytes, filename } = await downloadCsv();
    const header = rows[0] || [];
    say('');
    say('### CSV');
    say('');
    say(`- ファイル名: \`${filename}\` / ${bytes.toLocaleString()} バイト / 文字コード: **${encoding}**`);
    say(`- 行数: ヘッダ1 + データ ${rows.length - 1}`);
    say('');
    say('| # | 列名 |');
    say('|---|---|');
    header.forEach((h, i) => say(`| ${i} | ${h} |`));

    const col = locateColumns(header); // 必要な列が無ければここで落ちる
    const body = rows.slice(1);
    const dist = (i) => {
      const v = {};
      for (const r of body) { const k = String(r[i] ?? '').trim() || '(空)'; v[k] = (v[k] || 0) + 1; }
      return Object.entries(v).map(([k, n]) => `${k}=${n}`).join(' / ');
    };
    const dates = body.map((r) => String(r[col.date] ?? '').trim()).filter(Boolean).sort();
    say('');
    say('### 中身の要約（顧客名・顧客IDの値は出しません）');
    say('');
    say(`- 来店日の範囲: **${dates[0]} 〜 ${dates[dates.length - 1]}**（${new Set(dates).size}日分）`);
    say(`- 「回数券購入」の値: ${dist(col.ticket)}`);
    const { purchases, stats } = extractTicketPurchases(rows);
    say(`- 抽出できた回数券成約: **${purchases.length}件 / ${purchases.reduce((s, p) => s + p.value, 0).toLocaleString()}円**`);
    say(`- 除外: 顧客IDなし ${stats.skip_no_customer_id} / 日付不正 ${stats.skip_no_date} / 金額なし ${stats.skip_no_value}`);
    await browser.close();
    finish(0);
  }

  // --- export モード：直近 DAYS 日をカバーする期間プリセットを当てて、CSVを集める
  say(`- 対象期間: **${SINCE} 〜 ${TODAY}**（直近${DAYS}日）`);
  const applied = [];
  const all = [];
  let encodingSeen = '';

  for (const preset of ['今年', '前年']) {
    if (!uncoveredRange(applied, SINCE, TODAY)) break; // すでに足りている
    if (!(await clickPreset(preset))) {
      say(`- 期間プリセット「${preset}」が見つからないので飛ばす`);
      continue;
    }
    const range = await readAppliedRange();
    if (!range) throw new Error(`期間プリセット「${preset}」を押したが、適用中の期間を画面から読み取れない`);
    const { rows, encoding } = await downloadCsv();
    encodingSeen = encoding;
    const { purchases, stats } = extractTicketPurchases(rows);
    all.push(...purchases);

    // 画面のラベルが「今年」でも、CSVが期間の全部を返しているとは限らない
    // （件数の上限や画面のページングで切られる可能性がある）。
    // そこで、覆えたかの判定には**画面のラベルではなくCSVの中身の日付範囲**を使う。
    const iDate = (rows[0] || []).findIndex((h) => String(h).trim() === '来店日');
    const dates = rows.slice(1).map((r) => String(r[iDate] ?? '').trim()).filter(Boolean).sort();
    const csvRange = dates.length ? { from: dates[0], to: dates[dates.length - 1] } : null;
    if (csvRange) applied.push(csvRange);
    say(
      `- 「${preset}」画面の期間 ${range.from}〜${range.to} → CSVの実データ ${csvRange ? `${csvRange.from}〜${csvRange.to}` : '(空)'} / ` +
        `来店 ${stats.rows}行 → 回数券 ${stats.ticket_rows}行 → 有効 ${purchases.length}件`
    );
    if (stats.skip_no_customer_id || stats.skip_no_date || stats.skip_no_value) {
      say(`  - 除外: 顧客IDなし ${stats.skip_no_customer_id} / 日付不正 ${stats.skip_no_date} / 金額なし ${stats.skip_no_value}`);
    }
  }

  // 期間が足りないまま少ない件数を送ると、Metaに「成約が減った」と誤って学習させてしまう。
  // 数字を作らず、はっきり失敗させる
  const gap = uncoveredRange(applied, SINCE, TODAY);
  if (gap) {
    throw new Error(
      `期間 ${SINCE}〜${TODAY} を覆えていない（不足: ${gap.from}〜${gap.to} / ` +
        `CSVに入っていた期間: ${applied.map((r) => `${r.from}〜${r.to}`).join(', ') || 'なし'}）。` +
        `CSVの件数上限や画面のページングで切られている可能性がある`
    );
  }

  const purchases = dedupePurchases(all).filter((p) => p.date >= SINCE && p.date <= TODAY);
  const total = purchases.reduce((s, p) => s + p.value, 0);
  const customers = new Set(purchases.map((p) => p.customer_id)).size;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        // 顧客名は含めない（この上の extractTicketPurchases が返さない）
        note: '回数券の成約のみ。顧客名・電話番号は含まない。指名チケットは別列なので含まれない。',
        generated_at: new Date(NOW_MS).toISOString(),
        period: { from: SINCE, to: TODAY },
        source_encoding: encodingSeen,
        count: purchases.length,
        purchases,
      },
      null,
      2
    ) + '\n'
  );

  say('');
  say(`### 抽出結果`);
  say('');
  say(`- 回数券の成約: **${purchases.length}件 / ${customers}人 / ${total.toLocaleString()}円**`);
  say(`- 出力: \`${OUT_FILE}\`（顧客名・電話番号は含まない）`);
} catch (e) {
  say('');
  say(`- **エラー**: \`${String(e).slice(0, 300)}\``);
  await browser.close();
  finish(1);
}

await browser.close();
finish(0);
