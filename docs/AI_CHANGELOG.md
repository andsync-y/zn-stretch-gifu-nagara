# AI CHANGELOG

ChatGPT CodexとClaude Code間で、変更の意図・判断・検証結果を引き継ぐための記録です。
Git履歴が「何を変更したか」、このファイルが「なぜ変更したか、次に何を確認するか」を補完します。

## 記録ルール

- 作業完了時に、既存記録を変更せず末尾へ追記します。
- 日時は日本時間（JST）で記載します。
- 「担当」「ブランチ」「関連PR」「変更内容」「主な変更ファイル」「判断・注意点」「確認結果」「未対応・次の作業」を記載します。
- 該当項目がない場合は「なし」と記載します。
- 認証情報、環境変数の値、個人情報などの秘密情報は記載しません。
- 本番反映やマージは、実際の状態を確認してから記載します。

## 追記フォーマット

```md
## YYYY-MM-DD HH:mm JST — 担当AI

- ブランチ：
- 関連PR：
- 変更内容：
- 主な変更ファイル：
- 判断・注意点：
- 確認結果：
- 未対応・次の作業：
```

---

## 2026-07-13 22:47 JST — ChatGPT Codex

- ブランチ：`codex/hero-symptom-visuals`
- 関連PR：[PR #2 メインビジュアルと症状ページの図版を刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/2)
- 変更内容：
  - 支給されたメインビジュアルをWebP化し、トップページのヒーローへ採用。
  - PCではマスク表示と微細なズーム、スマホではコピー側から施術シーンへ横断するスクロール連動演出を実装。
  - 初回60分3,300円の予約パネルをスクロール後半へ追加。
  - 悩み別7カテゴリの統一SVGアイコンを作成し、一覧ページと各詳細ページへ反映。
  - 各悩みページの発生サイクルを、5段階の円環型インフォグラフィックへ刷新。
- 主な変更ファイル：
  - `public/images/photos/hero-editorial.webp`
  - `src/pages/index.astro`
  - `src/styles/global.css`
  - `src/components/SymptomIcon.astro`
  - `src/components/SymptomCycle.astro`
  - `src/pages/symptoms/index.astro`
  - `src/layouts/SymptomLayout.astro`
- 判断・注意点：
  - 画像内にコピーが含まれるため、HTML側のH1はスクリーンリーダー向けに保持。
  - `prefers-reduced-motion` に対応し、動きを減らす設定では視差演出を停止。
  - モバイルでは横長画像を静的に切り抜かず、スクロールで左右を見せる構成。
- 確認結果：
  - `npm ci` 成功。
  - `npm run build` 成功。Astro静的ページ15件の生成を確認。
  - `git diff --check` 成功。
  - Vercelプレビューデプロイ成功。
- 未対応・次の作業：
  - PR #2はドラフト状態。デザイン確認後に指定ブランチへマージする。
  - 本番サイトはまだ更新されていない。

## 2026-07-13 22:51 JST — ChatGPT Codex

- ブランチ：`codex/hero-symptom-visuals`
- 関連PR：[PR #2 メインビジュアルと症状ページの図版を刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/2)
- 変更内容：Claude CodeとCodexが共通の変更履歴を読み書きする運用ルールを追加。
- 主な変更ファイル：
  - `CLAUDE.md`
  - `AGENTS.md`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：任意のMarkdownは自動で読まれる保証がないため、各エージェントが自動参照する指示ファイルから変更履歴を読むよう明記。
- 確認結果：`git diff --check` 成功。Markdownのみの変更のため、アプリケーションビルドは省略。
- 未対応・次の作業：PR #2のデザイン確認とマージ。

## 2026-07-13 23:32 JST — ChatGPT Codex

- ブランチ：`codex/hero-symptom-visuals`
- 関連PR：[PR #2 サイト全体をメインビジュアル基準で刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/2)
- 変更内容：
  - メインビジュアルの極太タイポグラフィと写真表現を基準に、全ページのデザインシステムを再構築。
  - ヘッダーを連番付きナビゲーションと全面モバイルメニューへ変更。
  - フッターを巨大アウトライン文字、予約導線、サイトマップを備えた構成へ変更。
  - トップのCONCEPT、METHOD、SYMPTOMS、STAFF、VOICE、SOCIAL、PRICE・ACCESSを、罫線・グリッド・大見出し・モノクロ写真中心に再構成。
  - 料金表、予約CTA、FAQ、パンくず、下層ページ見出しを共通のエディトリアルデザインへ統一。
  - 悩み別アイコンと発生サイクル図のアクセントカラーも全体トーンへ統一。
- 主な変更ファイル：
  - `tailwind.config.mjs`
  - `src/styles/global.css`
  - `src/layouts/Base.astro`
  - `src/layouts/SymptomLayout.astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `src/components/ReserveCTA.astro`
  - `src/components/PriceRows.astro`
  - `src/components/FAQ.astro`
  - `src/components/Breadcrumbs.astro`
  - `src/components/SymptomIcon.astro`
  - `src/components/SymptomCycle.astro`
  - `src/pages/index.astro` および各下層ページ
- 判断・注意点：
  - ブルーは使用しない。黒・白・グレーを主役にし、写真内のタオルから拾った低彩度のウォームトープだけを限定的な差し色として使用。
  - 英字見出しはセリフ体から極太サンセリフのArchivo Blackへ変更。
  - 角丸や装飾的な影を減らし、直線・罫線・連番・大胆な写真トリミングを共通ルールにした。
- 確認結果：
  - `git diff --check` 成功。
  - `npm run build` 成功。Astro静的ページ15件の生成を確認。
  - 旧ブルー系カラーコードと旧セリフ体指定が残っていないことを検索確認。
- 未対応・次の作業：VercelプレビューでPC・スマホの実機デザインを確認し、必要に応じて余白や画像位置を微調整してからマージする。

## 2026-07-13 23:41 JST — ChatGPT Codex

- ブランチ：`codex/hero-symptom-visuals`
- 関連PR：[PR #2 サイト全体をメインビジュアル基準で刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/2)
- 変更内容：Claude側で指定ブランチへ追加された、PC・スマホ各121枚の連番フレームとスクロールスクラブ型ヒーローを取り込み、サイト全体の新デザインと統合。
- 主な変更ファイル：
  - `public/frames/`
  - `public/frames/sm/`
  - `src/pages/index.astro`
  - `src/styles/global.css`
- 判断・注意点：
  - Claude側の最新ヒーロー演出を優先し、Codex側の旧単一画像ヒーローは置き換えた。
  - ヒーロー以降はCodex側の全体デザイン刷新を保持。
  - ヒーロー内のフォント、背景色、オファーカードの影とホバー色を、黒・白・グレー＋ウォームトープの新トーンへ調整。
- 確認結果：
  - マージ競合は `src/pages/index.astro` と `src/styles/global.css` のみで、意図を分けて手動統合。
  - `git diff --check` 成功。
  - `npm run build` 成功。Astro静的ページ15件の生成を確認。
- 未対応・次の作業：Vercelプレビューで連番スクラブの読み込み速度とスマホ表示を確認し、問題がなければPR #2をマージする。

## 2026-07-14 00:20 JST — ChatGPT Codex

- ブランチ：`codex/interactive-symptoms`
- 関連PR：[PR #4 SYMPTOMSを人体連動型UIへ刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/4)
- 変更内容：
  - 添付の `CODEX_HANDOFF.md` に沿い、トップページのSYMPTOMSを人体連動型UIへ刷新。
  - PCでは左右の症状項目と中央の透過人体を3カラムで配置し、hover・focus・clickに応じて人体の移動、赤い部位発光、SVGコネクターを同期。
  - SPでは人体と1カラム一覧へ切り替え、タップした症状の説明と既存詳細ページへの導線を展開。
  - 単一の透過人体WebPを全状態で共有し、7種類の部位マスクをSVGレイヤーとして実装。
- 主な変更ファイル：
  - `src/components/InteractiveSymptoms.astro`
  - `src/pages/index.astro`
  - `public/images/symptoms/anatomy-base.webp`
  - `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：
  - サイト全体の黒・白・グレー＋ウォームトープは維持し、赤 `#e5443f` はアクティブ症状と解剖学的フォーカスのみに限定。
  - 人体素材は約94KBの透過WebP。下層の遅延読み込みと寸法指定でCLSを抑制。
  - `prefers-reduced-motion` では移動・回転・線描画を停止。
- 確認結果：
  - `npm run build` 成功。Astro静的ページ15件の生成を確認。
  - `git diff --check` 成功。
  - 1440／1024／768／390／375pxをChromiumで確認。
  - mouse pointerenter、keyboard focus、touch click、7詳細URL、SP展開、reduced motionを確認。
- 未対応・次の作業：Vercelプレビューで実機フォント読み込み後の和文幅と、赤い部位マスクの見え方を最終確認する。

## 2026-07-14 01:05 JST — ChatGPT Codex

- ブランチ：`codex/interactive-symptoms`
- 関連PR：[PR #4 SYMPTOMSを人体連動型UIへ刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/4)
- 変更内容：
  - ユーザーフィードバックに合わせ、単一人体の回転・拡大とSVG部位マスクを廃止。
  - 添付された7状態の見本から、姿勢と該当部位ハイライトが異なる中央人体素材を作成。
  - PCのhover／focus、SPのtapに合わせ、中央画像を620msのクロスフェードで切り替える方式へ変更。
- 主な変更ファイル：
  - `src/components/InteractiveSymptoms.astro`
  - `public/images/symptoms/anatomy-*.webp`（7点）
  - `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：
  - 赤い円、コネクター、文字などは画像へ焼き込まず、人体と解剖学的ハイライトのみを素材化。
  - 画像はすべて768 × 1152pxの透過WebPへ統一し、1点約78〜102KB、7点合計約620KBに抑制。
  - アクティブ項目、詳細リンク、既存URL、PCコネクター、SP展開の仕様は維持。
- 確認結果：
  - `npm run build` 成功。Astro静的ページ15件を生成。
  - `git diff --check` 成功。
  - 1440／1024／768／390／375pxで、7画像の読み込み、アクティブ同期、レイアウト幅を確認。
  - PC hover、キーボードfocus、クリック、SP tapで画像が切り替わることを確認。
  - フェード途中に新旧画像が同時表示され、620ms後に新画像だけが不透明度1になることを確認。
  - reduced motionではフェードが180msへ短縮され、コネクター線描画が停止することを確認。
- 未対応・次の作業：Vercelプレビューでクロスフェードと各部位の見え方を確認する。

## 2026-07-14 02:25 JST — ChatGPT Codex

- ブランチ：`codex/interactive-symptoms`
- 関連PR：[PR #4 SYMPTOMSを人体連動型UIへ刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/4)
- 変更内容：
  - ユーザーフィードバックに合わせ、スケルトン表現を全面的に廃止。
  - 悩みページの参考イラストに登場するグレーヘアの男性を踏襲し、7症状の人物イラストを作成。
  - 人物はモノクロの鉛筆画調に統一し、悩み箇所だけを赤く表示。
  - PCを「左イラスト／右コンパクト一覧」の2カラムへ変更し、症状から伸びる線を削除。
  - hover／focus／tapで中央ではなく左イラストがクロスフェードする仕様へ変更。
- 主な変更ファイル：
  - `src/components/InteractiveSymptoms.astro`
  - `src/pages/index.astro`
  - `public/images/symptoms/illustration-*.webp`（7点）
  - `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：
  - セクションを明るいニュートラルグレーへ変更し、人物イラストと悩みページのトーンを統一。
  - PCでは見出しから一覧下端まで約773〜816pxとし、900px高の画面でほぼ1画面に収まるよう調整。
  - 既存の7症状ページURLと右端の詳細リンクを維持。
- 確認結果：
  - `npm run build` 成功。Astro静的ページ15件を生成。
  - `git diff --check` 成功。
  - 1440／1024／768／390／375pxで、画像読み込み、レイアウト、既存リンクを確認。
  - PC hover、キーボードfocus、クリック、SP tapで7イラストが切り替わることを確認。
  - PCの見出しから一覧下端まで約773〜816px。左イラスト／右一覧の2カラムを確認。
  - コネクター線・SVGが存在しないこと、reduced motionでフェードが160msへ短縮されることを確認。
- 未対応・次の作業：Vercelプレビューで実機フォント読み込み後の人物サイズと一覧密度を確認する。
