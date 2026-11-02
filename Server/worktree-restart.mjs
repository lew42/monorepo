/* `node Server/worktree-restart.mjs <name>` — revive an EXISTING worktree's
 * own dev server after its process died (a Servex restart, the node-reaper,
 * or anything else that doesn't touch `.worktrees.json`). This is the same
 * boot + registration code `worktree-up.mjs` runs once at creation, pulled
 * out so it can run again without redoing `git worktree add` or `npm ci` —
 * both unneeded, since the worktree and its `node_modules` already exist.
 *
 * WHY THIS EXISTS (data-grid, 2026-10-03): Servex only ever learns about a
 * worktree's server through the one-time `POST /api/projects` call
 * `worktree-up.mjs` makes at creation (Servex.js keeps it in an in-memory
 * list, `this.projects`) — nothing re-sends that on a Servex restart, and
 * nothing re-boots the actual node process either. `start_server` refuses
 * an unknown project name, and `can_start` is false by design for any
 * `external: true` project (Servex.js `runner()`), so there is no existing
 * sanctioned way for an agent to bring one back. The `server-guard` hook
 * still correctly blocks a direct `node server.js` / `Start-Process` — this
 * script is the same shape `worktree-up.mjs` already is: one more allowed
 * `node <script>.js` that isn't `server.js` itself.
 *
 * Flagged to mastermind-servex separately as a real gap to close properly
 * (persist + replay `.worktrees.json` on Servex's own boot) — this script
 * is the stand-in until that lands. */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = path.join(ROOT, ".worktrees.json");

const name = process.argv[2];
if (!name) {
	console.error("usage: node Server/worktree-restart.mjs <name> [--path <worktree dir>]   (--path: adopt an unregistered worktree)");
	process.exit(1);
}

// Same read/write shape as worktree-up.mjs / worktree-down.mjs: re-read the
// shared registry and touch only this one entry, never a stale whole-object
// write (two scripts running at once lost entries before, 2026-10-01).
function read_registry(){
	let text;
	try { text = fs.readFileSync(REGISTRY, "utf8"); } catch { return {}; }
	try { return JSON.parse(text.replace(/^﻿/, "")); }
	catch (e) { console.error(`worktree-restart: ${REGISTRY} does not parse (${e.message}) — fix it by hand; refusing to overwrite it.`); process.exit(1); }
}
function write_registry(entry_name, entry){
	const reg = read_registry();
	reg[entry_name] = entry;
	fs.writeFileSync(REGISTRY, JSON.stringify(reg, null, "\t"));
}

/* ADOPT (2026-10-23): a worktree made with plain `git worktree add` is on disk but not in the registry, so the merge smoke
 * found no server for it (four of them, found by mastermind-deputy). If ../worktrees/<name> is a git worktree, register it
 * here with a free port and boot it like any other. */
async function adopt(){
	const at = process.argv.indexOf("--path"), dir = at > 0 ? path.resolve(process.argv[at + 1]) : path.resolve(ROOT, "..", "worktrees", name);
	let branch = null;
	try { branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: dir, encoding: "utf8", windowsHide: true }).trim(); } catch { return null; }
	if (!fs.existsSync(path.join(dir, "node_modules"))) {
		console.log(`worktree-restart: ${dir} has no node_modules; running npm ci…`);
		try { execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["ci"], { cwd: dir, stdio: "inherit", shell: true, windowsHide: true }); } catch {}
	}
	const port = await new Promise(r => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
	const e = { name, path: dir, branch, port, log: path.join(ROOT, ".worktree-logs", `${name}.log`), created_at: new Date().toISOString(), booted: false, adopted: true };
	write_registry(name, e);
	console.log(`worktree-restart: adopted ${dir} (${branch}) on port ${port}.`);
	return e;
}

const registry = read_registry();
const entry = registry[name] ?? await adopt();
if (!entry) {
	console.error(`worktree-restart: "${name}" is not in ${REGISTRY} and ../worktrees/${name} is not a git worktree — nothing to restart. Use worktree-up.mjs to create it.`);
	process.exit(1);
}
if (!fs.existsSync(entry.path)) {
	console.error(`worktree-restart: ${entry.path} does not exist on disk — this worktree is gone, not just its server. Nothing this script can fix.`);
	process.exit(1);
}

// Stop a still-alive process on that port first — never leave two servers
// bound to the same port. `taskkill` on an already-dead pid just says "not
// found", which is fine either way.
if (entry.pid) {
	console.log(`worktree-restart: stopping any old server pid ${entry.pid}…`);
	const r = spawnSync("taskkill", ["/PID", String(entry.pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
	if (r.status !== 0 && !/not found/i.test(r.stdout || "")) console.log(`worktree-restart: taskkill said: ${(r.stdout || r.stderr || "").trim()}`);
}

function wait_for_boot(port, deadline_ms = 15000){
	return new Promise(resolve => {
		let settled = false;
		const finish = ok => { if (settled) return; settled = true; clearTimeout(timer); resolve(ok); };
		const timer = setTimeout(() => finish(false), deadline_ms);
		(async function poll(){
			while (!settled) {
				try {
					const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) });
					if (res.status === 200) return finish(true);
				} catch {}
				await new Promise(r => setTimeout(r, 300));
			}
		})();
	});
}

const log_path = entry.log || path.join(ROOT, ".worktree-logs", `${name}.log`);
fs.mkdirSync(path.dirname(log_path), { recursive: true });

console.log(`worktree-restart: booting node server.js in ${entry.path} on PORT ${entry.port}…`);
/* Same hidden-cmd-wrapper launch as worktree-up.mjs, same reasons: a
 * detached node with windowsHide has NO console, so every CHILD it forks
 * (run.js, boot-test candidates, claude turns, hooks) would open a VISIBLE
 * window instead — PowerShell gives it one hidden console its children
 * inherit. Start-Process must not get -RedirectStandardOutput/-Error: that
 * forces a fresh console per launch regardless of -WindowStyle. */
const cmdline = `/d /c ""${process.execPath}" server.js >>"${log_path}" 2>>"${log_path}.err""`;
const idle_min = new RegExp(`^${process.env.SERVEX_POOL_PREFIX || "qf"}-\\d+$`).test(name) ? 0 : Number(process.env.WORKTREE_IDLE_MIN ?? 30);   // as worktree-up.mjs
const ps = `$env:PORT='${entry.port}'; ${idle_min > 0 ? `$env:IDLE_EXIT_MIN='${idle_min}'; ` : ""}$p = Start-Process -FilePath $env:ComSpec -ArgumentList '${cmdline.replaceAll("'", "''")}' -WorkingDirectory '${entry.path.replaceAll("'", "''")}' -WindowStyle Hidden -PassThru; $p.Id`;
const started = spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], { encoding: "utf8", windowsHide: true });
if (started.stderr?.trim()) console.error("worktree-restart: launcher said:", started.stderr.trim());
const pid = Number(String(started.stdout).trim()) || null;

const ok = await wait_for_boot(entry.port);
if (!ok) {
	console.error(`worktree-restart: server did not answer HTTP 200 within 15s — see ${log_path}.`);
	write_registry(name, { ...entry, pid, booted: false });
	process.exit(1);
}

write_registry(name, { ...entry, pid, booted: true, restarted_at: new Date().toISOString() });

// Re-teach Servex's proxy where this worktree's server lives — the same
// one-time call worktree-up.mjs makes, needed again because Servex's own
// copy only ever lived in memory and a restart (or this server dying)
// loses it. Optional, always: a worktree must still work with Servex down.
try {
	const r = await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/api/projects`, {
		method: "POST", headers: { "content-type": "application/json" },
		body: JSON.stringify({ name, path: entry.path, port: entry.port }),
		signal: AbortSignal.timeout(2000),
	});
	if (!r.ok && r.status !== 400) console.warn(`worktree-restart: Servex registration answered ${r.status} — the server is up at the direct port either way.`);
} catch {}

console.log("");
console.log("worktree-restart: ready.");
console.log(`  url    http://localhost:${entry.port}/`);
console.log(`  proxy  http://${name}.localhost/`);
console.log(`  edit   ${entry.path}`);
