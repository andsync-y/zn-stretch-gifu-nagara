# SYMPTOMSインタラクション実装記録

## 実装概要

`CODEX_HANDOFF.md` の指示に沿い、トップページの「お悩み別」一覧を、人体と症状箇所が連動するインタラクティブUIへ変更した。

- PC（768px以上）：左01／03／05／07、中央に人体、右02／04／06の3カラム。
- PC操作：項目の `pointerenter` またはキーボードフォーカスでアクティブ症状を更新。
- タッチ操作：項目のクリック／タップでアクティブ症状を更新。
- SP（767px以下）：見出し、人体、01〜07の1カラム一覧の順に表示。
- SPのアクティブ項目には説明、フォーカス部位、既存詳細ページへのリンクを表示。
- 初期状態は01肩こり。
- 7種類の人体画像、項目、ACTIVE FOCUS、PCコネクターを1つの状態で同期。

## 素材

- `public/images/symptoms/anatomy-{key}.webp` 7点
  - 全素材を768 × 1152pxへ統一。1点あたり約78〜102KB、合計約620KB。
  - 添付された各状態の完成見本から、人体、姿勢、該当部位の赤いハイライトだけを組み込み画像編集で抽出。
  - ヘッダー、症状一覧、文字、矢印、コネクター、赤い円は画像に含めず、UIと装飾線はHTML／CSS／SVGで実装。
  - X線の輝度を基準にアルファ化し、セクション背景へ自然に溶け込む透過WebPへ変換。

## 状態表現

| key | 症状 | 中央画像の状態 |
| --- | --- | --- | --- |
| `shoulder` | 肩こり | 3/4背面、肩関節・僧帽筋を強調 |
| `lower-back` | 腰痛・お尻や脚の張り | 背面、腰椎・仙腸部・臀部・大腿を強調 |
| `neck-eyes` | 首こり・眼精疲労 | 頭部を傾け、眼窩・頸椎を強調 |
| `lower-legs` | むくみ・冷え | 背面、両ふくらはぎ・足首・足先を強調 |
| `whole-body` | 疲れ・睡眠 | 正面、背骨・胸郭・主要関節を弱く広く強調 |
| `upper-back` | 姿勢・猫背 | 猫背姿勢、胸椎上部・肩甲骨を強調 |
| `kinetic-chain` | スポーツケア | アスレチック姿勢、股関節・膝・足首を強調 |

中央画像は620ms、`cubic-bezier(0.22, 1, 0.36, 1)` の不透明度クロスフェードで切り替える。回転・拡大・位置移動は行わず、異なる姿勢そのものをフェードで見せる。PCコネクターはSVGの `stroke-dashoffset` で描画する。

## アクセシビリティ

- 各症状の切替は `button` を使用し、`aria-pressed` を同期。
- SPは `aria-expanded` と `aria-controls` も同期。
- 詳細ページへのリンクは既存の `SYMPTOMS` データから生成し、URLと文言を維持。
- 人体、部位ハイライト、コネクターは装飾として `aria-hidden="true"`。
- `:focus-visible` の赤いフォーカスリングを保持。
- `prefers-reduced-motion: reduce` では線描画を停止し、人体切替は180msの短いフェードにする。

## 変更ファイル

- `src/components/InteractiveSymptoms.astro`
- `src/pages/index.astro`
- `public/images/symptoms/anatomy-*.webp`（7点）
- `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
- `docs/AI_CHANGELOG.md`

## 動作確認

- `npm run build`：成功。Astro静的ページ15件を生成。
- `git diff --check`：成功。
- 既存の症状URL 7件がトップページの生成HTMLに残っていることを確認。
- Chromiumヘッドレス確認：
  - 1440px：人体領域778px、PC 3カラム、アクティブ項目・中央画像・コネクターの同期を確認。
  - 1024px：人体領域620px、PC 3カラムと同期を確認。
  - 768px：人体領域620px、PC 3カラムとクリック操作を確認。
  - 390px：人体領域554px、1カラム、タップ展開、`/symptoms/youtsu` 導線を確認。
  - 375px：人体領域533px、1カラム、タップ展開、`/symptoms/youtsu` 導線を確認。
  - `pointerenter`、キーボードフォーカス、クリック／タップで同一状態へ切り替わることを確認。
  - 7種類の中央画像が620msのクロスフェードで切り替わることを確認。
  - reduced motion時にクロスフェードが180msへ短縮され、コネクターアニメーションが停止することを確認。
- SPのページ全体 `scrollWidth` には既存の横スクロールマルキーが含まれる。今回のSYMPTOMS内では `overflow-x: clip` を設定し、意図しない横スクロールを発生させない。
