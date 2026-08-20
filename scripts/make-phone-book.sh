#!/bin/bash
# 電話帳 phone-book.json（顧客ID → 電話番号のSHA256）を作る。
#
# make-phone-book.mjs と同じことを、macOSに最初から入っているコマンドだけで行う版。
# Node.jsを入れずに済ませたいとき用（ハッシュ値は .mjs 版と一致することを確認済み）。
#
#   使い方: bash scripts/make-phone-book.sh 入力.csv
#   入力  : 1列目=顧客ID, 2列目=電話番号 のCSV（見出し行はあってもなくてもよい）
#   出力  : 入力と同じ場所に phone-book.json
#
# ⚠️ 生の電話番号は出力にも画面にも出さない。出るのは件数と顧客IDだけ。
#    入力に使ったCSVは作業が済んだら消すこと（.gitignore でコミットは防いである）。
set -u

CSV="${1:-}"
if [ -z "$CSV" ] || [ ! -f "$CSV" ]; then
  echo "使い方: bash scripts/make-phone-book.sh 入力.csv" >&2
  exit 1
fi
OUT="$(cd "$(dirname "$CSV")" && pwd)/phone-book.json"
TMP="$(mktemp)"
trap 'rm -f "$TMP" "$TMP.n"' EXIT

# 1行ずつ正規化してハッシュ化する。
# 電話番号は数字だけ残し、先頭の0を81に置き換える（090-1234-5678 → 819012345678）
tr -d '\r' < "$CSV" | while IFS=, read -r id tel rest; do
  id=$(printf '%s' "$id" | tr -d '"' | tr -d ' ')
  tel=$(printf '%s' "$tel" | tr -d '"' | tr -cd '0-9')
  # 見出し行・空行・顧客IDが数字でない行は黙って飛ばす
  case "$id" in ''|*[!0-9]*) continue ;; esac
  case "$tel" in
    0*) tel="81${tel#0}" ;;
    81*) ;;
    *) echo "  スキップ（電話番号が読めない）: 顧客ID $id" >&2; continue ;;
  esac
  # 81 + 9〜10桁。桁が合わないものは推測で直さない
  case "${#tel}" in
    11|12) ;;
    *) echo "  スキップ（桁数が合わない）: 顧客ID $id" >&2; continue ;;
  esac
  printf '    { "customer_id": "%s", "phone_hash": "%s" }\n' \
    "$id" "$(printf '%s' "$tel" | shasum -a 256 | cut -d' ' -f1)" >> "$TMP"
done

COUNT=$(wc -l < "$TMP" | tr -d ' ')
if [ "$COUNT" -eq 0 ]; then
  echo "ERROR: 1件も読み取れませんでした。1列目=顧客ID, 2列目=電話番号 になっているか確認してください" >&2
  exit 1
fi

{
  printf '{\n  "note": "顧客ID → 電話番号のSHA256。生の電話番号は含まない。",\n  "records": [\n'
  sed '$!s/$/,/' "$TMP"     # 最終行以外の末尾にカンマを付ける
  printf '  ]\n}\n'
} > "$OUT"

echo "登録: ${COUNT}件 → $OUT"
echo "このファイルをDriveの「32_顧客電話_マスタ」へアップロードしてください。"
echo "入力に使ったCSVは、済んだら削除してください。"
