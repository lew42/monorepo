#!/usr/bin/env node
/**
 * class UndoneToTasks — turns the asks Haiku verified as undone into idle tasks in their module homes.
 * Reads public/framework/ai/asks/undone.json (Server/UndoneAsks.mjs, verdicts from Server/UndoneVerify.mjs); creates through the
 * item tool's own function (Servex/agents/page_tools.js run_item), never a hand-written task.jsonl (CLAUDE.md laws 6 and 7).
 * Doc: public/framework/ai/doc/undone-asks-2026-10-17.md.
 *
 *   node Server/UndoneToTasks.mjs --plan     print what would be created, what is already tracked, what has no module
 *   node Server/UndoneToTasks.mjs --apply    create the tasks, write the manifest, mark each ask with `task`, index the new homes
 *   --root <repo>   where the data lives (default: the repo this file is in)
 *   --parent <url>  the task the new ones are filed under (default: this run's own task folder)
 *
 *   --proposed      file them as proposals (waiting on the owner) instead of idle tasks: the sort pass's tasks
 *   --notes [--apply]   the asks the sort pass called notes: one line each in the module's readme (more than NOTES_INLINE in a
 *                       module go to its doc/notes-from-asks.md, linked from the readme by one line); marks each ask's note.file
 *
 * Only `verified: "undone"` asks become tasks; done and unclear ones never do. The sort pass (UndoneVerify --question sort) names a module
 * for each (`verified_module`) and a title (`verified_title`); a sorted ask with no module goes to the ai home. An ask already tracked (its id in a task's line 1, in the
 * manifest, or a task title in the same module home sharing over 60% of its words) is skipped.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AskIndex from "./AskIndex.mjs";
import TaskHomes from "./TaskHomes.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NL = String.fromCharCode(10);

export default class UndoneToTasks {

	static DATA = "public/framework/ai/asks/undone.json";
	static MANIFEST = "public/framework/ai/asks/undone-to-tasks.jsonl";
	static PARENT = "/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/";
	static BY = "helper-undone-to-tasks";
	static FW = "public/framework";
	static FOLD = { "ai/sessions": "ai", "ai/tasks": "ai", Servex: "servex", Server: "servex" };   // pages inside ai/ whose tasks live in the ai home (ai/tasks/ is that home itself)
	static PRESSED = new Set(["stalled", "queued", "pressed"]);   // ledger statuses that mean the owner is waiting on it
	static OVERLAP = 0.6;
	static MIN_SHARED = 3;
	static MAX_TITLE = 80;

	constructor({ root = HERE, parent = UndoneToTasks.PARENT, now = () => new Date().toISOString(), proposed = false } = {}){
		this.root = root; this.parent = parent; this.now = now; this.proposed = proposed;
	}

	// ---- reading -----------------------------------------------------------------------------------

	static read(file){
		if (!fs.existsSync(file)) return [];
		return fs.readFileSync(file, "utf8").split(NL).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	}
	file(rel){ return path.join(this.root, rel); }

	/** Every verified-undone ask, with its module label folded to a task home. */
	asks(){
		const data = JSON.parse(fs.readFileSync(this.file(UndoneToTasks.DATA), "utf8"));
		return data.modules.flatMap(m => m.asks.filter(a => a.verified === "undone" && a.state !== "done").map(a => ({ ...a,
			module: UndoneToTasks.home_of(a.verified_module ?? m.module) ?? (a.verified_kind === "sort" ? "ai" : null) })));
	}
	static home_of(label){ return !label || label.startsWith("(") ? null : (this.FOLD[label] ?? label); }

	/** { module -> [{ title, words, ask, path }] }: the tasks already in each home, read from line 1 of each task.jsonl. */
	homes(){
		const out = new Map(), fw = this.file(UndoneToTasks.FW);
		const walk = (d, mod, depth) => {
			let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			for (const e of es){
				if (!e.isDirectory() || e.name === "node_modules" || e.name.startsWith(".") || depth > 6) continue;
				const p = path.join(d, e.name);
				if (e.name === "tasks"){
					for (const t of fs.readdirSync(p, { withFileTypes: true })) {
						const f = path.join(p, t.name, "task.jsonl");
						if (!t.isDirectory() || !fs.existsSync(f)) continue;
						const first = UndoneToTasks.read(f)[0] ?? {}, title = first.title ?? t.name.replace(/-/g, " ");
						if (!out.has(mod)) out.set(mod, []);
						out.get(mod).push({ title, words: AskIndex.words(title), ask: first.ask ?? null, path: "/" + path.relative(path.join(this.root, "public"), path.join(p, t.name)).split(path.sep).join("/") + "/" });
					}
				} else if (e.name !== "sessions") walk(p, (mod ? mod + "/" : "") + e.name, depth + 1);
			}
		};
		walk(fw, "", 0);
		return out;
	}

	manifest(){ return new Map(UndoneToTasks.read(this.file(UndoneToTasks.MANIFEST)).filter(l => l.ask).map(l => [l.ask, l])); }

	/** statuses of routed asks in the ledger by title are not needed: the ask row already carries `status` from it. */
	static pressed(a){ return a.kind === "routed" && this.PRESSED.has(a.status); }

	/** Older is lower: 1 day -> 5 ... 5 days or more -> 1; a ledger-pressed ask is 5. A weight for Task.rank, bigger is higher. */
	static priority(a){
		if (this.pressed(a)) return { score: 5, why: `the asks ledger marks it ${a.status}`, by: this.BY };
		const score = Math.max(1, Math.min(5, 6 - (a.days ?? 5)));
		return { score, why: `${a.days ?? "?"} days old; older asks rank lower`, by: this.BY };
	}

	/** The ask's first sentence, under MAX_TITLE characters, cut at a word. */
	static title(text){
		const s = String(text ?? "").replace(/\s+/g, " ").trim();
		const first = (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).replace(/[.!?]$/, "");
		if (first.length < this.MAX_TITLE) return first;
		// a whole phrase: cut at the last clause break that fits (a comma, a dash, or "and / so / then / with / in / for / to / that")
		const head = first.slice(0, this.MAX_TITLE);
		const breaks = [...head.matchAll(/[,;:—–]\s|\s(?:and|so|then|with|in|for|to|that|which|but|or|because)\s/g)].map(m => m.index).filter(i => i >= 30);
		if (breaks.length) return first.slice(0, breaks.at(-1)).replace(/[ ,;:\-—–]+$/, "");
		const cut = first.slice(0, this.MAX_TITLE - 1), at = cut.lastIndexOf(" ");
		return (at > 40 ? cut.slice(0, at) : cut).replace(/[ ,;:\-]+$/, "") + "…";
	}

	static overlap(A, B){
		const shared = [...A].filter(w => B.has(w)).length;
		return { shared, share: shared / (Math.max(A.size, B.size) || 1) };
	}

	// ---- the plan ----------------------------------------------------------------------------------

	/** { create: [task], tracked: [{ask, by, task}], no_module: [ask] }. Nothing is written. */
	plan(){
		const asks = this.asks(), homes = this.homes(), done = this.manifest();
		const create = [], tracked = [], no_module = [], seen = new Set();
		for (const a of asks){
			if (!a.module || !fs.existsSync(this.file(UndoneToTasks.FW + "/" + a.module))){ no_module.push(a); continue; }
			if (done.has(a.id)){ tracked.push({ ask: a, by: "manifest", task: done.get(a.id).task }); continue; }
			const have = homes.get(a.module) ?? [], title = UndoneToTasks.title(a.text), W = AskIndex.words(a.text);
			const same = have.find(t => t.ask === a.id);
			if (same){ tracked.push({ ask: a, by: "ask id", task: same.path }); continue; }
			let hit = null;
			for (const t of have){
				const { shared, share } = UndoneToTasks.overlap(W, t.words);
				if (shared >= UndoneToTasks.MIN_SHARED && share > UndoneToTasks.OVERLAP && (!hit || share > hit.share)) hit = { t, share };
			}
			if (hit){ tracked.push({ ask: a, by: `title ${Math.round(hit.share * 100)}%`, task: hit.t.path }); continue; }
			if (seen.has(a.id)) continue;
			seen.add(a.id);
			// the same ask said twice (a ledger title and its refined sentence): one task, both asks point at it
			const twin = create.find(c => c.module === a.module && (c.text === a.text || UndoneToTasks.overlap(W, AskIndex.words(c.text)).share > UndoneToTasks.OVERLAP));
			if (twin){ twin.also.push(a.id); continue; }
			create.push({ ask: a.id, also: [], text: a.text, module: a.module, title: a.verified_title ? UndoneToTasks.title(a.verified_title) : title, source: a.source, description: a.verified_evidence ?? a.evidence ?? "", priority: UndoneToTasks.priority(a), days: a.days });
		}
		return { create, tracked, no_module };
	}

	// ---- applying ----------------------------------------------------------------------------------

	/** Creates each task through run_item (the item tool's function), one at a time. Returns [{ask, task}] and the refusals. */
	async create(list){
		const { run_item } = await import(pathToFileURL(path.join(this.root, "Servex/agents/page_tools.js")).href);
		const made = [], refused = [];
		for (const t of list){
			const add = { title: t.title, module: t.module, source: t.source, ask: t.ask, description: t.description, priority: t.priority, ...(this.proposed ? { from: "owner" } : {}) };
			let r = await run_item({ path: this.parent, delta: { tasks: { add } } }, { caller: this.constructor.BY }, true);
			if (!r.ok && r.suggest){ r = await run_item({ path: this.parent, delta: { tasks: { add: { ...add, id: r.suggest } } } }, { caller: this.constructor.BY }, true); }
			if (r.ok && r.homes?.[0]){
				// a proposal: line 1's plain state is not a verb, so the wait line makes it waiting on the owner (Task.wait)
				if (this.proposed) await run_item({ path: r.homes[0].path, delta: { wait: { on: "owner", what: "Proposed from an old ask (the sort pass over the undone asks): approve, improve or reject" } } }, { caller: this.constructor.BY }, true);
				for (const id of [t.ask, ...(t.also ?? [])]) made.push({ ask: id, task: r.homes[0].path, module: t.module });
			}
			else refused.push({ ask: t.ask, why: r.why ?? "no home made" });
		}
		return { made, refused };
	}

	/** Manifest lines (append-only) and the `task` field on each ask in undone.json (merge by id, nothing else touched). */
	record(made){
		const man = this.file(UndoneToTasks.MANIFEST), at = this.now();
		fs.mkdirSync(path.dirname(man), { recursive: true });
		const had = this.manifest();
		const fresh = made.filter(m => !had.has(m.ask));   // an ask already in the manifest is not written again
		if (fresh.length) fs.appendFileSync(man, fresh.map(m => JSON.stringify({ ask: m.ask, task: m.task, module: m.module, at })).join(NL) + NL);
		const file = this.file(UndoneToTasks.DATA), raw = fs.readFileSync(file, "utf8"), data = JSON.parse(raw), by = new Map(made.map(m => [m.ask, m.task]));
		let marked = 0;
		for (const m of data.modules) for (const a of m.asks) if (by.has(a.id) && !a.task){ a.task = by.get(a.id); marked++; }
		const tmp = file + ".tmp-" + process.pid;
		fs.writeFileSync(tmp, JSON.stringify(data, null, 1) + (raw.endsWith(NL) ? NL : ""));
		fs.renameSync(tmp, file);
		return marked;
	}

	async apply(){
		const plan = this.plan(), before = this.carrying();
		const { made, refused } = await this.create(plan.create);
		const marked = this.record([...made, ...plan.tracked.filter(t => t.task).map(t => ({ ask: t.ask.id, task: t.task, module: t.ask.module }))]);   // an ask whose work already has a task points at it
		const homes = TaskHomes.sync({ write: true });
		return { plan, made, refused, marked, carrying: this.carrying() - before, homes_added: homes.missing.length };
	}

	/** How many verified-undone asks carry a `task` field right now. */
	carrying(){
		const data = JSON.parse(fs.readFileSync(this.file(UndoneToTasks.DATA), "utf8"));
		return data.modules.reduce((n, m) => n + m.asks.filter(a => a.task).length, 0);
	}

	// ---- notes: the asks the sort pass called a rule, a preference or an idea ---------------------------------------------

	static NOTES_INLINE = 6;   // up to this many notes go straight into the readme; more go to doc/notes-from-asks.md, linked once
	static NOTES_HEAD = "## Notes from your asks";

	/** The readme of a module label: public/framework/<label>/readme.md, or a top-level <label>/readme.md (Servex, Server). */
	readme_of(label){
		label = UndoneToTasks.FOLD[label] ?? label;
		for (const rel of [UndoneToTasks.FW + "/" + label + "/readme.md", label + "/readme.md"]) if (fs.existsSync(this.file(rel))) return rel;
		return UndoneToTasks.FW + "/ai/readme.md";
	}

	/** { file -> [ask] }: where each unwritten note goes. */
	notes_plan(){
		const data = JSON.parse(fs.readFileSync(this.file(UndoneToTasks.DATA), "utf8")), by = new Map();
		for (const a of data.modules.flatMap(m => m.asks)) if (a.note && !a.note.file){
			const rm = this.readme_of(a.note.module);
			(by.get(rm) ?? by.set(rm, []).get(rm)).push(a);
		}
		return by;
	}

	static note_line(a){ return `- ${a.note.text} ([your words](${a.source}), ${String(a.at ?? "").slice(0, 10)})`; }

	/** Writes every note: into the readme under NOTES_HEAD, or (past NOTES_INLINE for one readme) into doc/notes-from-asks.md beside it,
	 * linked from the readme by one line. Appends only; marks note.file on each ask in undone.json. */
	write_notes(){
		const plan = this.notes_plan(), written = new Map();
		for (const [rm, asks] of plan){
			const lines = asks.map(UndoneToTasks.note_line), abs = this.file(rm);
			let target = rm;
			if (asks.length > UndoneToTasks.NOTES_INLINE){
				target = path.posix.join(path.posix.dirname(rm), "doc", "notes-from-asks.md");
				const t = this.file(target);
				fs.mkdirSync(path.dirname(t), { recursive: true });
				if (!fs.existsSync(t)) fs.writeFileSync(t, "# Notes from your asks\n\nRules, preferences and ideas you said about this module that are not work, one line each, with a link to your words. Written by `node Server/UndoneToTasks.mjs --notes --apply` from the sort pass over the undone asks ([crack 2](/framework/core/Task/doc/cracks.md)).\n\n");
				fs.appendFileSync(t, lines.join(NL) + NL);
				lines.length = 0;
				lines.push("- Rules, preferences and ideas you said about this module: [doc/notes-from-asks.md](doc/notes-from-asks.md)");
			}
			const text = fs.readFileSync(abs, "utf8");
			if (!text.includes(UndoneToTasks.NOTES_HEAD)) fs.appendFileSync(abs, (text.endsWith(NL) ? "" : NL) + NL + UndoneToTasks.NOTES_HEAD + NL + NL);
			else if (!text.endsWith(NL)) fs.appendFileSync(abs, NL);
			if (!text.includes("[doc/notes-from-asks.md](doc/notes-from-asks.md)") || target === rm) fs.appendFileSync(abs, lines.join(NL) + NL);
			for (const a of asks) written.set(a.id, target);
		}
		const file = this.file(UndoneToTasks.DATA), data = JSON.parse(fs.readFileSync(file, "utf8"));
		for (const a of data.modules.flatMap(m => m.asks)) if (written.has(a.id)) a.note.file = written.get(a.id);
		fs.writeFileSync(file, JSON.stringify(data, null, 1));
		return { files: [...new Set(written.values())], notes: written.size };
	}

	// ---- the print ---------------------------------------------------------------------------------

	static report(plan){
		const by_mod = {};
		for (const t of plan.create) by_mod[t.module] = (by_mod[t.module] ?? 0) + 1;
		return [
			`to create: ${plan.create.length}   already tracked: ${plan.tracked.length}   no module: ${plan.no_module.length}`,
			...Object.entries(by_mod).sort((a, b) => b[1] - a[1]).map(([m, n]) => `  ${String(n).padStart(3)}  ${m}/tasks/`),
			"already tracked:",
			...plan.tracked.map(t => `  ${t.ask.id} [${t.by}] ${UndoneToTasks.title(t.ask.text)}  ->  ${t.task}`),
			...(plan.no_module.length ? ["no module:", ...plan.no_module.map(a => `  ${a.id} ${UndoneToTasks.title(a.text)}`)] : []),
		].join(NL);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
	const u = new UndoneToTasks({ root: arg("--root") ?? HERE, parent: arg("--parent") ?? UndoneToTasks.PARENT, proposed: process.argv.includes("--proposed") });
	if (process.argv.includes("--notes")){
		if (process.argv.includes("--apply")){ const r = u.write_notes(); console.log(`notes written: ${r.notes} into ${r.files.length} files`); for (const f of r.files) console.log("  " + f); }
		else for (const [rm, asks] of u.notes_plan()) console.log(`${String(asks.length).padStart(3)}  ${rm}${asks.length > UndoneToTasks.NOTES_INLINE ? "  (-> doc/notes-from-asks.md)" : ""}`);
	} else if (process.argv.includes("--apply")){
		const r = await u.apply();
		console.log(UndoneToTasks.report(r.plan).split(NL)[0]);
		console.log(`created: ${r.made.length}   refused: ${r.refused.length}   asks marked: ${r.marked}   carrying grew by: ${r.carrying}   homes added to /tasks/: ${r.homes_added}`);
		for (const x of r.refused) console.log(`  refused ${x.ask}: ${x.why}`);
	} else console.log(UndoneToTasks.report(u.plan()));
}
