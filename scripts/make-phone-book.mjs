#!/usr/bin/env node
/**
 * 電話帳 phone-book.json（顧客ID → 電話番号のSHA256）を作る／追記する。
 *
 * Meta CAPIへ送れるのはハッシュ化済みの電話番号だけなので、生の番号をどこにも残さずに
 * 対応表を作るためのツール。**手元のPCで動かす前提**で、リポジトリにもDriveにも
 * 生の番号を置かない。
 *
 * 使い方:
 *   node scripts/make-phone-book.mjs 入力.csv [既存のphone-book.json]
 *
 * 入力ファイル（CSV / TSV どちらでも可）:
 *   顧客ID,電話番号
 *   10000001,090-1234-5678
 *   10000002,09087654321
 *   ※ 見出し行はあってもなくてもよい。列の順番は「顧客ID, 電話番号」
 *
 * 出力:
 *   phone-book.json をカレントディレクトリに書く。これをDriveの
 *   「32_顧客電話_マスタ」へアップロードする。
 *   標準出力には**件数と行番号しか出さない**（電話番号・顧客IDは出さない）。
 *
 * ⚠️ 入力ファイルは作業が済んだら消すこと。リポジトリには絶対に置かない
 *    （.gitignore で phone-*.csv / phone-book.json を無視している）。
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

const [, , inputPath, existingPath] = process.argv;
if (!inputPath) {
  console.error('使い方: node scripts/make-phone-book.mjs 入力.csv [既存のphone-book.json]');
  process.exit(1);
}
if (!fs.existsSync(inputPath)) {
  console.error(`ERROR: 入力ファイルが見つかりません: ${inputPath}`);
  process.exit(1);
}

/** 全角数字を半角にし、数字だけ残す */
const digits = (s) =>
  String(s)
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, '');

/**
 * Metaの仕様に合わせて国番号つきの形に正規化する。
 * 日本の番号は先頭の0を落として81を付ける（090-1234-5678 → 819012345678）。
 */
function normalizePhone(raw) {
  const d = digits(raw);
  if (!d) return null;
  if (d.startsWith('81')) {
    const rest = d.slice(2);
    // 81のあとが0で始まるのは市外局番の0が残っている形。落とす
    const body = rest.startsWith('0') ? rest.slice(1) : rest;
    return body.length >= 9 && body.length <= 10 ? `81${body}` : null;
  }
  if (d.startsWith('0')) {
    const body = d.slice(1);
    return body.length >= 9 && body.length <= 10 ? `81${body}` : null;
  }
  // 0でも81でも始まらない＝桁が欠けている等。推測で直さない
  return null;
}

const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

/** カンマ区切り・タブ区切りのどちらも読む（引用符つきフィールドに対応） */
function parseRows(text) {
  const sep = text.includes('\t') && !text.includes(',') ? '\t' : ',';
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

// --- 既存の電話帳を読み込んで追記する（すでに登録済みの顧客を消さない）
const book = new Map();
if (existingPath) {
  if (!fs.existsSync(existingPath)) {
    console.error(`ERROR: 既存の電話帳が見つかりません: ${existingPath}`);
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  const records = Array.isArray(json) ? json : json.records || [];
  for (const r of records) {
    const id = String(r.customer_id ?? '').trim();
    const h = String(r.phone_hash ?? '').trim().toLowerCase();
    if (id && /^[0-9a-f]{64}$/.test(h)) book.set(id, h);
  }
  console.log(`既存の電話帳: ${book.size}件を読み込みました`);
}
const before = book.size;

// --- 入力を1行ずつ処理する
let buf = fs.readFileSync(inputPath);
// Excelから出したCSVはcp932のことがある
let text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
if ((text.match(/�/g) || []).length > 0) text = new TextDecoder('shift_jis').decode(buf);

const rows = parseRows(text.replace(/^﻿/, ''));
const skipped = { header: 0, no_id: [], bad_phone: [] };
let updated = 0;

rows.forEach((cols, i) => {
  const lineNo = i + 1;
  const id = String(cols[0] ?? '').trim();
  const phone = String(cols[1] ?? '').trim();

  // 見出し行は黙って飛ばす
  if (/顧客|ID|id|電話|TEL/i.test(id) && !/^\d+$/.test(id)) { skipped.header++; return; }
  if (!id) { skipped.no_id.push(lineNo); return; }

  const normalized = normalizePhone(phone);
  if (!normalized) { skipped.bad_phone.push(lineNo); return; }

  const hash = sha256(normalized);
  if (book.get(id) !== hash) updated++;
  book.set(id, hash);
});

// --- 書き出し
const records = [...book.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([customer_id, phone_hash]) => ({ customer_id, phone_hash }));

fs.writeFileSync(
  'phone-book.json',
  JSON.stringify({ note: '顧客ID → 電話番号のSHA256。生の電話番号は含まない。', records }, null, 2) + '\n'
);

// --- 報告（電話番号も顧客IDも出さない。出すのは件数と行番号だけ）
console.log('---');
console.log(`読み込んだ行: ${rows.length}（うち見出し ${skipped.header}）`);
console.log(`登録・更新: ${updated}件`);
if (skipped.no_id.length) console.log(`顧客IDが空でスキップ: ${skipped.no_id.length}行（行番号 ${skipped.no_id.join(', ')}）`);
if (skipped.bad_phone.length) {
  console.log(`電話番号が読めずスキップ: ${skipped.bad_phone.length}行（行番号 ${skipped.bad_phone.join(', ')}）`);
  console.log('  → 桁数が足りないか、国内の番号の形になっていません。推測で埋めていません');
}
console.log(`phone-book.json を書き出しました: 合計 ${records.length}件（前回から +${records.length - before}）`);
console.log('このファイルをDriveの「32_顧客電話_マスタ」へアップロードしてください。');
console.log('入力に使ったCSVは、済んだら削除してください。');
