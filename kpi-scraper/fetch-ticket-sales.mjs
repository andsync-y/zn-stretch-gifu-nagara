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
  firstOfLastMonth,
} from './lib/visit-csv.mjs';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const NAV_LABEL = process.env.ZN_NAV_LABEL || '来店記録';
const DL_LABEL = process.env.ZN_DOWNLOAD_LABEL || 'CSVダウンロード';
const MODE = (process.env.MODE || 'export').toLowerCase();
// Metaのオフラインイベントは成約から62日以内のみ受け付ける。取りこぼさないよう少し広めに取る
const DAYS = Number(process.env.DAYS || 70);
// 「画面の開始日よりCSVが後ろから始まる」ときに、件数上限か単に来店が無いだけかを分ける目安。
// 2026-08-20の実測では上限に当たったCSVが347行だった
const TRUNCATION_HINT = Number(process.env.TRUNCATION_HINT || 300);
const OUT_FILE = process.env.OUT_FILE || 'out/ticket-purchases.json';

const selectors = JSON.parse(fs.readFileSync(new URL('./selectors.json', import.meta.url), 'utf8'));
const out = [];
const say = (s) => { console.log(s); out.push(s); };

const NOW_MS = Date.now();
const jstDate = (ms) => new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
const TODAY = jstDate(NOW_MS);
const SINCE = jstDate(NOW_MS - DAYS * 86400000);
// 「先月」＋「今月」で必ず覆える範囲。毎月動かせば前回の範囲と必ず重なるので取りこぼさない
const GUARANTEED_FROM = firstOfLastMonth(TODAY);

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
 * 期間プリセット（今月・先月・今年 …）を押す。押せたらtrue。
 * プリセットは日付ラベルのボタンで開くドロップダウンの中にある。
 * このボタンは開閉のトグルなので、「押したら閉じた」場合に備えて2回まで試す。
 *
 * ⚠️ 期間の入力欄(#vfFromInput / #vfToInput)にスクリプトから値を入れる方式は使わない。
 *    2026-08-20に試したところ、画面の期間表示は変わるのに**CSVの中身は変わらず**、
 *    指定していない期間のデータが返ってきた。静かに間違った数字が出るので、
 *    実際に押せるボタンだけを使う。
 */
async function clickPreset(label) {
  const visible = () =>
    page.evaluate((lbl) => {
      const b = [...document.querySelectorAll('button, a')].find(
        (e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === lbl
      );
      return !!b && b.offsetParent !== null;
    }, label);

  for (let attempt = 0; attempt < 2; attempt++) {
    if (!(await visible())) await openRangePanel();
    if (!(await visible())) continue;
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

  // --- export モード：期間プリセットを押してCSVを集める
  //
  // 「先月」＋「今月」で、先月1日〜今日を必ず覆う。毎月動かす前提なので、
  // 前回の実行範囲と必ず重なり、取りこぼしは起きない。
  // 1回あたり150行前後なのでCSVの件数上限にも当たらない。
  // さらに「今年」も取れれば、その分だけ過去（62日窓の残り）も拾える。
  // ただし「今年」は件数上限で古い行が落ちるので、覆えたことの保証には使わない。
  say(`- 必ず覆う期間: **${GUARANTEED_FROM} 〜 ${TODAY}**（Metaへ送るのは直近${DAYS}日ぶん）`);
  const applied = [];
  const all = [];
  let encodingSeen = '';

  await openRangePanel();

  async function collect(preset, { required }) {
    if (!(await clickPreset(preset))) {
      if (required) throw new Error(`期間プリセット「${preset}」が見つからない（画面の作りが変わった可能性）`);
      say(`- プリセット「${preset}」が見つからないので飛ばす`);
      return;
    }
    const shown = await readAppliedRange();
    const got = await downloadCsv();
    if (!got) {
      // 来店が1件も無い期間はCSVが出ない
      say(`- 「${preset}」（${shown ? `${shown.from}〜${shown.to}` : '期間不明'}）：来店なし`);
      if (required && shown) applied.push(shown);
      return;
    }
    const { rows, encoding } = got;
    encodingSeen = encoding;
    const { purchases, stats } = extractTicketPurchases(rows);
    const csvRange = csvDateRange(rows);
    all.push(...purchases);

    // 件数上限に当たると古い行から落ちる。「画面の開始日よりCSVが後ろから始まる」かつ
    // 「行数が多い」ときは上限に当たったとみなす。
    // 単に月初に来店が無かっただけなら行数は少ないので、ここには引っかからない。
    const truncated = !!(shown && csvRange && csvRange.from > shown.from && stats.rows >= TRUNCATION_HINT);
    if (truncated && required) {
      // 必ず覆うべき期間が欠けている。静かに少ない数字を送らず止める
      throw new Error(
        `「${preset}」は ${shown.from} からのはずが、CSVは ${csvRange.from} 以降しか入っていない（${stats.rows}行）。` +
          `CSVの件数上限に当たっている`
      );
    }
    // 覆えた期間として数えるのは、画面で選んだ期間が信用できるときだけ。
    // 上限で古い行が落ちた「今年」は、実際に入っていた範囲だけを数える
    if (required && !truncated && shown) applied.push(shown);
    else if (csvRange) applied.push(csvRange);
    if (truncated) {
      say(`  - 「${preset}」は件数上限で ${csvRange.from} より前が落ちている（取れた分だけ使う）`);
    }
    say(
      `- 「${preset}」：画面 ${shown ? `${shown.from}〜${shown.to}` : '不明'} → ` +
        `CSVの実データ ${csvRange ? `${csvRange.from}〜${csvRange.to}` : '空'} / ` +
        `来店 ${stats.rows}行 → 回数券 ${stats.ticket_rows}行 → 有効 ${purchases.length}件`
    );
    if (stats.skip_no_customer_id || stats.skip_no_date || stats.skip_no_value) {
      say(`  - 除外: 顧客IDなし ${stats.skip_no_customer_id} / 日付不正 ${stats.skip_no_date} / 金額なし ${stats.skip_no_value}`);
    }
  }

  await collect('先月', { required: true });
  await collect('今月', { required: true });
  await collect('今年', { required: false }); // 取れれば過去ぶんの上積み

  // 期間が足りないまま少ない件数を送ると、Metaに「成約が減った」と誤って学習させてしまう。
  // 数字を作らず、はっきり失敗させる
  const gap = uncoveredRange(applied, GUARANTEED_FROM, TODAY);
  if (gap) {
    throw new Error(
      `期間 ${GUARANTEED_FROM}〜${TODAY} を覆えていない（不足: ${gap.from}〜${gap.to} / ` +
        `取得できた期間: ${applied.map((r) => `${r.from}〜${r.to}`).join(', ') || 'なし'}）`
    );
  }

  const purchases = dedupePurchases(all).filter((p) => p.date >= SINCE && p.date <= TODAY);
  const total = purchases.reduce((s, p) => s + p.value, 0);
  const customers = new Set(purchases.map((p) => p.customer_id)).size;
  const oldest = purchases.length ? purchases[0].date : '(なし)';

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
  say(`- 完全に取れている期間: **${GUARANTEED_FROM}〜${TODAY}**（それ以前は「今年」で取れた分だけ／最古の成約 ${oldest}）`);
  say(`- 出力: \`${OUT_FILE}\`（顧客名・電話番号は含まない）`);
} catch (e) {
  say('');
  say(`- **エラー**: \`${String(e).slice(0, 300)}\``);
  await browser.close();
  finish(1);
}

await browser.close();
finish(0);
