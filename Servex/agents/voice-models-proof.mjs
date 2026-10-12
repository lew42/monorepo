/* Proof (ai/2026-10-12/models-asks): on a private Servex the voice pieces run on a NON-Anthropic model, and fall back to Claude when
 * OpenRouter has no key. Ports 8390/8389/8388, throwaway LOCALAPPDATA (the real OpenRouter key is copied in for run A only).
 *   A  with a key:    /api/refine runs on openai/*, and a voice session's fast + smart agents are openai/*
 *   B  without a key: /api/refine falls back to claude-haiku-5-5, and the session agents are claude-*
 * Run: node Servex/agents/voice-models-proof.mjs   (costs a few cents) */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REAL_KEY = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "openrouter.key");
const base = "http://127.0.0.1:8390";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const post = async (url, body) => (await fetch(base + url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
const get = async url => (await fetch(base + url)).json();

async function run(label, with_key){
	const local = fs.mkdtempSync(path.join(os.tmpdir(), "voice-models-"));
	const home = path.join(local, "lew42", "servex"); fs.mkdirSync(home, { recursive: true });
	fs.writeFileSync(path.join(home, "dispatch.off"), "voice-models proof\n");
	if (with_key) fs.copyFileSync(REAL_KEY, path.join(home, "openrouter.key"));
	const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8390", SERVEX_PROXY_PORT: "8389", SERVEX_PROXY_INTERNAL: "8388", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8387" };
	for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "PORT", "SERVEX_SESSION_BACKEND", "SERVEX_OPENROUTER_PAUSED"]) delete env[k];
	const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: "ignore", windowsHide: true });
	const out = { label };
	try {
		for (let i = 0; i < 80; i++){ try { if (Array.isArray(await get("/api/agents"))) break; } catch {} await sleep(500); }
		if (with_key) await sleep(4000);   // the spend guard warms its cache at boot
		const t0 = Date.now();
		const r = await post("/api/refine", { text: "um so I want the, uh, rail to be narrower on phones. also the refine button is hidden under the footer." });
		out.refine = { ok: r.ok, ms: Date.now() - t0, models: [...new Set((r.runs ?? []).map(x => x.model))], cost_usd: +(r.runs ?? []).reduce((a, x) => a + (x.cost_usd || 0), 0).toFixed(5), sentences: r.clean?.sentences?.length, stages: r.stages, runs: (r.runs ?? []).map(x => `${x.stage} ${x.model} ${x.duration_ms}ms`) };
		out.session_probe = null;
		const s = await post("/api/session/new", { path: "/framework/ux/Dictate/", host: "proof.localhost" });
		out.session = s.session;
		const said = await post("/api/session/say", { session: s.session, text: "Proof ping: reply with the single word ok and do nothing else." });
		out.say = said.ok ?? said;
		for (let i = 0; i < 90; i++){   // wait for both agents to exist and the fast one to answer
			await sleep(1000);
			const agents = await get("/api/agents");
			out.agents = agents.filter(a => /^session-(fast|smart)/.test(a.id ?? a.role ?? "") || /^session-(fast|smart)$/.test(a.role ?? "")).map(a => ({ role: a.role, model: a.model }));
			const d = await get("/api/session/" + s.session).catch(() => null);
			const chat = JSON.stringify(d ?? ""); out.session_probe = chat.slice(0, 600);
			out.answered = /"from":\{"kind":"agent"/.test(chat) || /"kind":"fast"/.test(chat);
			if (out.agents.length >= 2 && out.answered) break;
		}
	} finally { child.kill(); await sleep(800); try { fs.rmSync(local, { recursive: true, force: true }); } catch {} }
	return out;
}

const A = await run("A with key", true);
console.log(JSON.stringify(A, null, 1));
const only_a = process.argv.includes("--a");   // B uses Claude (about $0.30)
const B = only_a ? null : await run("B no key", false);
if (B) console.log(JSON.stringify(B, null, 1));
const nonclaude = m => m && !String(m).startsWith("claude");
const ok = A.refine?.models?.length && A.refine.models.every(nonclaude) && A.agents?.length && A.agents.every(a => nonclaude(a.model))
	&& (only_a || B.refine?.ok && B.refine.models.every(m => String(m).startsWith("claude")) && B.agents?.every(a => String(a.model).startsWith("claude")));
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
