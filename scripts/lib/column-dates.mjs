/**
 * コラム記事の公開日・更新日を src/pages/column/*.astro から読み取る。
 *
 * 用途は sitemap の <lastmod>（astro.config.mjs の serialize から呼ぶ）。
 * 各記事は日付を ColumnLayout の属性リテラル（datePublished="YYYY-MM-DD"）で
 * 持っているため、記事ファイル側を一切変更せずにここで抽出する。
 * 属性の書き方が変わって抽出できなくなった場合に静かに壊れないよう、
 * scripts/test/column-dates.test.mjs が実ファイルに対して形式を検査している。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const COLUMN_DIR = 'src/pages/column';

/**
 * @returns {Record<string, string>} slug → lastmod（dateModified があればそれ、無ければ datePublished）
 */
export function columnLastmods(dir = COLUMN_DIR) {
  const out = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.astro')) continue;
    const src = readFileSync(join(dir, file), 'utf8');
    const published = src.match(/\bdatePublished="(\d{4}-\d{2}-\d{2})"/)?.[1];
    if (!published) continue; // index.astro などの一覧ページは日付を持たない＝lastmod対象外
    const modified = src.match(/\bdateModified="(\d{4}-\d{2}-\d{2})"/)?.[1];
    out[file.replace(/\.astro$/, '')] = modified ?? published;
  }
  return out;
}
