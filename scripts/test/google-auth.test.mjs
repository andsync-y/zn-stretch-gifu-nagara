import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import { readServiceAccount, buildAssertion, ga4DateToIso } from '../lib/google-auth.mjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const PEM = privateKey.export({ type: 'pkcs8', format: 'pem' });

const fakeEnv = (overrides = {}) => ({
  GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
    client_email: 'bot@example.iam.gserviceaccount.com',
    private_key: PEM,
    ...overrides,
  }),
});

test('キーが無ければ分かるエラーで落とす', () => {
  assert.throws(() => readServiceAccount({}), /GOOGLE_SERVICE_ACCOUNT_JSON がありません/);
});

test('JSONとして壊れていれば指摘する', () => {
  assert.throws(
    () => readServiceAccount({ GOOGLE_SERVICE_ACCOUNT_JSON: 'not json' }),
    /JSONとして読めません/,
  );
});

test('client_email / private_key の欠落を検出する', () => {
  assert.throws(
    () => readServiceAccount({ GOOGLE_SERVICE_ACCOUNT_JSON: '{"client_email":"a@b.c"}' }),
    /client_email \/ private_key がありません/,
  );
});

test('Secretsに1行で貼られた \\n を実際の改行へ戻す', () => {
  const oneLine = JSON.stringify({
    client_email: 'bot@example.iam.gserviceaccount.com',
    private_key: PEM.replace(/\n/g, '\\n'),
  });
  const sa = readServiceAccount({ GOOGLE_SERVICE_ACCOUNT_JSON: oneLine });
  assert.ok(sa.private_key.includes('\n'), '改行が復元されていない');
  assert.ok(!sa.private_key.includes('\\n'), 'エスケープが残っている');
});

test('署名したJWTが公開鍵で検証でき、中身が正しい', () => {
  const sa = readServiceAccount(fakeEnv());
  const scope = 'https://www.googleapis.com/auth/analytics.readonly';
  const now = 1700000000;
  const jwt = buildAssertion(sa, scope, now);

  const [h, p, s] = jwt.split('.');
  assert.equal(jwt.split('.').length, 3);

  const ok = createVerify('RSA-SHA256')
    .update(`${h}.${p}`)
    .end()
    .verify(publicKey, Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
  assert.equal(ok, true, '署名が検証できない');

  const claim = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  assert.equal(claim.iss, 'bot@example.iam.gserviceaccount.com');
  assert.equal(claim.scope, scope);
  assert.equal(claim.aud, 'https://oauth2.googleapis.com/token');
  assert.equal(claim.iat, now);
  assert.equal(claim.exp, now + 3600);
});

test('base64urlは + / = を含まない', () => {
  const jwt = buildAssertion(readServiceAccount(fakeEnv()), 'scope', 1700000000);
  assert.ok(!/[+/=]/.test(jwt), 'base64urlになっていない');
});

test('GA4の YYYYMMDD を Windsor と同じ YYYY-MM-DD に直す', () => {
  assert.equal(ga4DateToIso('20260825'), '2026-08-25');
  assert.equal(ga4DateToIso('2026-08-25'), '2026-08-25'); // 二重変換しない
  assert.equal(ga4DateToIso('(other)'), '(other)'); // 日付以外はそのまま
});
