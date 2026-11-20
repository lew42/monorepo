// How big is the Servex tool list, on each door, and which tools are actually called?
// Usage: node Servex/tool-count.mjs [days=14] [--json]
// Reads the live tools/list on /mcp (local, as a minion and as a mastermind) and /mcp/remote (the claude.ai connector),
// then counts tool_use names in the Claude transcripts under ~/.claude/projects (mcp__servex__X, mcp__local__X,
// mcp__claude_ai_Servex__X, and call({tool: X}) through the dispatcher). No AI, no writes. Doc: public/framework/ai/doc/tool-collapse.md
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import readline from "node:readline";

const DAYS = Number(process.argv.find(a => /^\d+$/.test(a)) ?? 14), JSON_OUT = process.argv.includes("--json");
const TOK = chars => Math.round(chars / 3.5);   // rough: JSON-ish English+code is ~3.5 chars per token
const HOME = process.env.SERVEX_HOME ?? path.join(process.env.LOCALAPPDATA ?? os.homedir(), "lew42", "servex");

async function list(url, headers = {}){
	try {
		const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
			body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) });
		const tools = (await res.json()).result?.tools ?? [];
		const chars = JSON.stringify(tools).length;
		return { count: tools.length, chars, tokens: TOK(chars), names: tools.map(t => t.name) };
	} catch (e){ return { error: String(e.message || e) }; }
}

let token = null; try { token = fs.readFileSync(path.join(HOME, "remote.token"), "utf8").trim(); } catch {}
const doors = {
	local: await list("http://127.0.0.1:8090/mcp"),
	local_minion: await list("http://127.0.0.1:8090/mcp?as=minion-tool-count-probe&role=minion"),
	remote: token ? await list("http://127.0.0.1:8090/mcp/remote", { authorization: `Bearer ${token}` }) : { error: "no remote.token" },
};

// call counts from every transcript touched in the last DAYS days
const root = path.join(os.homedir(), ".claude", "projects"), since = Date.now() - DAYS * 864e5, files = [];
for (const d of fs.readdirSync(root)) if (/^c--Code-lew42/i.test(d))
	for (const f of fs.readdirSync(path.join(root, d))) if (f.endsWith(".jsonl")){
		const p = path.join(root, d, f); if (fs.statSync(p).mtimeMs >= since) files.push(p);
	}
const calls = {};
for (const p of files){
	const rl = readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity });
	for await (const line of rl){
		if (!line.includes('"tool_use"')) continue;
		for (const m of line.matchAll(/"name":"mcp__(?:servex|local|claude_ai_Servex)__(\w+)"(?:,"input":\{"tool":"(\w+)")?/g)){
			const n = m[1] === "call" && m[2] ? m[2] : m[1];
			calls[n] = (calls[n] ?? 0) + 1;
		}
	}
}
const ranked = Object.entries(calls).sort((a, b) => b[1] - a[1]);
const total = ranked.reduce((a, [, n]) => a + n, 0);

if (JSON_OUT) console.log(JSON.stringify({ at: new Date().toISOString(), days: DAYS, files: files.length, doors, total, calls: Object.fromEntries(ranked) }, null, 1));
else {
	for (const [door, v] of Object.entries(doors)) console.log(v.error ? `${door}: ${v.error}` : `${door}: ${v.count} tools listed, ${v.chars} chars (~${v.tokens} tokens)`);
	console.log(`transcripts: ${files.length} files in the last ${DAYS} days, ${total} Servex tool calls`);
	let run = 0; const at = p => ranked.findIndex(([, n]) => (run += n) >= p * total) + 1;
	run = 0; const p50 = at(.5); run = 0; const p80 = at(.8); run = 0; const p95 = at(.95);
	console.log(`tools that make 50% of calls: ${p50}, 80%: ${p80}, 95%: ${p95}`);
	console.log("TOP:", ranked.slice(0, 30).map(([n, c]) => `${n}=${c}`).join(" "));
	const listed = new Set(doors.local.names ?? []), never = [...listed].filter(n => !calls[n]);
	console.log(`listed on /mcp but never called in ${DAYS} days (${never.length}):`, never.join(" "));
}
