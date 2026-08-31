import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBookingEmail, summarize } from '../lib/booking-emails.mjs';

// 実物のフォーマットに合わせた検体。氏名はダミー（リポジトリに実名を置かないため）。
const mail = ({ subject, id, name, visit, accepted, coupon = null, menu = '整体＋骨盤矯正', request = '-', cancel = false }) => ({
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
    `　${menu}`,
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

// 実物（BF60199476・2026-08-31 15:21受付）で判明した形。
// 回答は「■サロンからお客様への質問」ブロックに入り、■ご要望・ご相談 は `-` のまま。
const SURVEY_BLOCK = `■サロンからお客様への質問
　質問：※クーポン割引は、ご来店後に口コミをご投稿いただける方が対象です。

サービス向上のためアンケートにご協力をお願いいたします。
当店を「最初に」知ったきっかけの番号を下記にご記入ください。
【1】 ホットペッパーで検索
【2】 Instagram・Facebookの広告
【3】 Google検索・広告
【4】 看板・通りがかり
【5】 ご紹介
【6】 その他
　回答： 【1】
`;

const withSurvey = (m, block = SURVEY_BLOCK) => ({
  ...m,
  plaintextBody: m.plaintextBody.replace('予約受付日時：', `${block}\nPC版SALON BOARD\nhttps://salonboard.com/login/\n\n予約受付日時：`),
});

// ⚠️ 当初「■ご要望・ご相談 に載る」と想定して実装したが、実データで否定された。
test('アンケート回答は「サロンからお客様への質問」から取る（ご要望・ご相談ではない）', () => {
  const r = parseBookingEmail(
    withSurvey(
      mail({
        subject: '【当日16時30分】直前予約が入りました',
        id: 'BF60199476',
        name: 'テスト 三郎',
        visit: '2026年08月31日（月）16:30',
        accepted: '2026年08月31日（月）15:21',
      }),
    ),
  );
  assert.equal(r.request, null, 'ご要望・ご相談 は空のまま');
  assert.equal(r.surveyAnswer, '【1】');
  assert.equal(r.surveyChannel, 1);
});

// 実物の1通目は回数券保有者だった。既存客の「最初に知ったきっかけ」を
// 新規の来店経路として集計すると広告の評価が壊れる
test('回数券メニューの予約は既存客（repeat）に分類する', () => {
  const r = parseBookingEmail(
    mail({
      subject: '【当日16時30分】直前予約が入りました',
      id: 'BF60199476',
      name: 'テスト 三郎',
      visit: '2026年08月31日（月）16:30',
      accepted: '2026年08月31日（月）15:21',
      menu: '男性60分チケット1枚',
      coupon: '利用クーポンなし',
    }),
  );
  assert.equal(r.customerType, 'repeat');
  assert.equal(r.firstVisit, false);
});

test('初回クーポンの予約は初回客（first）に分類する', () => {
  const r = parseBookingEmail(
    mail({
      subject: '予約連絡',
      id: 'BF1',
      name: 'テスト 太郎',
      visit: '2026年09月01日（火）10:00',
      accepted: '2026年09月01日（火）09:00',
      coupon: '☆お試しコース☆【初回限定】全力ストレッチ&もみほぐし!60分',
    }),
  );
  assert.equal(r.customerType, 'first');
});

test('既存客のアンケート回答は経路の分母に入れない', () => {
  const { rows, total } = summarize([
    withSurvey(
      mail({
        subject: '予約連絡', id: 'BF_REPEAT', name: 'リピーター',
        visit: '2026年09月01日（火）10:00', accepted: '2026年08月31日（月）15:21',
        menu: '男性60分チケット1枚', coupon: '利用クーポンなし',
      }),
    ),
    withSurvey(
      mail({
        subject: '予約連絡', id: 'BF_NEW', name: '初回のひと',
        visit: '2026年09月01日（火）11:00', accepted: '2026年08月31日（月）16:00',
        coupon: '☆お試しコース☆【初回限定】全力ストレッチ60分',
      }),
      SURVEY_BLOCK.replace('【1】\n', '【2】\n'),
    ),
  ]);
  const d = rows.find((r) => r.date === '2026-08-31');
  assert.equal(d.surveyAnswered, 2, '回答自体は2件');
  assert.equal(d.surveyFromNonFirst, 1, 'うち1件は既存客');
  assert.deepEqual(d.byChannel, { 2: 1 }, '経路に入るのは初回客の1件だけ');
  assert.equal(total.byChannel[1], undefined, '既存客の【1】は混ざらない');
});

test('番号で答えていない自由記述は surveyChannel に落とさない', () => {
  const block = SURVEY_BLOCK.replace('　回答： 【1】', '　回答： 友人にすすめられて');
  const r = parseBookingEmail(
    withSurvey(
      mail({
        subject: '予約連絡',
        id: 'BF60199477',
        name: 'テスト 八郎',
        visit: '2026年09月01日（火）10:00',
        accepted: '2026年09月01日（火）09:00',
      }),
      block,
    ),
  );
  assert.equal(r.surveyAnswer, '友人にすすめられて');
  assert.equal(r.surveyChannel, null);
});

test('経路アンケートを日別に集計する（初回客のみ）', () => {
  const base = {
    subject: '予約連絡',
    name: 'テスト 九郎',
    visit: '2026年09月01日（火）10:00',
    accepted: '2026年08月31日（月）15:21',
    coupon: '☆お試しコース☆【初回限定】全力ストレッチ60分',
  };
  const { rows } = summarize([
    withSurvey(mail({ ...base, id: 'BF1' })),
    withSurvey(mail({ ...base, id: 'BF2', name: 'テスト 十郎' }), SURVEY_BLOCK.replace('【1】\n', '【2】\n')),
    mail({ ...base, id: 'BF3', name: 'テスト 十一郎' }), // アンケート以前の予約
  ]);
  const d = rows.find((r) => r.date === '2026-08-31');
  assert.equal(d.bookings, 3);
  assert.equal(d.firstVisit, 3);
  assert.equal(d.surveyAnswered, 2, 'アンケートが無い通知は数えない');
  assert.equal(d.byChannel[1], 1);
  assert.equal(d.byChannel[2], 1);
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
