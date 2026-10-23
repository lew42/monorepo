#!/usr/bin/env node
/**
 * class UndoneAsks — which of the owner's asks are still undone, by module. Computed, never recalled (CLAUDE.md law 7).
 * Joins three records: the refined asks (<session>/asks.jsonl, Server/AskIndex.mjs) and the routed-asks ledger (ai/asks.jsonl)
 * against the module inboxes (<module>/inbox.jsonl) and the task homes (<module>/tasks/*\/task.jsonl).
 * Doc: public/framework/ai/asks/readme.md and public/framework/ai/doc/undone-asks-2026-10-17.md.
 *
 *   node Server/UndoneAsks.mjs                 print the table and the two totals
 *   node Server/UndoneAsks.mjs --json          also write public/framework/ai/asks/undone.json (the page reads it)
 *   --root <repo>  where the data lives (default: the repo this file is in)
 *   --out <file>   where --json writes
 *
 * A row is DONE when: its refined record says done; or a task with wording in common is complete/landed; or its ledger status is
 * landed/dropped, or its card is done/archived. UNROUTABLE: not done, and no module folder could carry it. Everything else is UNDONE.
 * Then settle() (after keep_owned carries the later verdicts) moves each open ask to what became of it: TASKED (it has a task; DONE once
 * that task is complete), CLOSED (the verifier found it built, or not work: the reason is in verified_evidence), NOTED (a line in its
 * module readme, `note`). What is left UNDONE or UNROUTABLE is the real backlog.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AskIndex from "./AskIndex.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FW = "public/framework";
const NONE = "(no module folder)";

export default class UndoneAsks {

	static OUT = "public/framework/ai/asks/undone.json";
	static LEDGER = "public/framework/ai/asks.jsonl";
	static CARDS = "public/framework/ai/cards.jsonl";
	static MIN_SHARED = 3;     // words an ask and a task title must share before the task counts as "the same work"
	static MIN_SHARE = 0.5;    // ... and that share of the ask's own words
	static DAY = 86400000;
	static OWNED = ["verified", "verified_evidence", "verified_looked", "verified_at", "verified_by", "verified_first", "verified_pass", "verified_kind", "owner_question", "task", "verified_module", "note"];   // written by Server/UndoneVerify.mjs and UndoneToTasks.mjs, carried across rebuilds by ask id (keep_owned)

	/** A stable id for an ask: the same prompt line and wording gives the same id on every rebuild. */
	static ask_id(r){ return crypto.createHash("sha1").update([r.kind, r.source, r.text_full].join("|")).digest("hex").slice(0, 10); }

	constructor({ root = HERE, now = Date.now() } = {}){
		this.root = root; this.now = now;
		this.index = new AskIndex({ root });
		this._inbox = new Map();
	}

	// ---- reading the records -----------------------------------------------------------------------

	static read(file){ return AskIndex.read(file); }
	static first_sentence(t){
		const s = String(t ?? "").replace(/\s+/g, " ").trim();
		return (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).slice(0, 220);
	}
	static rel(root, p){ return path.relative(root, p).split(path.sep).join("/"); }
	/** `public/framework/ux/Dictate` → `ux/Dictate`; folders outside the framework keep their repo path. */
	static label(mod){ return mod ? mod.replace(/^public\/framework\//, "") : NONE; }
	static url(mod){ return "/" + mod.replace(/^public\//, "") + "/"; }

	/** One module's inbox lines keyed `source|essence`, read straight from its inbox.jsonl (cached): { id, state, url }. */
	inbox_of(mod){
		if (this._inbox.has(mod)) return this._inbox.get(mod);
		const out = new Map(), file = path.join(this.root, mod, "inbox.jsonl");
		if (fs.existsSync(file)){
			const gone = new Set(UndoneAsks.read(file).filter(l => l.outcome?.id).map(l => l.outcome.id));
			for (const l of UndoneAsks.read(file)) if (l.essence) out.set(`${l.source}|${l.essence}`, { id: l.id, state: gone.has(l.id) ? "closed" : "unread", url: UndoneAsks.url(mod) + "inbox.jsonl" });
		}
		this._inbox.set(mod, out);
		return out;
	}

	/** A task.jsonl read as the state its own lines say: complete (a `complete` line or a landing), stopped, or open. */
	static task_state(lines){
		let st = "open";
		for (const l of lines){
			if (l.complete || l.set?.state === "complete" || l.set?.landed_at || l.assign?.landed_at) st = "complete";
			else if (l.stop && st !== "complete") st = "stopped";
		}
		return st;
	}

	/** Every task under a `tasks/` folder: { title, module, state, url }. */
	tasks(){
		const out = [], pub = path.join(this.root, "public"), skip = new Set(["node_modules", ".git", "sessions"]);
		const walk = (d, in_tasks, depth) => {
			let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			for (const e of es){
				if (!e.isDirectory() || skip.has(e.name) || e.name.startsWith(".") || depth > 8) continue;
				const p = path.join(d, e.name);
				if (in_tasks && fs.existsSync(path.join(p, "task.jsonl"))){
					const lines = UndoneAsks.read(path.join(p, "task.jsonl")), first = lines[0] ?? {};
					out.push({ title: first.title ?? e.name.replace(/-/g, " "), module: first.module ?? "", state: UndoneAsks.task_state(lines),
						url: "/" + UndoneAsks.rel(pub, p) + "/" });
				}
				walk(p, e.name === "tasks", depth + 1);
			}
		};
		walk(pub, false, 0);
		return out;
	}

	/** The best task whose title shares enough wording with `text`, or null. */
	match_task(text, tasks){
		const A = AskIndex.words(text);
		if (A.size < 3) return null;
		let best = null;
		for (const t of tasks){
			const n = [...AskIndex.words(t.title)].filter(w => A.has(w)).length;
			if (n >= UndoneAsks.MIN_SHARED && n / A.size >= UndoneAsks.MIN_SHARE && (!best || n > best.n)) best = { task: t, n };
		}
		return best?.task ?? null;
	}

	card_status(){
		return new Map(UndoneAsks.read(path.join(this.root, UndoneAsks.CARDS)).filter(c => c.id).map(c => [c.id, c.status]));
	}

	// ---- one row per ask ---------------------------------------------------------------------------

	days(at){ const t = Date.parse(at); return Number.isFinite(t) ? Math.max(0, Math.floor((this.now - t) / UndoneAsks.DAY)) : null; }

	/** { module, state, where, evidence } once a row's text is known. */
	classify(row, { tasks }){
		const hit = this.match_task(row.text, tasks);
		if (row.done) return { state: "done", where: { kind: "ledger", label: row.done }, evidence: row.done };
		if (hit?.state === "complete") return { state: "done", where: { kind: "task", label: "task: " + hit.title, url: hit.url }, evidence: "a complete task with the same words: " + hit.url };
		let where = { kind: "none", label: "open: no inbox line, no task" };
		const box = row.inbox ? this.inbox_of(row.inbox).get(`${row.source}|${row.text_full}`) : null;
		if (row.inbox) where = { kind: "inbox", label: box ? `module inbox (${box.state})` : "recorded as inboxed, line not found", url: box?.url ?? null };
		if (row.kind === "routed") where = { kind: "ledger", label: "ledger: " + row.status, url: row.card_url ?? null };
		if (hit) where = { kind: "task", label: `task ${hit.state}: ${hit.title}`, url: hit.url };
		return { state: row.module ? "undone" : "unroutable", where, evidence: null };
	}

	/** `at` of a folded record is its LAST update (AskIndex.records() merges later lines over the first); the queue index keeps the prompt's own time. */
	refined_rows(){
		const said = new Map(this.index.queue_rows().map(q => [`${q.session}|${q.line}|${q.id}`, q.at]));
		return [...this.index.records().values()].map(r => ({
			kind: "refined", session: r.session, line: Number(String(r.prompt_ref).split("#")[1]), at: said.get(`${r.session}|${String(r.prompt_ref).split("#")[1]}|${r.id}`) ?? r.at, text_full: r.ask, text: UndoneAsks.first_sentence(r.ask),
			module: this.index.module_of(r.module), status: r.status, inbox: r.status === "inboxed" ? r.inbox : null, done: r.status === "done" ? `refined record says done${r.done_by ? ": " + r.done_by : ""}` : null,
			source: AskIndex.link(r.session, Number(String(r.prompt_ref).split("#")[1])),
		}));
	}

	/** A ledger `words` path as a served url. Day folders moved (`ai/2026-09-30/x/` is now `ai/sessions/2026/09/30/x/`): follow it there, else the nearest folder that exists, else the ledger page. */
	words_url(words){
		if (!words || words.startsWith(".claude/")) return "/framework/ai/asks/";
		const m = String(words).match(/^(?:ai\/)?(\d{4})-(\d{2})-(\d{2})\/(.+)$/), ai = path.join(this.root, FW, "ai");
		if (!m) return "/framework/" + String(words).replace(/^\/+/, "");
		const day = path.join(ai, "sessions", m[1], m[2], m[3]), parts = m[4].split("/");
		for (let n = parts.length; n > 0; n--){
			const rel = parts.slice(0, n).join("/");
			if (fs.existsSync(path.join(day, rel))) return "/" + UndoneAsks.rel(path.join(this.root, "public"), path.join(day, rel)) + (n < parts.length ? "/" : "");
		}
		return "/framework/ai/asks/";
	}

	async routed_rows(){
		const { default: AskFold } = await import(pathToFileURL(path.join(HERE, FW, "ai/asks/AskFold.js")).href);
		const cards = this.card_status();
		return Object.values(AskFold.fold(UndoneAsks.read(path.join(this.root, UndoneAsks.LEDGER)))).map(a => {
			const prefix = String(a.title).split(":")[0], card = a.card ? cards.get(a.card) : null;
			const done = ["landed", "dropped"].includes(a.status) ? `ledger status ${a.status}` : ["done", "archived"].includes(card) ? `its card is ${card}` : null;
						return { kind: "routed", at: a.at, text_full: a.title, text: UndoneAsks.first_sentence(a.title), module: String(a.title).includes(":") ? this.index.module_of(prefix) : null,
				status: a.status, done, source: this.words_url(a.words), card_url: a.card ? "/framework/ai2/" + a.card + "/" : null };
		});
	}

	// ---- the join ----------------------------------------------------------------------------------

	async build(){
		const tasks = this.tasks_seen = this.tasks();
		const rows = [...this.refined_rows(), ...(await this.routed_rows())];
		const by = new Map(), totals = { done: 0, undone: 0, unroutable: 0 };
		for (const r of rows){
			const c = this.classify(r, { tasks }), mod = UndoneAsks.label(r.module);
			totals[c.state]++;
			const m = by.get(mod) ?? by.set(mod, { module: mod, url: r.module ? UndoneAsks.url(r.module) : null, done: 0, undone: 0, unroutable: 0, asks: [] }).get(mod);
			m[c.state]++;
			m.asks.push({ id: UndoneAsks.ask_id(r), kind: r.kind, state: c.state, text: r.text, at: r.at, days: this.days(r.at), source: r.source, status: r.status, where: c.where, evidence: c.evidence });
		}
		for (const m of by.values()) m.asks.sort((a, b) => (b.days ?? -1) - (a.days ?? -1));
		const modules = [...by.values()].sort((a, b) => (b.undone + b.unroutable) - (a.undone + a.unroutable) || a.module.localeCompare(b.module));
		// the two numbers: counted at the sources, and summed after classifying. They only agree if no ask was lost or counted twice.
		const counted = this.index.records().size + Object.keys((await import(pathToFileURL(path.join(HERE, FW, "ai/asks/AskFold.js")).href)).default.fold(UndoneAsks.read(path.join(this.root, UndoneAsks.LEDGER)))).length;
		const classified = totals.done + totals.undone + totals.unroutable;
		return { generated_at: new Date(this.now).toISOString(), counted, classified, agree: counted === classified, totals,
			sources: { refined: rows.filter(r => r.kind === "refined").length, routed: rows.filter(r => r.kind === "routed").length, tasks: tasks.length, inboxes: [...this._inbox.values()].filter(m => m.size).length, inbox_lines: [...this._inbox.values()].reduce((n, m) => n + m.size, 0) }, modules };
	}

	/**
	 * keep_owned: the daily rebuild keeps what later steps wrote. Reads the last written file, indexes its asks by ask id, and carries every
	 * field a later step owns (OWNED: the verifier's verdict fields and `task`) onto the rebuilt rows. A row whose ask no longer exists moves
	 * to `d.retired` with the date it left (nothing lost). Brief: ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-rebuild/requirements.md
	 * Returns { kept, retired } counts.
	 */
	static keep_owned(d, file){
		let old; try { old = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { kept: 0, retired: 0 }; }
		const had = new Map(old.modules.flatMap(m => m.asks.map(a => [a.id, { ...a, module: m.module }])));
		const now = new Set(d.modules.flatMap(m => m.asks.map(a => a.id)));
		let kept = 0;
		for (const a of d.modules.flatMap(m => m.asks)){
			const o = had.get(a.id); if (!o) continue;
			let any = false;
			for (const k of UndoneAsks.OWNED) if (o[k] !== undefined){ a[k] = o[k]; any = true; }
			if (any) kept++;
		}
		const gone = (old.retired ?? []).filter(r => !now.has(r.id));
		const seen = new Set(gone.map(r => r.id)), at = d.generated_at;
		for (const [id, o] of had) if (!now.has(id) && !seen.has(id)) gone.push({ ...o, retired_at: at });
		d.retired = gone;
		return { kept, retired: gone.length };
	}

	static STATES = ["done", "tasked", "closed", "noted", "undone", "unroutable"];

	/** What became of each open ask, from the fields later steps wrote (see the class comment). Recounts totals and module counts. */
	static settle(d, tasks = []){
		const state = new Map(tasks.map(t => [t.url, t.state]));
		const totals = Object.fromEntries(UndoneAsks.STATES.map(k => [k, 0]));
		for (const m of d.modules){
			for (const k of UndoneAsks.STATES) m[k] = 0;
			for (const a of m.asks){
				if (a.state !== "done"){
					if (a.task) a.state = state.get(a.task) === "complete" ? "done" : "tasked";
					else if (a.verified === "done" || a.verified === "retired") a.state = "closed";
					else if (a.note) a.state = "noted";
				}
				m[a.state]++; totals[a.state]++;
			}
		}
		d.totals = totals;
		d.classified = Object.values(totals).reduce((x, y) => x + y, 0);
		d.agree = d.counted === d.classified;
		d.modules.sort((a, b) => (b.undone + b.unroutable) - (a.undone + a.unroutable) || a.module.localeCompare(b.module));
		return totals;
	}

	// ---- output ------------------------------------------------------------------------------------

	static table(d){
		const ks = UndoneAsks.STATES.filter(k => k in d.totals);
		const lines = [`${"module".padEnd(30)} ${ks.map(k => k.padStart(10)).join(" ")}`];
		for (const m of d.modules) lines.push(`${m.module.padEnd(30)} ${ks.map(k => String(m[k] ?? 0).padStart(10)).join(" ")}`);
		lines.push("", `total asks counted at the sources: ${d.counted}`, ks.map(k => `${k} ${d.totals[k]}`).join(" + ") + ` = ${d.classified}`,
			d.agree ? "the two numbers agree" : "THE TWO NUMBERS DISAGREE");
		return lines.join("\n");
	}

	static async main(argv){
		const val = f => argv.includes(f) ? argv[argv.indexOf(f) + 1] : null;
		const u = new UndoneAsks({ root: path.resolve(val("--root") ?? HERE) }), d = await u.build();
		const out = path.resolve(val("--out") ?? path.join(HERE, UndoneAsks.OUT));
		const { kept, retired } = UndoneAsks.keep_owned(d, out);   // the verdicts and task links later steps wrote, carried by ask id
		UndoneAsks.settle(d, u.tasks_seen);
		console.log(UndoneAsks.table(d));
		if (argv.includes("--json")){
			fs.mkdirSync(path.dirname(out), { recursive: true });
			console.log(`kept ${kept} rows with verdicts or task links; ${retired} retired`);
			fs.writeFileSync(out, JSON.stringify(d, null, 1));
			console.log("wrote " + out);
		}
		if (!d.agree) process.exitCode = 1;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	UndoneAsks.main(process.argv.slice(2)).catch(e => { console.error(e.stack ?? e); process.exit(1); });
