#!/usr/bin/env node
/**
 * ChatGPTで作った続編ポーズシート（4x4グリッド）をライブラリに取り込む。
 *
 * 使い方: node scripts/ingest-pose-sheet.mjs --sheet <画像パス> --start <開始番号>
 *   例: node scripts/ingest-pose-sheet.mjs --sheet sheet2.png --start 17
 *
 * 行境界はバッジ（各コマ左上の彩色サークル）の色検出で自動特定、
 * 列境界は白ガター（分散が小さい明るい縦帯）で自動特定する。
 * 出力: public/images/stretch-poses/pose-NN.webp と、マニフェスト追記用のひな形を標準出力へ。
 * ※ name/desc はカードに書かれている文言をClaudeが目視で読み取り、
 *   src/data/stretchPoses.ts に追記する（このスクリプトは切り出しのみ）。
 */
import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const SHEET = get('--sheet');
const START = parseInt(get('--start') || '', 10);
if (!SHEET || !START) { console.error('使い方: --sheet <画像> --start <開始番号>'); process.exit(1); }

const sharp = (await import('sharp')).default;
const img = sharp(await readFile(SHEET));
const meta = await img.metadata();
const W = meta.width, H = meta.height;

// --- 行境界：バッジ（彩度の高い画素）の帯を検出 ---
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const vivid = new Array(H).fill(0);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * C, r = data[i], g = data[i + 1], b = data[i + 2];
  if (Math.max(r, g, b) - Math.min(r, g, b) > 90) vivid[y]++;
}
const bands = [];
let inBand = false, bStart = 0;
const TH = Math.max(20, W * 0.03);
for (let y = 0; y < H; y++) {
  const on = vivid[y] > TH;
  if (on && !inBand) { inBand = true; bStart = y; }
  if (!on && inBand) { inBand = false; if (y - bStart > 8) bands.push(bStart); }
}
if (bands.length !== 4) {
  console.error(`バッジ行の検出が4行になりません（検出: ${bands.length}行 @ ${bands.join(',')}）。画像を確認してください。`);
  process.exit(1);
}
const rowTops = bands.map((b, i) => (i === 0 ? 0 : b - 14));
const rows = [...rowTops, H];

// --- 列境界：白ガター（明るく分散が小さい縦帯）を等間隔候補から検出 ---
const colStat = [];
for (let x = 0; x < W; x++) {
  let s = 0, s2 = 0;
  for (let y = 0; y < H; y++) { const v = data[(y * W + x) * C]; s += v; s2 += v * v; }
  const m = s / H;
  colStat.push({ x, m, sd: Math.sqrt(s2 / H - m * m) });
}
const cols = [0];
for (const e of [W / 4, W / 2, (3 * W) / 4]) {
  let best = null;
  for (const st of colStat) {
    if (Math.abs(st.x - e) > 40) continue;
    const score = st.m - st.sd * 2;
    if (!best || score > best.score) best = { x: st.x, score };
  }
  cols.push(best.x);
}
cols.push(W);

console.log(`行境界: ${rows.join(', ')} / 列境界: ${cols.join(', ')}`);

// --- 切り出し ---
const src = await readFile(SHEET);
const manifest = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
  const n = START + r * 4 + c;
  const w = cols[c + 1] - cols[c], h = rows[r + 1] - rows[r];
  const file = `public/images/stretch-poses/pose-${String(n).padStart(2, '0')}.webp`;
  await sharp(src).extract({ left: cols[c], top: rows[r], width: w, height: h }).webp({ quality: 92 }).toFile(file);
  manifest.push(`  { file: '/images/stretch-poses/pose-${String(n).padStart(2, '0')}.webp', width: ${w}, height: ${h}, name: 'TODO', desc: 'TODO', position: 'TODO' },`);
  console.log(`OK: ${file} (${w}x${h})`);
}
console.log('\n--- stretchPoses.ts 追記ひな形（name/desc/positionはカードを読んで埋める） ---');
console.log(manifest.join('\n'));
