# Meta広告 CAPIオフラインイベント送信

回数券の成約実績を、Meta広告に**オフラインコンバージョン**として送る仕組み。
狙いは配信最適化を「体験に来る客」ではなく「**回数券を買う客**」に寄せること。

- スクリプト: `scripts/capi-upload.mjs`（依存パッケージなし・Node 22の標準機能のみ）
- ワークフロー: `.github/workflows/capi-upload.yml`（毎月3日 10:00 JST ＋ 手動実行）
- 状態の保存先: **`capi-state` ブランチ**（`capi-sent.json` と `capi-report_YYYY-MM.md`）

> `kpi-data` ブランチは週次ジョブ（`kpi-data.yml`）が毎回 `git init` + `git push --force` で
> 作り直すため、送信済み管理を置くと毎週消えて二重送信になる。そのため専用の `capi-state`
> ブランチを使い、こちらは履歴を保持したまま積み上げる。

## パイプライン全体像

| # | 頻度 | 誰が | 内容 |
|---|---|---|---|
| 1 | 月初・手動3分 | オーナー | サロンボード顧客画面のスクショをDrive「31_顧客電話_取込」へ入れる |
| 2 | 毎月2日 9:00・自動 | Cowork定期タスク | OCR → 電話番号を正規化・SHA256ハッシュ化 → 「32_顧客電話_マスタ」へ `phone-master_YYYY-MM.json` を保存 |
| 3 | 毎月3日 10:00・自動 | このリポジトリ | マスタを取得 → 62日以内の成約を抽出 → Meta CAPIへPurchase送信 |

サロンボード（salonboard.com）へのプログラムからのアクセスは規約で禁止されているため、
**このリポジトリからは一切行わない**。①のスクショ取り込みが唯一の接点。

## ⚠️ 前提: マスタに成約情報が必要（Cowork側の対応事項）

当初は「店舗システムの成約データと氏名で突合する」設計だったが、`kpi-data` ブランチの
`weekly_kpi.json` は**週次の集計値のみ**（`new_ticket_sales: 8` のような本数と週合計売上）で、
誰がいつ幾らで買ったかの1件ごとのレコードが存在しない。突合の材料がないため、
**成約日と金額を電話マスタ側に持たせる**方式に決定した（2026-08-19 オーナー判断）。

したがって②のCowork月次タスクを、成約日・金額も抽出して出力する形に更新する必要がある。
それが入るまで、このワークフローは「成約情報なし」として0件送信で正常終了する
（エラーにはならない）。

### phone-master_YYYY-MM.json のフォーマット

```json
[
  {
    "name": "山田太郎",
    "name_kana": "ヤマダタロウ",
    "phone_hash": "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
    "purchases": [
      { "date": "2026-08-12", "value": 132000, "content_name": "回数券" }
    ],
    "source_file": "customer_2026-08.png",
    "extracted_at": "2026-08-02T00:12:00Z"
  }
]
```

| フィールド | 必須 | 内容 |
|---|---|---|
| `phone_hash` | ✅ | `81`から始まる正規化番号のSHA256（小文字16進64桁）。これ以外はスキップ |
| `purchases[].date` | ✅ | 成約日。`YYYY-MM-DD` / `YYYY/M/D` / `YYYY年M月D日` を受け付ける |
| `purchases[].value` | ✅ | 成約金額（円）。`132000` / `"¥132,000"` / `"132000円"` を受け付ける。**Purchaseイベントは金額必須**のため、無い成約は送信されない |
| `purchases[].content_name` | – | 省略時は `回数券` |
| `name` / `name_kana` | – | 突合に使わなくなったので任意。**送信もレポート出力もしない** |

補足:
- `purchases` が無いレコードは「成約情報なし」として黙ってスキップされる（エラーにしない）。
- 単発形の `purchase_date` / `purchase_value` も後方互換で受け付ける。
- 同じ成約が複数月のマスタに載っていても、`(日付, 金額, 商品名)` が同じなら1件に畳まれる。
- 配列の代わりに `{"records": [...]}` でも読める。

## 送信されるイベント

```json
{
  "event_name": "Purchase",
  "event_time": 1786503600,
  "action_source": "physical_store",
  "event_id": "20260812_696c6457de7897b0",
  "user_data": { "ph": ["<sha256ハッシュ>"] },
  "custom_data": { "currency": "JPY", "value": 132000, "content_name": "回数券" }
}
```

- 送信先: `POST https://graph.facebook.com/v26.0/{META_DATASET_ID}/events`
  （v26.0は2026-07-29リリースの最新版。`META_GRAPH_VERSION` で差し替え可能）
- `event_time` は成約日の**JST正午**。日付しか分からないため、どのタイムゾーンで
  解釈しても同じ日になる時刻を採っている。
- `event_id` = `{成約日YYYYMMDD}_{phone_hash先頭16文字}`。Meta側の重複排除キーであり、
  こちらの送信済み管理キーでもある。
- 同一顧客・同一日に複数の成約があると `event_id` が衝突するため、**金額を合算して1件**に
  まとめる（レポートに件数を出す）。

### 除外されるもの

| 条件 | 理由 |
|---|---|
| 成約から62日より前 | Meta仕様。オフラインイベントは62日以内のみ受け付けられる |
| 未来日付 | OCRの読み取り誤りの可能性が高い |
| 金額がない | Purchaseイベントは `value` + `currency` が必須 |
| `capi-sent.json` に既にある | 二重送信の防止 |
| `phone_hash` が64桁16進でない | 生番号の混入・OCR崩れを弾く |

## 個人情報の扱い

- 生の電話番号・メールアドレスは**リポジトリ・ログ・レポートのどこにも書かない**。
  このスクリプトが受け取るのは最初からSHA256ハッシュ済みの値だけ。
- 氏名は突合に使わなくなったため、**一切出力しない**（レポートは件数と理由のみ）。
- dry_runのpayloadサンプルでもハッシュ値は `<sha256 redacted>` に伏せる。
- `capi-sent.json` に残るのは `event_id`（日付＋ハッシュ先頭16文字）のみ。
  62日窓を大きく超えた400日より古いものは自動で削除する。

## 運用手順

### 初回は3段階で確認する

1. **dry_run**（Actions → 「Meta CAPIオフラインイベント送信（月次）」→ Run workflow、
   `dry_run` は既定の **true** のまま）
   → 送信せず、件数とpayload概要だけログに出る。件数・金額が妥当か確認する。
2. **テスト送信**（`dry_run` を **false**、`test_event_code` にイベントマネージャの
   「テストイベント」タブに表示されるコードを入れる）
   → Metaのテストイベントタブに届くか確認する。この送信では `capi-sent.json` を更新しないので、
   同じ成約を本送信で送り直せる。
3. **本送信**（`dry_run` を **false**、`test_event_code` は空）
   → 以降は毎月3日に自動で走る。

イベントマネージャへの反映確認は、送信から最大数時間かかることがある。

### エラー時

Drive取得失敗・Meta API 4xx などが起きた場合、ワークフローは**失敗**し、
原因（HTTPステータスとレスポンス本文）がログに出る。数字を作らず、送信済み管理も更新しない。

### 必要なSecrets

Settings → Secrets and variables → Actions

| 名前 | 内容 |
|---|---|
| `GDRIVE_SA_KEY` | GCPサービスアカウントのキーJSON（**中身をそのまま貼る**） |
| `META_DATASET_ID` | Metaイベントマネージャのデータセット（旧オフラインイベントセット）ID |
| `META_CAPI_ACCESS_TOKEN` | Conversions APIのアクセストークン |

## オーナー側の手動セットアップ・チェックリスト

- [ ] **Metaイベントマネージャ**（business.facebook.com/events_manager）でデータセットを作成
      → データセットIDを控える → Secretsの `META_DATASET_ID` へ
- [ ] 同じデータセットの「設定」→「Conversions APIのアクセストークンを生成」
      → Secretsの `META_CAPI_ACCESS_TOKEN` へ（**トークンは1度しか表示されない**）
- [ ] このデータセットを広告アカウントに紐づけ（イベントマネージャ →「ビジネスアセット」）
- [ ] **GCP**（console.cloud.google.com）でプロジェクトを開き、**Google Drive APIを有効化**
- [ ] IAM → サービスアカウントを作成 → 「キー」タブ → JSONキーを作成・ダウンロード
      → ファイルの中身をまるごと Secretsの `GDRIVE_SA_KEY` へ
- [ ] Driveフォルダ「**32_顧客電話_マスタ**」を、そのサービスアカウントのメールアドレス
      （`...@....iam.gserviceaccount.com`）に**閲覧者**で共有
- [ ] Cowork月次タスクを、`purchases`（成約日・金額）を含む形式で出力するよう更新
      （上記「phone-master_YYYY-MM.json のフォーマット」参照）
- [ ] 上記が揃ったら dry_run → test_event_code → 本送信の順で確認
- [ ] 送信が溜まってきたら、Metaの広告セットで「回数券Purchase」を最適化イベントに設定

## 参考

- マッチ率はスクショの網羅性次第。全員分は不要で、5割でも学習信号としては機能する。
