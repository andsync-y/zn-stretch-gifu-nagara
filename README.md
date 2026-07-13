# 全力ストレッチ岐阜長良店 ローカルSEOサイト

岐阜市長良の完全個室パーソナルストレッチ専門店「全力ストレッチ岐阜長良店」のローカルSEO／AI検索最適化（AIO/LLMO/GEO）サイトです。
**Astro（静的サイト）＋ TypeScript ＋ Tailwind CSS** で構築、**Cloudflare Pages** にそのままデプロイできます。

## 技術構成
- [Astro](https://astro.build/) v5（静的出力・過剰なJSなし）
- TypeScript（strict）
- Tailwind CSS v3（ブランドカラーを `tailwind.config.mjs` に登録）
- `@astrojs/sitemap`（`sitemap.xml` 自動生成）
- Google Fonts（Noto Sans JP / Zen Kaku Gothic New / Yomogi、`display=swap`）
- 構造化データ（JSON-LD）：LocalBusiness / FAQPage / Service / Person / BreadcrumbList / ItemList

## セットアップ

```bash
npm install      # 依存関係のインストール
npm run dev      # 開発サーバー（http://localhost:4321）
npm run build    # 本番ビルド → dist/ を生成
npm run preview  # ビルド結果をローカル確認
```

Node.js 18.20.8 以上（推奨 20 以上）が必要です。

## ディレクトリ構成

```
public/
  robots.txt          # 主要＋AIクローラを許可、Sitemap行あり
  favicon.svg
  images/             # プレースホルダ画像（実写に差し替え）
src/
  consts.ts           # ★サイト共通データ（NAP・料金・スタッフ・症状・placeholder）
  styles/global.css   # Tailwind＋ブランドのベーススタイル
  layouts/
    Base.astro        # <head>・OGP・LocalBusiness JSON-LD・ヘッダ/フッタ
    SymptomLayout.astro  # 症状ページ共通の骨組み＋FAQPage/Service/Breadcrumb JSON-LD
  components/         # Header / Footer / Breadcrumbs / FAQ / PriceHighlight / ReserveCTA
  pages/
    index.astro
    menu.astro / staff.astro / access.astro / voice.astro / reserve.astro
    symptoms/
      index.astro
      katakori / youtsu / kubi-ganseihiro / mukumi / jiritsu / shisei / sports .astro
docs/                 # 運用ドキュメント（下記）
```

### 運用ドキュメント（`docs/`）
- `keyword-map.md` … キーワード設計（検索クエリ→ページ、各ページのtitle/H1/description案）
- `yakkihou-ng-ok.md` … 薬機法・景表法のNG→OK言い換え表
- `gbp-checklist.md` … Googleビジネスプロフィール最適化＋口コミ導線＋サイテーション手順
- `morning-todo.md` … 「朝、オーナーがやること」チェックリスト

## Vercel デプロイ手順（本番ドメイン：zn-stretch-gifu.com）

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン → **Add New → Project** → このリポジトリをImport。
2. FrameworkはAstroが自動検出される（Build: `npm run build`／Output: `dist`）。そのまま**Deploy**。
3. 以降、本番ブランチへのpushで自動デプロイ。他ブランチはプレビューURLが自動発行される。
4. **カスタムドメイン**：Vercelプロジェクト → **Settings → Domains** → `zn-stretch-gifu.com` と `www.zn-stretch-gifu.com` を追加。
5. **XserverのDNS設定**（サーバーパネル → DNSレコード設定）に以下を追加・変更：

| 種別 | ホスト | 値 | 備考 |
|---|---|---|---|
| A | @（空欄） | `76.76.21.21` | 既定のXserver向けAレコードがあれば置き換える |
| CNAME | www | `cname.vercel-dns.com` | |
| MX / TXT(SPF) | — | 変更しない | Xserverメールを使う場合は既存値のまま残す |

6. Vercel側でドメインの検証が通れば公開完了（SSLは自動発行）。

> 旧メモ：当初はCloudflare Pages想定だったが、Vercel＋Supabase＋Resend構成（予約フォーム拡張）を見据えてVercelに変更。

## プレースホルダ `{{...}}` 一覧

実データが未確定の箇所は `{{...}}` にしています（捏造しないため）。埋める場所と内容は下表のとおり。

| プレースホルダ | 何を入れる | 差し込む場所 |
|---|---|---|
| `{{お客様の声_◯◯_n}}` | 実際にいただいた感想（**許可のうえ・捏造禁止**） | 各症状ページ・`/voice`・トップ |
| `{{スタッフ_写真}}` | スタッフの実写真（webp推奨） | `public/images/placeholder-staff.svg` を差し替え |
| `{{スタッフ_経歴_（氏名）}}` | 確認できたスタッフの経歴・資格（**創作禁止**） | `/staff` |
| `{{店内写真}}` | 完全個室・店内の実写真 | `public/images/placeholder-*.svg` を差し替え |
| `{{最寄り}}` | 公共交通の最寄り・所要時間 | `/access` |
| `{{駐車場情報}}` | 駐車場の詳細（区画・停め方など） | `/access`（既定文＋補足） |
| `{{本部_店舗数}}` | 本部確認による最新の店舗数 | トップのブランド実績（現状「約70店舗」） |
| `{{料金_60分}}` `{{料金_90分}}` 等 | 確定料金（変わらなければ現状のまま） | `src/consts.ts` の `PRICING` |
| `{{支払い方法}}` `{{着替え_貸出}}` `{{キャンセルポリシー}}` | 店舗運用ルール | `/menu`・`/reserve` |
| 郵便番号（`postalCode`） | 正確な郵便番号 | `src/consts.ts`（暫定値が入っています） |

### レビュー構造化データについて
`/voice` にある **Review / AggregateRating の JSON-LD ひな型はコメントアウト**しています。
**実際の口コミが集まってから**、実データで埋めてコメントを外してください（空データ・創作データでの出力は禁止）。

## 編集のポイント
- NAP（店名・住所・電話）・料金・スタッフ情報は **`src/consts.ts` に集約**。1か所直せば全ページに反映されます。
- 本文の表現は必ず `docs/yakkihou-ng-ok.md`（薬機法・景表法）に従ってください。
- 症状ページの本文は1枚ずつ書き分けています（コピペ量産していません）。

---
© 株式会社ANDSYNC / 全力ストレッチ岐阜長良店
