import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { columnLastmods } from '../lib/column-dates.mjs';

const files = readdirSync('src/pages/column').filter((f) => f.endsWith('.astro'));
const articles = files.filter((f) => readFileSync(`src/pages/column/${f}`, 'utf8').includes('datePublished='));

test('日付を持つ記事は全件抽出される（属性の書き方が変わると気づけるように）', () => {
  const map = columnLastmods();
  assert.equal(Object.keys(map).length, articles.length);
  assert.ok(articles.length >= 15, `記事が少なすぎる: ${articles.length}`);
});

test('抽出された日付はすべて YYYY-MM-DD', () => {
  for (const [slug, d] of Object.entries(columnLastmods())) {
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/, `${slug}: ${d}`);
  }
});

test('slug属性とファイル名が一致している（sitemap URLとの突合に使うため）', () => {
  for (const f of articles) {
    const src = readFileSync(`src/pages/column/${f}`, 'utf8');
    const slug = src.match(/\bslug="([^"]+)"/)?.[1];
    assert.equal(slug, f.replace(/\.astro$/, ''), f);
  }
});
