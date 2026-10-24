/* One session and its nested tasks, read from two precomputed files: ai/index.json (every task: dir, title, state, times)
   and the day's sessions/YYYY/MM/DD/index.json (the session's cost, model, duration). Nothing is stored; completion is
   computed. A prototype for doc/views-plan.md. */
export default class SessionTree {

	static INDEX = "/framework/ai/index.json";
	static day_file = day => `/framework/ai/sessions/${day}/index.json`;

	constructor(o){ Object.assign(this, o); }

	// Both files load once per page, shared by every SessionTree.
	static async files(day){
		this.cache ??= {};
		this.cache.index ??= fetch(this.INDEX).then(r => r.ok ? r.json() : { tasks: [] }).catch(() => ({ tasks: [] }));   // a generated index (gitignored): a worktree has none, and an empty answer threw
		this.cache[day] ??= fetch(this.day_file(day)).then(r => r.ok ? r.json() : { snapshots: [] }).catch(() => ({ snapshots: [] }));
		return Promise.all([this.cache.index, this.cache[day]]);
	}

	// `day` is "2026/10/20", `folder` the session folder name.
	static async load(day, folder){
		const [index, dayix] = await this.files(day);
		const base = `public/framework/ai/sessions/${day}/${folder}`;
		const rows = index.tasks.filter(t => t.dir === base || t.dir.startsWith(base + "/"));
		const snap = dayix.snapshots.find(s => s.folder === folder) ?? null;
		const own = rows.find(r => r.dir === base);
		const root = new SessionTree.Node({ rel: "", title: snap?.title ?? own?.title ?? folder, state: own?.state ?? snap?.state ?? "unknown", url: `/framework/ai/sessions/${day}/${folder}/`, started: snap?.first_at ?? own?.started, ended: snap?.last_activity ?? own?.last, session: true });
		const nodes = new Map([["", root]]);
		rows.filter(r => r !== own).sort((a, b) => a.dir.length - b.dir.length || String(a.started).localeCompare(String(b.started))).forEach(r => {
			const rel = r.dir.slice(base.length + 1);
			const kid = r.session && r.session !== snap?.id ? dayix.snapshots.find(x => x.id === r.session) : null;   // the agent session that did this task
			const node = new SessionTree.Node({ rel, title: r.title, state: r.state, url: r.url, started: r.started, ended: r.landed_at ?? r.last, landed: !!r.landed_at, line: r.line, agent: r.agent, session: r.session ?? null, snap: kid, usd: kid?.usd ?? null, model: kid?.model ?? null });
			let up = rel; do { up = up.includes("/") ? up.slice(0, up.lastIndexOf("/")) : ""; } while (!nodes.has(up));   // the nearest folder above that is itself a task
			nodes.get(up).kids.push(node); node.parent = nodes.get(up);
			nodes.set(rel, node);
		});
		return new SessionTree({ day, folder, root, snap, nodes });
	}

	// The essentials row: duration, total cost (children included), model. A record-only session has no snapshot yet.
	facts(){
		const s = this.snap;
		if (!s) return [["cost", "no row in the day index yet"], ["duration", SessionTree.dur(this.root.ms())]];
		const kids = this.root.all().filter(n => n.usd != null), usd = (s.usd ?? 0) + kids.reduce((t, n) => t + n.usd, 0);
		return [["duration", SessionTree.dur(s.wall_ms)], ["cost", "$" + usd.toFixed(2) + (kids.length ? ` (${kids.length} agent sessions included)` : "")], ["model", s.model ?? "—"]];
	}

	// The summary bullets: computed from the record (each top-level task landed), never typed.
	bullets(){ let n = this.root; while (n.kids.length === 1) n = n.kids[0]; return n.kids.map(k => k.title); }   // skip a lone wrapping project

	static dur(ms){
		if (!ms || ms < 0) return "—";
		const m = Math.round(ms / 60000);
		return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + (m % 60) + " min";
	}
}

// One task (or the session itself). A project is any node with children.
SessionTree.Node = class Node {
	constructor(o){ Object.assign(this, { kids: [] }, o); }
	get done(){ return this.state === "complete"; }
	get project(){ return this.kids.length > 0; }
	// 0..1: a leaf is 0 or 1; a parent is the mean of its children (Project.completed's rule).
	get completion(){ return this.kids.length ? this.kids.reduce((s, k) => s + k.completion, 0) / this.kids.length : (this.done ? 1 : 0); }
	ms(){ const a = Date.parse(this.started), b = Date.parse(this.ended); return a && b ? b - a : 0; }
	all(){ return [this, ...this.kids.flatMap(k => k.all())]; }
	depth(){ return this.parent ? this.parent.depth() + 1 : 0; }
};
