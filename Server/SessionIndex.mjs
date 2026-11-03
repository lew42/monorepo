// Server/SessionIndex.mjs — every task record (and, when given, every live session snapshot) in memory, queried with plain JavaScript.
// Doc: Server/doc/session-index.md. Extends ext/Query's node side: it registers the "tasks" QueryServer source, so the browser asks it
// over the dev socket exactly like "sessions". PastWork.mjs and FollowUp.mjs read task.jsonl through SessionIndex.reduce. Whether and when a task
// landed is not decided here: AIIndex.fold (Server/AIIndex.mjs, Task.js's rules) decides it for every caller (Server/doc/ai-index.md).
import fs from "node:fs";
import SessionRecord from "./SessionRecord.mjs";
import AIIndex from "./AIIndex.mjs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Query from "../public/framework/ext/Query/Query.js";
import QueryServer from "../public/framework/ext/Query/QueryServer.mjs";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = v => { const n = Date.parse(v ?? ""); return Number.isNaN(n) ? 0 : n; };

export default class SessionIndex {

	/** The one process-wide index (the "tasks" source uses it). */
	static shared = null;

	/** session id -> transcript path (a file in a project folder of ~/.claude/projects) on this machine; built once, so a row can say whether its raw log exists. */
	static transcripts() {
		if (SessionIndex._tr) return SessionIndex._tr;
		const map = SessionIndex._tr = new Map(), base = path.join(os.homedir(), ".claude", "projects");
		try { for (const d of fs.readdirSync(base)) { if (!/^c--code-lew42-/i.test(d)) continue; for (const f of fs.readdirSync(path.join(base, d))) if (f.endsWith(".jsonl")) map.set(f.slice(0, -6), path.join(base, d, f)); } } catch {}
		return map;
	}

	/** A task record's empty shape. */
	static blank(dir) {
		const m = dir.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
		return { id: dir, kind: "task", dir, slug: path.basename(dir), url: "/" + dir.replace(/^public\//, "") + "/", day: m ? `${m[1]}-${m[2]}-${m[3]}` : "",
			assign_landed: "", state: "", title: "", request: "", brief: "", outcome: "", group: "", agent: "", session: "", model: "", branch: "",
			started: 0, last: 0, step: 0, steps: 0, landed: false, landed_at: 0, usd: 0, links: [], topics: [], modules: [], files: 0, chats: 0, reviews: 0, _mods: new Set() };
	}

	/** The module a repo path belongs to: public/framework/<tier>/<Name>/... -> "tier/Name"; Server/, Servex/, .claude/ -> their folder; ai/ dated task dirs -> "ai". */
	static module_of(file) {
		const p = String(file).replace(/\\/g, "/").replace(/^\.?\//, "").replace(/^[A-Za-z]:.*?monorepo\//, "");
		let m = p.match(/^public\/framework\/(ai)\//) ?? p.match(/^public\/framework\/([^/]+\/[^/.]+)(?:\/|$)/);
		if (m) return m[1];
		m = p.match(/^(Server|Servex|\.claude)(?:\/|$)/) ?? p.match(/^public\/([^/.]+)(?:\/|$)/);
		return m ? m[1] : null;
	}

	/** Fold one task.jsonl line into a record (the merge PastWork and FollowUp both did by hand). */
	static apply(r, o) {
		if (typeof o.group === "string") r.group ||= o.group;
		if (o.outcome && typeof o.outcome === "string") r.outcome = o.outcome;
		const a = o.assign;
		if (a) {
			if (a.title) r.title = a.title;
			if (a.request && !r.request) r.request = a.request;
			if (a.brief && !r.brief) r.brief = a.brief;
			if (a.outcome) { r.outcome = a.outcome; }
			r.group ||= a.group ?? ""; r.session ||= a.session_id ?? ""; r.agent ||= a.agent ?? ""; r.model ||= a.model ?? ""; r.branch ||= a.branch ?? "";
			if (Array.isArray(a.steps) && a.steps.length) r.steps = a.steps.length;
			if (a.step) r.step = a.step;
			if (Array.isArray(a.links)) r.links = a.links;
			if (Array.isArray(a.topics)) r.topics = a.topics;
			if (typeof a.cost_usd === "number") r.usd = a.cost_usd;
			r.started ||= ts(a.requested_at);
		}
		if (o.action?.files) for (const f of o.action.files) { r.files++; const m = SessionIndex.module_of(f); if (m) r._mods.add(m); }
		if (o.chat) r.chats++;
		if (o.review?.verdict) r.reviews++;
		for (const v of [o.at, o.log?.at, o.decision?.at, o.action?.at, o.note?.at, o.review?.at, o.shots?.at, a?.requested_at]) r.last = Math.max(r.last, ts(v));
	}

	/** Whether and when it landed, from AIIndex.fold (Task.js's rules): the same answer the tasks dashboard and index.json give. */
	static land(r, lines) {
		const f = AIIndex.fold(lines);
		r.state = f.state; r.landed = f.state === "complete"; r.landed_at = ts(f.landed_at); r.assign_landed = f.landed_at ?? "";
		return r;
	}

	/** Seal a record after lines were applied: sorted module list, a start time, the landing day. */
	static seal(r) {
		r.started ||= r.last;
		const log = SessionRecord.log_file(path.join(REPO, r.dir));
		r.raw = { task: r.url + (log ? path.basename(log) : "task.jsonl"), transcript: (r.session && SessionIndex.transcripts().get(r.session)) || null };   // the raw logs to click through to (the transcript only if it is on this machine)
		r.modules = [...r._mods].sort();
		r.landed_day = r.landed_at ? AIIndex.day(r.landed_at) : "";   // the owner's local day
		r.text = `${r.title} ${r.request} ${r.outcome} ${r.slug} ${r.group}`.toLowerCase();
		return r;
	}

	/** Read a whole task.jsonl text into a record (no index needed: the shim PastWork and FollowUp use). */
	static reduce(dir, text) {
		const r = SessionIndex.blank(dir), lines = AIIndex.parse(text);
		for (const o of lines) { try { SessionIndex.apply(r, o); } catch {} }
		return SessionIndex.seal(SessionIndex.land(r, lines));
	}

	/** The brief's `Fence:` line names the directories a task owned: add their modules too. */
	static fence_modules(dir, rec) {
		let text; try { text = fs.readFileSync(path.join(REPO, dir, "requirements.md"), "utf8"); } catch { return; }
		const line = text.split("\n").find(l => /^\s*(\*\*)?Fence/i.test(l));
		if (!line) return;
		for (const t of line.matchAll(/`([^`]+)`/g)) {
			const p = t[1].replace(/\*+$/, "");
			const m = SessionIndex.module_of(p) ?? SessionIndex.module_of("public/framework/" + p) ?? (/^(Server|Servex)\//.test(p) ? p.split("/")[0] : null);
			if (m) rec._mods.add(m);
		}
	}

	constructor({ root = path.join(REPO, "public", "framework", "ai"), sessions = null, log = () => {} } = {}) {
		this.root = root; this.sessions = sessions; this.log = log;
		this.files = new Map();       // absolute task.jsonl path -> { rec, size }
		this.listeners = new Set();
		this.stats = { files: 0, rows: 0, ms: 0, heap_mb: 0 };
		this.ready = null; this.watcher = null;
	}

	// ---- life -----------------------------------------------------------------------------------------------------
	load() {
		return this.ready ??= (async () => {
			const heap0 = process.memoryUsage().heapUsed, t0 = performance.now();
			for (const f of this.walk(this.root)) this.read(f, true);
			this.stats = { files: this.files.size, rows: this.count(), ms: +(performance.now() - t0).toFixed(0), heap_mb: +((process.memoryUsage().heapUsed - heap0) / 1048576).toFixed(1) };
			this.log(`SessionIndex: ${this.stats.rows} rows from ${this.stats.files} task.jsonl in ${this.stats.ms} ms, +${this.stats.heap_mb} MB heap`);
			this.watch();
			return this.stats;
		})();
	}

	*walk(dir) {
		let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of ents) {
			if (e.name === "node_modules" || e.name === ".git") continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) yield* this.walk(p);
			else if (SessionRecord.is_log_entry(dir, e.name)) yield p;
		}
	}

	/** Read the bytes appended since last time (the whole file the first time or after a shrink); only complete lines count. */
	read(file, quiet = false) {
		let st; try { st = fs.statSync(file); } catch { return this.files.delete(file) && this.emit(null); }
		if (!SessionRecord.is_log_entry(path.dirname(file), path.basename(file))) return;   // a tag-only session.jsonl is not a task
		let ent = this.files.get(file);
		if (ent && st.size < ent.size) ent = null;                       // rewritten shorter: start over
		if (!ent) { const dir = path.relative(REPO, path.dirname(file)).replace(/\\/g, "/"); ent = { rec: SessionIndex.blank(dir), size: 0, fence: false }; }
		if (st.size === ent.size && this.files.has(file)) return;
		const fd = fs.openSync(file, "r");
		const buf = Buffer.alloc(st.size - ent.size);
		try { fs.readSync(fd, buf, 0, buf.length, ent.size); } finally { fs.closeSync(fd); }
		const text = buf.toString("utf8"), end = text.lastIndexOf("\n") + 1;
		for (const l of text.slice(0, end).split("\n")) { if (!l.startsWith("{")) continue; try { SessionIndex.apply(ent.rec, JSON.parse(l)); } catch {} }
		ent.size += Buffer.byteLength(text.slice(0, end));
		if (!ent.fence) { SessionIndex.fence_modules(ent.rec.dir, ent.rec); ent.fence = true; }
		SessionIndex.land(ent.rec, AIIndex.read_lines(file));
		SessionIndex.seal(ent.rec);
		this.files.set(file, ent);
		if (!quiet) this.emit(ent.rec);
	}

	watch() {
		try {
			this.watcher = fs.watch(this.root, { recursive: true }, (_, name) => {
				if (!name || !SessionRecord.is_record(path.basename(String(name)))) return;
				const file = path.join(this.root, String(name));
				clearTimeout(this.timers?.get(file)); (this.timers ??= new Map()).set(file, setTimeout(() => { this.timers.delete(file); try { this.read(file); } catch (e) { this.log("SessionIndex: " + e.message); } }, 50));
			});
			this.watcher.unref?.();
		} catch (e) { this.log("SessionIndex: watch failed - " + e.message); }
	}

	stop() { this.watcher?.close(); this.watcher = null; this.listeners.clear(); }

	on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
	emit(rec) { if (rec) for (const fn of this.listeners) fn(rec); }

	// ---- reading ----------------------------------------------------------------------------------------------------
	count() { return this.files.size + (this.sessions ? [...this.sessions()].length : 0); }

	*tasks() { for (const e of this.files.values()) yield e.rec; }

	*rows(kind) {
		if (kind !== "session") yield* this.tasks();
		if (kind !== "task" && this.sessions) for (const s of this.sessions()) yield { kind: "session", ...s };
	}

	/** { kind: "task"|"session", since: "YYYY-MM-DD" (day or later), text, agent, module, landed: true|false, group, limit, offset } -> { rows, count }.
	 *  `module` matches a tag exactly or as a parent ("ux" finds "ux/Dictate"); `text` is every word, case-insensitive. */
	query({ kind, since, text, agent, module, landed, group, sort = "last", limit = 50, offset = 0 } = {}) {
		const words = String(text ?? "").toLowerCase().split(/\s+/).filter(Boolean), mod = module?.toLowerCase();
		const hit = [];
		for (const r of this.rows(kind)) {
			if (since && (r.day ?? "") < since) continue;
			if (agent && r.agent !== agent) continue;
			if (group && r.group !== group) continue;
			if (landed != null && !!r.landed !== !!landed) continue;
			if (mod && !r.modules?.some(m => { m = m.toLowerCase(); return m === mod || m.startsWith(mod + "/"); })) continue;
			if (words.length && !words.every(w => (r.text ?? "").includes(w))) continue;
			hit.push(r);
		}
		hit.sort((a, b) => (b[sort] ?? 0) - (a[sort] ?? 0));
		return { rows: hit.slice(offset, offset + limit).map(SessionIndex.public), count: hit.length };
	}

	/** A row as the browser sees it: no private fields, no search blob. */
	static public(r) { const { _mods, text, ...row } = r; return row; }

	/** Register the "tasks" QueryServer source over a shared index (ext/Query's browser path: new QueryClient("tasks")). */
	static register(opts) {
		const ix = SessionIndex.shared ??= new SessionIndex(opts);
		QueryServer.source("tasks", {
			load: () => ix.load(),
			items: () => ix.tasks(),
			on: fn => ix.on(fn),
			shape: SessionIndex.public,
			unload_after: 24 * 3600e3,
		});
		return ix;
	}
}

SessionIndex.register();   // importing this file makes the "tasks" source exist (nothing loads until the first query)

// node Server/SessionIndex.mjs --check [module] — load time, heap, rows vs files, one example query.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === "--check") {
	const ix = new SessionIndex({ log: console.log });
	const stats = await ix.load(); ix.stop();
	const mod = process.argv[3] ?? "ux/Dictate", res = ix.query({ module: mod, limit: 3 });
	console.log(JSON.stringify(stats), `\nmodule=${mod}: ${res.count} tasks;`, "first:", res.rows.map(r => r.slug).join(", "));
	console.log("landed:", ix.query({ landed: true, limit: 0 }).count, "| text 'dictate' since 2026-10-01:", ix.query({ text: "dictate", since: "2026-10-01", limit: 0 }).count);
	process.exit(0);
}
