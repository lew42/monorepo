#!/usr/bin/env node
// Server/FoldAccounting.mjs — checks the twins fold (fold-manifest.json): nothing a moved-aside half knew was lost in the merged record. Read only.
//   node Server/FoldAccounting.mjs [--write] [--root <repo>] [--manifest <file>]
// Cost = the newest `summary.usd` in cache.jsonl (what AISession.summary_of reads); tasks = Session/Task replay tally().created of the record (what Truth.mjs reads).
// A merged cost that is missing or 0 (a worktree has no cache.jsonl, they are not in git) is `unreadable`, never counted as lost.
// A twin pair is two records of ONE session, so the halves are not added (that would count it twice): the merged value must be >= each half's.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = "public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/one-folder/fold-manifest.json";
const lines_of = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const first_file = (dir, names) => names.map(n => path.join(dir, n)).find(f => fs.existsSync(f)) ?? null;

export default class FoldAccounting {
	constructor({ root = HERE, manifest = path.join(root, MANIFEST), Session, Task } = {}){ Object.assign(this, { root, manifest, Session, Task }); }

	static async at(opts = {}){
		const { default: Session } = await import("../public/framework/core/Session/Session.js");
		const { default: Task } = await import("../public/framework/core/Task/Task.js");
		return new FoldAccounting({ ...opts, Session, Task });
	}

	summary(dir){ let s = null; for (const o of lines_of(path.join(dir, "cache.jsonl"))) if (o.summary) s = o.summary; return s; }
	cost(dir){ return this.summary(dir)?.usd ?? null; }

	tasks(dir){
		const file = first_file(dir, ["session.jsonl", "task.jsonl"]); if (!file) return null;
		const lines = lines_of(file); if (!lines.length) return null;
		const keep = console.warn; console.warn = () => {};
		try { return (lines[0]?.session ? this.Session : this.Task).replay(lines).tally().created ?? 0; } catch { return null; } finally { console.warn = keep; }
	}

	/** run() -> { run, totals, mismatches }. Per session: each moved-aside half against the merged home. */
	run(){
		const m = JSON.parse(fs.readFileSync(this.manifest, "utf8")), tot = { sessions: 0, matching: 0, mismatched: 0, lost: 0, unreadable: 0, cost_before: 0, cost_after: 0, tasks_before: 0, tasks_after: 0 }, mismatches = [];
		for (const g of Object.values(m.groups)){
			if (!g.moved_aside) continue;
			const home = path.join(this.root, g.home), cost_after = this.cost(home), tasks_after = this.tasks(home);
			let cost_before = 0, tasks_before = 0; const bad = [], halves = [];
			for (const dup of g.duplicates){
				const half = path.join(g.moved_aside, dup); if (!fs.existsSync(half)) continue;
				halves.push(half); const c = this.cost(half), t = this.tasks(half);
				cost_before = Math.max(cost_before, c ?? 0); tasks_before = Math.max(tasks_before, t ?? 0);
				if ((c ?? 0) > (cost_after ?? 0) + 1e-9) { const vh = this.summary(half)?.v ?? 0, vm = this.summary(home)?.v ?? 0; bad.push({ number: "cost", before: c, after: cost_after ?? 0, half, cause: !(cost_after > 0) ? "unreadable: merged cost is missing or 0" : vm > vh ? `reader: merged cache is v${vm}, half v${vh}` : "lost" }); }
				if ((t ?? 0) > (tasks_after ?? 0)) bad.push({ number: "tasks", before: t, after: tasks_after ?? 0, half });
			}
			tot.sessions++; tot.cost_before += cost_before; tot.cost_after += Math.max(cost_after ?? 0, 0); tot.tasks_before += tasks_before; tot.tasks_after += tasks_after ?? 0;
			if (bad.length){ tot.mismatched++; if (bad.some(b => b.cause === "lost" || b.number === "tasks")) tot.lost++; else if (bad.some(b => b.cause.startsWith("unreadable"))) tot.unreadable++; mismatches.push({ session: g.session, home: g.home, diffs: bad }); } else tot.matching++;
		}
		tot.cost_before = +tot.cost_before.toFixed(4); tot.cost_after = +tot.cost_after.toFixed(4);
		return { run: m.run, totals: tot, mismatches };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), arg = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
	const root = arg("--root") ? path.resolve(arg("--root")) : HERE;
	const r = (await FoldAccounting.at({ root, ...(arg("--manifest") ? { manifest: path.resolve(arg("--manifest")) } : {}) })).run();
	console.log(JSON.stringify(r.totals)); for (const x of r.mismatches.slice(0, 20)) console.log(JSON.stringify(x));
	process.exit(r.totals.mismatched ? 1 : 0);
}
