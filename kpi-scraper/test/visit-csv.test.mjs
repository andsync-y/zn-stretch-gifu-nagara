/**
 * 来店記録CSVの解析テスト。
 * 実物のCSV（2026-08-20に取得・19列）と同じ列構成のダミーデータを使う。
 * ダミーの氏名・顧客IDは実在しない値。
 *
 * 実行: node --test kpi-scraper/test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeCsv,
  parseCsv,
  normalizeDate,
  normalizeValue,
  locateColumns,
  extractTicketPurchases,
  dedupePurchases,
  uncoveredRange,
  chunkRange,
} from '../lib/visit-csv.mjs';

const HEADER =
  '来店日,顧客名,顧客ID,性別,年代,担当,来店種別,来店経路,指名,コース,延長,次回予約,回数券購入,指名チケット,備考,施術売上,回数券売上,指名売上,合計売上';

const row = (o = {}) =>
  [
    o.date ?? '2026-08-12',
    o.name ?? 'テスト太郎',
    o.cid ?? '10000001',
    '男性', '40代', 'スタッフA', '再来', 'HP', o.shimei ?? '', '90分', '', '有',
    o.ticket ?? '', o.shimeiTicket ?? '', '',
    o.shijutsu ?? '0',
    o.ticketSales ?? '0',
    o.shimeiSales ?? '0',
    o.total ?? '0',
  ].join(',');

const csv = (...rows) => parseCsv([HEADER, ...rows].join('\n') + '\n');

test('文字コードを自動判定する', () => {
  assert.equal(decodeCsv(Buffer.from('来店日,顧客名', 'utf8')).encoding, 'utf-8');
  // BOM付きUTF-8でも先頭のBOMを落とす
  assert.equal(decodeCsv(Buffer.from('﻿来店日', 'utf8')).text, '来店日');
  // cp932（0x93 0xFA = 「日」）はUTF-8として不正なので shift_jis と判定される
  const cp932 = Buffer.from([0x93, 0xfa]);
  assert.equal(decodeCsv(cp932).encoding, 'shift_jis(cp932)');
  assert.equal(decodeCsv(cp932).text, '日');
});

test('引用符・カンマ・改行入りのフィールドを壊さない', () => {
  const rows = parseCsv('a,"b,c","d""e"\n"1\n2",3,4\n');
  assert.deepEqual(rows, [['a', 'b,c', 'd"e'], ['1\n2', '3', '4']]);
});

test('日付と金額の正規化', () => {
  assert.equal(normalizeDate('2026-08-12'), '2026-08-12');
  assert.equal(normalizeDate('2026/8/1'), '2026-08-01');
  assert.equal(normalizeDate('2026年8月1日'), '2026-08-01');
  assert.equal(normalizeDate('2026-02-31'), null); // 存在しない日付
  assert.equal(normalizeDate(''), null);
  assert.equal(normalizeValue('¥132,000'), 132000);
  assert.equal(normalizeValue('132000円'), 132000);
  assert.equal(normalizeValue('0'), null);
  assert.equal(normalizeValue(''), null);
});

test('必要な列が無ければ推測せず落ちる', () => {
  assert.throws(() => locateColumns(['来店日', '顧客名']), /顧客ID/);
});

test('回数券を買った行だけを取り出す', () => {
  const rows = csv(
    row({ ticket: '5回券(90分)', ticketSales: '110000', cid: '10000001', date: '2026-08-12' }),
    row({ ticket: '', ticketSales: '0', cid: '10000002' }), // 買っていない来店
    row({ ticket: '3回券(60分)', ticketSales: '49500', cid: '10000003', date: '2026-08-13' })
  );
  const { purchases, stats } = extractTicketPurchases(rows);
  assert.equal(stats.rows, 3);
  assert.equal(stats.ticket_rows, 2);
  assert.deepEqual(purchases, [
    { customer_id: '10000001', date: '2026-08-12', value: 110000, content_name: '5回券(90分)' },
    { customer_id: '10000003', date: '2026-08-13', value: 49500, content_name: '3回券(60分)' },
  ]);
});

test('指名チケットだけの行は拾わない（回数券売上にも入れない）', () => {
  const rows = csv(
    row({ ticket: '', shimeiTicket: '10回券', shimeiSales: '33000', cid: '10000004' }),
    row({ ticket: '', shimeiTicket: '3回券', shimeiSales: '9900', cid: '10000005' })
  );
  const { purchases, stats } = extractTicketPurchases(rows);
  assert.equal(stats.ticket_rows, 0);
  assert.deepEqual(purchases, []);
});

test('回数券と指名チケットを同時に買った行は、回数券の金額だけを拾う', () => {
  const rows = csv(
    row({ ticket: '5回券(90分)', ticketSales: '110000', shimeiTicket: '5回券', shimeiSales: '16500', cid: '10000006' })
  );
  const { purchases } = extractTicketPurchases(rows);
  assert.equal(purchases.length, 1);
  assert.equal(purchases[0].value, 110000); // 指名売上16,500円は混ぜない
});

test('顧客ID・日付・金額が欠けた行は理由つきで除外する', () => {
  const rows = csv(
    row({ ticket: '5回券(90分)', ticketSales: '110000', cid: '' }),
    row({ ticket: '5回券(90分)', ticketSales: '110000', date: '' }),
    row({ ticket: '5回券(90分)', ticketSales: '0' })
  );
  const { purchases, stats } = extractTicketPurchases(rows);
  assert.deepEqual(purchases, []);
  assert.equal(stats.skip_no_customer_id, 1);
  assert.equal(stats.skip_no_date, 1);
  assert.equal(stats.skip_no_value, 1);
});

test('戻り値に顧客名が混ざらない', () => {
  const rows = csv(row({ ticket: '5回券(90分)', ticketSales: '110000', name: 'テスト太郎' }));
  const { purchases } = extractTicketPurchases(rows);
  assert.equal(JSON.stringify(purchases).includes('テスト太郎'), false);
  assert.deepEqual(Object.keys(purchases[0]).sort(), ['content_name', 'customer_id', 'date', 'value']);
});

test('同じ成約を重複して読んでも1件に畳む', () => {
  const p = { customer_id: '10000001', date: '2026-08-12', value: 110000, content_name: '5回券(90分)' };
  const other = { ...p, date: '2026-08-10' };
  assert.equal(dedupePurchases([p, { ...p }, other]).length, 2);
  // 日付順に並ぶ
  assert.equal(dedupePurchases([p, other])[0].date, '2026-08-10');
});

test('取得できた期間で直近70日を覆えたかを判定する', () => {
  // 何も適用していなければ全期間が不足
  assert.deepEqual(uncoveredRange([], '2026-06-11', '2026-08-20'), { from: '2026-06-11', to: '2026-08-20' });

  // 8月なら「今年」だけで足りる
  assert.equal(uncoveredRange([{ from: '2026-01-01', to: '2026-08-20' }], '2026-06-11', '2026-08-20'), null);

  // 1月は「今年」だけでは前年11〜12月が抜ける
  const thisYear = [{ from: '2027-01-01', to: '2027-01-10' }];
  assert.deepEqual(uncoveredRange(thisYear, '2026-11-01', '2027-01-10'), { from: '2026-11-01', to: '2027-01-10' });
  // 「前年」を足すと隙間なくつながる
  assert.equal(
    uncoveredRange([...thisYear, { from: '2026-01-01', to: '2026-12-31' }], '2026-11-01', '2027-01-10'),
    null
  );

  // 途中に1日でも隙間があれば不足として扱う（数字を作らないため）
  assert.deepEqual(
    uncoveredRange(
      [{ from: '2026-06-01', to: '2026-07-31' }, { from: '2026-08-02', to: '2026-08-20' }],
      '2026-06-11',
      '2026-08-20'
    ),
    { from: '2026-08-01', to: '2026-08-20' }
  );
});

test('期間を分割しても隙間なく連続する', () => {
  const chunks = chunkRange('2026-06-11', '2026-08-20', 21);
  assert.equal(chunks[0].from, '2026-06-11');
  assert.equal(chunks[chunks.length - 1].to, '2026-08-20');
  // 隣どうしが1日でも空かないこと（空くと来店を取りこぼす）
  for (let i = 1; i < chunks.length; i++) {
    const next = new Date(new Date(`${chunks[i - 1].to}T00:00:00Z`).getTime() + 86400000)
      .toISOString()
      .slice(0, 10);
    assert.equal(chunks[i].from, next);
  }
  // 分割した区間をつなげれば全期間を覆える
  assert.equal(uncoveredRange(chunks, '2026-06-11', '2026-08-20'), null);
  // 期間より分割幅が大きければ1つにまとまる
  assert.deepEqual(chunkRange('2026-08-01', '2026-08-05', 21), [{ from: '2026-08-01', to: '2026-08-05' }]);
  // 1日だけでも成り立つ
  assert.deepEqual(chunkRange('2026-08-05', '2026-08-05', 21), [{ from: '2026-08-05', to: '2026-08-05' }]);
});

test('同じ顧客が同じ日に2枚買った場合は別レコードとして残す', () => {
  const rows = csv(
    row({ ticket: '5回券(90分)', ticketSales: '110000', cid: '10000001', date: '2026-08-12' }),
    row({ ticket: '3回券(60分)', ticketSales: '49500', cid: '10000001', date: '2026-08-12' })
  );
  const { purchases } = extractTicketPurchases(rows);
  assert.equal(dedupePurchases(purchases).length, 2);
});
