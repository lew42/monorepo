/* Re-measure the dev servers from the live state (deliverable 2), read-only:
 *   node public/framework/ai/sessions/2026/11/06/spawned/mastermind-resources/dev-server-count/measure.mjs
 * Reads the "dev servers" group from Servex's /api/processes, each pid's command line from
 * Windows (Get-CimInstance), and procs/*.json. Prints two numbers that should agree: the real
 * servers (one per tree: a node running run.js, server.js or gate.mjs whose parent is not one)
 * and the servers procs/*.json knows. Stops nothing. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SERVER_FILE = /[\\/]Server[\\/]run\.js\b|\bserver\.js\b|\bgate\.mjs\b/i;
const api = await (await fetch("http://127.0.0.1:8090/api/processes")).json();
const group = api.groups.find(g => g.key === "dev servers") ?? { pids: [], n: 0, mb: 0 };

const ps = "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine,WorkingSetSize | ConvertTo-Json -Compress";
const all = JSON.parse(execFileSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8", maxBuffer: 64 << 20, windowsHide: true }));
const by = new Map(all.map(p => [p.ProcessId, p]));
const is_server = p => p && /^node\.exe$/i.test(p.Name ?? "") && SERVER_FILE.test(p.CommandLine ?? "");

/* Which tree a server serves: an absolute path names it; a worktree's relative `node server.js`
 * is named by its parent shell's log file, .worktree-logs/<name>.log (worktree-up.mjs). */
const where = p => {
	if (/\bgate\.mjs\b/i.test(p.CommandLine ?? "")) return "gate (port 80)";
	const servex_log = by.get(p.ParentProcessId)?.CommandLine?.match(/servex[\\/]logs[\\/]([^\\/.]+)\.out/i);
	if (servex_log) return servex_log[1];
	const abs = (p.CommandLine ?? "").match(/lew42[\\/](monorepo|worktrees[\\/][^\\/\s"]+)/i);
	if (abs) return abs[1].replace(/\\/g, "/");
	for (let q = by.get(p.ParentProcessId), i = 0; q && i < 4; q = by.get(q.ParentProcessId), i++) {
		const log = (q.CommandLine ?? "").match(/\.worktree-logs[\\/]([^\\/."]+)\.log/i);
		if (log) return "worktrees/" + log[1];
	}
	return "?";
};
const servers = group.pids.map(pid => by.get(pid)).filter(p => is_server(p) && !is_server(by.get(p.ParentProcessId)))
	.map(p => ({ pid: p.ProcessId, mb: Math.round(p.WorkingSetSize / 1048576), where: where(p) }));

const home = process.env.SERVEX_HOME ?? path.join(process.env.LOCALAPPDATA ?? "", "lew42", "servex");
const procs_dir = path.join(home, "procs");
const known = fs.existsSync(procs_dir) ? fs.readdirSync(procs_dir).filter(f => f.endsWith(".json"))
	.map(f => ({ name: f.slice(0, -5), pid: JSON.parse(fs.readFileSync(path.join(procs_dir, f), "utf8")).pid }))
	.filter(k => by.has(k.pid)) : [];

const out = { at: new Date().toISOString(), group_processes: group.n, group_mb: group.mb,
	real_servers: servers.length, servers, procs_json_live: known.length, known,
	agree: servers.length === known.length };
console.log(JSON.stringify(out, null, 1));
