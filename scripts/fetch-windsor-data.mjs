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

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const QUERIES = [
  { name: 'facebook_yesterday', connector: 'facebook', params: { date_preset: 'last_1d', fields: 'date,campaign,adset_name,ad_name,ad_id,effective_status,spend,impressions,clicks,actions_landing_page_view,actions_offsite_conversion_fb_pixel_lead' } },
  { name: 'facebook_7d', connector: 'facebook', params: { date_preset: 'last_7d', fields: 'date,ad_name,ad_id,spend,clicks,actions_landing_page_view,actions_offsite_conversion_fb_pixel_lead' } },
  { name: 'google_ads_yesterday', connector: 'google_ads', params: { date_preset: 'last_1d', fields: 'date,campaign,spend,clicks,conversions' } },
  { name: 'google_ads_7d', connector: 'google_ads', params: { date_preset: 'last_7d', fields: 'date,campaign,spend,clicks,conversions' } },
  // 予算が足りているか（=増額すべきか）の判定用。budget_lost_impression_shareが高ければ機会損失
  { name: 'google_budget_7d', connector: 'google_ads', params: { date_preset: 'last_7d', fields: 'date,campaign,campaign_budget,search_impression_share,search_budget_lost_impression_share,search_rank_lost_impression_share' } },
  { name: 'facebook_budget', connector: 'facebook', params: { date_preset: 'last_3d', fields: 'date,campaign,adset_name,adset_daily_budget,adset_budget_remaining,spend' } },
  { name: 'google_search_terms_7d', connector: 'google_ads', params: { date_preset: 'last_7d', fields: 'date,search_term,clicks,conversions' } },
  // Googleビジネスプロフィール（接続されるまでは失敗するが、リレーは失敗を許容する設計）
  { name: 'gmb_reviews', connector: 'google_my_business', params: { date_preset: 'last_28d', fields: 'review_id,review_create_time,review_star_rating,review_comment,review_reply_comment,review_reviewer' } },
  // GBPの実績。地図枠での露出と行動を測る。2026-08-23まで一度も取得していなかった
  { name: 'gmb_insights_30d', connector: 'google_my_business', params: { date_preset: 'last_30d', fields: 'date,impressions,impressions_mobile_maps,impressions_mobile_search,website_clicks,call_clicks,direction_requests' } },
  // GBPがどんな検索語で見つかっているか。地図枠のSEOに直結する
  { name: 'gmb_keywords_30d', connector: 'google_my_business', params: { date_preset: 'last_30d', fields: 'search_keyword,search_keyword_value' } },
  // --- GA4 と Search Console は公式APIへ移行済み（2026-08-27） ---
  // 取得は fetch-ga4-data.mjs / fetch-gsc-data.mjs が行い、正となる out/<name>.json はそちらが書く。
  // ここに残しているのは**移行直後の突き合わせ用**で、out/_windsor_<name>.json に書き出すだけ。
  // 数字が一致することを数日確認したら、この compare 群ごと削除してWindsor側の接続を切る
  // （Windsorの料金はデータソース数で決まるため、接続を切って初めて費用が下がる）。
  // 環境変数 SKIP_WINDSOR_COMPARE=1 で丸ごと飛ばせる。
  { name: 'gsc_queries_28d', compare: true, connector: 'searchconsole', params: { date_preset: 'last_28d', fields: 'query,branded_vs_nonbranded,clicks,impressions,ctr,position' } },
  { name: 'gsc_queries_prev28d', compare: true, connector: 'searchconsole', params: { date_from: daysAgo(56), date_to: daysAgo(29), fields: 'query,clicks,impressions,position' } },
  { name: 'ga4_events_7d', compare: true, connector: 'googleanalytics4', params: { date_preset: 'last_7d', fields: 'date,event_name,event_count,session_source_medium' } },
  { name: 'ga4_pages_7d', compare: true, connector: 'googleanalytics4', params: { date_preset: 'last_7d', fields: 'date,page_path,session_source_medium,sessions' } },
  { name: 'ga4_events_30d', compare: true, connector: 'googleanalytics4', params: { date_preset: 'last_30d', fields: 'date,event_name,event_count,session_source_medium' } },
  { name: 'ga4_sessions_30d', compare: true, connector: 'googleanalytics4', params: { date_preset: 'last_30d', fields: 'date,session_source_medium,sessions' } },
  { name: 'google_ads_30d', connector: 'google_ads', params: { date_preset: 'last_30d', fields: 'date,campaign,spend,clicks,conversions' } },
  { name: 'facebook_30d', connector: 'facebook', params: { date_preset: 'last_30d', fields: 'date,ad_name,spend,clicks,actions_landing_page_view,actions_offsite_conversion_fb_pixel_lead' } },
  // 広告疲労（フリークエンシー）。同じ人に何回届いているか。週3〜5回を超えたらクリエイティブの入れ替えを検討する。
  // 2026-08-24まで未取得だった。疲労は数週間かけて進むので、日次ではなく14日窓で見る。
  { name: 'facebook_frequency_14d', connector: 'facebook', params: { date_preset: 'last_14d', fields: 'date,adset_name,ad_name,reach,impressions,frequency,spend' } },
  // 入札戦略の取得を試す（有効なフィールド名が不明なため複数パターンを個別に投げ、
  // 失敗時のエラーメッセージから正しい名前を特定する）
  { name: 'probe_bid_a', connector: 'google_ads', params: { date_preset: 'last_3d', fields: 'date,campaign,bidding_strategy_type' } },
  { name: 'probe_bid_b', connector: 'google_ads', params: { date_preset: 'last_3d', fields: 'date,campaign,campaign_bidding_strategy_type,target_cpa' } },
  { name: 'probe_bid_c', connector: 'google_ads', params: { date_preset: 'last_3d', fields: 'date,campaign,bidding_strategy,average_cpc,campaign_status' } },
];

await mkdir('out', { recursive: true });
const summary = { fetched_at: new Date().toISOString(), results: {} };

const SKIP_COMPARE = process.env.SKIP_WINDSOR_COMPARE === '1';
const targets = QUERIES.filter((q) => !(q.compare && SKIP_COMPARE));

for (const q of targets) {
  // 移行済みのものは正のファイル名を奪わない。突き合わせ用に別名で置く
  const outName = q.compare ? `_windsor_${q.name}` : q.name;
  const url = new URL(`https://connectors.windsor.ai/${q.connector}`);
  url.searchParams.set('api_key', KEY);
  for (const [k, v] of Object.entries(q.params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    const json = JSON.parse(body);
    const rows = json.data ?? json;
    await writeFile(`out/${outName}.json`, JSON.stringify(rows, null, 1));
    summary.results[outName] = { ok: true, rows: Array.isArray(rows) ? rows.length : -1 };
    console.log(`${outName}: ${summary.results[outName].rows}行`);
  } catch (e) {
    summary.results[outName] = { ok: false, error: String(e).slice(0, 300) };
    console.error(`${outName}: 失敗 - ${e}`);
  }
}

await writeFile('out/_summary.json', JSON.stringify(summary, null, 1));
// 全クエリ失敗のときだけ異常終了（一部失敗は許容し、取れた分を保存する）
const okCount = Object.values(summary.results).filter((r) => r.ok).length;
if (okCount === 0) process.exit(1);
console.log(`完了: ${okCount}/${targets.length} クエリ成功`);
