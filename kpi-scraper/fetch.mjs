// 店舗システム(system.zn-stretch.com)から週次KPIを取得するスクリプト。
//
// 2つのモードがある：
//   discovery: ログイン後のページ「構造」（URL・リンク・テーブル見出し・フォーム項目）だけを
//              out/discovery.json に書き出す。顧客名などのセル値・生HTMLは一切保存しない
//              （例外として、テーブル1列目の「日付として解釈できる値」のみ形式確認用に記録する）。
//   parse:     selectors.json の定義に従って前週のKPIを抽出し out/weekly_kpi.json に書き出す。
//
// モードは KPI_MODE 環境変数で指定。未指定なら selectors.json の configured で自動判定。
// 認証情報は環境変数 ZN_SYSTEM_USER / ZN_SYSTEM_PASS（GitHub Secrets）から受け取る。
//
// 対象システムはSPA（リンク遷移なし・ボタンで表示切替）のため、ページ定義に
// clicks（表示切替ボタンのセレクタ列）を指定できる。KPIは日別テーブルの行を
// 前週（月〜日）の日付で絞って集計する。セル値はメモリ内でのみ扱い、
// 出力ファイルには集計後のKPI数値だけを書く。

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

// JSTでの「前週月曜〜日曜」を計算する。
// KPI_WEEK_START / KPI_WEEK_END（YYYY-MM-DD）で任意の期間に上書きできる（過去週の取り直し・検証用）
function lastWeekRangeJST() {
  const ws = process.env.KPI_WEEK_START || '';
  const we = process.env.KPI_WEEK_END || '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(ws) && /^\d{4}-\d{2}-\d{2}$/.test(we)) {
    return { start: ws, end: we };
  }
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

// JSTでの今日の年月（YYYY-MM）。前週が月をまたぐかの判定に使う
function todayJstMonth() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 7);
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
  // 補助判定：ログアウトボタンがあれば成功とみなす（モーダル内のpassword欄による誤検知対策）
  if ((await page.locator('button:has-text("ログアウト")').count()) > 0) {
    return { attempted: true, success: true, url: page.url() };
  }
  const stillHasPassword = (await page.locator('input[type="password"]').count()) > 0;
  return { attempted: true, success: !stillHasPassword, url: page.url() };
}

// 表示切替ボタンなどのクリック操作。見つからないセレクタは黙ってスキップする
async function doClicks(page, clicks) {
  for (const sel of clicks || []) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) > 0) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(1500);
    }
  }
}

// 入力欄への記入（期間指定など）。valueの {week_start}/{week_end} は前週の日付に置換される。
// 全fill後にEnterを押し、applyClickがあればそのボタンも押して反映させる。
// 見つからないセレクタはfilledに記録されないため、呼び出し側で反映確認に使える
async function doFills(page, pconf, week) {
  const filled = {};
  for (const f of pconf.fills || []) {
    const input = page.locator(f.selector).first();
    if ((await input.count()) === 0) continue;
    const value = String(f.value)
      .replaceAll('{week_start}', week.start)
      .replaceAll('{week_end}', week.end);
    await input.fill(value);
    filled[f.selector] = value;
  }
  if ((pconf.fills || []).length > 0) {
    const last = page.locator(pconf.fills[pconf.fills.length - 1].selector).first();
    if ((await last.count()) > 0) await last.press('Enter').catch(() => {});
    if (pconf.applyClick) await doClicks(page, [pconf.applyClick]);
    await page.waitForTimeout(pconf.waitAfterFillMs || 2500);
  }
  return filled;
}

// ページの「構造」だけを抽出する（セル値・個人情報は取らない。
// 例外：テーブル1列目の日付として解釈できる値のみ、日付形式の確認用に少数記録する）
async function pageStructure(page) {
  return await page.evaluate(() => {
    const clip = (s, n = 60) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
    const dateLike = (s) => /\d{1,4}\s*[/\-年月.]\s*\d{1,2}/.test(s);
    const links = [...document.querySelectorAll('a[href]')]
      .map((a) => ({ text: clip(a.textContent), href: a.getAttribute('href') }))
      .filter((l) => l.text || l.href)
      .slice(0, 150);
    const tables = [...document.querySelectorAll('table')].slice(0, 20).map((t) => ({
      headers: [...t.querySelectorAll('th')].map((th) => clip(th.textContent)).slice(0, 30),
      rowCount: t.querySelectorAll('tr').length,
      firstColSample: [...t.querySelectorAll('tr')]
        .map((tr) => clip((tr.querySelector('th, td') || {}).textContent || ''))
        .filter((s) => dateLike(s))
        .slice(0, 8),
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
    const inputs = [...document.querySelectorAll('input, select')].map((i) => ({
      tag: i.tagName.toLowerCase(),
      type: i.getAttribute('type'),
      name: i.getAttribute('name'),
      id: i.getAttribute('id'),
      placeholder: clip(i.getAttribute('placeholder') || ''),
    })).slice(0, 40);
    const buttons = [...document.querySelectorAll('button, input[type="submit"]')]
      .map((b) => clip(b.textContent || b.value)).filter(Boolean).slice(0, 40);
    // アイコンのみのボタン等も拾えるよう、クリック可能要素の属性一覧も記録する
    const clickables = [...document.querySelectorAll('button, a, [role="button"], [onclick]')]
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.getAttribute('id'),
        cls: clip(el.getAttribute('class') || '', 60),
        aria: el.getAttribute('aria-label'),
        text: clip(el.textContent, 24),
      }))
      .slice(0, 80);
    const headings = [...document.querySelectorAll('h1,h2,h3')].map((h) => clip(h.textContent)).slice(0, 30);
    return { title: document.title, headings, links, tables, forms, inputs, buttons, clickables };
  });
}

// テーブルの中身（見出し＋セル文字列）をメモリ内に取り出す。
// KPI集計にのみ使い、セル値そのものはファイルへ書き出さない。
// ヘッダー行（tdを含まない行）は除外し、行内のth（日付列など）はtdと並べて扱う。
async function collectTables(page) {
  return await page.evaluate(() => {
    const clip = (s, n = 60) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
    return [...document.querySelectorAll('table')].slice(0, 20).map((t) => ({
      headers: [...t.querySelectorAll('th')].map((th) => clip(th.textContent)).slice(0, 30),
      rows: [...t.querySelectorAll('tr')]
        .filter((tr) => tr.querySelector('td'))
        .map((tr) => [...tr.querySelectorAll('th, td')].map((c) => clip(c.textContent)).slice(0, 30))
        .slice(0, 200),
    }));
  });
}

// 行の1列目を YYYY-MM-DD に正規化する。年なし表記（8/12・8月12日）は
// 前週の範囲に収まる年を補完し、範囲外なら null を返す
function parseRowDate(text, week) {
  const s = String(text || '');
  let m = s.match(/(\d{4})\s*[/\-年.]\s*(\d{1,2})\s*[/\-月.]\s*(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/(\d{1,2})\s*[/月.]\s*(\d{1,2})/);
  if (m) {
    for (const y of new Set([week.start.slice(0, 4), week.end.slice(0, 4)])) {
      const d = `${y}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
      if (d >= week.start && d <= week.end) return d;
    }
  }
  return null;
}

function toNumber(v) {
  const num = Number(String(v).replace(/[,¥円%\s]/g, ''));
  return Number.isFinite(num) ? num : null;
}

async function discovery(page, loginResult) {
  const report = {
    fetched_at: new Date().toISOString(),
    mode: 'discovery',
    login: loginResult,
    note: 'ページ構造のみ。セル値・顧客情報・生HTMLは含まない（テーブル1列目の日付形式サンプルを除く）。',
    pages: [],
  };

  report.pages.push({ url: page.url(), ...(await pageStructure(page)) });

  if (loginResult.success) {
    // SPAの表示切替ボタンを順に押し、各ビューの構造を記録する（日別の日付形式確認用）
    for (const label of ['今月', '日別', '先月']) {
      const btn = page.locator(`button:has-text("${label}")`).first();
      if ((await btn.count()) === 0) continue;
      await btn.click().catch(() => {});
      await page.waitForTimeout(2000);
      report.pages.push({ view: label, url: page.url(), ...(await pageStructure(page)) });
    }

    // サイドバーの業務ナビ（a.nav-item）を開いて構造を記録する。
    // 顧客情報系（顧客管理・来店記録・問い合わせ一覧）は開かない
    for (const label of ['勤務時間', 'スタッフ管理', '日報', '店舗設定']) {
      const clicked = await page.evaluate((lbl) => {
        const el = [...document.querySelectorAll('a.nav-item')].find(
          (e) => (e.textContent || '').trim() === lbl
        );
        if (!el) return false;
        el.click();
        return true;
      }, label);
      if (!clicked) continue;
      await page.waitForTimeout(2500);
      report.pages.push({ nav: label, clickedVia: 'nav-item', url: page.url(), ...(await pageStructure(page)) });
    }

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

// 画面のカードとテーブルが同じ数字を指しているかを確かめるための検証モード。
// 2026-08-24：同じ期間(7/27-8/08)で、画面のカードは「来店60名・新規36名・売上¥547,070」なのに
// parse は「37・21・¥358,530」を返した。どちらを読んでいるのかを特定するために追加した。
//
// **数値と既知のラベルしか保存しない。** 顧客名・スタッフ名が混ざらないよう、
// 数字を含まない文字列は捨てる（テーブルのセルも同じ扱い）。
async function probe(page, loginResult) {
  const week = lastWeekRangeJST();
  const out = {
    fetched_at: new Date().toISOString(),
    mode: 'probe',
    week_start: week.start,
    week_end: week.end,
    login: loginResult,
    note: '数値とラベルのみ。氏名の混入を防ぐため、数字を含まない文字列は保存しない。',
    fills_applied: {},
    cards: [],
    tables: [],
  };
  if (!loginResult.success) { out.status = 'login_failed'; writeJson('probe.json', out); return; }

  const base = new URL(page.url());
  const pconf = (selectors.pages || []).find((p) => p.name === 'dashboard_week');
  const url = new URL(pconf.url, base).toString();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(pconf.waitMs || 3000);
  out.fills_applied = await doFills(page, pconf, week);
  await page.waitForTimeout(pconf.waitAfterFillMs || 3000);

  const grabbed = await page.evaluate(() => {
    const clip = (s, n = 120) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
    const hasNum = (s) => /\d/.test(s);
    // カード：見出しらしいテキストと、その中の数値行だけを拾う
    const LABELS = /売上|来店|新規|回数券|更新|指名|予約|販売|稼働|離客/;
    const cards = [];
    for (const el of document.querySelectorAll('div,section,article')) {
      if (el.querySelector('div,section,article,table')) continue; // 最下層のみ
      const t = clip(el.textContent);
      if (!t || !hasNum(t)) continue;
      const parent = clip((el.parentElement || {}).textContent || '', 200);
      if (!LABELS.test(parent)) continue;
      cards.push(t);
    }
    // テーブル：ヘッダーと、数字を含むセルだけ
    const tables = [...document.querySelectorAll('table')].slice(0, 10).map((tb) => ({
      headers: [...tb.querySelectorAll('th')].map((th) => clip(th.textContent, 30)),
      rows: [...tb.querySelectorAll('tr')].slice(0, 40).map((tr) =>
        [...tr.querySelectorAll('td,th')].map((td) => {
          const v = clip(td.textContent, 30);
          return hasNum(v) || /合計|集計|総計|平均/.test(v) ? v : '';
        })
      ),
    }));
    return { cards: [...new Set(cards)].slice(0, 60), tables };
  });
  out.cards = grabbed.cards;
  out.tables = grabbed.tables;
  writeJson('probe.json', out);
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
    days_covered: {},
    period_labels: {},
    fills_applied: {},
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

  // ページごとに一度だけ移動＋クリックし、テーブルはまとめてメモリに取り込む
  const tableStore = {};
  const opened = new Set();
  async function openPage(pconf) {
    const url = new URL(
      pconf.url.replaceAll('{week_start}', week.start).replaceAll('{week_end}', week.end),
      base
    ).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(pconf.waitMs || 2500);
    await doClicks(page, pconf.clicks);
    const filled = await doFills(page, pconf, week);
    if (Object.keys(filled).length > 0) result.fills_applied[pconf.name] = filled;
    opened.add(pconf.name);
  }
  async function tablesFor(pconf) {
    if (tableStore[pconf.name]) return tableStore[pconf.name];
    await openPage(pconf);
    let tables = await collectTables(page);
    // 前週が月をまたぐ（週の開始月が今月と異なる）場合は「先月」ビューも取り込む
    if (pconf.prevPeriodClick && week.start.slice(0, 7) !== todayJstMonth()) {
      await doClicks(page, [pconf.prevPeriodClick]);
      tables = tables.concat(await collectTables(page));
    }
    tableStore[pconf.name] = tables;
    return tables;
  }

  for (const m of selectors.metrics || []) {
    try {
      const pconf = pagesByName[m.page];
      if (!pconf) throw new Error(`page config not found: ${m.page}`);

      if (m.method === 'table_row') {
        // 期間指定を反映したテーブルの集計行（先頭行）から値を取る。
        // 1列目（期間ラベル）はperiod_labelsに記録し、前週が反映されたかの確認に使う
        const tables = await tablesFor(pconf);
        const table = tables.find((t) =>
          (m.tableMatch || []).every((h) => t.headers.some((th) => th.includes(h)))
        );
        if (!table) throw new Error(`table not found: ${(m.tableMatch || []).join(',')}`);
        const rows = table.rows.filter((r) => r.length > 1);
        if (rows.length === 0) throw new Error('no data rows');
        const row = m.row === 'last' ? rows[rows.length - 1] : rows[0];
        const colIdx = table.headers.findIndex((h) => h.includes(m.column));
        if (colIdx < 0) throw new Error(`column not found: ${m.column}`);
        result.period_labels[m.page] = row[0];
        const v = toNumber(row[colIdx]);
        result.metrics[m.key] = v != null ? v : String(row[colIdx] ?? '').trim();
      } else if (m.method === 'table') {
        // tableMatchの見出しをすべて含むテーブルから、前週の日付行を集計する
        const tables = await tablesFor(pconf);
        const matched = tables.filter((t) =>
          (m.tableMatch || []).every((h) => t.headers.some((th) => th.includes(h)))
        );
        if (matched.length === 0) throw new Error(`table not found: ${(m.tableMatch || []).join(',')}`);
        const byDate = new Map(); // 同じ日付はビュー間で重複し得るため先勝ちで1件だけ採用
        for (const t of matched) {
          const colIdx = t.headers.findIndex((h) => h.includes(m.column));
          if (colIdx < 0) continue;
          for (const row of t.rows) {
            const d = parseRowDate(row[0], week);
            if (!d || d < week.start || d > week.end || byDate.has(d)) continue;
            const v = toNumber(row[colIdx]);
            if (v != null) byDate.set(d, v);
          }
        }
        if (byDate.size === 0) throw new Error('no rows in last-week range');
        const values = [...byDate.values()];
        const agg = m.agg || 'sum';
        result.metrics[m.key] =
          agg === 'avg'
            ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
            : values.reduce((a, b) => a + b, 0);
        result.days_covered[m.key] = byDate.size;
      } else {
        if (!opened.has(pconf.name)) await openPage(pconf);
        let value = null;
        if (m.method === 'css') {
          value = await page.locator(m.selector).first().textContent({ timeout: 10000 });
        } else if (m.method === 'regex') {
          const body = await page.evaluate(() => document.body.innerText);
          const match = body.match(new RegExp(m.pattern));
          value = match ? match[1] : null;
        }
        if (value == null) throw new Error('no match');
        const num = toNumber(value);
        result.metrics[m.key] = num != null ? num : String(value).trim();
      }
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
  } else if (MODE === 'probe') {
    await probe(page, loginResult);
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
