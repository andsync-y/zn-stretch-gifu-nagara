/**
 * 店舗システムの「来店記録」CSVを読み、回数券の成約だけを取り出す。
 *
 * ブラウザ操作から切り離してあるので、そのままテストできる。
 *
 * ⚠️ 個人情報の扱い
 *   CSVには「顧客名」列が含まれるが、この関数は**顧客名を戻り値に一切含めない**。
 *   取り出すのは 来店日 / 顧客ID / 回数券の商品名 / 金額 だけ。
 *   氏名を返す変更をしないこと（呼び出し側のログ・レポートへ漏れる）。
 *
 * 2026-08-20 実物のCSVで確認した列（19列・UTF-8）:
 *   0 来店日 / 1 顧客名 / 2 顧客ID / 3 性別 / 4 年代 / 5 担当 / 6 来店種別 / 7 来店経路 /
 *   8 指名 / 9 コース / 10 延長 / 11 次回予約 / 12 回数券購入 / 13 指名チケット / 14 備考 /
 *   15 施術売上 / 16 回数券売上 / 17 指名売上 / 18 合計売上
 *
 * 「指名チケット」は**別列・別売上列**なので、`回数券購入` が空でない行だけを拾えば
 * 指名回数券（指名料のチケット）は構造的に混入しない。
 * サロンボードの売上CSVで問題になった混入は、この経路では起こらない。
 */

/** cp932(Shift_JIS)とUTF-8を自動判定してテキスト化する */
export function decodeCsv(buf) {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  // UTF-8として不正なバイトがあれば置換文字が入る。1つでもあれば cp932 とみなす
  const bad = (utf8.match(/�/g) || []).length;
  if (bad === 0) return { text: utf8.replace(/^﻿/, ''), encoding: 'utf-8' };
  try {
    return { text: new TextDecoder('shift_jis').decode(buf), encoding: 'shift_jis(cp932)' };
  } catch {
    return { text: utf8, encoding: `utf-8（置換${bad}文字・要確認）` };
  }
}

/** CSVパース（引用符つきフィールド・フィールド内の改行に対応） */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ''));
}

/** YYYY-MM-DD へ正規化。'2026/8/1' '2026年8月1日' も受ける。不正ならnull */
export function normalizeDate(raw) {
  const m = String(raw ?? '').trim().match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const probe = new Date(`${iso}T00:00:00Z`);
  // 2026-02-31 のような存在しない日付を弾く
  return Number.isNaN(probe.getTime()) || probe.toISOString().slice(0, 10) !== iso ? null : iso;
}

/** 金額を数値へ。'¥132,000' '132000円' も受ける。0以下・数値でないものはnull */
export function normalizeValue(raw) {
  const s = String(raw ?? '')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[¥￥,、\s円]/g, '');
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** ヘッダ行から必要な列の位置を求める。1つでも欠けていたら例外（推測で進めない） */
export function locateColumns(header) {
  const find = (re, label) => {
    const i = header.findIndex((h) => re.test(String(h).trim()));
    if (i < 0) throw new Error(`来店記録CSVに「${label}」列がありません（列: ${header.join(' / ')}）`);
    return i;
  };
  return {
    date: find(/^来店日$/, '来店日'),
    customerId: find(/^顧客ID$/, '顧客ID'),
    ticket: find(/^回数券購入$/, '回数券購入'),
    ticketSales: find(/^回数券売上$/, '回数券売上'),
  };
}

/**
 * 来店記録CSVの行配列（1行目=ヘッダ）から回数券の成約を取り出す。
 * 戻り値の purchases に顧客名は含まれない。
 */
export function extractTicketPurchases(rows) {
  const header = rows[0] || [];
  const col = locateColumns(header);
  const stats = { rows: 0, ticket_rows: 0, skip_no_customer_id: 0, skip_no_date: 0, skip_no_value: 0 };
  const purchases = [];

  for (const r of rows.slice(1)) {
    stats.rows++;
    const item = String(r[col.ticket] ?? '').trim();
    if (!item) continue; // 回数券を買っていない来店
    stats.ticket_rows++;

    const date = normalizeDate(r[col.date]);
    const customerId = String(r[col.customerId] ?? '').trim();
    const value = normalizeValue(r[col.ticketSales]);

    if (!customerId) { stats.skip_no_customer_id++; continue; }
    if (!date) { stats.skip_no_date++; continue; }
    // Purchaseイベントは value + currency が必須。金額が読めない行は送れない
    if (value == null) { stats.skip_no_value++; continue; }

    purchases.push({ customer_id: customerId, date, value, content_name: item });
  }
  return { purchases, stats };
}

/**
 * 適用できた期間の集合が [from, to] を覆っているかを判定する。
 * 画面の期間プリセット（今年・前年）を順に当てていくため、覆えたかどうかを毎回確かめる。
 * 覆えていない残りを返す（null なら十分に覆えている）。
 *
 * 期間が足りないまま少ない件数を送ると、Metaに「成約が減った」と誤って学習させてしまう。
 * 数字を作らないために、呼び出し側はnull以外なら失敗させること。
 */
export function uncoveredRange(applied, from, to) {
  const nextDay = (d) => new Date(new Date(`${d}T00:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10);
  let cursor = from;
  for (const r of [...applied].sort((a, b) => (a.from < b.from ? -1 : 1))) {
    if (r.from > cursor) break; // 隙間があるのでここで打ち切り
    if (r.to >= cursor) cursor = nextDay(r.to);
    if (cursor > to) return null;
  }
  return cursor <= to ? { from: cursor, to } : null;
}

/**
 * 指定日の「先月1日」を返す。
 * 来店記録の期間プリセットは「先月」「今月」が確実に効くので、この2つで覆える範囲を
 * 「必ず取得できる期間」として扱う。毎月動かせば前回の範囲と必ず重なり、取りこぼさない。
 */
export function firstOfLastMonth(today) {
  const [y, m] = today.split('-').map(Number);
  const year = m === 1 ? y - 1 : y;
  const month = m === 1 ? 12 : m - 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/** 同一の成約（顧客ID・日付・金額・商品名が同じ）を1件に畳む。複数回ダウンロードした分の重複対策 */
export function dedupePurchases(list) {
  const byKey = new Map();
  for (const p of list) byKey.set(`${p.customer_id}|${p.date}|${p.value}|${p.content_name}`, p);
  return [...byKey.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
