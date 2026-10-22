#!/usr/bin/env node
/**
 * class RefineQueue — refines the owner's past prompts, ONE prompt per Haiku call, at most N calls at once.
 * Node starts the next call when one finishes, so no agent's context ever holds the loop (CLAUDE.md law 7).
 * Each result is a `refined` card (ext/Refine/RefinedCard.js) written onto that session's own page through
 * the page tool's own `page_add` handler, so the session page's Coverage tab draws it live. Doc: ext/Refine/doc/refine-queue.md.
 *
 *   node Server/RefineQueue.mjs --days 7 --dry               # the queue, newest first, and its estimated cost; nothing spent
 *   node Server/RefineQueue.mjs --days 7 --limit 10          # refine the 10 newest owner prompts not yet refined
 *   node Server/RefineQueue.mjs <session-uuid>:<line> ...    # exactly these prompts (line = 1-based line of the session's transcript)
 *   node Server/RefineQueue.mjs --task <dir>                 # the owner's `chat` lines in a task.jsonl instead
 *   node Server/RefineQueue.mjs --report                     # cost per prompt and max tokens, computed from the run log
 *   node Server/RefineQueue.mjs --repeats [--min 3]          # asks said in 3+ sessions: promotion candidates (ext/Refine/doc/refine-queue.md, "Promotion")
 *   flags: --parallel N (default 2) · --budget $ (stop when spent) · --brief v1|v2 (default v2) · --force (redo refined ones) · --since YYYY-MM-DD
 *
 * Owner prompts = the user turns of VS Code tabs' transcripts (`entrypoint: claude-vscode`), minus agent relays
 * (`[from: …]`, `[You are …]`), compaction summaries and slash-command echoes. The transcript text is never copied
 * into a committed file: the card links to it (`/ai-logs/<id>#<line>`); the committed asks index holds one line per ask.
 * Every Node spawn (the SDK's) sets `windowsHide: true` in the SDK itself; this file starts no process of its own.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import RefinedCard from "../public/framework/ext/Refine/RefinedCard.js";
import AskIndex from "./AskIndex.mjs";
import SessionRecord from "./SessionRecord.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

export default class RefineQueue {

	static MODEL = "claude-haiku-5-5";
	static CALLER = "refine-queue";
	static RUNS = path.join(ROOT, "public/framework/ext/Refine/queue/runs.jsonl");   // one line per call: cost, tokens, counts; no owner text
	static ASKS = path.join(ROOT, "public/framework/ext/Refine/queue/asks.jsonl");   // one line per ask: the committed index --repeats reads
	static MIN_CHARS = 30;   // shorter prompts ("try again?") hold no structure worth a call
	static PRICE = { in: 1 / 1e6, out: 5 / 1e6 };   // Haiku $/token, only for the --dry estimate; real cost comes from the SDK's result

	/** The tree whose Servex has the SDK installed and whose site serves the session pages: this one, or the main tree from a worktree. */
	static main_root(){
		if (fs.existsSync(path.join(ROOT, "Servex/node_modules/@anthropic-ai/claude-agent-sdk"))) return ROOT;
		const r = spawnSync("git", ["rev-parse", "--git-common-dir"], { cwd: ROOT, encoding: "utf8", windowsHide: true });
		return path.resolve(ROOT, r.stdout.trim(), "..");
	}

	/** The SDK transcripts of this repo (the same folder Server/plugins/AILogs.js serves as /ai-logs/). */
	static transcripts_dir(){
		return process.env.AI_LOGS_DIR ? path.resolve(process.env.AI_LOGS_DIR)
			: path.join(os.homedir(), ".claude", "projects", RefineQueue.main_root().replace(/[^a-zA-Z0-9]/g, "-"));
	}

	/** One user line → the owner's words, or null when it is not an owner prompt. */
	static owner_text(l){
		if (l?.type !== "user" || l.isMeta || l.isSidechain || l.turnOrigin === "task_notification") return null;
		const c = l.message?.content;
		if (Array.isArray(c) && c.some(b => b?.type === "tool_result")) return null;
		const t = typeof c === "string" ? c : Array.isArray(c) ? c.filter(b => b?.type === "text").map(b => b.text).join("\n") : "";
		const text = RefinedCard.strip(t);
		if (!text || /^<(command-|local-command|task-notification)/.test(text) || /^(Caveat:|\[from: |\[You are |This session is being continued)/.test(text)) return null;
		return text;
	}

	/** Every owner prompt in the VS Code transcripts touched since `since` (ms), newest first: { session, line, uuid, at, text }. */
	static find({ since }){
		const dir = RefineQueue.transcripts_dir(), out = [];
		for (const f of fs.readdirSync(dir)){
			if (!/^[0-9a-f-]{36}\.jsonl$/.test(f)) continue;
			const file = path.join(dir, f);
			if (fs.statSync(file).mtimeMs < since) continue;
			const text = fs.readFileSync(file, "utf8");
			if (!text.includes('"entrypoint":"claude-vscode"')) continue;
			const session = f.slice(0, 36);
			text.split("\n").forEach((raw, i) => {
				if (!raw.includes('"type":"user"')) return;
				let l; try { l = JSON.parse(raw); } catch { return; }
				if (l.entrypoint && l.entrypoint !== "claude-vscode") return;
				if (l.turnOrigin && l.turnOrigin !== "human") return;   // SDK/CLI calls inherit the VS Code entrypoint (ai/doc/prompt-audit.md, "Which prompts")
				const words = RefineQueue.owner_text(l);
				if (!words || Date.parse(l.timestamp) < since) return;
				out.push({ session, line: i + 1, uuid: l.uuid, at: l.timestamp, text: words });
			});
		}
		return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
	}

	/** Named prompts: `<uuid>:<line>` reads that line of the transcript. */
	static pick(refs){
		const dir = RefineQueue.transcripts_dir();
		return refs.map(ref => {
			const [session, n] = ref.split(":"), line = Number(n);
			const raw = fs.readFileSync(path.join(dir, session + ".jsonl"), "utf8").split("\n")[line - 1];
			const l = JSON.parse(raw), text = RefineQueue.owner_text(l);
			if (!text) throw new Error(`${ref} is not an owner prompt`);
			return { session, line, uuid: l.uuid, at: l.timestamp, text };
		});
	}

	/** The owner's chat lines in a task.jsonl: `ref.session` is the task dir, its link is the task log. */
	static from_task(dir){
		const file = SessionRecord.log_or_old(path.resolve(ROOT, dir));
		return fs.readFileSync(file, "utf8").split("\n").flatMap((raw, i) => {
			let l; try { l = JSON.parse(raw); } catch { return []; }
			const c = l.chat;
			return c?.from === "owner" && c.text ? [{ task: path.relative(ROOT, path.dirname(file)).replace(/\\/g, "/"), line: i + 1, at: c.at, text: c.text }] : [];
		});
	}

	constructor({ parallel = 2, budget = Infinity, brief = "v2", force = false, dry = false } = {}){
		Object.assign(this, { parallel, budget, brief, force, dry });
		this.spent = 0; this.done = 0; this.failed = 0; this.max_tokens = 0; this.stopped = null;
	}

	/** Lazy, from the main tree: the lean one-call runner (Servex/ext/refine/RefineCall.js) and the page tool's own handlers. */
	async tools(){
		if (this._tools) return this._tools;
		const main = RefineQueue.main_root(), load = p => import(pathToFileURL(path.join(main, p)).href);
		const [{ default: RefineCall }, { page_tools }, { default: AISession }] = await Promise.all([
			load("Servex/ext/refine/RefineCall.js"), load("Servex/agents/page_tools.js"), load("public/framework/ai/AISession/AISession.js")]);
		const tools = page_tools(), handler = name => tools.find(t => t.name === name).handler;
		return this._tools = { RefineCall, AISession, page_add: handler("page_add") };
	}

	/** The refined cards already on a session's page (computed from its page.jsonl, never remembered). */
	async existing(session){
		const { AISession } = await this.tools();
		if (!AISession.days.has(session)){ AISession.scanned = false; await AISession.scan?.(); }
		if (!AISession.days.has(session)) return new Map();
		const file = fileURLToPath(new URL("page.jsonl", AISession.dir_url(session)));
		if (!fs.existsSync(file)) return new Map();
		const lines = fs.readFileSync(file, "utf8").split("\n").flatMap(r => { try { return [JSON.parse(r)]; } catch { return []; } });
		return new Map(RefinedCard.from_lines(lines).map(c => [c.line, c]));
	}

	/** What will run: refined ones skipped (unless --force), short ones skipped; each with its estimated cost. */
	async plan(prompts){
		const seen = new Map(), out = [];
		let skipped = { refined: 0, short: 0 };
		for (const p of prompts){
			if (p.text.length < RefineQueue.MIN_CHARS){ skipped.short++; continue; }
			if (!this.force && p.session){
				if (!seen.has(p.session)) seen.set(p.session, await this.existing(p.session));
				if (seen.get(p.session).get(p.line)?.brief === this.brief){ skipped.refined++; continue; }
			}
			const tin = Math.ceil((RefinedCard.BRIEF[this.brief].length + p.text.length) / 3.6), tout = 500 + Math.ceil(p.text.length / 5);
			out.push({ ...p, est: tin * RefineQueue.PRICE.in + tout * RefineQueue.PRICE.out });
		}
		return { queue: out, skipped };
	}

	/** One prompt, one Haiku call (one retry when the answer is not usable JSON), one card. */
	async one(p){
		const { RefineCall, page_add } = await this.tools();
		const count = RefinedCard.sentences(p.text).length;
		let r, parsed, usd = 0, tokens = 0, error = null;
		for (let attempt = 0; attempt < 2 && !parsed; attempt++){
			r = await RefineCall.run(RefinedCard.prompt(p.text, this.brief), { model: RefineQueue.MODEL, system: RefinedCard.BRIEF[this.brief], stage: "refine-queue", cwd: os.tmpdir() });
			usd += r.cost_usd; tokens = Math.max(tokens, r.tokens.in + r.tokens.out);
			try { parsed = RefinedCard.parse(r.answer); error = null; } catch (e){ error = e.message; }
		}
		this.spent += usd; this.max_tokens = Math.max(this.max_tokens, tokens);
		const run = { at: new Date().toISOString(), session: p.session ?? p.task, line: p.line, chars: p.text.length, sentences: count,
			brief: this.brief, model: r.model, usd: +usd.toFixed(5), tokens, ms: r.duration_ms, minion: r.session_id, ok: !!parsed,
			...(parsed ? { asks: parsed.asks.length, uncited: RefinedCard.uncited(parsed, count).length } : { error }) };
		RefineQueue.append(RefineQueue.RUNS, run);
		if (!parsed){ this.failed++; return run; }
		const ref = { session: p.session ?? p.task, line: p.line, at: p.at, uuid: p.uuid };
		const item = { ...RefinedCard.item({ ref, parsed, count, brief: this.brief, model: r.model, usd: run.usd, tokens }), uuid: p.uuid, minion: r.session_id };
		if (p.session) await page_add({ path: `/framework/ai/sessions/${p.session}/`, item }, { caller: RefineQueue.CALLER });
		for (const a of parsed.asks) RefineQueue.append(RefineQueue.ASKS, { session: ref.session, line: ref.line, at: ref.at, id: a.id, ask: a.text.slice(0, 200), key: a.key, module: a.module, kind: a.kind, brief: this.brief });
		if (p.session) try { run.filed = new AskIndex({ root: RefineQueue.main_root() }).after_refine(ref, parsed); } catch (e){ run.filed_error = String(e.message ?? e).slice(0, 200); }   // record + cross off / module inbox (ext/Refine/doc/asks.md)
		this.done++;
		return run;
	}

	/** Runs the queue N at a time; a slot that frees starts the next prompt. Stops starting new ones at the budget. */
	async run(queue, { on_done } = {}){
		let next = 0;
		const slot = async () => {
			while (next < queue.length){
				if (this.spent >= this.budget){ this.stopped ??= queue[next]; return; }
				const p = queue[next++];
				try { on_done?.(await this.one(p), p); }
				catch (e){ this.failed++; RefineQueue.append(RefineQueue.RUNS, { at: new Date().toISOString(), session: p.session ?? p.task, line: p.line, ok: false, error: String(e.message ?? e).slice(0, 200) }); }
			}
		};
		await Promise.all(Array.from({ length: Math.max(1, this.parallel) }, slot));
		return this;
	}

	static append(file, obj){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, JSON.stringify(obj) + "\n"); }
	static read(file){ return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").flatMap(r => { try { return [JSON.parse(r)]; } catch { return []; } }) : []; }

	/** Cost per prompt and the biggest call, computed from the run log (`--brief` filters). */
	static report({ brief } = {}){
		const runs = RefineQueue.read(RefineQueue.RUNS).filter(r => r.ok && (!brief || r.brief === brief));
		const usd = runs.reduce((s, r) => s + r.usd, 0), max = runs.reduce((m, r) => Math.max(m, r.tokens ?? 0), 0);
		return { prompts: runs.length, usd: +usd.toFixed(4), per_prompt: runs.length ? +(usd / runs.length).toFixed(4) : 0, max_tokens: max,
			asks: runs.reduce((s, r) => s + (r.asks ?? 0), 0), sessions: new Set(runs.map(r => r.session)).size };
	}

	/** Asks said in `min`+ different sessions, grouped by their key's words: the promotion candidates (ext/Refine/doc/refine-queue.md, "Promotion"). */
	static repeats({ min = 3, today } = {}){
		const latest = new Map();   // a rerun of the same prompt replaces its asks (latest brief wins)
		for (const a of RefineQueue.read(RefineQueue.ASKS)) latest.set(`${a.session}:${a.line}:${a.id}`, a);
		const asks = [...latest.values()].filter(a => a.key), groups = [];
		for (const a of asks){
			const g = groups.find(g => g.module === a.module && RefinedCard.same_key(g.key, a.key));
			g ? g.asks.push(a) : groups.push({ key: a.key, module: a.module, asks: [a] });
		}
		return groups.map(g => ({ ...g, sessions: new Set(g.asks.map(a => a.session)).size, last: g.asks.map(a => a.at).sort().at(-1) }))
			.filter(g => g.sessions >= min && (!today || String(g.last).startsWith(today)))
			.sort((a, b) => b.sessions - a.sessions || b.asks.length - a.asks.length);
	}

	static args(argv){
		const a = { refs: [], days: null, since: null, limit: Infinity, parallel: 2, budget: Infinity, brief: "v2", min: 3 };
		for (let i = 0; i < argv.length; i++){
			const k = argv[i], v = () => argv[++i];
			if (k === "--days") a.days = +v(); else if (k === "--since") a.since = v(); else if (k === "--limit") a.limit = +v();
			else if (k === "--parallel") a.parallel = +v(); else if (k === "--budget") a.budget = +v(); else if (k === "--brief") a.brief = v();
			else if (k === "--task") a.task = v(); else if (k === "--min") a.min = +v(); else if (k === "--today") a.today = v();
			else if (k.startsWith("--")) a[k.slice(2)] = true; else a.refs.push(k);
		}
		if (!RefinedCard.BRIEF[a.brief]) throw new Error(`--brief must be one of ${Object.keys(RefinedCard.BRIEF).join(", ")}`);
		return a;
	}

	static async main(argv){
		const a = RefineQueue.args(argv);
		if (a.report){ console.log(JSON.stringify(RefineQueue.report({ brief: a.brief === "v2" && !argv.includes("--brief") ? undefined : a.brief }), null, 1)); return; }
		if (a.repeats){
			const today = a.today ?? (argv.includes("--all") ? null : new Date().toLocaleDateString("en-CA"));
			const rows = RefineQueue.repeats({ min: a.min, today });
			console.log(`${rows.length} ask(s) said in ${a.min}+ sessions${today ? `, last said ${today}` : ""}:`);
			for (const g of rows) console.log(`- ${g.sessions} sessions · ${g.module || "?"} · ${g.key} — e.g. "${g.asks.at(-1).ask}" (${[...new Set(g.asks.map(x => `${x.session.slice(0, 8)}:${x.line}`))].slice(0, 6).join(", ")})`);
			return;
		}
		const since = a.since ? Date.parse(a.since + "T00:00:00") : Date.now() - (a.days ?? 7) * 864e5;
		const prompts = a.task ? RefineQueue.from_task(a.task) : a.refs.length ? RefineQueue.pick(a.refs) : RefineQueue.find({ since });
		const q = new RefineQueue({ parallel: a.parallel, budget: a.budget, brief: a.brief, force: a.force || a.refs.length > 0, dry: a.dry });
		const { queue: all, skipped } = await q.plan(prompts);
		const queue = all.slice(0, a.limit), est = queue.reduce((s, p) => s + p.est, 0);
		console.log(`${prompts.length} owner prompts found; ${skipped.refined} already refined (brief ${a.brief}), ${skipped.short} under ${RefineQueue.MIN_CHARS} chars; ${queue.length} queued, ~$${est.toFixed(2)} estimated, ${a.parallel} at once.`);
		if (a.dry){
			for (const p of queue) console.log(`  ${p.at.slice(0, 16)} ${(p.session ?? p.task).slice(0, 8)}:${p.line}  ${String(p.text.length).padStart(6)} chars  ~$${p.est.toFixed(4)}`);
			return;
		}
		await q.run(queue, { on_done: (r, p) => console.log(`${r.ok ? "✓" : "✗"} ${String(r.session).slice(0, 8)}:${r.line}  ${r.chars ?? "?"} chars → ${r.asks ?? 0} asks, ${r.uncited ?? "?"} uncited  $${r.usd ?? 0}  ${r.tokens ?? 0} tok  (spent $${q.spent.toFixed(3)})`) });
		console.log(`done ${q.done}, failed ${q.failed}, spent $${q.spent.toFixed(3)}, max tokens per call ${q.max_tokens}${q.stopped ? `; budget reached, stopped before ${q.stopped.session.slice(0, 8)}:${q.stopped.line} (${q.stopped.at})` : ""}`);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	RefineQueue.main(process.argv.slice(2)).catch(e => { console.error(e.stack ?? e); process.exit(1); });
