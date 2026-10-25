// node Servex/agents/voice-backfill.mjs [--apply] [--manifest <file>] [--force]
// Moves every old voice-session record (`<page>ai/v-<id>.jsonl`, written before voice sessions lived in the dated store) to
// public/framework/ai/sessions/YYYY/MM/DD/v-<id>/session.jsonl (its .summary.json goes with it as session.summary.json), the day it
// was opened. Dry run by default: it prints the manifest and moves nothing. Never deletes, never overwrites: a destination that
// already exists is listed as a conflict and left alone. A file written in the last 2 minutes is skipped (a session is still using it)
// unless --force. sessions.json is NOT edited here: Servex repoints each session's `file` itself on its next start (Sessions.relocate).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = process.env.BACKFILL_REPO ? path.resolve(process.env.BACKFILL_REPO) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");   // BACKFILL_REPO: another checkout, or a test tree
const PUBLIC = path.join(REPO, "public");
const STORE = path.join(PUBLIC, "framework", "ai", "sessions");
const SKIP_DIRS = new Set(["node_modules", ".git", "fixture", "fixtures"]);
const p2 = n => String(n).padStart(2, "0");

/** Every old-style voice record under `root`: a `v-<id>.jsonl` whose first line is `{session:{id}}` for that same id, outside the dated store's own v-<id>/ folders. */
export function find_records(root = PUBLIC){
	const out = [];
	const walk = dir => {
		let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of entries){
			const full = path.join(dir, e.name);
			if (e.isDirectory()){ if (!SKIP_DIRS.has(e.name)) walk(full); continue; }
			const m = /^(v-[a-z0-9]+)\.jsonl$/.exec(e.name);
			if (!m) continue;
			let head; try { head = JSON.parse(fs.readFileSync(full, "utf8").split("\n", 1)[0])?.session; } catch { continue; }
			if (head?.id === m[1]) out.push({ id: m[1], file: full, at: head.at });
		}
	};
	walk(root);
	return out;
}

/** The manifest: one row per record, with where it goes and whether it can move. */
export function plan(records, { force = false, now = Date.now() } = {}){
	return records.map(r => {
		const d = new Date(r.at), t = Number.isFinite(+d) ? d : fs.statSync(r.file).birthtime;
		const dir = path.join(STORE, String(t.getFullYear()), p2(t.getMonth() + 1), p2(t.getDate()), r.id);
		const summary = r.file.replace(/\.jsonl$/, ".summary.json");
		const row = { id: r.id, from: path.relative(REPO, r.file).split(path.sep).join("/"), to: path.relative(REPO, path.join(dir, "session.jsonl")).split(path.sep).join("/"),
			summary: fs.existsSync(summary) ? { from: path.relative(REPO, summary).split(path.sep).join("/"), to: path.relative(REPO, path.join(dir, "session.summary.json")).split(path.sep).join("/") } : null, status: "move" };
		if (fs.existsSync(path.join(dir, "session.jsonl")) || (row.summary && fs.existsSync(path.join(REPO, row.summary.to)))) row.status = "conflict: destination exists";
		else if (!force && now - fs.statSync(r.file).mtimeMs < 120000) row.status = "skipped: written in the last 2 minutes";
		return row;
	});
}

export function apply(rows){
	let moved = 0;
	for (const r of rows){
		if (r.status !== "move") continue;
		const from = path.join(REPO, r.from), to = path.join(REPO, r.to);
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.renameSync(from, to);
		if (r.summary) fs.renameSync(path.join(REPO, r.summary.from), path.join(REPO, r.summary.to));
		r.status = "moved"; moved++;
	}
	return moved;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2), go = args.includes("--apply"), force = args.includes("--force");
	const mi = args.indexOf("--manifest"), manifest = mi >= 0 ? args[mi + 1] : null;
	const rows = plan(find_records(), { force });
	const moved = go ? apply(rows) : 0;
	const by = {}; for (const r of rows) by[r.status.split(":")[0]] = (by[r.status.split(":")[0]] ?? 0) + 1;
	if (manifest) fs.writeFileSync(manifest, JSON.stringify({ at: new Date().toISOString(), applied: go, rows }, null, 1) + "\n");
	for (const r of rows) console.log(`${r.status.padEnd(10).slice(0, 10)} ${r.from} -> ${r.to}`);
	console.log(`${go ? "applied" : "dry run"}: ${rows.length} records (${Object.entries(by).map(([k, v]) => `${v} ${k}`).join(", ")})${go ? `, ${moved} moved` : ""}${manifest ? `; manifest ${manifest}` : ""}`);
}
