/**
 * Googleのサービスアカウントで access token を取る。依存パッケージなし（node:crypto のみ）。
 *
 * googleapis / google-auth-library を入れない理由:
 *   このリポジトリの本体はAstroサイトで、依存は astro / tailwind / sharp しかない。
 *   データ取得のためだけに数十MBの依存を持ち込むと、サイトのビルドまで巻き込んで遅くなる。
 *   やることは「JWTを1つ署名してトークンと交換する」だけなので、標準ライブラリで足りる。
 *
 * 必要な環境変数: GOOGLE_SERVICE_ACCOUNT_JSON（サービスアカウントキーのJSONをそのまま入れる）
 */
import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function readServiceAccount(env = process.env) {
  const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON がありません');
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON がJSONとして読めません（キー全体を貼り付けてください）');
  }
  if (!sa.client_email || !sa.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON に client_email / private_key がありません');
  }
  // GitHub Secretsに1行で貼られた場合、改行が \n という2文字のまま入っていることがある
  sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  return sa;
}

export function buildAssertion(sa, scope, nowSec) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope,
    aud: TOKEN_URL,
    iat: nowSec,
    exp: nowSec + 3600,
  };
  const body = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const sig = createSign('RSA-SHA256').update(body).end().sign(sa.private_key);
  return `${body}.${b64url(sig)}`;
}

/** scope 単位でトークンを使い回す（1実行で複数レポートを叩くため） */
const cache = new Map();

export async function getAccessToken(scope, env = process.env) {
  const hit = cache.get(scope);
  const now = Math.floor(Date.now() / 1000);
  if (hit && hit.expiresAt > now + 60) return hit.token;

  const sa = readServiceAccount(env);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildAssertion(sa, scope, now),
    }),
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`トークン取得に失敗 (${res.status}): ${text.slice(0, 300)}`);
  const json = JSON.parse(text);
  if (!json.access_token) throw new Error('レスポンスに access_token がありません');
  cache.set(scope, { token: json.access_token, expiresAt: now + (json.expires_in || 3600) });
  return json.access_token;
}

/** Windsorが返していた 'YYYY-MM-DD' に揃える。GA4は 'YYYYMMDD' で返してくる */
export function ga4DateToIso(v) {
  if (/^\d{8}$/.test(v)) return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  return v; // (other) など日付以外の値はそのまま通す
}

/** out/_summary.json に結果を足す。ファイルが無ければ作る */
export async function mergeSummary(entries) {
  const { readFile, writeFile, mkdir } = await import('node:fs/promises');
  await mkdir('out', { recursive: true });
  let summary = {};
  try {
    summary = JSON.parse(await readFile('out/_summary.json', 'utf8'));
  } catch {
    summary = { fetched_at: new Date().toISOString(), results: {} };
  }
  summary.results = { ...(summary.results || {}), ...entries };
  await writeFile('out/_summary.json', JSON.stringify(summary, null, 1));
}
