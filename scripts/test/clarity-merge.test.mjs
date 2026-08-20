import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  jstDate,
  daysBetween,
  parsePrevious,
  mergeDays,
  metricNames,
  hasData,
  latestDataDate,
} from '../lib/clarity-merge.mjs';

const snap = (date, extra = {}) => ({ date, no_data: false, ...extra });

test('jstDate: UTC 23時台でも翌日（JST）になる', () => {
  // 2026-08-19T23:00Z = JST 2026-08-20 08:00（ワークフローの実行時刻）
  assert.equal(jstDate(Date.parse('2026-08-19T23:00:00Z')), '2026-08-20');
});

test('daysBetween: 差分と不正日付', () => {
  assert.equal(daysBetween('2026-08-20', '2026-08-13'), 7);
  assert.equal(daysBetween('2026-08-20', '2026-08-20'), 0);
  assert.ok(Number.isNaN(daysBetween('2026-08-20', 'not-a-date')));
});

test('parsePrevious: 壊れたJSONでも例外を投げず空を返す', () => {
  assert.deepEqual(parsePrevious('{壊れている'), { days: [], recovered: false });
  assert.deepEqual(parsePrevious(''), { days: [], recovered: false });
  assert.deepEqual(parsePrevious(undefined), { days: [], recovered: false });
});

test('parsePrevious: days が無い形でも空配列で返る', () => {
  assert.deepEqual(parsePrevious('{"note":"x"}'), { days: [], recovered: true });
});

test('parsePrevious: dateを持たない要素は捨てる', () => {
  const out = parsePrevious(JSON.stringify({ days: [{ date: '2026-08-19' }, { foo: 1 }] }));
  assert.equal(out.days.length, 1);
  assert.equal(out.days[0].date, '2026-08-19');
});

test('mergeDays: 前回分に当日分が積まれる', () => {
  const prev = [snap('2026-08-19'), snap('2026-08-18')];
  const out = mergeDays(prev, snap('2026-08-20'), { today: '2026-08-20' });
  assert.deepEqual(out.map((d) => d.date), ['2026-08-20', '2026-08-19', '2026-08-18']);
});

test('mergeDays: 同じ日付は新しい方で置き換わる（同日再実行）', () => {
  const prev = [snap('2026-08-20', { marker: 'old' })];
  const out = mergeDays(prev, snap('2026-08-20', { marker: 'new' }), { today: '2026-08-20' });
  assert.equal(out.length, 1);
  assert.equal(out[0].marker, 'new');
});

test('mergeDays: 8日以上前は落ち、7日前は残る', () => {
  const prev = [snap('2026-08-13'), snap('2026-08-12'), snap('2026-08-01')];
  const out = mergeDays(prev, snap('2026-08-20'), { today: '2026-08-20' });
  assert.deepEqual(out.map((d) => d.date), ['2026-08-20', '2026-08-13']);
});

test('mergeDays: 未来日付と壊れた日付は残さない', () => {
  const prev = [snap('2026-08-25'), snap('こわれた'), snap('2026-08-19')];
  const out = mergeDays(prev, snap('2026-08-20'), { today: '2026-08-20' });
  assert.deepEqual(out.map((d) => d.date), ['2026-08-20', '2026-08-19']);
});

test('mergeDays: 当日分が無くても前回分を消さない（取得失敗時）', () => {
  const prev = [snap('2026-08-19'), snap('2026-08-18')];
  const out = mergeDays(prev, null, { today: '2026-08-20' });
  assert.deepEqual(out.map((d) => d.date), ['2026-08-19', '2026-08-18']);
});

test('metricNames: 指標名だけを重複なく拾う', () => {
  const payload = [
    { metricName: 'Traffic', information: [{}] },
    { metricName: 'ScrollDepth', information: [{}] },
    { metricName: 'Traffic', information: [{}] },
    { information: [{}] },
  ];
  assert.deepEqual(metricNames(payload), ['Traffic', 'ScrollDepth']);
  assert.deepEqual(metricNames(null), []);
});

test('hasData: informationが空なら「データなし」', () => {
  assert.equal(hasData([{ metricName: 'Traffic', information: [{ totalSessionCount: '1' }] }]), true);
  assert.equal(hasData([{ metricName: 'Traffic', information: [] }]), false);
  assert.equal(hasData([]), false);
  assert.equal(hasData(null), false);
});

test('latestDataDate: no_dataでない最新の日付を返す', () => {
  const days = [
    { date: '2026-08-20', no_data: true },
    { date: '2026-08-19', no_data: false },
  ];
  assert.equal(latestDataDate(days), '2026-08-19');
  assert.equal(latestDataDate([{ date: '2026-08-20', no_data: true }]), null);
});
