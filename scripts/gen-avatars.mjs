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

// 全7人を線画フラット（日本のゆるいフリー素材風）テイストで再生成
const AVATARS = [
  { file: 'ai-f20', prompt: `Japanese woman in her late 20s with a simple medium bob with straight bangs, wearing a white blouse with a soft sky blue cardigan. ${STYLE}` },
  { file: 'ai-f40', prompt: `Japanese woman in her 40s with shoulder-length hair loosely tied back, wearing a coral red top over a white shirt. ${STYLE}` },
  { file: 'ai-f50', prompt: `Japanese woman in her 50s with a chin-length bob with a little grey, wearing a white blouse with a mustard yellow scarf. ${STYLE}` },
  { file: 'ai-m30', prompt: `Japanese man in his early 30s with simple neat short dark hair, wearing a white hoodie. ${STYLE}` },
  { file: 'ai-m40', prompt: `Japanese man in his 40s with short dark hair, wearing a soft sky blue open shirt over a white t-shirt. ${STYLE}` },
  { file: 'ai-m50', prompt: `Japanese man in his 50s with grey-flecked short hair, wearing a white shirt with a light beige jacket. ${STYLE}` },
  { file: 'ai-m60', prompt: `Japanese man in his 60s with silver hair, wearing a white shirt under a simple dark navy cardigan, gentle look. ${STYLE}` },
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
