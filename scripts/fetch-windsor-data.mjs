#!/usr/bin/env node
/**
 * Windsor.ai REST APIから広告・GA4の日次データを取得してJSONに保存する。
 * GitHub Actions（windsor-data.yml）から毎朝実行し、windsor-dataブランチへコミットする想定。
 * 要 WINDSOR_API_KEY（Windsor Team Management > API Access のキー）。
 * MCPコネクタの接続断に依存しないための中継レイヤー。
 */
import { writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.WINDSOR_API_KEY;
if (!KEY) { console.error('WINDSOR_API_KEY がありません'); process.exit(1); }

const QUERIES = [
  { name: 'facebook_yesterday', connector: 'facebook', params: { date_preset: 'last_1d', fields: 'date,campaign,adset_name,ad_name,ad_id,effective_status,spend,impressions,clicks' } },
  { name: 'facebook_7d', connector: 'facebook', params: { date_preset: 'last_7d', fields: 'date,ad_name,ad_id,spend,clicks' } },
  { name: 'google_ads_yesterday', connector: 'google_ads', params: { date_preset: 'last_1d', fields: 'date,campaign,spend,clicks,conversions' } },
  { name: 'google_ads_7d', connector: 'google_ads', params: { date_preset: 'last_7d', fields: 'date,campaign,spend,clicks,conversions' } },
  // 予算が足りているか（=増額すべきか）の判定用。budget_lost_impression_shareが高ければ機会損失
  { name: 'google_budget_7d', connector: 'google_ads', params: { date_preset: 'last_7d', fields: 'date,campaign,campaign_budget,search_impression_share,search_budget_lost_impression_share,search_rank_lost_impression_share' } },
  { name: 'facebook_budget', connector: 'facebook', params: { date_preset: 'last_3d', fields: 'date,campaign,adset_name,daily_budget,budget_remaining,spend' } },
  { name: 'google_search_terms_7d', connector: 'google_ads', params: { date_preset: 'last_7d', fields: 'date,search_term,clicks,conversions' } },
  { name: 'ga4_events_7d', connector: 'googleanalytics4', params: { date_preset: 'last_7d', fields: 'date,event_name,event_count,session_source_medium' } },
  { name: 'ga4_pages_7d', connector: 'googleanalytics4', params: { date_preset: 'last_7d', fields: 'date,page_path,session_source_medium,sessions' } },
  // 月次の媒体別コンバージョン（サロン側の来店経路との突き合わせ用）
  { name: 'ga4_events_30d', connector: 'googleanalytics4', params: { date_preset: 'last_30d', fields: 'date,event_name,event_count,session_source_medium' } },
  { name: 'ga4_sessions_30d', connector: 'googleanalytics4', params: { date_preset: 'last_30d', fields: 'date,session_source_medium,sessions' } },
  { name: 'google_ads_30d', connector: 'google_ads', params: { date_preset: 'last_30d', fields: 'date,campaign,spend,clicks,conversions' } },
  { name: 'facebook_30d', connector: 'facebook', params: { date_preset: 'last_30d', fields: 'date,ad_name,spend,clicks' } },
  // 入札戦略の取得を試す（有効なフィールド名が不明なため複数パターンを個別に投げ、
  // 失敗時のエラーメッセージから正しい名前を特定する）
  { name: 'probe_bid_a', connector: 'google_ads', params: { date_preset: 'last_3d', fields: 'date,campaign,bidding_strategy_type' } },
  { name: 'probe_bid_b', connector: 'google_ads', params: { date_preset: 'last_3d', fields: 'date,campaign,campaign_bidding_strategy_type,target_cpa' } },
  { name: 'probe_bid_c', connector: 'google_ads', params: { date_preset: 'last_3d', fields: 'date,campaign,bidding_strategy,average_cpc,campaign_status' } },
];

await mkdir('out', { recursive: true });
const summary = { fetched_at: new Date().toISOString(), results: {} };

for (const q of QUERIES) {
  const url = new URL(`https://connectors.windsor.ai/${q.connector}`);
  url.searchParams.set('api_key', KEY);
  for (const [k, v] of Object.entries(q.params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    const json = JSON.parse(body);
    const rows = json.data ?? json;
    await writeFile(`out/${q.name}.json`, JSON.stringify(rows, null, 1));
    summary.results[q.name] = { ok: true, rows: Array.isArray(rows) ? rows.length : -1 };
    console.log(`${q.name}: ${summary.results[q.name].rows}行`);
  } catch (e) {
    summary.results[q.name] = { ok: false, error: String(e).slice(0, 300) };
    console.error(`${q.name}: 失敗 - ${e}`);
  }
}

await writeFile('out/_summary.json', JSON.stringify(summary, null, 1));
// 全クエリ失敗のときだけ異常終了（一部失敗は許容し、取れた分を保存する）
const okCount = Object.values(summary.results).filter((r) => r.ok).length;
if (okCount === 0) process.exit(1);
console.log(`完了: ${okCount}/${QUERIES.length} クエリ成功`);
