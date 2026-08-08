#!/usr/bin/env node
/**
 * ライブラリの「説明カード」画像から、記事掲載用の「文字なし・キャラだけ」イラストを再生成する。
 * カード4枚を参照画像として渡し、同キャラ・同ポーズ・同画風の2x2グリッド（1024px→512pxセル）を作らせる。
 *
 * 使い方: node scripts/gen-pose-illustrations.mjs --out <出力ディレクトリ>
 *   public/images/stretch-poses/pose-01..32.webp を4枚ずつバッチ処理し、
 *   <out>/illu-batch-01.png（ポーズ1〜4）... illu-batch-08.png（ポーズ29〜32）を出力する。
 */
import { writeFile, readFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY がありません'); process.exit(1); }
const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const outDir = get('--out') || 'out';
mkdirSync(outDir, { recursive: true });

// マニフェストから desc を拾う（プロンプトの補助情報として使う）
const ts = await readFile('src/data/stretchPoses.ts', 'utf8');
const poses = [...ts.matchAll(/file: '\/images\/stretch-poses\/(pose-\d+)\.webp'.*?desc: '([^']+)'/g)]
  .map((m) => ({ id: m[1], desc: m[2] }));
if (poses.length !== 32) { console.error(`マニフェストから32件読めません（${poses.length}件）`); process.exit(1); }

const POS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

for (let b = 0; b < poses.length / 4; b++) {
  const batch = poses.slice(b * 4, b * 4 + 4);
  const form = new FormData();
  form.append('model', 'gpt-image-2');
  for (const p of batch) {
    const buf = await readFile(`public/images/stretch-poses/${p.id}.webp`);
    form.append('image[]', new Blob([buf], { type: 'image/webp' }), `${p.id}.webp`);
  }
  const prompt =
    `Attached are 4 reference cards (in order: card1..card4) from a Japanese stretch-exercise guide, all featuring the SAME original character ` +
    `(young Japanese woman, long wavy brown hair, white t-shirt with a small "ZN" logo, light blue leggings, white socks).\n` +
    `Create ONE image: a 2x2 grid on a plain very light warm-gray background (#f2f0ee), divided into 4 equal square cells with no visible grid lines or borders.\n` +
    batch.map((p, i) => `- ${POS[i]} cell = the pose from card${i + 1} (${p.desc})`).join('\n') + '\n' +
    `In each cell, redraw ONLY the character demonstrating EXACTLY the same pose as in the corresponding card, in EXACTLY the same anime art style, ` +
    `same face and proportions. The character should be large and centered, filling most of the cell. ` +
    `Keep any prop that the pose needs (chair, wall, towel) in the same simple style as the cards.\n` +
    `ABSOLUTELY NO text, NO numbers, NO badges, NO titles, NO arrows, NO labels, NO watermarks anywhere in the image.`;
  form.append('prompt', prompt);
  form.append('size', '1024x1024');
  form.append('quality', 'high');
  form.append('input_fidelity', 'high');
  form.append('n', '1');
  let res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST', headers: { authorization: `Bearer ${KEY}` }, body: form,
    signal: AbortSignal.timeout(300000),
  });
  if (res.status === 400 && (await res.clone().text()).includes('input_fidelity')) {
    form.delete('input_fidelity');
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST', headers: { authorization: `Bearer ${KEY}` }, body: form,
      signal: AbortSignal.timeout(300000),
    });
  }
  if (!res.ok) { console.error(`batch ${b + 1} HTTP ${res.status}: ${(await res.text()).slice(0, 250)}`); process.exit(1); }
  const b64 = (await res.json())?.data?.[0]?.b64_json;
  if (!b64) { console.error(`batch ${b + 1}: 画像なし`); process.exit(1); }
  const p = `${outDir}/illu-batch-${String(b + 1).padStart(2, '0')}.png`;
  await writeFile(p, Buffer.from(b64, 'base64'));
  console.log(`OK: ${p} (${batch.map((x) => x.id).join(', ')})`);
}
