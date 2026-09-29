/* LIFECYCLE — every resource the system makes is written down when it starts and when it ends,
 * and a reaper closes whatever a finished task still owns. Node does this, not an agent's memory
 * (the owner, 2026-09-29, after 22 dev servers were left running: "we don't want to rely on the
 * AIs to remember").
 *
 *   record({kind, id, event, ...})   one line in lifecycle.jsonl (Servex's single writer; a
 *                                    direct append when Servex is down). kind: agent task
 *                                    worktree server health browser.
 *   track(kind, id, extra)           a process logs its own start now and its own end on exit.
 *   new Lifecycle().reap(task)       close everything one task owns (on-landing.mjs calls it).
 *   new Lifecycle().sweep()          close what a landed / long-dead task still owns, and idle
 *                                    one-pass agents; Servex runs it on the heartbeat tick.
 *
 *   node Servex/Lifecycle.js --dry            what the sweep would close, and why
 *   node Servex/Lifecycle.js --reap <dir> [--dry]
 *   node Servex/Lifecycle.js --stop <pid>     stop one process you started (wrapper first) and log its end
 *
 * Never touched: the main site (:3104, the main checkout's own server), Servex, the gate, whisper,
 * and every port in Servex/keep.json. A worktree keeps its files; only its processes stop.
 * Doc: Servex/doc/lifecycle.md. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { place, stamp } from "./home.js";
import { task_state, task_for_worktree } from "../Server/worktree-sweep.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const norm = p => p ? path.resolve(String(p)).replace(/\\/g, "/").toLowerCase() : "";
const inside = (p, root) => !!p && !!root && (norm(p) + "/").startsWith(norm(root) + "/");
const hours = ms => Math.round(ms / 360000) / 10;
const SERVEX = () => `http://127.0.0.1:${process.env.SERVEX_PORT || 8090}`;
export const ONE_PASS = /^(reviewer|clarity|checker|critic|fork)$/;
export const DEAD_MS = 2 * 3600 * 1000;

let main_cache;
export function main_repo(){
	if (main_cache) return main_cache;
	try {
		const common = execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: HERE, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).trim();
		return main_cache = path.resolve(HERE, common, "..");
	} catch { return main_cache = path.resolve(HERE, ".."); }
}
const ai_dir = () => path.join(main_repo(), "public", "framework", "ai");

/** A task's key: its dir relative to public/framework/ai/ ("2026-09-29/lifecycle/build"). */
export function task_key(dir){
	if (!dir) return null;
	const abs = path.isAbsolute(dir) ? dir : path.join(main_repo(), dir);
	const rel = path.relative(ai_dir(), abs);
	return rel.startsWith("..") ? String(dir).replace(/\\/g, "/") : rel.split(path.sep).join("/");
}

/** Who owns a process started here: LEW_TASK, else the task of the worktree the cwd is in, else null. */
export function owner_task(cwd = process.cwd()){
	if (process.env.LEW_TASK) return task_key(process.env.LEW_TASK);
	const wt = norm(cwd).match(/^(.*\/worktrees\/[^/]+)/)?.[1];
	if (!wt) return null;
	try { return task_for_worktree(wt, main_repo())?.key ?? null; } catch { return null; }
}

const line = e => JSON.stringify({ at: stamp(), owner_task: null, owner_agent: null, ...e }) + "\n";
export function record_sync(e){ try { fs.appendFileSync(place("logs", "lifecycle.jsonl"), line(e)); } catch {} }

/** One line in lifecycle.jsonl: through `log` (Servex's own Log) when given, else Servex's HTTP door, else directly. */
export async function record(e, log){
	if (log) return log.append("lifecycle", { owner_task: null, owner_agent: null, ...e }).catch(() => record_sync(e));
	try {
		const r = await fetch(`${SERVEX()}/log/lifecycle`, { method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ owner_task: null, owner_agent: null, ...e }), signal: AbortSignal.timeout(1500) });
		if (r.ok) return;
	} catch {}
	record_sync(e);
}

/** A process writes its own start now and its own end when it exits (a hard kill is caught by the sweep instead). */
export function track(kind, id, extra = {}){
	const base = { kind, id, pid: process.pid, path: process.cwd(), owner_task: owner_task(), owner_agent: process.env.LEW_AGENT || null, ...extra };
	record({ ...base, event: "start" });
	process.once("exit", code => record_sync({ ...base, event: "end", why: `exited (code ${code})` }));
	return base;
}

export function keep_ports(){
	let extra = [];
	try { extra = JSON.parse(fs.readFileSync(path.join(HERE, "keep.json"), "utf8")); } catch {}
	return new Set([80, 3104, 8079, 8090, Number(process.env.SERVEX_PORT) || 8090, ...extra].map(Number));
}

export default class Lifecycle {
	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* ── the hooks Servex calls (Agents.js, Pool.js) ─────────────────── */

	record(e){ return record(e, this.servex?.log); }

	agent_started(a, spec = {}){
		const owner_task = spec.task?.dir ? task_key(spec.task.dir) : null;
		this.record({ kind: "agent", id: a.id, role: a.role ?? null, path: a.cwd ?? null, owner_task, owner_agent: a.parent ?? null, event: "start" });
		if (owner_task && !spec.resume) this.record({ kind: "task", id: owner_task, owner_task, owner_agent: a.id, event: "start" });
	}

	agent_ended(a){
		if (a.lifecycle_ended) return;
		a.lifecycle_ended = true;
		this.record({ kind: "agent", id: a.id, role: a.role ?? null, owner_agent: a.parent ?? null, event: "end", why: a.reaped_why ?? (this.servex?.agents?.closing ? "Servex shut down" : "stopped") });
	}

	/** take_worktree: the taker's task log learns its worktree, and the log a start line. */
	took(slot, caller){
		const t = task_of_agent(caller);
		if (t) try { fs.appendFileSync(path.join(t.dir, "task.jsonl"), JSON.stringify({ assign: { worktree: slot.path, branch: slot.branch } }) + "\n"); } catch {}
		this.record({ kind: "worktree", id: slot.id, path: slot.path, port: slot.port, owner_task: t?.key ?? null, owner_agent: caller ?? null, event: "start" });
	}

	/** A pool slot salvaged: one end line naming the branch, and one line on the holder's card. */
	async salvaged(slot, holder, branch, what){
		const t = task_of_agent(holder);
		await this.record({ kind: "worktree", id: slot.id, path: slot.path, port: slot.port, owner_task: t?.key ?? null, owner_agent: holder, event: "end", why: what, branch });
		const text = `Worktree ${slot.id} was held by ${holder}, which has stopped. Its work is ${what}.`;
		if (t?.card) try { this.servex?.assistant ? this.servex.assistant.card_reply({ card: t.card, from: "lifecycle", text }) : await this.tool("card_reply", { card: t.card, from: "lifecycle", text }); } catch {}
	}

	/* ── what exists ─────────────────────────────────────────────────── */

	/** node/cmd/chrome processes with their parents and command lines, one PowerShell call. */
	processes(){
		const ps = "Get-CimInstance Win32_Process -Filter \"Name='node.exe' or Name='cmd.exe' or Name='chrome.exe' or Name='bash.exe'\" | ForEach-Object { [pscustomobject]@{pid=$_.ProcessId;ppid=$_.ParentProcessId;name=$_.Name;cmd=$_.CommandLine;born=$_.CreationDate.ToString('o')} } | ConvertTo-Json -Compress";
		const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8", windowsHide: true, maxBuffer: 32 << 20 });
		let rows = []; try { rows = [].concat(JSON.parse(r.stdout || "[]")); } catch {}
		const ports = new Map();
		const ns = spawnSync("netstat", ["-ano", "-p", "TCP"], { encoding: "utf8", windowsHide: true }).stdout || "";
		for (const m of ns.matchAll(/TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)/g)) (ports.get(+m[2]) ?? ports.set(+m[2], []).get(+m[2])).push(+m[1]);
		return new Map(rows.map(p => [p.pid, { ...p, cmd: p.cmd || "", born: Date.parse(p.born) || null, ports: ports.get(p.pid) ?? [] }]));
	}

	/** The logged process is still the one running: same pid AND born no later than its start line (Windows reuses pids). */
	alive(e){
		const p = e.pid && this.procs?.get(e.pid);
		return !!p && (!p.born || !e.at || p.born <= Date.parse(e.at) + 5000);
	}

	/** Every start line with no end line after it, keyed kind:id. */
	open(){
		let text = ""; try { text = fs.readFileSync(place("logs", "lifecycle.jsonl"), "utf8"); } catch {}
		const open = new Map();
		for (const raw of text.split("\n")) { let e; try { e = JSON.parse(raw); } catch { continue; }
			const k = `${e.kind}:${e.id}`; if (e.event === "start") open.set(k, e); else if (e.event === "end") open.delete(k); }
		return [...open.values()];
	}

	async agents(){
		if (this.servex?.agents) return this.servex.agents.registry_list().map(r => ({ ...r, turns: this.servex.agents.live.get(r.id)?.turns ?? r.turns }));
		try { return await (await fetch(`${SERVEX()}/agents`, { signal: AbortSignal.timeout(3000) })).json(); } catch { return []; }
	}

	task(key){
		if (!key) return null;
		return (this.tasks ??= new Map()).get(key) ?? this.tasks.set(key, (() => {
			const dir = path.join(ai_dir(), key), state = task_state(dir);
			if (!state) return null;
			let mtime = 0; try { mtime = fs.statSync(path.join(dir, "task.jsonl")).mtimeMs; } catch {}
			return { key, dir, ...state, landed: !!(state.landed_at && String(state.outcome ?? "").trim()), mtime };
		})()).get(key);
	}

	/** Everything that is running and who owns it: the log's open lines, the worktree registry, the process list, the agents. */
	async resources(){
		const procs = this.procs = this.processes(), rows = [], seen = new Set(), main = main_repo();
		// one row per process TREE: claiming a row claims its wrapper and everything under it
		const kids = new Map();
		for (const p of procs.values()) (kids.get(p.ppid) ?? kids.set(p.ppid, []).get(p.ppid)).push(p.pid);
		const claim = pid => { for (const stack = [pid]; stack.length;) { const x = stack.pop(); if (!seen.has(x)) { seen.add(x); stack.push(...(kids.get(x) ?? [])); } } };
		const add = r => { if (r.pid && seen.has(r.pid)) return; if (r.pid) claim(r.pid); rows.push(r); };
		for (const e of this.open()) if (this.alive(e) && ["server", "health", "browser"].includes(e.kind)) {
			const top = this.wrapper(procs.get(e.pid));
			add({ kind: e.kind, id: e.id, pid: top.pid, child: top.pid !== e.pid ? e.pid : null, port: e.port, path: e.path, owner_task: e.owner_task, owner_agent: e.owner_agent, born: Date.parse(e.at), logged: true });
		}
		let reg = {}; try { reg = JSON.parse(fs.readFileSync(path.join(main, ".worktrees.json"), "utf8")); } catch {}
		for (const w of Object.values(reg)) if (this.alive({ pid: w.pid, at: w.created_at }))
			add({ kind: "server", id: `worktree:${w.name}`, pid: w.pid, port: w.port, path: w.path, owner_task: task_for_worktree(w.path, main)?.key ?? null, born: Date.parse(w.created_at) });
		// a run.js / health.mjs child names its checkout in its own command line; a wrapper whose child
		// died names it only in the cmd that launched it (worktree-up's `>> .worktree-logs\<name>.log`)
		const from_log = p => p?.cmd.match(/\.worktree-logs[\\/]([a-z0-9-]+)\.log/i)?.[1];
		const scan = (p, dir, kind) => {
			const top = this.wrapper(p);
			if (seen.has(top.pid) || seen.has(p.pid)) return;
			add({ kind, id: `${kind === "health" ? "health" : /run.js/i.test(p.cmd) ? "run" : "wrapper"}:${p.pid}`, pid: top.pid, child: p.pid !== top.pid ? p.pid : null, path: dir,
				port: [...p.ports, ...top.ports][0], owner_task: dir ? task_for_worktree(dir, main)?.key ?? null : null, born: top.born });
		};
		for (const p of procs.values()) {
			const m = p.cmd.match(/"?([A-Za-z]:[^"]*?)[\\/]Server[\\/](run\.js|health\.mjs)/i);
			if (m) scan(p, m[1], /health/i.test(m[2]) ? "health" : "server");
		}
		// a wrapper with no live child: its checkout is in worktree-up's log name, or in the
		// `cd <dir> && PORT=<n> node server.js` of the agent shell that started it by hand
		for (const p of procs.values()) if (p.name === "node.exe" && /\sserver\.js"?\s*$/i.test(p.cmd) && !seen.has(p.pid)) {
			const name = from_log(this.wrapper(p)) ?? from_log(procs.get(p.ppid));
			if (name) { scan(p, path.join(path.dirname(main), "worktrees", name), "server"); continue; }
			const sh = procs.get(p.ppid)?.cmd ?? "", cd = sh.match(/cd\s+([^\s&;'"]+)\s*&&[^]*?node server\.js/)?.[1];
			const dir = cd && cd.replace(/^\/([a-z])\//i, "$1:/");
			add({ kind: "server", id: `wrapper:${p.pid}`, pid: p.pid, path: dir || null, port: p.ports[0] ?? (Number(sh.match(/PORT=(\d+)/)?.[1]) || undefined),
				owner_task: dir ? task_for_worktree(dir, main)?.key ?? null : null, born: p.born });
		}
		const agents = this.all_agents = await this.agents();
		for (const a of agents) if (a.state === "idle")
			rows.push({ kind: "agent", id: a.id, role: a.role, parent: a.parent ?? null, turns: a.turns, path: a.cwd, owner_agent: a.parent ?? null });
		return rows;
	}

	/** Walk up from run.js to the supervisor that respawns it (server.js), and to the cmd that launched that. */
	wrapper(p){
		let top = p;
		for (let up = this.procs.get(p.ppid); up && /^(node|cmd)\.exe$/i.test(up.name) && /server\.js|health-supervisor|\/d \/c/i.test(up.cmd) && !/Servex/i.test(up.cmd); up = this.procs.get(up.ppid)) top = up;
		return top;
	}

	/* ── what to close ───────────────────────────────────────────────── */

	/** A plain sentence when this must be kept no matter what, else null. */
	kept(r){
		if (r.kind === "agent") return /^(assistant-|manager-|master-assistant|mastermind-servex|dispatcher$)/.test(r.id) ? "one of Servex's own standing agents" : null;
		const ports = keep_ports();
		if (r.port && ports.has(Number(r.port))) return `port ${r.port} is on the keep list`;
		if (r.path && norm(r.path) === norm(main_repo())) return "the main checkout's own server";
		// itself Servex, the gate or whisper, or started by one of them (3 node/cmd parents up; an agent's bash is never read)
		for (let p = this.procs?.get(r.pid), i = 0; p && i < 4 && /^(node|cmd)\.exe$/i.test(p.name); p = this.procs.get(p.ppid), i++)
			if (/Servex[\\/](index|sustain|gate)\.m?js|whisper/i.test(p.cmd)) return "Servex, the gate or whisper owns it";
		if (r.path && /[\\/]worktrees[\\/]qf-\d+/i.test(r.path)) return "a pool slot (Pool.js looks after it)";
		const busy = (this.all_agents ?? []).find(a => (a.state === "working" || a.state === "starting") && inside(a.cwd, r.path));
		if (r.kind !== "agent" && busy) return `${busy.id} is working there`;
		return null;
	}

	/** Why this should close now, or null. `only` narrows it to one task (reap). */
	why(r, only){
		if (this.kept(r)) return null;
		if (r.kind === "agent") {
			const rows = (this.all_agents ?? []).filter(a => a.id === r.parent);
			const owner = r.parent && (rows.find(a => a.state !== "stopped" && a.state !== "gone") ?? rows[0]);
			const task = [...(this.tasks?.values() ?? [])].find(t => t && t.agent && t.agent === r.parent);
			if (only) return task?.key === only || r.owner_task === only ? `idle, and its task ${only} has landed` : null;
			if (ONE_PASS.test(r.role ?? "") && (r.turns ?? 1) > 0) return `one-pass ${r.role}, its result is written`;
			if (task?.landed) return `idle, and its task ${task.key} has landed`;
			if (owner && (owner.state === "stopped" || owner.state === "gone") && r.role === "minion") return `idle, and its parent ${owner.id} has stopped`;
			return null;
		}
		if (only) return r.owner_task === only ? `its task ${only} has landed` : null;
		const t = this.task(r.owner_task), age = r.born ? Date.now() - r.born : 0;
		if (t?.landed) return `its task ${t.key} has landed`;
		if (t && Date.now() - t.mtime > DEAD_MS) return `its task ${t.key} has been silent for ${hours(Date.now() - t.mtime)} h`;
		if (!t && age > DEAD_MS) return `no owning task, running ${hours(age)} h`;
		return null;
	}

	/** Stop a process tree by its top pid (the wrapper, so nothing respawns), then any child still alive. */
	kill(r){
		for (const pid of [r.pid, r.child].filter(Boolean)) try { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {}
	}

	/** One Servex tool, over its door (a CLI run has no Servex in-process). */
	tool(name, args){
		return fetch(`${SERVEX()}/mcp?as=lifecycle`, { method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), signal: AbortSignal.timeout(20000) }).catch(() => {});
	}

	async close(r, why){
		const live = r.kind === "agent" && this.servex?.agents?.live?.get(r.id);
		if (live) { live.reaped_why = `reaped: ${why}`; return this.servex.agents.stop(r.id); }   // agent_ended() writes its end line
		if (r.kind === "agent") await this.tool("stop_agent", { id: r.id }); else this.kill(r);
		await record({ kind: r.kind, id: r.id, pid: r.pid, port: r.port, path: r.path, owner_task: r.owner_task ?? null, owner_agent: r.owner_agent ?? null, event: "end", why: `reaped: ${why}` }, this.servex?.log);
	}

	async plan(only){
		const rows = await this.resources();
		for (const r of rows) this.task(r.owner_task);
		for (const t of fsTasks(this)) this.task(t);
		return rows.map(r => ({ ...r, why: this.why(r, only), keep: this.kept(r) }));
	}

	/** Close everything task `dir` owns — on-landing.mjs calls this. */
	async reap(dir, { dry = false } = {}){
		const key = task_key(dir), rows = (await this.plan(key)).filter(r => r.why);
		if (!dry) for (const r of rows) await this.close(r, r.why);
		if (!dry) await record({ kind: "task", id: key, owner_task: key, event: "end", why: `landed; ${rows.length} resource(s) closed` }, this.servex?.log);
		return rows;
	}

	/** The heartbeat's sweep: close what a landed / dead task still owns, end the log lines of what already died, reclaim dead pool holders. */
	async sweep({ dry = false } = {}){
		const rows = await this.plan(null), close = rows.filter(r => r.why), gone = [];
		for (const e of this.open()) if (e.pid && e.kind !== "agent" && e.kind !== "worktree" && !this.alive(e)) gone.push(e);
		if (!dry) {
			for (const r of close) await this.close(r, r.why);
			for (const { at, ...e } of gone) await record({ ...e, event: "end", why: "found gone (killed without a goodbye)" }, this.servex?.log);
			try { await this.servex?.pool?.reclaim(); } catch {}
		}
		return { close, gone, kept: rows.filter(r => !r.why) };
	}
}

/** Task dirs of the last two days (both folder styles), newest first. */
function recent_tasks(){
	const out = [], day = d => { const x = new Date(Date.now() - d * 864e5); return [String(x.getFullYear()), String(x.getMonth() + 1).padStart(2, "0"), String(x.getDate()).padStart(2, "0")]; };
	const walk = (dir, depth) => {
		let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of list) if (e.isDirectory() && !e.name.startsWith(".") && depth < 4) walk(path.join(dir, e.name), depth + 1);
			else if (e.name === "task.jsonl") try { out.push({ dir, mtime: fs.statSync(path.join(dir, e.name)).mtimeMs }); } catch {}
	};
	for (const d of [0, 1]) { const [y, m, dd] = day(d); walk(path.join(ai_dir(), `${y}-${m}-${dd}`), 0); walk(path.join(ai_dir(), y, m, dd), 0); }
	return out.sort((a, b) => b.mtime - a.mtime);
}

/** The newest recent task whose log names this agent as its owner, or null. */
export function task_of_agent(id){
	if (!id) return null;
	for (const t of recent_tasks()) { const s = task_state(t.dir); if (s?.agent === id) return { ...s, dir: t.dir, key: task_key(t.dir) }; }
	return null;
}

/** The task keys the idle agents' parents answer for, so why() can map an agent to its task. */
function fsTasks(lc){
	const want = new Set((lc.all_agents ?? []).filter(a => a.state === "idle").map(a => a.parent).filter(Boolean));
	return want.size ? recent_tasks().filter(t => want.has(task_state(t.dir)?.agent)).map(t => task_key(t.dir)) : [];
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
	const argv = process.argv.slice(2), dry = argv.includes("--dry"), lc = new Lifecycle();
	const show = r => `  ${r.kind.padEnd(7)} ${String(r.id).padEnd(34)} pid ${r.pid ?? "-"} port ${r.port ?? "-"} task ${r.owner_task ?? "-"}\n          ${r.why ?? r.keep ?? "still in use"}`;
	if (argv.includes("--stop")) {
		const pid = Number(argv[argv.indexOf("--stop") + 1]);
		const procs = lc.procs = lc.processes(), p = procs.get(pid);
		if (!p) { console.log(`no process ${pid}`); process.exit(1); }
		const top = lc.wrapper(p), r = { kind: "server", id: `pid:${pid}`, pid: top.pid, child: pid !== top.pid ? pid : null, path: process.cwd() };
		for (const e of lc.open()) if (e.pid === top.pid || e.pid === pid) Object.assign(r, { kind: e.kind, id: e.id, port: e.port, path: e.path, owner_task: e.owner_task });
		if (lc.kept(r)) { console.log(`kept: ${lc.kept(r)}`); process.exit(1); }
		await lc.close(r, "stopped by hand (--stop)");
		for (const e of lc.open()) if ((e.pid === top.pid || e.pid === pid) && e.id !== r.id) { const { at, ...rest } = e; await record({ ...rest, event: "end", why: "reaped: stopped by hand (--stop)" }); }
		console.log(`stopped ${r.kind} ${r.id} (pid ${top.pid}${r.child ? `, child ${r.child}` : ""})`);
	} else if (argv.includes("--salvage")) {   // a stuck pool slot, by hand: node Servex/Lifecycle.js --salvage qf-2 [--dry]
		const { default: Pool } = await import("./Pool.js");
		const pool = new Pool({ servex: { lifecycle: lc, say: m => console.log(m) } }), id = argv[argv.indexOf("--salvage") + 1], slot = pool.slots.find(x => x.id === id);
		if (!slot) { console.log(`no pool slot ${id}`); process.exit(1); }
		if (dry) console.log(`would stop pid ${slot.watcher_pid} and ${slot.server_pid}, then salvage ${slot.path} (held by ${slot.taken_by})`);
		else console.log((await pool.salvage(slot, slot.taken_by)).what);
	} else if (argv.includes("--reap")) {
		const rows = await lc.reap(argv[argv.indexOf("--reap") + 1], { dry });
		console.log(`lifecycle reap: ${rows.length} ${dry ? "would close" : "closed"}`); rows.forEach(r => console.log(show(r)));
	} else {
		const { close, gone, kept } = await lc.sweep({ dry });
		console.log(`lifecycle sweep ${dry ? "(dry — nothing touched)" : ""}: ${close.length} to close, ${gone.length} dead log lines to end, ${kept.length} kept`);
		console.log(`\n${dry ? "WOULD CLOSE" : "CLOSED"}`); close.forEach(r => console.log(show(r)));
		console.log(`\nLOG LINES WHOSE PROCESS IS GONE`); gone.forEach(e => console.log(`  ${e.kind} ${e.id} pid ${e.pid}`));
		console.log(`\nKEPT`); kept.forEach(r => console.log(show(r)));
	}
}
