import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { findNg, findNgDetailed, NG_PATTERNS } from '../yakkihou-ng.mjs';

const SCRIPT = new URL('../yakkihou-ng.mjs', import.meta.url).pathname;

/**
 * CLIを子プロセスで動かして {code, stdout} を返す。終了コード1でも例外にしない。
 * execFile の input オプションは使えない（stdinが閉じずCLIが待ち続ける）ため spawn で明示的に閉じる。
 */
function cli(input, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [SCRIPT, ...args], { stdio: ['pipe', 'pipe', 'inherit'] });
    let stdout = '';
    child.stdout.on('data', (c) => { stdout += c; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout }));
    child.stdin.end(input);
  });
}

test('findNg: 既存の呼び出し側の挙動を変えていない', () => {
  assert.deepEqual(findNg('肩こりが治る'), ['治る']);
  assert.deepEqual(findNg('肩まわりにアプローチする'), []);
});

test('findNgDetailed: 行番号と言い換え候補を返す', () => {
  const hits = findNgDetailed('1行目\n姿勢を矯正します\n3行目');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].term, '矯正');
  assert.equal(hits[0].line, 2);
  assert.ok(hits[0].suggestion.length > 0, '言い換え候補が空でない');
});

test('findNgDetailed: 同じ表現が複数回出れば回数ぶん返す', () => {
  const hits = findNgDetailed('矯正\n矯正');
  assert.equal(hits.length, 2);
  assert.deepEqual(hits.map((h) => h.line), [1, 2]);
});

test('findNgDetailed: 行番号順に並ぶ（パターンの定義順ではない）', () => {
  // 「根本改善」は定義の最後、「治る」は最初。出現順で返ること。
  const hits = findNgDetailed('根本改善します\n治る');
  assert.deepEqual(hits.map((h) => h.line), [1, 1, 2]);
});

test('全パターンに言い換え候補が用意されている', () => {
  // 検出だけして直し方が出ないパターンがあると、書き手が手詰まりになる
  const samples = ['治る', '効果がある', '改善します', '解消', '矯正', '効く', '完治', 'No.1', '絶対に治る', '必ず効く', '根本改善'];
  assert.equal(samples.length, NG_PATTERNS.length, 'サンプルがパターン数と一致');
  for (const s of samples) {
    const hits = findNgDetailed(s);
    assert.ok(hits.length > 0, `${s} が検出される`);
    assert.ok(!hits[0].suggestion.startsWith('（docs/'), `${s} に固有の言い換えがある`);
  }
});

test('CLI: NGがあれば終了コード1', async () => {
  const { code, stdout } = await cli('肩こりが治る');
  assert.equal(code, 1);
  assert.match(stdout, /NG「治る」/);
});

test('CLI: NGが無ければ終了コード0', async () => {
  const { code, stdout } = await cli('肩まわりにアプローチする');
  assert.equal(code, 0);
  assert.match(stdout, /NG表現なし/);
});

test('CLI: --json で機械可読な結果を返す', async () => {
  const { stdout } = await cli('姿勢を矯正します', ['--json']);
  const out = JSON.parse(stdout);
  assert.equal(out.ok, false);
  assert.equal(out.total, 1);
  assert.equal(out.results[0].hits[0].term, '矯正');
});
