import fs from "fs";
import path from "path";
import { place, stamp } from "../home.js";

/* Where every agent Servex has ever registered lives, for anything OUTSIDE this
 * process to read: `GET /agents`, the `list_agents` tool, and `say.mjs state`'s
 * `MASTERMINDS` block all read this one file — none of them can see the `live`
 * Map, which resets every time Servex restarts. One JSON object keyed by id,
 * whole-file rewrite: Servex is the only writer and the file stays small.
 *
 * `dir` moves the file (and `boot.json` beside it) somewhere else — the two
 * proof scripts use a scratch dir so a test never touches the real registry. */
export default class Registry {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	file(name = "registry.json"){
		if (!this.dir) return place(name);
		fs.mkdirSync(this.dir, { recursive: true });
		return path.join(this.dir, name);
	}

	read(){
		try { return JSON.parse(fs.readFileSync(this.file(), "utf8")); }
		catch { return {}; }
	}

	save(rows){ fs.writeFileSync(this.file(), JSON.stringify(rows, null, 2)); }

	/* Straight off the live Agent — a new field an agent starts carrying needs
	 * only a wider destructure here. Three groups:
	 *   who it is      — id, role, name, topics, page, parent, visibility
	 *   where it is    — state, session_id, last_at, and `boot` + `pid`: WHICH
	 *                    host process holds it, so a row whose host has died
	 *                    can be told apart from a live one (`sweep()`)
	 *   how to revive  — model, effort, cwd, permission_mode, allowed_tools,
	 *                    setting_sources, revivable: everything `Agents.revive()`
	 *                    needs to reopen the same session after a restart
	 * plus `forked_from` / `resumed_from` when the spawn continued another
	 * session, and `context`: the tokens it holds now (Agent.result()). */
	row(agent){
		const { id, role, name, topics, page, state, visibility, session_id, started_at, parent,
			model, effort, cwd, permission_mode, allowed_tools, setting_sources,
			forked_from, resumed_from, ended, context } = agent;
		return { id, role, name: name ?? null, topics: topics ?? null, page: page ?? null,
			state, visibility, session_id, started_at, parent: parent ?? null,
			last_at: stamp(), boot: agent.host?.boot ?? null, pid: process.pid,
			revivable: agent.revivable?.() ?? false,
			model: model ?? null, effort: effort ?? null, cwd: cwd ?? null,
			permission_mode: permission_mode ?? null, allowed_tools: allowed_tools ?? null,
			setting_sources: setting_sources ?? null,
			forked_from: forked_from ?? null, resumed_from: resumed_from ?? null,
			ended: ended ?? null, context: context ?? null };
	}

	write(agent){
		const rows = this.read();
		rows[agent.id] = this.row(agent);
		this.save(rows);
		return rows[agent.id];
	}

	/* Mark rows dead without touching anything else in them. */
	bury(ids, ended){
		if (!ids.length) return [];
		const rows = this.read();
		for (const id of ids) if (rows[id]) rows[id] = { ...rows[id], state: "gone", ended };
		this.save(rows);
		return ids;
	}

	/* A row is DEAD when the process that held it is gone: its `pid` no longer
	 * exists, or it is this very process but the agent is not in `live`. Both
	 * are certain, so they are written back. A row with no `pid` (written
	 * before 2026-09-24) is left alone here — only `Agents.revive()` at Servex
	 * boot may judge those, because only Servex wrote them.
	 * `stopped` and `gone` are final and never re-judged. */
	sweep(live, boot){
		const rows = this.read();
		const dead = Object.values(rows).filter(row =>
			!["stopped", "gone"].includes(row.state) && row.pid
			&& (row.pid === process.pid ? row.boot === boot && !live.has(row.id) : !alive(row.pid)));
		return this.bury(dead.map(row => row.id), "host process exited");
	}

	list(){ return Object.values(this.read()); }

	/* `boot.json` — the id of the Servex process that last booted on this
	 * registry. `revive()` reads the PREVIOUS one before writing its own, which
	 * is how it knows which rows were alive a moment ago. */
	last_boot(){
		try { return JSON.parse(fs.readFileSync(this.file("boot.json"), "utf8")); }
		catch { return null; }
	}

	mark_boot(boot){
		fs.writeFileSync(this.file("boot.json"), JSON.stringify({ boot, pid: process.pid, at: stamp() }, null, 2));
	}
}

function alive(pid){
	try { process.kill(pid, 0); return true; }
	catch (e){ return e.code === "EPERM"; }
}
