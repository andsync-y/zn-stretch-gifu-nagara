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

## 2026-07-14 05:40 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：モバイルメニューの全画面化・採用情報追加・重複リンク削除
- 変更内容：
  - ハンバーガーメニューを全画面表示に変更（`inset: 0`）。ヘッダーのロゴ・閉じるボタンはメニューの上に重なって表示され、背景検知で自動的に白反転する。
  - メニューに「採用情報」（/recruit）を追加。
  - navと重複していた「スタッフ紹介」「メニュー・料金」をモバイルメニューの追加リンクから削除（スタッフ／料金はnav側の表記で表示）。
- 主な変更ファイル：`src/components/Header.astro`
- 確認結果：`npm run build` 成功。iPhoneエミュレーションでメニューが全画面（top:0・高さ=ビューポート）で開き、リンク9件に重複なし・採用情報ありを確認。

## 2026-07-14 08:15 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：お悩み別のアイコン削除と下層ページのMOVE装飾削除
- 変更内容：
  - お悩み別一覧（/symptoms）と各お悩み詳細ページのシンボルアイコン（SymptomIcon）を削除。TOPのSYMPTOMSセクションのアイコンは維持。
  - 下層ページ共通のタイトル横装飾「MOVE」（`.subpage-hero::before` のアウトライン文字）を削除。
  - `SymptomIcon.astro` はTOPで使用中のためファイルは残置。
- 主な変更ファイル：`src/layouts/SymptomLayout.astro`／`src/pages/symptoms/index.astro`／`src/styles/global.css`
- 確認結果：`npm run build` 成功。Chromiumで一覧・詳細ページのアイコン非表示と、下層ページのMOVE装飾消滅を確認（フッターの「READY TO MOVE?」は別要素のため残存でOK）。
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

## 2026-07-14 03:10 JST — ChatGPT Codex

- ブランチ：`codex/interactive-symptoms`
- 関連PR：[PR #4 SYMPTOMSを人体連動型UIへ刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/4)
- 変更内容：
  - SYMPTOMSセクションをライトグレーから黒背景へ戻した。
  - 既存の人物イラスト6点を、同一人物・同一ポーズを維持した黒地の白線画へ変更。
  - 悩み箇所のみ赤い発光エフェクトを残し、人物・服装の色は排除。
  - スポーツケアは、同じ男性がゴルフ後にクラブを持ち、腰を押さえる専用イラストへ差し替え。
  - 左イラスト／右一覧、hover・focus・tapのクロスフェード、コネクター線なしの仕様は維持。
- 主な変更ファイル：
  - `src/components/InteractiveSymptoms.astro`
  - `src/pages/index.astro`
  - `public/images/symptoms/illustration-*.webp`（7点）
  - `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：
  - 白線画は背景から自然に分離するよう、輪郭抽出後にWebPへ最適化。
  - 赤 `#ff382f` は患部エフェクトとアクティブ項目のみに限定。
  - 7点は960 × 1260px、合計約307KB。
- 確認結果：
  - `npm run build` 成功。Astro静的ページ15件を生成。
  - `git diff --check` 成功。
  - 1440／1024／768pxで左右2カラム、390／375pxで縦構成を確認。
  - 7画像の読み込み、hover・focus・click・tapの状態同期、クロスフェードを確認。
  - PCの主要部は約773〜816pxを維持し、コネクター線は0件。

## 2026-07-14 03:55 JST — ChatGPT Codex

- ブランチ：`codex/interactive-symptoms`
- 関連PR：[PR #4 SYMPTOMSを人体連動型UIへ刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/4)
- 変更内容：
  - 症状ごとに人物・ポーズ・画像を切り替える方式を廃止。
  - 添付見本と同じ背面寄り斜めアングルの全身人体を1枚だけ固定表示。
  - hover・focus・tap時は、人体を変えずに該当部位の赤い発光だけを切り替える仕様へ変更。
  - 発光は1.9秒周期で拡大・縮小する「ぽわん」としたCSSアニメーション。
  - 左人体／右一覧、既存詳細リンク、コネクター線なしの構成は維持。
- 主な変更ファイル：
  - `src/components/InteractiveSymptoms.astro`
  - `public/images/symptoms/anatomy-base.webp`
  - `docs/SYMPTOMS_INTERACTION_IMPLEMENTATION.md`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：
  - 患部の赤は画像へ焼き込まず、CSSレイヤーとして位置・大きさを症状別に定義。
  - 7枚の人物イラストを削除し、約96KBの単一WebPへ集約。
  - `prefers-reduced-motion` では発光のパルスを停止。
- 確認結果：
  - `npm run build` 成功。Astro静的ページ15件を生成。
  - `git diff --check` 成功。
  - 1440／1024／768pxで左右2カラム、390／375pxで縦構成を確認。
  - 全幅で人体画像が1枚のみであること、7症状すべてで画像URLが変化しないことを確認。
  - hover・focus・click・tapと患部レイヤー数の同期、コネクター線0件を確認。
  - reduced motionでは発光アニメーションが停止することを確認。

## 2026-07-14 04:25 JST — ChatGPT Codex

- ブランチ：`codex/interactive-symptoms`
- 関連PR：[PR #4 SYMPTOMSを人体連動型UIへ刷新](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/4)
- 変更内容：
  - 全身人体の表示倍率を110%から96%へ変更し、頭頂部と足先に安全余白を確保。
  - SYMPTOMSセクションと人体表示枠の背景色を `#151719` に統一。
  - リード文を実装仕様に合わせ、「該当する部位が赤く光ります」へ修正。
- 主な変更ファイル：
  - `src/components/InteractiveSymptoms.astro`
  - `src/pages/index.astro`
  - `docs/AI_CHANGELOG.md`
- 確認結果：
  - `npm run build` と `git diff --check` 成功。
  - 1440／1024／768／390／375pxで頭頂部・足先が表示枠内に収まることを確認。
  - 7状態の発光同期、固定画像1枚、reduced motion対応を再確認。
  - セクションと人体表示枠に `#151719` が指定されていることを確認。

## 2026-07-14 08:25 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：「完全個室→個室」の全文置換、SPヒーローサブコピーの改行、SYMPTOMSのSP2カラム化
- 変更内容：
  - サイト全体の「完全個室」を「個室」に置換（title/description/本文/alt/マルキー/構造化データ由来テキスト含む）。予約セクションの特長チップのみ「全席個室」に整えた。
  - SPのTOPヒーローサブコピーを「岐阜市長良・個室の」で改行（`br.lg:hidden`）。
  - インタラクティブSYMPTOMSセクションをSPでも2カラム化（左スケルトン・右項目リスト）。項目のフォント・余白をSP向けに縮小調整。
- 主な変更ファイル：`src/`全体（置換）／`src/pages/index.astro`／`src/components/InteractiveSymptoms.astro`／`src/components/ReserveCTA.astro`
- 確認結果：`npm run build` 成功。iPhoneエミュレーションでサブコピー2行表示・SYMPTOMSの2カラム表示・置換後の文言を確認。

## 2026-07-14 08:45 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SEO改善パッケージ一括反映（デザイン維持）
- 変更内容：
  - 【H1日本語化】下層7ページ（menu/access/staff/voice/reserve/recruit/symptoms一覧）の英字見出し（PRICE等）をh1→装飾pに変更し、既存の日本語リード行をh1化＋sr-onlyでキーワード補完。見た目は完全に不変。
  - 【コラム新設】`/column` を新設し、記事3本（肩こりセルフストレッチ／腰・股関節ストレッチ／ゴルフ前後ルーティン）を公開。ColumnLayout（Article+BreadcrumbList構造化データ・監修表記・免責・関連リンク付き）を新規作成。フッターとモバイルメニューにコラムリンクを追加。薬機法に配慮した表現（断定回避）で執筆。
  - 【E-E-A-T】悩み別7ページのFAQ手前に監修ブロック（トレーナーチーム→/staffリンク）を追加。
  - 【軽量化】ヒーローの全フレームをWebP化（PC 22MB→約9MB、SP 5.5MB→約3MB）。JPGは削除し参照を.webpに更新。
  - 【OGP】og:imageをSVG→1200×630のJPG（/images/ogp.jpg）に変更。
  - 【TOP FAQ】TOPによくある質問6件＋FAQPage構造化データを追加。
  - 【料金схема】menuにService+OfferCatalog（3コースの価格）構造化データを追加。
  - 【バグ修正】料金表の1024px横はみ出しを修正（641〜1100pxで列構成を縮小）。
  - 【その他】accessに周辺地名（長良・鷺山・正木・則武・岐阜大学方面）を追記、voiceにGoogleマップのクチコミ導線を追加、sportsのtitle短縮、staffのdescription増強、未使用のYomogiフォント読み込みを削除。
- 主な変更ファイル：`src/layouts/ColumnLayout.astro`（新規）／`src/pages/column/`（新規4ページ）／下層各ページ／`src/layouts/Base.astro`／`src/components/PriceRows.astro`／`src/components/Footer.astro`／`src/components/Header.astro`／`public/frames/`（WebP化）／`public/images/ogp.jpg`（新規）
- 判断・注意点：
  - お客様の声へのReview/AggregateRating構造化データは自己申告レビューにあたりGoogleガイドライン違反のため実装しない（クチコミはGBPに集める方針）。
  - GA4・Search Consoleは測定IDが必要なため未実装（要ユーザー対応）。GoogleビジネスプロフィールのsameAs追加もURL確定後に対応。
- 確認結果：`npm run build` 成功（19ページ）。Chromium検証でWebPフレームのスクラブ動作（169枚読込）、1024px横スクロール解消、TOP FAQ表示、コラム一覧・記事表示を確認。
- 未対応・次の作業：GA4/Search Console導入、GBPのsameAs追加、4Kアップスケール（クレジット確保後）、コラム記事の継続追加。

## 2026-07-14 09:10 JST — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：GA4導入（G-L88N21PDK8）とキーイベント計測
- 変更内容：
  - 全ページ（Base.astro）にGA4のgtagタグを設置（非同期読み込み）。
  - クリックイベント計測を実装：`click_reserve`（ホットペッパーへの遷移）／`click_line`（LINE）／`click_tel`（電話）。イベント委譲方式のため、今後ボタンを増やしても自動で計測対象になる。パラメータとして link_url / link_text / page_path を送信。
- 主な変更ファイル：`src/layouts/Base.astro`
- 確認結果：`npm run build` 成功。Chromiumで3リンクをクリックし、dataLayerに3イベントが正しく積まれることを確認。
- 未対応・次の作業：GA4管理画面で3イベントをキーイベントに昇格（データ到達後）、データ保持期間14ヶ月への変更、Search Console連携。

## 2026-07-14 — Claude Code

- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：Search Console所有権確認（HTMLタグ方式）
- 変更内容：
  - Search Consoleの所有権確認用メタタグ（`google-site-verification`）をBase.astroの`<head>`に追加。
- 主な変更ファイル：`src/layouts/Base.astro`
- 判断・注意点：ユーザーは当初ドメイン所有者（TXTレコード）方式を提示されたが、DNS設定はコードリポジトリ側から代行できないため、URLプレフィックス＋HTMLタグ方式に切り替えて対応。
- 確認結果：`npm run build` 成功。distの出力HTMLに確認用metaタグが含まれることを確認。
- 未対応・次の作業：Search Console側で「確認」ボタンを押して認証完了させる、GA4とSearch Consoleのリンク連携、サイトマップ（sitemap-index.xml）のSearch Console登録。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：TOPのMV短縮＋CONCEPTパララックス化、SYMPTOMSの調整
- 変更内容：
  - 【MV短縮】ヒーローのスクロール領域を PC 420vh→300vh、SP 360svh→260svh に短縮し、MVの表示（スクロール）時間を削減。
  - 【CONCEPTパララックス】CONCEPTの写真をマスク（overflow:hidden）で囲み、名前付き view-timeline（`--parallax-media`）で画像を上下ドリフト（translateY ±6.5%＋scale1.16）させ奥行きを演出。`animation-timeline: view()` を画像に直接付けるとマスクがスクロールコンテナ化してタイムラインが進行しない不具合があったため、マスク自身に名前付きタイムラインを張りビューポート基準で駆動。非対応ブラウザ・prefers-reduced-motion時は静止（従来表示）。
  - 【並び替え】ハッシュタグのマルキー（カルーセル）を「ヒーロー直後」から「CONCEPTの直後」へ移動。順序は HERO→CONCEPT→MARQUEE→METHOD。
  - 【SYMPTOMS】スケルトン画像コンテナ（.symptoms-visual）の上下ボーダー線を削除（PC/SP共通）。赤エフェクトの拍動アニメーション（hotspot-pulse＝外側の円が膨張する動き）を削除し、常時点灯の静的グローに変更。
  - 【SYMPTOMS位置補正】赤エフェクトのホットスポット座標（全12点）を解剖図に合わせて再調整（従来は左に約6〜8%ずれ、腰は腿まで下がっていた）。首・肩・上背・腰/尻・ふくらはぎ・全身・スポーツ連鎖の各位置を実レンダリングで確認しながら補正。
  - 【SYMPTOMS SP】SPで列幅がmax-widthに当たり縦横比が崩れ、ホットスポットが画像とずれて頭上に浮く不具合を修正（.symptoms-body をSPのみ幅基準で配置し画像と一致させた）。あわせてSPのスケルトンを拡大（列比 0.82:1.18→0.96:1.04、body幅100%）。
- 主な変更ファイル：`src/styles/global.css`（ヒーロー高さ・パララックス）／`src/pages/index.astro`（CONCEPT画像のマスク・マルキー移動）／`src/components/InteractiveSymptoms.astro`（線削除・拍動削除・座標補正・SP配置）
- 判断・注意点：パララックスは既存の `.rise` と同じ `@supports (animation-timeline: view())` 方式で統一。効果は控えめ（全可視区間で約110px）。ホットスポット座標は %指定で、SP修正によりボックスの縦横比が常に画像と一致するため、全画面幅で同じ座標が正しく重なる。
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで検証——ヒーロー高さ=2700px(300vh)、CONCEPTパララックスの進行をWeb Animations APIで確認（修正前は進捗0.5固定→修正後は進捗が変化しanimProgressが0→0.596へ進行）、セクション順が concept→marquee→method、CONCEPTの「01/BODY AXIS」バッジがマスクにクリップされない、SYMPTOMS7状態の赤エフェクト位置をPC/タブレット/SPで確認、SPのスケルトン拡大と線の消滅を確認。
- 未対応・次の作業：なし（デザイン微調整のため、実機での見え方に応じてドリフト量やホットスポット座標は追調整可）。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：料金ページのタブ配色反転・見出し文言・初回OFFバッジ拡大＋SP固定CTAバー
- 変更内容：
  - 【回数券タブ】男性料金のセグメントタブを「アクティブ＝白（bg-paper/text-ink）／非アクティブ＝黒（bg-ink/text-paper）」に反転（従来は逆）。初期HTMLとJS切替の両方を修正。アクティブタブが下の白パネルと連結して見える自然な形に。
  - 【見出し文言】回数券見出しを「○○回数券（性別コース）」→「性別　○○回数券」に変更（男性　初回特別価格の回数券／男性　通常回数券／女性　通常回数券）。
  - 【初回OFFバッジ拡大】初回料金表（PriceRows）の「初回限定○○%OFF」バッジを8px→12pxに拡大し、バッジ列を100px→132pxに広げて3コースで右揃え・同幅で整列。タブレット幅（641〜1100px）は10pxに調整。1024pxで横はみ出しが出ないことを確認。
  - 【SP固定CTAバー】スマホ表示時、画面下部に固定の「電話する（tel:）」「WEB予約（ホットペッパー）」2ボタンのバーを全ページ共通で追加（Base.astro）。PCでは非表示。iPhoneのホームインジケータ用に safe-area-inset を考慮し、フッター末尾が隠れないようbodyに下余白を確保。GA4のclick_tel/click_reserveは既存のイベント委譲で自動計測される。
- 主な変更ファイル：`src/pages/menu.astro`（タブ配色・見出し）／`src/components/PriceRows.astro`（バッジ拡大・列幅）／`src/layouts/Base.astro`（SP固定CTAバー）／`src/styles/global.css`（CTAバーのスタイル・body下余白）
- 判断・注意点：PriceRowsは料金ページとTOP・症状ページで共用のため、バッジ拡大は全ページに反映される（TOPは FIRST SESSION バッジ非表示のまま各行OFFバッジのみ拡大）。SP固定CTAバーはz-index 45でヘッダーのモバイルメニュー（z-49）より下＝メニュー展開時は隠れる。
- 確認結果：`npm run build` 成功。Chromiumで確認——タブが白黒反転（既定＝初回特別が白、通常が黒／クリックで入替）、見出し3件の文言、初回OFFバッジの拡大と整列、1024px横はみ出しなし、SP固定CTAバーの表示（tel:/ホットペッパーのリンク先）・PC非表示・フッター重なり回避を確認。
- 未対応・次の作業：TOPコンセプトの構成変更（MV左側にパララックスで情報を流す案）はユーザーに仕様確認中。確定後に実装し本番反映予定。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：TOPコンセプトをMV左側へのパララックス流し込みに変更（前回未対応事項の実装）＋reduced-motion時のCONCEPT本文欠落を修正
- 変更内容：
  - 【CONCEPT統合】独立した`CONCEPT`セクション（写真＋見出し＋3点リスト）を廃止し、ヒーローのスクラブ動画（`.hero-scrub`）左側に、スクロール進捗（`--hero-progress`）に応じてパララックスで流れ込む形に統合（`.hero-concept`）。動画スクラブは進捗0.58で最終フレームに到達し、残りの区間でコンセプトが読み込む構成。ヒーロー全体の高さをPC 300vh→440vh、SP 260svh→380svhに拡張して流し込み区間を確保。
  - 【オファーカード左右反転】コンセプトが左側に表示されるため、`.hero-offer`（FIRST SESSION）を左→右配置に変更。
  - 【キャッチコピー】コンセプト流入前にフェードアウトするよう`.hero-copy`の消失タイミングを早め（opacity係数2.4→5.5、移動量-6vh→-7vh）、両者が重ならないようにした。
  - 【マルキー並び順】ハッシュタグのマルキーはCONCEPTセクション削除に伴い、そのままヒーロー直後に表示される構成に変更（順序：HERO(+CONCEPT)→MARQUEE→METHOD）。
  - 【不具合修正：reduced-motion時のCONCEPT欠落】`prefers-reduced-motion: reduce`時、JSは`--hero-progress`を`1`固定にして静止表示するが、CSS側で`.hero-concept { display: none; }`と明示的に上書きしていたため、CONCEPT本文（見出し・サブコピー・差別化3点：ZST協会認定/全席個室・マンツーマン/トレーナーは全員女性）がページ上のどこにも表示されない状態になっていた（旧来は独立セクションとして常時表示されていたコンテンツが、モーション低減設定のユーザーからは完全に消える回帰）。`.hero-copy`側の強制`opacity:1`上書きと`.hero-concept`の`display:none`上書きを削除し、`--hero-progress:1`時の自然な計算値（キャッチコピーは非表示、コンセプトは静止した完成形で表示）をそのまま使う形に修正。両要素とも実体はcalc()/clamp()による静的な位置指定でありCSSアニメーション（@keyframes）を使っていないため、reduced-motionでも実際の動きは発生しない。
- 主な変更ファイル：`src/pages/index.astro`（CONCEPTセクション削除・`.hero-concept`追加・マルキー移動）／`src/styles/global.css`（ヒーロー高さ・`.hero-concept`関連スタイル・オファーカード左右反転・reduced-motionブロックの修正）
- 判断・注意点：reduced-motionの静止表示は「スクロール終端の状態」を採用（キャッチコピー非表示・コンセプト表示・オファー表示）。これは通常のスクロールアニメーションが収束する状態と一致しており、動きなしで一貫した最終レイアウトになる。
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで確認——PC/SPともスクロール進捗0〜0.95でコンセプトがMV左側に段階的にフェードイン、キャッチコピーとの重なりなし、オファーカードが右側に配置。`prefers-reduced-motion: reduce`をPlaywrightでエミュレートし、PC(1440px)/SP(390px)双方でCONCEPT本文（見出し・3点・サブコピー）とオファーカードが重ならず静止表示されることを確認（修正前は本文が完全に非表示だった）。通常モーション時の挙動に回帰がないことも別途スクリーンショットで確認。
- 未対応・次の作業：なし。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：TOPコンセプトを「MV・オファーカード固定＋クレジットロール」に変更、SPのカード裏コンセプト重なりを解消
- 変更内容：
  - 【不具合：PCでコンセプトが2点しか見えない】`.hero-concept`は絶対配置＋わずかなパララックス（-4vh）だったため、3つ目の特長「トレーナーは全員女性」が常に画面下に隠れ2点しか表示されていなかった。MV（canvas背景）とオファーカードは固定のまま、コンセプトのブロックだけがスクロールで上へ流れる「クレジットロール」方式に変更（`transform: translate3d(0, calc((0.6 - var(--hero-progress)) * 80vh), 0)`＋進捗0.2で登場する`opacity`ゲート）。ブロック全体が上へ流れることで3つの特長が順にビューポートに入る。個別項目の段差フェード（`--in`）は位置で見せる方式に切り替えたため撤去。
  - 【MV固定感の強化】スクラブ終了進捗を`SCRUB_END` 0.58→0.42に前倒しし、動画は早めに最終フレームで静止。以降はMV固定のままコンセプトが上へ流れる区間にした。
  - 【SP：カード裏にコンセプトが重なる問題】SPでは`.hero-concept`(z:6)がオファーカード(z:8)の裏に潜り込み文字が読めなかった。順序を「先にオファーカードを見せる→その後コンセプト」に変更：コンセプトは進捗0.52まで非表示（`opacity`ゲート）にし、オファーカードは進捗0.5以降にフェード＋下方向へ退場（`--offer-out`）。カード退場後はコンセプト（見出し＋特長3タイトル）が主役として表示される。カードが退場したらJSで`is-offer-leaving`クラスを付与し`pointer-events:none`＋`inert`にして、下部固定CTAバーやコンセプトのタップを妨げないようにした。
  - 【reduced-motion対応】クレジットロール化で進捗1固定時はコンセプトが上へ流れ切った状態（見出しが画面外）になるため、`prefers-reduced-motion: reduce`では`.hero-copy`を非表示、`.hero-concept`を`transform:none;opacity:1`で静止表示に上書きし、3点を含む本文が欠落しないようにした。
- 主な変更ファイル：`src/pages/index.astro`（`SCRUB_END`・`is-offer-leaving`／`inert`判定）／`src/styles/global.css`（`.hero-concept`のロール駆動・項目フェード撤去・SPの登場順制御・オファーカード退場・reduced-motion上書き）
- 判断・注意点：SPでオファーカードは進捗0.5前後まで（≒スクロール2画面分）主役表示し、その後コンセプトへ主役を譲る。カードのCTAは下部固定CTAバー（電話・WEB予約）でカバーされるため、退場後も予約導線は途切れない。
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで検証——PC(1440×820)で進捗0.85付近までにコンセプト3点（01/02/03）がロールで全て表示され、MV・オファーカードは固定。SP(390×844)で「カードのみ表示→カード退場→コンセプト3タイトル表示」の順序を確認、カード裏の重なり解消。`prefers-reduced-motion: reduce`でPC/SPともコンセプト3点＋カードが静止表示されることを確認。
- 未対応・次の作業：なし。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：TOPの文言・料金・メソッド一括修正＋SPコンセプト全文化＋PCオファーカードのinert回帰修正
- 変更内容：
  - 【FIRST SESSIONカードに120分コース追加】ヒーローのオファーカードに「全身ケア＋ヘッドスパ 120分（¥26,400→¥13,200 税込）」の行を追加（`consts.ts`の`PRICING`に既存の値と一致）。PC/SPともカードに3コース表示。
  - 【SP：カード表示時間を短縮＋コンセプト全文化】SPでオファーカードの退場開始を進捗0.5→0.3に前倒し（`--offer-out`の係数も8へ）し、表示時間を短縮。あわせてSPでは`display:none`で隠していたコンセプトのサブ本文（`.hero-concept-sub`）と各特長の本文（`.hero-concept-points i`）を表示に戻し、コンセプトを「全文」クレジットロールで見せるようロール量を拡大（`translateY (0.5 - progress) * 96svh`）。カードと重ならないようコンセプトの登場を進捗0.4以降に遅らせ、クロスフェードの重なりを解消。
  - 【FAQ06】「初回はどのコースを選べばいいですか？」の回答を、全身ケアコース（90分）が一番人気である旨に修正（集中ケア60分・全身ケア＋ヘッドスパ120分も補足）。FAQPage構造化データにも同時反映。
  - 【ハッシュタグ】マルキーの`#根本改善`→`#根本ケア`に変更。
  - 【SYMPTOMSキャプション】「お悩みから探す。…部位が赤く光ります。」→「気になる症状に、当店がどうアプローチするかを知る。項目を選ぶと、該当する部位が赤く光ります。」に変更（症状に対する当店の施術を知るニュアンス、hover/tap両対応の「選ぶと」表現）。
  - 【METHOD 3項目差し替え】METHODを「①ZST協会認定「体感軸調整法」／②揉みほぐし×ストレッチ／③圧倒的な「即効性」と「具体的効果」」に更新（本文は支給原稿どおり）。英字ラベルはBody Axis／Release／Effectに調整。導入文の「もみほぐしではなく」は新②と矛盾するため「全身のもみほぐしとストレッチを融合し、体の軸をつくる深層筋までじっくりアプローチします。」へ整合。
  - 【PC回帰修正】前回`inert`判定が全幅対象になっており、PCでも進捗0.55超でオファーカードが操作不可（WEB予約ボタンが押せない）になっていた。`(max-width:1023px)`のmatchMediaで判定し、`is-offer-leaving`/`inert`をSP・タブレットのみに限定。PCはカード固定・常時操作可能に。
  - 【reduced-motion SP】コンセプト全文化＋3コースの高いカードにより静止表示の固定枠に収まらなくなったため、`prefers-reduced-motion`かつ`max-width:1023px`ではコンセプトを見出し＋特長タイトルのみのコンパクト表示にし（本文はDOMに残す）、カードとの重なりを回避。
- 主な変更ファイル：`src/pages/index.astro`（オファーカード120分行・FAQ06・ハッシュタグ・SYMPTOMSキャプション・METHODデータ／導入文・`narrow` matchMediaによる`inert`/`is-offer-leaving`のSP限定化）／`src/styles/global.css`（SPコンセプトのロール量・サブ/本文表示・カード退場タイミング・reduced-motion SPのコンパクト表示）
- 判断・注意点：支給されたメソッド①原稿は「体幹軸調整法」表記だったが、サイト全体（ヒーロー・meta・consts等）が「体感軸調整法」で統一されているため、既存表記に合わせ「体感軸調整法」とした。もし「体幹軸」へ全面リネームを希望する場合は別途対応が必要。
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで検証——PCでオファーカードに120分コース表示・METHOD3項目・SYMPTOMSキャプション・マルキー`#根本ケア`・FAQ06本文をDOM/表示で確認。SP(390×844)で「カード（3コース）→退場→コンセプト全文（サブ＋3点本文）のロール」を確認、カードとコンセプトの重なりなし。`prefers-reduced-motion`でPC（全文＋カード横並び）・SP（コンパクト＋カード、重なりなし）を確認。
- 未対応・次の作業：メソッド①の「体感軸/体幹軸」表記の最終確認（ユーザー判断）。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SPでFIRST SESSIONカードの120分コース行のレイアウト崩れを修正
- 変更内容：
  - オファーカードの「全身ケア＋ヘッドスパ 120分（¥13,200）」行が、SPでコース名が途中改行（…ヘッドス／パ）＋価格の「税込」が縦割れ（税／込）していた崩れを修正。
  - コース名は`<br class="lg:hidden" />`でSP/タブレットのみ「全身ケア」／「＋ヘッドスパ」の2行にきれいに改行（PC=1024px以上は1行のまま）。
  - `.hero-offer-price small`に`white-space: nowrap`を付与し「税込」が割れないよう固定。
  - 6桁価格の行（`.is-long`）はSPで価格フォントを`clamp(32px, 9vw, 50px)`に微縮小し、名前・価格・税込が各1行ずつ収まるように（他コースの5桁価格の大きさは維持）。
- 主な変更ファイル：`src/pages/index.astro`（120分行に`is-long`クラス・コース名の`<br class="lg:hidden">`）／`src/styles/global.css`（`small`のnowrap・`.is-long strong`のSPフォント調整）
- 判断・注意点：改行はPCで不要なため`lg:hidden`でSP/タブレット限定。価格縮小も6桁行のみで、60/90分の価格サイズは従来どおり。
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで幅320/360/390pxおよびPC(1440px)を確認——SPは120分行が「全身ケア／＋ヘッドスパ」2行＋「¥13,200 税込」1行で収まり崩れ解消、PCは名前1行（`br`が`display:none`）で従来表示を維持。
- 未対応・次の作業：なし。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：TOP SYMPTOMSの人体スケルトンをPC/SPで拡大＋キャプション後半文を削除
- 変更内容：
  - 【キャプション】SYMPTOMSの説明文から「項目を選ぶと、該当する部位が赤く光ります。」を削除し、「気になる症状に、当店がどうアプローチするかを知る。」のみに。
  - 【スケルトン拡大 PC】`.symptoms-explorer`のコンテナ高さを`clamp(500px,61vh,620px)`→`clamp(560px,72vh,760px)`に拡大し、人体図（`.symptoms-body`）を`height:96%`→`100%`に。人体図が約595px→720px高に拡大。タブレット（768〜1023px）も`min-height:500px`→`620px`、列比を`1.06fr:0.74fr`にして拡大。
  - 【スケルトン拡大 SP】列比を`0.96fr:1.04fr`→`1.1fr:0.9fr`に変更し骨格側を拡幅。さらに暗パネル（`.symptoms-visual`）に`aspect-ratio: 921/1708`を与えて骨格の縦横比に一致させ、従来あった上下のレターボックス（暗い余白）を解消。人体図が枠いっぱいに表示され、約162×300px→187×347pxに拡大＋余白ゼロで体感的に大きく。`.symptoms-body`はSPで`position:absolute; inset:0`のフィル配置に変更（ホットスポットの%座標も画像に一致）。
- 主な変更ファイル：`src/pages/index.astro`（SYMPTOMSキャプション）／`src/components/InteractiveSymptoms.astro`（コンテナ高さ・人体図サイズ・SPの列比とパネル比率）
- 判断・注意点：SPは骨格側を広げたぶん項目リストの列が狭くなり一部ラベルが2行になるため、`.symptom-entry`の`min-height`を58→60pxに調整。ホットスポットは%指定でパネル＝画像比のため全幅で正確に一致する。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440px)・SP(390px)を確認——人体図が拡大（PC 720px高／SP 187×347・余白なし）、赤エフェクト位置が肩など各部位に一致、キャプションが1文に。
- 未対応・次の作業：なし。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SYMPTOMSのスケルトン列を狭め、項目リストの領域を拡大
- 変更内容：
  - スケルトン（人体図）の横幅領域を狭め、その分を項目リストへ回してリストを拡大。
  - PC：列を`minmax(0,1.16fr) minmax(390px,.84fr)`→`minmax(0,500px) minmax(0,1fr)`に変更。人体図は高さ基準でサイズが決まるため大きさは維持したまま、両脇の暗い余白だけを削減し、リストが大幅に拡幅（各症状ラベルが1行で余裕をもって収まる）。
  - タブレット：`minmax(0,1.06fr) minmax(320px,.74fr)`→`minmax(0,360px) minmax(0,1fr)`。
  - SP：列比を`1.1fr:0.9fr`→`0.9fr:1.1fr`に反転してリストを拡幅。あわせて番号列22→18px・矢印列30→26px・トリガー余白を微調整し、最長ラベル「腰痛・お尻や脚の張り」も含め全項目が1行に収まるように（従来は2行に折り返していた）。
- 主な変更ファイル：`src/components/InteractiveSymptoms.astro`（グリッド列比・SP項目の列幅微調整）
- 判断・注意点：PCの人体図は高さ基準のため列を狭めても縮小しない（余白のみ減少）。SPはパネルが骨格の縦横比に一致しているため列縮小で骨格はやや小さくなるが、レターボックスなしで枠いっぱい表示は維持。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440px)・SP(390px)を確認——スケルトン領域が狭まりリストが拡大、SPで全ラベルが1行表示、赤エフェクト位置は各部位に一致。
- 未対応・次の作業：なし。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーローCONCEPT見出しを「話題のパーソナルストレッチサロンが岐阜初出店。」に変更＋サブ文を調整
- 変更内容：
  - CONCEPTリード（`.hero-concept-lead`）を「動ける身体を、取り戻す。」→「話題のパーソナル／ストレッチサロンが／岐阜初出店。」に変更（3行にバランス改行）。
  - サブ文（`.hero-concept-sub`）を見出しに合わせて調整：「個室・マンツーマンで、担当は全員女性トレーナー。元格闘家考案の独自メソッド「体感軸調整法」が深層筋にアプローチし、動ける身体へ導きます。」（新規出店・話題性を打ち出しつつ、個室／マンツーマン／女性トレーナー／体感軸調整法の訴求を維持）。
- 主な変更ファイル：`src/pages/index.astro`（`.hero-concept-lead`／`.hero-concept-sub`）
- 判断・注意点：見出しは既存フォント指定（PC clamp(32,4vw,56)／SP clamp(26,7.4vw,40)）のまま3行で収まることを確認。小見出し（kicker）"CONCEPT — OUR PHILOSOPHY" は今回対象外のため据え置き（必要なら別途変更可）。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440px)・SP(390px)を確認——新見出しが3行で表示、サブ文も更新、クレジットロール表示も従来どおり。
- 未対応・次の作業：なし。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーロー演出のスムーズ化＋SPコンセプト背景（白スクリム）上部の隙間を解消
- 変更内容：
  - 【スムーズ化】スクロール連動のフレームスクラブ（canvas）の1フレームあたりの再描画コストを削減し、追従を滑らかに。
    - モバイルはcanvasの解像度上限を`devicePixelRatio` 2→1.5に抑制（SP素材は720px幅のため画質劣化はほぼ無し）。canvasのピクセル数が約4割（例：1170×2340→585×1170）になり、スクロール中の再描画が軽量化。
    - フレームのプリロード同時本数を6→8に増やし、未読込による飛び（カクつき）を低減。
    - スクロールで動く要素（`.hero-copy`／`.hero-concept`／`.hero-offer`）に`will-change: transform, opacity`を付与し、GPUレイヤー化して毎フレームの再描画コストを軽減。
  - 【SPスクリム上部の隙間】コンセプト背景の白（`.hero-concept::before`）の上端が、ヘッダーとコンセプトの間でMV（人物）が見えてしまい隙間に見えていた。スクリムの上方向オフセットを`-30px`→`-220px`に拡大し、ヘッダー直下まで白で満たすように（はみ出し分はステージの`overflow:hidden`でクリップ）。グラデーションの不透明域も拡大（0.94を84%まで）。
- 主な変更ファイル：`src/pages/index.astro`（canvasのDPR上限・プリロード本数）／`src/styles/global.css`（hero要素の`will-change`・SPスクリムの上方向拡張）
- 判断・注意点：スクリムは`.hero-concept`の子（::before）で親のopacityゲート（進捗0.4以降表示）に従うため、カード表示中（前半）に白が先行表示されることはない。DPR抑制はモバイルのスクラブ描画のみで、フォールバック静止画やPCは従来どおり。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでSP(390px, DPR3エミュレート)を確認——canvasが585×1170で描画されスクラブ表示は良好、コンセプト表示時に白がヘッダー直下まで満たされ上部の隙間が解消。カード→コンセプトの遷移・クレジットロールは従来どおり。
- 未対応・次の作業：体感でさらに軽くしたい場合は、フレーム枚数の削減やヒーローのスクロール長（PC440vh/SP380svh）短縮も選択肢（今回は演出の尺・見え方を変えないためDPR/プリロード/GPUレイヤー化のみで対応）。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SYMPTOMSの項目行をリンク化（行全体をクリック/タップ可能）＋メソッド③のSP改行＋コンセプトの軽量化
- 変更内容：
  - 【SYMPTOMS行のリンク化】各項目を`<button>`（部位ハイライトのみ）＋別リンク（↗のみ）だった構造から、**行全体を`<a href>`**に変更。テキスト部分のクリック/タップでも該当お悩みの詳細ページへ遷移するように。ハイライト（該当部位の発光）はPCのホバー／キーボードフォーカスで従来どおり動作（アクティブ状態は`aria-pressed`→`.is-active`クラス方式に変更）。PCはホバー中の行に薄い赤の背景を付けてリンクであることを示す。
  - 【メソッド③のSP改行】METHOD 3項目目「圧倒的な「即効性」と「具体的効果」」を、スマホ（<768px）では「圧倒的な「即効性」と」／「「具体的効果」」の2行に改行（`<br class="md:hidden">`＋`set:html`で描画）。PC・タブレットは1行のまま。
  - 【コンセプト軽量化】コンセプト背景スクリム（`.hero-concept::before`）が持っていた「スクロール進捗に連動した独自のopacityアニメ」を廃止し、親`.hero-concept`のopacityと一緒にフェードする形へ。毎スクロールフレームでの大きなグラデーション背景の再計算・再描画を減らし、体感の重さを軽減（表示完了時の白の見た目は従来と同一）。
- 主な変更ファイル：`src/components/InteractiveSymptoms.astro`（行の`<a>`化・アクティブ判定のクラス化・JS簡素化）／`src/pages/index.astro`（メソッド③の改行・`set:html`）／`src/styles/global.css`（スクリムのopacityアニメ廃止）
- 判断・注意点：SP行はタップで即遷移するため、SPでのタップによる部位ハイライトは行わない（デフォルトの肩こりを表示）。PCはホバーでハイライト、クリックで遷移。メソッド改行は「スマホのみ」の指定のため`md:hidden`（768px未満で改行）を採用。
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで確認——SYMPTOMS各行が`<a>`で正しいhref、テキストクリックで詳細ページへ遷移（例：腰痛→/symptoms/youtsu）。メソッド③がSPで2行・PCで1行。コンセプトは表示完了時に白スクリムが従来どおり定着（上部の隙間なし）、フェードは親と一体化。
- 未対応・次の作業：コンセプトがまだ重い場合の次手は、ロールの移動量（translate）縮小やヒーロースクロール長の短縮。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーローのPC全面化（ヘッダー背景の帯を解消）＋FIRST SESSIONカードのヘッダー干渉修正＋スクラブのさらなる軽量化
- 変更内容：
  - 【PCヘッダー背景の帯を解消（全面化）】ヘッダー自体は元から透明だが、`.hero-scrub-stage`が`top:76px`から始まるため上76pxに`.hero-scrub`のクリーム背景が「帯」として見えていた。PC/タブレットではステージを全面化（`top:0; height:100vh`）＋`.hero-scrub`に`margin-top:-76px`を与え、MVを透過ヘッダーの背面まで回り込ませて帯を解消。モバイルは従来どおり（`margin-top:0`・ステージ`top:64px`）。
  - 【コンセプトのヘッダー被り防止】全面化でコンセプトがロール時にヘッダーへ重なるため、テキスト群（コピー・コンセプト・オファー・スクロール表示）を`.hero-overlays`でラップし、`top:76px; overflow:hidden`でヘッダー下にクリップ（MV=canvasは全面のまま）。オファーカードのタップ可否は`pointer-events`の子優先で維持（検証で確認）。
  - 【透過ヘッダーの可読性】MV上端に淡いグラデーション（`.hero-scrub-stage::before`、バーではなくソフトなフェード）を敷き、人物の暗部にナビが重なっても文字が読めるように。canvasより上・テキストより下（z-index 1/2）。モバイルは非表示。
  - 【カードのヘッダー干渉修正】FIRST SESSIONカードが3コース化で背が高くヘッダーに近接していたのを、余白を圧縮（`padding`・価格行・見出し・注記）して全面化と合わせ、ヘッダーとの間に十分な余白を確保（1440×820で175px／×768で126px）。
  - 【スクラブ軽量化（PC含む）】canvasの解像度上限を1.5に統一（前回はモバイルのみだったためPCで体感差が出なかった）。毎フレームの`fillRect`（背景塗り）はcoverで全面が覆われるため省略。ヒーローのスクロール長をPC 440vh→360vhに短縮して体感を軽く（コンセプトのロールは進捗基準のため3点表示は維持）。
- 主な変更ファイル：`src/pages/index.astro`（canvasのDPR統一・fillRect省略・`.hero-overlays`ラッパー追加）／`src/styles/global.css`（ステージ全面化・`margin-top`・`.hero-overlays`クリップ・上端フェード・カード圧縮・ヒーロー高さ）
- 判断・注意点：全面化・クリップ・上端フェードはPC/タブレットのみ。モバイルはステージがヘッダー下(64px)から始まるため対象外。DPR1.5は元動画が横1920/縦720px幅のため画質劣化はほぼ無い。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820/768)を確認——上部のクリーム帯が消えMVが全面表示、ナビが可読、カードがヘッダーから離れて表示、コンセプトはロール時もヘッダーに被らず3点表示、オファーのWEB予約リンクがクリック可能（elementFromPointで確認）。モバイル(390)は従来表示のまま。
- 未対応・次の作業：モバイルも同様に全面化したい場合は別途対応可（現状はPCのみのご要望）。スクラブがまだ重い場合はフレーム枚数削減（要再エンコード）が次手。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：コンセプトを透過ヘッダー（ロゴ）背面へ流し込む（クリップ解除）＋コンセプトのドロップシャドウ軽減
- 変更内容：
  - 【ロゴ背面の通り抜け】前回ヘッダー被り防止で`.hero-overlays`を`top:76px`でクリップしていたが、「ロゴの背景を情報が通っていく感じ」に、というご要望を受け`top:0`に変更。コンセプトがロール時に透過ヘッダー（ロゴ）の背面を流れて通り抜けるように。ロゴは最前面（z-index 50）で残り、上端のソフトフェードで可読性を確保。
  - 【ドロップシャドウ軽減】コンセプト各テキストの白い光彩（text-shadow）が強く（blur 26/16/14px）文字がぼやけて見づらかったため、blur・不透明度を大幅に縮小（lead: 0 1px 5px/0.45、sub: 0 1px 4px/0.55、points: 0 1px 4px/0.5）。白スクリムが背後にあるため小さめでも可読性は維持され、文字がくっきり。
- 主な変更ファイル：`src/styles/global.css`（`.hero-overlays`のtop、コンセプトtext-shadow）
- 判断・注意点：クリップ解除でコンセプトはヘッダー背面を通過する（＝ロゴと一瞬重なる editorial なパススルー表現）。ロゴは最前面で判読可能。オファーカード・キャッチコピーはヘッダーに達しないため見た目への影響は軽微（コピーはわずかに上へ移動するが従来どおりヘッダー下に収まる）。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820)を確認——進捗0.78〜0.9でコンセプト（kicker〜見出し）がロゴ背面を流れて通り抜け、ロゴは最前面で判読可、テキストのぼやけ（強い光彩）が解消。トップのキャッチコピーもヘッダー下で適正表示。
- 未対応・次の作業：ロゴとの一瞬の重なりが気になる場合は、ロゴ直下だけに極薄の下地を敷く等で調整可。

## 2026-07-14 — User

- ブランチ：`add-top-data-section`
- 関連PR：なし
- 変更内容：TOPページのハッシュタグカルーセル直下に「データで見る全力ストレッチ」セクションを追加。
- 主な変更ファイル：
  - `src/pages/index.astro`
  - `public/images/map-japan.svg`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：モノトーン＋ゴールド基調で、全国70店舗、年齢層、男女比、職業、リピート率を表示。
- 確認結果：これから確認。
- 未対応・次の作業：ビルド確認後、commit / push / PR作成。

## 2026-07-14 — ChatGPT Codex

- 担当：ChatGPT Codex
- ブランチ：`codex/data-redesign`
- 関連PR：TOP「データで見る全力ストレッチ」の誌面型リデザイン
- 変更内容：
  - 5枚の独立カードと大きな黒ベタ面を廃止し、細い罫線で1枚の誌面を分割する統合インフォグラフィックへ変更。
  - オフホワイト・墨黒・グレージュを中心に、ゴールドはデータのアクセントだけに限定。
  - 店舗数、年齢層、男女比、職業、リピート率の5指標を、PCでは3列×2段の約470px高に集約。
  - セクション見出しを横組みで圧縮し、PCではセクション全体が約724pxに収まる設計へ変更。
  - モバイルは可読性を優先し、店舗数／男女比を2列、その他を全幅で積むレスポンシブ構成にした。
  - データ部分を `DataSection.astro` へ分離し、TOPページ側の定義とマークアップを簡潔化。
- 主な変更ファイル：
  - `src/components/DataSection.astro`
  - `src/pages/index.astro`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：数値、データ注記、年齢区分、職業区分は変更していない。円グラフはCSSのconic-gradientで正確な比率を維持。
- 確認結果：`npm run build` 成功（19ページ）。`git diff --check` 成功。ローカル静的出力で新コンポーネントの生成を確認。
- 未対応・次の作業：Vercelプレビューで実機フォント読み込み後の最終見え方を確認する。

## 2026-07-14 22:12 JST — ChatGPT Codex

- ブランチ：`codex/data-redesign-update`（push先：`codex/data-redesign`）
- 関連PR：[PR #23 TOP「データで見る全力ストレッチ」の誌面型リデザイン](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/23)
- 変更内容：
  - ユーザー確認済みのモックアップを基準に、データセクションを画像ではなくHTML・CSS・SVGで再構築。
  - サイト既存のNoto Sans JP／Archivo Blackによる太いゴシック体へ統一。
  - 年齢層を中央の主役にし、70店舗、男女比、職業、リピート率を外周線のない非対称レイアウトで配置。
  - 4指標は70店舗＞リピート率＞男女比＞職業の順に大小を付け、データ同士を結ぶ装飾線を廃止。
  - 70店舗の背面へ低濃度の日本列島シルエットを追加し、既存の簡略地図SVGも認識しやすい列島形状へ更新。
  - 年齢層・男女比は正確な比率のCSS円グラフ、70店舗・リピート率はSVGの真円ドットリングで実装。
  - PCはセクション高を画面高に連動させて一画面へ収まりやすくし、スマホは年齢層→4指標の2列×2段へ再配置。年齢ラベルはスマホのみグラフ下の5列凡例へ切り替えた。
- 主な変更ファイル：
  - `src/components/DataSection.astro`
  - `public/images/map-japan.svg`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：数値と注記は既存仕様を維持。すべての円形要素に`aspect-ratio: 1`または正方形SVG viewBoxを使用し、画像拡大縮小で楕円にならない構造にした。日本地図は装飾扱いとして読み上げ対象外。
- 確認結果：`npm ci` 成功。`npm run build` 成功（19ページ）。`git diff --check` 成功。320〜600pxでは絶対配置のリーダー線を外すレスポンシブ指定と、横幅を超えない2列構成をコード確認。
- 未対応・次の作業：PR #23のVercelプレビューでPC・スマホ実機表示を最終確認し、問題がなければマージする。

## 2026-07-15 — ChatGPT Codex

- ブランチ：`codex/data-redesign-update-2`（push先：`codex/data-redesign`）
- 関連PR：[PR #23 レスポンシブデータインフォグラフィック](https://github.com/andsync-y/zn-stretch-gifu-nagara/pull/23)
- 変更内容：
  - スマホ／小型タブレットの表示順を「70店舗＋男女比」→「年齢層」→「職業＋リピート率」へ変更。
  - スマホの年齢層グラフを5列凡例から、各年代を円グラフ周囲へ配置する構成へ変更。
  - 年代ラベルと該当セグメントを結ぶモバイル専用SVGリーダー線と終点ドットを追加。
  - 実機確認で長く不揃いに見えたリーダー線を再調整。各セグメントの中心付近から外向きへ短く抜く形に統一し、50代の長い縦線を廃止。ラベルも該当セグメントの近くへ移動した。
  - PCの年齢層グラフも720×600の相対座標SVGへ変更し、5年代すべての線と終点を該当セグメントの中心角へ合わせた。
  - 簡略化しすぎていた日本地図を、地理データから生成した日本列島シルエットへ差し替え。
  - 男女比をCSS円錐グラデーションからSVG円弧へ変更し、上端のギザつきを解消。「女性20%」は色付き凡例としてグラフ上へ移動。
  - 1280px以上ではセクションタイトルを左カラム、縮小したデータ構成を右カラムへ配置。スマホの順番は維持。
  - PC・スマホ共通で、オフホワイト背景へ低コントラストのグリッド模様を追加。
  - PCのセクションタイトルを左端の1行固定へ調整し、不自然な途中改行を解消。
  - 年齢層グラフをCSS円錐グラデーションから5枚のSVGドーナツ扇形へ変更し、12時方向の境界に出ていたギザつきと描画の揺れを解消。
  - 男女比の「女性20%」を外部凡例からベージュの20%セグメント上へ移動し、数値と該当領域を直接対応させた。
  - セクション見出しを「DATAで見る」へ変更し、文字の「全力ストレッチ」は既存ブランドロゴ画像へ置換。PCでは見出し下に大きく左揃え、SPでは中央揃えで配置。
  - 70店舗の背景にある日本列島を点線円からはみ出すサイズまで拡大し、装飾の奥行きを強化。
  - 年齢層の「20代以下 5%」をグラフから上へ離し、重なりを解消。
  - 男女比のベージュ部分にある「女性20%」を拡大し、20%を女性ラベルより大きくして数値を優先する階層へ変更。
  - 男女比グラフの見出しを「お客様の男女比」へ変更し、指標の対象を明確化。
  - データセクション独自の42px／SP 28pxグリッドを廃止し、直前のハッシュタグカルーセルと同じ共通`section-grid`（48px）を適用。境界をまたいでマス目の幅と縦線位置が揃う構成へ変更。
- 主な変更ファイル：
  - `src/components/DataSection.astro`
  - `docs/AI_CHANGELOG.md`
- 判断・注意点：モバイル専用SVGは装飾扱いとし、既存の`aria-label`で年齢層の全数値を読み上げる構造を維持。円グラフは`aspect-ratio: 1`の正円を継続。グラフ本体は比率計算から生成するSVGパスとし、ブラウザごとの円錐グラデーション境界の差を避けた。
- 確認結果：`npm ci` 成功。`npm run build` 成功（19ページ）。`git diff --check` 成功。320px幅でも横スクロールを生まない正方形キャンバスと相対座標のリーダー線で実装。
- 未対応・次の作業：Vercelプレビューで実機フォント読み込み後の最終表示を確認する。

## 2026-07-14 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーローのスクロール軽量化＋展開スピードを遅く＋後続コンテンツをヒーローの上へ持ち上げるパララックス層（Codexのデータセクション取り込み後）
- 前提：Codex追加の`DataSection.astro`（データで見る全力ストレッチ）を本ブランチに取り込み済み。セクション順は HERO→MARQUEE→DATA→METHOD→…。
- 変更内容：
  - 【コンセプトのスクロール軽量化】ヒーローのスクロール連動で毎フレーム実行していた`getBoundingClientRect()`（＝強制リフローで重さの主因）を廃止。ヒーローの絶対位置`heroTop`とスクロール距離`heroDist`をロード時・リサイズ時のみ計測し、通常フレームは`window.scrollY`だけで進捗を算出。レイアウト読み取りゼロで、コンセプト区間のスクロール追従が軽くなる。
  - 【展開スピードを遅く】ヒーローのスクロール長をPC 360vh→460vh、SP 380svh→440svhへ延長。1スクロールあたりの進み方が緩やかになり、勢いよくフリックしても演出を見逃しにくい。
  - 【ヒーローの上を通るパララックス層】ヒーロー以降のコンテンツ全体を不透明な角丸シート`.hero-follow`（`margin-top:-7vh`／`border-radius:30px 30px 0 0`／上向きの影）で包み、固定表示されたヒーローの上に少し持ち上がって被さる層感を付与。スクロール末尾で後続コンテンツがヒーローの上を通り抜けるように見える。
- 主な変更ファイル：`src/pages/index.astro`（スクロール処理の最適化・`.hero-follow`ラッパー）／`src/styles/global.css`（ヒーロー高さ・`.hero-follow`）
- 判断・注意点：スクロール軽量化は堅実な最適化（強制リフロー除去）で全ブラウザ対応。パララックス層は控えめな第一版（重なり7vh）。より大きく「セクションがヒーローを覆う」ドラマチックな演出にする場合は、重なり量の増加や特定セクションのピン留めリビール化が次手（DATAセクションが後続の主役になったため、どのセクションを主に被せるかは要相談）。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820)・SP(390×844)を確認——進捗マッピング正常（scrollY基準で0→1）、コンセプト3点表示・ロゴ背面パススルー維持、末尾で角丸シートがヒーローの上へ持ち上がる層感、DATAセクションは角丸シート内で正常表示、モバイルも破綻なし。
- 未対応・次の作業：パララックス層をより強調する場合の調整（ユーザーの好み次第）。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：TOPにローディング表示を追加（未読込フレームの乱れた初期表示への対策）＋スクロール復元時の優先読込
- 変更内容：
  - 【背景】開いた直後にMVが乱れた見た目（未読込・モーションブラーの強いフレームが露出）になることがあるとの報告。フレーム先読みが揃う前にcanvas/フォールバックが見えてしまうのが原因。
  - 【ローディング表示】TOPページにエディトリアル調の全画面ローダー`.hero-loader`を追加。紙色（#f7f7f4）＋グリッド線＋中央ロゴ（ゆっくり明滅）＋キッカー「PHYSICAL CONDITIONING SALON — GIFU NAGARA」＋右下にArchivo Blackの巨大%カウント＋下端プログレスバー。完了で上方向へワイプ（0.8s / cubic-bezier(.76,0,.24,1)）して退場。
  - 【完了条件】初期表示に必要な24フレームの読込完了で解除。最低表示650ms（キャッシュ時の一瞬のチラつき防止）／最大3.8秒（遅い回線でも待たせすぎない強制解除）。JS無効時は`<noscript>`で非表示、`prefers-reduced-motion`ではローダー自体を出さない。
  - 【優先読込】リロード時にブラウザがスクロール位置を途中に復元した場合、現在位置周辺の8フレームを優先読込し、「先頭フレームだけが表示される不一致（乱れた見た目）」を短時間で解消。あわせて`load()`を、既読込・読込中のフレームでもコールバックが必ず呼ばれる形に修正（プリロードチェーンの停止防止）。
- 主な変更ファイル：`src/pages/index.astro`（ローダーのマークアップ・読込カウント・完了/タイムアウト制御・優先読込）／`src/styles/global.css`（`.hero-loader`一式・SPのキッカー縮小）
- 判断・注意点：ローダーはTOPのみ（フレーム素材を使うのがTOPだけのため）。z-index 90でヘッダー(50)・モバイルメニュー(49)・固定CTA(45)より上。%カウントは読込枚数/24の実測値。
- 確認結果：`npm run build` 成功（19ページ）。Chromium＋CDPネットワーク絞り（約200KB/s）で検証——PC/SPともローダーが表示され（4%表示の途中経過をキャプチャ）、遅い回線では3.8秒で強制解除→ワイプ退場→ヒーローが正常表示。通常回線では最低表示650ms後に退場。reduced-motionでは非表示。
- 未対応・次の作業：実機で乱れが再発する場合は、SP動画の先頭フレーム（モーションブラーの強いカット）差し替えも検討。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーロー上へのパララックス被せを本格化（重なり7vh→1画面分）
- 変更内容：
  - 前回の「後続コンテンツをヒーローの上へ持ち上げる」演出が重なり7vhと控えめすぎて体感できなかったため、`.hero-follow`の`margin-top`を`-100vh`（`svh`対応ブラウザは`-100svh`）へ拡大。ヒーロー（MV＋コンセプト）は最後までピン留めされたまま、角丸シート（マルキー→DATA→METHODの背景）がスクロールで1画面分せり上がって完全に覆う構成に。METHODの背景が到達した時点でヒーローが隠れる＝「メソッドの背景までヒーローを引っ張る」動き。
  - 被せ区間がヒーロー末尾の100vhを使うため、コンセプト静止時間確保にPCのヒーロー高さを460vh→500vhへ延長（SPは440svhのまま）。
  - `prefers-reduced-motion`では静的レイアウトが崩れないよう`.hero-follow`の持ち上げ・角丸・影をリセット。
- 主な変更ファイル：`src/styles/global.css`（`.hero-follow`のmargin/影・ヒーロー高さ・reduced-motionリセット）
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820)・SP(390×844)を確認——ヒーローがピン留めされたまま角丸シートがせり上がり、DATA→METHOD背景到達で完全に覆う。シートの角丸・影で層感が明確。reduced-motionは通常の続き物レイアウト。
- 未対応・次の作業：なし（被せの速度感・重なり量は実機の好みで追調整可）。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：METHOD背景を半透明化してヒーローを透かす＋ヒーローのピン留めをMETHOD終端まで延長（展開もさらにゆっくり）
- 変更内容：
  - 【METHOD透過】シート`.hero-follow`の背景を透明にし、各セクションが自前の背景を持つ構成へ。シート先頭のマルキーが角丸＋影＋不透明背景（シートの輪郭）を担い、DATAは元々不透明。METHODは半透明（rgba(236,237,234,0.84)）にして、背後にピン留めされたヒーローのMVを透かして見せる。PC(≥1024px・backdrop-filter対応)はすりガラス（alpha 0.62＋blur 14px）でプレミアムに、SPは描画コスト回避のため半透明のみ。
  - 【ピン留めをMETHOD終端まで】JS`sizeHero()`がMETHOD下端位置（シート上端からのオフセット）を実測し、ヒーロー高さ＝「1画面＋展開区間A＋被せ区間B」、シートの`margin-top`＝「-(1画面＋METHOD下端)」を動的に設定。METHODの下端が画面上端に達した瞬間＝SYMPTOMS（不透明・黒）到達と同時にヒーローが解放される。「ヒーロー演出の終わり＝METHODの終わり」を高さ実測で厳密に一致させ、レスポンシブ・文言変更にも自動追従。load/resizeで再計測。
  - 【展開をさらにゆっくり】展開区間AをPC4画面分・SP3.2画面分に拡大（従来はPC3画面相当）。`--hero-progress`は展開区間Aで正規化するように変更（既存のスクラブ・コンセプト・オファーのタイミング指定はそのまま流用可能）。
  - 【被せ進捗の追加】`--hero-cover`（シートが画面を覆う進捗0→1）を新設し、コンセプト・オファーカード・SCROLLサインをシート到達時にフェードアウト。METHODの透過背景越しにはテキストの残骸ではなく綺麗なMVだけが見える。
  - 【reduced-motion】動的サイズ調整・被せは行わず（インラインスタイル未設定）、CSS側のリセットで通常の続き物レイアウト。
- 主な変更ファイル：`src/pages/index.astro`（`sizeHero`・`--hero-cover`・進捗の正規化変更）／`src/styles/global.css`（シート透明化・マルキーへの角丸/影移設・METHOD半透明/すりガラス・cover連動フェード）
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820)——マルキー＋DATA（不透明）がヒーローを覆った後、METHODがすりガラスでMVを透かしながら通過し、METHOD下端が画面上端に達した直後にSYMPTOMSが画面上端に到達（ヒーロー解放のタイミング一致を確認）。SP(390×844)もMETHOD背景からMVが透け、可読性維持。実測値（PC: METHOD下端2633px→ヒーロー7553px／シートmargin -3453px）が計算通り。
- 未対応・次の作業：透け具合（alpha/blur量）は実機の好みで調整可。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：DATAセクション（データで見る全力ストレッチ）に入場アニメーションを追加
- 変更内容：
  - 【カウントアップ】全数値（全国70店舗／リピート率93%／男性80%／年齢層5点／職業4点）に`data-count`を付与し、ビューポート到達時に0から実数値へ約1.1秒（easeOutCubic）でカウントアップ。`<small>%</small>`は温存し数字のテキストノードだけ更新。
  - 【年齢ドーナツ】リング全体が-120°回転＋縮小から「ぐるん」と出現（1秒・バウンス系イージング）。引き出し線は0.7秒後にフェード、5つのラベルは0.62秒から70ms刻みで順に浮上。
  - 【男女比リング】黒い弧（男性80%）が`stroke-dasharray 0 100→80 20`で0%から描かれる（1.1秒）。女性ラベルは弧の到達後にフェードイン。
  - 【点線リング】70店舗・リピート率の点線円は`stroke-dashoffset`で点がわずかに回り込む控えめな動き。
  - 【職業リスト】4行が80ms刻みの時間差でフェードイン。
  - 【発火制御】`IntersectionObserver`（threshold 0.22）で一度だけ発火し、全体が約1.5秒で収束する控えめ設計。初期非表示はJSが`data-anim-ready`属性を付けた時のみ適用されるため、JS無効時はSSRの完成形がそのまま表示。`prefers-reduced-motion`ではスクリプト自体を起動せず静的表示。
- 主な変更ファイル：`src/components/DataSection.astro`（`data-count`付与・入場アニメCSS・IntersectionObserver＋カウントアップのスクリプト追加）
- 判断・注意点：「入れすぎると鬱陶しい」との要望に合わせ、発火は一度だけ・時間差は最小限・動きの種類はカウント/回転出現/弧の描画/微小な点回りの4種に限定。既存の`.rise`（ブロック全体のフェード）とも競合しない。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×900)——到達直後に70が40、93%が52%、80%が45%と実際にカウント中の中間状態を確認し、約1.5秒で全要素が完成形に収束（弧80/20・リング不透明度1・ラベル表示）。SP(390×844)でも発火・収束を確認。
- 未対応・次の作業：なし（速度・遅延は好みに応じて微調整可）。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：MVスクラブ動画の再生配分をピン留め全区間（METHODの終わりまで）へ引き延ばし
- 変更内容：
  - 従来は動画（PC169枚／SP106枚のWebP連番）が展開区間の42%で最終フレームに到達し、以降は静止画のままだった。フレームのマッピングを`SCRUB_END`基準からピン留め全区間（`heroDist`＝展開A＋被せB）基準に変更し、動画がMETHOD透過背景の背後でも進み続け、ヒーロー解放（METHOD終端）とほぼ同時に最終フレームへ到達するように。
  - フレーム枚数は増やさず既存素材を配り直し（1フレームあたりのスクロール量 約8px→約40px。隣接フレームの差が小さいため体感は維持。540枚への分割はデータ量が約3倍になり読み込みが重くなるため不採用）。
- 主な変更ファイル：`src/pages/index.astro`（`SCRUB_END`削除・フレームマッピングを`pTotal = scrolled/heroDist`へ変更）
- 判断・注意点：テキスト演出（コンセプト・オファー等）のタイミングは従来どおり展開区間A基準（`--hero-progress`）のまま。実機でフレームの段付きが気になる場合は、元動画から2倍補間（約340枚）を生成して差し替える追加手段あり（データ量2倍とのトレードオフ）。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820)——ピン留め区間の49%地点で動画が中盤シーン（施術ベッド）、75%地点（METHODすりガラス背後）で後半シーンと、全区間で進行することを確認。解放後はSYMPTOMSへ正常遷移。
- 未対応・次の作業：実機確認で段付きが気になれば2倍フレーム補間を検討。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ヒーロー上を通るセクションの背景をさらに薄く（コンセプト・DATA・METHOD・マルキー）
- 変更内容：
  - 「背景が濃くヒーロー演出が見えない」との要望に対応し、透過を全体的に強化。
  - コンセプトの白スクリム：PC 0.86/0.46→0.58/0.30、SP 0.94/0.5→0.72/0.38（グラデーションの各アルファ）。
  - DATAセクション（DataSection.astro）：不透明（--data-paper）→半透明 rgba(247,247,244,0.72)、PC(≥1024・backdrop-filter対応)は0.52＋blur(12px)のすりガラス。グラフ中心円など内部要素は不透明のまま維持。
  - METHOD：SP 0.84→0.66、PCすりガラス 0.62→0.44（blurは14→12px）。
  - マルキー（シート先頭）：#f7f7f4→rgba(247,247,244,0.78)（角丸・影は維持）。
- 主な変更ファイル：`src/styles/global.css`（スクリム・マルキー・METHOD）／`src/components/DataSection.astro`（セクション背景＋PCすりガラス）
- 判断・注意点：ヒーロー解放後は背後がbody（不透明の紙色）になるため、半透明でも通常閲覧時の見た目はほぼ従来どおり。METHOD本文はMVの明部と重なると薄めに見える箇所があるが判読可能（濃度は数値一つで再調整可能）。
- 確認結果：`npm run build` 成功（19ページ）。ChromiumでPC(1440×820)——コンセプト表示中に人物がはっきり見え、DATA・METHODのすりガラス越しにMVが明瞭に透け、数値・本文は判読可能。SP(390×844)も同様に確認。
- 未対応・次の作業：実機で「薄すぎ／まだ濃い」があれば各アルファを微調整。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：スクラブのガタつき対策＋コンセプトのスクリムをフラットな薄い白で地続きに＋マルキーの角丸削除
- 変更内容：
  - 【ガタつき対策①：スクラブ平滑化】フレーム切替を即時からlerp追従（毎フレーム目標へ22%ずつ接近）に変更。スクロール由来の1コマ単位の段付きが滑らかな再生になり、速いフリック時はキャッチアップ再生で追いつく。
  - 【ガタつき対策②：モバイルresize抑制】iOS等のURLバー伸縮が発する「高さだけのresize」のたびにヒーロー寸法を再計算してレイアウトが跳ねていたのを、幅が変わった時のみ再計算に変更。
  - 【コンセプトのスクリム】グラデーション（下・右へフェード）を廃止し、フラットな薄い白（PC rgba 0.5／SP 0.62）で画面全体を満たす形に。下端はステージ末端まで延長し、コンセプト下の不自然な余白と「グラデで透けてる見た目」を解消。後続シート（マルキー0.78）と地続きの一枚のガラス面に見える。
  - 【マルキーの角丸削除】シート先頭の`border-radius: 30px 30px 0 0`（アール加工）を削除。影も0.22→0.14に軽減してフラットな面の重なりに。
- 主な変更ファイル：`src/pages/index.astro`（スクラブlerp・resize幅ガード）／`src/styles/global.css`（スクリムのフラット化・延長、マルキーの角丸削除）
- 確認結果：`npm run build` 成功（19ページ）。SP(390×844)——コンセプト表示中は薄い白が画面下端まで途切れず、シート到達時も角丸なしで地続きに見える。PC(1440×820)も全面フラットな薄い白でMVが透け、オファーカードの視認性維持。スクラブ平滑化はコード検証（目標フレームへの収束）。
- 未対応・次の作業：実機でガタつきが残る場合は、lerp係数調整または2倍フレーム補間を検討。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：ローダー表示延長＋FIRST SESSION/コンセプトの出方を軽く＋スクラブ追従をよりナチュラルに
- 変更内容：
  - 【ローダー】最低表示時間を650ms→1150ms（+0.5秒）に延長。
  - 【FIRST SESSION/コンセプトの軽量化】オファーカードのスライド距離8vh→4vh・立ち上がり×14→×18（PC/SP両方）、コンセプトのフェードイン開始を早め（PC 0.2→0.18・×6→×8、SP 0.4→0.38・×7→×9）、登場モーションを短く軽い出方に。あわせてコンセプトの白スクリム（フラット化した巨大レイヤー）のオーバーレイ外へのはみ出しを縮小（PC bottom -120vh→-86vh・横幅も縮小、SP -120svh→-95svh）し、描画負荷を削減。
  - 【スクラブのナチュラル化】フレーム追従のlerp係数0.22→0.14・スナップ閾値0.6→0.4に変更。フリック後に映像がふわっと追いつく、より自然な再生感に。
- 主な変更ファイル：`src/pages/index.astro`（LOADER_MIN_MS・lerp係数）／`src/styles/global.css`（オファー/コンセプトのランプ・スクリム縮小）
- 判断・注意点：検証環境でローダーが14.6秒表示される事象を確認したが、原因はサンドボックスの外部ネットワーク断（Google Fonts等がERR_TUNNEL_CONNECTION_FAILEDで約13秒タイムアウトしDOMContentLoaded自体が遅延）で、ローダーのロジックは正常（done→最低表示→ワイプの遷移を確認）。本番環境では発生しない。
- 確認結果：`npm run build` 成功（19ページ）。PC(1440×820)でコンセプト表示中・巻き上がり後ともスクリムが全面途切れなし。オファー/コンセプトの新しいランプ値で表示確認。
- 未対応・次の作業：実機での体感確認（lerp係数・ランプはさらに調整可）。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：コンセプト＋FIRST SESSIONの振り付けを全廃し、シートに載せてパララックス通過だけに（軽量化の本命）
- 変更内容：
  - 【構造変更】ヒーロー内オーバーレイで`--hero-progress`連動のopacity/transform計算により表示していたコンセプトとFIRST SESSIONカードを、**シート（.hero-follow）先頭の通常セクション`.hero-intro`へ移動**。薄いガラス面（PC rgba 0.56／SP 0.64）に載って、固定MVの上をネイティブスクロールでそのまま通過する構成に。スクロール毎のスタイル再計算が消え、動きはコンポジタ（GPU）任せ＝根本的に軽い。
  - 【レイアウト】PCは左コンセプト・右カードの2カラム（従来の見え方を踏襲）、SPは縦積み（コンセプト→カード）。カードは常時タップ可能（inert制御廃止）。
  - 【削除したもの】`.hero-concept`/`.hero-offer`のcalc()連動アニメ・will-change・スクリム（::before）・`is-offer-visible`/`is-offer-leaving`/`inert`のJS制御・`OFFER_AT`。ヒーロー内は「キャッチコピーのフェード＋SCROLLサイン」のみ残存。
  - 【展開区間短縮】コンセプトがシート側へ移ったため、展開区間A（MVスクラブ単独区間）をPC 4→2.6画面・SP 3.2→2.2画面に短縮。ピン留め終端＝METHOD終端の同期はsizeHero()の実測で自動維持（イントロ分だけ被せ区間Bが自動的に増加）。
  - 【アンカー】`id="concept"`をヒーローから`.hero-intro`へ移動（ナビ「コンセプト」は新セクションへ遷移）。
  - 【reduced-motion】コンセプト・カードは通常フローになったため特別扱いを削除し、キャッチコピーは静的表示に変更。
- 主な変更ファイル：`src/pages/index.astro`（マークアップ移動・JS簡素化・A短縮）／`src/styles/global.css`（.hero-intro新設・旧アニメCSS削除・SP/reduced-motionブロック整理）
- 確認結果：`npm run build` 成功（19ページ）。PC(1440×820)——MVスクラブ後、ガラス面のイントロ（左コンセプト＋右カード）がMVの上を通過し、マルキー→DATAへ連続。SP(390×844)も縦積みで自然に流れ、カード3コース表示・タップ領域も健全。ヒーロー実測7247px・シートmargin -4295px（イントロ842px込みでMETHOD終端まで）と計算どおり。
- 未対応・次の作業：実機での体感確認。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：イントロの登場順を「FIRST SESSIONカード→コンセプト」に変更（カード先行の斜め構図）
- 変更内容：
  - 「コンセプトより先にファーストセッションのカードが出てほしい」との要望に対応。シート（.hero-follow）は下から迫り上がるため、上端に近い要素ほど先に姿を見せる。この特性を使い、カードを先に見せる構図へ再配置。
  - 【DOM順】`.hero-intro-grid`内で`.hero-offer`（FIRST SESSIONカード）を`.hero-concept`より前に移動。
  - 【PCレイアウト】2カラムのグリッド配置を明示化：カードを右上（grid-column:2 / row:1）、コンセプトを左下（grid-column:1 / row:1・margin-top clamp(120px,22vh,240px)）に置き、`align-items:start`で斜めの構図に。迫り上がり時にまず右上のカードが現れ、続いて左下のコンセプトが姿を見せる。
  - 【SPレイアウト】縦積みはDOM順どおり「カード→コンセプト」。grid-column/rowをautoへ戻し、コンセプトのmargin-topも0にリセット。
- 主な変更ファイル：`src/pages/index.astro`（`.hero-intro-grid`のDOM順入替）／`src/styles/global.css`（グリッド行列の明示配置・SPリセット）
- 確認結果：`npm run build` 成功（19ページ）。Chromium PC(1120×640)——迫り上がり途中で右上にFIRST SESSIONカード・左下にコンセプトが現れる斜め構図を確認。全景でもカード（3コース＋WEB予約）が上寄り、コンセプトが下寄りで先行が成立。SP(360×720)も「カード→コンセプト」の縦積みを確認。
- 未対応・次の作業：実機での体感確認。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：FIRST SESSIONカードの透過白パネル廃止＋コンセプトとの余白拡大＋SYMPTOMSをスマホで1秒ごと自動送り
- 変更内容：
  - 【カード背景】FIRST SESSIONカードの半透明白パネル（rgba(244,245,242,0.96)）を廃止し`background: transparent`に。イントロのガラス面（PC 0.56／SP 0.64）へ直接載り、MVがカード越しに薄く透けて地続きの見た目に。あわせて「浮いた白カード」を前提としたハードシャドウ（12px 12px 0）を削除し、枠線（1px）のみ残して価格表の区切りを維持。価格・ラベルの判読性は維持。
  - 【余白】SPの縦積み（カード→コンセプト）の間隔を`.hero-intro-grid`のgap 34px→52pxに拡大し、カードとコンセプトの間にゆとりを追加。
  - 【SYMPTOMS自動送り】ホバーが効かない端末（スマホ等）向けに、`InteractiveSymptoms.astro`へ自動切り替えを追加。ホバー不可（`!(min-width:768px and hover:hover)`）かつ`prefers-reduced-motion`でない場合のみ、1秒ごとに項目の赤ハイライトと骨格の赤ホットスポットを次の部位へ移動（DOM順で循環）。IntersectionObserver（threshold 0.25）で画面内表示中だけ回し、画面外では停止。入力方式・モーション設定の変化にも追従（PCへ切替時は停止して初期表示へ）。PCのホバー動作は従来どおり。
- 主な変更ファイル：`src/styles/global.css`（.hero-offer背景・影／SP gap）／`src/components/InteractiveSymptoms.astro`（自動送りロジック）
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで確認——SP(390)：カードが透過し枠線のみ、MVが薄く透け価格判読可、カード⇄コンセプト間の余白拡大を確認。PC(1120)：カード透過でも斜め構図・判読性維持。SP SYMPTOMSはdata-active が shoulder→lower-back→neck-eyes→lower-legs と1秒ごとに遷移し、骨格の赤発光も肩→腰→脚へ連動移動することをスクショ列で確認。
- 未対応・次の作業：実機での体感確認（自動送りの速度は1000msで調整可）。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：FIRST SESSIONカードを単独で浮かせる／カード⇄コンセプト余白拡大／カード出現を早める／SYMPTOMS自動送りを1.8秒に
- 変更内容：
  - 【カードを浮かせる】イントロ（.hero-intro）の周囲ガラス背景（PC 0.56／SP 0.64）を廃止し`transparent`に。カード周辺はMVがそのまま見える。カード（.hero-offer）は不透明パネル（rgba(248,248,245,0.97)）＋やわらかいドロップシャドウ（0 30px 60px / 0 10px 26px）に変更し、MVから持ち上がって単独で浮いて見える構成に。
  - 【コンセプトの可読性】ガラス背景廃止に伴い、コンセプト見出し・本文・箇条書きのtext-shadow（淡いハロー）を強化（2層化）。MV上でも判読できるようにしつつ、パネルは再導入しない。
  - 【余白拡大】SP縦積みのカード⇄コンセプト間隔をgap 52px→72pxへ。
  - 【カード出現を早める】「カードが出るまで気持ち長い」との声に対応し、MV展開区間A（迫り上がり前のスクラブ単独区間）をSP 2.2→2.0・PC 2.6→2.3画面に短縮。ピン留め終端＝METHOD終端の同期・フレーム配分（heroDist全体にマップ）は維持のまま、シートが早めに迫り上がる。
  - 【SYMPTOMS自動送り】スマホ等の自動切り替え間隔を1000ms→1800msに延長（感覚が短すぎたため）。
- 主な変更ファイル：`src/styles/global.css`（イントロ背景・カード浮遊化・コンセプトのハロー・SP gap）／`src/pages/index.astro`（unfoldLen係数）／`src/components/InteractiveSymptoms.astro`（interval 1800ms）
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで確認——SP(390)：カードが影付きで浮きMVが周囲に見える、カード⇄コンセプト余白拡大、コンセプトはハロー強化で判読可。PC(1120)：カード浮遊＋斜め構図維持、コンセプト判読可。SYMPTOMS自動送りは約7.2秒で4回遷移＝約1.8秒間隔を確認。
- 未対応・次の作業：実機での体感確認（コンセプトがMVの明部/繁部と重なる箇所の可読性、カード出現タイミング、送り速度は微調整可）。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：コンセプトは背景パネルを敷かず「濃いめの文字＋淡いハロー」でMV上の可読性を確保
- 変更内容：
  - 当初「コンセプト背景に薄く白を」との要望で半透明白パネルを検討したが、実機確認で「背景なしの方がかっこいい。ただし今のままだと視認性が悪い」との判断に。方針転換し、背景パネルは敷かずMVをそのまま見せたまま、文字側で可読性を担保する形に。
  - コンセプト本文（.hero-concept-sub）：色 #33373b→#16181b（ほぼ黒）、太さ 600→700。
  - 箇条書きの説明文（.hero-concept-points i）：色 #454b4f→#23262a、太さ 500→600。仕切り線も 0.2→0.28 に。
  - text-shadow を「オフセット付き」から「グロー型（0 0 Npx の淡い光ハロー）」に変更し、見出し・キッカー・本文・箇条書きに適用。MVの明部では文字色で、暗部・繁部ではハローで輪郭を確保。キッカーは色を #92745e→#7c5c46 に締めてハローを追加。
  - ※背景パネルは追加していない（カードは従来どおり単独で浮遊、周囲はMVが見える構成を維持）。
- 主な変更ファイル：`src/styles/global.css`（.hero-concept 系の文字色・太さ・text-shadow）
- 確認結果：`npm run build` 成功（19ページ）。Chromium SP(390@2x)——人物が前傾する繁雑なMVフレーム上でも、本文・箇条書き説明文がはっきり判読可能（従来グレー文字が背景に溶けていた箇所が改善）。PC(1120)も同様に判読可、カード浮遊＋背景なしの構図は維持。
- 未対応・次の作業：実機での体感確認。MVの特に明るい/暗い箇所での可読性は文字色・ハロー濃度でさらに微調整可。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SYMPTOMSのスケルトン（骨格）をスマホで約1.5倍に拡大
- 変更内容：
  - SP（≤767px）で骨格を約1.5倍に。左カラムの比率を 0.9fr→1.55fr（対リスト 1.1fr→1fr）に広げ、gapも10px→8pxに。
  - 空いていた左余白を活用するため、骨格パネル（.symptoms-visual）に`margin-left: -20px`を付与し、section左padding（px-5＝20px）を相殺して画面左端まで骨格を食い込ませる。結果、骨格幅は実測153px→228px（390幅）／約1.5倍に。
  - 骨格拡大でリスト幅が狭まるため、リスト側を微コンパクト化：矢印列 26px→20px、番号列 18px→14px、trigger gap 5px→4px・左右padding調整、ラベル 12px→11px（行高1.38）、矢印 14px→13px。長いラベル1件（腰痛…）のみ2行折り返し、他は1行に収まる。
  - ホバー／自動送り等の挙動は変更なし。
- 主な変更ファイル：`src/components/InteractiveSymptoms.astro`（SPメディアクエリのグリッド比・visualの左食い込み・リスト圧縮）
- 確認結果：`npm run build` 成功（19ページ）。Chromiumで確認——SP390：骨格228px（約1.5倍）で左端まで拡大、肩の赤発光も明瞭、リストは番号・ラベル・注記とも判読可（最長ラベルのみ2行）。SP360でも骨格210px（約1.5倍）で成立。
- 未対応・次の作業：実機確認。さらに大きく/小さくは左カラム比率で微調整可。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SYMPTOMSのスケルトンとリストの領域比率を再調整（項目が窮屈すぎた件）
- 変更内容：
  - 前回スケルトンを約1.5倍化した際にリスト列が狭くなり、長いラベル（腰痛…等）が2行折り返しで窮屈になっていた。SP列比率を 1.55fr→1.2fr（対リスト 1fr）に調整。
  - 実測（390幅）：骨格 228px→207px（元153px比 約1.35倍を維持）、リスト 134px→155px。全ラベル・注記が1行に収まる。左端食い込み（margin-left -20px）は維持し、骨格は依然大きく表示。
- 主な変更ファイル：`src/components/InteractiveSymptoms.astro`（SP列比率）
- 確認結果：`npm run build` 成功（19ページ）。Chromium SP390——骨格207pxで大きさ維持、リストは7項目すべて1行表示で余裕あり。SP360でも成立。
- 未対応・次の作業：実機確認。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：コラムのSEO/AIEO/LLMO強化（FAQ構造化データ対応）＋運用ガイド・キーワードバックログ整備
- 変更内容：
  - `ColumnLayout.astro` に任意プロップ `faq`（Q&A配列）を追加。渡すと記事末に「よくある質問」セクションを描画し、`FAQPage` 構造化データ（JSON-LD）を出力。AI検索のリッチリザルト＆LLMの引用・抽出に強くする。あわせて Article schema に `dateModified` を追加（省略時は公開日）。既存3記事は `faq` 未指定のため従来どおり（後方互換）。
  - `docs/COLUMN_SEO_GUIDE.md` を新規作成：更新頻度（週2〜3本推奨・毎日非推奨の理由＝スケールコンテンツ規制/YMYL）、キーワード選定の型（ローカル×症状×意図×属性/季節のロングテール）、AIEO/LLMO対応の記事構成テンプレ（結論先出し・質問形h2・FAQ・独自メソッド・内部リンク）、自動生成セッションの手順、公開＝レビュー運用、品質チェックリスト。人にもルーティン（自動セッション）にも実行可能な形。
  - `docs/column-backlog.md` を新規作成：優先順のキーワード/トピック30件超（slug/主要KW/意図/内部リンク先）。公開したらチェックを付ける方式で重複を防止。
- 主な変更ファイル：`src/layouts/ColumnLayout.astro`（faq/FAQPage・dateModified）／`docs/COLUMN_SEO_GUIDE.md`（新規）／`docs/column-backlog.md`（新規）
- 確認結果：`npm run build` 成功（19ページ、後方互換を確認）。
- 未対応・次の作業：Claudeのルーティン（スケジュールトリガー）で本ガイドに沿った自動生成を設定。既定は週3（月水金）・レビュー運用（作業ブランチへ下書き→ユーザー確認後に本番マージ）。頻度・全自動化はユーザー選択で変更可。

## 2026-07-15 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：SNS運用システム（AIコンテンツ運用基盤）向け `/content.json` を実装＋コラム一覧の単一ソース化
- 変更内容：
  - 「AIコンテンツ運用システム 設計図 v2」§12〜14に準拠し、`src/pages/content.json.ts`（Astro静的エンドポイント）を新設。症状7件・コラム3件・店舗情報1件の計11 itemsを ContentItem 形式（id/type/slug/title/summary/target/causes/keyPoints/tags/url/publishedAt/updatedAt）で出力。ビルド時生成＝公開済みコンテンツのみが載る。
  - `src/data/symptom-content.ts` 新設：症状ページ（src/pages/symptoms/*.astro の props）から causes・keyPoints・target 等を構造化。<br>タグ除去済み。症状ページ更新時はこのファイルと updatedAt も更新する運用。
  - `src/data/columns.ts` 新設＝コラム一覧の単一ソース（tags・relatedSymptoms付き）。`/column` 一覧（index.astro）と `/content.json` の両方がここを参照。index.astro のローカル articles 配列は削除。
  - `docs/COLUMN_SEO_GUIDE.md` の手順4を更新（新記事は src/data/columns.ts へ追加）。コラム自動生成ルーティンも同手順に合わせて再作成（旧trig_019MRw…を削除→trig_013sdqM57LnrKH7wcez1VgHi）。
  - ※SNS運用システム本体（Next.js/Supabase）は別プロジェクトのため本リポジトリでは実装しない（設計書§3の役割分担どおり、本サイトは構造化データの提供のみ）。
- 主な変更ファイル：`src/pages/content.json.ts`（新規）／`src/data/symptom-content.ts`（新規）／`src/data/columns.ts`（新規）／`src/pages/column/index.astro`（データ参照先変更）／`docs/COLUMN_SEO_GUIDE.md`
- 確認結果：`npm run build` 成功（19ページ）。dist/content.json に11 items（symptom×7・column×3・store×1）が設計書§14の形式で出力されることを確認。/column 一覧も従来どおり3記事表示。
- 未対応・次の作業：本番デプロイ後 `https://zn-stretch-gifu.com/content.json` で取得可能になる。SNS運用システム（Next.js）は置き場所（新規リポジトリ）確定後に別途構築。

## 2026-07-16 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：/content.json のコラムに selfCare（具体的手順）を追加
- 変更内容：
  - SNS運用システムが生成する投稿が「〜しましょう」の抽象文で終わり具体的なやり方（部位・秒数・回数）を含まない問題への対応。原因の一つが、/content.json のコラム情報が要約のみで記事内の実手順を含まないことだったため、`src/data/columns.ts` に `selfCare` フィールドを新設し、既存3記事の実際の手順（記事本文と一致）を構造化。`content.json.ts` で column アイテムに selfCare を出力。
  - `docs/COLUMN_SEO_GUIDE.md` 手順4を更新：新規コラム追加時は selfCare も必須で記載。
- 主な変更ファイル：`src/data/columns.ts`／`src/pages/content.json.ts`／`docs/COLUMN_SEO_GUIDE.md`
- 確認結果：`npm run build` 成功（19ページ）。dist/content.json の column:youtsu-morning-stretch に selfCare 6件を確認。
- 未対応・次の作業：本番デプロイ後、SNS側で「今すぐ同期」→再生成すると具体的手順入りの投稿になる。

## 2026-07-17 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/apply-design-patch-xbq1gz`
- 関連PR：お悩み別ページの料金リード文を90分コース推しに変更
- 変更内容：
  - 症状6ページ（katakori/kubi-ganseihiro/mukumi/shisei/sports/youtsu）の `priceLead` を、60分推し→**90分の全身ケアコースを主役**にした文章へ変更。各症状の文脈（肩こり＝姿勢や体の軸とつながる、腰＝股関節・お尻とセット等）に沿った理由付きで自然に誘導し、60分は「お時間の限られる方向け」の位置づけに。jiritsu は元々90分推しのため変更なし。
- 主な変更ファイル：`src/pages/symptoms/*.astro`（priceLead 6件）
- 確認結果：`npm run build` 成功（19ページ）。
- 未対応・次の作業：なし。

## 2026-07-29 — GitHub Actions（Claude）

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：コラム新規1本追加（夕方の脚のむくみ／authority型）
- 変更内容：
  - `docs/column-backlog.md` の未対応 `authority` 最上位「mukumi-yugata-ashi ｜ 夕方 脚 むくみ ふくらはぎ ストレッチ」を執筆し、`src/pages/column/mukumi-yugata-ashi.astro` を新設（ColumnLayout 使用・公開日 2026-07-29）。
  - 構成は `docs/COLUMN_SEO_GUIDE.md` 3章に準拠：結論先出しリード／h2を質問形（なぜ夕方になると脚がむくむ？／脚のむくみはふくらはぎだけの問題？／ふくらはぎを動かすセルフストレッチ5選／1日何回やればいい？／セルフケアで追いつかないと感じたら）／h3で秒数・回数を明記／`faq` 5問／独自メソッド「体感軸調整法」に言及／本文中に `/symptoms/mukumi` への内部リンク、`related` は mukumi・jiritsu・youtsu の3本。
  - 読者ターゲット（岐阜市周辺の40〜60代男性・デスクワーク中心）に合わせ、車移動・運転時間の長さを要因として扱い、席を立つタイミングに紐づける習慣化の提案を入れた。既存3記事（肩こり／朝の腰／ゴルフ）と検索意図は重複しない。
  - 薬機法・景表法に配慮し断定表現は使用せず（「〜と感じにくい」「体感として」等）。片脚のみの急なむくみ・痛み・熱感がある場合の受診案内を本文とFAQの両方に明記。
  - `src/data/columns.ts` の `COLUMNS` 先頭に新記事を追加（tags／relatedSymptoms／記事本文と一致する `selfCare` 6件）。`docs/column-backlog.md` の該当行を `- [x]` に更新。
- 主な変更ファイル：`src/pages/column/mukumi-yugata-ashi.astro`（新規）／`src/data/columns.ts`／`docs/column-backlog.md`
- 確認結果：`npm run build` 成功（19→20ページ）。
- 未対応・次の作業：次回の `authority` 最上位は「hiesho-shimohanshin ｜ 冷え性 ストレッチ 下半身 血流」。参照先が同じ `/symptoms/mukumi` になるため、本記事（夕方＝時間帯・ふくらはぎのポンプ）と意図が被らないよう、冷え＝下半身の血流・体温という切り口に分けること。

## 2026-08-01 — GitHub Actions（Claude）

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：コラム新規1本追加（冷え性の下半身ストレッチ／authority型）
- 変更内容：
  - `docs/column-backlog.md` の未対応 `authority` 最上位「hiesho-shimohanshin ｜ 冷え性 ストレッチ 下半身 血流」を執筆し、`src/pages/column/hiesho-shimohanshin.astro` を新設（ColumnLayout 使用・公開日 2026-08-01）。
  - 前回記録の申し送り（`/symptoms/mukumi` 参照が連続するため意図を分ける）に対応。前記事（夕方＝時間帯・ふくらはぎのポンプ・水分の滞り）と切り分け、本記事は「体の熱をつくる下半身の大きな筋肉」という切り口に統一。手順も前記事と重複しない5種目（足指グーパー＋足裏ほぐし／内もも／お尻／太もも前側／ハーフスクワット）で構成し、むくみが主な悩みの読者は本文中のリンクで前記事へ振り分ける形にした。
  - 構成は `docs/COLUMN_SEO_GUIDE.md` 3章に準拠：結論先出しリード／h2を質問形（なぜ冷えは下半身から気になりやすい？／足先を温めるだけでは足りない？／下半身のどこをゆるめればいい？／1日どのくらい、いつやればいい？／夏でも足先が冷たいのはなぜ？／セルフケアで追いつかないと感じたら）／h3で秒数・回数を明記／`faq` 5問／独自メソッド「体感軸調整法」に言及／本文中に `/symptoms/mukumi` と前記事への内部リンク、`related` は mukumi・前記事・jiritsu の3本。
  - 読者ターゲット（岐阜市周辺の40〜60代男性・デスクワーク中心）に合わせ、「冷えは女性の悩みと思われがち」という前提に触れ、車移動の長さ・冷房の効いたオフィスを具体例に採用。公開日が8月のため「夏でも足先が冷たいのはなぜ？」の季節セクションを追加。
  - 薬機法・景表法に配慮し、血流や体温に関する断定表現・効果の約束は使用せず（「〜と感じる方が多い」「体感の変化を得やすい」「送り返す手助けをしています」等）。片脚だけが冷たく色が悪い／歩くとふくらはぎが痛み休むと落ち着く／しびれを伴う場合の受診案内を、本文とFAQの両方に明記。
  - `src/data/columns.ts` の `COLUMNS` 先頭に新記事を追加（tags／relatedSymptoms／記事本文と一致する `selfCare` 6件）。`docs/column-backlog.md` の該当行を `- [x]` に更新。
- 主な変更ファイル：`src/pages/column/hiesho-shimohanshin.astro`（新規）／`src/data/columns.ts`／`docs/column-backlog.md`
- 判断・注意点：
  - アイキャッチ画像は今回も未設定。指示にあった `scripts/fetch-column-image.mjs` がリポジトリに存在せず（`scripts/` ディレクトリ自体が無い）、`ColumnLayout.astro` にも `image` / `imageCredit` プロップが無いため、画像の取得・表示のいずれもできない状態。既存4記事も同様に画像なしのため、既存の実装に合わせて記事本体のみで完成させた。
- 確認結果：`npm run build` 成功（20→21ページ）。`/content.json` のコラムが5件になり、`column:hiesho-shimohanshin` に selfCare 6件が出力されることを確認。
- 未対応・次の作業：
  - アイキャッチ運用を始める場合は、先に `ColumnLayout.astro` へ画像プロップ（`image` / `imageAlt` / `imageCredit`）を追加し、`scripts/fetch-column-image.mjs`（AI生成・フリー素材取得）を実装する必要がある。既存記事への画像後付けも同時に検討。
  - 次回の `authority` 最上位は「tachishigoto-mukumi ｜ 立ち仕事 むくみ 対策」。`/symptoms/mukumi` 参照が3本連続になるため、座り仕事を前提とした既存2本とは逆の「立ち続けて脚に負担が集中する」層に絞り、意図の重複を避けること。

## 2026-08-01 — GitHub Actions（Claude）

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：コラム新規1本追加（立ち仕事のむくみ対策／authority型）
- 変更内容：
  - `docs/column-backlog.md` の未対応 `authority` 最上位「tachishigoto-mukumi ｜ 立ち仕事 むくみ 対策」を執筆し、`src/pages/column/tachishigoto-mukumi.astro` を新設（ColumnLayout 使用・公開日 2026-08-01）。
  - 前回記録の申し送り（`/symptoms/mukumi` 参照が3本連続になるため意図の重複を避ける）に対応。既存2本は「座りっぱなし（夕方・時間帯）」「冷え性（下半身の熱づくり）」が主軸のため、本記事は「立ち続けて筋ポンプが働かない静止性の負荷」という逆の前提に統一。手順も立ったままできる種目（その場足踏み＋重心シフト／立ちカーフレイズ／足指グーパー＋足裏踏みしめ）を中心に構成し、既存2本の主要種目とは重複しない組み立てにした。
  - 構成は `docs/COLUMN_SEO_GUIDE.md` 3章に準拠：結論先出しリード／h2を質問形（なぜ立ち仕事だとむくみやすい？／デスクワーク中心でも「立ちっぱなし」になる場面は多い／立ち仕事のむくみ対策｜勤務中・休憩時にできるセルフストレッチ5選／立ったまま気をつけたい姿勢のコツ／1日どのくらい、いつやればいい？／セルフケアで追いつかないと感じたら）／h3で秒数・回数を明記／`faq` 5問／独自メソッド「体感軸調整法」に言及／本文中に `/symptoms/mukumi` と前記事（mukumi-yugata-ashi）への内部リンク、`related` は mukumi・mukumi-yugata-ashi（コラム）・jiritsu の3本。
  - 読者ターゲット（岐阜市周辺の40〜60代男性・デスクワーク中心・ゴルフをする層）が「立ち仕事」を自分ごと化できるよう、立ち会議・来客対応・出張先の展示会や工場巡回・休日の洗車や草むしり・ゴルフのラウンド（歩行＋立位が数時間続くスポーツ）を具体例として本文中に挙げた。
  - アイキャッチ画像を新設：`node scripts/fetch-column-image.mjs --slug tachishigoto-mukumi --source ai --prompt "a tired middle-aged businessman standing on a train platform in the evening, resting his hand on his lower leg after a long day of standing work"` でAI生成し、`public/images/column/tachishigoto-mukumi.webp` として保存。`imageCredit` はスクリプト出力の「※画像はイメージです」をそのまま設定。既存5記事は画像プロップ未設定のまま（本記事のみ新規に画像あり）。
  - 薬機法・景表法に配慮し断定表現は使用せず（「〜と感じやすい」「体感として」等）。片脚だけが急に大きくむくむ／押すと跡が残る／痛みや熱感を伴う場合の受診案内を、本文とFAQの両方に明記。
  - `src/data/columns.ts` の `COLUMNS` 先頭に新記事を追加（tags／relatedSymptoms／記事本文と一致する `selfCare` 6件）。`docs/column-backlog.md` の該当行を `- [x]` に更新。
- 主な変更ファイル：`src/pages/column/tachishigoto-mukumi.astro`（新規）／`src/data/columns.ts`／`docs/column-backlog.md`／`public/images/column/tachishigoto-mukumi.webp`（新規）
- 確認結果：`npm run build` 成功（21→22ページ）。`/content.json` のコラムが6件になり、`column:tachishigoto-mukumi` が先頭に出力され `selfCare` 6件が本文と一致することを確認。
- 未対応・次の作業：
  - 次回の `authority` 最上位は「首こり・眼精疲労」カテゴリの「smartphone-kubi ｜ スマホ首 ストレートネック セルフケア」。内部リンク先は `/symptoms/kubi-ganseihiro` で、これまでの `/symptoms/mukumi` 連続からは切り替わる。
  - 既存5記事（画像未設定）へのアイキャッチ後付けは、本記事のスコープ外として未対応のまま。着手する場合は既存記事を変更しない今回の制約と別枠で検討が必要。

## 2026-08-03 — GitHub Actions（Claude）

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：コラム新規1本追加（スマホ首・ストレートネック対策／authority型）
- 変更内容：
  - `docs/column-backlog.md` の未対応 `authority` 最上位「smartphone-kubi ｜ スマホ首 ストレートネック セルフケア」を執筆し、`src/pages/column/smartphone-kubi.astro` を新設（ColumnLayout 使用・公開日 2026-08-03）。
  - 前回記録の申し送りどおり、内部リンク先を `/symptoms/mukumi` から `/symptoms/kubi-ganseihiro` へ切り替え。既存の `katakori-desk-stretch`（肩甲骨まわし・胸開き・首の横伸ばし・背中丸め・体側伸ばし）と種目が重複しないよう、本記事は「頭が前に出る姿勢を戻す」あご引き・うなずき運動・首の前側ストレッチ・肩甲骨引き寄せ・壁を使った姿勢リセットの5種目に統一し、意図も「肩甲骨をゆるめる」ではなく「スマホ首・ストレートネックの姿勢を戻す」に分けた。
  - 構成は `docs/COLUMN_SEO_GUIDE.md` 3章に準拠：結論先出しリード／h2を質問形（スマホ首・ストレートネックは、なぜ起こる？／セルフストレッチ5選／スマホを見るときに気をつけたい持ち方／1日どのくらい、いつやればいい？／セルフケアで追いつかないと感じたら）／h3で秒数・回数を明記／`faq` 5問／独自メソッド「体感軸調整法」に言及／本文中に `/symptoms/kubi-ganseihiro` と既存コラム（katakori-desk-stretch）への内部リンク、`related` は kubi-ganseihiro・katakori-desk-stretch（コラム）・shisei の3本。
  - 読者ターゲット（岐阜市周辺の40〜60代男性・デスクワーク中心）に合わせ、パソコンとスマホ操作の両方が重なる生活を前提に、通勤中・信号待ちなどうつむく時間が長くなる具体場面を挙げた。
  - アイキャッチ画像を新設：`node scripts/fetch-column-image.mjs --slug smartphone-kubi --source ai --prompt "a Japanese middle-aged man sitting at a bright office desk in the morning, looking up from his smartphone and gently stretching his neck with a relaxed positive expression, sunlight through the window"` でAI生成し、`public/images/column/smartphone-kubi.webp` として保存。`imageCredit` はスクリプト出力の「※画像はイメージです」をそのまま設定。
  - 薬機法・景表法に配慮し断定表現は使用せず（「〜と感じやすくなります」「近づきやすくなります」等）。首を大きく回す動きは種目に含めず、しびれ・めまい・強い頭痛を伴う場合の受診案内を本文とFAQの両方に明記。
  - `src/data/columns.ts` の `COLUMNS` 先頭に新記事を追加（tags／relatedSymptoms／記事本文と一致する `selfCare` 6件）。`docs/column-backlog.md` の該当行を `- [x]` に更新。
- 主な変更ファイル：`src/pages/column/smartphone-kubi.astro`（新規）／`src/data/columns.ts`／`docs/column-backlog.md`／`public/images/column/smartphone-kubi.webp`（新規）
- 確認結果：`npm run build` 成功（22→23ページ）。
- 未対応・次の作業：
  - 次回の `authority` 最上位は「首こり・眼精疲労」カテゴリの「ganseihiro-kubikori ｜ 眼精疲労 首こり ストレッチ」。内部リンク先は同じ `/symptoms/kubi-ganseihiro` になるため、本記事（姿勢のクセ・骨の並び）とは異なり、目の疲れと首こりの相互関係という切り口に分けること。
  - 既存記事（画像未設定分）へのアイキャッチ後付けは引き続きスコープ外。
## 2026-08-03 — Claude Code

- 担当：Claude Code
- ブランチ：`claude/lp-proposal`（提案用・未マージ）
- 変更内容：
  - 広告専用LP `/lp` のプレビューを新設（HP改修提案の資料。承認前のため本番未反映・広告遷移先も未変更）。
  - FVで広告の約束（初回最大75%OFF・¥3,300/¥4,900）を即提示し、WEB予約/LINE/電話の3CTA＋LINE入りスティッキーバーを設置。noindex。
  - Base.astro に `minimal` プロップ（ヘッダー/フッター/共通CTAバー非表示）と `head` スロットを追加。
- 確認結果：`npm run build` 成功（20ページ）。/lp はHTML24KB・全長6,368px（TOP比1/3）。noindexがhead内に出力されることを確認。
- 未対応・次の作業：ユーザー承認後に本番ブランチへマージし、広告の遷移先を /lp に変更。Phase B（CTAバーLINE追加等）以降を実施。

## 2026-08-03 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/lp-proposal`（提案用・未マージ）
- 変更内容（Phase 2の事前実装。ユーザー承認後にPhase 1と同時反映する）：
  - モバイル固定CTAバーに「LINE相談」を追加（電話／LINE／WEB予約の3択化）。
  - TOPヒーローに初回オファーバッジ（最大75%OFF ¥3,300〜→HPBクーポン）を追加。既存の登場アニメに追従。
  - ローダー短縮：必要フレーム24→10枚、最低表示1150→350ms、上限3800→2500ms。
- 確認結果：`npm run build` 成功（20ページ）。モバイル実機相当のスクリーンショットでFVバッジ・3択バー表示を確認。
- 未対応・次の作業：ユーザーのOK後に本番へマージ→広告遷移先を /lp へ変更。


## 2026-08-04 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp FVのキャッチコピーを「ガチガチの体が、じんわりゆるむ。」に差し替え（「ゆるむ」をアンバー強調）。キャプションは「癒しで終わらない。もみほぐしでは届かない"深い伸び"を体感してください。」（モバイル3行割り）。
  - クチコミ用アバターの生成スタイルを、線画フラット（日本のフリー素材風：均一な濃紺線・白ベース＋差し色1色・陰影なし）に変更（gen-avatars.mjs）。再生成はgen-avatars.ymlで実行。
- 確認結果：`npm run build` 成功（20ページ）。モバイル幅390/430のスクリーンショットでFVの行割り・強調表示を確認。
- 未対応・次の作業：アバター再生成の結果確認と反映（ファイル名同一のため差し替えのみ）。gen-avatars.yml/gen-avatars.mjsはアバター確定後に削除予定。

## 2026-08-04 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容（/lp の一括改修）：
  - ヘッダーのロゴ右隣に「岐阜長良店」を追加。
  - MV背景写真を新しい施術写真に差し替え（lp-hero2.webp。スタッフの顔が入らない位置でトリミング・1200x982・33KB）。
  - クチコミを2段の自動スクロール（マーキー）に変更。1段目は左→右、2段目は右→左。掲載を7件→全10件に拡大し、追加3件用のアバター（20代男・30代男眼鏡・30代女）をAI生成（男6:女4）。ホバーで一時停止、prefers-reduced-motion時は停止。
  - クロージングの見出しを「その肩と腰に向き合うなら、今日がいちばん早い日です。」に修正（旧文の違和感解消）。
  - ページ全体を「常時スマホ幅（430px）＋PCでは左右をブランドパネルで飾るアプリ枠」形式に変更。コンテンツ内のレスポンシブ分岐（sm:）を撤去し、PC用に左パネル（ロゴ・店名・キャッチ）と右の縦書き装飾を追加。スティッキーCTAも列幅に合わせて中央固定化。
- 確認結果：`npm run build` 成功（20ページ）。モバイル390px・デスクトップ1440pxのスクリーンショットでFV・マーキー・アプリ枠表示を確認。
- 未対応・次の作業：アバター確定後に gen-avatars.mjs / gen-avatars.yml を削除。

## 2026-08-04 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチを映画タイトル風タイポグラフィに変更。明朝体（Shippori Mincho 800）で文字サイズに強弱（「体」「ゆるむ」を大きく、助詞を小さく）を付け、同一ベースラインで組む形式。強調ボックスは廃止。
  - フォントはGoogle Fontsのtext=パラメータで使用13文字のみのサブセット配信（woff2 約17KB）。PC左パネルのキャッチも同タイポに統一。
- 確認結果：`npm run build` 成功（20ページ）。サンドボックスのブラウザは外部フォント取得不可のため、同一woff2をローカル配信に差し替えて実レンダリングを確認（本番はGoogle Fonts直配信・TOPで既にGoogle Fonts使用実績あり）。
- 未対応・次の作業：なし（アバター確定後の gen-avatars 削除は継続）。

## 2026-08-04 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチをオーナー支給のタイポ画像に差し替え（「ガチガチの身体が、じんわりゆるむ。」）。支給画像（黒文字・白背景）を余白トリム→白抜き・背景透過webpに加工（960x312・49KB）。h1のaltでテキストを担保。
  - PC左パネルのキャッチも同画像に統一。前回導入したサブセットwebフォント（Shippori Mincho）と.lp-catch CSSは不要になったため撤去。
- 確認結果：`npm run build` 成功（20ページ）。モバイル390px・デスクトップ1440pxのスクリーンショットで表示確認。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチをタイポ画像からテキストに戻し、やさしい明朝（Shippori Mincho 600・使用グリフのみサブセット配信）＋縦長スケール（scale 0.9,1.12）で組み直し。表記は支給タイポに合わせ「身体」を継続。lp-catch.webp は削除。
  - PC左パネルも同じ組みに統一（中央揃え用にtransform-originを分離）。
- 確認結果：`npm run build` 成功（20ページ）。サブセットwoff2をローカル配信に差し替えた実レンダリングでモバイル・PC表示を確認。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチの書体を明朝からゴシックに変更。PC/Macは遊ゴシック（システムフォント）、遊ゴシックが無いスマホは近似のZen Kaku Gothic New 700（使用グリフのみサブセット配信・約5KB）にフォールバック。縦長スケール・サイズ強弱の組みは維持。
- 確認結果：`npm run build` 成功（20ページ）。サブセットwoff2をローカル配信した実レンダリングでモバイル・PC表示を確認。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチの書体を黒華明朝（KuroHanaMincho ExtraBold・SIL OFL-1.1・RFN宣言なし）に変更。オーナーがBOOTHから取得したTTFを使用15グリフのみサブセット化してwoff2（5.4KB）で自前配信（public/fonts/）。ライセンス表記を public/fonts/OFL-KuroHanaMincho.txt に同梱し、preloadで先読み。
  - 書体自体が縦長のため縦長スケールを scale(0.96,1.06) に緩和。Google Fonts（Zen Kaku Gothic New）読み込みは撤去。
- 確認結果：`npm run build` 成功（20ページ）。モバイル390px・デスクトップ1440pxのスクリーンショットで黒華明朝の表示を確認（自前配信のため全デバイス同一表示）。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチを約2倍サイズの4行ポスター組みに変更（ガチガチの／身体が、／じんわり／ゆるむ。最大80px・行ごとに字下げで階段状の動き）。2行組みでは「じんわりゆるむ。」8文字が幅上限のため行を分割して拡大。行間を1.12に圧縮。
- 確認結果：`npm run build` 成功（20ページ）。モバイル390pxのスクリーンショットで表示確認。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチを4行ポスター組みから2行組みに戻し、幅いっぱいまで拡大（最大54px・従来44px比で約1.2倍）。縦書き2列案も試作したが、縦方向の占有が過大なため不採用（スクリーンショット比較のみ）。
- 確認結果：`npm run build` 成功（20ページ）。モバイル390pxのスクリーンショットで2行版・縦書き版を比較確認。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチを意味の切れ目で3行に分割し大型化（ガチガチの身体が、／じんわり／ゆるむ。）。「じんわり」64px（従来32px比2倍）・「ゆるむ」92px（従来54px比1.7倍）で結びを視線の終点に。字間を0.04em→0.02emに調整して幅内に収めた。
- 確認結果：`npm run build` 成功（20ページ）。モバイル390pxのスクリーンショットで表示確認。
- 未対応・次の作業：なし。

## 2026-08-05 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - /lp メインキャッチを「その身体の悩みに、直接届く。」に変更。3行組み（その身体の／悩みに、／直接届く。）で結び76pxの視線終点構成は維持。
  - 書体を遊ゴシック（PC/Macシステム）＋Zen Kaku Gothic New 700（スマホ用サブセット約4KB・Google Fonts text=配信）に変更。黒華明朝のwoff2/ライセンスファイルは再利用に備えて残置（未参照）。PC左パネルも新コピーに更新。
- 確認結果：`npm run build` 成功（20ページ）。サブセットwoff2ローカル配信の実レンダリングでモバイル・PC表示を確認。
- 未対応・次の作業：なし。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - Windsor MCPコネクタの接続断で広告デイリー監視Routineが失敗する問題の恒久対策として、GitHub Actions中継（windsor-data.yml + scripts/fetch-windsor-data.mjs）を新設。毎朝JST8:00にWindsor REST API（要 WINDSOR_API_KEY シークレット）からMeta/Google/GA4の数字を取得し、windsor-dataブランチへ[skip ci]付きで強制コミット。監視Routineはgit経由でJSONを読む（MCP不依存）。一部クエリ失敗は許容し取得分を保存。
- 確認結果：構文チェックのみ（実行はWINDSOR_API_KEYシークレット登録後にworkflow_dispatchで検証予定）。
- 未対応・次の作業：ユーザーによるWINDSOR_API_KEYのGitHubシークレット登録→テスト実行→Routineプロンプトのデータソース切替。

## 2026-08-07 — GitHub Actions（Claude）

- ブランチ：`claude/column-auto`
- 関連PR：なし
- 変更内容：
  - コラムバックログ（`docs/column-backlog.md`）の `authority` 型から最上位の未対応「ganseihiro-kubikori（眼精疲労 首こり ストレッチ）」を選び、新規コラム記事を1本作成。
  - 眼精疲労と首こりが同時に起こりやすい仕組みと、目のまわり・後頭部・首すじをゆるめるセルフストレッチ5選、頻度の目安を解説。既存の「smartphone-kubi」（姿勢・スマホ首特化）とは意図を分け、目と首の関係解説として重複を避けた。
  - アイキャッチ画像はAI生成（`scripts/fetch-column-image.mjs --source ai`）。明るいオフィスで席を立ち首や肩を伸ばす日本人男性のイメージ。
- 主な変更ファイル：
  - `src/pages/column/ganseihiro-kubikori.astro`（新規）
  - `public/images/column/ganseihiro-kubikori.webp`（新規）
  - `src/data/columns.ts`（COLUMNS配列の先頭に追加）
  - `docs/column-backlog.md`（該当行を `- [x]` に更新）
- 判断・注意点：
  - faqプロップに5問、独自メソッド「体感軸調整法」への言及、`/symptoms/kubi-ganseihiro` への内部リンクを含めた。
  - 薬機法・景表法に抵触する断定表現（治る・治療・解消・矯正等）は使用していないことを確認済み。
- 確認結果：`npm run build` 成功（24→25ページ）。
- 未対応・次の作業：ユーザーによるレビュー後、本番ブランチ `claude/zenkara-gifu-nagara-seo-ukz0er` へのマージ（本記録の時点では未マージ）。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - コラム自動生成が8/5に失敗していた原因を特定し修正。`docs/AI_CHANGELOG.md` の末尾追記どうしが
    appendモードのマージで必ず衝突していたため、`.gitattributes` で `merge=union` を指定。
  - Vercelのプレビュービルド失敗（メール通知）の原因を特定。データ中継用の `windsor-data` ブランチ
    （JSONのみでサイトのソースを含まない）がプレビュー対象になっていた。`vercel.json` の
    `git.deploymentEnabled` でこのブランチのデプロイを無効化。本番デプロイには影響なし。
  - Google広告の入札戦略切替（MAXIMIZE_CONVERSIONS）と予算¥6,000への変更を確認・記録。
    自動リバートの実行手順（campaign_id・パラメータ）を docs/ads-ops-guardrails.md に確定。
- 確認結果：ワークフローの構文確認済み。次回の自動実行で効果を検証する。
- 未対応・次の作業：デイリー監視Routineのプロンプト更新（管理ツールが認証待ちのため保留）。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - SEO自動運転システムの設計書 docs/SEO_AUTOPILOT.md を新規作成。7プロセス（サイト構築〜リライト）の現状マップ、アーキテクチャ、各ワークフローのプロンプト全文、実装ロードマップ6段階、コスト試算、目標のキャリブレーションを記載。実装は未着手（設計のみ）。
- 確認結果：ドキュメントのみのため対象外。
- 未対応・次の作業：Phase 1（品質GATE）の実装承認待ち。Phase 2はオーナーによるWindsorでのSearch Consoleコネクタ認証が前提。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容（SEO自動運転 Phase 1: 品質GATE ＋ キャラクター挿絵）：
  - scripts/lint-column.mjs 新設：薬機法NG表現・画像出典表記・alt誤認・内部リンク実在・FAQ数・columns.ts登録・体感軸調整法言及を機械チェック（自店実写真とAI/フリー画像で基準を分岐。レガシー3本はFAQ免除）。
  - scripts/gen-stretch-illustrations.mjs 新設：固定キャラクター（scripts/assets/stretch-character-ref.png・16ポーズ設定表）を参照画像にしたOpenAI images/editsで、記事内ストレッチ手順の挿絵を生成（900px webp・記事あたり3〜5枚・quality medium）。
  - column-auto.yml 改修：生成→lint→AIレビュー（自己修正）→lint再判定→ビルド→**PASSなら自動マージ公開／FAILなら「要人間確認」ラベルで保留**。記事プロンプトに挿絵生成手順（参照ポーズ縛り・figcaption「イラストはイメージです」必須・曲芸ポーズ禁止）を追加。
- 確認結果：lint全記事PASS（8ファイル）。E2Eはworkflow_dispatchで検証実行。
- 未対応・次の作業：Windsor側にSearch Consoleコネクタが未出現のためGSC取得は保留（Phase 2）。

## 2026-08-07 — GitHub Actions（Claude）

- ブランチ：`claude/column-auto`
- 関連PR：なし
- 変更内容：
  - コラムバックログ（`docs/column-backlog.md`）の `authority` 型から最上位の未対応「pc-kubikori-reset（パソコン 首こり 1時間ごと リセット）」を選び、新規コラム記事を1本作成。
  - パソコン作業で首こりが悪化しやすい理由と、1時間ごとに区切って行う首こりリセットストレッチ4選（ばんざい・肩甲骨引き寄せ・首の側屈・胸開き）、習慣を続けるコツを解説。既存の「smartphone-kubi」（姿勢・ストレートネック特化）「ganseihiro-kubikori」（目と首の関係解説）とは、時間で区切って習慣化する角度で意図を分け、重複を避けた。
  - アイキャッチ画像はAI生成（`scripts/fetch-column-image.mjs --source ai`）。明るいオフィスでパソコン作業の合間に伸びをする40代男性のイメージ。
  - 記事内4手順すべてに、固定キャラクター「ZNちゃん」のストレッチ挿絵をAI生成して挿入（`scripts/gen-stretch-illustrations.mjs`）。
- 主な変更ファイル：
  - `src/pages/column/pc-kubikori-reset.astro`（新規）
  - `public/images/column/pc-kubikori-reset.webp`（新規）
  - `public/images/column/stretch/pc-kubikori-reset/`（新規4枚）
  - `src/data/columns.ts`（COLUMNS配列の先頭に追加）
  - `docs/column-backlog.md`（該当行を `- [x]` に更新）
- 判断・注意点：
  - faqプロップに5問、独自メソッド「体感軸調整法」への言及、`/symptoms/kubi-ganseihiro` への内部リンクを含めた。
  - 薬機法・景表法に抵触する断定表現（治る・治療・解消・矯正等）は使用していないことを確認済み。
  - `node scripts/lint-column.mjs` で対象ファイルをチェックしPASSを確認。
- 確認結果：`npm run build` 成功（25→26ページ）。
- 未対応・次の作業：ユーザーによるレビュー後、本番ブランチ `claude/zenkara-gifu-nagara-seo-ukz0er` へのマージ（本記録の時点では未マージ）。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容（キャラ挿絵の品質改善：シーン間の顔ブレ対策）：
  - 生成方式を3周の比較テスト（旧設定／設定改善版gpt-image-1／gpt-image-2／グリッド一括×両モデル）で検証し、**gpt-image-2 × グリッド一括生成 × input_fidelity=high** を既定に採用。全ポーズを1回の生成で1枚に描かせてから分割するため、シーン間で顔・画風が構造的に揃う（オーナー提供の設定表内で顔が揃うのと同じ原理）。参照画像は設定表＋顔クローズアップ（character-face-ref.png・新規）の2枚構成。
  - 公開済み記事 pc-kubikori-reset の挿絵4枚を新方式の生成物に差し替え。
  - 比較用の一時ワークフロー illust-test.yml を削除（結果はillust-testブランチに残置）。
  - 費用: グリッド化により記事あたり約¥120→約¥40に低減。
  - 備考: chatgpt-image-latest は images/edits 非対応のため不採用。
- 確認結果：品質GATE PASS（9ファイル）・ビルド成功。
- 未対応・次の作業：なし。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容（挿絵方針の転換：生成→固定ライブラリ選択）：
  - オーナー判断により、挿絵のAPI生成を全面的に取りやめ。**オーナーがChatGPTで作成した公式キャラ設定表（16ポーズ）をそのまま16分割し、public/images/stretch-poses/ の固定アセットライブラリ化**（キャラの見た目はChatGPT生成物が「正」。API生成では画風の再現に限界があるとの結論・比較テスト3周の結果）。
  - src/data/stretchPoses.ts 新設（16ポーズの内容・姿勢・手順のマニフェスト）。コラム生成ワークフローは「ライブラリから選択」方式に変更（記事の種目自体をライブラリから選ぶ。未収載の動きは挿絵なし＋作業記録に連絡を残し、オーナーがChatGPTで追加生成して拡張する運用）。
  - lint拡張：全img srcの実在チェック・同一ポーズ画像の重複使用禁止・stretch-poses挿絵の注記必須。
  - 公開記事 pc-kubikori-reset の挿絵をライブラリ（pose-16/01/06）に差し替え。手順2（肩甲骨引き寄せ）は該当ポーズ未収載のため挿絵なし。**ポーズ未収載: 座位で肩甲骨を背骨に寄せる動き（リクエスト）**。生成画像ディレクトリは削除。
  - gen-stretch-illustrations.mjs は未使用化（ファイルは残置）。
- 確認結果：品質GATE PASS（9ファイル）・ビルド成功。
- 未対応・次の作業：なし。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容：
  - ポーズライブラリの切り出しを修正。設定表の行高が不均等（366/343/291/254px）だったため、バッジ行の色検出で実際の行境界（y=0/366/709/1000）を特定して16コマを再切り出し。列は均等（x=0/313/625/938）。
  - stretchPoses.ts に各コマの実寸（width/height）を追加し、記事とワークフローのimgタグに反映。
- 確認結果：品質GATE PASS・ビルド成功・記事内表示をスクリーンショットで確認（コマの見切れ・隣接コマの写り込みなし）。
- 未対応・次の作業：なし。

## 2026-08-07 — Claude Code（追記）

- 担当：Claude Code
- ブランチ：`claude/zenkara-gifu-nagara-seo-ukz0er`（本番）
- 変更内容（ポーズライブラリの拡張体制）：
  - docs/stretch-pose-library.md 新設：残バックログ23記事の必要ポーズを棚卸しし、追加32ポーズ（シート2枚）でほぼ全記事をカバーできることを整理。オーナーがChatGPTに貼るだけの続編シート生成プロンプト2本（デスクワーク・上半身編17〜32／下半身・就寝朝編33〜48）を同梱。
  - scripts/ingest-pose-sheet.mjs 新設：続編シートの取り込みを自動化（バッジ色検出で行境界・白ガター検出で列境界を自動特定→16分割→マニフェスト追記ひな形を出力）。
- 確認結果：スクリプトは既存シートの境界検出ロジックと同一（検証済み）。
- 未対応・次の作業：オーナーによるシート2・3の生成待ち。

## 2026-08-07 (Claude Code) ポーズシート続編のAPI生成テスト準備
- 目的: シート2（ポーズ17〜32）をChatGPT APIで「元設定表の続きの1枚」としてまるごと生成できるか検証（オーナー判定用）
- 追加: `scripts/gen-pose-sheet.mjs`（gpt-image-2 / images/edits / input_fidelity=high、元シートを参照画像に同一フォーマットの続編1枚を生成）
- 追加: `scripts/sheet2-spec.json`（docs/stretch-pose-library.md シート2の16コマ仕様）
- 追加: `.github/workflows/pose-sheet-test.yml`（workflow_dispatchの一発テスト。候補2枚を pose-sheet-test ブランチ＝デプロイ無効へ出力。判定後に削除予定）
- 判定基準はオーナーの目視（キャラ・画風・日本語テキストの正確さ）。不合格ならChatGPTアプリ経由（既存プロンプト）の運用を継続

## 2026-08-07 (Claude Code) シート2をAPI生成→オーナー合格→ライブラリ32ポーズ化
- `pose-sheet-test` ワークフローでシート2候補2枚を生成し、オーナーが候補1を**合格**判定（API生成ルート確立。以後シート3もAPIで作成可）
- 合格シートを `scripts/assets/pose-sheet-2.png` として保存し、`ingest-pose-sheet.mjs --start 17` で pose-17〜32.webp に分割
- `src/data/stretchPoses.ts` に16件追加（計32ポーズ）。position に「椅子・座位」を追加
- `column/pc-kubikori-reset` のステップ2「肩甲骨引き寄せ」に pose-17 の挿絵を追加（ポーズ未収載リクエスト#1解消）
- `docs/stretch-pose-library.md` を更新：API生成を正規手順に、ChatGPTアプリは予備手段に変更。ワークフローは spec/count 入力で汎用化
- 検証: lint-column PASS（9ファイル）、astro build 成功（26ページ）
- 留意: pose-30（深呼吸ストレッチ）は椅子ではなく床あぐらの絵。マニフェストは「床・座位」として登録済み

## 2026-08-08 (Claude Code) ポーズ挿絵を「文字なし・512px統一」イラストへ刷新（オーナー指摘対応）
- 指摘: 記事内の挿絵が「画質が悪い・サイズまちまち・番号入り」（カード形式をそのまま掲載していたため）
- 対応: カード4枚を参照に gpt-image-2 で「文字・番号なし・キャラのみ」の2x2グリッドを8バッチ生成（scripts/gen-pose-illustrations.mjs）
- 32ポーズ中29を512x512で差し替え。pose-08/14/15は初回生成でポーズがずれたため、姿勢を英語で強制指定（HINTS）して再生成中
- 記事・自動生成テンプレートの図版は max-w-[300px]・角丸で表示統一（273371bで先行反映済み）
- キャラの「正」は従来どおりChatGPT設定表（scripts/assets/）。マニフェストのヘッダーを実態に合わせ更新
- 検証: lint-column PASS、astro build 成功

## 2026-08-08 (Claude Code) 残り3ポーズの再生成完了・全32ポーズが512px統一イラストに
- pose-08（立位に修正）/ pose-14（座位・腕前伸ばしに修正）/ pose-15（つま先引き上げに修正）を姿勢強制指定つきで再生成し差し替え
- これで全32ポーズが「文字・番号なし・512x512統一・キャラ統一」の記事用イラストになった
- 検証: astro build 成功

## 2026-08-08 (Claude Code) ポーズイラストv2：顔をChatGPT版準拠に・レギンス修正（オーナー指摘対応）
- 指摘: 「タイツがズボンみたいになってる」「ChatGPTに作ってもらったやつの方が可愛い」
- 対応: 生成時の参照1枚目にChatGPT設定表を追加し「顔・画風はこのシートに完全一致」「レギンスはボタン・ジッパー・デニム質感なし」を強制指定して全32ポーズを再生成
- 切り出しを4等分から scripts/slice-illu-grid.mjs（前景の連結成分検出→象限ごとにbbox切り出し→隣コマ画素の背景色マスク→512x512パディング）に変更。人物がセル境界をまたいでも頭・手足が切れない
- pose-05はキャット&カウの2フェーズを1枚に収録（動きが伝わるため採用）
- 検証: lint-column PASS、astro build 成功

## 2026-08-10 — Claude Code

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：なし
- 変更内容：
  - コラム新規記事「猫背・巻き肩をゆるめるストレッチ｜胸と肩甲骨からのセルフケア5選」（slug: nekoze-makigata）を追加。`docs/column-backlog.md` の authority 型・未対応リスト先頭（姿勢・猫背カテゴリ）から選定。
  - 胸を開く（壁）・肩甲骨引き寄せ・キャット&カウ・スレッド・ザ・ニードル・ばんざいの5種を `src/data/stretchPoses.ts` の既存ポーズ（pose-22/17/05/12/16）から選び、記事内の挿絵として使用（重複なし）。
  - アイキャッチはAI生成（`node scripts/fetch-column-image.mjs --slug nekoze-makigata --source ai`）。「明るいオフィスでデスクから立ち上がり肩を軽く回す男性」の日常シーンで生成し、`public/images/column/nekoze-makigata.webp` に保存。imageCredit は「※画像はイメージです」。
  - FAQ5問、独自メソッド「体感軸調整法」への言及、`/symptoms/shisei` への内部リンク（related含む）を追加。
  - `src/data/columns.ts` の `COLUMNS` 配列先頭に新記事のメタデータ（selfCareは記事本文の手順・秒数・回数と一致）を追加。
  - `docs/column-backlog.md` の該当行を `- [x]` に更新。
- 主な変更ファイル：
  - `src/pages/column/nekoze-makigata.astro`（新規）
  - `src/data/columns.ts`
  - `docs/column-backlog.md`
  - `public/images/column/nekoze-makigata.webp`（新規）
- 判断・注意点：
  - ポーズ未収載の動きはなし（今回はライブラリ内の5ポーズで手順を構成できた）。
  - 薬機法NG表現（治る・改善します・解消・矯正・効く等）は使用せず、「軽くしやすい」「近づけていける」等の言い換えで統一。
- 確認結果：`node scripts/lint-column.mjs src/pages/column/nekoze-makigata.astro` → 品質GATE PASS（1ファイル）。`npm run build` 成功（27ページ生成、既存26→27）。
- 未対応・次の作業：なし。本番ブランチへのマージはユーザー確認後にワークフロー側で実施。

## 2026-08-10 — Claude Code

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：なし
- 変更内容：
  - 新規記事「猫背・巻き肩をゆるめるストレッチ5選」（nekoze-makigata.astro）のレビュー。機械lintはPASSだったが、FAQ Q3の設問文「姿勢改善の筋トレも必要ですか？」が薬機法NG表現「改善」を含んでいた（正規表現は「改善します/しました/されます/できます」のみを検出するため「改善の」はすり抜けていた）ため、「姿勢を意識しやすくする筋トレも必要ですか？」に修正。回答本文・他の見出し・本文・FAQ・figcaptionにNG表現・過度な断定・セルフケアの安全性上の問題は見つからず。
- 主な変更ファイル：
  - `src/pages/column/nekoze-makigata.astro`
- 判断・注意点：
  - 他の公開済みコラムには「改善」の使用例がないことを確認し、表記統一の観点でも修正が妥当と判断。
- 確認結果：`node scripts/lint-column.mjs src/pages/column/nekoze-makigata.astro` → 品質GATE PASS。`npm run build` 成功（27ページ生成）。
- 未対応・次の作業：なし。

## 2026-08-11 (Claude Code) pose-12（スレッド・ザ・ニードル）を差し替え（オーナー指摘対応）
- 指摘: 記事の説明「片腕を反対側の下へ通し」とイラストが不一致（ただ突っ伏している絵だった）
- 対応: HINTSにひねりの明示指定を追加してバッチ3を再生成し、pose-12のみ差し替え（09〜11は現行維持）
- 検証: astro build 成功

## 2026-08-11 (Claude Code) /reserve の未置換プレースホルダ削除（オーナー指摘）
- ご来店前のご案内に「{{キャンセルポリシー}}」がそのまま表示されていたため、括弧ごと削除し「キャンセル・変更のご連絡は、お早めにお願いします。」に修正

## 2026-08-11 (Claude Code) pose-12を正しいスレッド・ザ・ニードルに差し替え（2度目の指摘対応）
- 原因調査: 元のChatGPT設定表カード自体が「腕を反対側へ通す」形を描けておらず、参照カード方式では同じ誤りを再生産していた
- 単発生成（キャラ設定表のみ参照＋詳細なポーズ指定）はOpenAI安全フィルタの誤検知（safety_violations=sexual）で3回連続拒否 → バッチ形式（安全フィルタ通過実績あり）にヨガ用語ベースのHINTを載せて再生成し成功
- オーナー提供の参考写真と同じ構図（腕が胴体の下をくぐり反対側に出る・肩と側頭部が床・お尻は膝の上）を確認して差し替え
- 検証: astro build 成功

## 2026-08-11 (Claude Code) SEO PDCA：症状ページ→コラムの内部リンク導線を追加
- Check: 直近7日の自然検索は約90セッション/週だがコラム流入は14程度（記事が新しいため正常。ただし主要流入ページからコラムへの導線がゼロだった）
- Act: SymptomLayoutに「セルフケアのヒント」ブロックを追加。columns.tsのrelatedSymptomsを逆引きし、全7症状ページから該当コラムへ最大4件の内部リンクを自動表示（今後の新記事も自動で載る）
- 検証: astro build 成功、katakori/sportsページでブロック出力確認
- 継続課題: クエリ単位のPDCA（順位・表示回数・CTR）はSearch Console接続待ち（Windsorにデータソース追加が必要）

## 2026-08-11 (Claude Code) GBP運用の仕組み化（オーナー承認「やる」）
- docs/gbp-ops.md 新設：コラム公開連動の自動投稿（事前承認済み）、口コミ返信は下書き→承認制、写真・営業時間の運用ルール
- Windsorの google_my_business アクション確認済み（create_local_post / reply_to_review / upload_media 等）
- データリレーに gmb_reviews を追加（接続まではok:falseで流れる設計。接続後にフィールド名を実データで検証する）
- 残作業: オーナーがWindsorでGBPアカウントを接続したら、最新コラムで初回投稿を実行して文面を見せる

## 2026-08-11 (Claude Code) GBP初回投稿を実行（猫背・巻き肩コラム連動）
- claude.aiのWindsorコネクタが不調のため、mcp.windsor.ai へ直接接続するMCPクライアント（scripts/windsor-mcp-call.mjs＋windsor-action.ymlのmcpモード）を構築して実行
- 認証はWINDSOR_API_KEYのBearerヘッダー（ルートパス。/mcpは404、api_keyクエリのみは401）
- 投稿成功：localPosts/269705244588041121（文面はオーナー承認済み、写真＋LEARN_MOREボタン付き）
- 以後の月水金コラム連動投稿はこの経路で自動実行可能

## 2026-08-12 (Claude Code) GBP投稿のサムネをキャラクターイラストに差し替え（オーナー指示）
- pose-22（壁で胸を開く）を1200x900キャンバスに配置したPNGを作成し、update_local_postで投稿の写真を差し替え（fields: media、成功）
- 以後のコラム連動投稿は記事の代表ポーズのイラストをサムネに使う（gbp-ops.mdに明記）

## 2026-08-12 — GitHub Actions（Claude）

- ブランチ：`claude/column-auto`
- 関連PR：なし
- 変更内容：
  - コラムバックログ（`docs/column-backlog.md`）の `authority` 型から最上位の未対応「sorikoshi-check（反り腰 セルフチェック ストレッチ）」を選び、新規コラム記事を1本作成。
  - 反り腰（骨盤前傾・腰椎過前弯）が起こる仕組み、壁を使ったセルフチェックの方法、太もも前面・お尻・腰まわりをゆるめるセルフストレッチ4選、頻度の目安を解説。既存3記事（肩こり／腰の朝の重さ／ゴルフ）とは検索意図が異なり重複なし。
  - アイキャッチ画像はAI生成（`scripts/fetch-column-image.mjs --source ai`）。明るいオフィスで席を立ち腰まわりを伸ばす日本人男性のイメージ。
- 主な変更ファイル：
  - `src/pages/column/sorikoshi-check.astro`（新規）
  - `public/images/column/sorikoshi-check.webp`（新規）
  - `src/data/columns.ts`（COLUMNS配列の先頭に追加）
  - `docs/column-backlog.md`（該当行を `- [x]` に更新）
- 判断・注意点：
  - faqプロップに5問、独自メソッド「体感軸調整法」への言及、`/symptoms/shisei` `/symptoms/youtsu` への内部リンクを含めた。
  - ストレッチ手順は `src/data/stretchPoses.ts` の既存ポーズ（pose-08／pose-07／pose-09／pose-30）のみで構成できたため、ポーズ未収載の動きはなし。
  - 薬機法・景表法に抵触する断定表現（治る・治療・解消・矯正等）は使用していないことを確認済み。
- 確認結果：`node scripts/lint-column.mjs src/pages/column/sorikoshi-check.astro` → 品質GATE PASS（1ファイル）。`npm run build` 成功（27→28ページ）。
- 未対応・次の作業：ユーザーによるレビュー後、本番ブランチ `claude/zenkara-gifu-nagara-seo-ukz0er` へのマージ（本記録の時点では未マージ）。

## 2026-08-13 (Claude Code) デイリー監視＋コラム連動GBP投稿（初の全自動サイクル）
- 広告: Meta ¥4,303（予算内に回帰・両広告ACTIVE）、Google 8/11 ¥6,162・CV3・CPA¥2,054（¥2,500基準内）。自動アクションなし
- 反り腰コラム（sorikoshi-check、品質GATE通過・自動公開済み）に連動してGBP投稿を実行（localPosts/2945416202792278027、pose-08サムネ・LEARN_MORE→記事）

## 2026-08-14 — GitHub Actions（Claude）

- 担当：GitHub Actions（Claude）
- ブランチ：`claude/column-auto`
- 関連PR：なし
- 変更内容：
  - コラムバックログ（`docs/column-backlog.md`）の `authority` 型から最上位の未対応「shisei-taikan（良い姿勢 体幹 保ち方）」を選び、新規コラム記事を1本作成。
  - 良い姿勢が体幹の働きで保たれる仕組み、壁を使ったアライメントチェックの方法、ドローイン呼吸・胸開き・キャット&カウ・肩甲骨寄せのセルフケア5選、頻度の目安を解説。既存記事（肩こり／腰の朝の重さ／ゴルフ／猫背・巻き肩ほか）とは「体幹で姿勢を保つ考え方」という検索意図が異なり重複なし。
  - アイキャッチ画像はAI生成（`scripts/fetch-column-image.mjs --source ai`）。明るいオフィスで席を立ち姿勢よく体を伸ばす日本人男性のイメージ。
- 主な変更ファイル：
  - `src/pages/column/shisei-taikan.astro`（新規）
  - `public/images/column/shisei-taikan.webp`（新規）
  - `src/data/columns.ts`（COLUMNS配列の先頭に追加）
  - `docs/column-backlog.md`（該当行を `- [x]` に更新）
- 判断・注意点：
  - faqプロップに5問、独自メソッド「体感軸調整法」への言及、`/symptoms/shisei` `/symptoms/katakori` への内部リンクを含めた。
  - ストレッチ手順は `src/data/stretchPoses.ts` の既存ポーズ（pose-30／pose-22／pose-05／pose-31）のみで構成できたため、ポーズ未収載の動きはなし。アライメントチェック（壁での姿勢確認）は動作というより計測なので挿絵なしとした。
  - 薬機法・景表法に抵触する断定表現（治る・治療・解消・矯正等）は使用していないことを確認済み。
- 確認結果：`node scripts/lint-column.mjs src/pages/column/shisei-taikan.astro` → 品質GATE PASS（1ファイル）。`npm run build` 成功（28→29ページ）。
- 未対応・次の作業：ユーザーによるレビュー後、本番ブランチ `claude/zenkara-gifu-nagara-seo-ukz0er` へのマージ（本記録の時点では未マージ）。

## 2026-08-15 (Claude Code) デイリー監視＋姿勢コラムのGBP連動投稿
- 広告: Meta 8/14 計¥5,547（予算内・両広告ACTIVE、B偏重は継続観察）、Google 8/13 ¥6,122・CV5・CPA¥1,224と改善。自動アクションなし
- 姿勢コラム（shisei-taikan）連動のGBP投稿を実行（localPosts/1348532552575817884、pose-31サムネ）
- Google広告のリンク先/lp切替はオーナー作業待ち（GA4上まだgoogle/cpc→/lp着地なし。「代行して」の返答があればAPIで代行）

## 2026-08-16 (Claude Code) Google広告のリンク先を/lpに切替（オーナー承認「代行して」）
- 実績ある見出し15本・説明文4本をそのまま流用し final_url=/lp の新RSA（821199375965）を作成→有効化、旧広告（816701342091）を停止
- 文言を変えずURLだけ変えることでLP効果を分離測定する。審査完了後に配信開始、以後のCV率変化をデイリー監視で追跡
## 2026-08-16 (Claude Code) KPIスクレイパーのparse設定（日別テーブル週次集計）
- 初回discovery実行の結果を確認：ログインは実際には成功（ダッシュボード構造・KPIテーブル見出しを取得）。ただしログイン成功後のDOMにモーダルのpassword欄が残るため`login.success`が誤ってfalseになる問題を確認
- `kpi-scraper/fetch.mjs` を拡張：
  - SPAの表示切替ボタン対応（ページ定義の`clicks`で「今月→日別」等をクリック）
  - `table`方式を追加：日別テーブルの行を前週（月〜日・JST）の日付で絞って集計（sum/avg）。行の日付は`YYYY-MM-DD`/`YYYY/M/D`/`M/D`/`M月D日`等を正規化、範囲外・「合計」行は除外
  - 前週が月をまたぐ場合は`prevPeriodClick`（先月ビュー）も自動で取り込み、日付単位で重複排除してマージ
  - discoveryモードで「今月/日別/先月」各ビューの構造とテーブル1列目の日付形式サンプル（日付として解釈できる値のみ）を記録するよう強化。顧客名などのセル値は引き続き出力しない
  - ログイン成功判定に「ログアウトボタンの存在」を追加（successCheck未設定時の補助判定）
- `kpi-scraper/selectors.json` を設定して`configured: true`に：
  - `successCheck`: ログアウトボタン
  - メトリクス7種（週計）：売上・総来店数・新規来店数・回数券新規販売本数・更新本数・次回予約数・指名数（日別KPIテーブルを`tableMatch: 売上/新規販売数/総来店数`で特定）
- 確認結果：`node --check fetch.mjs` OK、selectors.json のJSONパースOK、日付正規化ロジックの単体検証OK（年またぎ週含む）
- 未対応・次の作業：実サイトでの動作検証（discoveryで日別ビューの日付形式を確認→parseで`weekly_kpi.json`の数値妥当性を確認）。本コミット後にworkflow_dispatchで実行して検証する

## 2026-08-16 (Claude Code) KPIスクレイパーを期間指定方式に変更（discovery検証結果を反映）
- 強化版discoveryを実行して確認：successCheck設定によりログイン判定が正しくtrueに。「日別」トグルはKPIテーブルには効かない（月別のまま）一方、ダッシュボードにカスタム期間入力欄 `#dashFromInput` / `#dashToInput`（YYYY-MM-DD）があることを発見
- 方式変更：日別行の足し上げをやめ、期間入力欄に前週（月〜日）を直接入力してKPIテーブルの集計行から取得する方式に
  - `fetch.mjs`: ページ定義に`fills`（入力欄への記入、{week_start}/{week_end}置換）・`applyClick`・`waitAfterFillMs`を追加。`table_row`方式（集計行から列値を取得）を追加。検証用に`fills_applied`（実際に入力した値）と`period_labels`（テーブル1列目の期間ラベル）を`weekly_kpi.json`に出力
  - `selectors.json`: `dashboard_week`ページ（期間fills＋更新ボタン）とメトリクス10種（売上・総来店数・新規来店数・新規販売数/率・更新販売数/率・次回予約数/率・指名数）に更新
- 確認結果：`node --check` OK、JSONパースOK。この後parseモードを実行して数値の妥当性を検証する

## 2026-08-16 (Claude Code) KPIスクレイパーの実地検証完了（parse本稼働OK）
- workflow_dispatchに`week_start`/`week_end`入力を追加（`KPI_WEEK_START`/`KPI_WEEK_END`環境変数→fetch.mjsで前週計算を上書き。過去週の取り直し・検証用）
- 検証結果（3回のparse実行）：
  - 前週8/3〜8/9：売上¥403,280・総来店31・新規来店18・新規販売4本（率22.2%）・更新2本・次回予約9件・指名12。レート整合性OK（22.2%=4÷18、29%=9÷31）
  - 7月週7/6〜7/12を手動指定：売上¥734,950・新規27・販売11本と明確に変化し、期間ラベルも「2026年7月」に。#dashFromInput/#dashToInputの期間指定が確実に反映されることを確認
  - 最後に週指定なしで再実行し、kpi-dataブランチを前週データに復元（1回目と同値＝再現性確認）
- これで月曜7:00(JST)の週次自動取得は本稼働状態。月曜9:30の週次経営レビューは `git show origin/kpi-data:weekly_kpi.json` で前週KPIを読める
- 未対応・次の作業：特になし（来週月曜の自動実行を通常監視でフォロー）

## 2026-08-16 (Claude Code) シフト自動化の構築＋給与予測の下調べ
- discoveryにナビ探索（メニュー展開・強制クリック）を追加して2回実行したが、店舗システムの「スタッフ」「勤務時間入力」セクションはSPAのドロワー内で開けず（クリック不達）。実労働時間の自動取得はいったん保留
- 店舗システムにはシフト作成・公開・休み申請の機能が無いことを確認（ナビはダッシュボード/顧客登録/来店記録/スタッフ/勤務時間入力/顧客統合のみ）
- 代替としてシフト運用をDriveスプレッドシート＋Routineで自動化：
  - 「シフト管理（希望休申請・全力ストレッチ岐阜長良店）」シートを00_Inboxに新規作成（申請/設定/承認ログの3タブ、ID: 1IlpCt3aTrsbzjEAKgtxFf2_7i_m-dGxZz6jCHFGw57g）
  - Routine「希望休の自動承認」（毎月10日23:00 JST、trig_015KVysESowG6HuVCtqjibGo）：翌月分の申請を自動承認。繁忙期・最低出勤人数割れは「要相談」に回すガードレール付き
  - Routine「シフト自動作成・公開」（毎月28日9:00 JST、trig_01NZnQ6YpyE9dQ5k5Tn4jCEy）：設定タブの基本パターン＋承認済み休みから翌月シフト表を生成（シートにタブ追加＋共有用HTML、予定労働時間集計つき）
- 給与体系はDriveの「岐阜長良店_給与体系.jpg」から取得済み（保証時給1,600円・売上連動〜3,000円、回数券バック1,000〜3,000円/本、指名バック3,000円/回、交通費上限1万円、週30h以上で社保）。損益分岐の最新値は2026-08-13ノートの270.7万円（広告実レート込み）
- 未対応・次の作業：①設定タブの基本シフトパターン記入（オーナー）②シートのスタッフ共有（share_fileが権限ブロックのためオーナー操作）③資金監視Routineへの給与予測・動的損益分岐の組み込み（update_triggerが要承認のため保留）④実労働時間スクレイピングの再挑戦（必要なら）

## 2026-08-17 (Claude Code) /lp の予約導線でLINEをHPBと同格に（週次レビュー提案A・オーナー承認）
- 背景：週次経営レビュー（8/10-16）で、サイト上の予約アクション116件に対し実新規来店17人（歩留まり14.7%）と判明。HPB遷移後の離脱が最大のボトルネックで、自社完結のLINE経由は116件中8件（7%）しかなかった
- 変更内容（`src/pages/lp.astro`）：
  - FVのCTA：HPB全幅＋下段にLINE/電話の2列 → **HPBとLINEを2列で同寸に並べ**、電話を全幅の補助ボタンに降格。文言は「LINEで相談」→「LINEで予約・相談」
  - クロージングCTA：同様に2列同寸へ。下に「LINEなら、空き時間のご相談も友だち追加だけでそのまま送れます。」の補足を追加
  - 料金セクション：HPBクーポン単独 → HPBとLINEの2列に
  - スティッキーCTA：3等分 → `1fr 1fr 0.62fr` にしてLINE/WEB予約を主、電話を従に。文言「LINEで相談」→「LINEで予約」
  - 計測ラベル `data-fb-label` を「LINE登録」→「LINE予約・相談」に統一（GA4の click_line はBase.astroの委譲計測で従来どおり自動発火）
- `src/styles/global.css`：`.btn-line-pill` を追加（`.btn-amber-pill` と寸法・字送りを揃えたLINEグリーンのCTA）
- 確認結果：`npm run build` 成功（29ページ）。430px幅でFV／料金／クロージングの3箇所をスクリーンショット確認、いずれもHPBとLINEが同寸で並ぶことを確認。/lp のHTML内 lin.ee リンクは7、HPBリンクは6
- 効果測定：GA4の click_line 比率（前週は全予約アクション116件中8件＝7%）と、店舗システムの新規来店実数に対する歩留まり（前週14.7%）で見る
- 未対応・次の作業：来週の週次レビューで click_line 比率と歩留まりの変化を確認

## 2026-08-17 (Claude Code) Google広告の除外キーワード追加（週次レビュー提案B・競合名のみ実施）
- 週次レビューでは一般語（整体・ストレッチ・マッサージ等）と競合名の除外を提案しオーナー承認を得たが、`docs/ads-ops-guardrails.md` に
  【オーナー指示 2026-08-06】として「マッサージ・もみほぐし・タイ古式・整体などの手技系ワードは除外禁止」が明記されているため、
  **手技系の一般語は実行せず保留**し、競合ブランド名・他地域のみを除外した
- データ上もこの旧指示は正しく、手技系ワードはCVを出している（マッサージ整体 2clicks/2CV、岐阜市肩こりマッサージ 2/2、もみほぐし岐阜 1/2、頭痛肩こりマッサージ 3/1）。単体の「整体」7clicks/0CVのみが明確な無駄打ち
- 実行内容（Windsor MCP `push_negative_keywords` / campaign 24029290016「集客_検索_2026.07」/ account 600-036-3311 / すべてPHRASE一致）：
  `ドクターストレッチ`（7クリック・CV0）／`兼子ただし`（2・0）／`さざれ整体院`（2・0）／`ほぐし家福来`（1・0）／`もみほぐしtomo`（2・0）／`大垣`（1・0）
  → 「Added 6 negative keyword(s) ... successfully」。6日間で計15クリック・CV0（平均CPC ¥341換算で約¥5,100、週あたり約¥6,000）の削減見込み
- 実行しなかったもの（オーナー判断待ち）：単体「整体」EXACT一致（7クリック・CV0）。ガードレールの手技系除外禁止に該当するため保留
- 差し戻し方法：`remove_negative_keywords`（level='campaign', campaign_id='24029290016', criterion_ids=[...]）。criterion_id は get_data の campaign_criterion_keyword_text / criterion_id で取得する
- 未対応・次の作業：来週の週次レビューで検索語レポートを再確認し、除外の効き（無駄クリック消滅）と取りこぼし（意図せぬCV減）を検証


## 2026-08-19 (Claude Code) コラム自動生成の停止を検知・原因特定（Anthropic APIクレジット不足）
- 8/17のcolumn-auto失敗＋8/19の未実行を検知。手動再実行でも即死（0.5秒・$0）を再現
- anthropic-probe.yml（最小のmessages呼び出し）で原因確定：HTTP 400「Your credit balance is too low to access the Anthropic API」
- オーナーへ通知済み（クレジット購入依頼）。補充後のリカバリ手順はタスク#8に記録（8/17・8/19分の2本を再生成→GBP連動投稿→probe削除）
- 影響範囲はコラム生成のみ。広告監視・GBP投稿・データリレーは別経路（Windsor/OpenAI）のため正常稼働中

## 2026-08-19 (Claude Code) Meta広告CAPIオフラインイベント送信を実装（回数券成約→Purchase）
- 目的：回数券の成約実績をMetaに「オフラインコンバージョン」として送り、配信最適化を「体験に来る客」から「回数券を買う客」へ寄せる
- **調査で判明した2つの問題**（実装前にオーナー確認を取り、方針を決定）：
  1. **顧客別の成約データが存在しない**。`kpi-data` の `weekly_kpi.json` は週次集計値のみ（`new_ticket_sales: 8` のような本数と週合計売上）で、誰がいつ幾らで買ったかの1件ごとのレコードが無く、当初設計の「氏名で突合」が成立しない
     → オーナー判断で**成約日・金額を電話ハッシュマスタ側に持たせる**方式に変更（Cowork月次タスク側の対応が必要。それが入るまでは0件送信で正常終了する設計）。突合が不要になったため氏名を一切扱わない実装にした
  2. **`kpi-data` ブランチは毎週消える**。`kpi-data.yml` が `git init` + `git push --force` で作り直すため、当初仕様どおり `capi-sent.json` を置くと週次ジョブで消えて翌月に二重送信する
     → オーナー判断で**専用の `capi-state` ブランチ**を新設し、こちらは履歴を保持したまま通常コミットで積む方式に変更
- 新規 `scripts/capi-upload.mjs`（**依存パッケージなし**。Node 22標準のfetch/cryptoのみ。Google認証はサービスアカウントのJWT BearerグラントをOAuth2エンドポイントへ直接投げる方式にし、Actionsの実行時間を最小化）
  - Drive（フォルダID `1Gsa1G7n4OHTNRcz8QW6GxSp-T52v4H3p`）から `phone-master_YYYY-MM.json` を全件取得・マージ。同一 `(日付,金額,商品名)` の成約は1件に畳む
  - 62日以内（Meta仕様）の成約のみ抽出。未来日付・金額なし（Purchaseは `value` 必須）・不正ハッシュ・送信済みは除外
  - `event_id` = `{成約日YYYYMMDD}_{phone_hash先頭16文字}`。同一顧客・同一日はevent_idが衝突するため金額を合算して1イベントにする
  - `POST https://graph.facebook.com/v26.0/{META_DATASET_ID}/events`（v26.0は2026-07-29リリースの最新版。`META_GRAPH_VERSION` で差し替え可）。500件ずつバッチ送信
  - `event_time` は成約日の**JST正午**（日付しか無いため、どのTZで解釈しても同じ日になる時刻を採用）
- 新規 `.github/workflows/capi-upload.yml`（毎月3日10:00 JST ＋ workflow_dispatch。入力 `dry_run`（既定true）と `test_event_code`）
- 個人情報：生の電話番号・メールは一切扱わない（入力時点でSHA256済み）。突合が不要になったため**氏名もレポートに出さず件数と理由のみ**。dry_runのpayloadサンプルもハッシュを伏せ字にした。`capi-sent.json` は400日より古いevent_idを自動削除
- 確認結果：Drive/Meta双方のHTTPをスタブして `capi-upload.mjs` を実走行し、①dry_run（何も書かない）②本送信③再実行で二重送信ゼロ ④`test_event_code` 指定時はbodyにコードが載り `capi-sent.json` を更新しない（本送信で再送可能）⑤重複マージ・同日合算・62日超/未来日/金額なし/不正ハッシュの除外 ⑥Google認証失敗・Drive 404・Meta 400・状態ファイル破損のいずれでも exit 1 ⑦ワークフローのgit処理をローカルのベアリポジトリで3回実行し、履歴保持・過去レポート保持・無変更時のコミットスキップ を確認。`npm run build` 成功（29ページ・既存サイトへの影響なし）
- 既存の日次スクレイピング・週次処理には一切変更を加えていない（push起動のワークフローが無いことも確認済み）
- **未対応・次の作業（オーナー作業）**：Metaデータセット作成→`META_DATASET_ID`／CAPIトークン発行→`META_CAPI_ACCESS_TOKEN`／GCPサービスアカウント作成・Drive API有効化→`GDRIVE_SA_KEY`／Driveフォルダ「32_顧客電話_マスタ」をSAメールへ閲覧者で共有／**Cowork月次タスクを `purchases`（成約日・金額）付きの出力へ更新**。チェックリストは `docs/capi-offline-events.md` に記載。本番反映は未確認（Secrets未設定のため未実行）

## 2026-08-19 (Claude Code) AI集客提案書の施策B/C/E/F/G/H/I/Jを実行（A・Dを除く）
- 調査で判明した「既に済んでいたこと」（提案書の前提が古かった点。Windsorで実測して確認）：
  - **施策C（Google広告CV導入）はほぼ完了済みだった**。直近28日で主要CV 68件（`(web) hpb_click` 60／`ローカル アクション - 経路` 4／`(web) click_tel` 3／`Calls from ads` 1）。入札戦略も既に `MAXIMIZE_CONVERSIONS`。提案書の「手動入札から切り替える」「CV計測を始める」はどちらも実施済み
  - **施策Bのピクセル＋クリック計測コードも実装済みだった**（`Base.astro` のfbq委譲）
  - GA4の「AI Assistant」チャネルは既定チャネルグループとして稼働中（28日で `copilot.com / ai-assistant` 1セッション）
- **施策B（実際に残っていた穴を修正）**：CV系CTAが `Schedule`/`Contact` に分散し、`Lead` がLINE分（28日で21件）しか溜まっていなかった。HPBは外部ドメインでサンクスページにピクセルを置けず、サイト側で取れる最も購入に近いシグナルが「予約クリック」であるため、**予約クリック・電話タップでも `Lead` を併送**するよう変更（GA4実測ベースで週70件前後になる見込み＝リード最適化への引き上げ条件を満たす）。あわせて、`data-fb-event` を明示している `/lp` のCTAでLeadが発火しない不具合を修正
- **施策C（残っていた唯一の穴を特定）**：`click_line` / `line_click`（28日で21件）が**Google広告に未インポート**。LINEは8/17のLP改修で予約導線の主役に引き上げたのに学習信号に入っていない。手順を `docs/measurement-runbook.md` に記載。8月は検証月のため**副次CVで開始→9月に主要CVへ昇格**という段取りにした（主要CVにすると `MAXIMIZE_CONVERSIONS` の配信が動くため）。※Windsorにコンバージョン設定のアクションは無く、Google広告のUI操作が必要
- **施策E（コラムLLMO強化）**：
  - FAQ未設定だったレガシー3記事に5問ずつ追加し、**全12記事がFAQPage**に。本文の秒数・回数と矛盾しない内容で執筆
  - **`/method`（体感軸調整法の解説ページ）を新設**。Service＋FAQPage構造化データ、もみほぐし・整体との比較表を持つLLMO用のピラーページ。全12記事の「体感軸調整法」初出から内部リンク（サイト内29ページから被リンク）
  - `ColumnLayout` に `author` / `authorUrl` を追加し、Article schemaに `about: /method#service` を追加。**実名監修への切替は可能にしたが、実行はしていない**（実際に監修していないトレーナーの実名を出すのはE-E-A-T上も逆効果で、事実性の問題があるため。誰が監修するか決まれば1行で切替可能）
  - 品質GATEのレガシー免除リストを廃止し、`/method` へのリンクを必須ルール化。NG表現定義を `scripts/yakkihou-ng.mjs` に集約してlintとGBP生成で共用
  - **週3本のうち金曜を `compare`（比較・選び方）枠**にするローテーションを `column-auto.yml` に実装（曜日で自動判定）。backlogに `compare` 型6件を追加
- **施策F（GBP投稿半自動化）**：`scripts/gbp-post-draft.mjs` ＋ `gbp-draft.yml`（毎週月曜8:00 JST）。**LLMを使わない決定的な生成**にしたので、APIキーもクレジット残高も不要（8/19時点でAnthropicクレジット不足によりコラム生成が停止しているため、この判断は重要）。`docs/gbp-ops.md` §1の承認済みテンプレートに沿って166〜168字の投稿文・CTA・写真URLを組み立て、実行サマリーに出す（オーナーはコピペするだけ）。薬機法NG語が混ざったら生成を失敗させるガード付き
- **施策G/H/I**：`docs/growth-plays-g-h-i.md` に実行仕様を作成。いずれも広告費が動く外部プラットフォーム操作のため**実行はしていない**。G=インスタントフォームの設問・フォロー導線・勝敗判定（既存枠内で予算配分、9月開始）、H=クリエイティブ週次ローテのルール（実測CPC：B_golf_image ¥34.8／A_kibun_video ¥32.3）、I=LINEステップ配信3通の文面テンプレート（薬機法チェック済み・月51通でフリープラン200通内）
- **施策J（実装できないため整理のみ）**：「回数券残あり×最終来店30日超」は顧客単位データが必要だが、kpi-scraperは集計値のみで顧客情報ページを意図的に開かない設計。施策Aと同じブロッカー。`docs/churn-followup-j.md` に3案と氏名の出力先（Google Driveのスプレッドシートを推奨）を整理してオーナー判断待ちにした
- 確認結果：`npm run build` 成功（30ページ）。**Playwrightの実ブラウザで全CTAをクリックし、fbq/GA4に送られるイベントを検証**（広告LP11箇所・コラム10箇所・TOP14箇所で、予約/電話はSchedule|Contact＋Lead、LINEはLead1回のみ、cta_sourceが全て正しい値になることを確認）。`/method` をSP390px・PC1280pxでスクリーンショット確認（横スクロールなし）。品質GATE `node scripts/lint-column.mjs` は免除なしで12ファイルPASS。GBPドラフト生成は4モード（--days/--latest/--json/フォールバック）と薬機法NG検出（意図的にNG語を入れてexit 1）を確認
- 未対応・次の作業（オーナー作業）：`click_line` のGoogle広告インポート（最重要）／GA4カスタムディメンション `cta_source` の登録／Vercelの `PUBLIC_META_PIXEL_ID` 設定確認（本セッションからは本番サイトへ到達できず未確認）／G・H・Iの9月実行／施策Jの方針判断

## 2026-08-19 (Claude Code) 施策Aのセットアップ手順書を作成（オーナー作業の具体化）
- `docs/capi-setup-guide.md` を新規作成。Metaイベントマネージャ／Google Cloud／GitHub Secretsの画面操作単位まで落とし、上から順にやれば終わる形にした（所要40分の内訳付き）
- **調査で判明した簡略化**：Metaはピクセルとデータセットを統合済みで、**既存のピクセルIDがそのままデータセットIDとして使える**。当初チェックリストの「データセットを新規作成」「広告アカウントに紐づけ」は、既存ピクセルを使えば作成不要・紐づけは確認のみで済む。Web行動とオフライン成約を同じデータセットに入れるほうがMetaが両方をまとめて学習するため、そちらを推奨として記載
- Cowork月次タスクへ渡す指示文を、コピペできるブロックとして用意（purchases形式・推測で埋めない旨・生電話番号は出力しない旨を明記）
- dry_run → test_event_code → 本送信の3段階と、各段階でログのどこを見るかを記載。エラーメッセージ別の原因対処表も追加（実装した `fail()` の文言と対応させた）
- 未対応・次の作業：オーナーによる実作業。Secrets 3件の登録とCowork側の出力更新が済めば送信が始まる

## 2026-08-20 (Claude Code) 施策A〜Jをデフォルトブランチへマージ・本番反映を確認
- `claude/new-session-prk4n9` の4コミット（施策A / B・E / C・F・G・H・I・J / セットアップ手順書）を、デフォルトブランチ `claude/zenkara-gifu-nagara-seo-ukz0er` へ**早送りマージ**（オーナー指示「直接マージする」）。デフォルトブランチ側に先行コミットは無く、上書き・消失はゼロ
- マージが必要だった理由：GitHub Actionsは**デフォルトブランチにあるワークフローしか一覧に出さず手動実行もできない**（workflow_dispatchの仕様）。`capi-upload.yml` が作業ブランチにしか無かったため、Secretsを揃えてもActions画面に出てこなかった
- マージ後の検証：`npm run build` 成功（30ページ）／品質GATE 12ファイルPASS／全11ワークフローのYAML検証OK
- **本番反映を確認**：Vercelのデプロイ一覧で `b7ece59` が **Production / Ready**（14秒）。`/method` ほかサイト側の変更が公開された
- **施策AのSecrets 3件をオーナーが設定完了**（`META_DATASET_ID` / `META_CAPI_ACCESS_TOKEN` / `GDRIVE_SA_KEY`）。GCPプロジェクト `zn-stretch-kpi`、サービスアカウント `kpi-drive-reader`、Drive「32_顧客電話_マスタ」へ閲覧者で共有済み（権限をAPIで確認）
  - `META_DATASET_ID` は既存のウェブピクセル `zngifunagara`（PageView 4,438件・接続先 zn-stretch-gifu.com）を採用。もう一方の候補 `zenryoku-sns-automation` はSNS自動運用システム用のアプリ用データセットでイベント未受信のため不採用
  - **副次的な確認**：このピクセルが実際にイベントを受信していたため、前回「本番サイトへ到達できず未確認」としていた Vercel の `PUBLIC_META_PIXEL_ID` の設定が**正しく動作していることを確認できた**
- **dry_run 実行結果：Drive接続は成功**。`phone-master_YYYY-MM.json がありません` で終了（＝認証・API・共有はすべて通過し、ファイルが未生成なだけ）。設計どおりの挙動
- 未対応・次の作業：①Cowork月次タスクを `purchases`（成約日・金額）付き出力へ更新（これが入るまで送信は0件）②サービスアカウント鍵のローテーション（セットアップ中にスクリーンショットへ写ったため。新旧の順序に注意：新鍵を登録→dry_run確認→旧鍵を削除）③`click_line` のGoogle広告インポート（施策C）④GA4カスタムディメンション `cta_source` の登録

## 2026-08-20 (Claude Code) 顧客データ取得の方針転換（売上CSV解析→店舗システム自動取得の調査）
- 背景：施策Aの手作業「顧客ページを1人ずつ開いてスクショ」が重い、というオーナーからの相談。サロンボードに**売上明細のCSV出力がある**ことが判明したため、実データ（2026-06-20〜08-20・462行）を解析した。**氏名は一切出力しない解析スクリプトで列構造と金額・カテゴリのみ確認**
- 判明したこと：
  - 文字コードは **cp932（Shift_JIS）**。20列で、`会計日`(YYYYMMDD) / `お客様名` / `お客様名（フリガナ）` / `金額` / `区分` / `カテゴリ` が揃う。**電話番号以外は全部CSVで取れる**
  - **`お客様番号` は全行が空欄**。安定した顧客IDが無く氏名照合しかできない。しかも**同一氏名でフリガナが異なる組み合わせが既に1件存在**＝同姓同名が現実に発生している
  - **`区分=店販` に2種類が混在**していた。「指名回数券」（指名10回券等・9,900〜33,000円・25件）は**指名料のチケットであって施術の回数券ではない**。これをPurchaseとして送るとMetaが「約1万円の買い物をする人」を学習し、狙いと逆方向に最適化される。→ **オーナー判断で除外決定**
  - 取り消し会計（金額マイナス・個数-1）が2件あり、除外が必要
  - 実際の回数券成約：2ヶ月で **49件 / 46人 / 2,591,710円**（月20〜24件）
- **訂正**：前回「月9人前後」と見積もったのは誤り。週次KPIの `new_ticket_sales: 8`（週あたり）を月次と読み違えていた。実際は月20〜24件で、作業量の見積もりが2倍以上ずれていた
- **方針転換（オーナー判断 2026-08-20）**：店舗システムには**顧客IDが自動採番されている**ことが判明。氏名照合より堅牢なため、CSV経由ではなく**店舗システムからの自動取得**（従来「案2」として保留していたもの）を採用し、顧客情報ページを開く設計変更を承認
- 新規 `kpi-scraper/discover-customers.mjs` ＋ `.github/workflows/customer-discovery.yml`（手動実行のみ）：店舗システムの顧客画面に「顧客ID・電話番号・回数券残・最終来店日」があるかを調査する。**どのブランチにも書き込まない**（kpi-dataブランチを触らないので週次KPIジョブに影響しない）。既存 `fetch.mjs` にも一切手を加えていない
- 個人情報の扱い：構造抽出を `kpi-scraper/lib/page-structure.mjs` に切り出し、**ブラウザ内で値を種類ラベル（'電話番号' '日付' '金額' 等）に潰してから持ち出す**設計にした。レポートに出るのは列の見出しと種類だけで、氏名・電話番号・セル値は物理的に含まれない
- 確認結果：ダミーの顧客一覧・顧客詳細HTMLを作り、実ブラウザ（Playwright）で検証。9列すべてが正しく分類され（顧客ID→数字5桁／氏名→日本語／フリガナ→カタカナ／電話番号→電話番号／最終来店日→日付／回数券残→数字1桁／累計売上→金額／メール→メール）、**出力JSONに氏名・電話番号・メール・金額の実値が1つも含まれないことをアサートで確認**。縦持ちテーブルが表として二重に出るノイズも修正
- 未対応・次の作業：オーナーが `customer-discovery.yml` を手動実行 → レポートを見て、①電話番号の自動取得（施策A）②回数券残・最終来店日の自動取得（施策J）が可能か判断する。可能なら手作業がゼロになり、施策AとJが同じ経路で同時に解ける。不可の場合は売上CSV経由（解析済みなので実装は短時間）にフォールバックする
## 2026-08-20 (Claude Code) コラム記事がワイドモニターで左に寄る問題を修正
- オーナー報告「16:9のモニターで見た時、コラムの画像や文書が左にやっちゃってた」への対応
- 原因：`ColumnLayout.astro` の外側 `<article>` は `mx-auto max-w-content`（1360px）で中央寄せだが、内側のブロック（h1・アイキャッチ＝`max-w-[980px]`、本文・監修・FAQ・関連＝`max-w-[820px]`）に `mx-auto` が無く、ワイド画面ではコンテナ左端に張り付いて右側に大きな余白ができていた
- 修正：記事コンテンツ全体を `mx-auto w-full max-w-[980px]` のラッパーで包み、本文系の `max-w-[820px]` ブロックにも `mx-auto` を追加。h1・画像・figcaption の個別 `max-w-[980px]` はラッパーに集約して削除
- 確認結果：`npm run build` 成功（30ページ）。ローカル配信＋Chromiumで 1920×1080 のスクリーンショットを撮り、見出し・本文・ストレッチ挿絵が画面中央に配置されることを確認。モバイル390pxは修正前後でスクリーンショットがバイト単位で同一（レイアウト影響なし）
- 対象は全コラム記事（ColumnLayout使用の12記事すべてに適用）

## 2026-08-20 (Claude Code) コラム新規記事「寝る前ストレッチで睡眠の質を高める」を追加

- ブランチ：`claude/column-auto`
- 関連PR：なし（ワークフロー側でコミット・プッシュ）
- 変更内容：
  - `docs/column-backlog.md` の `authority` 枠から未対応の最上位1件 `neruma-shinkokyu`（寝る前 ストレッチ 睡眠の質）を選び、コラム記事を1本新規作成。
  - 深呼吸ストレッチ・胸を開くストレッチ・お尻/股関節のストレッチの3種目を、`src/data/stretchPoses.ts` の既存ポーズ（pose-30/06/09）で構成し、いずれも記事の手順と矛盾しないことを確認。
  - FAQ5問、`/method`（体感軸調整法）・`/symptoms/jiritsu` への内部リンクを設置。既存3記事（肩こり／腰／ゴルフ）や他の`jiritsu`関連記事と検索意図が重複しないことを確認。
  - アイキャッチは `scripts/fetch-column-image.mjs --source ai` で生成（日中の明るいリビングでくつろぐシーン。施術シーンは含めない）。
- 主な変更ファイル：
  - `src/pages/column/neruma-shinkokyu.astro`（新規）
  - `src/data/columns.ts`（COLUMNS配列の先頭に追加）
  - `public/images/column/neruma-shinkokyu.webp`（新規・AI生成）
  - `docs/column-backlog.md`（該当行を`- [x]`に更新）
- 判断・注意点：
  - ポーズ未収載の動きはなし（既存32ポーズ内で本文の手順を構成できたため、ライブラリ拡張の連絡は不要）。
  - 薬機法・景表法上のNG表現（治る・改善します等）は使用せず、「〜と考えられています」「〜を目指します」等の言い換えを使用。
- 確認結果：
  - `npm run build` 成功（30→31ページ）。
  - `node scripts/lint-column.mjs` 品質GATE PASS（13ファイル）。
- 未対応・次の作業：なし。

## 2026-08-20 (Claude Code) コラム新規記事「寝る前ストレッチ」の薬機法レビュー・修正

- 対象：直前にコミットされた `src/pages/column/neruma-shinkokyu.astro`（未コミット差分）のレビュー。
- 指摘・修正：
  - `lint-column.mjs`（NG_PATTERNS）はPASSだったが、title／heading／description／リード文の「睡眠の質を高める」が機械チェックをすり抜ける効能断定表現だった（`docs/yakkihou-ng-ok.md` の「睡眠が改善する／不眠が治る」NGと同種の直接的な効果主張）。他の全コラム記事のタイトルが「〜対策」「〜な方へ」等、効果を断定しない書き方で統一されている中で本記事のみ逸脱していたため、「睡眠の質が気になる方への深呼吸セルフケア3選」という悩み訴求型の言い回しに修正。
  - 上記に合わせて `src/data/columns.ts` の `heading`／`desc` も同じ言い回しに統一。
  - 本文中の該当箇所（「深呼吸とセルフストレッチ3つをご紹介します」の前振り）も「睡眠の質を高めることを目指せる」→「体をゆるめて呼吸を深くすることを目指せる」に修正。
  - それ以外（体感軸調整法への言及、figcaption「イラストはイメージです」、セルフケア手順の安全性、リード文の検索意図対応）は問題なし。
- 主な変更ファイル：
  - `src/pages/column/neruma-shinkokyu.astro`
  - `src/data/columns.ts`
- 確認結果：
  - `node scripts/lint-column.mjs src/pages/column/neruma-shinkokyu.astro` 品質GATE PASS。
  - `npm run build` 成功（31ページ）。
- 未対応・次の作業：なし。
