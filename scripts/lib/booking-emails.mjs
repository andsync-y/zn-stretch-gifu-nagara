/**
 * SALON BOARD の予約通知メールから「ネット予約の実数」を出す。
 *
 * ■ なぜ作ったか（2026-08-31）
 * 「今日リードが16あるのに予約が1件も入っていない」を調べた際、私は同じ日のうちに
 * 数え方を3回間違えた。
 *   1. 月曜の数字を土日と比較した（8月実測で曜日差が3〜5倍ある業態）
 *   2. `subject:予約連絡` で絞り、「【当日◯時】直前予約が入りました」を落とした
 *   3. キャンセル→取り直しを新規予約として二重に数えた
 * 目視とメール検索でやる限り必ず間違えるので、判定をここに寄せる。
 * 薬機法チェック（yakkihou-ng.mjs）と同じ考え方。
 *
 * ■ このデータで測れないもの（出力にも必ず出す）
 * - **電話予約は1件も見えない。** 予約番号が `YH` で始まる予約はメールが飛ばない。
 *   2026-08-24 の来店5件のうち2件が電話予約で、メールには存在しなかった。
 *   ここで出る数字は「ネット予約（`BF`）の実数」であって「予約の実数」ではない。
 * - 来店したかどうかは分からない（予約の記録であって来店の記録ではない）。
 *
 * ■ 個人情報
 * 氏名は取り消し→取り直しの突き合わせにしか使わず、**戻り値には一切入れない**。
 * 照合用にハッシュへ潰してから持つ。
 */

import { createHash } from 'node:crypto';

/** 本文から `■見出し` 直後の1行を取る（全角スペース始まりの値行）。 */
function field(body, label) {
  const re = new RegExp(`■${label}\\s*\\n[\\s　]*(.+)`);
  return body.match(re)?.[1]?.trim() ?? null;
}

/** `2026年08月24日（月）13:10` → `{ date: '2026-08-24', time: '13:10' }` */
export function parseJpDateTime(s) {
  const m = s?.match(/(\d{4})年(\d{2})月(\d{2})日（.）\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  return { date: `${y}-${mo}-${d}`, time: `${h.padStart(2, '0')}:${mi}` };
}

/**
 * メールの受信時刻をJSTの日付・時刻にする。本文に「予約受付日時」が無いとき
 * （キャンセル通知など）の代替として使う。`internalDate`(ms文字列) か `date`(ISO)。
 */
export function mailReceivedJst(mail) {
  const ms = mail?.internalDate ? Number(mail.internalDate) : mail?.date ? Date.parse(mail.date) : NaN;
  if (!Number.isFinite(ms)) return null;
  const jst = new Date(ms + 9 * 3600 * 1000);
  const iso = jst.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/**
 * 経路アンケート（2026-08-31 表示開始）の選択肢。
 * 設問文は `docs/ops-change-log.md` の同日の行を参照。
 */
export const SURVEY_CHANNELS = {
  1: 'ホットペッパーで検索',
  2: 'Instagram・Facebookの広告',
  3: 'Google検索・広告',
  4: '看板・通りがかり',
  5: 'ご紹介',
  6: 'その他',
};

/**
 * アンケート回答を取り出す。
 *
 * ⚠️ **`■ご要望・ご相談` ではない。** 2026-08-31 に「そこに載るはず」と想定して実装したが、
 * 実際の1通目（BF60199476）で否定された。回答は `■サロンからお客様への質問` ブロックの
 * 末尾の「回答：」行に入り、`■ご要望・ご相談` は `-` のままだった。
 */
export function parseSurveyAnswer(body) {
  const block = body.match(/■サロンからお客様への質問([\s\S]*?)(?=\n■|\nPC版SALON BOARD|\n予約受付日時|$)/);
  if (!block) return { surveyAnswer: null, surveyChannel: null };
  const raw = block[1].match(/回答：\s*(.+)/)?.[1]?.trim() ?? null;
  if (!raw || raw === '-') return { surveyAnswer: null, surveyChannel: null };
  const n = raw.match(/【\s*(\d)\s*】/)?.[1];
  return {
    surveyAnswer: raw,
    // 番号で答えていない自由記述もあり得るので、番号が取れたときだけ経路に落とす
    surveyChannel: n && SURVEY_CHANNELS[n] ? Number(n) : null,
  };
}

/** 初回クーポンかどうか。クーポン名の表記ゆれに強くしておく。 */
function isFirstVisitCoupon(coupon) {
  if (!coupon) return false;
  return /初回|新規|お試し/.test(coupon);
}

/**
 * 初回客か既存客かを分ける。**経路アンケートの集計に必須。**
 *
 * 2026-08-31 の1通目（BF60199476）は**回数券保有者がHPBから予約したもの**で、
 * 新規の来店経路ではなかった。既存客の「最初に知ったきっかけ」は何年も前の出来事なので、
 * これを経路の分母に入れると広告の評価が壊れる。
 *
 * - `first`   初回限定クーポンを使っている
 * - `repeat`  メニューが回数券・チケット消化
 * - `unknown` どちらとも言えない（通常メニューをクーポンなしで予約した等）
 */
function classifyCustomer({ coupon, menu }) {
  if (isFirstVisitCoupon(coupon)) return 'first';
  if (menu && /チケット|回数券/.test(menu)) return 'repeat';
  return 'unknown';
}

/**
 * メール1通を構造化する。予約でもキャンセルでもなければ null（未対応予約のお知らせ等）。
 * @param {{subject?: string, plaintextBody?: string}} mail
 */
export function parseBookingEmail(mail) {
  const body = mail?.plaintextBody ?? '';
  const subject = mail?.subject ?? '';

  const reservationId = field(body, '予約番号');
  if (!reservationId) return null;

  // 「本日分の未対応予約のお知らせ」は予約でも取消でもない集計メール
  if (/未対応予約のお知らせ/.test(subject)) return null;

  const isCancel = /キャンセル/.test(subject) || /ご予約のキャンセルがありました/.test(body);

  const visit = parseJpDateTime(field(body, '来店日時') ?? '');
  const acceptedRaw = body.match(/予約受付日時：(.+)/)?.[1]?.trim() ?? null;
  // 本文の「予約受付日時」が正。無い場合（キャンセル通知など）だけ受信時刻で代替する
  const accepted = (acceptedRaw ? parseJpDateTime(acceptedRaw) : null) ?? mailReceivedJst(mail);

  const name = field(body, '氏名');
  const coupon = field(body, 'ご利用クーポン');
  const menu = field(body, 'メニュー');
  const request = field(body, 'ご要望・ご相談');

  return {
    type: isCancel ? 'cancel' : 'booking',
    reservationId,
    // `BF`＝ネット予約。`YH`＝電話予約だがメールには来ない（来ても弾かないでおく）
    channel: reservationId.startsWith('YH') ? 'phone' : 'net',
    visitDate: visit?.date ?? null,
    visitTime: visit?.time ?? null,
    // キャンセル通知には受付日時が無いことがあるので、その場合は来店日を持たせない
    acceptedDate: accepted?.date ?? null,
    acceptedTime: accepted?.time ?? null,
    firstVisit: isFirstVisitCoupon(coupon),
    customerType: classifyCustomer({ coupon, menu }),
    // 「ご要望・ご相談」はお客様の自由記述。アンケート回答はここではない（下記 survey*）
    request: request === '-' ? null : request,
    ...parseSurveyAnswer(body),
    personKey: name ? createHash('sha256').update(name).digest('hex').slice(0, 16) : null,
  };
}

/**
 * 取り直し（キャンセル後に同じ人が同じ来店日で取り直したもの）を判定して印を付ける。
 * 時刻だけ変える取り直しが実際にあったため、突き合わせは**来店日（日付のみ）**で行う。
 * @param {number} windowDays キャンセルから何日以内の再予約を取り直しとみなすか
 */
export function markRebookings(records, windowDays = 14) {
  const cancels = records.filter((r) => r.type === 'cancel' && r.personKey && r.visitDate);
  const used = new Set();

  return records.map((r) => {
    if (r.type !== 'booking' || !r.personKey || !r.visitDate || !r.acceptedDate) {
      return { ...r, rebooking: false };
    }
    const hit = cancels.find((c) => {
      if (used.has(c.reservationId)) return false;
      if (c.personKey !== r.personKey || c.visitDate !== r.visitDate) return false;
      // キャンセルは再予約より前に起きているはず。受付日を持たないキャンセルは日付比較を省く
      const base = c.acceptedDate ?? c.visitDate;
      const diff = (Date.parse(r.acceptedDate) - Date.parse(base)) / 86400000;
      return diff >= -windowDays && diff <= windowDays;
    });
    if (hit) used.add(hit.reservationId);
    return { ...r, rebooking: Boolean(hit) };
  });
}

/**
 * 受付日ごとに集計する。**同じ予約番号は1件に畳む**（同一予約に複数の通知が来ても
 * 二重に数えないため。これも今日やった間違いのひとつ）。
 */
export function summarize(mails, { from = null, to = null, windowDays = 14 } = {}) {
  const parsed = mails.map(parseBookingEmail).filter(Boolean);

  // 予約番号で重複排除。受付が早いほうを残す
  const seen = new Map();
  for (const r of parsed) {
    const key = `${r.type}:${r.reservationId}`;
    const prev = seen.get(key);
    const stamp = `${r.acceptedDate ?? '9999-99-99'} ${r.acceptedTime ?? '99:99'}`;
    if (!prev || stamp < prev.stamp) seen.set(key, { r, stamp });
  }
  const unique = [...seen.values()].map((v) => v.r);
  const dropped = parsed.length - unique.length;

  const marked = markRebookings(unique, windowDays);

  const inRange = (d) => d && (!from || d >= from) && (!to || d <= to);
  const days = new Map();
  const bump = (date, key, n = 1) => {
    if (!inRange(date)) return;
    if (!days.has(date)) {
      days.set(date, {
        date, bookings: 0, rebookings: 0, net: 0, cancels: 0, firstVisit: 0,
        byChannel: {}, surveyAnswered: 0, surveyFromNonFirst: 0,
      });
    }
    days.get(date)[key] += n;
  };

  let noAcceptedDate = 0;
  for (const r of marked) {
    if (r.type === 'cancel') {
      bump(r.acceptedDate, 'cancels');
      continue;
    }
    if (!r.acceptedDate) {
      noAcceptedDate += 1;
      continue;
    }
    bump(r.acceptedDate, 'bookings');
    if (r.rebooking) bump(r.acceptedDate, 'rebookings');
    else bump(r.acceptedDate, 'net');
    if (r.firstVisit && !r.rebooking) bump(r.acceptedDate, 'firstVisit');
    if (r.surveyAnswer && inRange(r.acceptedDate)) {
      const day = days.get(r.acceptedDate);
      day.surveyAnswered += 1;
      // **経路の分母は初回客だけ。** 既存客の「最初に知ったきっかけ」は今回の経路ではない
      if (r.customerType === 'first') {
        if (r.surveyChannel) day.byChannel[r.surveyChannel] = (day.byChannel[r.surveyChannel] ?? 0) + 1;
      } else {
        day.surveyFromNonFirst += 1;
      }
    }
  }

  const rows = [...days.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
  const total = rows.reduce(
    (a, r) => ({
      bookings: a.bookings + r.bookings,
      rebookings: a.rebookings + r.rebookings,
      net: a.net + r.net,
      cancels: a.cancels + r.cancels,
      firstVisit: a.firstVisit + r.firstVisit,
      surveyAnswered: a.surveyAnswered + r.surveyAnswered,
      surveyFromNonFirst: a.surveyFromNonFirst + r.surveyFromNonFirst,
      byChannel: Object.entries(r.byChannel).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: (acc[k] ?? 0) + v }),
        a.byChannel,
      ),
    }),
    { bookings: 0, rebookings: 0, net: 0, cancels: 0, firstVisit: 0, surveyAnswered: 0, surveyFromNonFirst: 0, byChannel: {} },
  );

  return {
    rows,
    total,
    notes: {
      parsedMails: parsed.length,
      duplicateReservationIdsDropped: dropped,
      bookingsWithoutAcceptedDate: noAcceptedDate,
      // ここを読まずに数字を使わせないための警告
      phoneBookingsInvisible: true,
      warning:
        '電話予約（予約番号 YH…）はメールが飛ばないため1件も含まれない。これは「ネット予約の実数」であり「予約の実数」ではない。',
    },
  };
}
