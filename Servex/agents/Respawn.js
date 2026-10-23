import fs from "node:fs";
import path from "node:path";
import { stamp } from "../home.js";

/* RESPAWN: a long-running agent is replaced by a fresh session about once a day, so its context stays small (the owner, 2026-10-22:
 * "respawn it fresh about once a day ... findable by that id and by its task folder and log"). Same id, so messages, process
 * creators and requests still reach it; a new session; one `respawn` line in its task log names the session it replaces.
 * Never mid-task: only when the agent is not working, nothing it spawned is working, and nothing waits in its queue.
 * Run by the TaskLoop tick (Servex/TaskLoop.js). Doc: Servex/agents/doc/lifecycle.md, "Fresh once a day". */
export default class Respawn {

	// Who is kept fresh. `task` is the folder whose log holds every session of it (repo-relative).
	static AGENTS = [{
		id: "mastermind-system-architect", role: "mastermind", model: "claude-opus-5-5", effort: "high",
		task: "public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system",
		title: "Standing system architect",
	}];

	constructor(...args){ Object.assign(this, ...args); this.hours ??= Number(process.env.SERVEX_RESPAWN_HOURS) || 24; this.root ??= process.cwd(); }

	// The task folder's log: session.jsonl for a task a session opened, else task.jsonl.
	log_file(dir){
		const abs = path.resolve(this.root, dir);
		return ["session.jsonl", "task.jsonl"].map(f => path.join(abs, f)).find(f => fs.existsSync(f)) ?? path.join(abs, "session.jsonl");
	}

	get agents(){ return this.servex?.agents; }

	async tick(now = Date.now()){
		const out = [];
		for (const def of this.constructor.AGENTS) try { const r = this.check(def, now); if (r) out.push(r); } catch (e){ this.servex?.say?.(`respawn: ${def.id}: ${e.message || e}`); }
		return out;
	}

	// Why not now, or null when it may be replaced.
	held(def, now){
		const live = this.agents.live.get(def.id), row = this.agents.reg().read()[def.id];
		if (!live && !row) return "never spawned";   // spawning the first one is a mastermind's call (mastermind role readme)
		const state = live?.state ?? row.state;
		if (state === "stopped" || row?.stopped_by) return "stopped on purpose";
		if (state === "working" || state === "starting") return "working";
		if (live?.queue?.items?.length) return "messages queued";
		if ([...this.agents.live.values()].some(a => a.parent === def.id && a.state === "working")) return "a child is working";
		const born = Date.parse(live?.started_at ?? row?.started_at ?? "") || now;
		if (now - born < this.hours * 3600e3) return "younger than a day";
		return null;
	}

	check(def, now){
		if (this.held(def, now)) return null;
		const old = this.agents.live.get(def.id) ?? this.agents.reg().read()[def.id];
		const before = old?.session_id ?? null;
		try { this.agents.stop(def.id, { by: "respawn" }); } catch {}
		// stop() marks the row stopped_by; a fresh spawn under the same id writes a new row over it.
		const url = "/" + def.task.replace(/^public\//, "") + "/";
		const agent = this.agents.spawn({
			id: def.id, role: def.role, model: def.model, effort: def.effort, permission_mode: "bypassPermissions",
			task: { dir: def.task, title: def.title },
			prompt: `You are the fresh daily session of ${def.id}, replacing session ${before ?? "(unknown)"} so your context starts small. ` +
				`Your role is in Servex/agents/roles/mastermind.md, "A standing system architect". Your record is the task log at ${url}: ` +
				`read its open child tasks with item({path: "${url}"}) and its last log lines, then the maps (public/framework/ai/doc/readme.md, "Maps"). ` +
				`Do not redo finished work; answer requests as they arrive.`,
		});
		const tl = this.servex?.task_loop;
		if (tl?.write_line) tl.write_line(this.log_file(def.task), { log: { respawn: { agent: def.id, session: agent.session_id ?? null, replaces: before, at: stamp() } } });
		this.servex?.say?.(`respawn: ${def.id} is a fresh session (replaces ${before})`, { event: "respawn" });
		return { id: def.id, session: agent.session_id ?? null, replaces: before };
	}
}
