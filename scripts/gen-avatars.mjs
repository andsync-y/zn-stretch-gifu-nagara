#!/usr/bin/env node
/**
 * LPクチコミ用アバターイラストを OpenAI gpt-image-1 で生成する一時スクリプト。
 * GitHub Actions（gen-avatars.yml）から実行する想定。要 OPENAI_API_KEY。
 * 出力: public/images/avatars/ai-{m40,m50,f40}.webp（320px・webp圧縮済み）
 */
import { writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY がありません'); process.exit(1); }

// 参考テイスト：日本のフリー素材系フラットイラスト風（均一な細い線・白ベース＋差し色のみ・陰影なし）
const STYLE =
  'Simple flat Japanese stock-illustration style, like modern Japanese free illustration websites: ' +
  'clean uniform thin dark-navy outline on everything, completely flat solid fills with NO gradients and NO shading, ' +
  'clothing mostly white or off-white with exactly one flat accent color from this limited palette: soft sky blue, coral red, mustard yellow, or light beige. ' +
  'Very simplified friendly face: small black dot-like eyes, one tiny short nose line, small simple smile, no blush, no cheek color. ' +
  'Flat solid dark hair shape with minimal detail lines. Warm, approachable, casual everyday mood — NOT fashionable, NOT editorial. ' +
  'Bust-up portrait, facing directly forward, head and shoulders centered, ' +
  'plain pure white background, generous margins around the figure. ' +
  'No text, no watermark, no logo, no frame.';

// クチコミ2段マーキー化に伴う追加3人（既存7人と同テイスト）
const AVATARS = [
  { file: 'ai-m20', prompt: `Japanese man in his early 20s with a simple fresh short haircut, wearing a white t-shirt with a coral red open shirt. ${STYLE}` },
  { file: 'ai-m35', prompt: `Japanese man in his mid 30s with neat short dark hair and simple thin round glasses, wearing a white shirt with a light beige cardigan. ${STYLE}` },
  { file: 'ai-f30', prompt: `Japanese woman in her early 30s with a simple low ponytail with side bangs, wearing a white blouse with a soft sky blue scarf. ${STYLE}` },
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
