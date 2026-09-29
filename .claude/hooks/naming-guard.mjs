import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// ⚠ Same override as ledger.mjs: a worktree session's task.jsonl usually lives in the
// MAIN tree (minion briefs say so explicitly), not the worktree this hook script runs
// in — LEDGER_ROOT is how ledger.mjs already points itself back there, and naming-guard
// has to agree or every path/pin check below silently misses.
const root = path.resolve(process.env.LEDGER_ROOT || path.join(fileURLToPath(import.meta.url), "../../.."));

/* THE NAMING NAG (2026-09-28) — the owner's own worry (file-explorer-fs/owner-words.md):
 * "we either need the AI to remember to wire up every decision that was made… I'm not
 * sure if it could happen in more of a systematic way." This is the systematic half for
 * CLASSES: after any Edit/Write of a `.js` file under `public/` that ADDS a `class X`
 * declaration — new in THIS write, checked against the file's last commit, not a class
 * that was already there — look for a `named` line in the shared decisions.jsonl saying
 * some collaboration actually decided that name. None found? One `log` line in the
 * CURRENT TASK's own task.jsonl (found the way ledger.mjs finds it: walk up from the
 * edited file for the nearest task.jsonl). Never a block, never a console line — a
 * missing decision record is a thing to notice later, not a thing to stop for.
 *
 * Same shape as syntax-guard.mjs: its own file, imported inside a try by ledger.mjs, so a
 * mistake here can never take the ledger hook down with it. Never throws. */
const CLASS_RE = /\bclass\s+([A-Za-z_$][\w$]*)/g;
const classNames = src => new Set([...src.matchAll(CLASS_RE)].map(m => m[1]));

// "public/framework/ext/Source/Source.js" -> "ext/Source" — the same framework-relative
// module path Server/collab.mjs's `target.module` and ext/Doc's own `module()` use.
const moduleOf = rel => rel.match(/^public\/framework\/(.+)\/[^/]+$/)?.[1] ?? null;

const now = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${o < 0 ? "-" : "+"}${pad(o / 60)}:${pad(o % 60)}`;
};

function find_task_by_path(file){
	let dir = path.dirname(path.resolve(file));
	while (dir === root || dir.startsWith(root + path.sep)) {
		const candidate = path.join(dir, "task.jsonl");
		if (fs.existsSync(candidate)) return candidate;
		if (path.dirname(dir) === dir) return null;
		dir = path.dirname(dir);
	}
	return null;
}

// A code file is almost never inside its own task's directory (task dirs live under
// public/framework/ai/<date>/<slug>/, code lives under public/framework/<module>/), so
// find_task_by_path() above misses nearly every real edit — same as it does for
// ledger.mjs itself. ledger.mjs's OWN fix is a pin: the first time an agent writes
// something inside its own task dir, it caches agent id -> task.jsonl in the temp dir
// (`agent_cache`, ledger.mjs). This reads that SAME cache file, so naming-guard finds
// whatever task ledger.mjs already pinned this agent to.
function pinned_task(agent){
	if (!agent) return null;
	try {
		const hit = fs.readFileSync(path.join(os.tmpdir(), `claude-ledger-agent-${String(agent).replace(/[^\w-]/g, "_")}.txt`), "utf8").trim();
		return hit.startsWith(root) && fs.existsSync(hit) ? hit : null;
	} catch { return null; }
}

function namedSet(){
	const decisions = path.join(root, "public/framework/ai/collab/decisions.jsonl");
	const out = new Set();
	try {
		for (const line of fs.readFileSync(decisions, "utf8").split(/\r?\n/)) {
			if (!line.trim()) continue;
			try {
				const n = JSON.parse(line).named;
				if (n?.kind === "class" && n.module && n.member) out.add(n.module + "\u0000" + n.member);
			} catch {}
		}
	} catch {}
	return out;
}

export default function naming_guard(file, agent){
	try {
		if (!file || !/\.js$/.test(file) || !fs.existsSync(file)) return;
		const abs = path.resolve(file);
		if (!abs.toLowerCase().startsWith(root.toLowerCase() + path.sep)) return;
		const rel = path.relative(root, abs).split(path.sep).join("/");
		if (!rel.startsWith("public/")) return;
		const module = moduleOf(rel);
		if (!module) return;

		const now_src = fs.readFileSync(abs, "utf8");
		const before = spawnSync("git", ["show", `HEAD:${rel}`], { cwd: root, encoding: "utf8", windowsHide: true });
		const old_names = before.status === 0 ? classNames(before.stdout) : new Set();
		const added = [...classNames(now_src)].filter(n => !old_names.has(n));
		if (!added.length) return;

		const named = namedSet();
		const missing = added.filter(cls => !named.has(module + "\u0000" + cls));
		if (!missing.length) return;

		const task = find_task_by_path(abs) || pinned_task(agent);
		if (!task) return;
		for (const cls of missing) {
			let lead = "";
			try { const b = fs.readFileSync(task); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
			fs.appendFileSync(task, lead + JSON.stringify({ log: { at: now(),
				msg: `naming: class ${cls} in ${module} has no decision record — run a design collab with target, or add a named line with decision: "owner"` } }) + "\n");
		}
	} catch {}
}
