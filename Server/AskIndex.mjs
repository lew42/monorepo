#!/usr/bin/env node
/**
 * class AskIndex — a refined ask becomes a record, a module topic list, and (when not done) a module inbox line.
 * Doc: public/framework/ext/Refine/doc/asks.md. Nothing here calls a model: the refiner already named each ask's module;
 * this class only files, matches and writes (CLAUDE.md law 7).
 *
 *   node Server/AskIndex.mjs --plan                 # backfill from ext/Refine/queue/asks.jsonl: counts only, writes nothing
 *   node Server/AskIndex.mjs --backfill [--route]   # append the missing records (and route them when --route)
 *   node Server/AskIndex.mjs --route [--module ux/Dictate]   # send every recorded, not-done ask to its module's inbox, once
 *   node Server/AskIndex.mjs                        # regenerate <module>/doc/refined-asks.md and ai/doc/asks-by-module.md
 *
 * Record: <session folder>/asks.jsonl, append-only. {at, session, prompt_ref, ask, module, status}; a later line with the same
 * (prompt_ref, id) and a new status ({at, session, prompt_ref, id, status, inbox?, done_by?}) supersedes it when read.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ModuleInbox from "../Servex/agents/ModuleInbox.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FW = "public/framework";

export default class AskIndex {

	static FILE = "asks.jsonl";
	static PAGE = "refined-asks.md";   // doc/asks.md is taken: four modules hold a hand-merged one, never overwritten
	static QUEUE = "public/framework/ext/Refine/queue/asks.jsonl";   // the refine loop's flat index (backfill source)
	static OUTCOMES = "public/framework/ai/doc/asks-outcomes.jsonl"; // AskTally's judged features and asks
	static OVERVIEW = "public/framework/ai/doc/asks-by-module.md";
	static NOT_A_MODULE = new Set(["", "site", "unknown", "framework", "none", "n/a", "repo", "general", "all", "global"]);
	static ALIAS = { dictate: "ux/Dictate", figma: "ext/Figma", "ai/dictation": "ux/Dictate", servex: "Servex", "refine": "ext/Refine", "ai/refine": "ext/Refine", "ai/refinement": "ext/Refine", "inbox": "ai/inbox", "page": "core/Page" };

	constructor({ root = ROOT } = {}){
		this.root = root;
		this.sessions = path.join(root, FW, "ai/sessions");
		this._dirs = new Map(); this._mods = new Map(); this._names = null; this._outcomes = null;
	}

	static read(file){
		let t = ""; try { t = fs.readFileSync(file, "utf8"); } catch { return []; }
		return t.split("\n").flatMap(r => { try { return r.trim() ? [JSON.parse(r)] : []; } catch { return []; } });
	}
	static ref(session, line){ return `/ai-logs/${session}#${line}`; }
	static link(session, line){ return `/framework/ai/sessions/${session}/?tab=coverage#p${line}`; }

	// ---- where things live -----------------------------------------------------------------------

	/** A session's folder: a uuid-named one anywhere in the day tree, else `session-<first 8>`; made (under `day`) when none exists. */
	session_dir(session, day){
		if (this._dirs.has(session)) return this._dirs.get(session);
		const want = [session, "session-" + session.slice(0, 8)], ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };
		let found = null;
		for (const y of ls(this.sessions)) if (/^\d{4}$/.test(y)) for (const m of ls(path.join(this.sessions, y))) for (const d of ls(path.join(this.sessions, y, m))){
			const names = ls(path.join(this.sessions, y, m, d));
			for (const w of want) if (names.includes(w) && (!found || w === session)) found = path.join(this.sessions, y, m, d, w);
		}
		if (!found){ found = path.join(this.sessions, String(day ?? new Date().toISOString().slice(0, 10)).slice(0, 10).replace(/-/g, "/"), "session-" + session.slice(0, 8)); fs.mkdirSync(found, { recursive: true }); }
		this._dirs.set(session, found);
		return found;
	}

	/** A refiner's module name → a real module folder (repo-relative), or null (site-wide, unknown, or no such folder). */
	module_of(name){
		let n = String(name ?? "").trim();
		if (this._mods.has(n)) return this._mods.get(n);
		const key = n.toLowerCase().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").replace(/^(public\/)?framework\//, "");
		let out = null;
		if (!AskIndex.NOT_A_MODULE.has(key)){
			const first = key.split(/\s+/)[0], cands = [AskIndex.ALIAS[key], n.replace(/^\/+|\/+$/g, ""), key, AskIndex.ALIAS[first], first].filter(Boolean);
			for (const c of cands){ const hit = this.folder(c); if (hit && hit !== FW){ out = hit; break; } }
			for (let p = key; !out && p.includes("/"); ){ p = p.slice(0, p.lastIndexOf("/")); out = this.folder(p); }   // ai/assistants has no folder: its nearest parent does
			if (!out && !key.includes("/")) out = this.by_name(key);
		}
		this._mods.set(n, out);
		return out;
	}
	/** `ux/Dictate` → the folder it names, spelled as on disk (case-insensitive match), as a repo-relative path. */
	folder(mod){
		try { const d = /^(Servex|Server)(\/|$)/.test(mod) && fs.existsSync(path.join(this.root, mod)) ? path.join(this.root, mod) : ModuleInbox.resolve(mod, this.root); return this.proper(path.relative(this.root, d).split(path.sep).join("/")); } catch { return null; }
	}
	proper(rel){   // Windows answers any casing; the module's own spelling is what the file path should carry
		let at = this.root; const out = [];
		for (const part of rel.split("/")){
			const hit = fs.readdirSync(at).find(x => x.toLowerCase() === part.toLowerCase()) ?? part; out.push(hit); at = path.join(at, hit);
		}
		return out.join("/");
	}
	/** A bare word like `Dictate`: the one framework folder with that name two levels deep, else null. */
	by_name(word){
		if (!this._names){
			this._names = new Map();
			for (const top of fs.readdirSync(path.join(this.root, FW), { withFileTypes: true })) if (top.isDirectory() && fs.existsSync(path.join(this.root, FW, top.name, "readme.md")))
				for (const e of fs.readdirSync(path.join(this.root, FW, top.name), { withFileTypes: true })) if (e.isDirectory()){
					const k = e.name.toLowerCase(), rel = `${FW}/${top.name}/${e.name}`;
					this._names.set(k, this._names.has(k) ? null : rel);
				}
		}
		return this._names.get(word) ?? null;
	}

	// ---- done: AskTally's judgments ----------------------------------------------------------------

	outcomes(){
		if (this._outcomes) return this._outcomes;
		const status = new Map(), by_source = new Map();
		for (const r of AskIndex.read(path.join(this.root, AskIndex.OUTCOMES))){
			if (r.feature) status.set(r.feature.name, r.feature);
			if (r.change) status.set(r.change.feature, { ...status.get(r.change.feature), status: r.change.to, proof: r.change.proof, link: r.change.link });
			if (r.ask?.source){ const l = by_source.get(r.ask.source) ?? []; l.push(r.ask); by_source.set(r.ask.source, l); }
		}
		return this._outcomes = { status, by_source };
	}
	static words(t){ return new Set(String(t ?? "").toLowerCase().match(/[a-z0-9]{4,}/g) ?? []); }
	/** `{done: true, by, proof}` when AskTally judged a feature done AND one of its asks, from this very prompt, says the same thing. */
	done_by(session, line, text){
		const { status, by_source } = this.outcomes(), W = AskIndex.words(text);
		for (const a of by_source.get(`${session.slice(0, 8)}:${line}`) ?? []){
			const f = status.get(a.feature);
			if (f?.status !== "done") continue;
			const B = AskIndex.words(a.ask + " " + a.raw); let n = 0; for (const w of AskIndex.words(a.ask)) if (W.has(w)) n++;
			if (n >= 3 || n / Math.max(1, AskIndex.words(a.ask).size) >= 0.5 || [...W].filter(w => B.has(w)).length >= 5) return { by: f.name, proof: f.link ?? f.proof ?? "" };
		}
		return null;
	}

	// ---- records ---------------------------------------------------------------------------------

	/** All folded records of every session: Map "prompt_ref|id" → latest line merged over the first. */
	records(){
		const out = new Map(), walk = d => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			for (const e of es){ const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === AskIndex.FILE && p.includes(path.sep + "sessions" + path.sep)) for (const r of AskIndex.read(p)){ const k = `${r.prompt_ref}|${r.id}`; out.set(k, { ...out.get(k), ...r }); } } };
		for (const y of fs.readdirSync(this.sessions)) if (/^\d{4}$/.test(y)) walk(path.join(this.sessions, y));
		return out;
	}

	/** Append one ask's record unless it exists. Returns the line or null. `p` = { session, line, at, id, ask, module }. */
	record(p, have){
		const ref = AskIndex.ref(p.session, p.line);
		if (have.has(`${ref}|${p.id}`)) return null;
		const dir = this.session_dir(p.session, p.at), row = { at: p.at, session: p.session, prompt_ref: ref, id: p.id, ask: p.ask, module: p.module || "unknown", status: "open" };
		fs.appendFileSync(path.join(dir, AskIndex.FILE), JSON.stringify(row) + "\n");
		have.set(`${ref}|${p.id}`, row);
		return row;
	}
	update(row, patch){
		const dir = this.session_dir(row.session), line = { at: new Date().toISOString(), session: row.session, prompt_ref: row.prompt_ref, id: row.id, ...patch };
		fs.appendFileSync(path.join(dir, AskIndex.FILE), JSON.stringify(line) + "\n");
		Object.assign(row, patch);
	}

	/** Cross off or inbox one open record. Never twice: a `done`/`inboxed` row is left alone, and the inbox is checked by source+essence. */
	route(row, { inbox = true } = {}){
		if (row.status !== "open") return row.status;
		const line = Number(row.prompt_ref.split("#")[1]), d = this.done_by(row.session, line, row.ask);
		if (d){ this.update(row, { status: "done", done_by: d.by, ...(d.proof ? { proof: d.proof } : {}) }); return "done"; }
		const mod = this.module_of(row.module);
		if (!mod || !inbox) return "open";
		const box = new ModuleInbox(mod, { repo: this.root }), src = AskIndex.link(row.session, line);
		if (!box.lines().some(l => l.source === src && l.essence === row.ask)) box.add(row.ask, src, { from: "refine-queue" });
		this.update(row, { status: "inboxed", inbox: mod });
		return "inboxed";
	}

	/** After one prompt is refined (RefineQueue.one): record each ask, then route it. Returns {recorded, done, inboxed}. */
	after_refine(ref, parsed){
		const have = this.records(), n = { recorded: 0, done: 0, inboxed: 0 };
		parsed.asks.forEach((a, i) => {
			const row = this.record({ session: ref.session, line: ref.line, at: ref.at, id: a.id ?? "a" + (i + 1), ask: a.text, module: a.module }, have);
			if (!row) return; n.recorded++;
			const s = this.route(row); if (s === "done") n.done++; else if (s === "inboxed") n.inboxed++;
		});
		return n;
	}

	// ---- backfill from the refine loop's flat index -------------------------------------------------

	/** The queue index, the latest brief per (session, line, id), with the module the refiner named. */
	queue_rows(){
		const latest = new Map();
		for (const a of AskIndex.read(path.join(this.root, AskIndex.QUEUE))) latest.set(`${a.session}:${a.line}:${a.id}`, a);
		return [...latest.values()].map(a => ({ session: a.session, line: a.line, at: a.at, id: a.id, ask: a.ask, module: a.module }));
	}
	backfill({ plan = true, route = false } = {}){
		const have = this.records(), rows = this.queue_rows(), n = { queue: rows.length, have_already: 0, to_record: 0, recorded: 0, done: 0, inboxed: 0, unknown: 0 };
		for (const p of rows){
			if (have.has(`${AskIndex.ref(p.session, p.line)}|${p.id}`)){ n.have_already++; continue; }
			n.to_record++;
			if (!this.module_of(p.module)) n.unknown++;
			if (plan){ if (this.done_by(p.session, p.line, p.ask)) n.done++; continue; }
			const row = this.record(p, have); n.recorded++;
			if (route){ const s = this.route(row); if (s === "done") n.done++; else if (s === "inboxed") n.inboxed++; }
		}
		return n;
	}
	/** Route every record still open (only `module` when given); the safe re-run: done and inboxed rows are skipped. */
	route_all({ module, plan = false } = {}){
		const n = { open: 0, done: 0, inboxed: 0, stayed_open: 0 };
		for (const row of this.records().values()){
			if (row.status !== "open") continue;
			if (module && this.module_of(row.module) !== module) continue;
			n.open++;
			if (plan) continue;
			const s = this.route(row); n[s === "open" ? "stayed_open" : s]++;
		}
		return n;
	}

	// ---- the generated pages -------------------------------------------------------------------------

	static date(r){ return String(r.at ?? "").slice(0, 10); }
	static line_md(r){
		const text = String(r.ask).replace(/\s+/g, " ").trim(), when = AskIndex.date(r);
		const src = `[${r.session.slice(0, 8)}${when ? " " + when : ""}](${AskIndex.link(r.session, r.prompt_ref.split("#")[1])})`;
		return r.status === "done" ? `- ✅ ~~${text}~~ — ${src}${r.done_by ? ` · landed as *${r.done_by}*` : ""}` : `- ⬜ ${text} — ${src}${r.status === "inboxed" ? " · in the module inbox" : ""}`;
	}

	/** Writes <module>/doc/asks.md for every module with asks, and the overview. Returns the table. */
	write(){
		const by = new Map(), unplaced = [];
		for (const r of [...this.records().values()].sort((a, b) => String(b.at).localeCompare(String(a.at)))){
			const mod = this.module_of(r.module);
			if (!mod){ unplaced.push(r); continue; }
			(by.get(mod) ?? by.set(mod, []).get(mod)).push(r);
		}
		const table = [];
		for (const [mod, rows] of by){
			const open = rows.filter(r => r.status !== "done"), done = rows.length - open.length, name = mod.split("/").at(-1);
			const md = [`# Asks about ${name}: ${open.length} open, ${done} done`, "",
				`Generated by \`node Server/AskIndex.mjs\` from the refined asks in each session's \`asks.jsonl\`; never hand-edited. Newest first. ` +
				`Open ones are also in this module's \`inbox.jsonl\` for its next review. How it works: [ext/Refine/doc/asks.md](/framework/ext/Refine/doc/asks.md).`, "",
				...(fs.existsSync(path.join(this.root, mod, "doc/asks.md")) ? ["The 2026-10-12 merged-asks pass for this module: [asks.md](asks.md).", ""] : []), "## Open", "", ...(open.length ? open.map(AskIndex.line_md) : ["Nothing open."]), "",
				...(done ? ["## Done (crossed off)", "", ...rows.filter(r => r.status === "done").map(AskIndex.line_md), ""] : [])].join("\n");
			const dir = path.join(this.root, mod, "doc"); fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, AskIndex.PAGE), md);
			table.push({ mod, open: open.length, done });
		}
		table.sort((a, b) => b.open - a.open || a.mod.localeCompare(b.mod));
		const un_open = unplaced.filter(r => r.status !== "done").length;
		const link = m => `/${m.replace(/^public\//, "")}/doc/${AskIndex.PAGE}`;
		const md = ["# Refined asks by module: where each ask the owner made is, and whether it landed", "",
			"Generated by `node Server/AskIndex.mjs`; never hand-edited. Every refined ask is a line in its session's `asks.jsonl`; this page counts them per module. " +
			"Open asks sit in the module's inbox. Method: [ext/Refine/doc/asks.md](/framework/ext/Refine/doc/asks.md).", "",
			"| module | open | done |", "|---|---|---|",
			...table.map(t => `| [${t.mod.replace(/^public\/framework\//, "")}](${link(t.mod)}) | ${t.open} | ${t.done} |`),
			`| *no module folder (site-wide or unknown)* | ${un_open} | ${unplaced.length - un_open} |`, "",
			`Total: ${table.reduce((s, t) => s + t.open, 0) + un_open} open, ${table.reduce((s, t) => s + t.done, 0) + unplaced.length - un_open} done.`, ""].join("\n");
		fs.writeFileSync(path.join(this.root, AskIndex.OVERVIEW), md);
		return { modules: table.length, table, unplaced: unplaced.length };
	}

	static async main(argv){
		const a = new AskIndex(), has = f => argv.includes(f), val = f => argv[argv.indexOf(f) + 1];
		if (has("--plan")) return console.log(JSON.stringify(a.backfill({ plan: true }), null, 1));
		if (has("--backfill")) console.log(JSON.stringify(a.backfill({ plan: false, route: has("--route") }), null, 1));
		else if (has("--route")) console.log(JSON.stringify(a.route_all({ module: val("--module") }), null, 1));
		const r = a.write(); console.log(`wrote ${r.modules} module pages + ${AskIndex.OVERVIEW}; ${r.unplaced} asks have no module folder`);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	AskIndex.main(process.argv.slice(2)).catch(e => { console.error(e.stack ?? e); process.exit(1); });
