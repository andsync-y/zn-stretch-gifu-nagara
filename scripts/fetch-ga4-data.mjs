#!/usr/bin/env node
/**
 * GA4 Data API から日次データを取得し、Windsor経由のときと同じ形で out/*.json に保存する。
 * windsor-data.yml から毎朝実行する。
 *
 * 2026-08-27にWindsorのGA4コネクタから移行した。理由はコスト。
 * Windsorの料金はデータソース数で決まり（Basic 3 / Standard 7）、GA4とSearch Consoleを
 * 公式APIへ寄せると接続数が5→3になってBasicに収まる。公式APIはどちらも無料。
 *
 * 必要なもの:
 *   GOOGLE_SERVICE_ACCOUNT_JSON … サービスアカウントキー（GA4プロパティに閲覧者として追加しておく）
 *   GA4_PROPERTY_ID              … 既定 545472920（全力ストレッチ岐阜長良店）
 *
 * 出力（いずれもWindsor時代とキー名・型を揃えてある）:
 *   ga4_events_7d.json    [{date, event_name, event_count, session_source_medium}]
 *   ga4_pages_7d.json     [{date, page_path, session_source_medium, sessions}]
 *   ga4_events_30d.json   （7dと同じ形）
 *   ga4_sessions_30d.json [{date, session_source_medium, sessions}]
 *   ga4_reserve_hourly_30d.json [{datetime_hour, event_name, session_source_medium, event_count}]
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { getAccessToken, ga4DateToIso, mergeSummary } from './lib/google-auth.mjs';

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const PROPERTY = process.env.GA4_PROPERTY_ID || '545472920';
const PAGE_SIZE = 100000; // APIの上限は250,000。足りなければ offset で継ぐ

const REPORTS = [
  {
    name: 'ga4_events_7d',
    range: { startDate: '7daysAgo', endDate: 'yesterday' },
    dimensions: ['date', 'eventName', 'sessionSourceMedium'],
    metrics: ['eventCount'],
    shape: (d, m) => ({ date: ga4DateToIso(d[0]), event_name: d[1], event_count: Number(m[0]), session_source_medium: d[2] }),
  },
  {
    name: 'ga4_pages_7d',
    range: { startDate: '7daysAgo', endDate: 'yesterday' },
    dimensions: ['date', 'pagePath', 'sessionSourceMedium'],
    metrics: ['sessions'],
    shape: (d, m) => ({ date: ga4DateToIso(d[0]), page_path: d[1], session_source_medium: d[2], sessions: Number(m[0]) }),
  },
  {
    name: 'ga4_events_30d',
    range: { startDate: '30daysAgo', endDate: 'yesterday' },
    dimensions: ['date', 'eventName', 'sessionSourceMedium'],
    metrics: ['eventCount'],
    shape: (d, m) => ({ date: ga4DateToIso(d[0]), event_name: d[1], event_count: Number(m[0]), session_source_medium: d[2] }),
  },
  {
    name: 'ga4_sessions_30d',
    range: { startDate: '30daysAgo', endDate: 'yesterday' },
    dimensions: ['date', 'sessionSourceMedium'],
    metrics: ['sessions'],
    shape: (d, m) => ({ date: ga4DateToIso(d[0]), session_source_medium: d[1], sessions: Number(m[0]) }),
  },
  {
    // 予約アクションの発火「時刻」。SALON BOARDの予約通知メールにある「予約受付日時」と
    // 突き合わせて、クリック→予約成立の歩留まりを時間帯別に見るために使う
    // （docs/analytics/booking-email-correlation.md）。
    // dateHour はGA4プロパティのタイムゾーン設定に従う。JST想定だが未検証で、
    // ズレていると時刻比較が最大9時間ずれる。最初の突き合わせのときに必ず確認すること。
    // 全イベントを時間粒度で取ると行数が跳ねるため、予約アクション3種に絞っている。
    name: 'ga4_reserve_hourly_30d',
    range: { startDate: '30daysAgo', endDate: 'yesterday' },
    dimensions: ['dateHour', 'eventName', 'sessionSourceMedium'],
    metrics: ['eventCount'],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: ['click_reserve', 'click_line', 'click_tel'] },
      },
    },
    orderBys: [{ dimension: { dimensionName: 'dateHour' } }],
    shape: (d, m) => ({
      datetime_hour: `${ga4DateToIso(d[0].slice(0, 8))}T${d[0].slice(8, 10)}:00`,
      event_name: d[1],
      session_source_medium: d[2],
      event_count: Number(m[0]),
    }),
  },
];

async function runReport(token, r) {
  const rows = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [r.range],
        dimensions: r.dimensions.map((name) => ({ name })),
        metrics: r.metrics.map((name) => ({ name })),
        ...(r.dimensionFilter ? { dimensionFilter: r.dimensionFilter } : {}),
        // 日付昇順・件数降順。Windsorの並びに寄せておくと、目視で見比べやすい
        orderBys: r.orderBys || [
          { dimension: { dimensionName: 'date' } },
          { metric: { metricName: r.metrics[0] }, desc: true },
        ],
        limit: PAGE_SIZE,
        offset,
      }),
      signal: AbortSignal.timeout(60000),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    const json = JSON.parse(text);
    for (const row of json.rows || []) {
      rows.push(r.shape(row.dimensionValues.map((v) => v.value), row.metricValues.map((v) => v.value)));
    }
    const total = Number(json.rowCount || rows.length);
    offset += PAGE_SIZE;
    if (rows.length >= total || !json.rows?.length) break;
  }
  return rows;
}

await mkdir('out', { recursive: true });
const results = {};
let ok = 0;

try {
  const token = await getAccessToken(SCOPE);
  for (const r of REPORTS) {
    try {
      const rows = await runReport(token, r);
      await writeFile(`out/${r.name}.json`, JSON.stringify(rows, null, 1));
      results[r.name] = { ok: true, rows: rows.length, source: 'ga4_api' };
      ok += 1;
      console.log(`${r.name}: ${rows.length}行`);
    } catch (e) {
      results[r.name] = { ok: false, error: String(e).slice(0, 300), source: 'ga4_api' };
      console.error(`${r.name}: 失敗 - ${e}`);
    }
  }
} catch (e) {
  // 認証段階で落ちた場合は全レポートを失敗として記録する
  for (const r of REPORTS) results[r.name] = { ok: false, error: String(e).slice(0, 300), source: 'ga4_api' };
  console.error(`GA4の認証に失敗: ${e}`);
}

await mergeSummary(results);
// ここで異常終了すると広告データのコミットまで巻き添えになるため、常に0で抜ける。
// 失敗は _summary.json に残るので、デイリー監視が鮮度チェックで気づける。
console.log(`GA4: ${ok}/${REPORTS.length} 件成功`);
