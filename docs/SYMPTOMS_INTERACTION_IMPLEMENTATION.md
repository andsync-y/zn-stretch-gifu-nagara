# SYMPTOMSインタラクション実装記録

## 実装概要

トップページの「お悩み別」は、固定した1枚の全身人体と7症状の赤い発光レイヤーが連動するUIとする。

- PC（768px以上）：左に固定人体、右に7項目のコンパクト一覧を配置。
- PC操作：項目の `pointerenter` またはキーボードフォーカスで発光部位を更新。
- タッチ操作：項目のクリック／タップで発光部位を更新。
- 人体画像、アングル、ポーズは症状ごとに切り替えない。
- 各行の右端に既存詳細ページへのリンクを常時表示。
- 初期状態は01肩こり。
- 人体へ伸びるコネクター線は使用しない。

## 人体素材と発光表現

- 固定人体：`public/images/symptoms/anatomy-base.webp`
  - 921 × 1708px、約96KBの透過WebP。
  - 添付見本と同じ、背面寄りの斜めアングルの全身人体。
  - 人体画像自体には赤い患部表示を焼き込まない。
- 患部表示：`InteractiveSymptoms.astro` 内のCSSレイヤー。
  - `radial-gradient`、ぼかし、`mix-blend-mode: screen` で赤い光を合成。
  - アクティブ症状に対応するレイヤーだけを表示。
  - 1.9秒周期で拡大と透明度を変え、「ぽわん」と呼吸する動きを付ける。

| key | 症状 | 発光部位 |
| --- | --- | --- |
| `shoulder` | 肩こり | 肩・僧帽筋 |
| `lower-back` | 腰痛・お尻や脚の張り | 腰・臀部 |
| `neck-eyes` | 首こり・眼精疲労 | 首・目まわり |
| `lower-legs` | むくみ・冷え | 両ふくらはぎ |
| `whole-body` | 疲れ・睡眠 | 胸部から骨盤周辺までの全身 |
| `upper-back` | 姿勢・猫背 | 上背部・肩甲骨 |
| `kinetic-chain` | スポーツケア | 肩・腰・膝の運動連鎖部位 |

## レイアウト

- PCの見出し、リード、人体・一覧下端までを約773〜816pxに収める。
- PCの人体領域は約500〜549px、一覧は約449〜477px。
- 人体は領域中央で全身が切れないよう `aspect-ratio: 921 / 1708` を維持。
- 行の高さを固定し、hoverでレイアウトが動かないようにする。
- SPは人体、一覧の順に1カラムで表示。

## アクセシビリティ

- 症状切替は `button` を使用し、`aria-pressed` を同期。
- 詳細ページへのリンクは既存の `SYMPTOMS` データから生成し、URLと文言を維持。
- 人体と患部エフェクトは装飾として `aria-hidden="true"`。
- `:focus-visible` のフォーカスリングを保持。
- `prefers-reduced-motion: reduce` では患部のパルスを停止し、静止表示する。

## 変更ファイル

- `src/components/InteractiveSymptoms.astro`
- `public/images/symptoms/anatomy-base.webp`
- `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
- `docs/AI_CHANGELOG.md`

## 動作確認

- `npm run build`
- `git diff --check`
- Chromiumヘッドレス確認：
  - 1440／1024／768px：左右2カラム、全身表示、7状態の同期。
  - 390／375px：縦構成、タップ切替、既存詳細リンク。
  - PC hover、キーボードfocus、クリック、SP tap。
  - 人体画像が1枚だけで、症状変更時に画像・ポーズが変化しないこと。
  - コネクター線およびSVGが存在しないこと。
  - reduced motion時に患部パルスが停止すること。
