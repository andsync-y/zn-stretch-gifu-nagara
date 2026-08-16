# 店舗KPI自動取得（kpi-scraper）

店舗システム（system.zn-stretch.com）に毎週月曜7:00(JST)に自動ログインし、前週のKPI
（新規来店数・回数券販売本数・更新本数など）を取得して `kpi-data` ブランチに書き出す。
月曜9:30の週次経営レビューRoutineが `git show origin/kpi-data:weekly_kpi.json` で読む。

## セットアップ（1回だけ）

1. リポジトリの Settings → Secrets and variables → Actions で以下を追加：
   - `ZN_SYSTEM_USER` … 店舗システムのログインID
   - `ZN_SYSTEM_PASS` … 店舗システムのパスワード
2. Actions タブ →「店舗KPIデータ取得（週次自動）」→ Run workflow（modeは空でOK）。
3. 初回は探索モード（discovery）で動き、ページ構造だけが `kpi-data` ブランチの
   `discovery.json` に書き出される。それを見てClaudeが `selectors.json` を設定し
   `configured: true` にすると、次回から本取得（parse）に切り替わる。

## 安全設計

- 顧客名などの個人情報・生HTML・スクリーンショットは一切保存しない。
  探索モードが書くのはURL・リンク文言・テーブル見出し・フォーム項目名のみ。
- 認証情報はGitHub Secretsのみに置く。コード・ログ・ブランチには書かない。
- 取得失敗時もエラー状態を `_meta.json` に書き出し、週次レビュー側で「未取得」として扱う
  （数字の創作はしない）。

## 出力（kpi-dataブランチ）

- `weekly_kpi.json` … 前週（月〜日）のKPI。`status: ok | partial | login_failed`
- `discovery.json` … 探索モードの構造レポート
- `_meta.json` … 実行メタ情報
