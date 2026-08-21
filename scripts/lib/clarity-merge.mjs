/**
 * clarity_7d.json のマージ・剪定ロジック（純粋関数のみ。ネットワークもファイルも触らない）。
 *
 * windsor-dataブランチは windsor-data.yml が毎回 `git init` + `git push --force` で
 * 作り直すため、**前回のファイルを読み込んでマージしないと毎日1日分に戻る**。
 * ワークフロー側で origin/windsor-data から前回分を取り出して渡す前提。
 *
 * Clarity Data Export API（project-live-insights）は「直近N日の集計」を返すのであって
 * 日別の内訳は返さない。そのため1日1スナップショットとして積み、
 * 取得日（JST）をキーに重複排除する。
 */

/** 実行時刻から取得日（JST）を求める。ワークフローはJST 8:00に走るので日付は前日にならない。 */
export function jstDate(ms = Date.now()) {
  return new Date(ms + 9 * 3600000).toISOString().slice(0, 10);
}

/** YYYY-MM-DD 同士の日数差（a - b）。不正な日付は NaN を返す。 */
export function daysBetween(a, b) {
  const ta = Date.parse(`${a}T00:00:00Z`);
  const tb = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return NaN;
  return Math.round((ta - tb) / 86400000);
}

/**
 * 前回の clarity_7d.json を読む。壊れていても例外を投げず、空の形を返す
 * （前回分が読めないことを理由に当日分まで落とさないため）。
 */
export function parsePrevious(text) {
  if (!text || !text.trim()) return { days: [], recovered: false };
  try {
    const json = JSON.parse(text);
    const days = Array.isArray(json?.days) ? json.days : [];
    // date を持たない要素は素性が不明なので捨てる（マージキーが無いと重複排除できない）
    return { days: days.filter((d) => typeof d?.date === 'string'), recovered: true };
  } catch {
    return { days: [], recovered: false };
  }
}

/**
 * 前回分に当日分を重ねる。
 * - date が同じものは**新しい方（snapshot）で置き換える**（同日再実行を想定）
 * - today から maxAgeDays 日以上前のものは落とす
 * - 日付の降順（新しい順）に並べる
 */
export function mergeDays(previousDays, snapshot, { today = jstDate(), maxAgeDays = 8 } = {}) {
  const byDate = new Map();
  for (const d of previousDays) {
    if (typeof d?.date === 'string') byDate.set(d.date, d);
  }
  if (snapshot && typeof snapshot.date === 'string') byDate.set(snapshot.date, snapshot);

  return [...byDate.values()]
    .filter((d) => {
      const age = daysBetween(today, d.date);
      // 日付が壊れている行、未来日付の行は残さない（静かに混ざると鮮度判定を誤らせる）
      return Number.isFinite(age) && age >= 0 && age < maxAgeDays;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * APIレスポンスから「取れた指標の名前」だけを控える。
 * 指標そのものは加工せず生のまま保存する方針なので、ここでは**名前と件数しか作らない**
 * （無い指標を作らない・数字を発明しない）。
 */
export function metricNames(payload) {
  if (!Array.isArray(payload)) return [];
  const names = payload
    .map((m) => (typeof m?.metricName === 'string' ? m.metricName : null))
    .filter(Boolean);
  return [...new Set(names)];
}

/** payload に中身があるか。空配列・null・要素ゼロはすべて「データなし」とみなす。 */
export function hasData(payload) {
  if (!Array.isArray(payload) || payload.length === 0) return false;
  return payload.some((m) => Array.isArray(m?.information) && m.information.length > 0);
}

/** days 配列から、no_data でない最新スナップショットの日付を返す（無ければ null）。 */
export function latestDataDate(days) {
  const withData = days.find((d) => d?.no_data === false);
  return withData ? withData.date : null;
}

/* ------------------- ページ別データの集約 ------------------- */

/**
 * Clarity の by_page_device は URL を**クエリ文字列ごと別ページとして**返す。
 * 広告流入には `?utm_...&fbclid=<300文字>` が付くため、実際には同じ /lp が
 * 数百行に分裂し、2026-08-21時点で clarity_7d.json は 2.5MB に膨らんでいた。
 *
 * 弊害は3つ:
 *   1. 週次レビューがファイルを読み切れない（読めても文脈を食い潰す）
 *   2. ページ別の数字が分裂して意味をなさない（/lp の到達率が520行に散る）
 *   3. fbclid は個人を追跡できる識別子であり、リポジトリに残すべきではない
 *
 * そのため**クエリ文字列を捨ててパス単位に畳む**。指標の意味は変えない
 * （合計する項目と加重平均する項目を分け、APIが返した数字だけを使う）。
 */

/** 合計してよい項目（件数系） */
const COUNT_FIELDS = [
  'sessionsCount', 'pagesViews', 'subTotal',
  'totalSessionCount', 'totalBotSessionCount', 'distinctUserCount',
];

/** 合計してはいけない項目（率・平均系）。セッション数で加重平均する。 */
const AVG_FIELDS = [
  'sessionsWithMetricPercentage', 'sessionsWithoutMetricPercentage',
  'pagesPerSessionPercentage', 'averageScrollDepth', 'totalTime', 'activeTime',
];

/** URLからパスだけを取り出す。パースできない値はクエリだけ落として返す。 */
export function pagePath(url) {
  if (typeof url !== 'string') return '';
  try {
    const p = new URL(url).pathname;
    return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
  } catch {
    return url.split('?')[0];
  }
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * by_page_device のペイロードをパス×デバイスに畳む。
 *
 * @param payload APIレスポンス（配列）。配列でなければ null を返す。
 * @param maxRows 指標ごとに残す行数の上限（セッション数の多い順）
 * @returns { data, stats } data は入力と同じ [{metricName, information}] の形
 */
export function summarizeByPage(payload, { maxRows = 50 } = {}) {
  if (!Array.isArray(payload)) return null;

  // ScrollDepth のように行が重みを持たない指標があるので、
  // Traffic のセッション数を「その生URL×デバイスの重み」として先に集めておく。
  const weights = new Map();
  for (const m of payload) {
    if (m?.metricName !== 'Traffic' || !Array.isArray(m.information)) continue;
    for (const r of m.information) {
      weights.set(`${r?.Url} ${r?.Device}`, num(r?.totalSessionCount));
    }
  }

  let rowsIn = 0;
  let rowsOut = 0;
  let truncated = 0;

  const data = [];
  for (const m of payload) {
    if (!m || !Array.isArray(m.information)) {
      data.push(m);
      continue;
    }
    const groups = new Map();
    for (const r of m.information) {
      rowsIn++;
      const path = pagePath(r?.Url);
      const device = r?.Device ?? '';
      const key = `${path} ${device}`;
      let g = groups.get(key);
      if (!g) {
        g = { Url: path, Device: device, rows_merged: 0, _w: 0, _avg: {}, out: {} };
        groups.set(key, g);
      }
      g.rows_merged++;

      // この行の重み。指標が重みを持たなければ Traffic 由来の重みを借りる。
      const w = num(r?.sessionsCount) || num(r?.totalSessionCount) ||
        weights.get(`${r?.Url} ${r?.Device}`) || 0;
      g._w += w;

      for (const f of COUNT_FIELDS) {
        if (r?.[f] === undefined) continue;
        g.out[f] = (g.out[f] ?? 0) + num(r[f]);
      }
      for (const f of AVG_FIELDS) {
        if (r?.[f] === undefined) continue;
        const a = (g._avg[f] ??= { weighted: 0, plain: 0, n: 0 });
        a.weighted += num(r[f]) * w;
        a.plain += num(r[f]);
        a.n++;
      }
    }

    const rows = [...groups.values()].map((g) => {
      const row = { Url: g.Url, Device: g.Device, rows_merged: g.rows_merged, ...g.out };
      for (const [f, a] of Object.entries(g._avg)) {
        // 重みが全部0のとき（Trafficに出てこないURL）だけ単純平均に落とす
        const v = g._w > 0 ? a.weighted / g._w : a.n > 0 ? a.plain / a.n : 0;
        row[f] = Math.round(v * 100) / 100;
      }
      row._sessions = g._w;
      return row;
    });
    rows.sort((a, b) => b._sessions - a._sessions);

    if (rows.length > maxRows) truncated += rows.length - maxRows;
    const kept = rows.slice(0, maxRows).map(({ _sessions, ...r }) => r);
    rowsOut += kept.length;
    data.push({ metricName: m.metricName, information: kept });
  }

  return { data, stats: { rows_in: rowsIn, rows_out: rowsOut, truncated, max_rows: maxRows } };
}

/**
 * 前回分のスナップショットのうち、まだ畳まれていない（`folded` が無い）ものを畳む。
 *
 * 集約を導入する前に保存された日は生の数百行を抱えたままなので、
 * 剪定で消えるのを待つと最大8日間ファイルが重いままになる。読み込み時に畳んでしまう。
 * すでに畳んである日は触らない（二重集約すると rows_merged が実態とずれる）。
 */
export function foldLegacyDay(day) {
  const bp = day?.by_page_device;
  if (!bp || bp.ok !== true || bp.folded || !Array.isArray(bp.data)) return day;
  const folded = summarizeByPage(bp.data);
  if (!folded) return day;
  return {
    ...day,
    by_page_device: { ok: true, folded: { ...folded.stats, refolded: true }, data: folded.data },
  };
}
