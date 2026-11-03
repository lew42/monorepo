#!/usr/bin/env node
/**
 * class CloseoutWalk — close a session properly (completion item 6, doc: public/framework/core/Task/doc/completion.md, "Closing a session").
 * Every open owner ask of one session record ends in one of: complete (with evidence the code found), stopped (noise or a duplicate, with the
 * reason), or deferred with a home and a decide-by time. Nothing is left idle with no owner. Haiku judges one prompt's asks per call and may read
 * the repo; CODE validates and writes: a `done` verdict needs evidence that exists (a repo path or a commit), a home must exist (else /framework/ai/).
 *
 *   node Server/CloseoutWalk.mjs <session-id-or-8hex> --dry          the groups (one per source prompt) and the cost estimate
 *   node Server/CloseoutWalk.mjs <session> [--limit 5] [--parallel 3]   judge the groups with no verdict yet -> <session folder>/closeout-walk.jsonl
 *   node Server/CloseoutWalk.mjs <session> --apply                   write the verdicts as lines into the session record (one pass, by "closeout-walk")
 *   node Server/CloseoutWalk.mjs <session> --counts                  verdict counts and what is still open
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Task from "../public/framework/core/Task/Task.js";
import PromptRecords from "./PromptRecords.mjs";
import PromptAudit from "./PromptAudit.mjs";
import SessionRecord from "./SessionRecord.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default class CloseoutWalk {

	static MODEL = "claude-haiku-5-5";
	static FILE = "closeout-walk.jsonl";
	static DEFAULT_HOME = "/framework/ai/";
	static DECIDE_DAYS = 7;
	static SYSTEM = `You close out an owner's dictation, one prompt at a time. You get the prompt and the open asks (tasks) that were split from it; most are fragments of one idea and some are not asks at all. You may read the repo (Read, Grep, Glob, git log) to find out whether each ask is already built. For EACH ask give one verdict:
- "done": it is built. Give "evidence": 1-3 repo paths (from the repo root, e.g. public/framework/core/Task/Task.js) or commit hashes that show it. You must have seen them exist.
- "duplicate": another ask in this list (or a module readme) already carries the same thing. Give "of": that ask's id. Use it for fragments that only restate or split a bigger ask.
- "noise": not an ask (a remark, a question already answered in conversation, filler). Say why.
- "open": real work not built yet. Give "home": the module folder that owns it as a site path (e.g. /framework/ai/, /framework/core/Task/, /framework/ux/Dictate/) and "why" it waits.
Reply with ONE JSON object only: {"verdicts":[{"id":"<ask id>","verdict":"done"|"duplicate"|"noise"|"open","why":"<one sentence>","evidence":[...],"of":"<id>","home":"<site path>"}]}, one entry per ask. Do not invent paths.`;

	constructor(ref, opts = {}){
		Object.assign(this, { root: ROOT, parallel: 3, limit: Infinity, ask: (p, o) => PromptRecords.ask(p, o), clock: () => Date.now() }, opts);
		this.located = opts.located ?? PromptAudit.locate(ref);
		this.folder = this.located.folder;
		this.log = SessionRecord.log_file(this.folder);
		if (!this.log) throw new Error(`no session record in ${this.folder}`);
		this.out = path.join(this.folder, CloseoutWalk.FILE);
	}

	lines(file = this.log){ return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }

	/** The open owner asks of the record, grouped by the prompt they came from: [{key, line, asks:[{id,title}]}]. Asks owned by a working agent are left to it. */
	groups(){
		const top = Task.replay(this.lines()), by = new Map();
		const walk = list => { for (const t of list ?? []){
			if (Task.is_child_session(t)) continue;
			const s = t.get_one("source");
			const open = t.state === "idle" && !t.get_one("agent") && !t.get_one("path");
			if (open && Task.is_owner_ask(t) && s && typeof s === "object"){
				const key = `${s.session}:${s.line}`, g = by.get(key) ?? by.set(key, { key, session: s.session, line: s.line, asks: [] }).get(key);
				g.asks.push({ id: t.id, title: t.get_one("title") ?? t.id, state: t.state });
			}
			walk(t._tasks);
		} };
		walk(top._tasks);
		return [...by.values()].sort((a, b) => a.line - b.line);
	}

	verdicts(){ return fs.existsSync(this.out) ? this.lines(this.out) : []; }
	prompt_text(session, line){
		try {
			const transcript = this.located.id === session ? this.located.transcript : PromptAudit.locate(String(session)).transcript;
			return (this.prompt_cache ??= new Map()).get(transcript)?.find(p => p.line === line)?.text ?? (this.prompt_cache.set(transcript, PromptAudit.prompts(transcript)), this.prompt_cache.get(transcript).find(p => p.line === line)?.text ?? null);
		} catch { return null; }
	}

	exists(e){
		e = String(e).trim().replace(/[:#].*$/, "");
		if (/^[0-9a-f]{7,40}$/.test(e)) return spawnSync("git", ["cat-file", "-e", e + "^{commit}"], { cwd: this.root, windowsHide: true }).status === 0;
		const rel = e.replace(/^\/+/, "");
		return !!rel && ["", "public"].some(b => fs.existsSync(path.join(this.root, b, rel)));
	}
	home_ok(h){ const rel = String(h ?? "").replace(/^\/+/, "").replace(/\/+$/, ""); return !!rel && fs.existsSync(path.join(this.root, "public", rel)); }

	/** Code decides what a model verdict is allowed to become. */
	settle(v, ids){
		const base = { id: v.id, why: String(v.why ?? "").slice(0, 300) };
		if (v.verdict === "done"){
			const ev = [].concat(v.evidence ?? []).map(String).filter(e => this.exists(e));
			if (ev.length) return { ...base, verdict: "done", evidence: ev };
			return { ...base, verdict: "open", home: CloseoutWalk.DEFAULT_HOME, why: `claimed done without evidence that exists (${base.why})` };
		}
		if (v.verdict === "duplicate") return ids.has(v.of) && v.of !== v.id ? { ...base, verdict: "duplicate", of: v.of } : { ...base, verdict: "open", home: this.home_ok(v.home) ? v.home : CloseoutWalk.DEFAULT_HOME, why: `duplicate of an unknown ask (${base.why})` };
		if (v.verdict === "noise") return { ...base, verdict: "noise" };
		return { ...base, verdict: "open", home: this.home_ok(v.home) ? v.home : CloseoutWalk.DEFAULT_HOME };
	}

	async judge(g){
		const text = this.prompt_text(g.session, g.line), ids = new Set(g.asks.map(a => a.id));
		const msg = `${text ? `The prompt (transcript line ${g.line}):\n${text.slice(0, 4000)}\n\n` : ""}The open asks split from it:\n${g.asks.map(a => JSON.stringify({ id: a.id, title: a.title })).join("\n")}`;
		const r = await this.ask(msg, { model: CloseoutWalk.MODEL, system: CloseoutWalk.SYSTEM, tools: ["Read", "Grep", "Glob", "Bash"], max_turns: 14 });
		const out = PromptAudit.json(r.text).verdicts ?? [], rows = [];
		for (const a of g.asks){
			const v = out.find(x => x.id === a.id);
			rows.push({ key: g.key, ...(v ? this.settle(v, ids) : { id: a.id, verdict: "open", home: CloseoutWalk.DEFAULT_HOME, why: "the judge gave no verdict for this ask" }), usd: +(r.usd / g.asks.length).toFixed(5) });
		}
		return rows;
	}

	async run(){
		const have = new Set(this.verdicts().map(v => v.id)), todo = this.groups().map(g => ({ ...g, asks: g.asks.filter(a => !have.has(a.id)) })).filter(g => g.asks.length).slice(0, this.limit);
		const queue = [...todo];
		const worker = async () => { for (let g; (g = queue.shift());){
			try { const rows = await this.judge(g); fs.appendFileSync(this.out, rows.map(r => JSON.stringify(r) + "\n").join("")); console.log(`✓ prompt L${g.line}: ${rows.length} asks`); }
			catch (e){ console.log(`✗ prompt L${g.line}: ${e.message}`); }
		} };
		await Promise.all(Array.from({ length: this.parallel }, worker));
		return this.counts();
	}

	counts(){
		const latest = new Map(this.verdicts().map(v => [v.id, v])), c = {};
		for (const v of latest.values()) c[v.verdict] = (c[v.verdict] ?? 0) + 1;
		const open = this.groups().flatMap(g => g.asks).filter(a => !latest.has(a.id)).length;
		return { verdicts: latest.size, ...c, no_verdict_yet: open, usd: +this.verdicts().reduce((s, v) => s + (v.usd ?? 0), 0).toFixed(3) };
	}

	/** One pass of lines into the session record: done -> complete (with evidence), duplicate/noise -> stop (with the reason), open -> a deferral with its home. */
	apply(){
		const latest = new Map(this.verdicts().map(v => [v.id, v])), at = new Date(this.clock()), by = "closeout-walk", ts = at.toISOString();
		const decide_by = new Date(this.clock() + CloseoutWalk.DECIDE_DAYS * 864e5).toISOString();
		const have = new Set(this.lines().filter(l => l.by === by).flatMap(l => Object.keys(l.tasks ?? {})));
		const open = new Set(this.groups().flatMap(g => g.asks).map(a => a.id)), out = [];
		for (const v of latest.values()){
			if (!open.has(v.id) || have.has(v.id)) continue;
			const verb = v.verdict === "done" ? { complete: { outcome: `already built: ${v.why}`, evidence: v.evidence, confidence: "medium", caveats: ["found by the closeout walk (Haiku read the repo); code checked the evidence exists"] } }
				: v.verdict === "duplicate" ? { stop: { note: `duplicate of ${v.of}: ${v.why}` } }
				: v.verdict === "noise" ? { stop: { note: `not an ask: ${v.why}` } }
				: { wait: { on: v.home, what: v.why || "not built yet", decide_by, deferred: true } };
			out.push({ tasks: { [v.id]: verb }, by, ts });
		}
		if (out.length) fs.appendFileSync(this.log, out.map(l => JSON.stringify(l) + "\n").join(""));
		return { written: out.length };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), arg = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
	const ref = argv.find(a => !a.startsWith("--") && a !== arg("--limit") && a !== arg("--parallel"));
	if (!ref){ console.log("usage: node Server/CloseoutWalk.mjs <session-id> [--dry|--apply|--counts] [--limit n] [--parallel n]"); process.exit(1); }
	const w = new CloseoutWalk(ref, { limit: arg("--limit") ? Number(arg("--limit")) : Infinity, parallel: Number(arg("--parallel") ?? 3) });
	if (argv.includes("--dry")){ const gs = w.groups(); console.log(JSON.stringify({ groups: gs.length, asks: gs.reduce((s, g) => s + g.asks.length, 0), est_usd: +(gs.length * 0.15).toFixed(2) })); }
	else if (argv.includes("--counts")) console.log(JSON.stringify(w.counts()));
	else if (argv.includes("--apply")) console.log(JSON.stringify(w.apply()));
	else console.log(JSON.stringify(await w.run()));
}
