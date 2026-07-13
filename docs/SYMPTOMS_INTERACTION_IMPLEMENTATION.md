# SYMPTOMSインタラクション実装記録

## 実装概要

`CODEX_HANDOFF.md` の指示に沿い、トップページの「お悩み別」一覧を、人体と症状箇所が連動するインタラクティブUIへ変更した。

- PC（768px以上）：左01／03／05／07、中央に人体、右02／04／06の3カラム。
- PC操作：項目の `pointerenter` またはキーボードフォーカスでアクティブ症状を更新。
- タッチ操作：項目のクリック／タップでアクティブ症状を更新。
- SP（767px以下）：見出し、人体、01〜07の1カラム一覧の順に表示。
- SPのアクティブ項目には説明、フォーカス部位、既存詳細ページへのリンクを表示。
- 初期状態は01肩こり。
- 人体、赤い部位マスク、項目、ACTIVE FOCUS、PCコネクターを1つの状態で同期。

## 素材

- `public/images/symptoms/anatomy-base.webp`
  - 921 × 1708px、透過WebP、約94KB。
  - 同一人物・同一画角を全状態で共有し、切替時の人物差を防止。
  - ChatGPTの組み込み画像生成で、添付モックをX線表現の参考として生成。
  - 生成時はフラットなクロマキー背景を指定し、ローカル処理で透過WebPへ変換。
  - 主な生成指定：全身、3/4背面、白〜グレーのX線解剖表現、単一人物、赤・文字・UI・影なし。

## 状態表現

| key | 症状 | 発光箇所 | 人体の動き |
| --- | --- | --- | --- |
| `shoulder` | 肩こり | 肩関節・僧帽筋 | 肩側へ4度回転 |
| `lower-back` | 腰痛・お尻や脚の張り | 腰椎・仙腸部・臀部・大腿後面 | 背面寄りへ5度回転 |
| `neck-eyes` | 首こり・眼精疲労 | 眼窩・頸椎 | 頭部側へ拡大、3度回転 |
| `lower-legs` | むくみ・冷え | 両ふくらはぎ・足首・足先 | 下肢が見える位置へ移動 |
| `whole-body` | 疲れ・睡眠 | 背骨・胸郭・主要関節 | 正面寄りのニュートラル表示 |
| `upper-back` | 姿勢・猫背 | 胸椎上部・肩甲骨 | 背面側へ6度回転 |
| `kinetic-chain` | スポーツケア | 股関節・膝・足首 | 下肢側へ5度回転 |

人体移動は640ms、`cubic-bezier(0.22, 1, 0.36, 1)`。赤い発光は約180ms遅れて立ち上がる。PCコネクターはSVGの `stroke-dashoffset` で描画する。連続操作では最新のCSS変数とタイマーへ置き換える。

## アクセシビリティ

- 各症状の切替は `button` を使用し、`aria-pressed` を同期。
- SPは `aria-expanded` と `aria-controls` も同期。
- 詳細ページへのリンクは既存の `SYMPTOMS` データから生成し、URLと文言を維持。
- 人体、発光、軌道、コネクターは装飾として `aria-hidden="true"`。
- `:focus-visible` の赤いフォーカスリングを保持。
- `prefers-reduced-motion: reduce` では人体の移動・回転と線描画を停止し、色と短いフェードのみ残す。

## 変更ファイル

- `src/components/InteractiveSymptoms.astro`
- `src/pages/index.astro`
- `public/images/symptoms/anatomy-base.webp`
- `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
- `docs/AI_CHANGELOG.md`

## 動作確認

- `npm run build`：成功。Astro静的ページ15件を生成。
- `git diff --check`：成功。
- 既存の症状URL 7件がトップページの生成HTMLに残っていることを確認。
- Chromiumヘッドレス確認：
  - 1440px：人体領域778px、PC 3カラム、アクティブ項目・発光・コネクターの同期を確認。
  - 1024px：人体領域620px、PC 3カラムと同期を確認。
  - 768px：人体領域620px、PC 3カラムとクリック操作を確認。
  - 390px：人体領域554px、1カラム、タップ展開、`/symptoms/youtsu` 導線を確認。
  - 375px：人体領域533px、1カラム、タップ展開、`/symptoms/youtsu` 導線を確認。
  - `pointerenter`、キーボードフォーカス、クリック／タップで同一状態へ切り替わることを確認。
  - reduced motion時に人体のtransformとコネクターアニメーションが停止することを確認。
- SPのページ全体 `scrollWidth` には既存の横スクロールマルキーが含まれる。今回のSYMPTOMS内では `overflow-x: clip` を設定し、意図しない横スクロールを発生させない。
