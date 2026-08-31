/**
 * 予約通知メールから「ネット予約の実数」を日別に出す。
 *
 *   node scripts/booking-count.mjs <mails.json> [--from 2026-08-24] [--to 2026-08-31] [--json]
 *
 * 入力は Gmail から吸い出した配列。1要素につき最低限 `subject` と `plaintextBody` があればよい。
 *   [{ "subject": "【当日】予約連絡", "plaintextBody": "全力ストレッチ..." }, ...]
 *
 * ■ Gmailからの取り出し方
 * Actions からは個人Gmailを読めない（Workload Identity が使えない）ため、
 * 対話セッションのGmailコネクタで `from:salonboard.com after:YYYY/MM/DD` を引き、
 * 各メールを PLAIN_TEXT で取得して上のJSONに落とす。
 * **件名で絞らないこと。**「直前予約が入りました」が落ちる（2026-08-31 に実際にやった間違い）。
 *
 * ■ 個人情報
 * 入力JSONには氏名が含まれる。**リポジトリにコミットしないこと**（`tmp-` 始まりは .gitignore 済み）。
 * このスクリプトの出力に氏名は入らない。
 */

import { readFileSync } from 'node:fs';
import { summarize } from './lib/booking-emails.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
};

if (!file) {
  console.error('使い方: node scripts/booking-count.mjs <mails.json> [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--json]');
  process.exit(2);
}

let mails;
try {
  mails = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`入力を読めませんでした: ${file}\n${e.message}`);
  process.exit(2);
}
if (!Array.isArray(mails)) {
  // Gmailの検索結果をそのまま貼ったときによくある形を拾う
  mails = mails.threads?.flatMap((t) => t.messages ?? []) ?? mails.messages ?? null;
  if (!Array.isArray(mails)) {
    console.error('入力は配列（またはthreads/messagesを持つオブジェクト）である必要があります');
    process.exit(2);
  }
}

const result = summarize(mails, { from: opt('from'), to: opt('to') });

if (args.includes('--json')) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const { rows, total, notes } = result;
console.log('受付日        予約  取り直し  純予約  うち初回  キャンセル');
for (const r of rows) {
  console.log(
    `${r.date}  ${String(r.bookings).padStart(4)}  ${String(r.rebookings).padStart(8)}  ` +
      `${String(r.net).padStart(6)}  ${String(r.firstVisit).padStart(8)}  ${String(r.cancels).padStart(10)}`,
  );
}
console.log('─'.repeat(58));
console.log(
  `合計          ${String(total.bookings).padStart(4)}  ${String(total.rebookings).padStart(8)}  ` +
    `${String(total.net).padStart(6)}  ${String(total.firstVisit).padStart(8)}  ${String(total.cancels).padStart(10)}`,
);

console.log('');
console.log(`⚠️ ${notes.warning}`);
if (notes.duplicateReservationIdsDropped > 0) {
  console.log(`・同一予約番号の重複通知を ${notes.duplicateReservationIdsDropped} 件畳みました`);
}
if (notes.bookingsWithoutAcceptedDate > 0) {
  console.log(`・受付日時を読めなかった予約が ${notes.bookingsWithoutAcceptedDate} 件あり、日別集計から外れています`);
}
console.log(`・解析できたメール ${notes.parsedMails} 通`);
