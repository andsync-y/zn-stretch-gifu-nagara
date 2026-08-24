---
name: zenryoku-data
description: 全力ストレッチ岐阜長良店の計測データ（Meta広告・Google広告・GA4・Search Console・Microsoft Clarity・店舗システムKPI）を読む手順。週次経営レビュー、広告デイリー監視、LP改善の根拠集め、CPAや到達率の確認など、数字を根拠に何かを言うときに使う。データはGitHubのwindsor-data／kpi-dataブランチにJSONで置かれている。
---

# 計測データの読み方

データは**GitHubの専用ブランチ**に毎朝置かれる。API/MCPを直接叩くのは最後の手段。
MCP接続が切れていても git は落ちないので、こちらを第一経路にしている。

## 0. リポジトリが無いセッションのとき

スケジュールタスクなど、リポジトリが用意されていない状態で動くことがある。
`git` コマンドが `not a git repository` で失敗したら、まず作業用に取得する。

```bash
cd ~ && git clone --depth=1 --filter=blob:none --no-checkout \
  https://github.com/andsync-y/zn-stretch-gifu-nagara data-repo
cd data-repo
```

以降は同じ手順で `git fetch` / `git show` が使える。
クローンできない場合は Windsor MCP へフォールバックし、
**取得できなかったことをレポートに明記する**（黙って省略しない）。

## 1. まず鮮度を確認する

```bash
git fetch --depth=1 origin windsor-data
git show FETCH_HEAD:_summary.json
```

`fetched_at` が古い（デイリー監視なら24時間、週次なら48時間より前）なら、
GitHub Actions「広告データ取得（Windsor中継）」を `workflow_dispatch` で起動し、
5分待って取り直す。それでも駄目なら Windsor MCP に直接フォールバックする。

`_summary.json` の `results.<名前>.ok` が `false` の項目は**取得できていない**。
その項目の数字は書かない（「未取得」と明記する）。

⚠️ **`ok` は「取得が成功したか」であって「データが最新か」ではない。**

| 媒体 | 到着の遅れ | 意味 |
|---|---|---|
| **Google広告** | **2日** | 月曜朝に取れるのは**土曜まで**。「直近7日」を名乗ると1日足りない |
| Meta広告 | 1日 | |
| GA4 | 1日 | |

`fetched_at` が今朝でも、Googleの中身は2日前までしかない。**手動で取り直しても縮まらない。**
週次レポートでGoogleの週合計を出すときは、**何日分が入っているかを明記する**こと。
変更の効果を検証する日を決めるときは、Googleなら2日足す。

（`facebook_budget` と `gmb_reviews` は2026-08-23までフィールド名の誤りで失敗し続けていたが、
**修正済みで現在は正常に取れている**。取れない前提で飛ばさないこと。）

## 2. ファイル一覧（windsor-data ブランチ）

```bash
git show FETCH_HEAD:facebook_7d.json
```

| ファイル | 中身 |
|---|---|
| `facebook_yesterday` / `facebook_7d` / `facebook_30d` | Meta広告。spend・広告別・LPビュー・ピクセルLead。**`clicks` は効率指標に使わない** |
| `facebook_budget` | Metaの**設定予算**（`adset_daily_budget`）と残額。設定と実消化の乖離を見る |
| `facebook_frequency_14d` | 広告疲労。`reach` / `impressions` / `frequency`。**日次を合算しないこと**（重複が排除されない） |
| `google_ads_yesterday` / `google_ads_7d` / `google_ads_30d` | Google広告。spend・CPC・CV |
| `google_budget_7d` | **表示シェアの内訳。** `search_budget_lost_impression_share`（予算不足→増額が効く）と `search_rank_lost_impression_share`（順位不足→**増額しても消化できない**）。打ち手が正反対になるので必ず両方見る |
| `google_search_terms_7d` | 検索語句。無関係クエリを見て除外KWを足す |
| `gsc_queries_28d` / `gsc_queries_prev28d` | Search Console。自然検索の順位・表示回数 |
| `gmb_insights_30d` | GBPの露出・サイトクリック・電話・**経路案内リクエスト**。ローカル検索の効果はここでしか測れない |
| `gmb_keywords_30d` | GBPで**どんな検索語で見つかっているか**。地図枠SEOの直接の材料 |
| `gmb_reviews` | 口コミと返信状況。**`review_reply_comment` が空＝未返信** |
| `ga4_events_7d` / `ga4_events_30d` | GA4イベント。`click_reserve` / `click_line` / `click_tel`。**サイト全体（全流入）** |
| `ga4_pages_7d` / `ga4_sessions_30d` | GA4のページ・セッション |
| `clarity_7d` | Microsoft Clarity の行動データ（下記） |
| `probe_bid_a/b/c` | 入札テストの記録 |

**レポートで使われていないファイルがある**（`gsc_queries_28d`・`gmb_keywords_30d`・
`ga4_sessions_30d` など）。取れているのに読まれていないだけなので、
改善提案のネタが足りないときはここを見る。

## 2-1. 数字を結論に使う前に

**`docs/metrics-definitions.md` を必ず読む。** 同じ月に指標の取り違えを5件出している。
特に間違えやすいのは次の3つ。

| 落とし穴 | 正しい扱い |
|---|---|
| Meta の `clicks` | いいね・シェア・プロフィールクリックを含む。効率は `actions_landing_page_view` で出す |
| Google の `conversions` | 入札の最適化対象であって**実来店ではない** |
| GA4 の予約アクション | **全流入**。Meta広告の成果として扱わない（広告帰属分はMetaのピクセルLead） |

**予約アクション → 実来店の実測換算率は 0.17〜0.19。** `zenryoku-facts` が長く「0.6〜0.7」と
書いていたため、新規ペースを3.5倍に過大評価していた（2026-08-24 訂正済み）。

## 3. Clarity（clarity_7d.json）の読み方

**必ずトップレベルの `no_data` を先に見る。**

- `no_data: true` → **数字を一切書かない。**「Clarityにまだ行動データがありません」と1行だけ。
  `_summary.json` の `results.clarity_7d.error` に理由があれば添える。**推測で数字を作らない。**
- `no_data: false` → `days` の最新要素（`date` が最新）の
  `overall.data` と `by_page_device.data` を読む。**実際に返っている指標だけ**を引用する。
  返っていない指標を作らない。

構造上の注意:

- `days` は**取得日ごとのスナップショット**で、各要素は `num_of_days`（3日）ぶんの集計。
  **日別推移として語らない。**
- `overall.data` は全体サマリー（約4KB）。ScrollDepth・DeadClickCount・RageClickCount・
  ScriptErrorCount・EngagementTime・Traffic など。まずここを見る。
- `by_page_device.data` は**パス×デバイス**の内訳。
  ClarityのAPIはURLをクエリ文字列ごと別ページとして返す（広告流入の `fbclid` で数百行に分裂する）ため、
  保存時に**クエリを落としてパス単位に畳んである**。`Url` はパスだけ、
  `rows_merged` はその行が元の何行を畳んだか、`folded` に集約前後の行数がある。
  件数は合計、率・平均はセッション数で加重平均している。

制約: Data Export API は**1プロジェクト10リクエスト/日**。取得は1実行3回までに固定してある。
手で叩くとワークフローの取り分を食うので、必要な時以外は叩かない。

## 4. 店舗システムのKPI（kpi-data ブランチ）

```bash
git fetch --depth=1 origin kpi-data
git show FETCH_HEAD:weekly_kpi.json
```

`status` が `ok` か `partial` で、`week_start` が前週の月曜なら `metrics` を実数として使う。
`login_failed` なら使わない。`churn_risk.json` は**存在しない**（施策Jは2026-08-20に打ち切り）。
無くてもエラー扱いにしない。

## 5. 実数の優先順位（週次レビュー）

1. `kpi-data:weekly_kpi.json`（店舗システムの自動取得）
2. **週次KPI入力シート**（手入力）。自動取得と食い違ったら**シートを優先**し、食い違いをレポートに明記する
3. Drive `10_Notes` / `00_Inbox` の売上・KPIノート

どこからも取れない項目は**推測で埋めず「未取得」**と書き、
レポート末尾で1回だけ入力を依頼する。IDと指標の定義は `zenryoku-facts` を見る。

## 6. 数字を出すときの原則

- **サイト全体の数字と広告セットに紐づく数字を混ぜない。**
  過去に GA4 のサイト全体 Lead 数（週79件）を広告セットの成果（実際は週2件）として扱い、
  Metaの学習フェーズの判断を誤らせかけた。**どの範囲の数字かを必ず添える。**
- 数字を根拠に改善案を出す前に、**その数字が実測で裏付くか確認する。**
  /lp の「価格が埋もれている」という仮説は、Playwrightで実測したら
  価格は9.8%の位置（ファーストビュー）にあり、仮説ごと間違いだった。
- 取れなかったものは「取れなかった」と書く。空欄より無害。
