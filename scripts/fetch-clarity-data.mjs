#!/usr/bin/env node
/**
 * Microsoft Clarity の行動データ（rage click・dead click・スクロール到達率など）を取得し、
 * out/clarity_7d.json として保存する。windsor-data.yml から毎朝実行する。
 *
 * 要 CLARITY_API_TOKEN（Clarityダッシュボード > Settings > Data Export > Generate new API token）。
 *
 * ■ 設計上の前提と制約
 *
 * 1. APIは「直近N日の**集計**」を返す。日別の内訳は返さない。
 *    そのため1日1スナップショットとして積み上げ、取得日（JST）をキーに重複排除する。
 *
 * 2. windsor-dataブランチは windsor-data.yml が毎回 `git init` + `--force push` で作り直す。
 *    **前回分を読み込んでマージしないと毎日1日分に戻る**。
 *    ワークフローが origin/windsor-data から取り出して PREV_FILE に置く前提。
 *
 * 3. レート制限は1プロジェクトあたり10リクエスト/日。日次実行なので
 *    **1実行あたり最大3リクエスト（本番2＋リトライ1）**に固定する。
 *
 * 4. 2026-08-20時点で、この実行環境からは learn.microsoft.com に到達できず
 *    公式ドキュメントで仕様を照合できていない。そのため**レスポンスの形を仮定せず、
 *    返ってきたJSONをそのまま保存する**（指標名を作らない・数字を加工しない）。
 *    形が変わっても壊れず、中身は後から読み替えられる。
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { jstDate, parsePrevious, mergeDays, metricNames, hasData, latestDataDate } from './lib/clarity-merge.mjs';

const TOKEN = process.env.CLARITY_API_TOKEN;
const PREV_FILE = process.env.CLARITY_PREV_FILE || 'prev/clarity_7d.json';
const OUT_DIR = process.env.OUT_DIR || 'out';
const NUM_OF_DAYS = Number(process.env.CLARITY_NUM_OF_DAYS || 3); // API上限は3
const ENDPOINT = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';

// 10リクエスト/日の制限を絶対に食い潰さないための実行あたりの上限。
// 本番2回（全体サマリー＋ページ×デバイス）＋リトライ1回まで。
const MAX_REQUESTS = 3;
let requestsUsed = 0;

const TODAY = jstDate();

/** 1回だけ再試行する。恒久的な失敗（401/403/404）は再試行しない＝トークンを無駄撃ちしない。 */
async function callApi(label, params) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('numOfDays', String(NUM_OF_DAYS));
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (requestsUsed >= MAX_REQUESTS) {
      return { ok: false, error: `リクエスト上限（${MAX_REQUESTS}回/実行）に達したため ${label} を中止`, payload: null };
    }
    requestsUsed++;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(60000),
      });
      const body = await res.text();
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
        // 認証・権限・存在しないエンドポイントは何度投げても同じ。ここで打ち切る。
        if ([400, 401, 403, 404].includes(res.status)) return { ok: false, error: err.message, payload: null };
        throw err;
      }
      return { ok: true, error: null, payload: JSON.parse(body) };
    } catch (e) {
      lastError = e;
      console.error(`clarity ${label}: ${attempt}回目失敗 - ${String(e).slice(0, 200)}`);
    }
  }
  return { ok: false, error: String(lastError).slice(0, 300), payload: null };
}

/** 取得できたものだけで当日のスナップショットを組み立てる。 */
function buildSnapshot(overall, byPage) {
  const payloads = [overall.payload, byPage.payload].filter(Boolean);
  const noData = !payloads.some(hasData);
  return {
    date: TODAY,
    fetched_at: new Date().toISOString(),
    num_of_days: NUM_OF_DAYS,
    // データが1件も無いときも構造は必ず出す。ダッシュボードが空なのか取得に失敗したのかを
    // 週次レビュー側で区別できるようにするため、フラグと理由を分けて持つ。
    no_data: noData,
    metrics_available: [...new Set([...metricNames(overall.payload), ...metricNames(byPage.payload)])],
    overall: overall.ok ? { ok: true, data: overall.payload } : { ok: false, error: overall.error },
    by_page_device: byPage.ok ? { ok: true, data: byPage.payload } : { ok: false, error: byPage.error },
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let prevText = '';
  try {
    prevText = await readFile(PREV_FILE, 'utf8');
  } catch {
    console.log(`前回の clarity_7d.json はありません（${PREV_FILE}）。初回として続行します`);
  }
  const previous = parsePrevious(prevText);

  let snapshot = null;
  let runError = null;

  if (!TOKEN) {
    // トークン未設定でもワークフローは止めない。構造だけ出して、設定漏れがログとJSONに残るようにする。
    runError = 'CLARITY_API_TOKEN が未設定';
    console.error(`clarity: ${runError}。取得をスキップします`);
    snapshot = buildSnapshot({ ok: false, error: runError, payload: null }, { ok: false, error: runError, payload: null });
  } else {
    // 1回目：全体サマリー。2回目：ページ×デバイスの内訳（どのページで詰まっているかを見るため）。
    const overall = await callApi('overall', {});
    const byPage = await callApi('by_page_device', { dimension1: 'URL', dimension2: 'Device' });
    snapshot = buildSnapshot(overall, byPage);
    if (!overall.ok && !byPage.ok) runError = overall.error;
  }

  const days = mergeDays(previous.days, snapshot, { today: TODAY, maxAgeDays: 8 });
  const out = {
    note:
      'Microsoft Clarity Data Export API のレスポンスを日次スナップショットとして保持する。' +
      '読み方: (1) まず no_data を見る。true のときは数字を一切書かず「Clarityにまだ行動データがありません」とだけ書く（推測で数字を作らない）。' +
      '(2) false のときは days の最新要素の overall.data / by_page_device.data を読み、実際に返っている指標だけを引用する（無い指標は作らない）。' +
      '(3) days は取得日ごとのスナップショットで、各要素は num_of_days 日ぶんの集計。日別推移として語らないこと。',
    fetched_at: new Date().toISOString(),
    // ファイル全体としてデータが1日分も無い状態か。週次レビューはここを見て引用の可否を決める。
    no_data: days.every((d) => d.no_data !== false),
    latest_data_date: latestDataDate(days),
    days,
  };
  await writeFile(`${OUT_DIR}/clarity_7d.json`, JSON.stringify(out, null, 1));

  // _summary.json は fetch-windsor-data.mjs が先に書いている。上書きせず追記する。
  const summaryPath = `${OUT_DIR}/_summary.json`;
  let summary = {};
  try {
    summary = JSON.parse(await readFile(summaryPath, 'utf8'));
  } catch {
    summary = { fetched_at: new Date().toISOString(), results: {} };
  }
  summary.results = summary.results || {};
  summary.results.clarity_7d = {
    ok: !runError,
    ...(runError ? { error: runError } : {}),
    fetched_at: out.fetched_at,
    days: days.length,
    no_data: out.no_data,
    latest_data_date: out.latest_data_date,
    requests_used: requestsUsed,
  };
  await writeFile(summaryPath, JSON.stringify(summary, null, 1));

  console.log(
    `clarity_7d.json: ${days.length}日分 / no_data=${out.no_data} / ` +
      `最新データ日=${out.latest_data_date ?? 'なし'} / リクエスト${requestsUsed}回`
  );
  // 取得に失敗しても異常終了しない。windsor側の取得結果まで巻き添えでコミットされなくなるため。
  // 失敗は _summary.json と実行ログに残す。
}

await main();
