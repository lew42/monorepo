/* `node Server/worktree-servers.mjs` — every worktree dev server running now: worktree, pid, age, MB, and
 * whether its worktree is still wanted. A dry run; it stops nothing.
 *
 *   --list                   (default) the table
 *   --stop-stale             stop the servers whose worktree is merged, gone, a returned pool slot, or whose task landed
 *   --stop-stale --older-than <h>
 *                            also stop a server of an unmerged worktree older than <h> hours with no agent working there
 *   --dry                    with --stop-stale: say what would stop
 *
 * A stop is the cmd wrapper first (`taskkill /T`, so nothing respawns), then an `end` line in lifecycle.jsonl.
 * Never touches: the main site (:3104), Servex, the gate, whisper, a keep-list port, a worktree an agent works in,
 * a taken pool slot, a preview held for the owner's phone (Lifecycle.kept). A worktree's files are never touched.
 * Doc: Server/doc/worktree-servers.md. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import Lifecycle, { main_repo } from "../Servex/Lifecycle.js";

const argv = process.argv.slice(2), arg = k => argv.includes(k) ? argv[argv.indexOf(k) + 1] : null;
const STOP = argv.includes("--stop-stale"), DRY = argv.includes("--dry"), OLDER_H = Number(arg("--older-than")) || 0;
const BASE = "michael/dev", main = main_repo();
const git = (...a) => { try { return { ok: true, out: execFileSync("git", ["-C", main, ...a], { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }) }; } catch { return { ok: false, out: "" }; } };
const slash = s => String(s || "").replace(/\\/g, "/").toLowerCase();

const lc = new Lifecycle();
const rows = (await lc.resources()).filter(r => r.kind === "server" && r.path);
await lc.plan();   // fills lc.tasks and lc.all_agents the way the sweep does

const branch_of = {};   // worktree path -> branch, from git
for (const b of git("worktree", "list", "--porcelain").out.split(/\r?\n\r?\n/)) {
	const p = /^worktree (.*)$/m.exec(b)?.[1], br = /^branch refs\/heads\/(.*)$/m.exec(b)?.[1];
	if (p) branch_of[slash(p)] = br ?? null;
}
let pool = []; try { pool = JSON.parse(fs.readFileSync(path.join(main, ".worktree-pool.json"), "utf8")).slots || []; } catch {}
const slot_of = p => pool.find(s => slash(s.path) === slash(p));

/* resident MB of a server's whole tree (wrapper + children), one PowerShell call */
const mem = new Map();
try {
	const out = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "Get-Process node,cmd -ErrorAction SilentlyContinue | ForEach-Object { [pscustomobject]@{id=$_.Id;ws=$_.WorkingSet64} } | ConvertTo-Json -Compress"], { encoding: "utf8", windowsHide: true, maxBuffer: 8 << 20 });
	for (const p of [].concat(JSON.parse(out || "[]"))) mem.set(p.id, p.ws);
} catch {}
const tree_mb = pid => {
	let sum = 0;
	for (const stack = [pid], seen = new Set(); stack.length;) {
		const x = stack.pop(); if (seen.has(x)) continue; seen.add(x); sum += mem.get(x) ?? 0;
		for (const p of lc.procs.values()) if (p.ppid === x) stack.push(p.pid);
	}
	return Math.round(sum / 1048576);
};

const out = [];
for (const r of rows) {
	const age_h = r.born ? (Date.now() - r.born) / 3600e3 : null, name = path.basename(r.path);
	const kept = lc.kept(r), slot = slot_of(r.path), branch = branch_of[slash(r.path)];
	let state, stale = false;
	if (kept && !(slot && /pool slot/.test(kept))) state = `kept: ${kept}`;
	else if (slot) { stale = !slot.taken_by && slot.state !== "taken"; state = !stale ? `pool slot, ${slot.state}${slot.taken_by ? ", taken by " + slot.taken_by : ""}` : `pool slot, ${slot.state} (returned)`; }
	else if (!fs.existsSync(r.path) || !(slash(r.path) in branch_of)) { state = "gone (worktree removed)"; stale = true; }
	else if (branch && git("merge-base", "--is-ancestor", branch, BASE).ok) { state = `merged into ${BASE}`; stale = true; }
	else if (!branch && git("merge-base", "--is-ancestor", "HEAD", BASE).ok && false) { state = "detached"; }
	else if (lc.task(r.owner_task)?.landed) { state = "task landed"; stale = true; }
	else if (OLDER_H && age_h > OLDER_H) { state = `open, but up ${age_h.toFixed(0)} h (older than ${OLDER_H} h)`; stale = true; }
	else state = "open (in use or unmerged)";
	out.push({ name, pid: r.pid, child: r.child, age_h, mb: tree_mb(r.pid), state, stale, r });
}
out.sort((a, b) => (b.stale - a.stale) || (b.age_h ?? 0) - (a.age_h ?? 0));

const pad = (s, n) => String(s).padEnd(n);
console.log(`${out.length} worktree dev server(s), ${out.reduce((n, o) => n + o.mb, 0)} MB, ${out.filter(o => o.stale).length} stale\n`);
console.log(`${pad("worktree", 30)}${pad("pid", 8)}${pad("age h", 8)}${pad("MB", 6)}state`);
for (const o of out) console.log(`${o.stale ? "*" : " "}${pad(o.name, 29)}${pad(o.pid, 8)}${pad(o.age_h == null ? "?" : o.age_h.toFixed(1), 8)}${pad(o.mb, 6)}${o.state}`);

if (!STOP) { if (out.some(o => o.stale)) console.log(`\n* = stale. Stop them: node Server/worktree-servers.mjs --stop-stale${OLDER_H ? ` --older-than ${OLDER_H}` : ""}   (add --dry to preview)`); process.exit(0); }
let n = 0;
for (const o of out.filter(o => o.stale)) {
	console.log(`${DRY ? "would stop" : "stopping"} ${o.name} (pid ${o.pid}): ${o.state}`);
	if (DRY) continue;
	await lc.close(o.r, `worktree-servers --stop-stale: ${o.state}`);
	n++;
}
console.log(DRY ? "dry run, nothing stopped" : `${n} stopped`);
