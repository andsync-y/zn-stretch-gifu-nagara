#!/usr/bin/env node
/**
 * ライブラリの「説明カード」画像から、記事掲載用の「文字なし・キャラだけ」イラストを再生成する。
 * カード4枚を参照画像として渡し、同キャラ・同ポーズ・同画風の2x2グリッド（1024px→512pxセル）を作らせる。
 *
 * 使い方: node scripts/gen-pose-illustrations.mjs --out <出力ディレクトリ> [--batches 2,4]
 *   public/images/stretch-poses/pose-01..32.webp を4枚ずつバッチ処理し、
 *   <out>/illu-batch-01.png（ポーズ1〜4）... illu-batch-08.png（ポーズ29〜32）を出力する。
 *   --batches でバッチ番号を絞って再生成できる。
 *   ※ 参照カードは初回生成前のカード形式である必要がある。差し替え後に再実行する場合は
 *     git show で当時のカード（コミット 0373451 時点）を復元してから使うこと。
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

// 初回生成でポーズがずれたコマへの強制指定（英語で姿勢を明示する）
const HINTS = {
  'pose-12': 'The beginner yoga pose Thread the Needle: kneeling on all fours, she slides one arm along the floor through the space below her opposite arm, palm up, so the hand comes out past the other side of her body — the forearm VISIBLY crosses under her torso and emerges on the far side. That shoulder and the side of her head rest on the floor, hips stay lifted above her knees, and the other hand stays planted for support. Draw the view angle so the threaded arm emerging on the opposite side is clearly visible. NOT an arm sweeping sideways on its own side, NOT lying face down.',
  'pose-08': 'She is STANDING upright on one leg, bending the other knee behind her and holding that ankle with her hand to stretch the front of the thigh. NOT kneeling.',
  'pose-14': 'She is SITTING upright, both arms extended straight forward at shoulder height, hands clasped, rounding her upper back to spread the shoulder blades apart. NOT a child pose, NOT bending to the floor.',
  'pose-15': 'She is SITTING on the floor with one leg extended forward, pulling the toes of that foot up toward her shin with her hand to stretch the calf and ankle.',
};

const only = get('--batches') ? get('--batches').split(',').map(Number) : null;
for (let b = 0; b < poses.length / 4; b++) {
  if (only && !only.includes(b + 1)) continue;
  const batch = poses.slice(b * 4, b * 4 + 4);
  const form = new FormData();
  form.append('model', 'gpt-image-2');
  // 1枚目＝「正」のChatGPT設定表（顔・画風のアンカー）。2〜5枚目＝ポーズカード。
  const refBuf = await readFile('scripts/assets/stretch-character-ref.png');
  form.append('image[]', new Blob([refBuf], { type: 'image/png' }), 'character-ref.png');
  for (const p of batch) {
    const buf = await readFile(`public/images/stretch-poses/${p.id}.webp`);
    form.append('image[]', new Blob([buf], { type: 'image/webp' }), `${p.id}.webp`);
  }
  const prompt =
    `The FIRST attached image is the official character reference sheet — the canonical look of this original character. ` +
    `The next 4 images are pose cards (card1..card4) featuring the same character.\n` +
    `Create ONE image: a 2x2 grid on a plain very light warm-gray background (#f2f0ee), divided into 4 equal square cells with no visible grid lines or borders.\n` +
    batch.map((p, i) => `- ${POS[i]} cell = the pose from card${i + 1} (${p.desc})${HINTS[p.id] ? ` — IMPORTANT: ${HINTS[p.id]}` : ''}`).join('\n') + '\n' +
    `In each cell, redraw ONLY the character demonstrating EXACTLY the same pose as in the corresponding card.\n` +
    `CRITICAL — character fidelity: reproduce the EXACT face and art style of the FIRST reference sheet. Same large soft brown eyes, ` +
    `same cute gentle facial features, same head-to-body proportions, same soft anime coloring. Do not restyle her.\n` +
    `CRITICAL — clothing: white t-shirt with a small gray "ZN" logo, and SKIN-TIGHT pastel light-blue LEGGINGS exactly as in the reference sheet — ` +
    `smooth thin stretchy fabric hugging the legs, NO button, NO zipper, NO fly, NO pockets, NO belt loops, NO denim texture (they must NOT look like jeans or trousers), plus white socks.\n` +
    `The character should be large and centered, filling most of the cell. ` +
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
