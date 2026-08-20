#!/usr/bin/env node
/**
 * 店舗システム(system.zn-stretch.com)の「顧客まわり」の画面構造だけを調べる一回限りの調査スクリプト。
 *
 * 目的: Meta CAPI（施策A）の電話番号と、離脱予兆リスト（施策J）の
 *       「回数券残・最終来店日」を自動取得できるかを判断するための材料集め。
 *       2026-08-20 オーナー判断で、顧客情報ページを開くことを承認済み。
 *
 * ⚠️ 設計上の約束（これを破らないこと）
 *   - セルの値・氏名・電話番号・生HTMLは **一切出力しない**。
 *     出力するのは「列の見出し」と「その列がどんな種類の値か（電話番号らしい／日付らしい 等）」だけ。
 *   - 値の種類判定はブラウザ内で行い、判定結果（ラベル）のみを持ち出す。
 *   - 何も書き込まない・何も変更しない。読むだけ。
 *   - サロンボード(salonboard.com)には一切アクセスしない。
 *
 * fetch.mjs とはあえて独立させている（週次の本番ジョブに一切影響を与えないため）。
 * ログイン処理だけ同じ考え方を複製している。
 *
 * 使い方: node discover-customers.mjs
 * 出力  : out/customer-discovery.json ＋ 標準出力のMarkdownサマリー
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { extractStructure } from './lib/page-structure.mjs';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const OUT = 'out';
const MAX_PAGES = 12;

const selectors = JSON.parse(fs.readFileSync(new URL('./selectors.json', import.meta.url), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

// 顧客まわりを示すナビの語。ここに当てはまるものだけ開く
const CUSTOMER_NAV = /顧客|会員|カルテ|来店|履歴|回数券|チケット|売上|明細/;

async function login(page) {
  const conf = selectors.login || {};
  await page.goto(conf.url || BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);
  const passInput = page.locator(conf.passField || 'input[type="password"]').first();
  if ((await passInput.count()) === 0) return { success: false, reason: 'password field not found' };
  if (!USER || !PASS) return { success: false, reason: 'credentials not set' };

  const form = passInput.locator('xpath=ancestor::form[1]');
  const scope = (await form.count()) > 0 ? form : page.locator('body');
  await scope.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').first().fill(USER);
  await passInput.fill(PASS);
  const submit = page.locator('button[type="submit"], input[type="submit"], button:has-text("ログイン")').first();
  if ((await submit.count()) > 0) await submit.click();
  else await passInput.press('Enter');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const ok = (await page.locator(conf.successCheck || 'button:has-text("ログアウト")').count()) > 0;
  return { success: ok, url: page.url() };
}

/**
 * ページの構造と「各列の値の種類」だけを取り出す。
 * 実処理は lib/page-structure.mjs（テスト可能なように切り出してある）。
 */
async function inspect(page) {
  return await page.evaluate(extractStructure);
}

// ---------------------------------------------------------------- main

const report = { checked_at: new Date().toISOString(), note: 'ページ構造と列の種類のみ。セル値・氏名・電話番号は含まない。', pages: [] };
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ja-JP' });
const page = await context.newPage();

try {
  const auth = await login(page);
  report.login = auth;
  console.log('login:', JSON.stringify(auth));
  if (!auth.success) throw new Error(`ログインに失敗: ${auth.reason || 'unknown'}`);

  // まずトップの構造とナビ一覧
  const top = await inspect(page);
  report.pages.push({ via: 'top', ...top });
  const navLabels = [...new Set(top.navItems)].filter((t) => CUSTOMER_NAV.test(t));
  report.customer_nav_candidates = navLabels;
  console.log('顧客まわりのナビ候補:', navLabels.join(' / ') || '(なし)');

  for (const label of navLabels.slice(0, MAX_PAGES)) {
    const clicked = await page.evaluate((lbl) => {
      const el = [...document.querySelectorAll('a.nav-item, nav a, aside a')].find(
        (e) => (e.textContent || '').replace(/\s+/g, ' ').trim() === lbl
      );
      if (!el) return false;
      el.click();
      return true;
    }, label);
    if (!clicked) continue;
    await page.waitForTimeout(3000);
    const info = await inspect(page);
    report.pages.push({ via: `nav:${label}`, ...info });
    console.log(`  [${label}] 表${info.tables.length}件 / エクスポート系ボタン: ${info.exportish.join(',') || 'なし'}`);

    // 一覧なら1行目を開いて詳細画面の項目も見る（電話番号がどこにあるか確認するため）
    const opened = await page
      .evaluate(() => {
        const row = document.querySelector('tbody tr');
        if (!row) return false;
        const link = row.querySelector('a, button');
        (link || row).click();
        return true;
      })
      .catch(() => false);
    if (opened) {
      await page.waitForTimeout(2500);
      const detail = await inspect(page);
      report.pages.push({ via: `nav:${label} → 1件目の詳細`, ...detail });
      console.log(`    詳細画面: 項目${detail.fields.length}件`);
      await page.goBack().catch(() => {});
      await page.waitForTimeout(1500);
    }
  }
} catch (e) {
  report.error = String(e).slice(0, 400);
  console.error('ERROR:', report.error);
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(OUT, 'customer-discovery.json'), JSON.stringify(report, null, 2));

// ---- Markdownサマリー（Actionsの実行サマリーに出す）
const md = [];
md.push('# 店舗システム 顧客まわり 構造調査');
md.push('');
md.push(`- 実行: ${report.checked_at}`);
md.push(`- ログイン: ${report.login?.success ? '成功' : '失敗'}`);
if (report.error) md.push(`- エラー: \`${report.error}\``);
md.push(`- 顧客まわりのナビ候補: ${(report.customer_nav_candidates || []).join(' / ') || '(なし)'}`);
md.push('');
md.push('> このレポートには氏名・電話番号・セルの値を一切含みません。列の見出しと「値の種類」だけです。');
md.push('');
for (const p of report.pages) {
  md.push(`## ${p.via} — ${p.title || '(無題)'}`);
  if (p.exportish?.length) md.push(`- **エクスポート系ボタン: ${p.exportish.join(' / ')}**`);
  if (p.hasPagination) md.push('- ページ送りあり');
  for (const [i, t] of (p.tables || []).entries()) {
    if (!t.columns?.length) continue;
    md.push('');
    md.push(`### 表${i + 1}（${t.rowCount}行）`);
    md.push('');
    md.push('| # | 見出し | 値の種類 |');
    md.push('|---|---|---|');
    for (const c of t.columns) md.push(`| ${c.index} | ${c.header} | ${c.kind} |`);
  }
  if (p.fields?.length) {
    md.push('');
    md.push('### 詳細項目（ラベル → 値の種類）');
    md.push('');
    md.push('| ラベル | 値の種類 |');
    md.push('|---|---|');
    for (const f of p.fields) md.push(`| ${f.label} | ${f.kind} |`);
  }
  md.push('');
}
const out = md.join('\n');
console.log('\n' + out);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + '\n');
