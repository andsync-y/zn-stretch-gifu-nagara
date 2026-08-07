#!/usr/bin/env node
/**
 * コラム内ストレッチ手順の挿絵を、固定キャラクター（ZNちゃん）で生成する。
 *
 * キャラクター品質の担保（3層）：
 *   1. 参照画像2枚（16ポーズ設定表＋顔クローズアップ）を images/edits に渡す
 *   2. 既定は「グリッドモード」：全ポーズを1回の生成で1枚のグリッド画像に描かせ、
 *      分割して使う。1回の生成内では顔・画風が揃うため、シーン間の顔ブレを構造的に防ぐ
 *      （ユーザー提供の設定表内で顔が揃っているのと同じ原理）。--mode single で従来方式。
 *   3. input_fidelity=high で参照への忠実度を最大化
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
const MODE = get('--mode') || 'grid';
if (!slug || !specPath) { console.error('使い方: --slug <slug> --spec <spec.json>'); process.exit(1); }

const spec = JSON.parse(await readFile(specPath, 'utf8'));
if (!Array.isArray(spec) || spec.length === 0) { console.error('specが空です'); process.exit(1); }
if (spec.length > 6) { console.error('挿絵は最大6枚までにしてください'); process.exit(1); }

const refBuf = await readFile('scripts/assets/stretch-character-ref.png');
const faceBuf = await readFile('scripts/assets/character-face-ref.png');
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

async function callEdit(prompt, size) {
  const build = (withFidelity) => {
    const form = new FormData();
    form.append('model', MODEL);
    form.append('image[]', new Blob([refBuf], { type: 'image/png' }), 'ref-sheet.png');
    form.append('image[]', new Blob([faceBuf], { type: 'image/png' }), 'ref-face.png');
    form.append('prompt', prompt);
    form.append('size', size);
    form.append('quality', QUALITY);
    if (withFidelity) form.append('input_fidelity', 'high');
    form.append('n', '1');
    return form;
  };
  let res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST', headers: { authorization: `Bearer ${KEY}` },
    body: build(true), signal: AbortSignal.timeout(300000),
  });
  if (res.status === 400 && (await res.clone().text()).includes('input_fidelity')) {
    // 新モデルが input_fidelity 未対応の場合はパラメータ無しで再試行
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST', headers: { authorization: `Bearer ${KEY}` },
      body: build(false), signal: AbortSignal.timeout(300000),
    });
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 250)}`);
  const b64 = (await res.json())?.data?.[0]?.b64_json;
  if (!b64) throw new Error('レスポンスに画像なし');
  return Buffer.from(b64, 'base64');
}

let ok = 0;

if (MODE === 'grid') {
  // ===== グリッドモード（既定）：1回の生成で全ポーズ → 分割 =====
  const n = spec.length;
  const cols = 2;
  const rows = Math.ceil(n / cols);
  // 埋め草ポーズでグリッドを完全に埋める（中途半端なグリッドは崩れやすい）
  const cells = [...spec];
  while (cells.length < rows * cols) {
    cells.push({ file: `_spare-${cells.length}`, pose: 'standing upright and relaxed, smiling, arms at her sides' });
  }
  const size = rows >= 3 ? '1024x1536' : '1024x1024';
  const panelLines = cells.map((c, i) => `Panel ${i + 1}: ${c.pose}.`).join('\n');
  const prompt =
    `One single image laid out as a strict ${rows}x${cols} grid of ${rows * cols} equal-sized rectangular panels, ` +
    `separated by clean straight thin white gutters. No borders, no numbers, no text. ` +
    `EVERY panel shows the exact same character with an IDENTICAL face, hairstyle, outfit and art style. ` +
    `Panels are numbered left-to-right, top-to-bottom:\n${panelLines}\n${STYLE}`;
  try {
    const buf = await callEdit(prompt, size);
    const img = sharp(buf);
    const meta = await img.metadata();
    const cw = Math.floor(meta.width / cols);
    const ch = Math.floor(meta.height / rows);
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      // ガター中央で切り、端の見切れを避けるためわずかに内側へ寄せる
      const inset = Math.round(cw * 0.01);
      const out = await sharp(buf)
        .extract({ left: c * cw + inset, top: r * ch + inset, width: cw - inset * 2, height: ch - inset * 2 })
        .resize(900).webp({ quality: 85 }).toBuffer();
      const path = `${outDir}/${spec[i].file}.webp`;
      await writeFile(path, out);
      ok++;
      console.log(`OK: ${path} (${Math.round(out.length / 1024)}KB)`);
    }
  } catch (e) {
    console.error(`GRID FAIL: ${String(e).slice(0, 250)}`);
  }
} else {
  // ===== 従来モード：1枚ずつ生成（--mode single）=====
  for (const item of spec) {
    try {
      const buf = await callEdit(`She is performing this stretch: ${item.pose}. ${STYLE}`, '1024x1024');
      const out = await sharp(buf).resize(900).webp({ quality: 85 }).toBuffer();
      const path = `${outDir}/${item.file}.webp`;
      await writeFile(path, out);
      ok++;
      console.log(`OK: ${path} (${Math.round(out.length / 1024)}KB)`);
    } catch (e) {
      console.error(`FAIL: ${item.file} - ${String(e).slice(0, 200)}`);
    }
  }
}
console.log(`完了: ${ok}/${spec.length} 枚生成`);
if (ok === 0) process.exit(1);
