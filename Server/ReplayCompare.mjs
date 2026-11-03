// Server/ReplayCompare.mjs — does a code change alter what the saved records mean? Replays every session.jsonl and task.jsonl
// under public/framework/ with this checkout's Session / Task classes AND with another checkout's, on the SAME records (this
// checkout's), and lists what differs: state, title, child count, data fields. Nothing is written. Use it before merging a change
// to Item / Task / Session, to know whether old records need a migration. First run: 2026-11-01 (core/doc/status.md).
//   node Server/ReplayCompare.mjs <other checkout>        e.g. a worktree of the commit before the change
//   node Server/ReplayCompare.mjs <other checkout> --json  the full table, one row per record
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SELF = fileURLToPath(import.meta.url), HERE = path.resolve(path.dirname(SELF), "..");
const args = process.argv.slice(2);

// --worker <code root> <data root>: replay with that code, print one JSON object {file: fingerprint}.
if (args[0] === "--worker"){
	const [CODE, DATA] = args.slice(1), PUB = path.join(DATA, "public");
	const load = async p => (await import(pathToFileURL(path.join(CODE, p)).href)).default;
	const Session = await load("public/framework/core/Session/Session.js"), Task = await load("public/framework/core/Task/Task.js");
	const read = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
	Task.resolver = ref => { const ls = read(path.join(PUB, String(ref).replace(/^\//, ""), "task.jsonl")); return ls.length ? ls : null; };
	const write = process.stdout.write.bind(process.stdout);
	console.warn = console.log = () => {};
	const files = [];
	(function walk(d){ let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
		for (const e of es){ const p = path.join(d, e.name);
			if (e.isDirectory()){ if (e.name !== "node_modules" && e.name !== ".git") walk(p); }
			else if (e.name === "session.jsonl" || e.name === "task.jsonl") files.push(p); } })(path.join(PUB, "framework"));
	const hash = v => crypto.createHash("sha1").update(JSON.stringify(v ?? null)).digest("hex").slice(0, 12);
	const out = {};
	for (const f of files){
		const rel = path.relative(PUB, f).split(path.sep).join("/"), Cls = path.basename(f) === "session.jsonl" ? Session : Task;
		try {
			const t = Cls.replay(read(f)), data = t.data ?? null;
			out[rel] = { state: t.state ?? null, title: data?.title ?? null, kids: t._tasks?.length ?? t.tasks?.length ?? null, keys: data ? Object.keys(data).sort() : [], data: hash(data) };
		} catch (e) { out[rel] = { error: String(e?.message ?? e).slice(0, 200) }; }
	}
	write(JSON.stringify(out), () => process.exit(0));   // exit only once a pipe has taken it all (a bare exit cuts it at 64 KB)
} else {

const other = args.find(a => !a.startsWith("--"));
if (!other){ console.error("usage: node Server/ReplayCompare.mjs <other checkout> [--json]"); process.exit(2); }
const run = code => {
	const r = spawnSync(process.execPath, [SELF, "--worker", path.resolve(code), HERE], { encoding: "utf8", maxBuffer: 1 << 28 });
	if (r.status !== 0) { console.error(`replay with ${code} failed:\n${r.stderr}`); process.exit(1); }
	return JSON.parse(r.stdout);
};
const before = run(other), after = run(HERE);
const rows = [], changed = { error: 0, state: 0, title: 0, kids: 0, keys: 0, data: 0 }, fields = {};
for (const f of Object.keys(after)){
	const a = before[f] ?? {}, b = after[f], diff = [];
	for (const k of ["error", "state", "title", "kids", "data"]) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { diff.push(k); changed[k]++; }
	const lost = (a.keys ?? []).filter(k => !b.keys?.includes(k)), gained = (b.keys ?? []).filter(k => !a.keys?.includes(k));
	if (lost.length || gained.length) changed.keys++;
	for (const k of lost) fields["-" + k] = (fields["-" + k] ?? 0) + 1;
	for (const k of gained) fields["+" + k] = (fields["+" + k] ?? 0) + 1;
	if (diff.length) rows.push({ file: f, diff, before: a, after: b });
}
if (args.includes("--json")) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
const total = Object.keys(after).length;
console.log(`${total} records replayed with both versions; ${total - rows.length} identical.`);
console.log(`differ in: error ${changed.error}, state ${changed.state}, title ${changed.title}, children ${changed.kids}, data ${changed.data} (fields: ${JSON.stringify(fields)})`);
for (const r of rows.filter(r => r.diff.some(d => d !== "data")).slice(0, 10)) console.log(`  ${r.file}: ${r.diff.join(", ")}`);
}
