#!/usr/bin/env node
/**
 * 2x2グリッドのポーズイラストを「人物単位」で切り出す。
 * 単純な4等分だと人物がセル境界をまたいだとき頭や手足が切れるため、
 * 前景（背景色でない画素）の連結成分を検出し、重心が属する象限ごとにまとめて
 * バウンディングボックス＋余白で切り出し、512x512の正方形（背景色でパディング）に整える。
 *
 * 使い方: node scripts/slice-illu-grid.mjs --src <グリッド画像> --ids pose-01,pose-02,pose-03,pose-04
 *   ids は TL,TR,BL,BR の順。出力は public/images/stretch-poses/<id>.webp
 */
import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const SRC = get('--src');
const IDS = (get('--ids') || '').split(',');
if (!SRC || IDS.length !== 4) { console.error('使い方: --src <画像> --ids a,b,c,d'); process.exit(1); }

const sharp = (await import('sharp')).default;
const img = sharp(await readFile(SRC));
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;

// 背景色は四隅の平均から推定
const corner = (x, y) => [data[(y * W + x) * C], data[(y * W + x) * C + 1], data[(y * W + x) * C + 2]];
const cs = [corner(2, 2), corner(W - 3, 2), corner(2, H - 3), corner(W - 3, H - 3)];
const bg = [0, 1, 2].map((i) => cs.reduce((s, c) => s + c[i], 0) / 4);
const isFg = (x, y) => {
  const i = (y * W + x) * C;
  return Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 45;
};

// 連結成分ラベリング（4近傍BFS）
const label = new Int32Array(W * H).fill(-1);
const comps = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (label[y * W + x] !== -1 || !isFg(x, y)) continue;
  const id = comps.length;
  const q = [[x, y]];
  label[y * W + x] = id;
  let minX = x, maxX = x, minY = y, maxY = y, n = 0, sx = 0, sy = 0;
  while (q.length) {
    const [cx, cy] = q.pop();
    n++; sx += cx; sy += cy;
    if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
    if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (label[ny * W + nx] === -1 && isFg(nx, ny)) { label[ny * W + nx] = id; q.push([nx, ny]); }
    }
  }
  comps.push({ n, minX, maxX, minY, maxY, cx: sx / n, cy: sy / n });
}

// ノイズ除去のうえ、重心の象限（TL,TR,BL,BR）ごとにbboxを統合
const quadOf = (c) => (c.cy < H / 2 ? 0 : 2) + (c.cx < W / 2 ? 0 : 1);
const boxes = [null, null, null, null];
for (const c of comps) {
  if (c.n < 300) continue;
  const qi = quadOf(c);
  const b = boxes[qi];
  boxes[qi] = b
    ? { minX: Math.min(b.minX, c.minX), maxX: Math.max(b.maxX, c.maxX), minY: Math.min(b.minY, c.minY), maxY: Math.max(b.maxY, c.maxY) }
    : { minX: c.minX, maxX: c.maxX, minY: c.minY, maxY: c.maxY };
}

for (let qi = 0; qi < 4; qi++) {
  const b = boxes[qi];
  if (!b) { console.error(`象限${qi}に人物が見つかりません`); process.exit(1); }
  // この象限に属さない前景画素（隣の人物のはみ出し等）を背景色で消す
  const cleaned = Buffer.from(data);
  for (let p = 0; p < W * H; p++) {
    const l = label[p];
    if (l !== -1 && (comps[l].n < 300 ? true : quadOf(comps[l]) !== qi)) {
      const i = p * C;
      cleaned[i] = Math.round(bg[0]); cleaned[i + 1] = Math.round(bg[1]); cleaned[i + 2] = Math.round(bg[2]);
      if (C === 4) cleaned[i + 3] = 255;
    }
  }
  const M = 14;
  const left = Math.max(0, b.minX - M), top = Math.max(0, b.minY - M);
  const w = Math.min(W, b.maxX + M) - left, h = Math.min(H, b.maxY + M) - top;
  const side = Math.max(w, h);
  const bgHex = { r: Math.round(bg[0]), g: Math.round(bg[1]), b: Math.round(bg[2]) };
  await sharp(cleaned, { raw: { width: W, height: H, channels: C } })
    .extract({ left, top, width: w, height: h })
    .resize({ width: side, height: side, fit: 'contain', background: bgHex })
    .resize(512, 512)
    .webp({ quality: 90 })
    .toFile(`public/images/stretch-poses/${IDS[qi]}.webp`);
  console.log(`OK: ${IDS[qi]} (bbox ${w}x${h})`);
}
