/**
 * 薬機法・景表法のNG表現（文脈を問わず出たら落とす断定・保証系）。
 *
 * コラムの品質GATE（lint-column.mjs）とGBP投稿ドラフト生成（gbp-post-draft.mjs）の
 * 両方が同じ基準で判定できるよう、ここを唯一の定義元にしている。
 * 言い換え表は docs/yakkihou-ng-ok.md を参照。
 */
export const NG_PATTERNS = [
  /治る|治り(ます|やすい)|治療/,
  /効果があ(る|り)/,
  /改善(します|しました|されます|できます)/,
  /解消/,
  /矯正/,
  /効く|効きます/,
  /完治|即効/,
  /No\.?1|ナンバーワン/,
  /絶対(に)?(良く|治|改善|安全)/,
  /必ず(良く|治|改善|効)/,
  /根本(から)?改善/,
];

/** テキストに含まれるNG表現をすべて返す（無ければ空配列） */
export function findNg(text) {
  const hits = [];
  for (const re of NG_PATTERNS) {
    const m = String(text).match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}
