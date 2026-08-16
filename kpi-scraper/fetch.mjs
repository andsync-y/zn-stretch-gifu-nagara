// 店舗システム(system.zn-stretch.com)から週次KPIを取得するスクリプト。
//
// 2つのモードがある：
//   discovery: ログイン後のページ「構造」（URL・リンク・テーブル見出し・フォーム項目）だけを
//              out/discovery.json に書き出す。顧客名などのセル値・生HTMLは一切保存しない。
//   parse:     selectors.json の定義に従って前週のKPIを抽出し out/weekly_kpi.json に書き出す。
//
// モードは KPI_MODE 環境変数で指定。未指定なら selectors.json の configured で自動判定。
// 認証情報は環境変数 ZN_SYSTEM_USER / ZN_SYSTEM_PASS（GitHub Secrets）から受け取る。

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.ZN_BASE_URL || 'https://system.zn-stretch.com/';
const USER = process.env.ZN_SYSTEM_USER || '';
const PASS = process.env.ZN_SYSTEM_PASS || '';
const OUT = 'out';

const selectors = JSON.parse(fs.readFileSync(new URL('./selectors.json', import.meta.url), 'utf8'));
const MODE = process.env.KPI_MODE || (selectors.configured ? 'parse' : 'discovery');

fs.mkdirSync(OUT, { recursive: true });

// JSTでの「前週月曜ぜ日曜」を計算する
function lastWeekRangeJST() {
  const nowJst = new Date(Date.now() + 9 * 3600 * 1000);
  const dow = nowJst.getUTCDay(); // 0=日
  const daysSinceMonday = (dow + 6) % 7;
  const thisMonday = new Date(nowJst);
  thisMonday.setUTCDate(nowJst.getUTCDate() - daysSinceMonday);
  const lastMonday = new Date(thisMonday);
  lastMonday.setUTCDate(thisMonday.getUTCDate() - 7);
  const lastSunday = new Date(thisMonday);
  lastSunday.setUTCDate(thisMonday.getUTCDate() - 1);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(lastMonday), end: fmt(lastSunday) };
}

function writeJson(name, obj) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2));
  console.log(`wrote ${name}`);
}

// 汎用ログイン：selectors.jsonに定義があればそれを使い、無ければ
// 「最初のpassword入力と同じフォームのテキスト入力」に入れて送信する。
async function login(page) {
  const conf = selectors.login || {};
  await page.goto(conf.url || BASE, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);

  const passSel = conf.passField || 'input[type="password"]';
  const passInput = page.locator(passSel).first();
  if ((await passInput.count()) === 0) {
    return { attempted: false, success: false, reason: 'password field not found (already logged in? or SPA needs wait)' };
  }
  if (!USER || !PASS) {
    return { attempted: false, success: false, reason: 'credentials not set (ZN_SYSTEM_USER / ZN_SYSTEM_PASS)' };
  }

  let userInput;
  if (conf.userField) {
    userInput = page.locator(conf.userField).first();
  } else {
    const form = passInput.locator('xpath=ancestor::form[1]');
    const scope = (await form.count()) > 0 ? form : page.locator('body');
    userInput = scope.locator('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').first();
  }
  await userInput.fill(USER);
  await passInput.fill(PASS);

  const submitSel = conf.submitButton || 'button[type="submit"], input[type="submit"], button:has-text("ログイン")';
  const submit = page.locator(submitSel).first();
  if ((await submit.count()) > 0) {
    await Promise.all([
      page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {}),
      submit.click(),
    ]);
  } else {
    await passInput.press('Enter');
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
  }
  await page.waitForTimeout(3000);

  if (conf.successCheck) {
    const ok = (await page.locator(conf.successCheck).count()) > 0;
    return { attempted: true, success: ok, url: page.url() };
  }
  const stillHasPassword = (await page.locator('input[type="password"]').count()) > 0;
  return { attempted: true, success: !stillHasPassword, url: page.url() };
}

// ページの「構造」だけを抽出する（セル値・個人情報は取らない）
async function pageStructure(page) {
  return await page.evaluate(() => {
    const clip = (s, n = 60) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
    const links = [...document.querySelectorAll('a[href]')]
      .map((a) => ({ text: clip(a.textContent), href: a.getAttribute('href') }))
      .filter((l) => l.text || l.href)
      .slice(0, 150);
    const tables = [...document.querySelectorAll('table')].slice(0, 20).map((t) => ({
      headers: [...t.querySelectorAll('th')].map((th) => clip(th.textContent)).slice(0, 30),
      rowCount: t.querySelectorAll('tr').length,
    }));
    const forms = [...document.querySelectorAll('form')].slice(0, 10).map((f) => ({
      action: f.getAttribute('action'),
      method: f.getAttribute('method'),
      fields: [...f.querySelectorAll('input, select')].map((i) => ({
        tag: i.tagName.toLowerCase(),
        type: i.getAttribute('type'),
        name: i.getAttribute('name'),
        id: i.getAttribute('id'),
        placeholder: clip(i.getAttribute('placeholder') || ''),
      })).slice(0, 30),
    }));
    const buttons = [...document.querySelectorAll('button, input[type="submit"]')]
      .map((b) => clip(b.textContent || b.value)).filter(Boolean).slice(0, 40);
    const headings = [...document.querySelectorAll('h1,h2,h3')].map((h) => clip(h.textContent)).slice(0, 30);
    return { title: document.title, headings, links, tables, forms, buttons };
  });
}

async function discovery(page, loginResult) {
  const report = {
    fetched_at: new Date().toISOString(),
    mode: 'discovery',
    login: loginResult,
    note: 'ページ構造のみ。セル値・顧客情報・生HTMLは含まない。',
    pages: [],
  };

  report.pages.push({ url: page.url(), ...(await pageStructure(page)) });

  if (loginResult.success) {
    // KPIに関係しそうなリンクを最大8ページまで辿って構造を記録する
    const KEYWORDS = /売上|来店|予約|集計|レポート|実績|分析|ダッシュボード|CSV|回数券|顧客|エクスポート|ダウンロード/;
    const base = new URL(page.url());
    const seen = new Set([page.url()]);
    const candidates = (report.pages[0].links || [])
      .filter((l) => l.href && KEYWORDS.test(l.text))
      .slice(0, 8);
    for (const l of candidates) {
      try {
        const target = new URL(l.href, base).toString();
        if (seen.has(target) || new URL(target).origin !== base.origin) continue;
        seen.add(target);
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
        report.pages.push({ fromLink: l.text, url: page.url(), ...(await pageStructure(page)) });
      } catch (e) {
        report.pages.push({ fromLink: l.text, error: String(e).slice(0, 200) });
      }
    }
  }
  writeJson('discovery.json', report);
}

async function parse(page, loginResult) {
  const week = lastWeekRangeJST();
  const result = {
    fetched_at: new Date().toISOString(),
    mode: 'parse',
    source: 'system.zn-stretch.com',
    week_start: week.start,
    week_end: week.end,
    login: loginResult,
    status: 'ok',
    metrics: {},
    missing: [],
  };

  if (!loginResult.success) {
    result.status = 'login_failed';
    writeJson('weekly_kpi.json', result);
    return;
  }

  const base = new URL(page.url());
  const pagesByName = {};
  for (const p of selectors.pages || []) {
    pagesByName[p.name] = p;
  }

  let currentPage = null;
  for (const m of selectors.metrics || []) {
    try {
      const pconf = pagesByName[m.page];
      if (!pconf) throw new Error(`page config not found: ${m.page}`);
      const url = new URL(
        pconf.url.replaceAll('{week_start}', week.start).replaceAll('{week_end}', week.end),
        base
      ).toString();
      if (currentPage !== url) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(pconf.waitMs || 2500);
        currentPage = url;
      }
      let value = null;
      if (m.method === 'css') {
        const text = await page.locator(m.selector).first().textContent({ timeout: 10000 });
        value = text;
      } else if (m.method === 'regex') {
        const body = await page.evaluate(() => document.body.innerText);
        const match = body.match(new RegExp(m.pattern));
        value = match ? match[1] : null;
      }
      if (value == null) throw new Error('no match');
      const num = Number(String(value).replace(/[,¥円\s]/g, ''));
      result.metrics[m.key] = Number.isFinite(num) ? num : String(value).trim();
    } catch (e) {
      result.missing.push({ key: m.key, error: String(e).slice(0, 200) });
    }
  }
  if (result.missing.length > 0) result.status = 'partial';
  writeJson('weekly_kpi.json', result);
}

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ja-JP' });
const page = await context.newPage();

let loginResult;
try {
  loginResult = await login(page);
  console.log('login:', JSON.stringify(loginResult));
  if (MODE === 'discovery') {
    await discovery(page, loginResult);
  } else {
    await parse(page, loginResult);
  }
  writeJson('_meta.json', { mode: MODE, fetched_at: new Date().toISOString(), login: loginResult });
} catch (e) {
  console.error(e);
  writeJson('_meta.json', {
    mode: MODE,
    fetched_at: new Date().toISOString(),
    error: String(e).slice(0, 500),
    login: loginResult || null,
  });
  process.exitCode = 0; // データが取れなくてもブランチにはエラー状態を書き出す
} finally {
  await browser.close();
}
