// dev-server-count: produces measure.json from real state, never a hand count.
//
// Two sources, because they answer two different questions:
//  - GET /api/processes on the LIVE Servex (http://127.0.0.1:8090) for the
//    registry's own view: free memory, the worktree list with its own
//    idle/"why" text (Worktrees.js's judge(), already live, untouched by this
//    fix), and which agents are running where.
//  - The PATCHED Servex/Processes.js in THIS worktree, run against one fresh
//    real-process sample (its own loop(), one tick, then stopped) — because
//    the live Servex is still running the UNFIXED code (this branch is not
//    merged, and the brief forbids restarting Servex to pick it up), so the
//    live endpoint cannot show what the fix actually counts. This is the
//    same sampling Processes.js always does, not a parallel invention: one
//    CIM query, parsed by the same class, read once instead of every 10 s.
//
// Run from the repo root: node public/framework/ai/sessions/2026/11/06/spawned/mastermind-resources/dev-server-count/measure.mjs
//
// Writes measure.json beside this script and prints the two counts that must agree.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

function find_root(dir){
	for (let d = dir; ; ){
		if (fs.existsSync(path.join(d, "Servex", "Processes.js"))) return d;
		const up = path.dirname(d);
		if (up === d) throw new Error("could not find the repo root (looked for Servex/Processes.js) above " + dir);
		d = up;
	}
}
const ROOT = find_root(here);
const Processes = (await import(pathToFileURL(path.join(ROOT, "Servex", "Processes.js")))).default;

async function live_processes(){
	const res = await fetch("http://127.0.0.1:8090/api/processes");
	if (!res.ok) throw new Error(`GET /api/processes -> ${res.status}`);
	return res.json();
}

function procs_json_count(){
	const dir = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "procs");
	let files = [];
	try { files = fs.readdirSync(dir).filter(f => f.endsWith(".json")); } catch {}
	return { count: files.length, files };
}

/* One fresh sample through the FIXED Processes class: start its real loop, take its
 * first tick (every row carries a cmd line on the first line the PS script ever prints),
 * stop it immediately. No kill, no restart of anything Servex is actually running. */
function one_patched_sample(timeout_ms = 15000){
	return new Promise((resolve, reject) => {
		const p = new Processes({});
		const to = setTimeout(() => { p.stop(); reject(new Error("timed out waiting for one process sample")); }, timeout_ms);
		p.on("tick", now => { clearTimeout(to); p.stop(); resolve(now); });
		p.start();
	});
}

const [live, procs_json, patched] = await Promise.all([live_processes(), Promise.resolve(procs_json_count()), one_patched_sample()]);

const new_servers = patched.groups.find(g => g.key === "dev servers") ?? { n: 0, servers: 0, mb: 0, pids: [] };
const leftover_groups = Object.fromEntries(
	["tunnel", "whisper", "browsers", "leftover shells", "other of ours"]
		.map(key => [key, patched.groups.find(g => g.key === key) ?? { n: 0, mb: 0 }])
		.map(([key, g]) => [key, { n: g.n, mb: g.mb }])
);

/* Each real server's own row: project name from its procs/*.json record (when it has
 * one) or "no procs/*.json record" (the registry/reality gap this logs, not fixes),
 * the worktree's own live "why" from the SAME /api/processes call (Worktrees.js's own
 * judge(), untouched by this task), and whether a live agent is working there right
 * now (from the same call's `running`). */
const detached_by_pid = new Map();
for (const f of procs_json.files){
	try {
		const rec = JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA, "lew42", "servex", "procs", f), "utf8"));
		detached_by_pid.set(rec.pid, { project: f.replace(/\.json$/, ""), port: rec.port ?? null, cwd: rec.cwd ?? null });
	} catch {}
}
const wt_by_name = new Map((live.worktrees?.items ?? []).map(w => [w.name, w]));
const agent_by_cwd = new Map();
for (const a of live.running ?? []) if (a.group?.startsWith("task ")) agent_by_cwd.set(a.group.slice(5), a);

const real_servers = (new_servers.pids ?? []).map(pid => {
	const rec = detached_by_pid.get(pid) ?? null;
	const project = rec?.project ?? null;
	const wt = project ? wt_by_name.get(project) ?? null : null;
	return {
		pid,
		project: project ?? "(no procs/*.json record — see why_they_disagree)",
		port: rec?.port ?? null,
		cwd: rec?.cwd ?? null,
		worktree_state: wt?.state ?? null,
		worktree_why: wt?.why ?? null,
		pool_slot: project ? /^qf-\d+$/.test(project) : false
	};
});

const count_from_new_grouping = new_servers.servers ?? 0;
const count_from_procs_json = procs_json.count;
const old_group = live.groups.find(g => g.key === "dev servers") ?? { n: 0 };

const out = {
	at: new Date().toISOString(),
	method: "GET http://127.0.0.1:8090/api/processes (live Servex, unfixed code, read-only) for the registry's own worktree/agent view, plus one fresh sample through THIS worktree's patched Servex/Processes.js (its own loop(), one tick) for the new grouping — see this script's own header for why both sources are needed. Run with: node measure.mjs",
	new_grouping: { "dev servers": { n: new_servers.n, servers: count_from_new_grouping, mb: new_servers.mb }, ...leftover_groups },
	real_servers,
	count_from_new_grouping,
	count_from_list_servers_online: old_group.n ? old_group.servers ?? null : 0,
	count_from_procs_json,
	counts_agree: count_from_new_grouping === count_from_procs_json,
	why_they_disagree: count_from_new_grouping === count_from_procs_json ? null :
		"list_servers / procs/*.json (Process.spawn_detached()'s own restart-survival record) only know about the server(s) that persisted a record; a server running right now with no procs/*.json row is a real, live node run.js process that most likely started under an EARLIER Servex process and survived a later restart as a parent-gone orphan. This is a pre-existing Worktrees/Process.js registry gap, logged for awareness and out of this brief's scope (deliverable 3 is about idle_enough()/stop_idle() skipping a server that SHOULD stop, not about this count).",
	idle_check: {
		what: "For each real server above, the live worktree registry's own state and why (live.worktrees.items, from Worktrees.js's judge() — unmodified by this fix), read from the SAME /api/processes call, not recomputed by hand.",
		note: "pool_slot servers (qf-*) are never evaluated by stop_idle() (Worktrees.js's own /^qf-\\d+$/ skip) — Pool.js manages them."
	}
};

const dest = path.join(here, "measure.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${dest}`);
console.log(`count_from_new_grouping: ${count_from_new_grouping}`);
console.log(`count_from_procs_json:   ${count_from_procs_json}`);
console.log(`counts_agree: ${out.counts_agree}`);
