#!/usr/bin/env node
/**
 * コラム記事の品質GATE（機械チェック）。
 * 決定的に判定できるルールはAIに任せず、ここで落とす。
 *
 * 使い方:
 *   node scripts/lint-column.mjs <file...>   # 指定ファイルのみ（ワークフローは差分ファイルを渡す）
 *   node scripts/lint-column.mjs             # src/pages/column/ 全件（レガシー3本はFAQ免除）
 *
 * exit 0 = PASS / exit 1 = FAIL（違反を1行ずつ出力）
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { join, basename } from 'node:path';

// レガシー3本（katakori-desk-stretch / youtsu-morning-stretch / golf-stretch-routine）にも
// 2026-08-19にFAQと体感軸調整法への言及を追加したため、免除リストは廃止した。
// 以降はすべての記事が同じ基準で判定される。

// 薬機法・景表法NG（文脈を問わず出たら落とす断定・保証系）
const NG_PATTERNS = [
  /治る|治り(ます|やすい)|治療/,
  /効果があ(る|り)/,
  /改善(します|しました|されます|できます)/,
  /解消/,
  /矯正/,
  /効く|効きます/,
  /完治|即効/,
  /No\.?1|ナンバーワン/,
  /絶対(に)?(良く|治|改善|安全)/,
  /必ず(良く|治|改善|効)/,
  /根本(から)?改善/,
];
// altテキストで自店写真と誤認させる表現（AI/フリー画像に自店の説明を書かない）
const NG_ALT = /当店|自店|全力ストレッチ.{0,10}(施術|トレーナー|スタッフ)/;

const failures = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

let files = process.argv.slice(2).filter((f) => f.endsWith('.astro') && f.includes('src/pages/column/'));
const explicit = files.length > 0;
if (!explicit) {
  const dir = 'src/pages/column';
  files = (await readdir(dir)).filter((f) => f.endsWith('.astro')).map((f) => join(dir, f));
}
// index.astro は一覧ページであり記事ではない
files = files.filter((f) => basename(f) !== 'index.astro');

const columnsTs = await readFile('src/data/columns.ts', 'utf8');

// columns.ts のslug一意性（全体チェック）
const slugs = [...columnsTs.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dup.length) fail('src/data/columns.ts', `slugが重複: ${[...new Set(dup)].join(', ')}`);

const pageExists = async (href) => {
  const p = href.replace(/#.*$/, '').replace(/\/$/, '');
  if (p === '' || p === '/') return true;
  const cands = [`src/pages${p}.astro`, `src/pages${p}/index.astro`];
  for (const c of cands) { try { await access(c); return true; } catch {} }
  return false;
};

for (const file of files) {
  const src = await readFile(file, 'utf8');
  const slug = basename(file, '.astro');

  // 1) 薬機法NG表現
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    for (const re of NG_PATTERNS) {
      const m = line.match(re);
      if (m) fail(file, `L${i + 1} 薬機法NG表現「${m[0]}」`);
    }
  });

  // 2) 画像の出典表記とalt
  //    /images/column/ 配下＝AI生成・フリー素材 → 出典表記必須・自店を示すalt禁止
  //    /images/photos/ 配下＝自店の実写真 → どちらも対象外
  const imgPath = src.match(/image="(\/[^"]+)"/)?.[1] ?? '';
  if (imgPath.startsWith('/images/column/')) {
    if (!/imageCredit=/.test(src)) fail(file, 'AI/フリー画像なのに imageCredit がない（※画像はイメージです 等の表記必須）');
    const alt = src.match(/imageAlt="([^"]*)"/)?.[1] ?? '';
    if (NG_ALT.test(alt)) fail(file, `imageAltが自店写真と誤認させる表現: 「${alt}」`);
  }

  // 3) ストレッチ挿絵（固定ライブラリ）を使う場合の必須事項
  if (src.includes('/images/stretch-poses/') || src.includes('/images/column/stretch/')) {
    if (!/イラストはイメージです/.test(src)) fail(file, 'ストレッチ挿絵に「イラストはイメージです」の注記がない');
  }
  // 記事内のすべてのimg srcが実在するか
  for (const m of src.matchAll(/src="(\/images\/[^"]+)"/g)) {
    try { await access(`public${m[1]}`); } catch { fail(file, `画像ファイルが存在しない: ${m[1]}`); }
  }
  // 同一ポーズ画像の重複使用
  const poses = [...src.matchAll(/src="(\/images\/stretch-poses\/[^"]+)"/g)].map((m) => m[1]);
  const dupPose = poses.filter((v, i) => poses.indexOf(v) !== i);
  if (dupPose.length) fail(file, `同じポーズ画像を複数回使用: ${[...new Set(dupPose)].join(', ')}`);

  // 4) 内部リンクの実在
  for (const m of src.matchAll(/href="(\/[^"#]*)"/g)) {
    if (!(await pageExists(m[1]))) fail(file, `内部リンク先が存在しない: ${m[1]}`);
  }

  // 5) FAQ（3問以上）
  const faqCount = (src.match(/\{\s*q:/g) || []).length;
  if (faqCount < 3) fail(file, `FAQが${faqCount}問（3問以上必要）`);

  // 6) columns.ts に登録されているか
  if (!slugs.includes(slug)) fail(file, 'src/data/columns.ts に未登録');

  // 7) 体感軸調整法への言及と、解説ページ /method への内部リンク（E-E-A-T・独自性）
  //    AI検索・検索エンジンに専門性の裏付けを示す導線なので、機械的に必須化する
  if (!src.includes('体感軸調整法')) {
    fail(file, '「体感軸調整法」への言及がない');
  } else if (!src.includes('href="/method"')) {
    fail(file, '「体感軸調整法」の初出に解説ページ /method へのリンクがない');
  }
}

if (failures.length) {
  console.error(`品質GATE: FAIL（${failures.length}件）`);
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log(`品質GATE: PASS（${files.length}ファイル）`);
