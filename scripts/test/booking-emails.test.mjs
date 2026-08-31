import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBookingEmail, summarize } from '../lib/booking-emails.mjs';

// 実物のフォーマットに合わせた検体。氏名はダミー（リポジトリに実名を置かないため）。
const mail = ({ subject, id, name, visit, accepted, coupon = null, request = '-', cancel = false }) => ({
  subject,
  plaintextBody: [
    '全力ストレッチ岐阜長良店【全身もみほぐしマッサージ&ストレッチ整体】様',
    '',
    cancel
      ? 'HOT PEPPER Beauty「SALON BOARD」にお客様から\nご予約のキャンセルがありました。'
      : 'HOT PEPPER Beauty「SALON BOARD」にお客様から\nご予約が入りました。',
    '',
    '◇ご予約内容',
    '■予約番号',
    `　${id}`,
    '■氏名',
    `　${name}`,
    '■来店日時',
    `　${visit}`,
    '■指名スタッフ',
    '　指名なし',
    '■メニュー',
    '　整体＋骨盤矯正',
    '　（所要時間目安：2時間）',
    ...(coupon ? ['■ご利用クーポン', `　${coupon}`, '　［説明文］'] : []),
    '',
    '◇ご予約付加情報',
    '■ご要望・ご相談',
    `　${request}`,
    '',
    ...(accepted ? [`予約受付日時：${accepted}`] : []),
  ].join('\n'),
});

test('通常の「予約連絡」を読める', () => {
  const r = parseBookingEmail(
    mail({
      subject: '予約連絡',
      id: 'BF55539505',
      name: 'テスト 太郎',
      visit: '2026年09月13日（日）13:00',
      accepted: '2026年08月24日（月）12:08',
    }),
  );
  assert.equal(r.type, 'booking');
  assert.equal(r.reservationId, 'BF55539505');
  assert.equal(r.channel, 'net');
  assert.equal(r.visitDate, '2026-09-13');
  assert.equal(r.acceptedDate, '2026-08-24');
  assert.equal(r.acceptedTime, '12:08');
  assert.equal(r.request, null, '「-」は未回答として null にする');
});

// 【間違い①の再発防止】件名で `予約連絡` に絞ると、この形が落ちる
test('「直前予約が入りました」も予約として数える', () => {
  const r = parseBookingEmail(
    mail({
      subject: '【当日15時30分】直前予約が入りました',
      id: 'BF55587286',
      name: 'テスト 花子',
      visit: '2026年08月24日（月）15:30',
      accepted: '2026年08月24日（月）13:22',
      coupon: '☆お試しコース☆【初回限定】全力ストレッチ&もみほぐし!60分（通常¥13200）',
    }),
  );
  assert.equal(r.type, 'booking');
  assert.equal(r.firstVisit, true);
});

test('「【SALON BOARD】本日分の未対応予約のお知らせ」は予約として数えない', () => {
  const digest = {
    subject: '【SALON BOARD】本日分の未対応予約のお知らせ',
    plaintextBody: '本日来店を希望されている予約でご確認いただきたい予約が2件あります。\n■内容\n予約番号：[BF58781023] [即時予約:未読]',
  };
  assert.equal(parseBookingEmail(digest), null);
});

test('電話予約の予約番号は channel=phone として区別する', () => {
  const r = parseBookingEmail(
    mail({
      subject: '予約連絡',
      id: 'YH13503525',
      name: 'テスト 次郎',
      visit: '2026年08月24日（月）18:30',
      accepted: '2026年08月24日（月）10:00',
    }),
  );
  assert.equal(r.channel, 'phone');
});

test('アンケート回答は ご要望・ご相談 から取れる（2026-08-31の経路アンケートの検証用）', () => {
  const r = parseBookingEmail(
    mail({
      subject: '予約連絡',
      id: 'BF60000001',
      name: 'テスト 三郎',
      visit: '2026年09月01日（火）10:00',
      accepted: '2026年09月01日（火）09:00',
      request: '【2】インスタ・フェイスブックの広告',
    }),
  );
  assert.equal(r.request, '【2】インスタ・フェイスブックの広告');
});

// 【間違い②の再発防止】キャンセル→取り直しを新規として二重に数えていた
test('キャンセル後に同じ人が同じ来店日で取り直したら、純予約に数えない', () => {
  const mails = [
    mail({
      subject: 'キャンセル連絡',
      id: 'BF53746749',
      name: 'テスト 四郎',
      visit: '2026年09月13日（日）11:00',
      accepted: '2026年08月23日（日）22:10',
      cancel: true,
    }),
    // 時刻だけ変えた取り直し（実際に起きた形。日付でしか突き合わせられない）
    mail({
      subject: '予約連絡',
      id: 'BF55542391',
      name: 'テスト 四郎',
      visit: '2026年09月13日（日）13:00',
      accepted: '2026年08月24日（月）12:11',
    }),
    mail({
      subject: '予約連絡',
      id: 'BF55580233',
      name: 'テスト 五郎',
      visit: '2026年08月25日（火）13:30',
      accepted: '2026年08月24日（月）13:10',
      coupon: '☆寝落ち必至☆【初回限定】全身ストレッチ90分＋ヘッド30分　120分¥13200',
    }),
  ];
  const { rows } = summarize(mails);
  const d824 = rows.find((r) => r.date === '2026-08-24');
  assert.equal(d824.bookings, 2, '予約通知は2件');
  assert.equal(d824.rebookings, 1, 'うち1件は取り直し');
  assert.equal(d824.net, 1, '純予約は1件');
  assert.equal(d824.firstVisit, 1, '初回クーポンは1件');
  assert.equal(rows.find((r) => r.date === '2026-08-23').cancels, 1);
});

test('別人の同じ来店日は取り直しにしない', () => {
  const mails = [
    mail({
      subject: 'キャンセル連絡',
      id: 'BF1',
      name: 'テスト 四郎',
      visit: '2026年09月13日（日）11:00',
      accepted: '2026年08月23日（日）22:10',
      cancel: true,
    }),
    mail({
      subject: '予約連絡',
      id: 'BF2',
      name: 'まったく別の人',
      visit: '2026年09月13日（日）13:00',
      accepted: '2026年08月24日（月）12:08',
    }),
  ];
  const { rows } = summarize(mails);
  assert.equal(rows.find((r) => r.date === '2026-08-24').net, 1);
  assert.equal(rows.find((r) => r.date === '2026-08-24').rebookings, 0);
});

// 【間違い③の再発防止】同じ予約に複数の通知が来ても二重に数えない
test('同じ予約番号の通知が2通来ても1件に畳む', () => {
  const one = {
    subject: '予約連絡',
    id: 'BF77777777',
    name: 'テスト 六郎',
    visit: '2026年08月25日（火）13:30',
    accepted: '2026年08月24日（月）13:10',
  };
  const { rows, notes } = summarize([mail(one), mail({ ...one, subject: '【明日】予約連絡' })]);
  assert.equal(rows.find((r) => r.date === '2026-08-24').bookings, 1);
  assert.equal(notes.duplicateReservationIdsDropped, 1);
});

test('本文に受付日時が無ければ受信時刻（JST）で代替する', () => {
  const m = mail({
    subject: 'キャンセル連絡',
    id: 'BF88888888',
    name: 'テスト 七郎',
    visit: '2026年09月13日（日）11:00',
    accepted: null,
    cancel: true,
  });
  // 2026-08-23T13:10:52Z = JST 2026-08-23 22:10
  m.internalDate = String(Date.parse('2026-08-23T13:10:52Z'));
  const r = parseBookingEmail(m);
  assert.equal(r.acceptedDate, '2026-08-23');
  assert.equal(r.acceptedTime, '22:10');
});

test('--from/--to の範囲外は集計に入らない', () => {
  const mails = [
    mail({ subject: '予約連絡', id: 'BF1', name: 'A', visit: '2026年09月01日（火）10:00', accepted: '2026年08月20日（木）10:00' }),
    mail({ subject: '予約連絡', id: 'BF2', name: 'B', visit: '2026年09月01日（火）11:00', accepted: '2026年08月25日（月）10:00' }),
  ];
  const { rows, total } = summarize(mails, { from: '2026-08-24', to: '2026-08-31' });
  assert.equal(rows.length, 1);
  assert.equal(total.bookings, 1);
});

test('電話予約が見えないことを必ず警告に出す', () => {
  const { notes } = summarize([]);
  assert.equal(notes.phoneBookingsInvisible, true);
  assert.match(notes.warning, /電話予約/);
});
