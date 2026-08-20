#!/usr/bin/env node
/**
 * 店舗システムの「来店記録」からCSVをダウンロードし、回数券の成約を取り出す。
 *
 * 2026-08-20の構造調査で、来店記録に次が揃っていることを確認した：
 *   来店日 / お客様名 / 顧客ID(8桁) / 回数券購入 / 指名チケット / 回数券売上 / 合計売上
 * 指名チケットが別列なので、サロンボードCSVで問題になった「指名回数券の混入」は起きない。
 *
 * ⚠️ 個人情報の扱い
 *   - CSVには氏名が入る。ダウンロード先はActionsの実行環境（毎回破棄される）のみ。
 *     リポジトリにもDriveにも保存しない。
 *   - 標準出力・実行サマリーには**氏名・顧客ID・電話番号を一切出さない**。
 *     出すのは件数・日付範囲・列名などの構造情報だけ。
 *   - サロンボード(salonboard.com)には一切アクセスしない。
 *
 * モード:
 *   inspect（既定）… CSVを落として「形」だけ報告する。パイプラインを組む前の確認用。
 *   （後続で summary モードを足し、顧客ID単位の成約リストを出す予定）
 *
 * 使い方: node fetch-ticket-sales.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import { extractControls } from './lib/page-structure.mjs';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const NAV_LABEL = process.env.ZN_NAV_LABEL || '来店記録';
const DL_LABEL = process.env.ZN_DOWNLOAD_LABEL || 'CSVダウンロード';

const selectors = JSON.parse(fs.readFileSync(new URL('./selectors.json', import.meta.url), 'utf8'));
const out = [];
const say = (s) => { console.log(s); out.push(s); };

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

/** cp932(Shift_JIS)とUTF-8を自動判定してテキスト化する */
function decodeCsv(buf) {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  // UTF-8として不正なバイトがあれば置換文字が入る。多ければ cp932 とみなす
  const bad = (utf8.match(/�/g) || []).length;
  if (bad === 0) return { text: utf8.replace(/^﻿/, ''), encoding: 'utf-8' };
  try {
    return { text: new TextDecoder('shift_jis').decode(buf), encoding: 'shift_jis(cp932)' };
  } catch {
    return { text: utf8, encoding: `utf-8（置換${bad}文字・要確認）` };
  }
}

/** ざっくりCSVパース（引用符つきフィールドに対応） */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ''));
}

// ---------------------------------------------------------------- main

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ja-JP', acceptDownloads: true });
const page = await context.newPage();

try {
  await login(page);
  say('- ログイン: 成功');

  const clicked = await page.evaluate((lbl) => {
    const el = [...document.querySelectorAll('a.nav-item, nav a, aside a, a, button')]
      .find((e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === lbl);
    if (!el) return false;
    el.click();
    return true;
  }, NAV_LABEL);
  if (!clicked) throw new Error(`ナビ「${NAV_LABEL}」が見つからない`);
  await page.waitForTimeout(3500);
  say(`- 「${NAV_LABEL}」を開いた`);

  // 日付フィルタのセレクタを特定するため、操作部品の一覧を記録する（値は出さない）
  const controls = await page.evaluate(extractControls);
  say('');
  say('### 画面の操作部品（日付フィルタの特定用・入力値は含まない）');
  say('');
  say('| 種別 | type | name | id | placeholder | 選択肢数 |');
  say('|---|---|---|---|---|---|');
  for (const i of controls.inputs) {
    say(`| ${i.tag} | ${i.type ?? ''} | ${i.name ?? ''} | ${i.id ?? ''} | ${i.placeholder} | ${i.optionCount ?? ''} |`);
  }
  say('');
  say(`ボタン: ${controls.buttons.map((b) => b.text).filter(Boolean).join(' / ')}`);

  // CSVダウンロード
  say('');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.evaluate((lbl) => {
      const el = [...document.querySelectorAll('button, a')]
        .find((e) => (e.textContent || '').replace(/\s+/g, ' ').trim().includes(lbl));
      if (!el) throw new Error('download button not found');
      el.click();
    }, DL_LABEL),
  ]);
  const filePath = await download.path();
  const buf = fs.readFileSync(filePath);
  const { text, encoding } = decodeCsv(buf);
  const rows = parseCsv(text);
  const header = rows[0] || [];
  const body = rows.slice(1);

  say(`### CSV`);
  say('');
  say(`- ファイル名: \`${download.suggestedFilename()}\``);
  say(`- サイズ: ${buf.length.toLocaleString()} バイト / 文字コード: **${encoding}**`);
  say(`- 行数: ヘッダ1 + データ ${body.length}`);
  say('');
  say('列名:');
  say('');
  say('| # | 列名 |');
  say('|---|---|');
  header.forEach((h, i) => say(`| ${i} | ${h} |`));

  // 日付列と回数券列の当たりをつける（値は出さず、集計だけ）
  const idx = (re) => header.findIndex((h) => re.test(h));
  const iDate = idx(/来店日|日付/);
  const iTicket = idx(/回数券購入/);
  const iTicketSales = idx(/回数券売上/);
  const iShimei = idx(/指名チケット/);
  const iCid = idx(/顧客ID/);

  say('');
  say('### 中身の要約（氏名・顧客IDの値は出しません）');
  say('');
  say(`- 来店日の列: ${iDate >= 0 ? `#${iDate}「${header[iDate]}」` : '**見つからない**'}`);
  say(`- 顧客IDの列: ${iCid >= 0 ? `#${iCid}「${header[iCid]}」` : '**見つからない**'}`);
  say(`- 回数券購入の列: ${iTicket >= 0 ? `#${iTicket}「${header[iTicket]}」` : '**見つからない**'}`);
  say(`- 回数券売上の列: ${iTicketSales >= 0 ? `#${iTicketSales}「${header[iTicketSales]}」` : '**見つからない**'}`);
  say(`- 指名チケットの列: ${iShimei >= 0 ? `#${iShimei}「${header[iShimei]}」` : '**見つからない**'}`);

  if (iDate >= 0) {
    const dates = body.map((r) => (r[iDate] || '').trim()).filter(Boolean).sort();
    say(`- 来店日の範囲: **${dates[0]} 〜 ${dates[dates.length - 1]}**（${new Set(dates).size}日分）`);
  }
  if (iTicket >= 0) {
    const vals = {};
    for (const r of body) { const v = (r[iTicket] || '').trim() || '(空)'; vals[v] = (vals[v] || 0) + 1; }
    say(`- 「${header[iTicket]}」に入る値と件数: ${Object.entries(vals).map(([k, n]) => `${k}=${n}`).join(' / ')}`);
  }
  if (iTicketSales >= 0) {
    const nums = body.map((r) => Number((r[iTicketSales] || '').replace(/[^\d-]/g, ''))).filter((n) => Number.isFinite(n) && n > 0);
    const sum = nums.reduce((a, b) => a + b, 0);
    say(`- 「${header[iTicketSales]}」が0より大きい行: **${nums.length}件 / 合計 ${sum.toLocaleString()}円**`);
  }
  if (iShimei >= 0) {
    const vals = {};
    for (const r of body) { const v = (r[iShimei] || '').trim() || '(空)'; vals[v] = (vals[v] || 0) + 1; }
    say(`- 「${header[iShimei]}」に入る値と件数: ${Object.entries(vals).map(([k, n]) => `${k}=${n}`).join(' / ')}`);
  }
} catch (e) {
  say(`- **エラー**: \`${String(e).slice(0, 300)}\``);
  process.exitCode = 1;
} finally {
  await browser.close();
}

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['# 来店記録CSVの取得確認', '', ...out].join('\n') + '\n');
}
