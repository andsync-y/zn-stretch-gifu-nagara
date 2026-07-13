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
  business: '完全個室のパーソナルストレッチ専門店',
  // NAP（Googleビジネスプロフィールと完全一致させること）
  postalCode: '502-0071', // ※要確認プレースホルダ相当。実郵便番号を morning-todo で確定
  addressRegion: '岐阜県',
  addressLocality: '岐阜市',
  streetAddress: '長良東2-37 RSDビル2F南',
  addressFull: '岐阜県岐阜市長良東2-37 RSDビル2F南',
  tel: '058-215-5835',
  telLink: '+81582155835',
  hours: '10:00–22:00',
  hoursOpen: '10:00',
  hoursClose: '22:00',
  closed: '不定休',
  parking: 'ビル東側に10台以上の共同駐車場あり',
  landmark: 'ヤマダデンキ テックランド岐阜長良のすぐそば',
  openedOn: '2026年6月20日',
  // 緯度経度（Googleマップ取得済み・実データ）
  geo: {
    lat: 35.447547,
    lng: 136.784403,
  },
  // 外部URL（実データ）
  urls: {
    reserve: 'https://beauty.hotpepper.jp/kr/slnH000806541/?vos=cpahpbprosmaf131118006',
    instagram: 'https://www.instagram.com/zngifunagara/',
    instagramHandle: '@zngifunagara',
    line: 'https://lin.ee/XyYJkAc',
    lineHandle: '@208dxmfr',
  },
};

// 料金（※変更の可能性あり）
export const PRICING = {
  note: '価格は変更となる場合があります。',
  courses: [
    { name: 'お試しコース', label: '60分', normal: '13,200円', first: '¥3,300', firstPlain: '3,300', discount: '初回限定75%OFF', primary: true },
    { name: '全身ケアコース', label: '90分', normal: '19,800円', first: '¥4,900', firstPlain: '4,900', discount: '初回限定75%OFF', primary: true },
    { name: '全身ケア＋ヘッドスパ', label: '120分', normal: '26,400円', first: '¥13,200', firstPlain: '13,200', discount: '初回限定50%OFF', primary: false },
  ],
  caption: '※初回限定価格はおひとり様1回限りです。2回目以降は通常料金（60分 13,200円／90分 19,800円／120分 26,400円）となります。',
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
  method: '元格闘家オーナー・阿佐美ザウルス氏が考案した“ザウルス式”体幹軸調整ストレッチ',
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
  { name: 'KAYO', kana: 'カヨ', role: '体感軸調整トレーナー', photo: '/images/staff/kayo.webp', word: 'つらい肩や腰のお疲れに。丁寧なカウンセリングで、今の状態にじっくり向き合います。' },
  { name: 'KIYO', kana: 'キヨ', role: '体感軸調整トレーナー', photo: '/images/staff/kiyo.webp', word: 'ただ整えるだけでなく、動ける身体へ。姿勢から軽やかさを引き出します。' },
  { name: 'MIYUKA', kana: 'ミユカ', role: '体感軸調整トレーナー', photo: '/images/staff/miyuka.webp', word: 'しっかり効かせる施術と、ほっと落ち着く時間。その両方を大切にしています。' },
  { name: 'AINA', kana: 'アイナ', role: '体感軸調整トレーナー', photo: '/images/staff/aina.webp', word: '頑張るお身体こそ、しっかりゆるめて軽く。日々を動きやすくするお手伝いをします。' },
  { name: 'AYU', kana: 'アユ', role: '体感軸調整トレーナー', photo: '/images/staff/ayu.webp', word: '「来てよかった」のひと言を全力で。一回一回、丁寧に向き合います。' },
  { name: 'DAYAN', kana: 'ダヤン', role: '体感軸調整トレーナー', photo: '/images/staff/dayan.webp', word: '伸ばして、整える。無理なく続けられる健康な身体づくりを一緒に。' },
  { name: 'HANA', kana: 'ハナ', role: '体感軸調整トレーナー', photo: '/images/staff/hana.webp', word: 'スポーツやゴルフの動きが、もっと快適に。可動域からコンディションを底上げします。' },
];

// 店舗写真（本部支給素材より。顔が写らないようトリミング済み・元データは photos-src/）
export const PHOTOS = {
  hero: '/images/photos/hero.webp', // pic-15 縦位置
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
  { slug: 'youtsu', label: '腰痛・お尻や脚の張り', short: '腰痛', note: '', desc: '腰の重だるさや、お尻・太もも裏のこわばりが気になる方へ。' },
  { slug: 'kubi-ganseihiro', label: '首こり・眼精疲労', short: '首こり・眼精疲労', note: '', desc: '首すじの張りや、目の奥の疲れが気になる方へ。' },
  { slug: 'mukumi', label: 'むくみ・冷え', short: 'むくみ・冷え', note: '', desc: '脚の重さや冷え、めぐりの滞りが気になる方へ。' },
  { slug: 'jiritsu', label: '疲れ・睡眠', short: '疲れ・睡眠', note: '', desc: '抜けにくい疲れや、休んだ気がしない毎日に。' },
  { slug: 'shisei', label: '姿勢・猫背', short: '姿勢・猫背', note: '', desc: '丸まりがちな背中や巻き肩の姿勢が気になる方へ。' },
  { slug: 'sports', label: 'スポーツケア', short: 'スポーツケア', note: 'ゴルフ・ランニングの前後に', desc: 'ゴルフ・ランニングなど、運動前後のコンディション作りに。' },
];

// sameAs（構造化データ用）
export const SAME_AS = [
  SITE.urls.instagram,
  SITE.urls.line,
  SITE.urls.reserve,
  // GBP・エキテン等が発行されたら追記: '{{GoogleビジネスプロフィールURL}}', '{{エキテンURL}}'
];

export const LAST_UPDATED = '2026-07-01';
