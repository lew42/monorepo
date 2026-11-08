import fs from "node:fs";
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { execFile } from "node:child_process";
import { place, stamp } from "./home.js";

/* WHO STARTED THIS PID: every child_process spawn Servex makes gets a `{"pid":N,...}` line, and an exit line when it ends.
 * Crumbs.js calls `SpawnLog.watch()` after each async child_process function. Attribution is an AsyncLocalStorage store
 * ({agent, session, why, dir, parent_dir}) entered by `SpawnLog.within()` where an agent tool runs (agents/tools.js) and
 * around the agent's own claude.exe (Agents.spawn_claude). With an agent the line goes to its session log (and its parent's,
 * for claude.exe); with none, to the Servex log `spawns`. Doc: Servex/doc/processes.md, "Who started this pid". */
export default class SpawnLog {
	static store = new AsyncLocalStorage();
	static sink = null;      // Servex's single-writer Log, set in Servex.admission(); without it the `spawns` file is appended directly
	static CUT = 300;
	static QUIET = [/Get-CimInstance Win32_Process/, /^netstat\b/, /\bworktree list\b/, /rev-parse --verify --quiet/];   // no-agent polls (~9 of the ~12 spawns a minute): not worth a line
	static logged = new Map();   // pid -> { agent, session, why, dir, ended }: what watch() has seen, so Lineage.js (the 10 s sample) skips these pids and inherits their owner; an ended entry is kept two minutes, for a sample that raced the exit
	static chain = null;
	static deps = null;

	static within(ctx, fn){ return this.store.run(ctx, fn); }

	/* A dir given as a function resolves late; relative dirs resolve against Servex's cwd, as open_task does. */
	static dir_of(dir){
		try { const d = typeof dir === "function" ? dir() : dir; return d ? path.resolve(d) : null; } catch { return null; }
	}

	/* The session log of a task dir: its session.jsonl if there is one, else task.jsonl; null when the dir has neither. */
	static file_of(dir){
		const d = this.dir_of(dir);
		return d && this.deps?.SessionRecord.log_file(d) || null;
	}

	/* The parent agent's task dir: its live task, its registry row, the heartbeat's owner map. */
	static dir_for(agents, id){
		try { return agents.live?.get(id)?.task?.dir ?? agents.reg?.().read()[id]?.task_dir ?? agents.task_dir_of?.(id) ?? null; } catch { return null; }
	}

	/* Run `job(deps)` after LogLine and SessionRecord have loaded (lazily, so a Worker or a bare import costs nothing), in order, never throwing. */
	static later(job){
		try {
			this.deps ??= null;
			this.chain ??= import("../Server/LogLine.mjs").then(async l => { this.deps = { LogLine: l.default, SessionRecord: (await import("../Server/SessionRecord.mjs")).default }; });
			return this.chain = this.chain.then(() => job(this.deps)).catch(() => {});
		} catch { return null; }
	}

	static flush(){ return this.chain ?? Promise.resolve(); }

	/* One line, whole, into a task dir's session log through the one appender. Used by the spawn gate (Servex.hold/drain) and by watch(). */
	static note(dir, obj){
		return this.later(({ LogLine }) => {
			const file = this.file_of(dir);
			if (file) LogLine.raw(file, { ...obj, by: "servex", ts: stamp() });
		});
	}

	/* The machine's load as the queued line records it; the process monitor has no page-file reading yet, so page_file_mb is null until it grows one. */
	static load(servex){
		const pct = servex?.global?.commit_pct?.() ?? null;   // one rule: Global.commit_pct() (Servex/agents/Global.js)
		return { commit_pct: pct == null ? null : Math.round(pct * 10) / 10, page_file_mb: servex?.procmon?.page_file_mb ?? null };
	}

	/* Called by Crumbs after spawn/exec/execFile/fork. `result` is the ChildProcess, or (promisified exec/execFile) a promise carrying `.child`.
	 * Sync variants never get here: they have no live pid to report. */
	static watch(name, args, result){
		try {
			const child = result?.child ?? result, pid = child?.pid;
			if (typeof pid !== "number" || typeof child.once !== "function") return;
			const cmd = [args[0], ...(Array.isArray(args[1]) ? args[1] : typeof args[1] === "string" ? [args[1]] : [])].join(" ").replace(/\s+/g, " ");
			const ctx = this.store.getStore() ?? null;
			const mine = { agent: ctx?.agent ?? null, session: ctx?.session ?? null, why: ctx?.why ?? `${name}:${path.basename(String(args[0]))}`, dir: ctx?.dir ?? null, ended: null };
			this.logged.set(pid, mine);
			if (this.logged.size > 400) for (const [k, v] of this.logged) if (v.ended && Date.now() - v.ended > 120000) this.logged.delete(k);
			if (!ctx?.agent && this.QUIET.some(q => q.test(cmd))) return void child.once("exit", () => { mine.ended = Date.now(); });
			const where = this.targets(ctx);
			const line = { pid, cmd: cmd.slice(0, this.CUT), why: ctx?.why ?? `${name}:${path.basename(String(args[0]))}`, agent: ctx?.agent ?? null, session: ctx?.session ?? null, started: stamp() };
			this.put(where, line);
			child.once("exit", (code, signal) => { mine.ended = Date.now(); this.put(where, { pid_exit: pid, ended: stamp(), code, signal: signal ?? null }); });
		} catch { /* a log line must never reach the caller */ }
	}

	/* Where this context's lines go: the agent's own dir (and, for claude.exe, its parent's), or the `spawns` log. */
	static targets(ctx){
		if (!ctx?.agent) return null;
		const dirs = [ctx.dir, ctx.parent_dir].map(d => this.dir_of(d)).filter(Boolean);
		return dirs.length ? dirs : null;
	}

	static put(where, line){
		if (!where) return this.spawns(line);
		return this.later(({ LogLine }) => {
			let wrote = false;
			for (const d of new Set(where)){ const file = this.file_of(d); if (file){ LogLine.raw(file, { ...line, by: "servex" }); wrote = true; } }
			if (!wrote) this.spawns(line);   // a dir with no session.jsonl or task.jsonl: never drop the line
		});
	}

	/* GONE AT BOOT (doc/processes.md): `leaks.mjs --close-gone` prints the end lines a crash never wrote; Servex appends them here, as the
	 * one writer, into the same logs as their starts. Async and never throws; resolves to how many lines were written. `run` is for the test. */
	static close_gone(root, before_iso, run = null){
		run ??= () => new Promise(ok => execFile(process.execPath, [path.join(root, "Servex", "leaks.mjs"), "--close-gone", "--root", root, "--before", before_iso],
			{ cwd: root, windowsHide: true, maxBuffer: 1 << 26 }, (err, out) => ok(err ? "" : String(out))));
		return Promise.resolve().then(run).then(out => {
			let writes = []; try { writes = JSON.parse(out).writes ?? []; } catch {}
			for (const { file, line } of writes){
				if (file === "spawns") this.spawns(line);
				else this.later(({ LogLine }) => LogLine.raw(path.join(root, file), { ...line, by: "servex" }));
			}
			return this.flush().then(() => writes.length);
		}).catch(() => 0);
	}

	static spawns(line){
		try {
			if (this.sink) return void this.sink.append("spawns", line).catch(() => {});
			fs.appendFileSync(place("logs", "spawns.jsonl"), JSON.stringify(line) + "\n");
		} catch { /* never throws */ }
	}
}
