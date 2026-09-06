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
  { name: 'gmb_reviews', connector: 'google_my_business', params: { date_preset: 'last_28d', /* ⚠️ 直近28日ぶんしか来ない。返信率を「◯件中◯件」で言うときは総数を gmb_profile_state.review_total_count で確認すること（2026-09-01に18件と80件を取り違えた） */ fields: 'review_id,review_create_time,review_star_rating,review_comment,review_reply_comment,review_reviewer' } },
  // GBPの実績。地図枠での露出と行動を測る。2026-08-23まで一度も取得していなかった
  { name: 'gmb_insights_30d', connector: 'google_my_business', params: { date_preset: 'last_30d', fields: 'date,impressions,impressions_mobile_maps,impressions_mobile_search,website_clicks,call_clicks,direction_requests' } },
  // GBPがどんな検索語で見つかっているか。地図枠のSEOに直結する
  { name: 'gmb_keywords_30d', connector: 'google_my_business', params: { date_preset: 'last_30d', fields: 'search_keyword,search_keyword_value' } },
  // プロフィールの現況。**名前の巻き戻りと審査待ちを自動で検知するため**（2026-09-01 追加）。
  // 2026-08 に「ビジネス名が 全力ストレッチ岐阜長良店 → 全力ストレッチ店 へ繰り返し戻る」事象があり、
  // 気づくのも、収まったのを確かめるのも、毎回オーナーの目視だった。
  // `location_title` が正でなくなる／`has_pending_edits` が立つ／`has_voice_of_merchant` が false になる、
  // のいずれかが起きたら異常。日次で記録して時刻ごと残す。
  { name: 'gmb_profile_state', connector: 'google_my_business', params: { fields: 'location_title,location_primary_category_name,location_website_uri,location_primary_phone,location_metadata_has_pending_edits,location_metadata_has_google_updated,location_metadata_has_voice_of_merchant,location_metadata_duplicate_location,review_total_count,review_average_rating_total' } },
  // GA4（ga4_*）と Search Console（gsc_*）はここには無い。2026-08-27に公式APIへ移した。
  // 取得は fetch-ga4-data.mjs / fetch-gsc-data.mjs が行う。**Windsor側の接続も解除済み**なので、
  // ここに書き戻しても404になるだけ。移行時の突き合わせでは1,743行すべて一致している。
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

for (const q of QUERIES) {
  const outName = q.name;
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
console.log(`完了: ${okCount}/${QUERIES.length} クエリ成功`);
