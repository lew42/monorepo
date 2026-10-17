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
 * Only `verified: "undone"` asks become tasks; done and unclear ones never do. An ask already tracked (its id in a task's line 1, in the
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
	static FOLD = { "ai/sessions": "ai", "ai/tasks": "ai" };   // pages inside ai/ whose tasks live in the ai home (ai/tasks/ is that home itself)
	static PRESSED = new Set(["stalled", "queued", "pressed"]);   // ledger statuses that mean the owner is waiting on it
	static OVERLAP = 0.6;
	static MIN_SHARED = 3;
	static MAX_TITLE = 80;

	constructor({ root = HERE, parent = UndoneToTasks.PARENT, now = () => new Date().toISOString() } = {}){
		this.root = root; this.parent = parent; this.now = now;
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
		return data.modules.flatMap(m => m.asks.filter(a => a.verified === "undone").map(a => ({ ...a, module: UndoneToTasks.home_of(m.module) })));
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
			create.push({ ask: a.id, module: a.module, title, source: a.source, description: a.verified_evidence ?? a.evidence ?? "", priority: UndoneToTasks.priority(a), days: a.days });
		}
		return { create, tracked, no_module };
	}

	// ---- applying ----------------------------------------------------------------------------------

	/** Creates each task through run_item (the item tool's function), one at a time. Returns [{ask, task}] and the refusals. */
	async create(list){
		const { run_item } = await import(pathToFileURL(path.join(this.root, "Servex/agents/page_tools.js")).href);
		const made = [], refused = [];
		for (const t of list){
			const add = { title: t.title, module: t.module, source: t.source, ask: t.ask, description: t.description, priority: t.priority };
			let r = await run_item({ path: this.parent, delta: { tasks: { add } } }, { caller: UndoneToTasks.BY }, true);
			if (!r.ok && r.suggest){ r = await run_item({ path: this.parent, delta: { tasks: { add: { ...add, id: r.suggest } } } }, { caller: UndoneToTasks.BY }, true); }
			if (r.ok && r.homes?.[0]) made.push({ ask: t.ask, task: r.homes[0].path, module: t.module });
			else refused.push({ ask: t.ask, why: r.why ?? "no home made" });
		}
		return { made, refused };
	}

	/** Manifest lines (append-only) and the `task` field on each ask in undone.json (merge by id, nothing else touched). */
	record(made){
		const man = this.file(UndoneToTasks.MANIFEST), at = this.now();
		fs.mkdirSync(path.dirname(man), { recursive: true });
		if (made.length) fs.appendFileSync(man, made.map(m => JSON.stringify({ ask: m.ask, task: m.task, module: m.module, at })).join(NL) + NL);
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
		const marked = this.record(made);
		const homes = TaskHomes.sync({ write: true });
		return { plan, made, refused, marked, carrying: this.carrying() - before, homes_added: homes.missing.length };
	}

	/** How many verified-undone asks carry a `task` field right now. */
	carrying(){
		const data = JSON.parse(fs.readFileSync(this.file(UndoneToTasks.DATA), "utf8"));
		return data.modules.reduce((n, m) => n + m.asks.filter(a => a.task).length, 0);
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
	const u = new UndoneToTasks({ root: arg("--root") ?? HERE, parent: arg("--parent") ?? UndoneToTasks.PARENT });
	if (process.argv.includes("--apply")){
		const r = await u.apply();
		console.log(UndoneToTasks.report(r.plan).split(NL)[0]);
		console.log(`created: ${r.made.length}   refused: ${r.refused.length}   asks marked: ${r.marked}   carrying grew by: ${r.carrying}   homes added to /tasks/: ${r.homes_added}`);
		for (const x of r.refused) console.log(`  refused ${x.ask}: ${x.why}`);
	} else console.log(UndoneToTasks.report(u.plan()));
}
