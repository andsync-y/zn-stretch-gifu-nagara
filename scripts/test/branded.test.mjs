import test from 'node:test';
import assert from 'node:assert/strict';
import { isBranded, brandedLabel, normalizeQuery } from '../lib/branded.mjs';

test('店名を含むクエリは指名検索', () => {
  for (const q of [
    '全力ストレッチ',
    '全力ストレッチ 岐阜',
    '全力ストレッチ岐阜長良店',
    '全力 ストレッチ 長良 店', // 検索語がトークンに割れて返る場合
    'ぜんりょくストレッチ',
    'zenryoku stretch',
    'ＺＥＮＲＹＯＫＵ', // 全角
  ]) {
    assert.equal(isBranded(q), true, `指名と判定されるべき: ${q}`);
  }
});

test('一般語は非指名', () => {
  for (const q of [
    'ストレッチ 岐阜',
    '整体 岐阜市',
    'マッサージ',
    '肩甲骨はがし 専門店',
    'パーソナルストレッチ',
    '全力', // 店名として成立しない断片
    'ストレッチ専門店', // 「全力」を含まない
  ]) {
    assert.equal(isBranded(q), false, `非指名と判定されるべき: ${q}`);
  }
});

test('ラベルはWindsor時代の文字列に揃える', () => {
  assert.equal(brandedLabel('全力ストレッチ'), 'branded');
  assert.equal(brandedLabel('マッサージ 岐阜'), 'nonbranded');
});

test('正規化は空白・中黒を落として全角を半角にする', () => {
  assert.equal(normalizeQuery('全力　ストレッチ・岐阜'), '全力ストレッチ岐阜');
  assert.equal(normalizeQuery('ＺＮ Stretch'), 'znstretch');
});
