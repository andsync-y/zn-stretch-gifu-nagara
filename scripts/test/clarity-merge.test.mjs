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
  pagePath,
  summarizeByPage,
  foldLegacyDay,
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

/* ---------------- summarizeByPage（ページ別の集約） ---------------- */

test('pagePath: クエリ文字列とハッシュを落とす', () => {
  assert.equal(pagePath('https://zn-stretch-gifu.com/lp?utm_source=meta&fbclid=xxx'), '/lp');
  assert.equal(pagePath('https://zn-stretch-gifu.com/lp'), '/lp');
  assert.equal(pagePath('https://zn-stretch-gifu.com/'), '/');
  assert.equal(pagePath('https://zn-stretch-gifu.com/column/'), '/column');
  assert.equal(pagePath('/lp?a=1'), '/lp', 'URLとしてパースできなくてもクエリは落とす');
  assert.equal(pagePath(undefined), '');
});

test('summarizeByPage: 件数は合計、率は加重平均', () => {
  const payload = [
    {
      metricName: 'Traffic',
      information: [
        { Url: 'https://x.com/lp?a=1', Device: 'Mobile', totalSessionCount: '90', totalBotSessionCount: '1' },
        { Url: 'https://x.com/lp?a=2', Device: 'Mobile', totalSessionCount: '10', totalBotSessionCount: '0' },
      ],
    },
    {
      metricName: 'ScrollDepth',
      information: [
        { Url: 'https://x.com/lp?a=1', Device: 'Mobile', averageScrollDepth: 20 },
        { Url: 'https://x.com/lp?a=2', Device: 'Mobile', averageScrollDepth: 100 },
      ],
    },
  ];
  const { data, stats } = summarizeByPage(payload);
  const traffic = data.find((m) => m.metricName === 'Traffic').information;
  assert.equal(traffic.length, 1, '同じパスは1行に畳まれる');
  assert.equal(traffic[0].Url, '/lp');
  assert.equal(traffic[0].totalSessionCount, 100, '件数は合計');
  assert.equal(traffic[0].rows_merged, 2);

  const scroll = data.find((m) => m.metricName === 'ScrollDepth').information;
  // 単純平均なら60。セッション数(90:10)で加重すると28。合計してしまえば120。
  assert.equal(scroll[0].averageScrollDepth, 28, '重みを持たない指標もTrafficのセッション数で加重される');
  assert.equal(stats.rows_in, 4);
  assert.equal(stats.rows_out, 2);
});

test('summarizeByPage: デバイスが違えば別行のまま', () => {
  const payload = [{
    metricName: 'Traffic',
    information: [
      { Url: 'https://x.com/lp?a=1', Device: 'Mobile', totalSessionCount: '5' },
      { Url: 'https://x.com/lp?a=1', Device: 'PC', totalSessionCount: '3' },
    ],
  }];
  const rows = summarizeByPage(payload).data[0].information;
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((r) => r.Device), ['Mobile', 'PC']);
});

test('summarizeByPage: セッション数の多い順に並び、上限を超えた分は truncated に出る', () => {
  const information = Array.from({ length: 5 }, (_, i) => ({
    Url: `https://x.com/p${i}`, Device: 'Mobile', totalSessionCount: String(i),
  }));
  const { data, stats } = summarizeByPage([{ metricName: 'Traffic', information }], { maxRows: 2 });
  assert.deepEqual(data[0].information.map((r) => r.Url), ['/p4', '/p3']);
  assert.equal(stats.truncated, 3);
});

test('summarizeByPage: 重みが無い指標だけのときは単純平均に落ちる', () => {
  // Trafficが返っていないケース。0除算せず、値を捨てもしないこと。
  const payload = [{
    metricName: 'ScrollDepth',
    information: [
      { Url: 'https://x.com/lp?a=1', Device: 'Mobile', averageScrollDepth: 20 },
      { Url: 'https://x.com/lp?a=2', Device: 'Mobile', averageScrollDepth: 40 },
    ],
  }];
  assert.equal(summarizeByPage(payload).data[0].information[0].averageScrollDepth, 30);
});

test('summarizeByPage: 配列でなければ null（形が変わっても落ちない）', () => {
  assert.equal(summarizeByPage(null), null);
  assert.equal(summarizeByPage({ error: 'x' }), null);
});

test('summarizeByPage: information が配列でない指標はそのまま通す', () => {
  const payload = [{ metricName: 'Weird', information: null }];
  assert.deepEqual(summarizeByPage(payload).data, payload);
});

test('foldLegacyDay: 未集約の過去分を畳む', () => {
  const day = {
    date: '2026-08-20',
    by_page_device: {
      ok: true,
      data: [{
        metricName: 'Traffic',
        information: [
          { Url: 'https://x.com/lp?a=1', Device: 'Mobile', totalSessionCount: '5' },
          { Url: 'https://x.com/lp?a=2', Device: 'Mobile', totalSessionCount: '5' },
        ],
      }],
    },
  };
  const out = foldLegacyDay(day);
  assert.equal(out.by_page_device.data[0].information.length, 1);
  assert.equal(out.by_page_device.data[0].information[0].totalSessionCount, 10);
  assert.equal(out.by_page_device.folded.refolded, true);
  assert.equal(out.date, '2026-08-20', '他のフィールドは触らない');
});

test('foldLegacyDay: 集約済み・取得失敗・欠損はそのまま返す', () => {
  const already = { by_page_device: { ok: true, folded: { rows_in: 2 }, data: [] } };
  assert.equal(foldLegacyDay(already), already, '二重集約しない');
  const failed = { by_page_device: { ok: false, error: 'HTTP 401' } };
  assert.equal(foldLegacyDay(failed), failed);
  assert.deepEqual(foldLegacyDay({ date: 'x' }), { date: 'x' });
});
