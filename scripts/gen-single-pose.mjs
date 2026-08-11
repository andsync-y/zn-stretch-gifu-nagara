#!/usr/bin/env node
/**
 * 単発ポーズイラスト生成。参照はキャラ設定表（シート1）のみで、ポーズは英語の詳細指定に従わせる。
 * 参照カードのポーズが不正確なとき（例: pose-12 スレッド・ザ・ニードル）の修正用。
 *
 * 使い方: node scripts/gen-single-pose.mjs --pose "<英語のポーズ詳細>" --out <出力パス> [--n 3]
 */
import { writeFile, readFile } from 'node:fs/promises';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY がありません'); process.exit(1); }
const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const POSE = get('--pose');
const outPath = get('--out') || 'single-out.png';
const N = parseInt(get('--n') || '3', 10);
if (!POSE) { console.error('--pose が必要です'); process.exit(1); }

const refBuf = await readFile('scripts/assets/stretch-character-ref.png');
const prompt =
  `The attached image is the official character reference sheet for an original character. ` +
  `Create ONE square illustration of this character on a plain very light warm-gray background (#f2f0ee), large and centered.\n` +
  `POSE (follow this description precisely — it overrides anything in the reference sheet):\n${POSE}\n` +
  `CRITICAL — character fidelity: reproduce the EXACT face and art style of the reference sheet. Same large soft brown eyes, ` +
  `same cute gentle facial features, same proportions, same soft anime coloring.\n` +
  `Clothing: the same outfit as in the reference sheet — white t-shirt with a small gray "ZN" logo, plain pastel light-blue yoga leggings ` +
  `(simple athletic wear with no buttons, zippers or pockets), white socks.\n` +
  `ABSOLUTELY NO text, NO numbers, NO badges, NO arrows, NO labels anywhere in the image.`;

for (let i = 0; i < N; i++) {
  const form = new FormData();
  form.append('model', 'gpt-image-2');
  form.append('image[]', new Blob([refBuf], { type: 'image/png' }), 'character-ref.png');
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
  if (!res.ok) { console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 250)}`); process.exit(1); }
  const b64 = (await res.json())?.data?.[0]?.b64_json;
  if (!b64) { console.error('画像なし'); process.exit(1); }
  const p = N > 1 ? outPath.replace(/(\.\w+)$/, `-${i + 1}$1`) : outPath;
  await writeFile(p, Buffer.from(b64, 'base64'));
  console.log(`OK: ${p}`);
}
