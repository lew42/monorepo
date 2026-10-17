// node Server/landing-audit.mjs <out.md> — verify every worktree/* and michael/* branch ahead of michael/dev.
// Real findings (top): a branch with missing CODE/doc files that belongs to a task with a landing line. Logs, json, images, patches and scratch are noise.
import fs from "node:fs";
import path from "node:path";
import LandingCheck from "./LandingCheck.mjs";
import TaskDirs from "./TaskDirs.mjs";
import SessionIndex from "./SessionIndex.mjs";
import SessionRecord from "./SessionRecord.mjs";
const NOISE = /(\.(jsonl?|png|patch|log|txt)$)|(^|\/)(review|\.scratch[^/]*|scratch)\//;
const tasks = new Map();
for (const t of TaskDirs.list(120)) { try { const x = SessionIndex.reduce(t.key, fs.readFileSync((SessionRecord.log_file(t.dir) ?? path.join(t.dir, "task.jsonl")), "utf8")); const own = { key: t.key, landed: x.landed }; if (x.branch) tasks.set(x.branch, own); tasks.has("worktree/" + t.slug) || tasks.set("worktree/" + t.slug, own); } catch {} }
const names = (LandingCheck.git("branch", "--no-merged", LandingCheck.BASE) ?? "").split("\n").map(s => s.replace(/^[*+ ]+/, "").trim()).filter(b => /^(worktree|michael)\//.test(b));
const rows = names.map(b => { const v = LandingCheck.verify(b); v.code = v.missing.filter(f => !NOISE.test(f)); v.task = tasks.get(b); return v; });
const real = rows.filter(v => v.code.length && v.task?.landed);
const L = ["# Landing audit: every michael/* and worktree/* branch ahead of michael/dev, checked by file content", "",
	`${rows.length} branches, ${rows.filter(v => !v.landed).length} with any missing file, ${rows.filter(v => v.code.length).length} with missing code/doc files, **${real.length} real findings** (missing code/doc files and the task has a landing line).`, "",
	"## Real findings", "", "| branch | task | code files missing |", "|---|---|---|"];
for (const v of real) L.push(`| ${v.branch} | [${path.basename(v.task.key)}](/framework/ai/${v.task.key}/) | ${v.code.length}: ${v.code.slice(0, 4).join(", ")}${v.code.length > 4 ? " …" : ""} |`);
L.push("", "## All branches", "", "| branch | ahead | files changed | missing (all) | missing code/doc | task landed | verdict |", "|---|---|---|---|---|---|---|");
for (const v of rows) L.push(`| ${v.branch} | ${v.ahead} | ${v.changed} | ${v.missing.length} | ${v.code.length} | ${v.task ? (v.task.landed ? "yes" : "no") : "-"} | ${v.landed ? "landed" : v.code.length ? "MISSING" : "logs only"} |`);
fs.writeFileSync(process.argv[2] ?? "landing-audit.md", L.join("\n") + "\n");
console.log(rows.length, real.map(v => v.branch).join(" "));
