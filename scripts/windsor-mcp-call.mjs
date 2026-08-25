#!/usr/bin/env node
/**
 * Windsor MCPサーバー（https://mcp.windsor.ai/）をStreamable HTTPで直接呼ぶ最小クライアント。
 * claude.ai側のコネクタが不調なときの書き込みバックアップ経路（GitHub Actionsから実行する想定）。
 *
 * 使い方: WINDSOR_API_KEY=... node scripts/windsor-mcp-call.mjs --tool <ツール名> --args '<JSON>'
 *   例: --tool list_actions --args '{"connector":"google_my_business"}'
 *       --tool execute_action --args '{"connector":"google_my_business","action":"create_local_post","account":"...","params":{...}}'
 */
const KEY = process.env.WINDSOR_API_KEY;
if (!KEY) { console.error('WINDSOR_API_KEY がありません'); process.exit(1); }
const argv = process.argv.slice(2);
const get = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const TOOL = get('--tool');
const ARGS = JSON.parse(get('--args') || '{}');
if (!TOOL) { console.error('--tool が必要です'); process.exit(1); }

const url = `${process.env.WINDSOR_MCP_URL || 'https://mcp.windsor.ai/'}?api_key=${encodeURIComponent(KEY)}`;
const H = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
  Authorization: `Bearer ${KEY}`,
  'X-API-Key': KEY,
};
let sid = null;

async function post(body, expectReply = true) {
  const headers = sid ? { ...H, 'Mcp-Session-Id': sid } : H;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) });
  sid = res.headers.get('mcp-session-id') || sid;
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  if (!expectReply) return null;
  // Streamable HTTPはSSE形式（data:行）またはプレーンJSONで返る
  const dataLines = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).filter(Boolean);
  const payload = dataLines.length ? dataLines[dataLines.length - 1] : text.trim();
  return payload ? JSON.parse(payload) : null;
}

const init = await post({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'zn-stretch-relay', version: '1.0' } },
});
if (init?.error) { console.error('initialize失敗:', JSON.stringify(init.error)); process.exit(1); }
await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, false);

const out = await post({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: TOOL, arguments: ARGS } });
if (out?.error) { console.error('tools/call失敗:', JSON.stringify(out.error)); process.exit(1); }
const content = out?.result?.content;
const text = Array.isArray(content) ? content.map((c) => c.text ?? JSON.stringify(c)).join('\n') : JSON.stringify(out?.result ?? out);
// 切り詰め幅は --max で指定できる（既定8000）。スキーマ調査時は大きくする
const MAX = Number(get('--max') || 8000);
console.log(MAX > 0 ? text.slice(0, MAX) : text);
if (out?.result?.isError) process.exit(1);
