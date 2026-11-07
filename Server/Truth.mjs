#!/usr/bin/env node
// Server/Truth.mjs — the truth numbers: how true is the session/task record? No AI; every number comes from the real classes.
//   node Server/Truth.mjs [--write] [--root <repo>] [--label "baseline ..."]
// --write appends ONE line to public/live/truth/truth.jsonl (of the repo it runs in). --root reads the sessions of another tree (read-only).
// Sessions: SessionFolders.homes(); tasks: Task.replay(...).tally() / completion_score() (the same calls Server/session-query.mjs --report uses).
// Twins: SessionConsolidate.check. Doc: public/live/truth/readme.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read_lines = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const record_files = (d, depth = 0) => { let out = []; let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return out; } for (const e of es){ if (e.isFile() && (e.name === "session.jsonl" || e.name === "task.jsonl")) out.push(path.join(d, e.name)); else if (e.isDirectory() && depth < 4) out = out.concat(record_files(path.join(d, e.name), depth + 1)); } return out; };
const empty = () => ({ sessions: 0, with_log: 0, tag_only: 0, transcript_only: 0, with_tasks: 0, no_tasks: 0, complete: 0, needs_review: 0, done_tasks: 0, unproven: 0, no_commit: 0, prompts: 0, prompts_unfiled: 0, sessions_unfiled: 0 });

/** Every date-level folder (sessions/YYYY/MM/DD/<folder>/): how many, and how many hold no session file at all (no record, no index.json/cache.jsonl) or nothing. */
export function folder_stats(root){
	const f = { total: 0, no_session_file: 0, empty: 0 }, dirs = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };
	for (const y of dirs(root)) if (/^\d{4}$/.test(y)) for (const m of dirs(path.join(root, y))) if (/^\d\d$/.test(m)) for (const d of dirs(path.join(root, y, m))) if (/^\d\d$/.test(d)) for (const n of dirs(path.join(root, y, m, d))){
		const names = fs.readdirSync(path.join(root, y, m, d, n)); f.total++;
		if (!names.length) f.empty++;
		if (!names.some(x => /^(session\.jsonl|task\.jsonl|index\.json|cache\.jsonl)$/.test(x))) f.no_session_file++;
	}
	return f;
}

/** measure({ root, days }) -> { all, week, twins, flat, ... }. `root` is the repo whose sessions are counted. */
export async function measure({ root = HERE, days = 7, now = new Date() } = {}){
	const { default: SessionFolders } = await import("../public/framework/core/Session/SessionFolders.mjs");
	const { default: SessionRecord } = await import("./SessionRecord.mjs");
	const { default: Task } = await import("../public/framework/core/Task/Task.js");
	const { default: Session } = await import("../public/framework/core/Session/Session.js");
	const store = SessionFolders.at(path.join(root, "public/framework/ai/sessions")), pub = path.join(root, "public");
	const cut = new Date(now.getTime() - days * 864e5), cut_day = [cut.getFullYear(), String(cut.getMonth() + 1).padStart(2, "0"), String(cut.getDate()).padStart(2, "0")].join("/");
	const keep = [Task.resolver, Task.session_resolver, console.warn]; console.warn = () => {};
	Task.resolver = u => { const d = path.resolve(pub, String(u).replace(/^\/+/, "")), ls = read_lines(SessionRecord.log_file(d) ?? path.join(d, "task.jsonl")); return ls.length ? ls : null; };
	Task.session_resolver = u => { const d = path.resolve(pub, String(u ?? "").replace(/^\/+/, "")); return path.basename(SessionRecord.file(d) ?? "") === "session.jsonl"; };
	const all = empty(), week = empty();
	try {
		store.adopt_nested();
		for (const { id, dir } of store.homes()){
			const day = path.relative(store.root, dir).split(path.sep).slice(0, 3).join("/");
			const rdir = store.record_of(id) ?? dir, file = SessionRecord.log_file(rdir), lines = file ? read_lines(file) : [], has_file = !!SessionRecord.file(rdir);
			let tally = null, score = 0;
			if (lines.length){ try { const s = (lines[0]?.session ? Session : Task).replay(lines); tally = s.tally(); score = s.completion_score(); } catch {} }
			const has_tasks = !!tally && tally.created > 0;
			const said = lines.filter(l => l.type === "Prompt" || l.content?.add?.type === "Prompt" || l.tasks?.add?.type === "Prompt").length;
			const committed = lines.some(l => l.commit) || [...new Set([rdir, dir])].flatMap(d => record_files(d)).some(f => /"commit":/.test(fs.readFileSync(f, "utf8")));
			const bins = day >= cut_day ? [all, week] : [all];
			for (const b of bins){
				b.sessions++; if (lines.length) b.with_log++; else if (has_file) b.tag_only++; else b.transcript_only++;
				if (has_tasks){ b.with_tasks++; if (score === 1) b.complete++; b.done_tasks += tally.finished; b.unproven += tally.unproven; }
				else { b.no_tasks++; b.needs_review++; if (said){ b.prompts_unfiled += said; b.sessions_unfiled++; } }
				b.prompts += said;
				if (!committed) b.no_commit++;
			}
		}
	} finally { [Task.resolver, Task.session_resolver, console.warn] = keep; }
	const { default: SessionConsolidate } = await import("./SessionConsolidate.mjs");
	const c = await SessionConsolidate.check(root), twins = c.count, flat = c.flat.length;
	return { all, week, twins, flat, folders: folder_stats(store.root) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), arg = k => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
	const root = arg("--root") ? path.resolve(arg("--root")) : HERE;
	const m = await measure({ root }), line = { truth: { at: new Date().toISOString(), ...(arg("--label") ? { label: arg("--label") } : {}), ...m } };
	// the second numbers that must agree
	for (const k of ["all", "week"]) if (m[k].with_tasks + m[k].no_tasks !== m[k].sessions) { console.error(`DISAGREE ${k}: with ${m[k].with_tasks} + no ${m[k].no_tasks} != ${m[k].sessions}`); process.exit(2); }
	console.log(JSON.stringify(line));
	if (process.argv.includes("--write")){
		const out = path.join(HERE, "public/live/truth/truth.jsonl"); fs.mkdirSync(path.dirname(out), { recursive: true });
		fs.appendFileSync(out, JSON.stringify(line) + "\n");
	}
	process.exit(0);
}
