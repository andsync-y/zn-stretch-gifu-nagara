#!/usr/bin/env node
/**
 * Meta広告 Conversions API（CAPI）へ回数券成約をオフラインイベントとして送信する（月次）。
 *
 * 入力は2系統ある。どちらも生の電話番号・メールアドレスを扱わない（SHA256ハッシュ済みのみ）。
 *   (1) 店舗システムの来店記録から自動取得した回数券成約（顧客ID・成約日・金額）
 *       … kpi-scraper/fetch-ticket-sales.mjs が出力するJSON。TICKET_PURCHASES_FILE で渡す。
 *       これを Driveの「電話帳」phone-book.json（顧客ID → phone_hash）と突合する。
 *   (2) Driveフォルダ「32_顧客電話_マスタ」内の phone-master_YYYY-MM.json（複数月をマージ）
 *       … Cowork月次タスクがサロンボードのスクショから生成する従来の経路。
 * フォーマットの契約は docs/capi-offline-events.md を参照。
 *
 * (1)を主経路にすることで、成約の把握が自動になり、オーナーの手作業は
 * 「まだ電話帳に無い顧客IDの分だけ、電話番号を1回登録する」だけになる。
 *
 * 出力: 送信済みevent_id一覧（capi-sent.json）と実行レポート（capi-report_YYYY-MM.md）を
 *       CAPI_STATE_DIR（既定 ./capi-state）へ書く。ワークフロー側がcapi-stateブランチへコミットする。
 *       kpi-dataブランチは週次ジョブが毎回force pushで作り直すため、状態の保存先には使えない。
 *
 * 依存パッケージなし（Node 22標準のfetch/cryptoのみ）。Google認証はサービスアカウントの
 * JWT BearerグラントをOAuth2トークンエンドポイントへ直接投げて行う。
 *
 * 環境変数:
 *   GDRIVE_SA_KEY              (必須) サービスアカウントのキーJSON文字列
 *   GDRIVE_PHONE_MASTER_FOLDER_ID (任意) マスタ置き場のフォルダID
 *   TICKET_PURCHASES_FILE      (任意) 来店記録から抽出した成約JSONのパス。無ければ(2)だけで動く
 *   META_DATASET_ID            (dry_run以外で必須) イベントマネージャのデータセットID
 *   META_CAPI_ACCESS_TOKEN     (dry_run以外で必須) CAPIアクセストークン
 *   META_GRAPH_VERSION         (任意) 既定 v26.0
 *   CAPI_DRY_RUN               'true'なら送信せず件数とpayload概要をログに出すだけ
 *   CAPI_TEST_EVENT_CODE       指定時はbodyにtest_event_codeを付けて送信（テストイベントタブ用）
 *   CAPI_STATE_DIR             状態ファイルの読み書き先（既定 ./capi-state）
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SA_KEY_RAW = process.env.GDRIVE_SA_KEY || '';
const FOLDER_ID = process.env.GDRIVE_PHONE_MASTER_FOLDER_ID || '1Gsa1G7n4OHTNRcz8QW6GxSp-T52v4H3p';
const DATASET_ID = process.env.META_DATASET_ID || '';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v26.0';
const DRY_RUN = String(process.env.CAPI_DRY_RUN || '').toLowerCase() === 'true';
const TEST_EVENT_CODE = (process.env.CAPI_TEST_EVENT_CODE || '').trim();
const STATE_DIR = process.env.CAPI_STATE_DIR || 'capi-state';
const TICKET_FILE = (process.env.TICKET_PURCHASES_FILE || '').trim();

// Meta仕様: オフラインイベントはコンバージョン発生から62日以内のものだけ送信できる
const MAX_AGE_DAYS = 62;
// 1リクエストあたりのイベント数（Metaの上限は1000。余裕を持たせる）
const BATCH_SIZE = 500;
// capi-sent.json の肥大化防止。これより古いevent_idは62日窓の外なので捨てる
const STATE_RETENTION_DAYS = 400;

const NOW_MS = Date.now();
const jstDate = (ms) => new Date(ms + 9 * 3600 * 1000).toISOString().slice(0, 10);
const TODAY_JST = jstDate(NOW_MS);
const REPORT_MONTH = TODAY_JST.slice(0, 7);

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------- Google Drive

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** サービスアカウントのJWTをOAuth2トークンエンドポイントで交換し、Driveのアクセストークンを得る */
async function getGoogleAccessToken(sa) {
  const now = Math.floor(NOW_MS / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  signer.end();
  const jwt = `${header}.${claim}.${b64url(signer.sign(sa.private_key))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const body = await res.text();
  if (!res.ok) fail(`Google認証に失敗 (${res.status}): ${body.slice(0, 500)}`);
  const token = JSON.parse(body).access_token;
  if (!token) fail('Google認証のレスポンスにaccess_tokenがありません');
  return token;
}

/** フォルダ直下の phone-master_YYYY-MM.json を列挙する */
async function listMasterFiles(token) {
  const files = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, modifiedTime)',
      pageSize: '1000',
      orderBy: 'name',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    if (!res.ok) fail(`Drive files.list に失敗 (${res.status}): ${text.slice(0, 500)}`);
    const json = JSON.parse(text);
    files.push(...(json.files || []));
    pageToken = json.nextPageToken || '';
  } while (pageToken);

  return {
    masters: files.filter((f) => /^phone-master_\d{4}-\d{2}\.json$/.test(f.name)).sort((a, b) => a.name.localeCompare(b.name)),
    // 電話帳（顧客ID → phone_hash）。1ファイルに積み上げる想定だが、
    // phone-book_2026-08.json のように分割されていても読めるようにしておく
    books: files.filter((f) => /^phone-book(_[\w-]+)?\.json$/.test(f.name)).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function downloadJson(token, file) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`,
    { headers: { authorization: `Bearer ${token}` } }
  );
  const text = await res.text();
  if (!res.ok) fail(`Drive files.get に失敗 (${file.name} / ${res.status}): ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    fail(`${file.name} がJSONとして解析できません`);
  }
}

// ------------------------------------------------------------- 正規化ユーティリティ

/** YYYY-MM-DD へ正規化。'2026/8/12' '2026年8月12日' 'YYYY-MM-DDTHH:mm:ssZ' も受ける */
function normalizeDate(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const iso = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  // 存在しない日付（2026-02-31 等）を弾く
  const probe = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(probe.getTime()) || probe.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

/** 金額を数値へ。'¥132,000' '132000円' などを受ける。0以下・数値でないものはnull */
function normalizeValue(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/[¥￥,、\s円]/g, '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function normalizeHash(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(s) ? s : null;
}

/**
 * マスタ1レコードから成約リストを取り出す。
 * 正式形は purchases 配列。単発形（purchase_date / purchase_value など）にも後方互換で対応する。
 */
function extractPurchases(rec) {
  const list = Array.isArray(rec.purchases) ? rec.purchases : [];
  const out = [];
  for (const p of list) {
    out.push({
      date: normalizeDate(p.date ?? p.purchase_date ?? p.contract_date),
      value: normalizeValue(p.value ?? p.amount ?? p.price),
      content_name: String(p.content_name ?? p.item ?? '回数券').trim() || '回数券',
    });
  }
  if (out.length === 0) {
    const date = normalizeDate(rec.purchase_date ?? rec.contract_date);
    const value = normalizeValue(rec.purchase_value ?? rec.amount);
    if (date || value) {
      out.push({ date, value, content_name: String(rec.content_name ?? '回数券').trim() || '回数券' });
    }
  }
  return out;
}

/** 顧客IDの正規化。前後の空白を落とすだけ（形は店舗システム任せなので桁数を仮定しない） */
function normalizeCustomerId(raw) {
  const s = String(raw ?? '').trim();
  return s || null;
}

/**
 * 来店記録から抽出した成約JSONを読む（kpi-scraper/fetch-ticket-sales.mjs の出力）。
 * ファイル指定が無ければ空配列を返す（従来のphone-master経路だけで動く）。
 */
function readTicketPurchases() {
  if (!TICKET_FILE) return [];
  if (!fs.existsSync(TICKET_FILE)) fail(`TICKET_PURCHASES_FILE が見つかりません: ${TICKET_FILE}`);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(TICKET_FILE, 'utf8'));
  } catch (e) {
    fail(`${TICKET_FILE} がJSONとして解析できません: ${String(e).slice(0, 200)}`);
  }
  const list = Array.isArray(json) ? json : Array.isArray(json.purchases) ? json.purchases : null;
  if (!list) fail(`${TICKET_FILE} の形式が想定外です（配列、または purchases 配列を期待）`);
  return list;
}

/**
 * 電話帳（顧客ID → phone_hash）を読む。
 * 氏名は突合に使わないので、入っていても無視する（読み込まない）。
 */
function buildPhoneBook(files) {
  const map = new Map();
  let invalid = 0;
  for (const { name, json } of files) {
    const records = Array.isArray(json) ? json : Array.isArray(json.records) ? json.records : null;
    if (!records) fail(`${name} の形式が想定外です（配列、または records 配列を期待）`);
    for (const rec of records) {
      const cid = normalizeCustomerId(rec.customer_id ?? rec.customerId ?? rec.id);
      const hash = normalizeHash(rec.phone_hash);
      if (!cid || !hash) {
        invalid++;
        continue;
      }
      map.set(cid, hash);
    }
  }
  return { map, invalid };
}

// ------------------------------------------------------------------ 状態ファイル

function readSentState() {
  const p = path.join(STATE_DIR, 'capi-sent.json');
  if (!fs.existsSync(p)) return { event_ids: [] };
  try {
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    return { event_ids: Array.isArray(json.event_ids) ? json.event_ids : [] };
  } catch (e) {
    // 壊れた状態ファイルで二重送信するくらいなら止める
    fail(`capi-sent.json の読み込みに失敗: ${String(e).slice(0, 200)}`);
  }
}

/** event_id先頭のYYYYMMDDを見て古いものを捨てる（62日窓の外なのでもう送れない） */
function pruneSent(ids) {
  const cutoff = jstDate(NOW_MS - STATE_RETENTION_DAYS * 86400000).replace(/-/g, '');
  return ids.filter((id) => {
    const m = String(id).match(/^(\d{8})_/);
    return m ? m[1] >= cutoff : true;
  });
}

// ---------------------------------------------------------------------- 送信

async function postEvents(events, meta) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${DATASET_ID}/events`;
  const body = { data: events, access_token: ACCESS_TOKEN };
  if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    // レスポンスにアクセストークンは含まれないが、念のため長さを制限して出す
    fail(`Meta CAPI 送信に失敗 (batch ${meta.index}/${meta.total} / HTTP ${res.status}): ${text.slice(0, 800)}`);
  }
  console.log(`  batch ${meta.index}/${meta.total}: ${events.length}件 送信OK ${text.slice(0, 300)}`);
  return text;
}

// ------------------------------------------------------------------------ main

if (!SA_KEY_RAW) fail('GDRIVE_SA_KEY がありません');
if (!DRY_RUN) {
  if (!DATASET_ID) fail('META_DATASET_ID がありません');
  if (!ACCESS_TOKEN) fail('META_CAPI_ACCESS_TOKEN がありません');
}

let sa;
try {
  sa = JSON.parse(SA_KEY_RAW);
} catch {
  fail('GDRIVE_SA_KEY がJSONとして解析できません（キーJSONをそのまま貼り付けてください）');
}
if (!sa.client_email || !sa.private_key) fail('GDRIVE_SA_KEY に client_email / private_key がありません');

console.log(`mode: ${DRY_RUN ? 'dry_run（送信しない）' : TEST_EVENT_CODE ? `テスト送信 (test_event_code=${TEST_EVENT_CODE})` : '本送信'}`);
console.log(`graph: ${GRAPH_VERSION} / today(JST): ${TODAY_JST}`);

const gToken = await getGoogleAccessToken(sa);
const { masters: masterFiles, books: bookFiles } = await listMasterFiles(gToken);
console.log(`Drive: phone-master ${masterFiles.length}件 (${masterFiles.map((f) => f.name).join(', ') || 'なし'})`);
console.log(`Drive: phone-book ${bookFiles.length}件 (${bookFiles.map((f) => f.name).join(', ') || 'なし'})`);

// --- 来店記録から取った成約（顧客ID単位）を読む
const ticketPurchases = readTicketPurchases();
if (masterFiles.length === 0 && bookFiles.length === 0) {
  fail(
    `フォルダ ${FOLDER_ID} に phone-master_YYYY-MM.json も phone-book.json もありません（SAへの共有設定を確認）`
  );
}
if (ticketPurchases.length > 0 && bookFiles.length === 0) {
  fail(
    `来店記録から成約を ${ticketPurchases.length}件 取れましたが、Driveに電話帳 phone-book.json がありません。` +
      `顧客IDと電話番号を突合できないため送信を中止します（docs/capi-offline-events.md 参照）`
  );
}

// --- マスタをマージ。同一phone_hashは成約を合算し、同一の成約（日付・金額・商品名）は1件に畳む
const byHash = new Map(); // phone_hash -> Map<dedupKey, purchase>
const stats = {
  master_records: 0,
  invalid_hash: 0,
  no_purchase: 0,
  purchases_total: 0,
  skip_no_date: 0,
  skip_no_value: 0,
  skip_too_old: 0,
  skip_future: 0,
  merged_same_day: 0,
  skip_already_sent: 0,
  ticket_purchases: 0,
  ticket_matched: 0,
  ticket_unmatched: 0,
  ticket_invalid: 0,
  phone_book_entries: 0,
  phone_book_invalid: 0,
};

// --- (1) 来店記録の成約 × 電話帳（顧客ID → phone_hash）
const unmatchedIds = new Set();
if (ticketPurchases.length > 0) {
  const books = [];
  for (const f of bookFiles) books.push({ name: f.name, json: await downloadJson(gToken, f) });
  const { map: phoneBook, invalid } = buildPhoneBook(books);
  stats.phone_book_entries = phoneBook.size;
  stats.phone_book_invalid = invalid;
  console.log(`電話帳: ${phoneBook.size}件（顧客ID → phone_hash）/ 不正レコード ${invalid}件`);

  for (const p of ticketPurchases) {
    stats.ticket_purchases++;
    const cid = normalizeCustomerId(p.customer_id ?? p.customerId);
    const date = normalizeDate(p.date);
    const value = normalizeValue(p.value);
    if (!cid || !date || value == null) {
      stats.ticket_invalid++;
      continue;
    }
    const hash = phoneBook.get(cid);
    if (!hash) {
      // 電話番号をまだ登録していない顧客。件数だけ数え、IDは実行ログにのみ出す
      stats.ticket_unmatched++;
      unmatchedIds.add(cid);
      continue;
    }
    stats.ticket_matched++;
    if (!byHash.has(hash)) byHash.set(hash, new Map());
    const content = String(p.content_name ?? '回数券').trim() || '回数券';
    byHash.get(hash).set(`${date}|${value}|${content}`, { date, value, content_name: content });
  }
}

// --- (2) 従来のphone-master経路（成約情報を電話マスタ側に持たせる形式）
for (const file of masterFiles) {
  const json = await downloadJson(gToken, file);
  const records = Array.isArray(json) ? json : Array.isArray(json.records) ? json.records : null;
  if (!records) fail(`${file.name} の形式が想定外です（配列、または records 配列を期待）`);
  stats.master_records += records.length;

  for (const rec of records) {
    const hash = normalizeHash(rec.phone_hash);
    if (!hash) {
      stats.invalid_hash++;
      continue;
    }
    const purchases = extractPurchases(rec);
    if (purchases.length === 0) {
      stats.no_purchase++;
      continue;
    }
    if (!byHash.has(hash)) byHash.set(hash, new Map());
    const bucket = byHash.get(hash);
    for (const p of purchases) {
      stats.purchases_total++;
      // 同じ成約が複数月のマスタに載っていても1件として扱う
      bucket.set(`${p.date}|${p.value}|${p.content_name}`, p);
    }
  }
}

// --- 送信対象イベントの組み立て
const minDate = jstDate(NOW_MS - MAX_AGE_DAYS * 86400000);
const sentState = readSentState();
const sentIds = new Set(sentState.event_ids);

const eventsById = new Map(); // event_id -> event
const alreadySent = new Set(); // 同日合算されるものを二重に数えないようevent_id単位で持つ
for (const [hash, bucket] of byHash) {
  for (const p of bucket.values()) {
    if (!p.date) {
      stats.skip_no_date++;
      continue;
    }
    if (p.value == null) {
      // Purchaseイベントは value と currency が必須
      stats.skip_no_value++;
      continue;
    }
    if (p.date > TODAY_JST) {
      stats.skip_future++;
      continue;
    }
    if (p.date < minDate) {
      stats.skip_too_old++;
      continue;
    }

    const eventId = `${p.date.replace(/-/g, '')}_${hash.slice(0, 16)}`;
    if (sentIds.has(eventId)) {
      alreadySent.add(eventId);
      continue;
    }

    const existing = eventsById.get(eventId);
    if (existing) {
      // 同一顧客・同一日の複数成約はevent_idが同じになるため、金額を合算して1イベントにする
      existing.custom_data.value += p.value;
      stats.merged_same_day++;
      continue;
    }

    eventsById.set(eventId, {
      event_name: 'Purchase',
      // 日付しか分からないため、どのタイムゾーンで見ても同じ日になるJST正午を採用する
      event_time: Math.floor(new Date(`${p.date}T12:00:00+09:00`).getTime() / 1000),
      action_source: 'physical_store',
      event_id: eventId,
      user_data: { ph: [hash] },
      custom_data: { currency: 'JPY', value: p.value, content_name: p.content_name },
    });
  }
}

stats.skip_already_sent = alreadySent.size;

const events = [...eventsById.values()].sort((a, b) => a.event_time - b.event_time);
const totalValue = events.reduce((sum, e) => sum + e.custom_data.value, 0);

console.log('--- 集計 ---');
console.log(
  `来店記録の成約: ${stats.ticket_purchases}件 → 電話帳と突合できた ${stats.ticket_matched}件 / ` +
    `未登録 ${stats.ticket_unmatched}件（${unmatchedIds.size}人）/ 形式不正 ${stats.ticket_invalid}件`
);
console.log(`マスタ件数: ${stats.master_records} / 有効ハッシュなし: ${stats.invalid_hash} / 成約情報なし: ${stats.no_purchase}`);
console.log(`成約レコード（重複除去後）: ${[...byHash.values()].reduce((n, b) => n + b.size, 0)}`);
console.log(`除外 — 日付なし:${stats.skip_no_date} 金額なし:${stats.skip_no_value} 62日超:${stats.skip_too_old} 未来日:${stats.skip_future} 送信済み:${stats.skip_already_sent}`);
console.log(`同日合算: ${stats.merged_same_day}`);
console.log(`送信対象イベント: ${events.length}件 / 合計 ${totalValue.toLocaleString('ja-JP')} 円`);

// --- 電話番号が未登録の顧客IDを、実行サマリーにだけ出す。
// オーナーはこのIDを店舗システムで引けるので、氏名も電話番号も出さずに次の作業を指示できる。
// capi-state ブランチに残る capi-report_*.md には書かない（永続化を最小にするため）。
if (unmatchedIds.size > 0) {
  const ids = [...unmatchedIds].sort();
  console.log(`電話番号が未登録の顧客ID（${ids.length}人）: ${ids.join(', ')}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '## 📞 電話番号の登録が必要な顧客',
        '',
        `回数券を買ったが電話帳に無い顧客が **${ids.length}人** います。`,
        'この顧客IDを店舗システムで開いて氏名を確認し、サロンボードの顧客情報から',
        '電話番号のスクショを撮ってDrive「31_顧客電話_取込」へ入れてください（1顧客につき1回だけ）。',
        '',
        '```',
        ids.join('\n'),
        '```',
        '',
        '> 氏名・電話番号はこのサマリーにもリポジトリにも出していません。',
        '',
      ].join('\n')
    );
  }
}

// --- 送信
let sendResult;
if (events.length === 0) {
  sendResult = '送信対象なし（0件）';
  console.log(sendResult);
} else if (DRY_RUN) {
  const sample = events.slice(0, 3).map((e) => ({ ...e, user_data: { ph: ['<sha256 redacted>'] } }));
  console.log('dry_run のため送信しません。payloadサンプル（先頭3件・ハッシュは伏せ字）:');
  console.log(JSON.stringify({ data: sample }, null, 2));
  sendResult = `dry_run（${events.length}件を送信せず）`;
} else {
  const batches = [];
  for (let i = 0; i < events.length; i += BATCH_SIZE) batches.push(events.slice(i, i + BATCH_SIZE));
  console.log(`Meta CAPIへ送信: ${batches.length}バッチ`);
  for (let i = 0; i < batches.length; i++) {
    await postEvents(batches[i], { index: i + 1, total: batches.length });
  }
  sendResult = TEST_EVENT_CODE
    ? `テスト送信 完了（${events.length}件 / test_event_code=${TEST_EVENT_CODE}）`
    : `本送信 完了（${events.length}件）`;
}

// --- 状態とレポートの保存（dry_runでは何も書かない）
if (DRY_RUN) {
  console.log('dry_run のため capi-sent.json / レポートは更新しません');
  process.exit(0);
}

fs.mkdirSync(STATE_DIR, { recursive: true });

// テスト送信は本番の配信最適化には使われないが、同じevent_idを本送信で送り直せるよう
// 送信済みには記録しない
if (!TEST_EVENT_CODE) {
  const merged = pruneSent([...new Set([...sentState.event_ids, ...events.map((e) => e.event_id)])]).sort();
  fs.writeFileSync(
    path.join(STATE_DIR, 'capi-sent.json'),
    JSON.stringify({ updated_at: new Date(NOW_MS).toISOString(), count: merged.length, event_ids: merged }, null, 2) + '\n'
  );
  console.log(`capi-sent.json 更新: ${merged.length}件`);
} else {
  console.log('test_event_code 指定のため capi-sent.json は更新しません（本送信で再送できるようにするため）');
}

// レポートには氏名・電話番号・ハッシュ値を書かない（件数と理由のみ）
const report = `# Meta CAPI オフラインイベント送信レポート ${REPORT_MONTH}

- 実行日時（JST）: ${new Date(NOW_MS + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ')}
- モード: ${TEST_EVENT_CODE ? `テスト送信（test_event_code 指定）` : '本送信'}
- Graph APIバージョン: ${GRAPH_VERSION}
- 対象期間: ${minDate} 〜 ${TODAY_JST}（Meta仕様により成約から${MAX_AGE_DAYS}日以内のみ）

## 入力①：来店記録（店舗システムから自動取得）

| 項目 | 件数 |
|---|---|
| 回数券の成約 | ${stats.ticket_purchases} |
| 電話帳の登録数（顧客ID → ハッシュ） | ${stats.phone_book_entries} |
| 電話帳と突合できた成約 | ${stats.ticket_matched} |
| 電話番号が未登録で送れなかった成約 | ${stats.ticket_unmatched}（${unmatchedIds.size}人） |
| 形式不正でスキップ | ${stats.ticket_invalid} |

> 未登録の顧客IDは実行ログにのみ出しています（このレポートには残しません）。

## 入力②：電話マスタ（スクショ経由）

| 項目 | 件数 |
|---|---|
| phone-masterファイル | ${masterFiles.length} |
| マスタレコード | ${stats.master_records} |
| 有効なphone_hashなし | ${stats.invalid_hash} |
| 成約情報なし | ${stats.no_purchase} |
| 成約レコード（重複除去後） | ${[...byHash.values()].reduce((n, b) => n + b.size, 0)} |

## 除外の内訳

| 理由 | 件数 |
|---|---|
| 成約日なし | ${stats.skip_no_date} |
| 金額なし（Purchaseはvalue必須） | ${stats.skip_no_value} |
| ${MAX_AGE_DAYS}日より前の成約 | ${stats.skip_too_old} |
| 未来日付 | ${stats.skip_future} |
| 送信済み（二重送信の防止） | ${stats.skip_already_sent} |
| 同一顧客・同一日のため合算 | ${stats.merged_same_day} |

## 送信結果

- 送信イベント数: **${events.length}件**
- 合計金額: **${totalValue.toLocaleString('ja-JP')} 円**
- 結果: ${sendResult}

> このレポートには氏名・電話番号・ハッシュ値を記載しません。
`;

fs.writeFileSync(path.join(STATE_DIR, `capi-report_${REPORT_MONTH}.md`), report);
console.log(`capi-report_${REPORT_MONTH}.md 書き出し完了`);
