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
  chunkRange,
} from './lib/visit-csv.mjs';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const NAV_LABEL = process.env.ZN_NAV_LABEL || '来店記録';
const DL_LABEL = process.env.ZN_DOWNLOAD_LABEL || 'CSVダウンロード';
const MODE = (process.env.MODE || 'export').toLowerCase();
// Metaのオフラインイベントは成約から62日以内のみ受け付ける。取りこぼさないよう少し広めに取る
const DAYS = Number(process.env.DAYS || 70);
// CSVは1回のダウンロードで返せる件数に上限があり、超えると**古い行から落ちる**
// （2026-08-20の実測：年初からを指定しても347行・66日分しか返らなかった）。
// 1回の期間を短くして上限に当たらないようにする。来店は1日5件前後なので21日で約110行。
const CHUNK_DAYS = Number(process.env.CHUNK_DAYS || 21);
// 「指定した開始日より後ろからしか入っていない」ときに、上限切れか単に来店が無いだけかを分ける目安
const TRUNCATION_HINT = Number(process.env.TRUNCATION_HINT || 250);
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

/** 期間指定のドロップダウンを開く（日付ラベルのボタンがトグルになっている） */
async function openRangePanel() {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /\d{4}-\d{2}-\d{2}/.test(e.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(800);
}

/** 時間切れを必ず作る。download.path() はタイムアウトを持たないため、これで包む */
function withTimeout(promise, ms, what) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${what}が${ms / 1000}秒で終わらない`)), ms);
    }),
  ]);
}

/**
 * 期間の開始・終了を直接入力する。プリセットより狙った範囲を正確に取れるうえ、
 * CSVも小さくなるので、まずこちらを試す。
 */
async function applyExplicitRange(from, to) {
  const filled = await page.evaluate(({ from, to }) => {
    const f = document.querySelector('#vfFromInput');
    const t = document.querySelector('#vfToInput');
    if (!f || !t) return false;
    const set = (el, v) => {
      // 値を直接代入しても枠組みによっては拾われないので、ネイティブのsetterを使って
      // input/change を発火させる
      const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
      if (desc && desc.set) desc.set.call(el, v);
      else el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    set(f, from);
    set(t, to);
    return true;
  }, { from, to });
  if (!filled) return false;
  await page.waitForTimeout(2500);
  const applied = await readAppliedRange();
  // 入力しただけで反映されない作りかもしれないので、画面の表示で必ず確かめる
  return !!applied && applied.from === from && applied.to === to;
}

/** 画面の表にデータ行が何行あるか。CSVが出ないときの原因切り分けに使う（値は読まない） */
function visibleRowCount() {
  return page.evaluate(() => document.querySelectorAll('tbody tr').length);
}

/**
 * CSVダウンロードボタンを押して中身を返す。
 * 来店が1件も無い期間はCSVが出ないので、その場合だけ null を返す。
 * それ以外の理由で出てこないときは、原因が分かるように例外にする。
 */
async function downloadCsv() {
  let download;
  try {
    [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 45000 }),
      page.evaluate((lbl) => {
        const el = [...document.querySelectorAll('button, a')].find((e) =>
          (e.textContent || '').replace(/\s+/g, ' ').trim().includes(lbl)
        );
        if (!el) throw new Error('CSVダウンロードのボタンが見つからない');
        el.click();
      }, DL_LABEL),
    ]);
  } catch (e) {
    if (String(e).includes('Timeout') && (await visibleRowCount()) === 0) return null;
    throw e;
  }
  const filePath = await withTimeout(download.path(), 120000, 'CSVの保存');
  const buf = fs.readFileSync(filePath);
  const { text, encoding } = decodeCsv(buf);
  return { rows: parseCsv(text), encoding, bytes: buf.length, filename: download.suggestedFilename() };
}

/** CSVの「来店日」列から、実際に入っていた期間を求める */
function csvDateRange(rows) {
  const i = (rows[0] || []).findIndex((h) => String(h).trim() === '来店日');
  if (i < 0) return null;
  const dates = rows.slice(1).map((r) => String(r[i] ?? '').trim()).filter(Boolean).sort();
  return dates.length ? { from: dates[0], to: dates[dates.length - 1] } : null;
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

    const got = await downloadCsv();
    if (!got) throw new Error('CSVが出てこない（この期間に来店記録が1件も無い可能性）');
    const { rows, encoding, bytes, filename } = got;
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

  // --- export モード：直近 DAYS 日を分割して指定し、CSVを集める
  say(`- 対象期間: **${SINCE} 〜 ${TODAY}**（直近${DAYS}日）`);
  const applied = [];
  const all = [];
  let encodingSeen = '';

  // 期間の入力欄はドロップダウンの中にあるので、まず開く
  await openRangePanel();

  // 期間を分割して取る。
  // 2026-08-20の実測では、画面で 2026-01-01〜08-20 を指定してもCSVは347行・06-16以降しか
  // 返さなかった。CSVには件数の上限があり、**古い行から落ちる**。
  // 1回に取る期間を短くして上限に当たらないようにし、当たった場合は静かに欠けさせず失敗させる。
  for (const chunk of chunkRange(SINCE, TODAY, CHUNK_DAYS)) {
    if (!(await applyExplicitRange(chunk.from, chunk.to))) {
      throw new Error(
        `期間 ${chunk.from}〜${chunk.to} を画面に反映できない（#vfFromInput / #vfToInput の作りが変わった可能性）`
      );
    }
    const got = await downloadCsv();
    if (!got) {
      // 来店が1件も無い期間はCSVが出ない。空として扱い、期間は取得済みとする
      say(`- ${chunk.from}〜${chunk.to}：来店なし`);
      applied.push(chunk);
      continue;
    }
    const { rows, encoding } = got;
    encodingSeen = encoding;
    const { purchases, stats } = extractTicketPurchases(rows);
    const csvRange = csvDateRange(rows);

    // 上限に当たると古い行から落ちる。「指定した開始日より後ろからしか入っていない」かつ
    // 「行数が多い」ときは、取りこぼしを疑って止める（数字を作らない）
    if (csvRange && csvRange.from > chunk.from && stats.rows >= TRUNCATION_HINT) {
      throw new Error(
        `${chunk.from}〜${chunk.to} を要求したのにCSVは ${csvRange.from} 以降しか入っていない（${stats.rows}行）。` +
          `CSVの件数上限に当たっている。環境変数 CHUNK_DAYS を今の${CHUNK_DAYS}日より小さくする必要がある`
      );
    }

    all.push(...purchases);
    applied.push(chunk);
    say(
      `- ${chunk.from}〜${chunk.to}：来店 ${stats.rows}行（実データ ${csvRange ? `${csvRange.from}〜${csvRange.to}` : '空'}）` +
        ` → 回数券 ${stats.ticket_rows}行 → 有効 ${purchases.length}件`
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
        `取得できた期間: ${applied.map((r) => `${r.from}〜${r.to}`).join(', ') || 'なし'}）`
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
