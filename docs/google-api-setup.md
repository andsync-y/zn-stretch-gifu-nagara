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

## ⚠️ サービスアカウントキーは使えない（2026-08-27に判明）

`andsync.jp` の組織ポリシー **`iam.managed.disableServiceAccountKeyCreation`** が
鍵の発行をブロックしている（Googleの「デフォルトで保護」により自動適用されたもの）。

そこで **Workload Identity 連携**（GitHubのOIDCトークンをGoogleのトークンへ交換する方式）へ切り替えた。
**鍵ファイルが存在しない**ので、GitHub Secretsに恒久的な認証情報を置かずに済む。
組織のセキュリティ設定を緩める必要もない。

以下は現在の手順。鍵方式の記述は、組織ポリシーが変わった場合の逃げ道として末尾に残してある。

## 現行の設定（Workload Identity 連携）

前提:
- プロジェクト `zenryoku-analytics`（プロジェクト番号 **663123106918**）
- サービスアカウント **`ga4-reader@zenryoku-analytics.iam.gserviceaccount.com`**（既存）
- Google Analytics Data API と Google Search Console API は有効化済み

### A. IAM Service Account Credentials API を有効化

[有効化する](https://console.cloud.google.com/apis/library/iamcredentials.googleapis.com?project=zenryoku-analytics)

サービスアカウントを「借用」してトークンを発行するために必要。

### B. Workload Identity プールとプロバイダを作る

「IAMと管理」→「**Workload Identity 連携**」→「プールを作成」

1. **プール**: 名前 `github` / ID `github`
2. **プロバイダを追加**:
   - プロバイダの選択: **OpenID Connect (OIDC)**
   - プロバイダ名 / ID: `zn-stretch`
   - 発行元(Issuer) URL: `https://token.actions.githubusercontent.com`
   - オーディエンス: **「デフォルトのオーディエンス」のまま**
3. **属性のマッピング**:
   | Google | OIDC |
   |---|---|
   | `google.subject` | `assertion.sub` |
   | `attribute.repository` | `assertion.repository` |
   | `attribute.repository_owner` | `assertion.repository_owner` |
4. **属性の条件**（必須。これが無いと他人のリポジトリからも入れてしまう）:
   ```
   assertion.repository_owner == 'andsync-y'
   ```

### C. サービスアカウントに借用を許可

`ga4-reader` を開く →「**権限**」タブ →「アクセスを許可」

- プリンシパル:
  ```
  principalSet://iam.googleapis.com/projects/663123106918/locations/global/workloadIdentityPools/github/attribute.repository/andsync-y/zn-stretch-gifu-nagara
  ```
- ロール: **Workload Identity ユーザー**（`roles/iam.workloadIdentityUser`）

### D. GA4 と Search Console に閲覧権限を渡す

`ga4-reader@zenryoku-analytics.iam.gserviceaccount.com` を、

- **GA4**: 管理 →「プロパティのアクセス管理」→ 役割「**閲覧者**」
  （名前からして既に入っている可能性が高い。入っていれば何もしない）
- **Search Console**: 設定 →「ユーザーと権限」→ 権限「**制限付き**」

### E. GitHubに登録（Secretsではなく Variables）

秘密情報ではないため **Variables** に入れる。
[Variables の画面](https://github.com/andsync-y/zn-stretch-gifu-nagara/settings/variables/actions)

| Name | Value |
|---|---|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/663123106918/locations/global/workloadIdentityPools/github/providers/zn-stretch` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `ga4-reader@zenryoku-analytics.iam.gserviceaccount.com` |

ワークフロー側には `permissions: id-token: write` を追加済み。

---

## （参考）鍵方式 — 組織ポリシーが変わった場合のみ

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
2. ✅ Workload Identity 連携の設定（初回で認証成功）
3. ✅ **突き合わせ完了。1,743行すべて一致**（値ちがい0・片側だけの行0）
   | ga4_events_7d 261 | ga4_pages_7d 89 | ga4_events_30d 1,045 |
   | ga4_sessions_30d 156 | gsc_queries_28d 148 | gsc_queries_prev28d 44 |
   30日窓・28日窓も一致したので、期間の端（タイムゾーン起因のズレ）の扱いも同じと確認できた
4. ✅ 突き合わせ用コードを削除
5. ✅ Windsor側で GA4・Search Console・Microsoft Clarity の接続を解除（6件 → 3件）
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
