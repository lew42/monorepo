import os from "os";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Events from "../Server/Events.js";
import { stamp, place } from "./home.js";

/* THE PROCESS MONITOR — every process on the machine, which of them are OURS,
 * and which task each of ours works for (process-monitor, 2026-09-30).
 *
 * The owner, 2026-09-30: "wherever we're listing currently running tasks, it
 * should be based on the claude.exe … we definitely want a summary of all of our
 * spawned memory … how much of that is associated with each task."
 *
 * Every 10 s ONE long-lived hidden PowerShell prints one line: every process's
 * pid, parent pid, name, working set, CPU seconds and start time, and the
 * command line of each process it has not printed before. Node turns CPU
 * seconds into CPU % (of the whole machine, as Task Manager shows it) and sorts
 * every process into a GROUP:
 *
 *   task <key>       an agent's claude.exe and everything under it, for the task
 *                    that agent (or its nearest ancestor agent) works for.
 *                    The PID comes from Agents.spawn_claude; the session id on
 *                    the command line is the fallback.
 *   front desk      the assistants, managers and sessions (agents/Agents.js STANDING)
 *   servex          Servex itself, its supervisor, and its other children
 *   session <pid>   a Claude Code session Servex did not start (a VS Code tab),
 *                   and everything under it
 *   dev servers     the detached servers Servex started (procs/*.json, gate.mjs)
 *                   and any process from this repo or a worktree whose parent is gone
 *   orphans         a leftover of ours: a waiter (bash, tail, grep, sleep …) whose
 *                   parent is gone and whose command line points at this repo,
 *                   Claude's own dirs, or Git for Windows' own bin. Reaped once
 *                   idle past `reap_after_ms` (10 min).
 *   (everything else is "other": the owner's apps, never touched)
 *
 * Kept: the latest snapshot (`this.now`), an hour of 10-second points
 * (`this.history`), and one line a minute on the `processes` log. */

// Names that are ours when their parent chain leads to us.
const OUR_KINDS = /^(claude|node|bash|sh|tail|grep|sleep|git|cmd|conhost|powershell|cat|head|sed|awk|timeout|find|python|whisper-server|npm|npx)\.exe$/i;
// Leftovers that do nothing on their own: safe to end once their parent is gone.
const WAITERS = /^(bash|sh|tail|grep|sleep|cat|head|sed|awk|timeout|find)\.exe$/i;
// A command line that points into this system: the repo, a worktree, Claude's temp dirs and shell snapshots.
const OUR_PATHS = /lew42|[\\/]\.claude[\\/]|[\\/]Temp[\\/]claude[\\/]|shell-snapshots/i;
// Git for Windows' own tools (tail, grep, sleep …): nobody else starts these here, so one whose parent is gone is a leftover.
const GIT_TOOLS = /[\\/]Git[\\/](usr[\\/])?bin[\\/]/i;
const ours_cmd = p => OUR_PATHS.test(p.cmd) || (WAITERS.test(p.name ?? "") && GIT_TOOLS.test(p.cmd));
const SESSION = /--(?:resume|session-id)[= ]"?([0-9a-f-]{36})/i;

export default class Processes extends Events {

	initialize(){
		this.every ??= Number(process.env.SERVEX_PROCESSES_EVERY_MS) || 10000;
		this.keep ??= 360;                                   // one hour at 10 s
		this.reap_after_ms ??= Number(process.env.SERVEX_REAP_ORPHANS_MS) || 10 * 60000;
		this.reaping ??= process.env.SERVEX_REAP_ORPHANS !== "0";
		this.procs = new Map();        // pid -> { pid, ppid, name, mb, cpu_s, born, cmd, cpu, idle_since }
		this.history = [];
		this.now = null;
		this.reaped = [];              // the last 50 reaps, newest last
		this.cores = os.cpus().length || 1;
		this.children = {};
	}

	start(){
		this.loop();
		this.writer = setInterval(() => this.write(), 60000);
		this.writer.unref();
		return this;
	}

	stop(){
		this.stopped = true;
		clearInterval(this.writer);
		for (const child of Object.values(this.children)) try { child.kill(); } catch {}
	}

	log(entry){ return this.servex?.log?.append("processes", entry).catch(() => {}); }

	/* ── the loop ─────────────────────────────────────────────────────── */

	loop(){
		if (this.stopped) return;
		const script = PS.replace("__PARENT__", String(process.pid)).replace("__EVERY__", String(this.every / 1000));
		const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
			"-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
		this.children.ps = child;
		lines(child.stdout, line => { try { this.take(JSON.parse(line)); } catch (e) { this.error = e.message; } });
		child.stderr.on("data", () => {});
		child.on("error", e => this.log({ type: "monitor", msg: `process loop failed to start: ${e.message}` }));
		child.on("exit", code => {
			if (this.stopped) return;
			this.log({ type: "monitor", msg: `process loop exited (${code}); restarting in 10 s` });
			setTimeout(() => this.loop(), 10000).unref();
		});
	}

	/* One line from the loop: rows of [pid, ppid, name, mb, cpu_s, born, cmd?]. */
	take({ rows = [], self, msys }){
		this.msys(msys);
		const at = Date.now(), dt = this.last_at ? (at - this.last_at) / 1000 : 0;
		this.last_at = at;
		const next = new Map();
		for (const [pid, ppid, name, mb, cpu_s, born, cmd] of rows){
			const prev = this.procs.get(pid);
			const same = prev && prev.born === born;
			const cpu = same && dt > 0 ? Math.max(0, round(100 * (cpu_s - prev.cpu_s) / dt / this.cores, 1)) : 0;
			const busy = !same || cpu_s - prev.cpu_s > 0.05;
			next.set(pid, { pid, ppid, name, mb, cpu_s, born, cpu,
				cmd: cmd ?? (same ? prev.cmd : null) ?? "",
				idle_since: busy ? at : prev.idle_since });
		}
		this.procs = next;
		this.cost = typeof self === "number" ? self : null;
		this.now = this.sort(at);
		this.history.push(this.point(this.now));
		if (this.history.length > this.keep) this.history.splice(0, this.history.length - this.keep);
		if (this.reaping) this.reap();
		this.emit("tick", this.now);
	}

	/* GIT BASH'S OWN PARENTS. A Git Bash tool starts by `exec`, so Windows names a
	 * parent that has already exited even while the pipeline is alive and read
	 * (a `tail -f | grep` under a live Claude session looks parentless). Git's
	 * own `ps -e` keeps the true tree: PID, PPID and the Windows pid of each.
	 * `this.real` maps a Windows pid to its true parent's Windows pid, or 0 when
	 * that parent is gone. A process at the top of Git Bash's tree (PPID 1)
	 * keeps its Windows parent. */
	msys(rows){
		if (!Array.isArray(rows) || !rows.length) return;
		const winpid = new Map(rows.map(([pid, , win]) => [pid, win]));
		this.real = new Map();
		for (const [, ppid, win] of rows) if (ppid !== 1) this.real.set(win, winpid.get(ppid) ?? 0);
	}

	/* ── sorting every process into a group ───────────────────────────── */

	sort(at){
		const procs = this.procs, kids = new Map(), group = new Map(), groups = new Map();
		// a parent pid only counts if that process was born before the child (Windows reuses pids)
		const parent = p => {
			if (this.real?.has(p.pid)){ const w = this.real.get(p.pid); return w ? procs.get(w) ?? null : null; }
			const q = procs.get(p.ppid); return q && (!q.born || !p.born || q.born <= p.born) ? q : null;
		};
		for (const p of procs.values()){ const q = parent(p); if (q) (kids.get(q.pid) ?? kids.set(q.pid, []).get(q.pid)).push(p.pid); }
		const claim = (pid, key) => {
			for (const stack = [pid]; stack.length;){
				const x = stack.pop();
				if (group.has(x)) continue;
				group.set(x, key);
				stack.push(...(kids.get(x) ?? []));
			}
		};
		const meet = (key, info) => groups.get(key) ?? groups.set(key, { key, ...info, n: 0, mb: 0, cpu: 0, pids: [] }).get(key);

		// 1. every live agent's own claude.exe, for its task
		const agents = this.agents();
		for (const a of agents){
			const pid = a.pid && procs.get(a.pid)?.name?.toLowerCase() === "claude.exe" ? a.pid : null;
			if (!pid) continue;
			meet(a.group, { kind: a.kind, label: a.label, agents: [] }).agents.push({ id: a.id, pid, state: a.state });
			claim(pid, a.group);
		}
		// 2. Servex, the node that supervises it, and its other children
		meet("servex", { kind: "servex", label: "Servex" });
		for (let p = procs.get(process.pid); p && p.name?.toLowerCase() === "node.exe"; p = parent(p)) group.set(p.pid, "servex");
		group.delete(process.pid); claim(process.pid, "servex");
		// 3. Claude Code sessions Servex did not start
		for (const p of procs.values())
			if (p.name?.toLowerCase() === "claude.exe" && !group.has(p.pid) && parent(p)?.name?.toLowerCase() !== "claude.exe"){
				const key = `session ${p.pid}`;
				meet(key, { kind: "session", label: `Claude Code session (pid ${p.pid})`, parent: parent(p)?.name ?? null });
				claim(p.pid, key);
			}
		// 4. the detached servers Servex started
		for (const pid of this.detached()) if (procs.has(pid)){ meet("dev servers", { kind: "servers", label: "Dev servers" }); claim(pid, "dev servers"); }
		// 5. whatever is ours but whose parent is gone
		for (const p of procs.values()){
			if (group.has(p.pid) || parent(p) || !OUR_KINDS.test(p.name ?? "") || !ours_cmd(p)) continue;
			const waiter = WAITERS.test(p.name) && tree(p.pid, kids).every(x => /^conhost.exe$/i.test(procs.get(x)?.name ?? "") || WAITERS.test(procs.get(x)?.name ?? ""))   // a console host ends with its process;
			const key = waiter ? "orphans" : "dev servers";
			meet(key, waiter ? { kind: "orphans", label: "Orphans (parent gone)" } : { kind: "servers", label: "Dev servers" });
			claim(p.pid, key);
		}

		const ours = { n: 0, mb: 0, cpu: 0 }, other = { n: 0, mb: 0, cpu: 0 }, names = new Map();
		for (const p of procs.values()){
			const key = group.get(p.pid);
			const g = key ? groups.get(key) ?? meet(key, { kind: "other", label: key }) : null;
			for (const t of g ? [g, ours] : [other]){ t.n++; t.mb += p.mb; t.cpu += p.cpu; }
			if (g) g.pids.push(p.pid);
			else if (p.pid){ const n = names.get(p.name) ?? names.set(p.name, { name: p.name, n: 0, mb: 0, cpu: 0 }).get(p.name); n.n++; n.mb += p.mb; n.cpu += p.cpu; }
		}
		const tidy = t => ({ ...t, mb: Math.round(t.mb), cpu: round(t.cpu, 1) });
		const list = [...groups.values()].filter(g => g.n).map(tidy).sort((a, b) => b.mb - a.mb);
		const orphans = (groups.get("orphans")?.pids ?? []).map(pid => this.row(procs.get(pid), at));
		const free_mb = Math.round(os.freemem() / 1024 ** 2), total_mb = Math.round(os.totalmem() / 1024 ** 2);
		return {
			at: stamp(), every_s: this.every / 1000,
			total_mb, free_mb, used_mb: total_mb - free_mb,
			ours: tidy(ours), other: tidy(other),
			groups: list,
			other_top: [...names.values()].map(tidy).sort((a, b) => b.mb - a.mb).slice(0, 8),
			orphans, reaped: this.reaped.slice(-10),
			running: agents.map(a => ({ id: a.id, state: a.state, group: a.group, pid: a.pid && procs.has(a.pid) ? a.pid : null,
				mb: a.pid ? procs.get(a.pid)?.mb ?? null : null, lost: (a.state === "working" || a.state === "idle") && !(a.pid && procs.has(a.pid)) })),
			monitor_cost_s: this.cost
		};
	}

	row(p, at = Date.now()){
		return p && { pid: p.pid, ppid: p.ppid, name: p.name, mb: p.mb, cpu: p.cpu, born: p.born,
			idle_min: p.idle_since ? Math.round((at - p.idle_since) / 60000) : null, cmd: String(p.cmd).slice(0, 300) };
	}

	/* Every live agent: its claude.exe's pid, and the group it counts for. */
	agents(){
		const host = this.servex?.agents, live = [...(host?.live?.values() ?? [])];
		const Agent = host?.constructor?.Agent;
		const by_session = new Map();
		for (const p of this.procs.values()){ const m = SESSION.exec(p.cmd ?? ""); if (m && p.name?.toLowerCase() === "claude.exe") by_session.set(m[1], p.pid); }
		const standing = /^(assistant-|manager-|master-assistant|session-|dispatcher$)/;
		const task_of = a => {
			for (let x = a, hops = 0; x && hops < 8; x = host?.live?.get(x.parent), hops++){
				const dir = x.task?.dir ?? host?.task_dir_of?.(x.id) ?? null;
				if (dir) return task_key(dir);
			}
			return null;
		};
		return live.filter(a => a.state !== "stopped" && (!Agent || a instanceof Agent)).map(a => {
			const pid = a.claude_pid && this.procs.has(a.claude_pid) ? a.claude_pid : by_session.get(a.session_id) ?? a.claude_pid ?? null;
			if (pid && pid !== a.claude_pid && this.procs.get(pid)){ a.claude_pid = pid; }   // learned from the command line
			const task = standing.test(a.id) ? null : task_of(a);
			return { id: a.id, state: a.state, pid,
				group: standing.test(a.id) ? "front desk" : task ? `task ${task}` : `agent ${a.id}`,
				kind: standing.test(a.id) ? "desk" : task ? "task" : "agent",
				label: standing.test(a.id) ? "Front desk" : task ?? a.id };
		});
	}

	/* The detached servers: procs/*.json (Process.js) and the port-80 gate. */
	detached(){
		const out = [];
		try { for (const f of fs.readdirSync(place("procs"))) try { out.push(JSON.parse(fs.readFileSync(path.join(place("procs"), f), "utf8")).pid); } catch {} } catch {}
		for (const p of this.procs.values()) if (/gate\.mjs/i.test(p.cmd)) out.push(p.pid);
		return out.filter(Boolean);
	}

	/* ── orphans ──────────────────────────────────────────────────────── */

	/* End an orphan only when all of this holds: a waiter kind (never node, never
	 * an app), its parent gone, its command line ours, and not a whisker of CPU
	 * for `reap_after_ms`. One line on the `processes` log for each. */
	reap(){
		const at = Date.now();
		for (const o of this.now?.orphans ?? []){
			const p = this.procs.get(o.pid);
			if (!p || !WAITERS.test(p.name) || !ours_cmd(p) || !p.idle_since || at - p.idle_since < this.reap_after_ms) continue;
			let ok = true; try { process.kill(p.pid); } catch (e) { ok = e.code === "ESRCH"; }
			const entry = { type: "reaped", at: stamp(), pid: p.pid, name: p.name, mb: p.mb, idle_min: Math.round((at - p.idle_since) / 60000), cmd: String(p.cmd).slice(0, 200), ok };
			this.reaped.push(entry);
			if (this.reaped.length > 50) this.reaped.shift();
			this.procs.delete(p.pid);
			this.log(entry);
		}
	}

	/* ── what is kept ─────────────────────────────────────────────────── */

	point(s){
		const cpu = round(s.ours.cpu + s.other.cpu, 1);
		return { at: s.at, cpu, ours_mb: s.ours.mb, ours_cpu: s.ours.cpu, other_mb: s.other.mb, free_mb: s.free_mb,
			groups: Object.fromEntries(s.groups.map(g => [g.key, [g.mb, g.cpu]])) };
	}

	write(){
		const s = this.now;
		if (!s) return;
		this.log({ type: "minute", free_mb: s.free_mb, used_mb: s.used_mb, ours: s.ours, other: s.other,
			groups: s.groups.map(({ key, n, mb, cpu }) => ({ key, n, mb, cpu })),
			orphans: s.orphans.length, other_top: s.other_top.slice(0, 5) });
	}

	/* What `/api/processes` and `system_health` hand out. */
	summary({ history = true } = {}){
		return { ...(this.now ?? { at: null, groups: [], orphans: [] }),
			worktrees: this.servex?.worktrees?.summary() ?? null,     // Worktrees.js: the count, and what was removed
			history: history ? this.history : undefined };
	}

	/* One line for system_health and the flag message. */
	line(){
		const s = this.now;
		if (!s) return "Processes: no sample yet (the first comes 10 s after Servex starts).";
		const gb = mb => (mb / 1024).toFixed(1);
		const top = s.groups.filter(g => g.kind === "task").slice(0, 3).map(g => `${g.label} ${gb(g.mb)} GB`).join(", ");
		return `Ours ${gb(s.ours.mb)} GB in ${s.ours.n} processes, everything else ${gb(s.other.mb)} GB, ${gb(s.free_mb)} GB free.`
			+ (top ? ` Top tasks: ${top}.` : "")
			+ (s.orphans.length ? ` ${s.orphans.length} orphaned process${s.orphans.length === 1 ? "" : "es"}.` : "")
			+ (this.servex?.worktrees ? ` ${this.servex.worktrees.line()}` : "");
	}
}

const round = (n, places = 1) => Math.round(n * 10 ** places) / 10 ** places;

/** "…/public/framework/ai/2026-09-30/process-monitor" -> "2026-09-30/process-monitor" */
export function task_key(dir){
	const parts = String(dir).split(/[\\/]+/), i = parts.lastIndexOf("ai");
	return i >= 0 ? parts.slice(i + 1).join("/") : parts.slice(-2).join("/");
}

function tree(pid, kids){
	const out = [];
	for (const stack = [pid]; stack.length;){ const x = stack.pop(); out.push(x); stack.push(...(kids.get(x) ?? [])); }
	return out;
}

function lines(stream, each){
	let rest = "";
	stream.setEncoding("utf8");
	stream.on("data", chunk => {
		const parts = (rest + chunk).split(/\r?\n/);
		rest = parts.pop();
		for (const part of parts) if (part.trim()) each(part.trim());
	});
}

/* The loop. One CIM query per round (about 0.2 s of CPU) and Git's `ps -e`; a
 * command line crosses the pipe only the first time a process is seen. Exits
 * when Servex is gone. */
const PS = String.raw`
$ErrorActionPreference = 'SilentlyContinue'
$parent = __PARENT__
$every = __EVERY__
$seen = @{}
$msysps = $null
try { $d = Split-Path (Get-Command git.exe -ErrorAction Stop).Source; for ($i = 0; $i -lt 4 -and $d -and -not $msysps; $i++) { if (Test-Path "$d/usr/bin/ps.exe") { $msysps = "$d/usr/bin/ps.exe" }; $d = Split-Path $d } } catch {}
while ($true) {
  if (-not (Get-Process -Id $parent -ErrorAction SilentlyContinue)) { exit }
  $now = @{}
  $rows = New-Object System.Collections.Generic.List[object]
  foreach ($p in Get-CimInstance Win32_Process -Property ProcessId,ParentProcessId,Name,WorkingSetSize,CreationDate,KernelModeTime,UserModeTime,CommandLine) {
    $born = $null; if ($p.CreationDate) { $born = [DateTimeOffset]::new($p.CreationDate).ToUnixTimeMilliseconds() }
    $key = "$($p.ProcessId)|$born"; $now[$key] = 1
    $r = @($p.ProcessId, $p.ParentProcessId, $p.Name, [math]::Round($p.WorkingSetSize / 1MB, 1), [math]::Round(($p.KernelModeTime + $p.UserModeTime) / 1e7, 2), $born)
    if (-not $seen.ContainsKey($key)) { $r += ,[string]$p.CommandLine }
    $rows.Add($r)
  }
  $seen = $now
  $msys = New-Object System.Collections.Generic.List[object]
  if ($msysps) { foreach ($l in (& $msysps -e 2>$null | Select-Object -Skip 1)) { $f = -split $l; if ($f.Count -ge 4) { $msys.Add(@([int]$f[0], [int]$f[1], [int]$f[3])) } } }
  $me = Get-Process -Id $PID
  [Console]::Out.WriteLine((@{ rows = $rows; msys = $msys; self = [math]::Round($me.CPU, 2) } | ConvertTo-Json -Compress -Depth 3))
  [Console]::Out.Flush()
  Start-Sleep -Seconds $every
}
`;
