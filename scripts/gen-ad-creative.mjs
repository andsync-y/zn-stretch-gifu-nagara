#!/usr/bin/env node
/**
 * Meta広告バナーを生成する。GitHub Actions（gen-ad-creative.yml）から実行する想定。要 OPENAI_API_KEY。
 *
 * 設計上の判断（重要）:
 *   1. **日本語の文字をAIに描かせない。** 価格表示は景表法がかかる。崩れた文字や誤った金額は事故になる。
 *      背景だけ gpt-image-1 で作り、**文字は SVG + sharp で正確に合成する。**
 *   2. **実在の店舗・スタッフの「写真」を生成しない。** 偽の店内写真になるため。
 *      すでにブランドで使っているフラットイラストの画風に限定する。
 *   3. 画像に焼く文字はすべて `scripts/ad-creatives.json` に置く。
 *      公開前に `node scripts/yakkihou-ng.mjs scripts/ad-creatives.json` を通すこと。
 *
 * 使い方:
 *   node scripts/gen-ad-creative.mjs --out out [--only E_desk] [--skip-bg]
 *   --skip-bg は背景生成を飛ばして無地で組む（レイアウト確認用・APIを消費しない）
 *
 * 出力: <out>/<id>.png（1080x1080・Metaフィード用）
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';

const argv = process.argv.slice(2);
const get = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const OUT = get('--out') || 'out';
const ONLY = get('--only');
const SKIP_BG = argv.includes('--skip-bg');

const KEY = process.env.OPENAI_API_KEY;
if (!KEY && !SKIP_BG) { console.error('OPENAI_API_KEY がありません（--skip-bg なら不要）'); process.exit(1); }

const spec = JSON.parse(await readFile('scripts/ad-creatives.json', 'utf8'));
const { brand, common } = spec;
const S = 1080; // Metaフィードの正方形

const sharp = (await import('sharp')).default;
await mkdir(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 日本語フォントはランナー側で fonts-noto-cjk を入れておく
const FONT = "'Noto Sans CJK JP','Noto Sans JP','Hiragino Sans',sans-serif";

function overlaySvg(c) {
  // 左上に文言、右下は背景イラストのために空ける
  return `<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand.pale}" stop-opacity="0.97"/>
      <stop offset="55%" stop-color="${brand.pale}" stop-opacity="0.86"/>
      <stop offset="100%" stop-color="${brand.pale}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${S}" height="${S}" fill="url(#veil)"/>

  <text x="72" y="150" font-family="${FONT}" font-size="34" font-weight="500" fill="${brand.navy}" opacity="0.85">${esc(c.sub)}</text>

  <text x="72" y="248" font-family="${FONT}" font-size="66" font-weight="900" fill="${brand.navy}" letter-spacing="-1">${esc(c.hook)}</text>

  <rect x="72" y="316" width="322" height="62" rx="31" fill="${brand.navy}"/>
  <text x="233" y="358" font-family="${FONT}" font-size="32" font-weight="700" fill="${brand.white}" text-anchor="middle">${esc(common.badge)}</text>

  <text x="72" y="452" font-family="${FONT}" font-size="34" font-weight="500" fill="${brand.navy}" opacity="0.6">${esc(common.priceBefore)}</text>
  <line x1="70" y1="441" x2="278" y2="441" stroke="${brand.navy}" stroke-width="3" opacity="0.6"/>

  <!-- 「税込」は tspan で送る。日本語は字幅が一定でないため、xを自前計算すると価格に重なる（2026-08-25に実際に重なった） -->
  <text x="72" y="556" font-family="${FONT}" font-size="82" font-weight="900" fill="${brand.navy}" letter-spacing="-2">${esc(common.priceAfter)}<tspan font-size="30" font-weight="500" letter-spacing="0" opacity="0.7" dx="18">${esc(common.priceNote)}</tspan></text>

  <rect x="72" y="600" width="132" height="8" rx="4" fill="${brand.accent}"/>

  <text x="72" y="${S - 62}" font-family="${FONT}" font-size="27" font-weight="500" fill="${brand.navy}" opacity="0.8">${esc(common.footer)}</text>
</svg>`;
}

async function background(c) {
  if (SKIP_BG) {
    return sharp({ create: { width: S, height: S, channels: 3, background: brand.pale } }).png().toBuffer();
  }
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt: c.bgPrompt, size: '1024x1024', quality: 'medium', n: 1 }),
  });
  if (!res.ok) throw new Error(`背景生成に失敗 (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const b64 = res && (await res.json())?.data?.[0]?.b64_json;
  if (!b64) throw new Error('レスポンスに画像がありません');
  return sharp(Buffer.from(b64, 'base64')).resize(S, S, { fit: 'cover' }).png().toBuffer();
}

const targets = spec.concepts.filter((c) => !ONLY || c.id === ONLY);
if (targets.length === 0) { console.error(`--only ${ONLY} に一致する案がありません`); process.exit(1); }

for (const c of targets) {
  console.log(`生成中: ${c.id}（${c.label}）...`);
  const bg = await background(c);
  const out = await sharp(bg)
    .composite([{ input: Buffer.from(overlaySvg(c)), top: 0, left: 0 }])
    .png()
    .toBuffer();
  await writeFile(`${OUT}/${c.id}.png`, out);
  console.log(`  保存: ${OUT}/${c.id}.png (${Math.round(out.length / 1024)}KB)`);
}
console.log(`完了: ${targets.length}件`);
