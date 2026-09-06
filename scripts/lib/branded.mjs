/**
 * 検索クエリが指名検索（ブランド名を含む）かどうかを判定する。
 *
 * なぜ自前で持つか:
 *   Windsorの `branded_vs_nonbranded` は**全件 "nonbranded" を返していた**（2026-08-27に確認）。
 *   「全力ストレッチ」という完全な指名検索まで nonbranded 扱いで、指標として使えていなかった。
 *   指名 / 非指名の切り分けはSEOの評価軸そのもの（指名が伸びても新規開拓にはならない）なので、
 *   ここで正しく判定する。
 */

/** 判定前の正規化。全角英数を半角へ、空白と中黒を落とし、小文字化する */
export function normalizeQuery(q) {
  return String(q)
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s　・･]/g, '')
    .toLowerCase();
}

/** 正規化後の文字列に含まれていれば指名検索とみなす語 */
export const BRAND_TERMS = [
  '全力ストレッチ',
  '全力すとれっち',
  'ぜんりょくストレッチ',
  'ぜんりょくすとれっち',
  'zenryoku',
  'znstretch',
  'zn-stretch',
];

export function isBranded(query) {
  const n = normalizeQuery(query);
  return BRAND_TERMS.some((t) => n.includes(normalizeQuery(t)));
}

/** Windsorが返していた文字列に合わせる（既存の分析コードがこの値で分岐しているため） */
export function brandedLabel(query) {
  return isBranded(query) ? 'branded' : 'nonbranded';
}
