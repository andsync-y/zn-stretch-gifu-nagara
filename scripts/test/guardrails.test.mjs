import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseGuardrails, readGuardrails, GUARDRAILS_NOTICE } from '../lib/guardrails.mjs';

const MD = `# 広告運用ガードレール

## 現在の予算設定（実測値）

| 媒体 | 1日予算 | 変更日 | 備考 |
|---|---|---|---|
| **Meta** | **¥7,200** | **2026-08-25** | ¥6,000から増額 |
| **Google検索** | **¥4,800** | **2026-08-25** | ¥6,000から減額 |

- **合計 ¥12,000/日**（月換算 約¥360,000）。
- これを超える増額はオーナー承認必須。

### 過去の値（判定に使わないこと）

| 時期 | Meta | Google | 合計 |
|---|---|---|---|
| 〜2026-08-05 | ¥3,000 | ¥4,000 | ¥7,000 |

## Meta増額の評価ルール
`;

test('現行の1日予算を媒体別に読める', () => {
  const g = parseGuardrails(MD);
  assert.equal(g.ok, true);
  assert.equal(g.budgets['Meta'].daily_jpy, 7200);
  assert.equal(g.budgets['Google検索'].daily_jpy, 4800);
  assert.equal(g.budgets['Meta'].changed_on, '2026-08-25');
  assert.equal(g.total_daily_jpy, 12000);
});

// 「### 過去の値」は同じ ## 節の中にあるため、`## ` だけで区切ると
// 廃止済みの ¥3,000 が現行値として出てくる。2026-09-01に実際に踏んだ。
test('「過去の値」の表を現行値として拾わない', () => {
  const g = parseGuardrails(MD);
  assert.deepEqual(Object.keys(g.budgets), ['Meta', 'Google検索']);
  assert.equal(g.sum_of_rows_jpy, 12000);
  assert.equal(g.warning, undefined);
});

test('表の合計と合計行が食い違ったら警告を出す', () => {
  const g = parseGuardrails(MD.replace('合計 ¥12,000/日', '合計 ¥11,000/日'));
  assert.equal(g.ok, true);
  assert.match(g.warning, /一致しません/);
});

test('節が無ければ ok:false（例外を投げない）', () => {
  assert.equal(parseGuardrails('# 何もない').ok, false);
});

test('ファイルが無くても投げず ok:false と notice を返す', async () => {
  const g = await readGuardrails('docs/存在しない.md');
  assert.equal(g.ok, false);
  assert.equal(g.notice, GUARDRAILS_NOTICE);
});

// 実ファイルとの結線。ドキュメント側の書式が変わったら、ここで落ちる。
test('実物の docs/ads-ops-guardrails.md を読める', async () => {
  const g = await readGuardrails();
  assert.equal(g.ok, true, `読めませんでした: ${g.error}`);
  const md = await readFile('docs/ads-ops-guardrails.md', 'utf8');
  // 値はコードに書かない。ドキュメントに書いてある額と一致することだけ確かめる
  for (const [name, v] of Object.entries(g.budgets)) {
    assert.ok(md.includes(`¥${v.daily_jpy.toLocaleString('en-US')}`), `${name} の額が本文に見当たりません`);
  }
  assert.equal(g.sum_of_rows_jpy, g.total_daily_jpy, g.warning ?? '');
});
