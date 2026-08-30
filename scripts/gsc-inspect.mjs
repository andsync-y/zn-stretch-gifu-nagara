#!/usr/bin/env node
/**
 * Search Console の URL検査APIで全ページのインデックス状況を調べ、レポートを out/ に書く。
 * あわせて sitemap の再送信も試みる（クロールを促す公式手段）。
 *
 * 背景（2026-08-30）: ページ別GSCデータの初回取得で、検索表示の100%がトップページに
 * 帰属しており、コラム18記事が検索結果に出ていないことが判明した。どの記事が
 * 「未発見」「発見済み未登録」「クロール済み未登録」なのかを切り分けるために作った。
 *
 * 注意:
 *   - 「インデックス登録をリクエスト」ボタンに相当する公式APIは存在しない
 *     （Indexing APIは求人・ライブ配信専用）。ここでできるのは検査とサイトマップ再送信まで
 *   - URL検査APIのクォータは約2,000件/日・600件/分。全36ページなら余裕
 *   - 認証は scripts/lib/google-auth.mjs（Workload Identity 連携）。書き込みスコープを使うため、
 *     sitemap再送信にはGSC側で ga4-reader が「フル」権限である必要がある（「制限付き」だと403）。
 *     検査だけなら「制限付き」でも通る
 *
 * 実行: GitHub Actions（gsc-inspect.yml）から。出力: out/gsc-inspect-report.md
 */
import { readdirSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { getAccessToken } from './lib/google-auth.mjs';

const SITE = process.env.GSC_SITE_URL || 'https://zn-stretch-gifu.com/';
// URL_FORM=slash でスラッシュ付き形を検査する（sitemapが送っていた形。canonical形とどちらを
// Googleが知っているか切り分けるため。2026-08-30の初回検査でcanonical形は全て unknown だった）
const SLASH = process.env.URL_FORM === 'slash';
const ORIGIN = SITE.replace(/\/$/, '');
const SCOPE = 'https://www.googleapis.com/auth/webmasters';

/** ルート一覧を src/pages から組み立てる（canonicalと同じ末尾スラッシュ無し形）。/lp はnoindexなので除外 */
function routes() {
  const out = ['/'];
  const walk = (dir, prefix) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.isDirectory()) { walk(`${dir}/${f.name}`, `${prefix}/${f.name}`); continue; }
      if (!f.name.endsWith('.astro')) continue;
      const name = f.name.replace(/\.astro$/, '');
      const p = name === 'index' ? (prefix || '/') : `${prefix}/${name}`;
      if (p === '/lp' || p === '/') { if (p === '/lp') continue; else continue; }
      out.push(p);
    }
  };
  walk('src/pages', '');
  return [...new Set(out)];
}

const token = await getAccessToken(SCOPE);

async function inspect(url) {
  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text).inspectionResult?.indexStatusResult ?? {};
}

async function resubmitSitemap() {
  const feed = `${ORIGIN}/sitemap-index.xml`;
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(feed)}`,
    { method: 'PUT', headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) },
  );
  return res.ok ? `✅ 再送信OK（${feed}）` : `⚠️ 失敗 HTTP ${res.status}（GSCで ga4-reader を「フル」権限にすると通る）`;
}

const rows = [];
for (const path of routes()) {
  const url = path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}${SLASH ? '/' : ''}`;
  try {
    const r = await inspect(url);
    rows.push({
      path,
      verdict: r.verdict ?? '?',
      coverage: r.coverageState ?? '?',
      lastCrawl: (r.lastCrawlTime ?? '').slice(0, 10) || '未クロール',
      canonicalOk: !r.googleCanonical || r.googleCanonical === r.userCanonical ? '' : `Google側canonical: ${r.googleCanonical}`,
    });
    console.log(`${path}: ${r.coverageState ?? r.verdict}`);
  } catch (e) {
    rows.push({ path, verdict: 'ERROR', coverage: String(e).slice(0, 120), lastCrawl: '', canonicalOk: '' });
    console.error(`${path}: ${e}`);
  }
  await new Promise((res2) => setTimeout(res2, 400)); // クォータへの礼儀
}

const sitemapResult = await resubmitSitemap();

const counts = {};
for (const r of rows) counts[r.coverage] = (counts[r.coverage] ?? 0) + 1;

await mkdir('out', { recursive: true });
const md = [
  `# GSC URL検査レポート`,
  ``,
  `sitemap再送信: ${sitemapResult}`,
  ``,
  `## 集計`,
  ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}件`),
  ``,
  `## ページ別`,
  `| パス | 判定 | 状態 | 最終クロール | 備考 |`,
  `|---|---|---|---|---|`,
  ...rows.map((r) => `| ${r.path} | ${r.verdict} | ${r.coverage} | ${r.lastCrawl} | ${r.canonicalOk} |`),
].join('\n');
await writeFile('out/gsc-inspect-report.md', md);
console.log(`\n完了: ${rows.length}ページ検査 / ${sitemapResult}`);
