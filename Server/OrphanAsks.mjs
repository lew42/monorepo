#!/usr/bin/env node
/**
 * class OrphanAsks — an open ask whose owner agent is gone becomes an idle task in its module home, never lost.
 * Extends UndoneToTasks (same homes scan, same overlap match, same item-tool create); the only new rules are WHICH asks (FollowUp's own
 * "open asks with no live owner", so the two scripts cannot disagree) and WHERE (the module home). Doc: public/framework/ai/doc/follow-up.md.
 *
 *   node Server/OrphanAsks.mjs --plan     lists each orphaned ask, its home, whether a task for it already exists; writes nothing
 *   node Server/OrphanAsks.mjs --apply    appends a `tracked` line to asks.jsonl for each, creates the missing idle tasks, writes the manifest
 *   --parent <url>   the task the new ones are filed under (default: this run's own task folder)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import AskIndex from "./AskIndex.mjs";
import FollowUp from "./FollowUp.mjs";
import TaskHomes from "./TaskHomes.mjs";
import UndoneToTasks from "./UndoneToTasks.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NL = String.fromCharCode(10);

export default class OrphanAsks extends UndoneToTasks {

	static MANIFEST = "public/framework/ai/asks/orphan-asks.jsonl";
	static LEDGER = "public/framework/ai/asks.jsonl";
	static PARENT = "/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/orphan-asks/";
	static BY = "OrphanAsks";
	/** The word before the colon in a ledger title -> its module home. The ledger rows carry no module, so this is the routing. */
	static HINTS = { merges: "servex", templates: "core/Page", logs: "ext/JSONL", ui: "ui", servex: "servex", selection: "ux", "task pages": "core/Task", padding: "styles", monitor: "servex", worktrees: "servex", shell: "dev", dictation: "ux/Dictate", grip: "ux", inbox: "ux/Inbox", "ai 2": "ai", "now card": "ai", "ai systems": "ai" };
	static FALLBACK = "ai";

	/** The orphaned asks: FollowUp's own list, each with a stable id (the ledger id, else a hash of its card or title). */
	async orphans(){
		const f = await new FollowUp().run();
		this.followup = f;
		return f.asks.map(a => ({ ...a, id: a.id ?? "orphan-" + crypto.createHash("sha1").update(a.card || a.title).digest("hex").slice(0, 10) }));
	}

	/** Module home for an ask: its own `module`, else the title's label (HINTS), else the best word overlap with a task home's path and readme, else `ai`. */
	module_of(a){
		const ok = m => m && fs.existsSync(this.file(UndoneToTasks.FW + "/" + m));
		if (ok(a.module)) return { module: a.module, how: "routed" };
		const label = a.title.split(":")[0].trim().toLowerCase(), hint = OrphanAsks.HINTS[label];
		if (ok(hint)) return { module: hint, how: "label" };
		const W = AskIndex.words(a.title), t = { best: null, shared: 1 };
		for (const m of this.module_names()){
			const readme = path.join(this.file(UndoneToTasks.FW), m, "readme.md");
			let text = m.replace(/[\/-]/g, " "); try { text += " " + fs.readFileSync(readme, "utf8").split(NL).slice(0, 30).join(" "); } catch {}
			const { shared } = UndoneToTasks.overlap(W, AskIndex.words(text));
			if (shared > t.shared){ t.best = m; t.shared = shared; }
		}
		return t.best ? { module: t.best, how: "words" } : { module: OrphanAsks.FALLBACK, how: "default" };
	}
	module_names(){ return (this._names ??= TaskHomes.sync().homes.map(h => h.replace(/^\/framework\//, "").replace(/\/tasks\/$/, ""))); }

	/** UndoneToTasks.homes() plus the words of each task's title, description and request, so a text match finds a task the undone pipeline made. */
	homes(){
		const out = super.homes();
		for (const list of out.values()) for (const t of list){
			try {
				const first = UndoneToTasks.read(path.join(this.root, "public", t.path, "task.jsonl"))[0] ?? {};
				t.words = AskIndex.words([t.title, first.description, first.brief, first.assign?.request].filter(x => typeof x === "string").join(" "));
			} catch {}
		}
		return out;
	}

	/** A readable link to the ask's source prompt: the file when it still exists (the old dated `ai/2026-09-30/x/` dirs moved under sessions), else the raw path. */
	source_of(words){
		if (!words) return "";
		const rel = words.replace(/^public\/framework\//, ""), fw = this.file(UndoneToTasks.FW);
		if (fs.existsSync(path.join(fw, rel))) return "/framework/" + rel;
		const m = rel.match(/^ai\/(\d{4})-(\d\d)-(\d\d)\/([^/]+)\/(.+)$/);
		if (m){
			const day = path.join(fw, "ai/sessions", m[1], m[2], m[3]);
			const walk = (d, depth) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return null; }
				for (const e of es) if (e.isDirectory()){ const p = path.join(d, e.name); if (e.name === m[4] && fs.existsSync(path.join(p, m[5]))) return p; const r = depth < 4 && walk(p, depth + 1); if (r) return r; } return null; };
			const hit = walk(day, 0);
			if (hit) return "/" + path.relative(path.join(this.root, "public"), path.join(hit, m[5])).split(path.sep).join("/");
		}
		return words;
	}

	/** { create, tracked, no_module, all }: `no_module` are asks that fell back to `ai` for want of any better home. Nothing is written. */
	async plan(){
		const asks = await this.orphans(), homes = this.homes(), done = this.manifest();
		const create = [], tracked = [], no_module = [];
		for (const a of asks){
			const { module, how } = this.module_of(a);
			if (how === "default") no_module.push(a);
			if (done.has(a.id)){ tracked.push({ ask: a, by: "manifest", task: done.get(a.id).task }); continue; }
			const W = AskIndex.words(a.title + " " + (a.note ?? ""));
			let hit = null;
			for (const list of homes.values()) for (const t of list){
				if (t.ask === a.id){ hit = { t, share: 1, by: "ask id" }; continue; }
				const r = UndoneToTasks.overlap(W, t.words), shared = r.shared, share = Math.max(r.share, shared / (W.size || 1));   // coverage: a long task text still holds a short ask
				if (shared >= UndoneToTasks.MIN_SHARED && share > UndoneToTasks.OVERLAP && (!hit || share > hit.share)) hit = { t, share, by: `text ${Math.round(share * 100)}%` };
			}
			if (hit){ tracked.push({ ask: a, by: hit.by, task: hit.t.path }); continue; }
			const source = this.source_of(a.words);
			const description = `${a.title}${a.note ? ". " + a.note : ""}. Asked ${String(a.at ?? "").slice(0, 10)}; the asks ledger routed it (${a.status}) to "${a.owner}", which was never spawned or is gone, so nothing would ever have built it. Source prompt: ${source || "(none recorded)"}.`;
			create.push({ ask: a.id, module, how, title: UndoneToTasks.title(a.title), source, description, priority: { score: 3, why: `an orphaned ask from ${String(a.at ?? "").slice(0, 10)}`, by: OrphanAsks.BY }, row: a });
		}
		return { create, tracked, no_module, total: asks.length };
	}

	/** Append-only: a `tracked` line per ask in the ledger (same card/title key, so FollowUp's last-line-wins read drops it from "open") plus manifest lines. */
	record_orphans(rows){
		const at = this.now(), led = this.file(OrphanAsks.LEDGER), man = this.file(OrphanAsks.MANIFEST);
		if (!rows.length) return 0;
		fs.mkdirSync(path.dirname(man), { recursive: true });
		fs.appendFileSync(led, rows.map(r => JSON.stringify({ ask: { id: r.ask.id, title: r.ask.title, card: r.ask.card ?? "", status: "tracked", task: r.task, was_owner: r.ask.owner, by: OrphanAsks.BY, at } })).join(NL) + NL);
		fs.appendFileSync(man, rows.map(r => JSON.stringify({ ask: r.ask.id, task: r.task, module: r.module, how: r.how, at })).join(NL) + NL);
		return rows.length;
	}

	async apply(){
		const plan = await this.plan(), before = plan.total;
		const { made, refused } = await this.create(plan.create);
		const by_ask = new Map(plan.create.map(c => [c.ask, c]));
		const rows = [
			...plan.tracked.filter(t => t.by !== "manifest").map(t => ({ ask: t.ask, task: t.task, module: null, how: "matched (" + t.by + ")" })),
			...made.map(m => ({ ask: by_ask.get(m.ask).row, task: m.task, module: m.module, how: "created" })),
		];
		const recorded = this.record_orphans(rows);
		const homes = TaskHomes.sync({ write: true });
		return { plan, before, made, refused, recorded, homes_added: homes.missing.length };
	}

	static report(plan){
		const by = {};
		for (const t of plan.create) by[t.module] = (by[t.module] ?? 0) + 1;
		return [
			`orphaned asks: ${plan.total}   already tracked: ${plan.tracked.length}   to create: ${plan.create.length}   no module (fell back to ${OrphanAsks.FALLBACK}): ${plan.no_module.length}`,
			...plan.create.map(t => `  create [${t.how}] ${t.module}/tasks/  ${t.title}`),
			...plan.tracked.map(t => `  tracked [${t.by}] ${t.ask.title}  ->  ${t.task}`),
		].join(NL);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
	const o = new OrphanAsks({ root: HERE, parent: arg("--parent") ?? OrphanAsks.PARENT });
	if (process.argv.includes("--apply")){
		const r = await o.apply();
		console.log(OrphanAsks.report(r.plan));
		console.log(`before: ${r.before} open asks with no live owner   created: ${r.made.length}   refused: ${r.refused.length}   ledger/manifest lines: ${r.recorded}   homes added to /tasks/: ${r.homes_added}`);
		for (const x of r.refused) console.log(`  refused ${x.ask}: ${x.why}`);
	} else console.log(OrphanAsks.report(await o.plan()));
	process.exit(0);
}
