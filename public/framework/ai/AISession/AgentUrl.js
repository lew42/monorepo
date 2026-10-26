/**
 * AgentUrl — a Servex agent's name (`mastermind-tasks-completion`) to the url of its real page, the task folder in the dated store.
 * One lookup for every surface that links an agent by name (ext/Mention, the /sessions/<name>/ redirect).
 * It reads ai/index.json (Server/AIIndex.mjs, the same file the Inbox reads) once per page load:
 *   1. a task whose folder is named for the agent, 2. the agent's own `task_dir`, 3. the shallowest task the agent ran (`agent`).
 * A name with none of these (a proof agent that never opened a folder) has no page: `of()` and `find()` answer null.
 */
export default class AgentUrl {
	static URL = "/framework/ai/index.json";
	static urls = null;     // Map name -> url, once loaded
	static pending = null;

	/** Resolves once the lookup is built (also when the file is missing: the map is then empty and every name is "no page"). */
	static load(){
		return AgentUrl.pending ??= fetch(AgentUrl.URL).then(r => r.ok && !(r.headers.get("content-type") ?? "").includes("html") ? r.json() : null).catch(() => null)
			.then(index => AgentUrl.urls = AgentUrl.build(index));
	}

	static build(index){
		const urls = new Map(), depth = u => u.split("/").length, last = u => u.replace(/\/$/, "").split("/").pop();
		const agents = new Map((index?.agents ?? []).map(a => [a.id, a]));
		const ran = new Map();   // agent -> its shallowest task url
		for (const t of index?.tasks ?? []){
			if (!t.url) continue;
			const own = agents.has(last(t.url)) ? last(t.url) : null;
			if (own && !urls.has(own)) urls.set(own, t.url);
			if (t.agent && agents.has(t.agent) && (!ran.has(t.agent) || depth(t.url) < depth(ran.get(t.agent)))) ran.set(t.agent, t.url);
		}
		for (const [name, a] of agents){
			if (urls.has(name)) continue;
			const dir = a.task_dir && AgentUrl.site_path(a.task_dir);
			if (dir) urls.set(name, dir);
			else if (ran.has(name)) urls.set(name, ran.get(name));
		}
		return urls;
	}

	/** `C:\...\monorepo\public\framework\ai\sessions\...` to `/framework/ai/sessions/.../`, or null when it is not under public/. */
	static site_path(dir){
		const m = /[\\/]public[\\/](.+)$/.exec(String(dir));
		return m ? "/" + m[1].replace(/\\/g, "/").replace(/\/?$/, "/") : null;
	}

	/** The url if the lookup has loaded and knows the name, else null (it does not fetch). */
	static of(name){ return AgentUrl.urls?.get(name) ?? null; }

	/** The url once the lookup has loaded, else null. */
	static async find(name){ return (await AgentUrl.load()).get(name) ?? null; }
}
