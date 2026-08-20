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
