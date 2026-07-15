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
