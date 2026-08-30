# GSC URL検査レポート

sitemap再送信: ⚠️ 失敗 HTTP 403（GSCで ga4-reader を「フル」権限にすると通る）

## 集計
- Discovered - currently not indexed: 26件
- URL is unknown to Google: 8件
- Submitted and indexed: 1件

## ページ別
| パス | 判定 | 状態 | 最終クロール | 備考 |
|---|---|---|---|---|
| / | PASS | Submitted and indexed | 2026-08-23 |  |
| /access | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/asa-sukkiri | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /column/ganseihiro-kubikori | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /column/golf-stretch-routine | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/hiesho-shimohanshin | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/katakori-desk-stretch | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/katakori-zutsu | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /column/mukumi-yugata-ashi | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/nekoze-makigata | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/neruma-shinkokyu | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /column/pc-kubikori-reset | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/personal-stretch-towa | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /column/shisei-taikan | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/smartphone-kubi | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/sorikoshi-check | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/stretch-momihogushi-chigai | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /column/tachishigoto-mukumi | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/tsukare-nukenai | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /column/youtsu-morning-stretch | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /menu | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /method | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /recruit | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /reserve | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /staff | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/jiritsu | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/katakori | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/kubi-ganseihiro | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/mukumi | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/shisei | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/sports | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
| /symptoms/youtsu | NEUTRAL | URL is unknown to Google | 未クロール |  |
| /voice | NEUTRAL | Discovered - currently not indexed | 未クロール |  |
---

## 診断（2026-08-30）

- **トップページ以外、開設以来一度もクロールされていない**（全ページ「最終クロール: 未クロール」）
- スラッシュ付き形（sitemapが送っていた形）は26ページが「Discovered - currently not indexed」
  ＝sitemapで存在は知られているが、クロールの優先度が回ってきていない。8ページは未発見
- canonical形（スラッシュ無し）は全ページ「unknown」だが、**両形とも200で直接配信される**ことを
  確認済み（リダイレクト無し）。技術的ブロックではなく、**新しいサイトへの典型的なクロール抑制**
- noindex無し・sitemap送信済み・canonical正常。**サイト側の設定に不備は見つからない**
- sitemap再送信APIは403（ga4-readerが「制限付き」のため。「フル」に上げれば通る）

## 打ち手

1. PR #38/#39 のマージ（URL統一とlastmodでクロールの判断材料を整える）
2. オーナー: GSCで ga4-reader を「フル」権限へ → 以後sitemap再送信を自動化できる
3. オーナー: URL検査の「インデックス登録をリクエスト」を優先10件（APIが存在しないため手動のみ）
4. 構造案（要検討）: トップページ（唯一クロールされているページ）から記事への内部リンクを増やす
