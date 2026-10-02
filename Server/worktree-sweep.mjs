/* `node Server/worktree-sweep.mjs [--dry] [--root <repo>]` — takes down a worktree's private dev
 * server once its task is actually, safely done with it. Never run by hand as the normal way to
 * stop one: the loop calls `sweep()` once per tick, and `on-landing.mjs` calls `can_stop()` the
 * moment a task lands. `--root` points it at another checkout's `.worktrees.json` and task logs
 * (proof only — same idea as merge.mjs's `--main`); every import (on-landing.mjs, TaskLoop.js)
 * always sweeps its own checkout.
 *
 * WHY (task-loop, worktree-down, 2026-09-29): on 09-28, 24 worktree server pairs (about 2.1 GB)
 * were still running for tasks that had landed days earlier — nothing ever took them down. But
 * `landed_at` ALONE is not enough to prove it's safe: the same day, collab-rounds had a
 * `landed_at` while its branch wasn't merged yet and its minion was still fixing a bug, and
 * something stopped its server anyway. So `can_stop()` checks all three:
 *   1. the worktree's OWN task has `landed_at` + a real `outcome` (found via its task.jsonl's
 *      line 1 `worktree` field, which is set once at spawn and never changes);
 *   2. that task's branch is fully merged into `michael/dev` (`git merge-base --is-ancestor`);
 *   3. no live agent is still working there — the task's own mastermind, one of its minions
 *      (registry `parent` chain), or any agent whose recorded `cwd` is inside the worktree.
 * All three true = ok to stop. Any one false = skip, and say which one and why, so a nag on a
 * card or a line in `--dry` output always names the real reason, never just "not yet". */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { links_into_main } from "./junction-guard.mjs";

// `ROOT` is normally this script's own repo (Server/.. — a worktree's copy sweeps that
// worktree's own Servex state). `--root <dir>` (proof only, same idea as merge.mjs's `--main`)
// points it at another checkout instead — the running one, say, when this fix isn't merged
// there yet — without changing what an import (`on-landing.mjs`, `TaskLoop.js`) ever sees.
let ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry_file = () => path.join(ROOT, ".worktrees.json");
const ai_dir = (root = ROOT) => path.join(root, "public", "framework", "ai");

const norm = p => path.resolve(String(p || "")).replace(/\\/g, "/").toLowerCase();

function read_registry(){
	try { return JSON.parse(fs.readFileSync(registry_file(), "utf8")); } catch { return {}; }
}

/* Every task.jsonl under public/framework/ai/, any depth (a sub-task's own dir included) —
 * there are only a few hundred, so a full walk once per tick is cheap. Dot-dirs and
 * node_modules skipped, same as TaskLoop.js's own walk(). */
function all_task_files(root = ROOT){
	const out = [];
	(function walk(dir){
		let entries;
		try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of entries){
			if (e.name.startsWith(".") || e.name === "node_modules") continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) walk(p);
			else if (e.name === "task.jsonl") out.push(p);
		}
	})(ai_dir(root));
	return out;
}

/** Every `assign` line merged, later wins — same rule TaskLoop.js's read_task() uses. */
export function task_state(dir){
	let text; try { text = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"); } catch { return null; }
	const state = {};
	for (const raw of text.split("\n")){
		if (!raw.trim()) continue;
		let obj; try { obj = JSON.parse(raw); } catch { continue; }
		if (obj.assign && typeof obj.assign === "object") Object.assign(state, obj.assign);
	}
	return state;
}

const task_key = (dir, root = ROOT) => path.relative(ai_dir(root), dir).split(path.sep).join("/");

/** The task that owns this worktree, or null: the one whose `worktree` names this exact path; else
 *  (lifecycle, 2026-09-29: only 1 of about 20 task logs that day carried `worktree`, so no teardown
 *  ever ran) the newest task whose `branch` is worktree/<slug> or whose own dir is named <slug>.
 *  `root` is the checkout whose task logs to read (Servex/Lifecycle.js passes the main one). */
export function task_for_worktree(wtPath, root = ROOT){
	const target = norm(wtPath), slug = path.basename(path.resolve(String(wtPath)));
	let best = null, best_t = -1;
	for (const file of all_task_files(root)){
		const dir = path.dirname(file);
		const state = task_state(dir);
		if (state?.worktree && norm(state.worktree) === target) return { dir, key: task_key(dir, root), ...state };
		if (state?.worktree) continue;
		if (state?.branch === `worktree/${slug}` || path.basename(dir) === slug){
			let t = 0; try { t = fs.statSync(file).mtimeMs; } catch {}
			if (t > best_t){ best_t = t; best = { dir, key: task_key(dir, root), ...state }; }
		}
	}
	return best;
}
const find_task_for_worktree = wtPath => task_for_worktree(wtPath);

/** The registry entry (from .worktrees.json) whose path is this task's own `worktree` field. */
export function entry_for_task_dir(dir){
	const state = task_state(dir);
	if (!state) return null;
	const registry = Object.values(read_registry());
	if (state.worktree){
		const target = norm(state.worktree);
		return registry.find(entry => norm(entry.path) === target) ?? null;
	}
	// no `worktree` on the log: match the task's own slug or branch against the registry
	const slug = path.basename(path.resolve(dir));
	return registry.find(entry => entry.branch === (state.branch ?? `worktree/${slug}`) || entry.name === slug) ?? null;
}

function is_merged(branch){
	if (!branch) return false;
	const r = spawnSync("git", ["merge-base", "--is-ancestor", branch, "michael/dev"], { cwd: ROOT, windowsHide: true });
	return r.status === 0;
}

/* The live agent list: Servex's own `GET /agents` when it's answering (the freshest truth —
 * an agent that just ended its turn may not have written the registry file yet), else the
 * registry.json file it reads that endpoint from. Either way this never throws: Servex being
 * down just means "assume nothing is live", which is the safe direction for a --dry read but
 * NOT for actually stopping something — callers only act on an `ok` that also passed the other
 * two checks, so a false "no agents" here can't unstick a task that hasn't landed or merged. */
async function live_agents(){
	const port = process.env.SERVEX_PORT || 8090;
	try {
		const res = await fetch(`http://127.0.0.1:${port}/agents`, { signal: AbortSignal.timeout(2000) });
		if (res.ok) return await res.json();
	} catch {}
	try {
		const home = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || "", "lew42", "servex");
		return Object.values(JSON.parse(fs.readFileSync(path.join(home, "registry.json"), "utf8")));
	} catch { return []; }
}

/** `can_stop(entry)` — entry is one value from `.worktrees.json` ({name, path, branch, pid, …}).
 *  Returns `{ok, why, reason}`; `why` is always a plain sentence, ok or not. `reason` is a short
 *  machine code a caller can branch on without parsing `why` — `on-landing.mjs` uses it to skip
 *  nagging the card over "not-merged", the one reason that fixes itself (this loop's own next
 *  tick, once `merge.mjs` lands the branch, sees it merged and sweeps the server then). */

/* True when this registry entry is one of the quick-fix pool's slots (.worktree-pool.json). */
export function is_pool_slot(entry){
	try {
		const slots = JSON.parse(fs.readFileSync(path.join(ROOT, ".worktree-pool.json"), "utf8")).slots || [];
		return slots.some(sl => sl.id === entry.name || (sl.path && entry.path && norm(sl.path) === norm(entry.path)));
	} catch { return /^qf-\d+$/.test(entry.name || ""); }
}

export async function can_stop(entry){
	// A POOL SLOT (qf-N, Servex/Pool.js) is never torn down here: the pool owns its server and its
	// registry entry, and hands it to the next task with return_worktree. On 2026-10-01 a task that
	// had taken qf-4 landed, this ran worktree-down qf-4, and the slot lost its server and its
	// .worktrees.json entry twice while another minion was already working in it.
	if (is_pool_slot(entry)) return { ok: false, reason: "pool", why: `${entry.name} is a pool slot — return_worktree hands it back; worktree-down never touches it` };
	const task = find_task_for_worktree(entry.path);
	if (!task) return { ok: false, reason: "no-task", why: `no task.jsonl names this worktree (${entry.path}) in its line 1` };
	if (!task.landed_at || !String(task.outcome ?? "").trim())
		return { ok: false, reason: "not-landed", why: `task ${task.key} has not landed (no landed_at + outcome yet)` };
	if (!is_merged(entry.branch))
		return { ok: false, reason: "not-merged", why: `branch ${entry.branch || "(none)"} is not merged into michael/dev yet` };
	const mastermind = task.agent || null;
	const agents = await live_agents();
	// "Live" here means WORKING right now, not merely "not stopped yet" — the agent that landed
	// this task normally goes straight to `idle`, not `stopped` (nothing stops it), so treating
	// idle as a blocker would keep every worktree's server up forever, the exact bug this was
	// built to fix. `mastermind` can be null (the task's line 1 never named an `agent`) — guarded
	// so that never turns into "every parentless agent in the system blocks this one".
	const acting = a => a.state === "working" || a.state === "starting";
	const blockers = agents.filter(a => acting(a)
		&& ((mastermind && (a.id === mastermind || a.parent === mastermind)) || (a.cwd && norm(a.cwd) === norm(entry.path))));
	if (blockers.length) return { ok: false, reason: "busy", why: `still working: ${blockers.map(a => a.id).join(", ")}` };
	return { ok: true, reason: null, why: `${task.key} landed ${task.landed_at}, ${entry.branch} merged, no live agent working there` };
}

/** Every registered worktree server: stop ones that are safe (worktree dir gone, or `can_stop`
 *  ok) by calling worktree-down.mjs, which already refuses a dirty tree. Never the main tree —
 *  it is never in this registry — and never Servex's own (same reason). `--dry` prints only. */
export async function sweep({ dry = false } = {}){
	const registry = read_registry(), rows = [];
	for (const [name, entry] of Object.entries(registry)){
		if (!entry?.path || norm(entry.path) === norm(ROOT)) continue;   // belt-and-suspenders: never the main tree
		const gone = !fs.existsSync(entry.path);
		const { ok, why } = gone ? { ok: true, why: "worktree directory no longer exists on disk" } : await can_stop(entry);
		const links = gone ? [] : links_into_main(entry.path, ROOT);   // worktree-down refuses these too; say why here
		const row = links.length ? { name, ok: false, why: `holds a link into the main checkout: ${links.map(l => l.path).join(", ")} — remove the link only, then sweep again` } : { name, ok, why };
		rows.push(row);
		if (row.ok && !dry){
			const r = spawnSync(process.execPath, [path.join(ROOT, "Server/worktree-down.mjs"), name], { encoding: "utf8", windowsHide: true });
			row.result = (r.stdout || r.stderr || "").trim().split("\n").pop() || (r.status === 0 ? "stopped" : "failed");
		}
	}
	return rows;
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2);
	const dry = argv.includes("--dry");
	const rootIdx = argv.indexOf("--root");
	if (rootIdx >= 0) ROOT = path.resolve(argv[rootIdx + 1]);
	const rows = await sweep({ dry });
	const stop = rows.filter(r => r.ok), skip = rows.filter(r => !r.ok);
	console.log(`worktree-sweep: ${rows.length} registered worktree(s) — ${stop.length} ${dry ? "would stop" : "stopped"}, ${skip.length} skipped.`);
	for (const r of rows) console.log(`  ${r.ok ? (dry ? "would stop" : (r.result || "stop")) : "skip"}  ${r.name} — ${r.why}`);
}
