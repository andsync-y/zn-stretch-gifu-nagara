// ============================================================
// 全力ストレッチ岐阜長良店 — サイト共通データ
// 既知の実データはここに集約。未確定は {{...}} プレースホルダ。
// ============================================================

export const SITE = {
  brand: '全力ストレッチ岐阜長良店',
  brandShort: '全力ストレッチ 岐阜長良店',
  operator: '株式会社ANDSYNC',
  representative: '多和田 雄仁',
  area: '岐阜県岐阜市 長良エリア',
  business: '個室のパーソナルストレッチ専門店',
  // NAP（Googleビジネスプロフィールと完全一致させること）
  postalCode: '502-0071', // ※要確認プレースホルダ相当。実郵便番号を morning-todo で確定
  addressRegion: '岐阜県',
  addressLocality: '岐阜市',
  streetAddress: '長良東２丁目３７ RSDビル2F南',
  addressFull: '岐阜県岐阜市長良東２丁目３７ RSDビル2F南',
  tel: '058-215-5835',
  telLink: '+81582155835',
  hours: '10:00–22:00',
  hoursOpen: '10:00',
  hoursClose: '22:00',
  /** 最終受付時刻 */
  lastEntry: '20:30',
  closed: '不定休',
  parking: 'ビル東側に10台以上の共同駐車場あり',
  landmark: 'ヤマダデンキ テックランド岐阜長良のすぐそば',
  openedOn: '2026年6月20日',
  // 緯度経度（Googleマップ取得済み・実データ）
  geo: {
    lat: 35.447547,
    lng: 136.784403,
  },
  // Googleマップ埋め込み（店舗ピン付きの公式embed URL）
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3250.1911674489115!2d136.78376877523996!3d35.45006144263926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6003ab00212d8347%3A0x74a2b6298b0da40f!2z5YWo5Yqb44K544OI44Os44OD44OB5bKQ6Zic6ZW36Imv5bqX!5e0!3m2!1sja!2sjp!4v1783924814903!5m2!1sja!2sjp',
  // 外部URL（実データ）
  urls: {
    reserve: 'https://beauty.hotpepper.jp/kr/slnH000806541/?vos=cpahpbprosmaf131118006',
    coupon: 'https://beauty.hotpepper.jp/kr/slnH000806541/coupon/',
    instagram: 'https://www.instagram.com/zngifunagara/',
    instagramHandle: '@zngifunagara',
    line: 'https://lin.ee/XyYJkAc',
    lineHandle: '@208dxmfr',
    recruit: 'https://jp.indeed.com/viewjob?jk=bfa8a8302df55342',
  },
};

// 料金（※変更の可能性あり）
export const PRICING = {
  note: '価格は変更となる場合があります。',
  courses: [
    { name: '集中ケアコース', label: '60分', normal: '13,200円', first: '¥3,300', firstPlain: '3,300', discount: '初回限定75%OFF', primary: true },
    { name: '全身ケアコース', label: '90分', normal: '19,800円', first: '¥4,900', firstPlain: '4,900', discount: '初回限定75%OFF', primary: true },
    { name: '全身ケア＋ヘッドスパ', label: '120分', normal: '26,400円', first: '¥13,200', firstPlain: '13,200', discount: '初回限定50%OFF', primary: false },
  ],
  caption: '※初回限定価格はおひとり様1回限りです。2回目以降は通常料金（女性 60分8,800円〜／男性 60分13,200円〜）です。お得な回数券もご用意しています。',
  priceRange: '3300-26400JPY',
};

// ブランド実績（§1.5：ブランド主語で。長良店単独の数字にしない。逐語コピー禁止）
export const BRAND = {
  storeCount: '全国約70店舗', // 正確な数は {{本部_店舗数}} で確認
  storeCountPlaceholder: '{{本部_店舗数}}',
  // メディアはテキスト言及のみ（ロゴ・タレント写真の無断転用禁止）
  media: [
    'テレビ東京「出没！アド街ック天国」',
    'フジテレビ「アウト×デラックス」',
    'YouTube（ヒカル氏の動画）',
    'ゴルフ雑誌「ALBA」',
    'ウェルビーイングメディア「Wellulu」',
  ],
  method: '元格闘家オーナーが考案した独自の「体感軸調整法」',
  // 施術の3本柱（ブランド共通コンセプト・効能は断定しない）
  pillars: [
    {
      no: '01',
      title: '骨盤へのアプローチ',
      body: 'からだの土台となる骨盤まわりの筋肉にアプローチし、姿勢の軸を整えていきます。',
    },
    {
      no: '02',
      title: '猫背・巻き肩へのアプローチ',
      body: '肩甲骨まわりの可動域や、内側に入りやすい肩の状態にアプローチします。',
    },
    {
      no: '03',
      title: '筋膜ほぐし＋深層筋ストレッチ',
      body: '表層の筋膜をやさしくほぐしながら、届きにくい深部の筋肉までストレッチします。',
    },
  ],
};

// スタッフ（実在。全員「体感軸調整トレーナー」。一言は生成済み・薬機法調整済み）
// 掲載順はTOP v5デザイン準拠。photo は実写（design-reference/uploads から圧縮済み）
export const STAFF = [
  { name: 'AINA', kana: 'アイナ', role: '体感軸調整トレーナー', photo: '/images/staff/aina.webp', word: '頑張るお身体こそ、しっかりゆるめて軽く。日々を動きやすくするお手伝いをします。' },
  { name: 'DAYAN', kana: 'ダヤン', role: '体感軸調整トレーナー', photo: '/images/staff/dayan.webp', word: '伸ばして、整える。無理なく続けられる健康な身体づくりを一緒に。' },
  { name: 'HANA', kana: 'ハナ', role: '体感軸調整トレーナー', photo: '/images/staff/hana.webp', word: 'スポーツやゴルフの動きが、もっと快適に。可動域からコンディションを底上げします。' },
  { name: 'MIYUKA', kana: 'ミユカ', role: '体感軸調整トレーナー', photo: '/images/staff/miyuka.webp', word: 'しっかり効かせる施術と、ほっと落ち着く時間。その両方を大切にしています。' },
  { name: 'KIYO', kana: 'キヨ', role: '体感軸調整トレーナー', photo: '/images/staff/kiyo.webp', word: 'ただ整えるだけでなく、動ける身体へ。姿勢から軽やかさを引き出します。' },
  { name: 'AYU', kana: 'アユ', role: '体感軸調整トレーナー', photo: '/images/staff/ayu.webp', word: '「来てよかった」のひと言を全力で。一回一回、丁寧に向き合います。' },
  { name: 'KAYO', kana: 'カヨ', role: '体感軸調整トレーナー', photo: '/images/staff/kayo.webp', word: 'つらい肩や腰のお疲れに。丁寧なカウンセリングで、今の状態にじっくり向き合います。' },
];

// 店舗写真（本部支給素材より。顔が写らないようトリミング済み・元データは photos-src/）
export const PHOTOS = {
  hero: '/images/photos/hero.webp', // pic-15 縦位置
  hero2: '/images/photos/hero2.webp', // pic-37 縦位置クロップ（TOPのMV1枚目）
  marquee1: '/images/photos/marquee-1.webp', // pic-66
  marquee2: '/images/photos/marquee-2.webp', // pic-9
  marquee3: '/images/photos/marquee-3.webp', // pic-58 横位置・上部カット
  concept: '/images/photos/concept.webp', // pic-58 縦位置・上部カット
  method1: '/images/photos/method-1.webp', // pic-78
  method2: '/images/photos/method-2.webp', // pic-49 上部カット
  method3: '/images/photos/method-3.webp', // pic-33
};

// 症状ページのメタ情報（一覧・内部リンク・パンくずに使用。本文は各ページで書き分け）
// ラベル・並び・注記はTOP v5デザイン準拠
export const SYMPTOMS = [
  { slug: 'katakori', label: '肩こり', short: '肩こり', note: 'デスクワークの張りに', desc: 'デスクワークや立ち仕事で重くなった肩・首まわりへ。' },
  { slug: 'youtsu', label: '腰痛・お尻や脚の張り', short: '腰痛', note: '長時間の運転・立ち仕事に', desc: '腰の重だるさや、お尻・太もも裏のこわばりが気になる方へ。' },
  { slug: 'kubi-ganseihiro', label: '首こり・眼精疲労', short: '首こり・眼精疲労', note: 'スマホ・PC作業が多い方に', desc: '首すじの張りや、目の奥の疲れが気になる方へ。' },
  { slug: 'mukumi', label: 'むくみ・冷え', short: 'むくみ・冷え', note: '夕方の脚の重だるさに', desc: '脚の重さや冷え、めぐりの滞りが気になる方へ。' },
  { slug: 'jiritsu', label: '疲れ・睡眠', short: '疲れ・睡眠', note: '休んでも抜けにくい疲れに', desc: '抜けにくい疲れや、休んだ気がしない毎日に。' },
  { slug: 'shisei', label: '姿勢・猫背', short: '姿勢・猫背', note: '丸まりがちな背中・巻き肩に', desc: '丸まりがちな背中や巻き肩の姿勢が気になる方へ。' },
  { slug: 'sports', label: 'スポーツケア', short: 'スポーツケア', note: 'ゴルフ・ランニングの前後に', desc: 'ゴルフ・ランニングなど、運動前後のコンディション作りに。' },
];

// お支払い方法（現金＋Squareキャッシュレス決済）
export const PAYMENTS = [
  { label: '現金', detail: '' },
  { label: 'クレジットカード', detail: 'Visa／Mastercard／American Express／JCB／Diners Club／Discover／銀聯（UnionPay）' },
  { label: '交通系電子マネー', detail: 'Suica／PASMO／manaca／ICOCA／Kitaca／toica／SUGOCA／nimoca／はやかけん（※PiTaPaを除く）' },
  { label: 'QRコード決済', detail: 'PayPay／d払い／楽天ペイ／au PAY／メルペイ／Alipay+／WeChat Pay' },
  { label: '電子マネー', detail: 'iD／QUICPay' },
];

// お客様の声（Googleマップに投稿された実際のクチコミ。本文は原文のまま・捏造禁止）
// ※Googleマップ由来のためReview/AggregateRatingのschema化はしない（Googleのガイドライン上、
//   構造化データにできるのは自サイトで直接収集したレビューのみ）
export const REVIEWS = [
  { name: 'N さん', stars: 5, text: 'ストレッチで身体がほぐれて普段運動しないけど、運動したくなりました。' },
  { name: 'I さん', stars: 5, text: '普段ストレッチ出来ない箇所もしっかり伸ばせて気持ち良かったです。また利用したいです。' },
  { name: 'Y さん', stars: 4, text: '身体がものすごく伸びました。施術されている時は、とても疲れましたが血流が良くなり、心地よい疲労感で、とても良かったです。' },
  { name: 'Q さん', stars: 5, text: '知人から紹介頂きお邪魔させて頂きました。マッサージ＋ストレッチという今まで経験した事が無い施術で終わった後は血行が良くなってポカポカしました🔥スタッフの方もとても感じ良くリラックスして過ごす事が出来ました。満足度が高かったので私の友人にも紹介させて頂きました。これからも頑張ってください。応援してます📣' },
  { name: 'M さん', stars: 5, text: 'いろいろな角度からアプローチしてもらいました。とにかくよかったです。' },
  { name: 'S さん', stars: 5, text: '一回の施術で体が楽になった' },
  { name: 'A さん', stars: 5, text: '通常のマッサージよりもスッキリ感があり、効果も期待できそうです♪痛気持ちよくて最高でした！' },
  { name: 'H さん', stars: 4, text: 'よくある揉みほぐしではなく、伸ばす感じで自分が求めているタイプのマッサージだった。終わった後は身体が温まって、スッキリしました。' },
  { name: 'B さん', stars: 5, text: '体が軽い✨ありがとうございます✨' },
  { name: 'T さん', stars: 5, text: '腰回り重点でやってもらいました。状態を確認してもらいながら施術してくださり、親切で良かったです。筋肉の場所の説明もありました。終わって、腰回りの感覚が楽になりました。ありがとうございます。' },
];

// sameAs（構造化データ用）
export const SAME_AS = [
  SITE.urls.instagram,
  SITE.urls.line,
  SITE.urls.reserve,
  // GBP・エキテン等が発行されたら追記: '{{GoogleビジネスプロフィールURL}}', '{{エキテンURL}}'
];

export const LAST_UPDATED = '2026-07-01';
