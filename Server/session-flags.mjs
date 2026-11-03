#!/usr/bin/env node
// Server/session-flags.mjs — what each Claude session IS and what looks wrong with it, computed from the real transcripts.
//
//   node Server/session-flags.mjs            write sessions/session-flags.json once
//   node Server/session-flags.mjs --watch    rewrite it every 30 seconds (cheap: only files that changed are re-read)
//   SESSIONS_ROOT=<dir> to write into another tree's sessions/ folder (a worktree writes into the main tree's)
//
// Output { generated_at, rows: { <session id>: { role, mm, ep, ctx, last, hour_usd, model } } }
//   role      what it is, from the first prompt (see classify)        mm  1 when it is a mastermind
//   ctx       tokens the LAST turn read as context                    last  ISO time of the last transcript line
//   hour_usd  Claude $ priced for the last hour (only for files touched in the last 2 hours)
// The page (AISessionFlags.js) turns these numbers plus the live index into red flags. A session's record never changes here.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AISession from "../public/framework/ai/AISession/AISession.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.SESSIONS_ROOT || path.join(here, "..", "public", "framework", "ai", "sessions");
const OUT = path.join(OUT_DIR, "session-flags.json");
const PROJECTS = path.join(os.homedir(), ".claude", "projects");
const HEAD = 160 * 1024, TAIL = 400 * 1024, HOUR = 3600e3;

const read_part = (fd, pos, len) => { const b = Buffer.alloc(len); const n = fs.readSync(fd, b, 0, len, pos); return b.toString("utf8", 0, n); };
const lines_of = text => text.split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const text_of = c => typeof c === "string" ? c : Array.isArray(c) ? c.map(x => x?.text ?? "").join("\n") : "";

/** An agent id like "minion-kaq-comments" or "task-mastermind-foo" down to its role word. */
export function role_of_agent(name){
	const known = ["task-mastermind", "mastermind", "sub-mastermind", "master-assistant", "assistant", "minion", "reviewer", "clarity", "session-smart", "session-fast", "dispatcher", "auditor", "echo", "quickfix", "heartbeat"];
	for (const k of known) if (name === k || name.startsWith(k + "-")) return k;
	return name.split("-")[0];
}

/** What a session is, from its entrypoint and the first prompts. Anything the data does not say stays "(unknown)". */
export function classify(ep, prompts, id){
	const head = prompts.join("\n").slice(0, 6000);
	const mm_text = /Load the `?(?:servex-|sub-|task-)?mastermind`? skill|\/mastermind\b|you are the mastermind|You are a mastermind|You are (?:the )?[\w-]*mastermind/i.test(head);
	const agent = /You are Servex agent ([\w.-]+?)\.?\]/.exec(head)?.[1] ?? /Servex agent[: ]+([\w-]+)/.exec(head)?.[1];
	let role = null;
	if (agent) role = role_of_agent(agent);
	else if (/^echo-/.test(id)) role = "echo";
	else if (/You clean up one chunk of dictated|Fix ONLY:/.test(head)) role = "dictation cleanup";
	else if (/Read this numbered, cleaned transcript|Turn it into an outline/.test(head)) role = "outliner";
	else if (/you are a minion|Load the `?minion`? skill/i.test(head)) role = "minion";
	else if (ep === "claude-vscode") role = "vscode tab";
	else if (mm_text) role = "mastermind";
	else if (ep === "cli") role = "terminal";
	else if (ep === "sdk-ts" || ep === "sdk-cli") role = "sdk job";
	const mm = /mastermind/.test(role ?? "") || mm_text || (ep === "claude-vscode" && /\/mastermind|mastermind skill/i.test(head)) ? 1 : 0;
	return { role: role ?? "(unknown)", mm };
}

const cache = new Map();   // file -> { mtime, size, row }

function scan(file, id, now){
	const st = fs.statSync(file), hit = cache.get(file);
	if (hit && hit.mtime === st.mtimeMs && hit.size === st.size) return hit.row;
	const fd = fs.openSync(file, "r");
	let head, tail;
	try {
		head = lines_of(read_part(fd, 0, Math.min(HEAD, st.size)).replace(/\n[^\n]*$/, ""));
		const tpos = Math.max(0, st.size - TAIL);
		tail = lines_of(read_part(fd, tpos, st.size - tpos).replace(/^[^\n]*\n/, tpos ? "" : "$&"));
	} finally { fs.closeSync(fd); }
	const ep = head.find(o => o.entrypoint)?.entrypoint ?? null;
	const prompts = head.filter(o => o.type === "user" && !o.isSidechain && !o.isMeta).slice(0, 4).map(o => text_of(o.message?.content)).filter(Boolean);
	const { role, mm } = classify(ep, prompts, id);
	// the last turn's context, the last line's time, and (for a live file) the hour's $; one message id counts once (streaming repeats it)
	let ctx = null, model = null, last = null, hour_usd = 0;
	const seen = new Map();
	for (const o of tail){
		if (o.timestamp) last = o.timestamp;
		if (o.type !== "assistant" || o.isSidechain || !o.message?.usage) continue;
		seen.set(o.message.id ?? o.uuid, o);
	}
	const recent = now - st.mtimeMs < 2 * HOUR;
	for (const o of seen.values()){
		const u = o.message.usage;
		ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
		model = o.message.model ?? model;
		if (recent && Date.parse(o.timestamp) > now - HOUR){
			const p = AISession.price_for(o.message.model), cw = u.cache_creation_input_tokens || 0;
			hour_usd += ((u.input_tokens || 0) * p.in + (u.output_tokens || 0) * p.out + (u.cache_read_input_tokens || 0) * p.cache_read + cw * p.cache_write) / 1e6;
		}
	}
	const row = { role, mm, ep, ctx, last, model, hour_usd: Math.round(hour_usd * 100) / 100 };
	cache.set(file, { mtime: st.mtimeMs, size: st.size, row });
	return row;
}

export function build(){
	const now = Date.now(), rows = {};
	for (const dir of fs.readdirSync(PROJECTS)){
		let names; try { names = fs.readdirSync(path.join(PROJECTS, dir)); } catch { continue; }
		for (const f of names){
			if (!f.endsWith(".jsonl")) continue;
			const id = f.slice(0, -6);
			try { rows[id] = scan(path.join(PROJECTS, dir, f), id, now); } catch {}
		}
	}
	return { generated_at: new Date(now).toISOString(), count: Object.keys(rows).length, rows };
}

function write(){
	const out = build();
	fs.mkdirSync(OUT_DIR, { recursive: true });
	fs.writeFileSync(OUT + ".tmp", JSON.stringify(out));
	fs.renameSync(OUT + ".tmp", OUT);
	return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const out = write();
	const by = {}; let cost_unknown = 0;
	for (const r of Object.values(out.rows)) by[r.role] = (by[r.role] || 0) + 1;
	console.log(`${out.count} sessions -> ${OUT}\n` + Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${String(v).padStart(5)}  ${k}`).join("\n") + `\n  masterminds: ${Object.values(out.rows).filter(r => r.mm).length}`);
	if (process.argv.includes("--watch")) setInterval(write, 30000);
}
