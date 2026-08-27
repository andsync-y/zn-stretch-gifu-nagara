#!/usr/bin/env node
/**
 * Search Console API からクエリ別の実績を取得し、Windsor経由のときと同じ形で out/*.json に保存する。
 * windsor-data.yml から毎朝実行する。
 *
 * 2026-08-27にWindsorのsearchconsoleコネクタから移行した（GA4と同じくコスト理由。公式APIは無料）。
 *
 * 移行ついでに直したもの:
 *   Windsorの `branded_vs_nonbranded` は**全件 "nonbranded"** を返していた。
 *   「全力ストレッチ」まで非指名扱いで、指名/非指名の切り分けが機能していなかった。
 *   判定は scripts/lib/branded.mjs に移し、テストも置いた。
 *
 * 必要なもの:
 *   GOOGLE_SERVICE_ACCOUNT_JSON … サービスアカウントキー（Search Consoleに「制限付き」以上で追加しておく）
 *   GSC_SITE_URL                … 既定 https://zn-stretch-gifu.com/
 *
 * 出力:
 *   gsc_queries_28d.json     [{query, branded_vs_nonbranded, clicks, impressions, ctr, position}]
 *   gsc_queries_prev28d.json [{query, clicks, impressions, position}]
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { getAccessToken, mergeSummary } from './lib/google-auth.mjs';
import { brandedLabel } from './lib/branded.mjs';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const SITE = process.env.GSC_SITE_URL || 'https://zn-stretch-gifu.com/';
const ROW_LIMIT = 25000; // APIの1リクエスト上限

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
// Windsorの小数は4桁で返ってきていた。既存の分析・比較を壊さないよう揃える
const round4 = (v) => Math.round(Number(v) * 10000) / 10000;

const REPORTS = [
  {
    name: 'gsc_queries_28d',
    startDate: daysAgo(28),
    endDate: daysAgo(1),
    shape: (q, r) => ({
      query: q,
      branded_vs_nonbranded: brandedLabel(q),
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: round4(r.ctr),
      position: round4(r.position),
    }),
  },
  {
    // 前期間との比較用。Windsor時代と同じ窓（56日前〜29日前）
    name: 'gsc_queries_prev28d',
    startDate: daysAgo(56),
    endDate: daysAgo(29),
    shape: (q, r) => ({
      query: q,
      clicks: r.clicks,
      impressions: r.impressions,
      position: round4(r.position),
    }),
  },
];

async function queryAnalytics(token, r) {
  const rows = [];
  let startRow = 0;
  for (;;) {
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          startDate: r.startDate,
          endDate: r.endDate,
          dimensions: ['query'],
          rowLimit: ROW_LIMIT,
          startRow,
        }),
        signal: AbortSignal.timeout(60000),
      },
    );
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    const json = JSON.parse(text);
    const batch = json.rows || [];
    for (const row of batch) rows.push(r.shape(row.keys[0], row));
    if (batch.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }
  // クリック降順。Windsorの並びに合わせる
  rows.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
  return rows;
}

await mkdir('out', { recursive: true });
const results = {};
let ok = 0;

try {
  const token = await getAccessToken(SCOPE);
  for (const r of REPORTS) {
    try {
      const rows = await queryAnalytics(token, r);
      await writeFile(`out/${r.name}.json`, JSON.stringify(rows, null, 1));
      const branded = rows.filter((x) => x.branded_vs_nonbranded === 'branded').length;
      results[r.name] = { ok: true, rows: rows.length, source: 'gsc_api' };
      ok += 1;
      console.log(`${r.name}: ${rows.length}行${r.name.endsWith('28d') && !r.name.includes('prev') ? `（うち指名 ${branded}件）` : ''}`);
    } catch (e) {
      results[r.name] = { ok: false, error: String(e).slice(0, 300), source: 'gsc_api' };
      console.error(`${r.name}: 失敗 - ${e}`);
    }
  }
} catch (e) {
  for (const r of REPORTS) results[r.name] = { ok: false, error: String(e).slice(0, 300), source: 'gsc_api' };
  console.error(`Search Consoleの認証に失敗: ${e}`);
}

await mergeSummary(results);
// GA4側と同じ理由で常に0で抜ける（広告データのコミットを巻き添えにしない）
console.log(`Search Console: ${ok}/${REPORTS.length} 件成功`);
