#!/usr/bin/env node
// Server/Unclose.mjs — re-close history without lying: a task StaleClose marked "abandoned" that has real work in its log becomes `unclosed`.
//   node Server/Unclose.mjs --plan      dry run: list them (count by creator); writes nothing        (default)
//   node Server/Unclose.mjs --apply     append ONE {"unclosed":…} line to each task.jsonl and one row to the manifest
// Append-only: no line is rewritten, nothing is deleted; the manifest (ai/unclose-manifest.jsonl) lists every file touched, so it can be audited.
// Idempotent: a log that already has an `unclosed` line is skipped. Doc: Server/doc/stale-close.md ("Unclosed").
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import TaskDirs from "./TaskDirs.mjs";
import StaleClose from "./StaleClose.mjs";
import AIIndex from "./AIIndex.mjs";

const slash = p => p.split(path.sep).join("/");
const day = () => new Date().toLocaleDateString("sv");

export default class Unclose {
	static BY = "Unclose";
	static MANIFEST = path.join(TaskDirs.AI, "unclose-manifest.jsonl");

	/** `root` is the repo root; `append(target, obj)` is the one validated writer (a test passes its own). */
	constructor({ root = TaskDirs.REPO, append = StaleClose.append, manifest = Unclose.MANIFEST } = {}){ this.root = root; this.append = append; this.manifest = manifest; this.plan = []; }

	/** Every task.jsonl under public/, newest folder order not needed. */
	files(dir = path.join(this.root, "public"), out = []){
		let ents = []; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
		for (const e of ents){
			if (e.name === "node_modules" || e.name === ".git") continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) this.files(p, out); else if (e.name === "task.jsonl") out.push(p);
		}
		return out;
	}

	/** Who made the task, by the same words the task census uses: mastermind, minion, voice, servex, other-agent or tab. */
	static creator(lines){
		const a = Object.assign({}, ...lines.filter(l => l.assign).map(l => l.assign)), s = String(a.agent || a.by || ""), tab = String(a.tab || "");
		if (/^mastermind|task-mastermind|sub-mastermind/.test(s)) return "mastermind";
		if (/^minion/.test(s)) return "minion";
		if (/voice|cloud/.test(s + tab)) return "voice";
		if (/servex|StaleClose|heartbeat|TaskLoop|node|append|quick-fix/i.test(s)) return "servex";
		return s ? "other-agent" : "tab";
	}

	/** The abandoned tasks that did real work: stopped by a stop line saying abandoned/StaleClose, no `unclosed` yet, StaleClose.worked(lines). */
	scan(){
		const pub = path.join(this.root, "public");
		this.plan = [];
		for (const file of this.files()){
			let text; try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
			if (!/abandon|StaleClose/.test(text) || text.includes('"unclosed"')) continue;
			const lines = AIIndex.parse(text);
			const stop = [...lines].reverse().find(l => l.stop && typeof l.stop === "object");
			if (!stop || !/abandon|StaleClose/.test(JSON.stringify(stop.stop))) continue;
			if (AIIndex.fold(lines, pub).state !== "stopped") continue;   // reopened or completed since: not abandoned any more
			if (!StaleClose.worked(lines)) continue;
			this.plan.push({ file, dir: slash(path.relative(this.root, path.dirname(file))), lines: lines.filter(l => !l.stop).length, by: Unclose.creator(lines), stopped: stop.stop.at ?? null });
		}
		return this.plan;
	}

	by_creator(){ const n = {}; for (const r of this.plan) n[r.by] = (n[r.by] || 0) + 1; return n; }

	/** One `unclosed` line per planned task, then one manifest row. Returns the dirs touched. */
	apply(){
		const done = [];
		for (const r of this.plan){
			const why = `unclosed: ${r.lines} log lines of work, never completed; was closed as abandoned ${r.stopped ?? "earlier"}; re-closed by Unclose ${day()}`;
			this.append(r.file, { unclosed: { at: "NOW", why, by: Unclose.BY } });
			this.append(this.manifest, { op: "unclosed", at: "NOW", dir: r.dir, file: slash(path.relative(this.root, r.file)), lines: r.lines, creator: r.by, why, by: Unclose.BY });
			done.push(r.dir);
		}
		return done;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))){
	const argv = process.argv.slice(2), u = new Unclose();
	u.scan();
	console.log(JSON.stringify({ mode: argv.includes("--apply") ? "apply" : "plan", unclosed: u.plan.length, by_creator: u.by_creator() }));
	if (argv.includes("--apply")) console.log(JSON.stringify({ appended: u.apply().length, manifest: slash(path.relative(u.root, u.manifest)) }));
	else for (const r of u.plan.slice(0, 15)) console.log(`${r.by.padEnd(10)} ${String(r.lines).padStart(3)} lines  ${r.dir}`);
}
