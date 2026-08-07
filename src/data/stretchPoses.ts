/**
 * ストレッチ挿絵ライブラリ（固定アセット）。
 *
 * オーナーがChatGPTで作成した公式キャラクター設定表（16ポーズ・1枚絵）を
 * そのまま16分割した画像。キャラクターの見た目はこのChatGPT生成物が「正」であり、
 * コラム記事はここから選んで使う（APIで新規生成しない。生成では画風が再現できないため）。
 *
 * 新しいポーズが必要になったら：オーナーがChatGPTで同キャラの追加ポーズを生成し、
 * ここに画像とエントリを追加する（運用メモ: docs/AI_CHANGELOG.md 2026-08-07 参照）。
 *
 * 各画像はタイトル・手順テキストを含む「説明カード」形式（313x313px）。
 */
export type StretchPose = {
  /** 画像パス（public/images/stretch-poses/） */
  file: string;
  /** 画像の実寸（imgタグのwidth/heightにそのまま使う） */
  width: number;
  height: number;
  /** カードに書かれているタイトル */
  name: string;
  /** カードに書かれている手順（記事の手順はこれと矛盾しないこと） */
  desc: string;
  /** 姿勢（記事のシーンに合わせて選ぶ） */
  position: '床・座位' | '床・仰向け' | '床・四つん這い' | '立位' | '座位または立位';
};

export const STRETCH_POSES: StretchPose[] = [
  { file: '/images/stretch-poses/pose-01.webp', width: 313, height: 366, name: '首・肩のストレッチ', desc: '首を横に倒して反対側の肩をやさしく伸ばす', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-02.webp', width: 312, height: 366, name: 'ハムストリングのストレッチ', desc: '片脚を前に伸ばして上体を前に倒し、もも裏を伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-03.webp', width: 313, height: 366, name: '股関節（開脚前屈）のストレッチ', desc: '脚を開いて上体を前に倒し、股関節まわりをゆっくり伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-04.webp', width: 316, height: 366, name: 'ふくらはぎのストレッチ（壁）', desc: '壁に手をついて片脚を後ろに引き、ふくらはぎを伸ばす', position: '立位' },
  { file: '/images/stretch-poses/pose-05.webp', width: 313, height: 343, name: '背中のストレッチ（キャット&カウ）', desc: '四つん這いで背中を丸めたり反らせて背骨をやさしく動かす', position: '床・四つん這い' },
  { file: '/images/stretch-poses/pose-06.webp', width: 312, height: 343, name: '胸・肩のストレッチ', desc: '両手を後ろで組んで肩甲骨を寄せ、胸を開き肩まわりを伸ばす', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-07.webp', width: 313, height: 343, name: 'お尻のストレッチ（ツイスト）', desc: '片脚をもう一方の膝にかけて上体をひねり、お尻の筋肉を伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-08.webp', width: 316, height: 343, name: '大腿四頭筋のストレッチ', desc: '片脚を後ろに曲げて足首を持ち、太ももの前側を伸ばす', position: '立位' },
  { file: '/images/stretch-poses/pose-09.webp', width: 313, height: 291, name: '腰回りのストレッチ（膝抱え込み）', desc: '仰向けで膝を胸に引き寄せて腰まわりをリラックスさせる', position: '床・仰向け' },
  { file: '/images/stretch-poses/pose-10.webp', width: 312, height: 291, name: '体側のストレッチ', desc: '片手を上げて体を横に倒し、脇腹をやさしく伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-11.webp', width: 313, height: 291, name: '内もものストレッチ（バタフライ）', desc: '足の裏を合わせて膝を開き、内ももを伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-12.webp', width: 316, height: 291, name: '体幹・背中のストレッチ（スレッド・ザ・ニードル）', desc: '四つん這いから片腕を反対側の下に通し、背中や体側を伸ばす', position: '床・四つん這い' },
  { file: '/images/stretch-poses/pose-13.webp', width: 313, height: 254, name: '前もものストレッチ（ランジ）', desc: '片脚を前に出して後ろ脚の付け根と前ももを伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-14.webp', width: 312, height: 254, name: '肩甲骨のストレッチ', desc: '腕を前に伸ばして背中を丸め、肩甲骨を広げる', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-15.webp', width: 313, height: 254, name: '足首のストレッチ', desc: '片脚を前に出してつま先を引き上げ、ふくらはぎと足首を伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-16.webp', width: 316, height: 254, name: '全身のストレッチ（ばんざい）', desc: '両手を上に伸ばして体を大きく伸ばし、全身をリフレッシュ', position: '座位または立位' },
];
