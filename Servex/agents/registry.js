import fs from "fs";
import { place } from "../home.js";

/* Where every agent Servex has ever registered lives, for anything OUTSIDE this
 * process to read: `GET /agents`, the `list_agents` tool, and `say.mjs state`'s
 * `MASTERMINDS` block all read this one file — none of them can see the `live`
 * Map, which resets every time Servex restarts. One JSON object keyed by id,
 * whole-file rewrite: Servex is the only writer and the file stays small. */
export default class Registry {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	file(){ return place("registry.json"); }

	read(){
		try { return JSON.parse(fs.readFileSync(this.file(), "utf8")); }
		catch { return {}; }
	}

	/* The nine fields the brief names, straight off the live Agent — a new field
	 * an agent starts carrying (`topics`, `page`, `parent`) needs no change here,
	 * only a wider destructure, since spawn_agent's caller sets them the same way
	 * it sets `role` or `name`. */
	row(agent){
		const { id, role, name, topics, page, state, visibility, session_id, started_at, parent } = agent;
		return { id, role, name: name ?? null, topics: topics ?? null, page: page ?? null,
			state, visibility, session_id, started_at, parent: parent ?? null };
	}

	write(agent){
		const rows = this.read();
		rows[agent.id] = this.row(agent);
		fs.writeFileSync(this.file(), JSON.stringify(rows, null, 2));
		return rows[agent.id];
	}

	list(){ return Object.values(this.read()); }
}
