#!/usr/bin/env node
/**
 * ポーズ設定表の「続編シート」をまるごと1枚、APIで生成する実験スクリプト。
 * 元シート（scripts/assets/stretch-character-ref.png）を参照画像として渡し、
 * 同一フォーマット（番号バッジ・タイトル・手順・キャラ実演）の4x4シートを作らせる。
 *
 * 使い方: node scripts/gen-pose-sheet.mjs --spec <spec.json> --out <出力パス> [--n <生成枚数>]
 *   spec: [{ "num": 17, "title": "肩甲骨引き寄せ", "steps": ["...","..."], "pose_en": "..." }, ...] 16件
 */
import { writeFile, readFile } from 'node:fs/promises';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY がありません'); process.exit(1); }
const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const specPath = get('--spec');
const outPath = get('--out') || 'sheet-out.png';
const N = parseInt(get('--n') || '1', 10);
const spec = JSON.parse(await readFile(specPath, 'utf8'));
if (spec.length !== 16) { console.error('specは16件必要'); process.exit(1); }

const refBuf = await readFile('scripts/assets/stretch-character-ref.png');

const cellLines = spec.map((c, i) => {
  const r = Math.floor(i / 4) + 1, col = (i % 4) + 1;
  return `Cell row${r}-col${col}: badge number "${c.num}", title "${c.title}", instruction lines: ${c.steps.map((s) => `"${s}"`).join(' / ')}. She demonstrates: ${c.pose_en}.`;
}).join('\n');

const prompt =
  `The attached image is page 1 of a Japanese stretch-exercise reference sheet featuring an original character. ` +
  `Create PAGE 2 of the same document — an EXACT continuation with IDENTICAL design language:\n` +
  `- Same 4x4 grid layout, same cell size and spacing, same light gray background\n` +
  `- Same circular colored number badges, same Japanese fonts for titles and instruction text, same text sizes and placement\n` +
  `- The EXACT same character in every cell: young Japanese woman, long wavy brown hair, white t-shirt with small "ZN" logo on the chest, light blue leggings, white socks — identical face, proportions, and anime art style as the reference\n` +
  `- Every pose must be anatomically correct, gentle and safe (standard stretching form)\n` +
  `- Japanese text must be written accurately, exactly as specified below\n\n` +
  `The 16 cells (left-to-right, top-to-bottom):\n${cellLines}`;

for (let i = 0; i < N; i++) {
  const form = new FormData();
  form.append('model', 'gpt-image-2');
  form.append('image[]', new Blob([refBuf], { type: 'image/png' }), 'page1.png');
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
