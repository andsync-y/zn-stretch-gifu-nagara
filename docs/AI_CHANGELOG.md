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

## 2026-07-14 02:15 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：[PR #5 ヒーロー動画を8秒版（193フレーム）に差し替え](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/5)（マージ済み・本番反映済み）
- 変更内容：
  - TOPヒーローのスクラブ素材を新しい8秒版動画（1920×1080・24fps）由来の193フレームへ差し替え。
  - `public/frames/`（PC用1920px）と `public/frames/sm/`（SP用960px）を全再生成。
  - `FRAME_COUNT` を121→193へ更新し、スクロール距離を420vh（SP 360svh）へ拡大。
  - 元動画を `assets/hero-source-v3.mp4` として保管。
  - Codex側PR #2（サイト全体刷新）とのマージ競合（`global.css` のヒーロー高さ・背景色）を手動解消。背景トーンはCodex側の `#f7f7f4` を採用し、canvas描画色も同色へ統一。
- 主な変更ファイル：
  - `public/frames/`／`public/frames/sm/`
  - `src/pages/index.astro`
  - `src/styles/global.css`
  - `assets/hero-source-v3.mp4`
- 判断・注意点：
  - 動画の4Kアップスケール（Higgsfield）は無料プラン・クレジット不足のため未実施。動画はHiggsfieldへ取り込み済みで、クレジット確保後に再実行可能。
  - PC初回訪問時のフレーム総量は約29MB。体感が重い場合は品質調整で半減可能。
- 確認結果：`npm run build` 成功。Chromium実機検証でPC/SPともスクラブ再生・オファーカード出現を確認。マージはGitHub上で完了し、Vercel自動デプロイまで確認依頼済み。
- 未対応・次の作業：4Kアップスケール（クレジット確保後）、フレーム容量の最適化検討。

## 2026-07-14 02:45 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：[PR #6 悩み別7ページの発生サイクル図を症状別のPC/SP画像に差し替え](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/6)
- 変更内容：
  - CODEX_HANDOFF.md（ZIP受領）の指示に基づき、悩み別7ページの「発生サイクル」図を症状別のPC/SP画像14点へ差し替え。
  - `SymptomCycleFigure.astro` を新規作成し、`SymptomLayout.astro` の旧 `SymptomCycle`（HTML/SVG共通図）参照をスラッグ分岐の `picture` へ置換。7ページのファイル自体は無変更。
  - 提供PNGを `public/images/symptoms/cycles/` に保持し、配信用WebP（quality=90）を生成。767px以下でSP版へ切替。
  - 検証結果を `CODEX_HANDOFF_RESULT.md` に記録。
- 主な変更ファイル：
  - `src/components/SymptomCycleFigure.astro`（新規）
  - `src/layouts/SymptomLayout.astro`
  - `public/images/symptoms/cycles/`（PNG+WebP 28点）
  - `CODEX_HANDOFF_RESULT.md`（新規）
- 判断・注意点：
  - 旧 `SymptomCycle.astro` は参照ゼロだが、SYMPTOMS一覧インタラクションへの影響を避けるためファイルは残置。
  - 図の下余白は旧図と同じ4remを維持。alt はハンドオフ指定文言。画像内テキストとの二重表示なし。
  - 幅1024pxの横スクロール（約28px）は変更前から存在する既存事象（`PriceRows` の `.price-first` 由来）で本件スコープ外・未修正。要別途対応。
- 確認結果：`npm run build` 成功。7ページ×6幅=42ケースのChromium自動検証で全合格。ビルド出力の前後比較で差分はサイクル図ブロックと新画像のみ。
- 未対応・次の作業：PR #6のマージと本番確認、`.price-first` の1024px横はみ出し修正。

## 2026-07-14 03:20 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：発生サイクル図のsr-onlyテキスト追加（PR番号はマージ時に確定）
- 変更内容：
  - 発生サイクル図（画像）のステップ文言を、SEO・アクセシビリティのため `sr-only` の `figcaption`（ol＋注記）としてDOMにも出力。
  - 7ページの `cycleTitle` / `cycleSteps` / `cycleNote` を新画像の実文言に一致するよう更新（首こり・眼精疲労は目ルート/首ルートの分岐を反映）。
  - `SymptomCycleFigure.astro` に `steps` / `note` プロパティを追加し、`SymptomLayout.astro` から受け渡し。
- 主な変更ファイル：
  - `src/components/SymptomCycleFigure.astro`
  - `src/layouts/SymptomLayout.astro`
  - `src/pages/symptoms/*.astro`（7ページの文言データのみ）
- 判断・注意点：
  - 視覚上の二重表示はなし（figcaptionは1×1pxのsr-only）。altと同文言の重複を避けるため、figcaptionにはタイトルを含めずステップ＋注記のみ。
  - 文言は必ず画像内の実文言と同期させること（画像を差し替えたらcycleStepsも更新する）。
- 確認結果：`npm run build` 成功。Chromiumでfigcaptionが視覚非表示かつDOMに存在すること、図の表示サイズに変化がないことを確認。
- 未対応・次の作業：`.price-first` の1024px横はみ出し修正、ヒーロー動画の4Kアップスケール（クレジット確保後）。

## 2026-07-14 03:30 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーロー動画を正しい新素材（もっと動ける軽い身体へ・7秒169フレーム）に差し替え
- 変更内容：
  - 前回差し替えた8秒版は旧動画と同じ見た目の別尺版だったことが判明（ユーザーの添付ファイル取り違え）。正しい新素材（キャッチコピー「もっと動ける 軽い身体へ。」・施術ベッドの新カット入り・1920×1080・24fps・約7秒）で `public/frames/`（169枚）と `public/frames/sm/` を再生成。
  - `FRAME_COUNT` を193→169に更新。ヒーローのalt・sr-only h1のキャッチコピーを新文言「もっと動ける、軽い身体へ。」に同期。
  - 元動画を `assets/hero-source-v4.mp4` として保管。
- 主な変更ファイル：
  - `public/frames/`／`public/frames/sm/`
  - `src/pages/index.astro`
  - `assets/hero-source-v4.mp4`
- 判断・注意点：フレームのファイル名は旧版と同一のため、確認時はブラウザキャッシュに注意（スーパーリロード推奨）。新版の判定は `/frames/frame_0169.jpg` が存在し `/frames/frame_0170.jpg` が404になること。
- 確認結果：`npm run build` 成功。Chromium実機検証でPC/SPともに新キャッチコピーの表示・スクラブ再生・オファーカード出現を確認。
- 未対応・次の作業：4Kアップスケール（Higgsfieldクレジット確保後）、`.price-first` の1024px横はみ出し修正。

## 2026-07-14 04:00 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヘッダーの透過＋背景連動の反転配色化と、SPハンバーガーメニュー不具合の修正
- 変更内容：
  - 【バグ修正】SPハンバーガーメニューが開かない問題を修正。原因はヘッダーの `backdrop-filter: blur(16px)`。CSS仕様によりfixed配置の子要素（`.mobile-menu`）の基準ボックスがヘッダーになり、高さ0で描画されていた。blur撤去＋メニューをヘッダー要素の外に移動して解消。
  - 【デザイン】ヘッダーを背景なし（透過）にし、スクロールに応じてヘッダー直下の背景色をサンプリング（`elementsFromPoint`＋背景色の輝度判定、rAFスロットリング）。暗い背景では `.is-inverted` を付与し、ロゴ（invertフィルタ）・ナビ文字を白へ、ご予約/MENUボタンは白ベタ＋黒文字へ反転。
  - `mix-blend-mode: difference` 方式はChromiumのsticky合成でヘッダー描画位置がずれるバグを確認したため不採用（コードコメントに理由を明記）。
- 主な変更ファイル：
  - `src/components/Header.astro`
- 判断・注意点：
  - ヘッダーに `filter` / `backdrop-filter` を追加しないこと（メニュー不具合が再発する）。
  - モバイルメニューはヘッダーの兄弟要素（z-index 49）として配置。開閉ボタンはヘッダー（z-index 50）側。
- 確認結果：`npm run build` 成功。Chromium検証で、SPメニューの開閉（タッチ・スクロール後含む）、明背景での黒文字表示、暗背景（SYMPTOMSセクション）での白反転をPC/SPともに確認。
- 未対応・次の作業：`.price-first` の1024px横はみ出し修正、4Kアップスケール（クレジット確保後）。

## 2026-07-14 04:30 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：MVをPC/SP別動画（コピーなし素材）に差し替え、キャッチコピーをテキストアニメーション化
- 変更内容：
  - キャッチコピー抜きで制作されたPC版（1920×1080・24fps・169枚）とSP版（1080×1920縦・30fps）の2本の動画からフレームを抽出し、MVをデバイス別素材に刷新。
  - SP版はモバイル向けに幅720px・15fps（106枚・約5.5MB）へ最適化し、`public/frames/sp/` に配置。旧 `public/frames/sm/`（PC素材の縮小版）は廃止。
  - キャッチコピー「もっと動ける、軽い身体へ。」をHTMLテキスト（可視のh1）として実装し、行マスクのステップイン→サブコピーのフェードアップのテキストアニメーションを追加。スクロール開始でコピーはフェードアウト。
  - h1が可視テキストになったためSEO・アクセシビリティも改善。`prefers-reduced-motion` 時はアニメーションなしで静的表示。
  - canvas描画はPC=横/SP=縦で画面向きと一致するため常にcover中央配置に簡素化。フォールバック画像もpictureでPC/SP出し分け。
  - 元動画を `assets/hero-source-v5-pc.mp4` / `assets/hero-source-v5-sp.mp4` として保管（v3は削除）。
- 主な変更ファイル：
  - `public/frames/`（PC 169枚）／`public/frames/sp/`（SP 106枚・新設）
  - `src/pages/index.astro`
  - `src/styles/global.css`
  - `assets/hero-source-v5-pc.mp4`／`assets/hero-source-v5-sp.mp4`
- 判断・注意点：
  - フレーム枚数はPC/SPで異なる（169/106）。スクリプトの `cfg` で分岐しているため、素材差し替え時は両方のcountを更新すること。
  - コピーの白帯（背景 rgba(248,248,245,0.9)）は動画のどのカット上でも可読性を確保するための設計。
- 確認結果：`npm run build` 成功。Chromium検証でPC/SPともに専用フレームのみが読み込まれること（相互の誤読込なし）、テキストアニメーション、スクロール時のフェードアウト、オファーカード出現を確認。
- 未対応・次の作業：`.price-first` の1024px横はみ出し修正、4Kアップスケール（クレジット確保後）。

## 2026-07-14 04:45 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：キャッチコピーを添付デザイン準拠（背景なし・2行目大）に変更
- 変更内容：
  - キャッチコピーの白帯背景を撤去し、素のテキスト表示に変更（可読性保険として淡いtext-shadowのみ）。
  - 添付デザインに合わせ、1行目「もっと動ける」（読点なし・約0.7倍・右に0.32emずらし）、2行目「軽い身体へ。」（大）に変更。skewX(-8deg)の斜体・行間1.08。
  - SPはサブコピーを2行折り返し（max-width 60vw）にして暗部との重なりを回避。
- 主な変更ファイル：`src/pages/index.astro`／`src/styles/global.css`
- 確認結果：`npm run build` 成功。Chromium検証でPC/SPともに表示・アニメーション・折り返しを確認。

## 2026-07-14 04:55 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：PC版キャッチコピーの大型化とマルキーのキーワード専用化
- 変更内容：
  - PC版キャッチコピーを約3倍に大型化（clamp(46px, 15vw, 240px)）。SPは従来サイズを維持。
  - マルキー（カルーセル）から画像・背景・罫線を撤去し、キーワードのみの構成に変更。
  - キーワードを8個に拡充：#完全個室／#マンツーマン／#完全女性トレーナー／#全く新しいストレッチサロン／#岐阜初出店／#独自の体感軸調整法／#深層筋にアプローチ／#根本改善
- 主な変更ファイル：`src/pages/index.astro`／`src/styles/global.css`
- 確認結果：`npm run build` 成功。Chromium検証でPC/SPとも横スクロールなし・マルキー流れ・コピー表示を確認。

## 2026-07-14 05:10 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：オファーカード拡充・表示タイミング変更、マルキー調整、写真のカラー化
- 変更内容：
  - MVのオファーカードに全身ケアコース（90分 ¥19,800→¥4,900）の行を追加し、コース間に罫線を追加。
  - オファーカードの表示タイミングを「スクロール進捗72%」から「少しでもスクロールしたら即表示」（進捗2%〜9%でスライドイン、`--offer-t` 変数で制御）に変更。
  - マルキーにグリッド模様背景（`section-grid`）を追加し、フォントサイズを約半分（PC 38px→19px／SP 22px→13px）に縮小。
  - 全ページの写真から `grayscale`（ホバーでカラー化）指定を撤去し、最初からカラー表示に統一（TOPのCONCEPT/METHOD/STAFF、スタッフページ）。
- 主な変更ファイル：`src/pages/index.astro`／`src/pages/staff.astro`／`src/styles/global.css`
- 確認結果：`npm run build` 成功。Chromium検証で進捗10%時点のオファー表示（opacity 0.75・inert解除・2コース行）、グリッド背景マルキー、カラー写真を確認。

## 2026-07-14 05:25 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：予約セクションの90分コース追加ほか、UI微調整6件
- 変更内容：
  - 予約セクション（ReserveCTA）の75%OFFパネルに全身ケアコース（90分 ¥19,800→¥4,900）の行を追加（罫線区切りの2段構成）。
  - スマホTOPのPRICE見出し横に「初回特別価格」バッジを追加（`sm:hidden` でSPのみ表示）。
  - PCキャッチコピーを縮小（15vw/最大240px → 11.5vw/最大176px）。
  - 料金表（PriceRows）の「初回限定○○OFF」バッジと通常価格を右端揃えの縦ライン統一に修正。
  - スタッフページのメッセージを手書き風（font-hand）から通常フォントに変更。
  - 全下層ページから「※経歴・保有資格は確認でき次第掲載します。」と「最終更新：日付」を削除（staff/menu/access/voice/reserve/recruit/symptoms一覧/悩み別レイアウト）。`LAST_UPDATED` のimportも整理（consts.tsの定義は残置）。
- 主な変更ファイル：`src/components/ReserveCTA.astro`／`src/components/PriceRows.astro`／`src/pages/index.astro`／`src/pages/staff.astro`／各下層ページ／`src/layouts/SymptomLayout.astro`／`src/styles/global.css`
- 確認結果：`npm run build` 成功。Chromium検証で予約セクション2コース表示・料金表の縦ライン・SPのPRICEバッジ・コピーサイズ・下層ページの記載削除を確認。
