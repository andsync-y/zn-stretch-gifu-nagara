# CODEX_HANDOFF 実装結果報告｜悩み別ページ「発生サイクル」画像反映

実施日: 2026-07-13
対象: 7つの悩み別詳細ページの「発生サイクル」図を、症状別のPC/SP画像へ差し替え

## 変更ファイル

| ファイル | 変更内容 |
| --- | --- |
| `src/components/SymptomCycleFigure.astro` | 新規。スラッグ→alt対応表を持ち、`picture` でPC/SP・WebP/PNGを出し分ける図コンポーネント |
| `src/layouts/SymptomLayout.astro` | 発生サイクル箇所を旧 `SymptomCycle`（HTML/SVG図）から `SymptomCycleFigure slug={slug}` に置換（2行のみ） |
| `public/images/symptoms/cycles/*.png` | 提供PNG 14点をそのまま配置（元画像として保持） |
| `public/images/symptoms/cycles/*.webp` | PNGから生成したWebP 14点（libwebp quality=90。例: katakori PC 1.8MB→123KB。日本語文字の可読性は目視確認済み） |

- 旧 `src/components/SymptomCycle.astro` はファイルとして残置（参照箇所はSymptomLayoutの1箇所のみで、置換済み。SYMPTOMS一覧のインタラクションは無変更）。
- 7ページ（`src/pages/symptoms/*.astro`）自体は一切変更なし。共通レイアウト1箇所の差し替えで、スラッグにより全ページが別画像に分岐。

## 画像配置先と対応

配置先: `public/images/symptoms/cycles/`（配信URL: `/images/symptoms/cycles/`）

| ページ | 確認URL | PC画像 | SP画像 | alt |
| --- | --- | --- | --- | --- |
| 肩こり | /symptoms/katakori | katakori-cycle-pc.webp/.png | katakori-cycle-sp.webp/.png | 肩の重さ・凝りが続くサイクル |
| 腰痛・お尻や脚の張り | /symptoms/youtsu | youtsu-cycle-pc.webp/.png | youtsu-cycle-sp.webp/.png | 腰・お尻の張りが続くサイクル |
| 首こり・眼精疲労 | /symptoms/kubi-ganseihiro | kubi-ganseihiro-cycle-pc.webp/.png | kubi-ganseihiro-cycle-sp.webp/.png | 首こり・眼精疲労が続く目ルートと首ルート |
| むくみ・冷え | /symptoms/mukumi | mukumi-cycle-pc.webp/.png | mukumi-cycle-sp.webp/.png | 脚のむくみ・冷え感が続くサイクル |
| 疲れ・睡眠 | /symptoms/jiritsu | jiritsu-cycle-pc.webp/.png | jiritsu-cycle-sp.webp/.png | 疲れが抜けにくくなるサイクル |
| 姿勢・猫背 | /symptoms/shisei | shisei-cycle-pc.webp/.png | shisei-cycle-sp.webp/.png | 猫背・巻き肩が定着するサイクル |
| スポーツケア | /symptoms/sports | sports-cycle-pc.webp/.png | sports-cycle-sp.webp/.png | 運動後の張り・動きにくさが続くサイクル |

## 実装仕様

- ブレークポイント: 既存サイトの慣例（Tailwind `sm:` = 640px、モバイルナビ切替 = 1024px）に完全一致する既存値はないため、指示どおり **767px以下をSP** とした（`(max-width: 767px)`）。
- `picture` 構成: SP用WebP → SP用PNG → PC用WebP → `img`（PC用PNG、`width=1774 height=887 loading="lazy" decoding="async"`）。図はファーストビュー外のため `lazy`。
- レイアウトシフト防止: `figure` に `aspect-ratio: 1774/887`（767px以下は `941/1672`）を設定。
- 下余白は旧図（`margin-bottom: 4rem`）と同値にし、前後セクションの見た目を維持。
- 画像内に見出し・説明文が含まれるため、レイアウト側の同一文言（cycleTitle/cycleSteps/cycleNote）は表示しない（二重表示なし）。ページ側のプロパティ定義は互換のため残置。

## 検証結果（`npm run build` 後の実ブラウザ検証: Chromium/Playwright）

7ページ × 6画面幅（1440/1024/768/767/390/375px）= 42ケースを自動検証。

| 検証条件 | 結果 |
| --- | --- |
| 7ページすべてで別々の正しい図が表示される | ✅ 42/42ケースで `currentSrc` がページスラッグと一致 |
| 768px以上でPC版、767px以下でSP版 | ✅ 1440/1024/768→PC版、767/390/375→SP版 |
| 1440/1024/768/390/375pxで画像が欠けず文字が読める | ✅ 全幅で図が可視・`object-fit: contain`（スクリーンショット目視確認済み） |
| 「疲れ・睡眠」の睡眠カットがパジャマ | ✅ 04カットがグレー長袖パジャマ（画像目視確認） |
| 「スポーツケア」全カットがスポーツウェア | ✅ 5カットすべてスポーツウェア（画像目視確認） |
| 「首こり・眼精疲労」が目/首ルートに分岐 | ✅ EYE ROUTE＋NECK ROUTEの分岐図（画像目視確認） |
| 肩こりの患部が右肩で統一 | ✅ 全カットで人物の右肩に患部表示（画像目視確認） |
| ページ本文・リンク・予約導線に差分がない | ✅ 変更前後のビルド出力を全ページ比較。差分はサイクル図ブロックと新画像のみ。悩み別以外の8ページはバイト一致 |
| 同一画面幅でPC/SP両方の大画像が読み込まれない | ✅ Networkログで確認。各幅で該当変種のWebP 1枚のみ取得（例: 1440pxでは `*-pc.webp` のみ） |
| CLS・横スクロールが発生していない | ✅ 図由来のCLSなし（aspect-ratio確保）／⚠️ 幅1024pxのみ約28pxの横スクロールを検出したが、**変更前のビルドでも同値で再現する既存事象**（料金表 `.price-first` 要素由来）であり、今回の変更とは無関係。図自体ははみ出しなし |

## 補足

- 元PNG（計26MB）はリポジトリに保持しつつ、実配信は原則WebP（計約1.5MB）。PNGはWebP非対応ブラウザ向けフォールバック。
- 幅1024pxの既存横スクロール（`.price-first`）は本タスクのスコープ外のため未修正。別途対応を推奨。
