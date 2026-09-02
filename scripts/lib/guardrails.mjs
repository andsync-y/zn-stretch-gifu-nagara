/**
 * `docs/ads-ops-guardrails.md` から「現在の1日予算」を読み出して、
 * 広告デイリー監視が毎朝いちばん最初に読む `_summary.json` へ載せるためのもの。
 *
 * ■ なぜ必要か
 * 2026-08-31、司令塔ダッシュボードが古い上限（Meta ¥3,000／総額 ¥11,000）で判定し
 * 「上限の2.48倍」「13%超過・3週目」と誤報を出した。実際は現行上限に対し +3.4%／+3.6% で、
 * 8/25に決着済みの論点をやることリストに載せていた。
 * 広告デイリー監視のプロンプトも同じ古い数値を持っているが、このRoutineは専用セッションへ
 * 発火する設定のため `update_trigger` からプロンプトを書き換えられない（2026-09-01に確認）。
 * そこで、監視が必ず読む側に現行値と警告を差し込む。
 *
 * ■ 値をこのコードに書かないこと
 * 正はあくまで .md 側。ここは毎日それを読み直して転記するだけ。
 * ここに数値を書くと「第二の古い数値」が生まれ、直そうとしている問題そのものになる。
 */

export const GUARDRAILS_NOTICE =
  'ガードレールの数値は docs/ads-ops-guardrails.md が正。' +
  '保存されたプロンプトの数値（総額 ¥11,000/日・Meta ¥3,000・Google ¥8,000・Meta CPA 暫定¥6,000）は' +
  '2026-08-25の予算振替と2026-08-10の基準改定で失効している。必ずファイルを読んでから金額を判定すること。' +
  'ファイルが読めない場合は、金額を根拠にした自動実行（pause_ad・予算変更）を行わず通知のみにする。' +
  'また日次の消化額で「超過」と判定しないこと（MetaのCBOは日次¥12,600まで振れる。総額は週ペースで見る）。';

const SECTION = '## 現在の予算設定';

/** 見出し「現在の予算設定」の表と合計行から現行の1日予算を取り出す */
export function parseGuardrails(md) {
  const start = md.indexOf(SECTION);
  if (start < 0) return { ok: false, error: `「${SECTION}」の節が見つかりません` };
  const rest = md.slice(start + SECTION.length);
  // `### 過去の値（判定に使わないこと）` の表を拾ってしまうため、`###` でも切る。
  // ここを `## ` だけで切ると、過去の予算が現行値として出てくる（2026-09-01に実際に踏んだ）。
  const end = rest.search(/\n#{2,3} /);
  const body = end < 0 ? rest : rest.slice(0, end);

  const budgets = {};
  // | **Meta** | **¥7,200** | **2026-08-25** | 備考 |
  const row = /^\|\s*\*{0,2}\s*([^|*]+?)\s*\*{0,2}\s*\|\s*\*{0,2}\s*¥([\d,]+)\s*\*{0,2}\s*\|\s*\*{0,2}\s*(\d{4}-\d{2}-\d{2})?/gm;
  for (const m of body.matchAll(row)) {
    const name = m[1].trim();
    if (name === '媒体' || /^-+$/.test(name)) continue; // ヘッダ行と区切り行
    budgets[name] = { daily_jpy: Number(m[2].replace(/,/g, '')), changed_on: m[3] ?? null };
  }

  const totalMatch = body.match(/合計\s*¥([\d,]+)\s*\/日/);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : null;

  if (Object.keys(budgets).length === 0) return { ok: false, error: '予算の表を読めませんでした' };

  // 表の合計と「合計」行が食い違っていたら、黙って片方を採らずに両方出す
  const sum = Object.values(budgets).reduce((a, b) => a + b.daily_jpy, 0);
  const mismatch = total != null && total !== sum;

  return {
    ok: true,
    budgets,
    total_daily_jpy: total,
    sum_of_rows_jpy: sum,
    ...(mismatch ? { warning: `表の合計 ¥${sum} と合計行 ¥${total} が一致しません。ファイルを直してください` } : {}),
  };
}

/** ファイルを読んで、結果に注意書きを添えて返す。読めなくても投げない */
export async function readGuardrails(path = 'docs/ads-ops-guardrails.md') {
  const { readFile } = await import('node:fs/promises');
  let parsed;
  try {
    parsed = parseGuardrails(await readFile(path, 'utf8'));
  } catch (e) {
    parsed = { ok: false, error: String(e).slice(0, 200) };
  }
  return { source: path, notice: GUARDRAILS_NOTICE, ...parsed };
}
