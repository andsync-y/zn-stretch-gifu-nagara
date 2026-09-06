#!/usr/bin/env node
/**
 * 期間比較と要因分解を機械的に計算する。隔週レビュー（zenryoku-biweekly-review）専用。
 *
 * 手計算をやめるための道具。2026-08に「広告費+34%なのに訪問-20%」という
 * 構造変化を日次・週次のどちらも検知できなかった反省から作った。
 *
 * 使い方:
 *   node scripts/period-compare.mjs --input <data.json>
 *   node scripts/period-compare.mjs --input <data.json> --json
 *
 * 入力JSONの形（当期・前期の2期間。日数は揃える）:
 * {
 *   "label_prev": "7/14〜7/31", "days_prev": 18,
 *   "label_curr": "8/09〜8/21", "days_curr": 13,
 *   "prev": { "meta_spend": 143388, "meta_lpv": 3384, "google_spend": 28566,
 *             "google_clicks": 259, "new_customers": 67 },
 *   "curr": { ... 同じキー ... }
 * }
 * new_customers は任意（あれば新規への波及まで出す）。
 *
 * curr の任意キー:
 *   google_impr_share_lost_budget / google_impr_share_lost_rank … 期間平均（0〜1）
 *   google_impr_share_daily … 日次配列。**期間平均は連続した悪化を平すので、こちらを優先して渡すこと**
 *     [{ "date": "2026-08-18", "lost_budget": 0, "lost_rank": 0.7315 }, ...]
 *   meta_daily_budget / google_daily_budget … 設定予算。実消化との乖離を検知する
 */
const argv = process.argv.slice(2);
const get = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const inputPath = get('--input');
if (!inputPath) { console.error('--input <data.json> が必要です'); process.exit(1); }

const fs = await import('node:fs');
const D = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const REQUIRED = ['meta_spend', 'meta_lpv', 'google_spend', 'google_clicks'];
for (const side of ['prev', 'curr']) {
  if (!D[side]) { console.error(`入力に "${side}" がありません`); process.exit(1); }
  for (const k of REQUIRED) {
    if (typeof D[side][k] !== 'number') { console.error(`${side}.${k} が数値ではありません`); process.exit(1); }
  }
}

const dp = D.days_prev, dc = D.days_curr;
if (!dp || !dc) { console.error('days_prev / days_curr が必要です'); process.exit(1); }

// 1日あたりに正規化する。期間の長さが違っても比較できるようにするため。
const per = (side, days) => {
  const s = D[side];
  const mSpend = s.meta_spend / days, mVis = s.meta_lpv / days;
  const gSpend = s.google_spend / days, gVis = s.google_clicks / days;
  return {
    mSpend, mVis, gSpend, gVis,
    mCPV: mVis > 0 ? mSpend / mVis : null,
    gCPV: gVis > 0 ? gSpend / gVis : null,
    spend: mSpend + gSpend,
    vis: mVis + gVis,
    cpv: (mVis + gVis) > 0 ? (mSpend + gSpend) / (mVis + gVis) : null,
    newc: typeof s.new_customers === 'number' ? s.new_customers / days : null,
  };
};
const A = per('prev', dp), B = per('curr', dc);

// 要因分解：当期の予算を前期の効率で使えていたら何訪問だったか、を起点に順に差し引く
const ideal = B.spend / A.cpv;                       // 前期の効率のまま
const step1 = B.mSpend / A.mCPV + B.gSpend / A.gCPV; // 配分だけ当期にする（単価は前期）
const step2 = B.mSpend / B.mCPV + B.gSpend / B.gCPV; // 単価も当期にする（＝実測）
const lossMix = ideal - step1;   // 予算配分の変更による損失
const lossEff = step1 - step2;   // 単価変化による損失
const lossTotal = lossMix + lossEff;

const pct = (b, a) => a === 0 ? null : (b / a - 1) * 100;
const sign = (v) => (v > 0 ? '+' : '') + v.toFixed(0);
const yen = (v) => '¥' + Math.round(v).toLocaleString('ja-JP');

const result = {
  period: { prev: D.label_prev || 'prev', curr: D.label_curr || 'curr', days_prev: dp, days_curr: dc },
  per_day: {
    prev: { spend: A.spend, visits: A.vis, cpv: A.cpv, meta_cpv: A.mCPV, google_cpv: A.gCPV, new_customers: A.newc },
    curr: { spend: B.spend, visits: B.vis, cpv: B.cpv, meta_cpv: B.mCPV, google_cpv: B.gCPV, new_customers: B.newc },
  },
  change: {
    spend_pct: pct(B.spend, A.spend),
    visits_pct: pct(B.vis, A.vis),
    cpv_ratio: B.cpv / A.cpv,
    new_customers_pct: A.newc && B.newc ? pct(B.newc, A.newc) : null,
  },
  decomposition: {
    ideal_visits: ideal,
    loss_from_budget_mix: lossMix,
    loss_from_unit_cost: lossEff,
    loss_total: lossTotal,
    share_budget_mix_pct: lossTotal !== 0 ? (lossMix / lossTotal) * 100 : null,
    share_unit_cost_pct: lossTotal !== 0 ? (lossEff / lossTotal) * 100 : null,
    actual_visits: step2,
  },
  flags: [],
};

// 構造異常の検知。単一指標の閾値ではなく「関係」を見る。
// 2026-08の見落としは、費用と訪問が逆方向に動いたことを誰も検知しなかったのが原因。
if (result.change.spend_pct > 5 && result.change.visits_pct < -5) {
  result.flags.push({
    level: 'critical',
    code: 'SPEND_UP_VISITS_DOWN',
    message: `広告費が${sign(result.change.spend_pct)}%なのに訪問が${sign(result.change.visits_pct)}%。費用と成果が逆方向に動いている`,
  });
}
if (result.change.cpv_ratio >= 1.3) {
  result.flags.push({
    level: 'critical',
    code: 'CPV_INFLATION',
    message: `訪問単価が${result.change.cpv_ratio.toFixed(2)}倍（${yen(A.cpv)} → ${yen(B.cpv)}）`,
  });
}
for (const [name, a, b] of [['Meta', A.mCPV, B.mCPV], ['Google', A.gCPV, B.gCPV]]) {
  if (a && b && b / a >= 1.5) {
    result.flags.push({
      level: 'critical', code: `${name.toUpperCase()}_UNIT_COST_UP`,
      message: `${name}の訪問単価が${(b / a).toFixed(2)}倍（${yen(a)} → ${yen(b)}）。設定変更の有無を変更ログで確認すること`,
    });
  }
}
// 安い媒体から高い媒体へ資金が動いていないか
if (A.mCPV && A.gCPV) {
  const cheapPrev = A.mCPV <= A.gCPV ? 'meta' : 'google';
  const shareA = A.mSpend / A.spend, shareB = B.mSpend / B.spend;
  const movedToExpensive = cheapPrev === 'meta' ? shareB < shareA - 0.05 : shareB > shareA + 0.05;
  if (movedToExpensive) {
    result.flags.push({
      level: 'warn', code: 'BUDGET_MOVED_TO_EXPENSIVE_CHANNEL',
      message: `前期に安かった媒体（${cheapPrev === 'meta' ? 'Meta' : 'Google'} ${yen(cheapPrev === 'meta' ? A.mCPV : A.gCPV)}）から高い媒体へ予算が移っている。Meta比率 ${(shareA * 100).toFixed(0)}% → ${(shareB * 100).toFixed(0)}%`,
    });
  }
}
if (A.newc && B.newc && result.change.new_customers_pct < result.change.visits_pct - 10) {
  result.flags.push({
    level: 'warn', code: 'NEW_CUSTOMERS_FELL_MORE_THAN_VISITS',
    message: `新規の減少（${sign(result.change.new_customers_pct)}%）が訪問の減少（${sign(result.change.visits_pct)}%）より大きい。広告以外の要因（休業日・シフト・HPB内の露出）を疑うこと`,
  });
}

// Google表示シェアの内訳。予算とランクのどちらで機会を失っているかで打ち手が正反対になる。
// 2026-08：予算不足0%・順位不足70%の日が続いていたのに、増額を検討しかけた。
// 入力に google_impr_share_lost_budget / google_impr_share_lost_rank（0〜1の比率）があれば判定する。
//
// ⚠️ 期間平均だけで判定すると取りこぼす。2026-08-24に実際に空振りした：
//    8/18〜8/20 は順位不足68〜76%・予算不足0%（重症）だったが、
//    7日平均にすると 順位46%・予算26% になり、どちらの閾値にも掛からなかった。
//    そのため google_impr_share_daily（日次配列）があれば、まず日次で連続日数を見る。
const dailyIS = D.curr.google_impr_share_daily;
if (Array.isArray(dailyIS) && dailyIS.length) {
  // 「順位不足で失っている」日：順位不足が予算不足より大きく、かつ順位不足40%以上
  const isRankDay = (r) => r.lost_rank >= 0.4 && r.lost_rank > r.lost_budget;
  let run = 0, maxRun = 0, runEnd = null;
  for (const r of dailyIS) {
    if (isRankDay(r)) { run += 1; if (run > maxRun) { maxRun = run; runEnd = r.date; } }
    else run = 0;
  }
  result.impression_share_daily = { days: dailyIS.length, max_rank_limited_run: maxRun, run_ended: runEnd };
  if (maxRun >= 3) {
    result.flags.push({
      level: 'critical', code: 'GOOGLE_RANK_LIMITED_STREAK',
      message: `Googleが順位不足で表示を失う日が${maxRun}日連続（${runEnd}まで）。**この間は増額しても消化できない。** 期間平均では見えないので日次で確認すること。広告ランク（品質スコア・入札額）の問題であり、直近のクリエイティブ差し替え・LP変更を変更ログで確認する`,
    });
  }
}

const isb = D.curr.google_impr_share_lost_budget, isr = D.curr.google_impr_share_lost_rank;
if (typeof isb === 'number' && typeof isr === 'number') {
  result.impression_share = { lost_to_budget_pct: isb * 100, lost_to_rank_pct: isr * 100 };
  if (isr >= 0.4 && isb <= 0.15) {
    result.flags.push({
      level: 'critical', code: 'GOOGLE_LOSING_TO_RANK_NOT_BUDGET',
      message: `Googleは順位不足で表示の${(isr * 100).toFixed(0)}%を失っている（予算不足は${(isb * 100).toFixed(0)}%）。**増額しても消化できない。** 広告ランク（品質スコア・入札額）の問題。直近のクリエイティブ差し替え・LP変更を変更ログで確認すること`,
    });
  } else if (isb >= 0.4) {
    result.flags.push({
      level: 'warn', code: 'GOOGLE_LOSING_TO_BUDGET',
      message: `Googleは予算不足で表示の${(isb * 100).toFixed(0)}%を失っている。効率が基準内なら増額の余地がある`,
    });
  }
}

// 予算設定と実消化の乖離。意図しない予算変更を検知する。
// 2026-08：日¥3,000のつもりが実際は¥6,000だったのに、2週間気づかなかった。
for (const [name, budgetKey, spendKey] of [['Meta', 'meta_daily_budget', 'mSpend'], ['Google', 'google_daily_budget', 'gSpend']]) {
  const budget = D.curr[budgetKey];
  if (typeof budget !== 'number' || budget <= 0) continue;
  const actual = name === 'Meta' ? B.mSpend : B.gSpend;
  const gap = actual / budget;
  if (gap >= 1.15 || gap <= 0.7) {
    result.flags.push({
      level: 'warn', code: `${name.toUpperCase()}_BUDGET_MISMATCH`,
      message: `${name}の設定予算 ${yen(budget)}/日 に対し実消化 ${yen(actual)}/日（${(gap * 100).toFixed(0)}%）。設定と実態が乖離している`,
    });
  }
}

if (asJson) { console.log(JSON.stringify(result, null, 2)); process.exit(0); }

const bar = '─'.repeat(64);
console.log(bar);
console.log(`期間比較  前期 ${result.period.prev}（${dp}日） → 当期 ${result.period.curr}（${dc}日）`);
console.log(bar);
console.log('【1日あたり】            前期        当期        変化');
const line = (label, a, b, fmt, ratio) => {
  const av = a == null ? '—' : fmt(a), bv = b == null ? '—' : fmt(b);
  let ch = '—';
  if (a != null && b != null) ch = ratio ? `${(b / a).toFixed(2)}倍` : `${sign(pct(b, a))}%`;
  console.log(`  ${label.padEnd(20)} ${av.padStart(10)}  ${bv.padStart(10)}  ${ch.padStart(8)}`);
};
line('広告費', A.spend, B.spend, yen);
line('サイト訪問', A.vis, B.vis, (v) => v.toFixed(0));
line('訪問単価', A.cpv, B.cpv, yen, true);
line('  Meta 訪問単価', A.mCPV, B.mCPV, yen, true);
line('  Google 訪問単価', A.gCPV, B.gCPV, yen, true);
if (A.newc || B.newc) line('新規来店', A.newc, B.newc, (v) => v.toFixed(1));

console.log('');
console.log('【要因分解】訪問数の損失をどこで失ったか');
console.log(`  当期の予算を前期の効率で使えていたら : ${ideal.toFixed(0)} 訪問/日`);
console.log(`  ① 予算配分の変更による損失          : ${lossMix >= 0 ? '−' : '+'}${Math.abs(lossMix).toFixed(0)} 訪問/日  (${lossTotal ? Math.abs(lossMix / lossTotal * 100).toFixed(0) : '—'}%)`);
console.log(`  ② 訪問単価の変化による損失          : ${lossEff >= 0 ? '−' : '+'}${Math.abs(lossEff).toFixed(0)} 訪問/日  (${lossTotal ? Math.abs(lossEff / lossTotal * 100).toFixed(0) : '—'}%)`);
console.log(`  実測                                : ${step2.toFixed(0)} 訪問/日`);

console.log('');
if (result.flags.length === 0) {
  console.log('【検知】構造的な異常なし');
} else {
  console.log('【検知】');
  for (const f of result.flags) {
    console.log(`  [${f.level === 'critical' ? '要対応' : '要確認'}] ${f.message}`);
  }
}
console.log(bar);
console.log('※ 訪問数は Meta=LPビュー / Google=クリック。定義は docs/metrics-definitions.md を参照');
process.exit(result.flags.some((f) => f.level === 'critical') ? 2 : 0);
