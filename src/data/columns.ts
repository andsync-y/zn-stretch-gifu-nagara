// ============================================================
// コラム記事一覧（単一ソース）
// /column（一覧ページ）と /content.json（SNS運用システム向け構造化データ）の
// 両方がこのファイルを参照する。
// 新しいコラムを公開したら、必ずこの配列の「先頭」に追加すること。
// ============================================================

export type ColumnEntry = {
  slug: string;
  heading: string;
  desc: string;
  /** 公開日 YYYY-MM-DD */
  date: string;
  /** 更新日 YYYY-MM-DD（未更新なら公開日と同じ） */
  updated?: string;
  /** SNS企画用のタグ（症状カテゴリ・属性など） */
  tags?: string[];
  /** 関連する症状ページのslug（内部リンク・SNS導線用） */
  relatedSymptoms?: string[];
};

export const COLUMNS: ColumnEntry[] = [
  {
    slug: 'katakori-desk-stretch',
    heading: 'デスクワークの肩こり対策｜肩甲骨をゆるめるセルフストレッチ5選',
    desc: '肩が重くなる仕組みと、仕事の合間に椅子に座ったままできる肩甲骨まわりのストレッチをご紹介。',
    date: '2026-07-14',
    tags: ['肩こり', 'デスクワーク', 'セルフストレッチ'],
    relatedSymptoms: ['katakori', 'kubi-ganseihiro', 'shisei'],
  },
  {
    slug: 'youtsu-morning-stretch',
    heading: '朝、腰が重い方へ｜股関節・お尻のセルフストレッチと座り方のコツ',
    desc: '腰と関係の深い股関節・お尻まわりのゆるめ方と、腰への負担を減らす座り方のポイントを解説。',
    date: '2026-07-14',
    tags: ['腰痛', '朝', 'セルフストレッチ'],
    relatedSymptoms: ['youtsu', 'shisei'],
  },
  {
    slug: 'golf-stretch-routine',
    heading: 'ゴルフ前後のストレッチ｜スイングを支える股関節・肩甲骨ルーティン',
    desc: 'ラウンド前のウォームアップと、翌日に張りを残しにくくするクールダウンの約5分ルーティン。',
    date: '2026-07-14',
    tags: ['ゴルフ', 'スポーツケア', 'セルフストレッチ'],
    relatedSymptoms: ['sports', 'youtsu'],
  },
];
