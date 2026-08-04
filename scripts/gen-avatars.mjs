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
  'Chic modern Japanese fashion-editorial illustration: confident thin dark line art, ' +
  'flat muted sophisticated palette (greige, sage green, rust, slate blue, cream), no gradients, ' +
  'minimal facial features drawn with elegant simplicity (small refined eyes, delicate nose line, soft smile, subtle blush), ' +
  'stylish contemporary hairstyle and fashionable minimalist clothing, refined Pinterest-like aesthetic, calm polished mood. ' +
  'Bust-up portrait, facing directly forward, head and shoulders centered, ' +
  'plain warm off-white background (#F2F1EC), generous margins around the figure. ' +
  'No text, no watermark, no logo, no frame.';

// 全7人をオシャレ寄りテイストで再生成（既存6人も刷新＋20代後半女性を追加）
const AVATARS = [
  { file: 'ai-f20', prompt: `Japanese woman in her late 20s with a stylish medium bob with see-through bangs, small gold earrings, wearing a fashionable cream blouse. ${STYLE}` },
  { file: 'ai-f40', prompt: `Japanese woman in her 40s with an elegant shoulder-length lob hairstyle, wearing a refined rust-terracotta top. ${STYLE}` },
  { file: 'ai-f50', prompt: `Japanese woman in her 50s with a sophisticated chin-length bob with a little grey, wearing a sage-green blouse. ${STYLE}` },
  { file: 'ai-m30', prompt: `Japanese man in his early 30s with a trendy neat center-parted short hairstyle, wearing a beige band-collar shirt. ${STYLE}` },
  { file: 'ai-m40', prompt: `Japanese man in his 40s with neatly styled short dark hair, wearing a smart-casual olive shirt. ${STYLE}` },
  { file: 'ai-m50', prompt: `Japanese man in his 50s with well-groomed grey-flecked short hair, wearing a slate-blue collared shirt. ${STYLE}` },
  { file: 'ai-m60', prompt: `Japanese man in his 60s with refined silver hair, wearing a light grey cardigan over a shirt, gentle dignified look. ${STYLE}` },
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
