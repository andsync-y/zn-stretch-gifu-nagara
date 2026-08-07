#!/usr/bin/env node
/**
 * コラム内ストレッチ手順の挿絵を、固定キャラクター（ZNちゃん）で生成する。
 *
 * キャラクター品質の担保：
 *   scripts/assets/stretch-character-ref.png（16ポーズのキャラ設定表）を
 *   OpenAI images/edits の参照画像として渡し、同一キャラ・同一画風で
 *   指定ポーズを描かせる。ゼロから生成するより同一性が大幅に安定する。
 *
 * 使い方（コラム生成ワークフローから呼ばれる想定）:
 *   node scripts/gen-stretch-illustrations.mjs --slug <slug> --spec stretch-spec.json
 *   spec: [{ "file": "01-neck-side", "pose": "sitting cross-legged, tilting head to the right..." }, ...]
 *
 * 出力: public/images/column/stretch/<slug>/<file>.webp（幅900px）
 * 費用目安: quality=high + input_fidelity=high で1枚あたり約$0.19（記事1本・4枚で約¥120）
 *          （quality=medium なら約$0.07/枚。--quality で切替可）
 * 一部失敗は許容（成功分だけ保存し、結果を標準出力に出す）。全滅時のみ exit 1。
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY がありません'); process.exit(1); }

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const slug = get('--slug');
const specPath = get('--spec');
const MODEL = get('--model') || 'gpt-image-1';
const QUALITY = get('--quality') || 'high';
const OUTDIR_OVERRIDE = get('--outdir');
if (!slug || !specPath) { console.error('使い方: --slug <slug> --spec <spec.json>'); process.exit(1); }

const spec = JSON.parse(await readFile(specPath, 'utf8'));
if (!Array.isArray(spec) || spec.length === 0) { console.error('specが空です'); process.exit(1); }
if (spec.length > 6) { console.error('挿絵は最大6枚までにしてください'); process.exit(1); }

const REF = 'scripts/assets/stretch-character-ref.png';
const refBuf = await readFile(REF);
const outDir = OUTDIR_OVERRIDE || `public/images/column/stretch/${slug}`;
await mkdir(outDir, { recursive: true });
const sharp = (await import('sharp')).default;

// キャラクターと画風の固定指示（毎回同一）。
// 画風は言葉で再定義せず「参照シートを完全コピー」とだけ指示する
// （形容詞で塗り・背景を指定すると参照の画風を上書きしてしまうため）。
const STYLE =
  'Reproduce the EXACT art style of the reference sheet with perfect fidelity: same character ' +
  '(young Japanese woman, long wavy brown hair, plain white t-shirt with a small "ZN" logo, ' +
  'light blue leggings, white socks), same face, same body proportions, same line quality, ' +
  'same shading and rendering, same plain light neutral-gray background color as the sheet. ' +
  'Single character, full body visible. ' +
  'The pose must be anatomically correct, gentle and safe — a standard stretching form a physiotherapist ' +
  'would approve, no extreme flexibility. Prefer poses close to the ones shown in the reference sheet. ' +
  'No text, no numbers, no watermark, no frame.';

let ok = 0;
for (const item of spec) {
  const prompt = `She is performing this stretch: ${item.pose}. ${STYLE}`;
  try {
    const form = new FormData();
    form.append('model', MODEL);
    form.append('image[]', new Blob([refBuf], { type: 'image/png' }), 'ref.png');
    form.append('prompt', prompt);
    form.append('size', '1024x1024');
    form.append('quality', QUALITY);
    // 参照画像（キャラと画風）への忠実度を最大化する
    form.append('input_fidelity', 'high');
    form.append('n', '1');
    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { authorization: `Bearer ${KEY}` },
      body: form,
      signal: AbortSignal.timeout(180000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const b64 = (await res.json())?.data?.[0]?.b64_json;
    if (!b64) throw new Error('レスポンスに画像なし');
    const out = await sharp(Buffer.from(b64, 'base64')).resize(900).webp({ quality: 85 }).toBuffer();
    const path = `${outDir}/${item.file}.webp`;
    await writeFile(path, out);
    ok++;
    console.log(`OK: ${path} (${Math.round(out.length / 1024)}KB)`);
  } catch (e) {
    console.error(`FAIL: ${item.file} - ${String(e).slice(0, 200)}`);
  }
}
console.log(`完了: ${ok}/${spec.length} 枚生成`);
if (ok === 0) process.exit(1);
