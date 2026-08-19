#!/usr/bin/env node
/**
 * Googleビジネスプロフィール（GBP）「最新情報」投稿のドラフトを生成する。
 *
 * 直近に公開されたコラムから、docs/gbp-ops.md §1 の承認済みテンプレートに沿って
 * 投稿文・CTA・写真URLを組み立てる。LLMを使わない決定的な生成なので、
 * APIキーもクレジット残高も要らず、毎回同じ入力から同じ出力になる。
 * （コラム本文の言葉をそのまま使うため、品質GATEを通った表現しか出ない）
 *
 * 使い方:
 *   node scripts/gbp-post-draft.mjs                 # 直近7日に公開されたコラム
 *   node scripts/gbp-post-draft.mjs --days 14       # 期間を変える
 *   node scripts/gbp-post-draft.mjs --latest 3      # 期間に関係なく新しい順に3本
 *   node scripts/gbp-post-draft.mjs --json          # JSONで出力（Windsorのexecute_actionへ渡す用）
 *
 * 出力先: 標準出力。GitHub Actionsでは $GITHUB_STEP_SUMMARY へも書く。
 */
import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { findNg } from './yakkihou-ng.mjs';

const ORIGIN = 'https://zn-stretch-gifu.com';
// docs/gbp-ops.md の運用ルール。投稿の上限は1500字だが、
// 実際に読まれるのは冒頭のみなので提案書どおり150〜200字を目安に組む
const TARGET_LEN = 200;
const HARD_LIMIT = 1500;

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
};
const DAYS = Number(flag('days', 7));
const LATEST = argv.includes('--latest') ? Number(flag('latest', 3)) : 0;
const AS_JSON = argv.includes('--json');

/**
 * src/data/columns.ts を単一ソースとして読む。
 * TypeScriptのままではimportできないため、型注釈だけ取り除いてJSモジュールとして評価する。
 */
async function loadColumns() {
  const src = await readFile('src/data/columns.ts', 'utf8');
  const js = src
    .replace(/export type ColumnEntry = \{[\s\S]*?\n\};\n/, '')
    .replace(': ColumnEntry[]', '');
  const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const cols = mod.COLUMNS;
  if (!Array.isArray(cols) || cols.length === 0 || !cols[0].slug) {
    throw new Error('src/data/columns.ts から COLUMNS を読み取れませんでした（形式が変わった可能性）');
  }
  return cols;
}

/** 「◯◯（左右20〜30秒ずつ）：やり方…」から、投稿に載せる短い一言を作る */
function shortSelfCare(entry) {
  const first = (entry.selfCare || []).find((s) => !s.startsWith('頻度の目安'));
  if (!first) return null;
  // 「名前（回数）：手順」の名前部分だけを使う。手順まで載せると長くなりすぎる
  const name = first.split('：')[0].trim();
  return name || null;
}

/** 記事のdescから1〜2文を取り出す */
function leadSentences(desc) {
  const parts = desc.split('。').filter(Boolean);
  let out = '';
  for (const p of parts) {
    if (out.length + p.length + 1 > TARGET_LEN - 60) break;
    out += `${p}。`;
  }
  return out || `${parts[0]}。`;
}

async function photoUrlFor(slug) {
  // docs/gbp-ops.md：サムネは実写ではなくキャラクターのポーズイラスト（オーナー指示 2026-08-12）
  for (const cand of [`/images/gbp/${slug}-2.png`, `/images/gbp/${slug}.png`]) {
    try {
      await access(`public${cand}`);
      return `${ORIGIN}${cand}`;
    } catch {}
  }
  return null;
}

function buildSummary(entry) {
  const care = shortSelfCare(entry);
  const lines = [
    `【コラム更新】${entry.heading.split('｜')[0]}`,
    leadSentences(entry.desc),
  ];
  if (care) lines.push(`記事では「${care}」など、今日からできるセルフケアをご紹介しています。`);
  lines.push('岐阜市長良の個室パーソナルストレッチ専門店・全力ストレッチ岐阜長良店。');
  return lines.join('\n');
}

// ---------------------------------------------------------------- main

const columns = await loadColumns();
const sorted = [...columns].sort((a, b) => (a.date < b.date ? 1 : -1));

let targets;
if (LATEST > 0) {
  targets = sorted.slice(0, LATEST);
} else {
  const since = new Date(Date.now() + 9 * 3600 * 1000 - DAYS * 86400000).toISOString().slice(0, 10);
  targets = sorted.filter((c) => (c.updated ?? c.date) >= since);
  // 期間内に公開が無い週でも運用を止めないよう、最新1本にフォールバックする
  if (targets.length === 0) targets = sorted.slice(0, 1);
}

const drafts = [];
const problems = [];
for (const c of targets) {
  const summary = buildSummary(c);
  const ng = findNg(summary);
  if (ng.length) problems.push(`${c.slug}: 薬機法NG表現「${ng.join('」「')}」`);
  if (summary.length > HARD_LIMIT) problems.push(`${c.slug}: ${summary.length}字（GBPの上限${HARD_LIMIT}字超）`);
  drafts.push({
    slug: c.slug,
    published: c.date,
    summary,
    length: summary.length,
    cta_type: 'LEARN_MORE',
    cta_url: `${ORIGIN}/column/${c.slug}`,
    photo_url: await photoUrlFor(c.slug),
    language_code: 'ja',
  });
}

if (problems.length) {
  console.error('GBPドラフト生成: FAIL');
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

if (AS_JSON) {
  console.log(JSON.stringify({ generated_at: new Date().toISOString(), drafts }, null, 2));
} else {
  const md = [
    `# GBP「最新情報」投稿ドラフト（${drafts.length}件）`,
    '',
    'Googleビジネスプロフィール → 「最新情報」→ 投稿を作成 に貼り付けてください（1件3分）。',
    'GBP APIの利用申請が通れば、この内容をそのまま `create_local_post` に流して自動投稿できます。',
    '',
    ...drafts.flatMap((d) => [
      `## ${d.slug}（公開日 ${d.published}／${d.length}字）`,
      '',
      '```',
      d.summary,
      '```',
      '',
      `- ボタン: 詳しくはこちら（${d.cta_type}）`,
      `- リンク先: ${d.cta_url}`,
      d.photo_url
        ? `- 写真: ${d.photo_url}`
        : `- 写真: **未作成**（\`public/images/gbp/${d.slug}-2.png\` を用意すると自動で載ります）`,
      '',
    ]),
  ].join('\n');
  console.log(md);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import('node:fs/promises');
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
  }
}
