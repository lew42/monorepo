// The dry run of "no silent endings" (Servex/OpenItems.js, off unless SERVEX_OPEN_ITEMS=on): walks the session store and says what the rule
// would file, writing nothing into the repo.
//   node Servex/OpenItems.mjs --dry-run [--days 7] [--out <file>]
// Counts: records read, nodes (a session or task) that are settled but scored under 1 or not at all, and how many closeout tasks would be
// filed (Task#closeout_line: a settled node with something still open and no unsettled closeout task). Five examples print; the full list
// goes to --out (default: the OS temp folder, never the repo).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Task from "../public/framework/core/Task/Task.js";
import OpenItems from "./OpenItems.js";

const DAY = /^(\d{4})\/(\d{2})\/(\d{2})$/;

/** Every session.jsonl / task.jsonl under the dated folders of `sessions` from `since` ("YYYY-MM-DD") on, nested records included. */
export function records(sessions, since){
	const out = [], walk = dir => {
		let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of es){
			if (e.isDirectory()){ if (e.name !== "node_modules") walk(path.join(dir, e.name)); }
			else if (OpenItems.FILES.test(e.name)) out.push(path.join(dir, e.name));
		}
	};
	for (const y of fs.readdirSync(sessions).filter(n => /^\d{4}$/.test(n))) for (const m of fs.readdirSync(path.join(sessions, y)).filter(n => /^\d{2}$/.test(n))) for (const d of fs.readdirSync(path.join(sessions, y, m)).filter(n => /^\d{2}$/.test(n))){
		if (`${y}-${m}-${d}` >= since) walk(path.join(sessions, y, m, d));
	}
	return out.sort();
}

/** The report for the records in `files`: { records, closed_under_1, no_score, would_file, list: [{file, node, score, open: [titles], line}] }. */
export function dry_run(files, root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), at = new Date().toISOString()){
	const r = { records: 0, closed_under_1: 0, no_score: 0, would_file: 0, list: [] };
	for (const file of files){
		const lines = OpenItems.read_lines(file);
		if (!lines.length) continue;
		r.records++;
		let after; try { after = OpenItems.replay(lines); } catch { continue; }
		for (const { node, ids } of OpenItems.nodes(after)){
			if (Task.is_closeout(node) || !Task.settled(node)) continue;
			const score = node.completion_score();
			if (score === 1) continue;
			if (score === null) r.no_score++; else r.closed_under_1++;
			const line = node.closeout_line(at);
			if (!line) continue;
			r.would_file++;
			r.list.push({ file: path.relative(root, file).split(path.sep).join("/"), node: ids.join("/") || "(the record)", score: Task.show(score), open: node.open_items().map(i => `${i.title} (${i.id}, ${i.state})`), id: line.tasks.add.id });
		}
	}
	return r;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
	if (!process.argv.includes("--dry-run")){ console.log("usage: node Servex/OpenItems.mjs --dry-run [--days 7] [--out <file>]   (the filing itself is off unless SERVEX_OPEN_ITEMS=on)"); process.exit(0); }
	const days = Number(arg("--days", 7)), since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
	const sessions = path.join(OpenItems.public_root, "framework/ai/sessions"), root = path.dirname(OpenItems.public_root);
	const out = arg("--out", path.join(os.tmpdir(), "open-items-dry-run.json"));
	const r = dry_run(records(sessions, since), root);
	fs.writeFileSync(out, JSON.stringify(r, null, 1));
	console.log(`OpenItems dry run, ${days} days (since ${since}): ${r.records} records read`);
	console.log(`  settled nodes scored under 1: ${r.closed_under_1}; settled with no score (needs review): ${r.no_score}`);
	console.log(`  open-items tasks it WOULD file: ${r.would_file}   (nothing was written; filing is ${OpenItems.on ? "ON" : "off"})`);
	for (const x of r.list.slice(0, 5)) console.log(`  - ${x.file} :: ${x.node} (${x.score}) open: ${x.open.slice(0, 4).join("; ")}${x.open.length > 4 ? ` … +${x.open.length - 4}` : ""}`);
	console.log(`  full list: ${out}`);
}
