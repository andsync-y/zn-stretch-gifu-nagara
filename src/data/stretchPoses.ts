/**
 * ストレッチ挿絵ライブラリ（固定アセット）。
 *
 * キャラクターの「正」はオーナーがChatGPTで作成した設定表（scripts/assets/
 * stretch-character-ref.png ＝シート1、pose-sheet-2.png ＝シート2）。
 * 記事掲載用の画像は、その設定表を参照に scripts/gen-pose-illustrations.mjs で
 * 再生成した「文字・番号なし・キャラのみ」の512x512統一イラスト。
 *
 * 新しいポーズが必要になったら：続編シートを scripts/gen-pose-sheet.mjs で生成し、
 * オーナー合格後に gen-pose-illustrations.mjs で記事用イラスト化して追加する
 * （手順の詳細は docs/stretch-pose-library.md 参照）。
 */
export type StretchPose = {
  /** 画像パス（public/images/stretch-poses/） */
  file: string;
  /** 画像の実寸（imgタグのwidth/heightにそのまま使う） */
  width: number;
  height: number;
  /** ポーズ名（元の設定カードのタイトル） */
  name: string;
  /** 動きの説明（記事の手順はこれと矛盾しないこと） */
  desc: string;
  /** 姿勢（記事のシーンに合わせて選ぶ） */
  position: '床・座位' | '床・仰向け' | '床・四つん這い' | '立位' | '座位または立位' | '椅子・座位';
};

export const STRETCH_POSES: StretchPose[] = [
  { file: '/images/stretch-poses/pose-01.webp', width: 512, height: 512, name: '首・肩のストレッチ', desc: '首を横に倒して反対側の肩をやさしく伸ばす', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-02.webp', width: 512, height: 512, name: 'ハムストリングのストレッチ', desc: '片脚を前に伸ばして上体を前に倒し、もも裏を伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-03.webp', width: 512, height: 512, name: '股関節（開脚前屈）のストレッチ', desc: '脚を開いて上体を前に倒し、股関節まわりをゆっくり伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-04.webp', width: 512, height: 512, name: 'ふくらはぎのストレッチ（壁）', desc: '壁に手をついて片脚を後ろに引き、ふくらはぎを伸ばす', position: '立位' },
  { file: '/images/stretch-poses/pose-05.webp', width: 512, height: 512, name: '背中のストレッチ（キャット&カウ）', desc: '四つん這いで背中を丸めたり反らせて背骨をやさしく動かす', position: '床・四つん這い' },
  { file: '/images/stretch-poses/pose-06.webp', width: 512, height: 512, name: '胸・肩のストレッチ', desc: '両手を後ろで組んで肩甲骨を寄せ、胸を開き肩まわりを伸ばす', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-07.webp', width: 512, height: 512, name: 'お尻のストレッチ（ツイスト）', desc: '片脚をもう一方の膝にかけて上体をひねり、お尻の筋肉を伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-08.webp', width: 512, height: 512, name: '大腿四頭筋のストレッチ', desc: '片脚を後ろに曲げて足首を持ち、太ももの前側を伸ばす', position: '立位' },
  { file: '/images/stretch-poses/pose-09.webp', width: 512, height: 512, name: '腰回りのストレッチ（膝抱え込み）', desc: '仰向けで膝を胸に引き寄せて腰まわりをリラックスさせる', position: '床・仰向け' },
  { file: '/images/stretch-poses/pose-10.webp', width: 512, height: 512, name: '体側のストレッチ', desc: '片手を上げて体を横に倒し、脇腹をやさしく伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-11.webp', width: 512, height: 512, name: '内もものストレッチ（バタフライ）', desc: '足の裏を合わせて膝を開き、内ももを伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-12.webp', width: 512, height: 512, name: '体幹・背中のストレッチ（スレッド・ザ・ニードル）', desc: '四つん這いから片腕を反対側の下に通し、背中や体側を伸ばす', position: '床・四つん這い' },
  { file: '/images/stretch-poses/pose-13.webp', width: 512, height: 512, name: '前もものストレッチ（ランジ）', desc: '片脚を前に出して後ろ脚の付け根と前ももを伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-14.webp', width: 512, height: 512, name: '肩甲骨のストレッチ', desc: '腕を前に伸ばして背中を丸め、肩甲骨を広げる', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-15.webp', width: 512, height: 512, name: '足首のストレッチ', desc: '片脚を前に出してつま先を引き上げ、ふくらはぎと足首を伸ばす', position: '床・座位' },
  { file: '/images/stretch-poses/pose-16.webp', width: 512, height: 512, name: '全身のストレッチ（ばんざい）', desc: '両手を上に伸ばして体を大きく伸ばし、全身をリフレッシュ', position: '座位または立位' },
  { file: '/images/stretch-poses/pose-17.webp', width: 512, height: 512, name: '肩甲骨引き寄せ', desc: '椅子に浅く座り、ひじを軽く曲げて後ろへ引き肩甲骨を背骨に寄せる', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-18.webp', width: 512, height: 512, name: '首の前倒し', desc: '両手を後頭部に軽く添え、うなずくように頭を前に倒して首の後ろを伸ばす', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-19.webp', width: 512, height: 512, name: '首の回旋ストレッチ', desc: '背すじを伸ばして座り、ゆっくり真横を向いて首すじを伸ばす', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-20.webp', width: 512, height: 512, name: 'あご引きエクササイズ', desc: 'あごを水平に後ろへ引き、頭を背骨の上に戻して2秒キープ', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-21.webp', width: 512, height: 512, name: '手首・前腕のストレッチ', desc: '片腕を前に伸ばして手のひらを上に向け、反対の手で指先をやさしく引く', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-22.webp', width: 512, height: 512, name: '壁で胸を開くストレッチ', desc: '壁に前腕をつけて体をゆっくり反対へひねり、胸の前を伸ばす', position: '立位' },
  { file: '/images/stretch-poses/pose-23.webp', width: 512, height: 512, name: '脇・体側のストレッチ', desc: '椅子に座り片腕を斜め上へ伸ばし、体をやや横に倒して体側を伸ばす', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-24.webp', width: 512, height: 512, name: '首すじのストレッチ', desc: '片手を背中に回し、頭を斜め前に倒して首すじを伸ばす', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-25.webp', width: 512, height: 512, name: 'こめかみほぐし', desc: '両手の指先をこめかみに当て、やさしく円を描くようにほぐす', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-26.webp', width: 512, height: 512, name: '肩回し', desc: '両肩に指先を軽く添え、ひじで大きく円を描いて後ろ回しする', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-27.webp', width: 512, height: 512, name: '座ったままツイスト', desc: '椅子に浅く座り、椅子の背に手を添えて上体をゆっくりひねる', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-28.webp', width: 512, height: 512, name: '立って体側伸ばし', desc: '足を腰幅に開いて立ち、両手を頭上で組んで真横にゆっくり倒す', position: '立位' },
  { file: '/images/stretch-poses/pose-29.webp', width: 512, height: 512, name: '椅子で脱力前屈', desc: '椅子に浅く座り、力を抜いて上体を前に倒し腕をだらんと垂らす', position: '椅子・座位' },
  { file: '/images/stretch-poses/pose-30.webp', width: 512, height: 512, name: '深呼吸ストレッチ', desc: '片手を胸、片手をお腹に当ててゆっくり深呼吸する', position: '床・座位' },
  { file: '/images/stretch-poses/pose-31.webp', width: 512, height: 512, name: '立って肩甲骨寄せ', desc: '後ろで手を組んで腕を斜め下に伸ばし、胸を開いて肩甲骨を寄せる', position: '立位' },
  { file: '/images/stretch-poses/pose-32.webp', width: 512, height: 512, name: '足首回し', desc: '椅子に座り片脚を浮かせて足首をゆっくり回す', position: '椅子・座位' },
];
