# コラム キーワード・バックログ（優先順）

`docs/COLUMN_SEO_GUIDE.md` の方針に従い、**上から順に1本ずつ**執筆する。公開したら `- [ ]` を `- [x]` にする。
各行：`slug ｜ type ｜ 主要キーワード ｜ 検索意図 ｜ 内部リンク先`。追加・並べ替えは自由（自店で一次体験を語れるテーマを優先）。

## type（記事の狙い分け）

| type | 意味 | キーワードの組み方 | 例 |
| --- | --- | --- | --- |
| `authority` | **権威性型**。地域名を含まず、悩み・目的で全国から集める。サイト全体の専門性（E-E-A-T）とコンテンツ総量を積み上げる。 | 症状 × 意図 × 属性/季節 で3〜4語 | デスクワーク 肩こり 肩甲骨 ストレッチ |
| `local` | **集客直結型**。地域名を含み、来店見込みの高い層を直接取る。 | ローカル × 症状 × 意図 で3〜4語 | 岐阜 長良 ストレッチ 肩こり |
| `compare` | **比較・選び方型**。「AとBの違い」「◯◯の選び方」「◯◯とは」を扱う。結論先出し・比較表・Q&Aの形式はAI検索（ChatGPT/Gemini等）が回答の根拠として引用しやすく、LLMO枠として週1本積む。 | 対象A × 対象B × 違い/選び方 | ストレッチ もみほぐし 違い |

### 現在の優先方針：週3本のうち月・水は `authority`、金は `compare`

`.github/workflows/column-auto.yml` が実行日の曜日を見て枠を決める（金曜=`compare`、それ以外=`authority`）。
枠の未対応が尽きた場合は `authority` → `local` の順にフォールバックする。



自然検索の流入が**直近28日で8人**と母数が小さく、`local` を書いても現状ではほぼ露出しない。
まず `authority` で記事数と専門性を積み上げ、サイト全体の評価と流入の母数を作る。
**`authority` の未対応がすべて消化されてから `local` に着手する**（流入が育った時点で前倒ししてもよい）。

---

## 既存（対応済み・重複注意）
- [x] katakori-desk-stretch ｜ authority ｜ デスクワーク 肩こり ストレッチ ｜ セルフケア ｜ /symptoms/katakori
- [x] youtsu-morning-stretch ｜ authority ｜ 朝 腰 重い ストレッチ ｜ セルフケア ｜ /symptoms/youtsu
- [x] golf-stretch-routine ｜ authority ｜ ゴルフ ストレッチ 前後 ｜ セルフケア ｜ /symptoms/sports

## 優先バックログ

### むくみ・冷え
- [x] mukumi-yugata-ashi ｜ authority ｜ 夕方 脚 むくみ ふくらはぎ ストレッチ ｜ セルフケア ｜ /symptoms/mukumi
- [x] hiesho-shimohanshin ｜ authority ｜ 冷え性 ストレッチ 下半身 血流 ｜ セルフケア ｜ /symptoms/mukumi
- [x] tachishigoto-mukumi ｜ authority ｜ 立ち仕事 むくみ 対策 ｜ 悩み特化 ｜ /symptoms/mukumi

### 首こり・眼精疲労
- [x] smartphone-kubi ｜ authority ｜ スマホ首 ストレートネック セルフケア ｜ セルフケア ｜ /symptoms/kubi-ganseihiro
- [x] ganseihiro-kubikori ｜ authority ｜ 眼精疲労 首こり ストレッチ ｜ 関係解説 ｜ /symptoms/kubi-ganseihiro
- [x] pc-kubikori-reset ｜ authority ｜ パソコン 首こり 1時間ごと リセット ｜ セルフケア ｜ /symptoms/kubi-ganseihiro

### 姿勢・猫背
- [x] nekoze-makigata ｜ authority ｜ 猫背 巻き肩 ストレッチ 改善 ｜ セルフケア ｜ /symptoms/shisei
- [x] sorikoshi-check ｜ authority ｜ 反り腰 セルフチェック ストレッチ ｜ セルフケア ｜ /symptoms/shisei, /symptoms/youtsu
- [x] shisei-taikan ｜ authority ｜ 良い姿勢 体幹 保ち方 ｜ 解説 ｜ /symptoms/shisei

### 自律神経・疲れ・睡眠
- [x] neruma-shinkokyu ｜ authority ｜ 寝る前 ストレッチ 睡眠の質 ｜ セルフケア ｜ /symptoms/jiritsu
- [x] tsukare-nukenai ｜ authority ｜ 疲れ 抜けない 自律神経 ストレッチ ｜ 悩み特化 ｜ /symptoms/jiritsu
- [x] asa-sukkiri ｜ authority ｜ 朝 すっきり ストレッチ 目覚め ｜ セルフケア ｜ /symptoms/jiritsu

### 肩こり（既存と意図を分ける）
- [ ] katakori-zutsu ｜ authority ｜ 肩こり 頭痛 ストレッチ ｜ 悩み特化 ｜ /symptoms/katakori, /symptoms/kubi-ganseihiro
- [ ] kenkokotsu-hagashi-self ｜ authority ｜ 肩甲骨はがし セルフ 安全 ｜ やり方 ｜ /symptoms/katakori
- [ ] shijukata-chuui ｜ authority ｜ 四十肩 五十肩 ストレッチ 注意点 ｜ 注意喚起 ｜ /symptoms/katakori

### 腰痛（既存と意図を分ける）
- [ ] gikkurigoshi-after ｜ authority ｜ ぎっくり腰 後 ストレッチ いつから ｜ 注意喚起 ｜ /symptoms/youtsu
- [ ] unten-youtsu ｜ authority ｜ 長時間 運転 腰痛 ストレッチ ｜ 悩み特化 ｜ /symptoms/youtsu
- [ ] sango-youtsu ｜ authority ｜ 産後 腰痛 骨盤 セルフケア ｜ 悩み特化 ｜ /symptoms/youtsu

### スポーツ（既存と意図を分ける）
- [ ] running-zengo ｜ authority ｜ ランニング ストレッチ 前後 故障予防 ｜ セルフケア ｜ /symptoms/sports
- [ ] undousoku-5min ｜ authority ｜ 運動不足 解消 1日5分 ストレッチ ｜ 入門 ｜ /symptoms/sports, /symptoms/jiritsu

### 比較・選び方（`compare` 枠／金曜に消化）
- [x] stretch-momihogushi-chigai ｜ compare ｜ ストレッチ もみほぐし 違い ｜ 使い分け ｜ /method, /menu
- [ ] personal-stretch-towa ｜ compare ｜ パーソナルストレッチ とは 初めて ｜ 入門 ｜ /method, /reserve
- [ ] stretch-seitai-erabikata ｜ compare ｜ ストレッチ専門店 整体 選び方 ｜ 使い分け ｜ /method, /symptoms
- [ ] dynamic-static-chigai ｜ compare ｜ 動的ストレッチ 静的ストレッチ 違い 使い分け ｜ 解説 ｜ /symptoms/sports
- [ ] kaisuken-tsuikata ｜ compare ｜ ストレッチ 通う頻度 目安 選び方 ｜ 検討 ｜ /menu, /reserve
- [ ] jitaku-vs-pro ｜ compare ｜ セルフストレッチ プロ 違い ｜ 使い分け ｜ /method, /symptoms

### 検討系（`authority`）
- [ ] stretch-hindo-kouka ｜ authority ｜ ストレッチ 頻度 効果 続け方 ｜ 解説 ｜ /symptoms/jiritsu
- [ ] karada-katai-kotsu ｜ authority ｜ 体 硬い 柔らかく コツ 無理なく ｜ 入門 ｜ /symptoms/shisei

### 季節
- [ ] haru-jiritsu-shinkei ｜ authority ｜ 春 不調 自律神経 ストレッチ ｜ 季節 ｜ /symptoms/jiritsu

### 地域（local型・流入が育ってから着手）
- [ ] stretch-seitai-chigai ｜ local ｜ ストレッチ 整体 マッサージ 違い 岐阜 ｜ 比較検討 ｜ /menu, /symptoms/katakori
- [ ] gifu-stretch-senmonten ｜ local ｜ 岐阜市 ストレッチ 専門店 選び方 ｜ ローカル指名 ｜ /access, /staff
- [ ] fuyu-katakori-mukumi ｜ local ｜ 冬 肩こり むくみ 岐阜 対策 ｜ 季節×地域 ｜ /symptoms/katakori, /symptoms/mukumi
- [ ] hirune-yasumi-office ｜ local ｜ 昼休み オフィス ストレッチ 岐阜 デスクワーク ｜ 属性×地域 ｜ /symptoms/katakori, /symptoms/shisei
