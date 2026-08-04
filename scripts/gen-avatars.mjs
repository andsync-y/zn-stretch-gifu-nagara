#!/usr/bin/env node
/**
 * LPクチコミ用アバターイラストを OpenAI gpt-image-1 で生成する一時スクリプト。
 * GitHub Actions（gen-avatars.yml）から実行する想定。要 OPENAI_API_KEY。
 * 出力: public/images/avatars/ai-{m40,m50,f40}.webp（320px・webp圧縮済み）
 */
import { writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY がありません'); process.exit(1); }

// 参考テイスト：日本のストックイラスト風（細い茶系の線・くすみカラー・フラット）
const STYLE =
  'Flat Japanese lifestyle stock illustration style: clean thin dark-brown outlines of uniform width, ' +
  'flat muted dusty colors (beige, olive green, terracotta, dusty grey-blue), absolutely no gradients or shading, ' +
  'simple minimal facial features (small simple eyes, tiny nose, gentle friendly smile), warm approachable mood. ' +
  'Bust-up portrait, facing directly forward, head and shoulders centered, ' +
  'plain very light warm-grey background (#F2F1EC), generous margins around the figure. ' +
  'No text, no watermark, no logo, no frame.';

// 追加分のみ（既存の ai-m40 / ai-m50 / ai-f40 は再生成しない）
const AVATARS = [
  { file: 'ai-m30', prompt: `Japanese man in his early 30s with short dark hair, wearing a plain mustard-beige crew-neck top. ${STYLE}` },
  { file: 'ai-m60', prompt: `Japanese man in his 60s with grey hair, wearing a light grey cardigan over a shirt. ${STYLE}` },
  { file: 'ai-f50', prompt: `Japanese woman in her 50s with a chin-length dark bob with a little grey, wearing a dusty olive-green blouse. ${STYLE}` },
];

await mkdir('public/images/avatars', { recursive: true });
const sharp = (await import('sharp')).default;

for (const a of AVATARS) {
  console.log(`生成中: ${a.file} ...`);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt: a.prompt, size: '1024x1024', quality: 'medium', n: 1 }),
  });
  if (!res.ok) { console.error(`${a.file} 失敗 (${res.status}): ${(await res.text()).slice(0, 300)}`); process.exit(1); }
  const b64 = (await res.json())?.data?.[0]?.b64_json;
  if (!b64) { console.error(`${a.file}: レスポンスに画像なし`); process.exit(1); }
  const out = await sharp(Buffer.from(b64, 'base64')).resize(320, 320).webp({ quality: 85 }).toBuffer();
  await writeFile(`public/images/avatars/${a.file}.webp`, out);
  console.log(`保存: public/images/avatars/${a.file}.webp (${Math.round(out.length / 1024)}KB)`);
}
console.log('完了');
