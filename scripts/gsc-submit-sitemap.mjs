#!/usr/bin/env node
/**
 * Search Console へ sitemap を再送信する。ページの追加・更新がデプロイされたときに
 * gsc-sitemap-ping.yml から自動実行する（新規ページの発見を待ちではなくこちらから通知する）。
 * 要: GSCで ga4-reader が「フル」権限（2026-08-30に付与済み。「制限付き」だと403）。
 */
import { getAccessToken } from './lib/google-auth.mjs';

const SITE = process.env.GSC_SITE_URL || 'https://zn-stretch-gifu.com/';
const feed = `${SITE.replace(/\/$/, '')}/sitemap-index.xml`;
const token = await getAccessToken('https://www.googleapis.com/auth/webmasters');
const res = await fetch(
  `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(feed)}`,
  { method: 'PUT', headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) },
);
if (!res.ok) { console.error(`sitemap再送信 失敗 HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`); process.exit(1); }
console.log(`sitemap再送信 OK: ${feed}`);
