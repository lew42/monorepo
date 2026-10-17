// Freezes a few REAL old tasks (and the module files they need) into fixture.json, so the tests run on a copy, never the tree.
//   node public/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/make-fixture.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import TaskMigrate from "../../../../../../../../../Server/TaskMigrate.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const m = new TaskMigrate();
const rows = m.plan();
const small = r => Buffer.byteLength(r.t.raw) < 40000;
const pick = (f, n) => rows.filter(r => small(r) && f(r)).slice(0, n);
const chosen = [
	...pick(r => r.d.action === "move" && r.d.by === "prefix" && Task_state(r) === "complete", 2),
	...pick(r => r.d.action === "move" && r.d.by === "brief", 1),
	...pick(r => r.d.action === "move" && r.d.by === "files+reqpath", 1),
	...pick(r => r.d.action === "move" && Task_state(r) !== "complete", 2),
	...pick(r => r.d.action === "move" && r.t.lines.some(l => l.commit), 1),
	...pick(r => r.d.action === "move" && r.d.module === "servex", 1),   // servex/tasks already exists: the list-exists path
	...pick(r => /^unclear: no signal/.test(r.d.reason ?? ""), 1),
	...pick(r => /^unclear: signals disagree/.test(r.d.reason ?? ""), 1),
];
function Task_state(r){ return m.state_label(r).split(" ")[0]; }

const files = {};
const add = abs => { const rel = path.relative(m.root, abs).split(path.sep).join("/"); if (!(rel in files) && fs.existsSync(abs)) files[rel] = fs.readFileSync(abs, "utf8"); };
const tasks = [...new Map(chosen.map(r => [r.t.url, r])).values()];
for (const { t, d } of tasks){
	add(t.file);
	add(path.join(t.dir, "requirements.md"));
	for (const mod of new Set([d.module, ...Object.values(d.signals)].filter(Boolean))){
		const parts = mod.split("/");
		for (let i = 1; i <= parts.length; i++){ const dir = path.join(m.framework, ...parts.slice(0, i)); files[path.relative(m.root, path.join(dir, "readme.md")).split(path.sep).join("/")] = "# stub\n"; }
	}
	if (d.list_dir){ add(path.join(d.list_dir, "task.jsonl")); add(path.join(d.list_dir, "files.jsonl")); add(path.join(path.dirname(d.list_dir), "files.jsonl")); }
}
add(path.join(m.root, "tasks", "task.jsonl"));
fs.writeFileSync(path.join(here, "fixture.json"), JSON.stringify({ made: new Date().toISOString(), now: m.now, tasks: tasks.map(r => ({ old: r.t.url, action: r.d.action, reason: r.d.reason ?? null, module: r.d.module, state: Task_state(r) })), files }, null, 1));
console.log(`${tasks.length} tasks, ${Object.keys(files).length} files`);
for (const r of tasks) console.log(`  ${r.d.action} ${r.d.module || "-"} ${Task_state(r)} ${r.t.url}`);
