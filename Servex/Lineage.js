import { stamp } from "./home.js";
import SpawnLog from "./SpawnLog.js";

/* WHO STARTED THIS PID, FOR THE PROCESSES SPAWNLOG CANNOT SEE: a process an agent's own claude.exe starts (the Bash tool's shell, grep, node,
 * a Playwright browser, a worktree dev server) is not started by Servex, so Crumbs/SpawnLog never see it. Processes.js already holds the whole
 * process table every 10 s; this class diffs that table against the last one. A process that is new and descends from one of ours gets a start
 * line, and when it is gone from a later sample it gets an end line. Both carry `"seen":"sample"` and `code: null` (the exit code is unknown).
 *
 * Ours = an agent's claude_pid (`owners`), Servex's own pid (`self`), a pid SpawnLog already logged (`SpawnLog.logged`), or a process this class
 * already logged. The nearest such ancestor names the agent (or none: the `spawns` log) and the `why` ("child of claude.exe" / "child of <why>").
 * A child that lives under one sample (10 s) is never seen; it cannot leak, so that is fine. No PowerShell call here: it is a Map diff.
 * Doc: Servex/doc/processes.md, "Who started this pid". */
export default class Lineage {
	static CAP = 60;            // start lines per owner (an agent, or Servex) per minute; the rest are only counted, in a {"pid_dropped"} line
	static MINUTE = 60000;
	static SKIP = /^conhost\.exe$/i;   // every console process has one; it ends with its process

	constructor({ cap = this.constructor.CAP } = {}){
		this.cap = cap;
		this.known = new Map();    // pid -> { born, ctx, why, cmd } for each process this class logged a start line for
		this.window = new Map();   // owner key -> { at, n, dropped, skipped }
	}

	/* One sample. procs: Map pid -> {pid, ppid, name, born, cmd}; up(p): the live parent of p or null; owners: Map claude_pid -> {agent, session, dir};
	 * self: Servex's pid. Returns the writes for the caller to make: [{ ctx, line }], each `ctx` a SpawnLog context. */
	tick({ procs, up, owners, self, now = Date.now() }){
		const out = [];
		for (const [pid, rec] of this.known){
			if (procs.get(pid)?.born === rec.born) continue;
			this.known.delete(pid);
			out.push({ ctx: rec.ctx, line: { pid_exit: pid, ended: stamp(now), code: null, signal: null, seen: "sample" } });
		}
		for (const p of procs.values()){
			if (this.known.has(p.pid) || p.pid === self || owners.has(p.pid) || SpawnLog.logged.has(p.pid) || this.constructor.SKIP.test(p.name ?? "")) continue;
			const root = this.root(p, up, owners, self);
			if (!root) continue;
			const key = root.ctx.agent ?? "servex", w = this.slot(key, now);
			if (w.n >= this.cap){
				if (!w.skipped.has(p.pid)){ w.skipped.add(p.pid); w.dropped++; w.ctx = root.ctx; }   // counted once per minute, though it is still new at the next sample
				continue;
			}
			w.n++;
			const why = root.why;
			this.known.set(p.pid, { born: p.born, ctx: root.ctx, why });
			out.push({ ctx: root.ctx, line: { pid: p.pid, cmd: String(p.cmd ?? p.name ?? "").replace(/\s+/g, " ").slice(0, SpawnLog.CUT), why, agent: root.ctx.agent ?? null,
				session: root.ctx.session ?? null, started: stamp(p.born || now), ppid: p.ppid, seen: "sample" } });
		}
		for (const [key, w] of this.window) if (w.dropped > (w.said ?? 0)){
			w.said = w.dropped;
			out.push({ ctx: w.ctx ?? { agent: key === "servex" ? null : key }, line: { pid_dropped: w.dropped, agent: key === "servex" ? null : key, cap: this.cap, window_start: stamp(w.at), seen: "sample" } });
		}
		return out;
	}

	/* The nearest ancestor that is ours: { ctx, why }, or null. Walks at most 64 hops and never loops. */
	root(p, up, owners, self){
		const seen = new Set();
		for (let q = up(p), hops = 0; q && hops < 64 && !seen.has(q.pid); q = up(q), hops++){
			seen.add(q.pid);
			const o = owners.get(q.pid);
			if (o) return { ctx: { agent: o.agent, session: o.session ?? null, dir: o.dir }, why: "child of claude.exe" };
			const log = SpawnLog.logged.get(q.pid);
			if (log) return { ctx: { agent: log.agent ?? null, session: log.session ?? null, dir: log.dir }, why: `child of ${log.why}` };
			const k = this.known.get(q.pid);
			if (k && k.born === q.born) return { ctx: k.ctx, why: k.why };
			if (q.pid === self) return { ctx: { agent: null }, why: "child of servex" };
		}
		return null;
	}

	slot(key, now){
		let w = this.window.get(key);
		if (!w || now - w.at >= this.constructor.MINUTE){ w = { at: now, n: 0, dropped: 0, skipped: new Set() }; this.window.set(key, w); }
		return w;
	}
}
