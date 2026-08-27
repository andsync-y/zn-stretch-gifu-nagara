/**
 * Googleの access token を取る。依存パッケージなし（node:crypto のみ）。
 *
 * googleapis / google-auth-library を入れない理由:
 *   このリポジトリの本体はAstroサイトで、依存は astro / tailwind / sharp しかない。
 *   データ取得のためだけに数十MBの依存を持ち込むと、サイトのビルドまで巻き込んで遅くなる。
 *   やることは「トークンを1回交換する」だけなので、標準ライブラリで足りる。
 *
 * 認証方式は2つ。上から順に使えるものを選ぶ。
 *
 *   1. **Workload Identity 連携（既定・推奨）**
 *      GitHub ActionsのOIDCトークンをGoogleのSTSで交換し、サービスアカウントを借用する。
 *      **鍵ファイルが存在しない**ので、GitHub Secretsに恒久的な認証情報を置かずに済む。
 *      2026-08-27にこちらへ寄せた。andsync.jp の組織ポリシー
 *      `iam.managed.disableServiceAccountKeyCreation` が鍵の発行をブロックしており、
 *      鍵方式は org 全体のセキュリティ設定を緩めないと使えなかったため。
 *      必要な環境変数:
 *        GCP_WORKLOAD_IDENTITY_PROVIDER … projects/<番号>/locations/global/workloadIdentityPools/<pool>/providers/<provider>
 *        GCP_SERVICE_ACCOUNT_EMAIL      … 借用するサービスアカウント
 *      （ワークフロー側に permissions: id-token: write が必要）
 *
 *   2. **サービスアカウントキー（フォールバック）**
 *      GOOGLE_SERVICE_ACCOUNT_JSON にキーJSONを丸ごと入れる。ローカル実行や、
 *      組織ポリシーが変わって鍵が使えるようになった場合の逃げ道として残してある。
 */
import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const STS_URL = 'https://sts.googleapis.com/v1/token';
const CLOUD_PLATFORM = 'https://www.googleapis.com/auth/cloud-platform';

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

/**
 * 環境変数を見て、どの認証方式を使うか決める。
 * 迷ったときに「なぜこの経路になったか」を言えるよう、判定を1か所に集めてある。
 */
export function pickAuthMode(env = process.env) {
  if (env.GCP_WORKLOAD_IDENTITY_PROVIDER && env.GCP_SERVICE_ACCOUNT_EMAIL) {
    if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
      throw new Error(
        'Workload Identity の設定はありますが、GitHubのOIDCトークンが取れません。' +
          'ワークフローに permissions: id-token: write がありますか',
      );
    }
    return 'wif';
  }
  if (env.GOOGLE_SERVICE_ACCOUNT_JSON) return 'key';
  throw new Error(
    '認証情報がありません（GCP_WORKLOAD_IDENTITY_PROVIDER + GCP_SERVICE_ACCOUNT_EMAIL、' +
      'または GOOGLE_SERVICE_ACCOUNT_JSON のどちらかが必要）',
  );
}

/** STSに渡す audience。プロバイダのリソース名の頭に // を付けたもの */
export function stsAudience(provider) {
  return `//iam.googleapis.com/${String(provider).replace(/^\/+/, '')}`;
}

async function githubOidcToken(env) {
  // audience は google-github-actions/auth と同じ既定値に合わせる。
  // プロバイダ作成時に allowed-audiences を指定しなければ、この値が受け付けられる
  const audience = `https://iam.googleapis.com/${env.GCP_WORKLOAD_IDENTITY_PROVIDER.replace(/^\/+/, '')}`;
  const url = `${env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${encodeURIComponent(audience)}`;
  const res = await fetch(url, {
    headers: { authorization: `bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GitHubのOIDCトークン取得に失敗 (${res.status}): ${text.slice(0, 200)}`);
  const value = JSON.parse(text).value;
  if (!value) throw new Error('OIDCレスポンスに value がありません');
  return value;
}

async function wifAccessToken(scope, env) {
  // 1) GitHubのOIDCトークンを取る
  const subjectToken = await githubOidcToken(env);

  // 2) GoogleのSTSで連携トークンに交換する（ここでは cloud-platform 固定。
  //    実際に欲しいスコープは次の借用ステップで指定する）
  const stsRes = await fetch(STS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      audience: stsAudience(env.GCP_WORKLOAD_IDENTITY_PROVIDER),
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
      requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      scope: CLOUD_PLATFORM,
      subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
      subjectToken,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const stsText = await stsRes.text();
  if (!stsRes.ok) throw new Error(`STSの交換に失敗 (${stsRes.status}): ${stsText.slice(0, 400)}`);
  const federated = JSON.parse(stsText).access_token;
  if (!federated) throw new Error('STSレスポンスに access_token がありません');

  // 3) サービスアカウントを借用して、目的のスコープのトークンを発行してもらう
  const sa = env.GCP_SERVICE_ACCOUNT_EMAIL;
  const impRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(sa)}:generateAccessToken`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${federated}`, 'content-type': 'application/json' },
      body: JSON.stringify({ scope: [scope], lifetime: '3600s' }),
      signal: AbortSignal.timeout(30000),
    },
  );
  const impText = await impRes.text();
  if (!impRes.ok) throw new Error(`サービスアカウントの借用に失敗 (${impRes.status}): ${impText.slice(0, 400)}`);
  const json = JSON.parse(impText);
  if (!json.accessToken) throw new Error('借用レスポンスに accessToken がありません');
  return { token: json.accessToken, expiresIn: 3600 };
}

async function keyAccessToken(scope, env, now) {
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
  return { token: json.access_token, expiresIn: json.expires_in || 3600 };
}

/** scope 単位でトークンを使い回す（1実行で複数レポートを叩くため） */
const cache = new Map();

export async function getAccessToken(scope, env = process.env) {
  const hit = cache.get(scope);
  const now = Math.floor(Date.now() / 1000);
  if (hit && hit.expiresAt > now + 60) return hit.token;

  const mode = pickAuthMode(env);
  const { token, expiresIn } =
    mode === 'wif' ? await wifAccessToken(scope, env) : await keyAccessToken(scope, env, now);

  cache.set(scope, { token, expiresAt: now + expiresIn });
  return token;
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
