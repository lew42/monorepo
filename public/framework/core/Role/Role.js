/* Role: one row of Servex/agents/roles.js as an object. Plain JS, no node or DOM imports, so Servex and the pages use the same class.
 * The rows stay in roles.js (the one source); roles.json is generated from them by `node Servex/agents/roles-json.mjs`. */
export default class Role {
	constructor(name, row = {}){
		this.name = name;
		Object.assign(this, row);
		this.skills = row.skills ?? (row.skill ? [row.skill] : []);
		delete this.skill;
	}

	/** Every word that names this role: its key and its aliases. */
	get words(){ return [this.name, ...[].concat(this.alias ?? [])]; }
	get is_retired(){ return !!this.retired; }
	/** The agents (registry rows) now in this role. */
	instances(agents){ return (agents ?? []).filter(a => this.words.includes(a.role)); }

	static from_rows(rows){ return Object.entries(rows).map(([name, row]) => new Role(name, row)); }
	static from_json(list){ return list.map(({ name, ...row }) => new Role(name, row)); }
	static find(list, word){ return list.find(r => r.words.includes(word)); }
	/** An older session has no recorded role: guess it from the agent id (`<prefix>-<name>`), longest prefix first. */
	static from_agent_id(list, id){
		return [...list].sort((a, b) => b.prefix.length - a.prefix.length || !!a.retired - !!b.retired).find(r => id === r.prefix || id?.startsWith(r.prefix + "-"));
	}
	toJSON(){ return { ...this }; }

	/** All roles, from the generated roles.json beside this file. */
	static async load(){
		const res = await fetch(new URL("roles.json", import.meta.url));
		return res.ok ? Role.from_json(await res.json()) : [];
	}
	/** Servex's live agent list (Servex's port first, then the page's own host). */
	static async agents(base = "http://127.0.0.1:8090"){
		for (const url of [base + "/api/agents", "/api/agents"]) {
			try { const res = await fetch(url); if (res.ok) { const j = await res.json(); if (Array.isArray(j)) return j; } } catch {}
		}
		return [];
	}
}
