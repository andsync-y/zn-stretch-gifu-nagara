#!/usr/bin/env node
/**
 * コラム記事のアイキャッチ画像を調達するスクリプト。
 *
 *   node scripts/fetch-column-image.mjs --slug <slug> --source ai --prompt "..."
 *   node scripts/fetch-column-image.mjs --slug <slug> --source free --query "stretching legs"
 *
 * --source
 *   ai   … 画像生成API（OpenAI gpt-image-1）で生成する。要 OPENAI_API_KEY。
 *          ※人物を含む指示は禁止（後述のガードを参照）
 *   free … フリー素材を検索して取得する。
 *          PEXELS_API_KEY があれば Pexels（人物写真の質が高い）を使い、
 *          無ければ Openverse（CCライセンス・APIキー不要）にフォールバックする。
 *
 * 出力は public/images/column/<slug>.webp。
 * free の場合はクレジット文字列を stdout の最終行に "CREDIT: ..." として出力するので、
 * 記事の imageCredit プロップにそのまま渡すこと（ライセンス表示義務があるため必須）。
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// --- 引数パース -------------------------------------------------------------
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i]?.replace(/^--/, '');
  if (k) args[k] = process.argv[i + 1];
}
const { slug, source = 'ai', prompt, query } = args;

if (!slug) fail('--slug は必須です');
if (!/^[a-z0-9-]+$/.test(slug)) fail(`--slug の形式が不正です: ${slug}`);

const OUT = `public/images/column/${slug}.webp`;

function fail(msg) {
  console.error(`[fetch-column-image] エラー: ${msg}`);
  process.exit(1);
}

/**
 * 人物を含む画像を作らせないためのガード。
 * 実在しないトレーナー/客に見える画像は「創作しない」原則に反し、
 * ストレッチ姿勢をAIに描かせると解剖学的に破綻して誤ったフォームを教える危険があるため。
 */
const PERSON_WORDS = [
  'person', 'people', 'man', 'woman', 'human', 'body', 'trainer', 'therapist',
  'client', 'model', 'portrait', 'face', 'hand', 'leg', 'arm', 'shoulder',
  'stretching', 'massage', 'pose', 'yoga',
];

async function generateWithAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) fail('OPENAI_API_KEY が設定されていません（GitHub Secrets に登録してください）');
  if (!prompt) fail('--prompt は必須です');

  const lower = prompt.toLowerCase();
  const hit = PERSON_WORDS.filter((w) => new RegExp(`\\b${w}`).test(lower));
  if (hit.length > 0) {
    fail(
      `プロンプトに人物・身体・施術を示す語が含まれています（${hit.join(', ')}）。\n` +
      '  AI生成は「人物を含まない抽象・エディトリアル画像」に限定してください。\n' +
      '  施術シーンが必要な場合は、自店の実写真（/images/photos/*.webp）を使ってください。'
    );
  }

  // ブランドのトーン（生成り・黒・アンバーのエディトリアル）に寄せる共通指示
  const styled =
    `${prompt}. Editorial minimal still-life photography, no people, no text, no logos. ` +
    'Warm off-white paper background (#F7F5F0), soft natural side light, muted amber accent, ' +
    'calm and clean Japanese magazine aesthetic, generous negative space.';

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: styled,
      size: '1536x1024',
      output_format: 'webp',
      n: 1,
    }),
  });

  if (!res.ok) fail(`画像生成APIが失敗しました (${res.status}): ${(await res.text()).slice(0, 300)}`);

  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) fail('APIレスポンスに画像が含まれていません');

  await save(Buffer.from(b64, 'base64'));
  console.log('SOURCE: ai (OpenAI gpt-image-1)');
  console.log('CREDIT:'); // AI生成は出典表記不要（クレジット空）
}

/** Pexels（無料・要APIキー）。ストレッチ／ウェルネス系の人物写真の質が高い */
async function fetchFromPexels() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return false;

  const url =
    'https://api.pexels.com/v1/search?' +
    new URLSearchParams({ query, orientation: 'landscape', size: 'large', per_page: '10' });

  const res = await fetch(url, { headers: { authorization: key } });
  if (!res.ok) {
    console.error(`[fetch-column-image] Pexels検索が失敗 (${res.status})。Openverseにフォールバックします。`);
    return false;
  }

  const { photos = [] } = await res.json();
  const hit = photos.find((p) => p?.src?.landscape);
  if (!hit) {
    console.error(`[fetch-column-image] Pexelsで見つかりませんでした: "${query}"。Openverseにフォールバックします。`);
    return false;
  }

  const img = await fetch(hit.src.landscape);
  if (!img.ok) return false;

  await save(Buffer.from(await img.arrayBuffer()));
  console.log('SOURCE: pexels');
  console.log(`CREDIT: 写真：${hit.photographer ?? 'Pexels'}／Pexels`);
  return true;
}

async function fetchFromOpenverse() {
  if (!query) fail('--query は必須です');

  const url =
    'https://api.openverse.org/v1/images/?' +
    new URLSearchParams({
      q: query,
      license_type: 'commercial,modification', // 商用利用・改変が可能なものだけ
      aspect_ratio: 'wide',
      size: 'large',
      page_size: '10',
    });

  const res = await fetch(url, { headers: { 'user-agent': 'zn-stretch-gifu-column-bot/1.0' } });
  if (!res.ok) fail(`Openverse検索が失敗しました (${res.status})`);

  const { results = [] } = await res.json();
  const hit = results.find((r) => r.url);
  if (!hit) fail(`条件に合う画像が見つかりませんでした: "${query}"`);

  const img = await fetch(hit.url, { headers: { 'user-agent': 'zn-stretch-gifu-column-bot/1.0' } });
  if (!img.ok) fail(`画像のダウンロードに失敗しました (${img.status})`);

  await save(Buffer.from(await img.arrayBuffer()));

  const credit =
    `写真：${hit.title ?? '無題'}` +
    (hit.creator ? ` / ${hit.creator}` : '') +
    (hit.license ? `（${String(hit.license).toUpperCase()}${hit.license_version ?? ''}）` : '') +
    (hit.foreign_landing_url ? ` ${hit.foreign_landing_url}` : '');

  console.log('SOURCE: openverse');
  console.log(`CREDIT: ${credit}`);
}

async function save(buf) {
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, buf);
  console.log(`保存しました: ${OUT} (${Math.round(buf.length / 1024)}KB)`);
  console.log(`IMAGE_PATH: /images/column/${slug}.webp`);
}

if (source === 'ai') {
  await generateWithAI();
} else if (source === 'free') {
  if (!query) fail('--query は必須です');
  // Pexels優先（人物写真の質が高い）→ 取得できなければ Openverse
  if (!(await fetchFromPexels())) await fetchFromOpenverse();
} else {
  fail(`--source は ai か free を指定してください（指定値: ${source}）`);
}
