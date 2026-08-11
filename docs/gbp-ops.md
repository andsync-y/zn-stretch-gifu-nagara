# Googleビジネスプロフィール（GBP）運用ルール

2026-08-11 オーナー承認。実行はWindsor MCP（コネクタ `google_my_business`）経由。

## 目的

「肩こり 岐阜長良」「マッサージ 岐阜長良」等の地図枠に吸われているローカル検索クリックを取りに行く。
GBPの活動量（投稿・返信・写真）はローカル順位と地図枠でのクリック率に効く。

## 1. コラム公開連動の自動投稿（承認済み・自動実行可）

- トリガー：月水金の自動コラムが公開されたら（デイリー監視が新記事を検知したら）
- アクション：`create_local_post`
  - summary：記事の要点＋セルフケアのヒント1つ（下のテンプレ）。1500字以内・薬機法ルール適用
  - cta_type：`LEARN_MORE` / cta_url：記事URL
  - photo_url：記事で使っている挿絵（https://zn-stretch-gifu.com/images/stretch-poses/pose-NN.webp ※250px以上）
  - language_code：`ja`
- テンプレ：
  「【コラム更新】＜記事タイトル＞
   ＜descの1〜2文＞
   たとえば「＜selfCareから1つ・短縮＞」など、今日からできるセルフケアを紹介しています。
   デスクワークの合間にぜひお試しください。」
- 薬機法：治る・治療・改善します・解消・矯正・効く等の断定は禁止。「ゆるめる」「アプローチ」「目指す」で書く

## 2. 口コミ返信（下書き自動・送信はオーナー承認後）

- 週次レポート時に新着レビューを確認し、返信下書きを作成してオーナーに提示
- オーナーOK後に `reply_to_review` で送信（返信は公開されるため自動送信はしない）
- 下書きの型：感謝→来店内容への具体的な言及→次回への一言。医療的効果の約束はしない

## 3. 写真・基本情報

- 施術写真・店内写真の追加はオーナーから素材をもらったときに `upload_media`
- 営業時間の変更・臨時休業は指示があり次第 `set_special_hours` / `set_regular_hours`

## 接続

Windsor（onboard.windsor.ai）→ Data Sources → Google Business Profile を追加し、
店舗のGoogleアカウントでOAuth→ロケーション「全力ストレッチ岐阜長良店」を選択。

## 実行経路（2026-08-11確立）

- 第一経路：claude.aiのWindsorコネクタ（execute_action）
- **バックアップ経路（検証済み）**：GitHub Actions「windsor-action」の `dry_run=mcp` モード。
  `scripts/windsor-mcp-call.mjs` が https://mcp.windsor.ai/ にBearer（WINDSOR_API_KEY）で直接接続し
  execute_action を呼ぶ。コネクタ不調時はこちらを使う
- GBPアカウントID：`locations/3707203216578503879`（全力ストレッチ岐阜長良店）
- 投稿画像はJPG/PNG限定のため、コラムのWebP画像は /images/gbp/<slug>.png に変換して使う
