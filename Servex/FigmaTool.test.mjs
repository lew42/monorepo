// node Servex/FigmaTool.test.mjs — the figma pass-through against a mock Figma MCP server: session reuse and re-init, JSON and event-stream
// answers, content passed through unchanged (images too), the claim check, force, the 401 line, and that the token is never leaked.
import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import http from "http";
import FigmaTool from "./FigmaTool.js";
import { Claims } from "./agents/claims.js";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-test-"));
const SECRET = "tok-SECRET-123", CLIENT_SECRET = "client-SECRET-456";
const credentials = path.join(dir, "credentials.json");
const login = token => fs.writeFileSync(credentials, JSON.stringify({ mcpOAuth: { "figma|abc": { serverName: "figma", accessToken: token, refreshToken: "refresh-SECRET", clientSecret: CLIENT_SECRET, expiresAt: 4e12 }, "other|x": { serverName: "other", accessToken: "nope" } } }));
login(SECRET);
const credentials_before = fs.readFileSync(credentials, "utf8");

const seen = [];                  // every request the mock got: { method, tool, auth, sid }
let inits = 0, drop_session = false, token_ok = SECRET, stateless = false;
const PIXEL = Buffer.from("fake png bytes").toString("base64");
const TOOLS = [
	{ name: "whoami", description: "who", inputSchema: { type: "object" }, annotations: { readOnlyHint: true } },
	{ name: "get_screenshot", description: "shot", inputSchema: { type: "object" }, annotations: { readOnlyHint: true } },
	{ name: "use_figma", description: "run code", inputSchema: { type: "object" }, annotations: { readOnlyHint: false, destructiveHint: true } },
	{ name: "create_session", description: "open", inputSchema: { type: "object" }, annotations: { readOnlyHint: false } },
];
const server = http.createServer((req, res) => {
	let b = ""; req.on("data", d => b += d); req.on("end", () => {
		const m = JSON.parse(b), sid = req.headers["mcp-session-id"];
		seen.push({ method: m.method, tool: m.params?.name, auth: req.headers.authorization, sid });
		if (req.headers.authorization !== "Bearer " + token_ok){ res.writeHead(401).end("unauthorized"); return; }
		const sse = o => res.writeHead(200, { "content-type": "text/event-stream" }).end(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: m.id, ...o })}\n\n`);
		const json = o => res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", id: m.id, ...o }));
		if (m.method === "initialize"){ inits++; if (!stateless) res.setHeader("mcp-session-id", "sess-" + inits); return sse({ result: { protocolVersion: "2025-06-18", capabilities: {}, serverInfo: { name: "mock" } } }); }
		if (m.id == null){ res.writeHead(202).end(); return; }
		if (drop_session && sid){ drop_session = false; res.writeHead(404).end("session not found"); return; }
		if (m.method === "tools/list") return sse({ result: { tools: TOOLS } });
		if (m.method === "resources/list") return json({ result: { resources: [{ uri: "skill://x/SKILL.md", name: "x" }] } });
		if (m.method === "resources/read") return json({ result: { contents: [{ uri: m.params.uri, mimeType: "text/markdown", text: "# the skill" }] } });
		if (m.method === "tools/call"){
			const { name, arguments: a } = m.params;
			if (name === "get_screenshot") return sse({ result: { content: [{ type: "text", text: "shot of " + a.nodeId }, { type: "image", data: PIXEL, mimeType: "image/png" }] } });
			if (name === "use_figma" && a.code === "boom") return sse({ result: { isError: true, content: [{ type: "text", text: "Error: boom at line 1" }] } });
			if (name === "use_figma" && a.code === "rpc-error") return sse({ error: { code: -32602, message: "bad arguments" } });
			return json({ result: { content: [{ type: "text", text: JSON.stringify({ name, a }) }] } });
		}
		json({ error: { code: -32601, message: "no " + m.method } });
	});
}).listen(0, "127.0.0.1");
await new Promise(r => server.once("listening", r));
const url = `http://127.0.0.1:${server.address().port}/mcp`;

const claims = new Claims({ file: path.join(dir, "claims.json"), agents: { live: new Map([["mastermind-a", { state: "working" }]]) } });
const log_file = path.join(dir, "calls.jsonl");
const t = new FigmaTool({ url, credentials, claims, log_file });
const tool = t.definition(), call = (a, ctx = { caller: "voice-app" }) => tool.handler(a, ctx);
const text = r => r.content.map(c => c.text).join("\n");

// list: names, one definition, all; one initialize served them all
assert.match(await call({ list: "names" }), /use_figma \[writes\]: run code/);
assert.match(await call({ list: "names" }), /whoami: who/);
assert.equal(JSON.parse(await call({ list: true })).length, 4);
assert.equal(JSON.parse(await call({ list: "use_figma" })).name, "use_figma");
await assert.rejects(() => call({ list: "nope" }), /no tool nope/);
assert.equal(inits, 1, "one session, reused");

// a read and an image come back unchanged
const who = await call({ tool: "whoami", args: {} });
assert.deepEqual(JSON.parse(who.content[0].text), { name: "whoami", a: {} });
const shot = await call({ tool: "get_screenshot", args: { fileKey: "K1", nodeId: "1:2" } });
assert.deepEqual(shot.content, [{ type: "text", text: "shot of 1:2" }, { type: "image", data: PIXEL, mimeType: "image/png" }]);
assert.ok(!shot.isError);
assert.ok(seen.filter(s => s.method === "tools/call").every(s => s.sid === "sess-1"));

// Figma's own error text comes back readable; a JSON-RPC error is thrown as text
const boom = await call({ tool: "use_figma", args: { fileKey: "K1", code: "boom" } });
assert.equal(boom.isError, true); assert.match(text(boom), /boom at line 1/);
await assert.rejects(() => call({ tool: "use_figma", args: { fileKey: "K1", code: "rpc-error" } }), /bad arguments/);

// resources
assert.equal(JSON.parse(await call({ resources: true }))[0].uri, "skill://x/SKILL.md");
assert.equal(text(await call({ resource: "skill://x/SKILL.md" })), "# the skill");

// an expired session is opened again, once, and the call still answers
drop_session = true;
const again = await call({ tool: "whoami", args: {} });
assert.equal(inits, 2, "re-initialized"); assert.deepEqual(JSON.parse(again.content[0].text).name, "whoami");
assert.equal(seen.at(-1).sid, "sess-2");

// the claim check: another live agent holds the file
claims.claim({ thing: "figma:K1", change: "restyle the header", agent: "mastermind-a", card: "c9" });
const blocked = await call({ tool: "use_figma", args: { fileKey: "K1", code: "ok" } });
assert.equal(blocked.isError, true);
const b = JSON.parse(blocked.content[0].text);
assert.equal(b.blocked, true); assert.equal(b.holder, "mastermind-a"); assert.ok(b.since); assert.match(b.why, /Nothing was sent/);
const calls_before = seen.filter(s => s.method === "tools/call").length;
await call({ tool: "use_figma", args: { fileKey: "K1", code: "ok" } });   // blocked again: nothing sent
assert.equal(seen.filter(s => s.method === "tools/call").length, calls_before, "a blocked write sends nothing to Figma");
assert.equal(JSON.parse(text(await call({ tool: "whoami", args: { fileKey: "K1" } }))).name, "whoami", "a read is never blocked");
assert.ok(!(await call({ tool: "get_screenshot", args: { fileKey: "K1", nodeId: "1:1" } })).isError, "a read is never blocked");
assert.ok(!(await call({ tool: "create_session", args: { fileKey: "K1", description: "x" } })).isError, "a session is not a write to the file");
assert.ok(!(await call({ tool: "use_figma", args: { fileKey: "K2", code: "ok" } })).isError, "another file is free");
assert.ok(!(await call({ tool: "use_figma", args: { fileKey: "K1", code: "ok" } }, { caller: "mastermind-a" })).isError, "the holder itself writes");
claims.release({ thing: "figma:K1", agent: "mastermind-a" });
claims.claim({ thing: "figma:K1/16:1195", agent: "mastermind-a" });
assert.equal((await call({ tool: "use_figma", args: { fileKey: "K1", code: "ok" } })).isError, true, "a page-level claim also holds the file");
const forced = await call({ tool: "use_figma", args: { fileKey: "K1", code: "ok" }, force: true });
assert.ok(!forced.isError); assert.match(text(forced), /forced past the claim held by mastermind-a/);
claims.release({ thing: "figma:K1/16:1195", agent: "mastermind-a" });
claims.claim({ thing: "figma:K1", agent: "mastermind-gone" });   // a holder that is not live is stale: no block
assert.ok(!(await call({ tool: "use_figma", args: { fileKey: "K1", code: "ok" } })).isError, "a stale claim does not block");
assert.equal(FigmaTool.file_key({ url: "https://www.figma.com/design/AbC123/Name?node-id=1-2" }), "AbC123");

// the count and the log: tool calls only, and nothing secret anywhere
const status = JSON.parse(await call({ status: true }));
assert.ok(status.calls.today >= 8 && status.calls.limit_day === 200 && status.calls.limit_minute === 10);
const logged = fs.readFileSync(log_file, "utf8");
assert.ok(logged.includes('"tool":"use_figma"') && logged.includes("blocked_by"));
for (const secret of [SECRET, CLIENT_SECRET, "refresh-SECRET"]) assert.ok(!logged.includes(secret) && !JSON.stringify(status).includes(secret), "the log and status never hold the login");
assert.equal(new FigmaTool({ url, credentials, log_file }).counts().today, status.calls.today, "the day's count survives a restart");

// a 401: the login file is read again once, then one clear line, and the file is never written
token_ok = "someone-else";
t.reset();
await assert.rejects(() => call({ tool: "whoami", args: {} }), e => /login on the PC has expired/.test(e.message) && !e.message.includes(SECRET));
login(SECRET);                                   // Claude Code refreshed it: the next call just works
token_ok = SECRET;
assert.equal(JSON.parse((await call({ tool: "whoami", args: {} })).content[0].text).name, "whoami");
await assert.rejects(() => new FigmaTool({ url, credentials: path.join(dir, "missing.json"), log_file }).handle({ tool: "whoami" }), /cannot read the Claude Code login/);
fs.writeFileSync(credentials, credentials_before);

// a stateless Figma (no session id, as it is today): initialized once, never again
stateless = true; t.reset(); inits = 0;
await call({ tool: "whoami", args: {} }); await call({ tool: "whoami", args: {} }); await call({ list: "names" });
assert.equal(inits, 1, "stateless: one initialize"); assert.equal(JSON.parse(await call({ status: true })).session_open, true);

// usage errors
await assert.rejects(() => call({}), /give `tool`/);
assert.equal(tool.name, "figma");

server.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log("ok");
