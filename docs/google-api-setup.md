# GA4 / Search Console を公式APIで取るための設定

**所要 15〜20分。オーナーの手作業が必要な部分だけをまとめたもの。**

## なぜやるか

Windsorの料金は**接続しているデータソースの数**で決まる。

| プラン | 月額（年払い） | データソース |
|---|---|---|
| Basic | $23（$19） | 3 |
| Standard | $118（$99） | 7 |

当店が接続しているのは6件だが、**実際に必要なのは5件**（Microsoft ClarityはWindsorを経由せず
公式APIから直接取っているため、枠を無駄に1つ使っている）。

GA4とSearch Consoleを公式APIへ移すと **5件 → 3件** になり、**Basicに収まる**。
公式APIはどちらも無料。差額は月$95（年払いなら$80）で、**年間およそ11〜14万円**。

BasicとStandardの他の違い（destination tasks 5→無制限、同期頻度 Daily→Daily/hourly）は
**BigQueryやスプレッドシートへの定期書き出し機能**にしか効かず、当店は使っていない。

## 手順

### 1. Google Cloudでサービスアカウントを作る

1. https://console.cloud.google.com/ を開く（GA4・Search Consoleと同じGoogleアカウントで）
2. プロジェクトを1つ作る（既存があればそれでよい）。名前は `zn-stretch-data` など
3. 「APIとサービス」→「ライブラリ」で次の**2つを有効化**する
   - **Google Analytics Data API**
   - **Google Search Console API**
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「**サービス アカウント**」
   - 名前は `zn-stretch-fetcher` など。**ロールは付けなくてよい**（GA4/GSC側で個別に権限を渡すため）
5. 作ったサービスアカウントを開く →「キー」タブ →「鍵を追加」→「新しい鍵を作成」→ **JSON**
   - JSONファイルがダウンロードされる。**このファイルが認証情報そのもの。取り扱い注意**

### 2. サービスアカウントに閲覧権限を渡す

ダウンロードしたJSONの中の **`client_email`**（`...@....iam.gserviceaccount.com`）をコピーしておく。

**GA4**
1. GA4の管理画面 →「管理」→「プロパティのアクセス管理」
2. 「＋」→「ユーザーを追加」→ 上のメールアドレスを貼る
3. 役割は「**閲覧者**」。メール通知のチェックは外してよい（送信先が人ではないため）

**Search Console**
1. Search Consoleの「設定」→「ユーザーと権限」
2. 「ユーザーを追加」→ 上のメールアドレスを貼る
3. 権限は「**制限付き**」で足りる

### 3. GitHubのSecretsに登録する

1. https://github.com/andsync-y/zn-stretch-gifu-nagara/settings/secrets/actions
2. 「New repository secret」
3. Name: **`GOOGLE_SERVICE_ACCOUNT_JSON`**
4. Secret: **ダウンロードしたJSONファイルの中身を丸ごと貼り付ける**（`{` から `}` まで全部）

> 改行が `\n` という2文字に化けていても動くようにしてある（`scripts/lib/google-auth.mjs` が復元する）。

### 4. 動作確認

GitHub Actionsの「広告データ取得（Windsor中継）」を手動実行すると、ログに次が出る。

```
ga4_events_7d: NNN行
ga4_pages_7d: NNN行
ga4_events_30d: NNN行
ga4_sessions_30d: NNN行
gsc_queries_28d: NNN行（うち指名 NN件）
gsc_queries_prev28d: NNN行
```

## 移行の進め方（Windsorを切るのは最後）

**いきなりWindsorのGA4/GSC接続を切らない。** 数字が合うことを確かめてからにする。

1. ✅ 公式API版のスクリプトを実装（`fetch-ga4-data.mjs` / `fetch-gsc-data.mjs`）
2. ⬜ 上の設定を済ませる（オーナー作業）
3. ⬜ **2〜3日、両方を並走させる。** Windsor側は `out/_windsor_*.json` に、公式API側は
   正となる `out/*.json` に書かれるので、同じ日の数字を突き合わせられる
4. ⬜ 一致を確認したら `fetch-windsor-data.mjs` の `compare: true` の6行を削除
5. ⬜ **Windsor側で GA4・Search Console・Microsoft Clarity の接続を切る**（6件 → 3件）
6. ⬜ **Basicへ変更**

**5番を実行して初めて費用が下がる。** 接続したままプランだけ落とすことはできない。

## 移行で直したこと

Windsorの `branded_vs_nonbranded` は**全件 `nonbranded` を返していた**（2026-08-27に確認）。
「全力ストレッチ」という完全な指名検索まで非指名扱いで、指標として機能していなかった。

判定は `scripts/lib/branded.mjs` に移し、テストも置いた（`scripts/test/branded.test.mjs`）。
**指名/非指名の切り分けはSEO評価の軸そのもの**で、指名が伸びても新規開拓にはならない。
これが正しく出るようになったのは、コスト削減の副産物として大きい。

## 注意点

- **GA4の日付はプロパティのタイムゾーンで解釈される。** `7daysAgo`〜`yesterday` の窓は
  Windsorの `last_7d` と同じ7日間になるはずだが、突き合わせのときは端の日だけ差が出ることがある
- **Search Consoleのデータは2〜3日遅れる。** 直近日が0件でも異常ではない
- **GA4もSearch Consoleも取得失敗では異常終了しない。** 広告データのコミットまで巻き添えに
  しないため。失敗は `out/_summary.json` に残るので、デイリー監視が鮮度チェックで気づく
- サービスアカウントのJSONは**認証情報**。リポジトリに置かない（Secretsのみ）
