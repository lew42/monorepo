import AISessionBuckets from "../AISession/AISessionBuckets.js";

/** SessionTree — one day's session snapshots (sessions/YYYY/MM/DD/index.json) as a tree: who spawned whom, each node's own cost and the cost rolled up through its children.
 *  Plain code, no DOM. The join and the roll-up live here for slice 1; the plan moves them into AISessionIndex (doc/ai-dashboard-plan.md, fixes 1 to 4). */
export default class SessionTree {
	static ORIGINS = {
		cloud:   { icon: "☁", label: "Voice",            hint: "The Claude app, by voice, through the Servex MCP" },
		code:    { icon: "⌨", label: "VS Code",          hint: "A VS Code sidebar or remote-control tab, phone or PC" },
		servex:  { icon: "⚙", label: "Servex",           hint: "Agents Servex spawned for a task" },
		routine: { icon: "·", label: "Scheduled",        hint: "Clarity, cleaners, reviewers, quick fixes: cheap and plentiful" },
	};
	static LIVE_MS = 10 * 60000;

	/** Where a root session came from. A child takes its root's origin. */
	static origin(s){
		if (s.parent === "voice-app" || /^cloud-voice/.test(s.folder ?? "")) return "cloud";
		const kind = AISessionBuckets.kind_of(s);
		if (kind === "owner-tab") return "code";
		return AISessionBuckets.KINDS.find(k => k.key === kind)?.routine ? "routine" : "servex";
	}

	nodes = new Map();   // id -> { s, kids, own, rolled, origin, depth }
	roots = [];
	by_agent = new Map();

	constructor(snaps, now = Date.now()){
		this.now = now;
		snaps.forEach(s => this.nodes.set(s.id, { s, kids: [], own: s.usd ?? 0, rolled: s.usd ?? 0, origin: null, depth: 0 }));
		snaps.forEach(s => { if (s.agent) this.by_agent.set(s.agent, this.nodes.get(s.id)); });   // a session's `parent` is an agent name, not a session id
		this.nodes.forEach(n => {
			const up = this.parent_of(n);
			if (up) up.kids.push(n); else this.roots.push(n);
		});
		this.roots.forEach(r => this.settle(r, SessionTree.origin(r.s), 0));
		this.sort(this.roots);
	}

	/** The parent node, or null when it is a root. A parent that is not a session (voice-app) or a loop makes a root. */
	parent_of(n){
		const name = n.s.parent;
		const up = name && this.by_agent.get(name);
		if (!up || up === n) return null;
		for (let x = up; x; x = x.up) if (x === n) return null;   // never a cycle
		n.up = up;
		return up;
	}

	settle(n, origin, depth){
		n.origin = origin; n.depth = depth;
		n.rolled = n.own + n.kids.reduce((sum, k) => sum + this.settle(k, origin, depth + 1), 0);
		n.count = 1 + n.kids.reduce((sum, k) => sum + k.count, 0);
		n.last = Math.max(Date.parse(n.s.last_activity ?? "") || 0, ...n.kids.map(k => k.last));
		n.live = n.s.state === "active" || this.now - n.last < SessionTree.LIVE_MS;
		return n.rolled;
	}
	sort(list){ list.sort((a, b) => b.last - a.last); list.forEach(n => this.sort(n.kids)); }

	/** Servex agents with no parent that look spawned: a minion or reviewer nobody owns. The plan's "unattached". */
	unattached(){ return this.roots.filter(r => r.origin === "servex" && /^(minion|reviewer|checker|voter)/.test(r.s.agent ?? "")); }

	/** Per-origin totals over the roots: { cloud: { n, usd, live }, ... }. */
	totals(){
		const t = Object.fromEntries(Object.keys(SessionTree.ORIGINS).map(k => [k, { roots: 0, n: 0, usd: 0, live: 0 }]));
		this.roots.forEach(r => { const o = t[r.origin]; o.roots++; o.n += r.count; o.usd += r.rolled; if (r.live) o.live++; });
		return t;
	}
}
