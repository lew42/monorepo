/** SessionOutline — the session page's Overview as data (DOM-free; SessionOutlineView draws it). It answers: which child sessions
 *  did this session start, what did each one do, and what is left that no child holds?
 *
 *  Input (`new SessionOutline({ session, tree, prompts, snaps, self, linked, now, mode })`; `self` is this session's id, `linked` extra child ids):
 *   - `session`: the replayed Session (what SessionTasks hands `record(session)`): `_tasks` are the record tasks, `get_one("sessions")` the
 *     `{"sessions":[{id}]}` lines (agent names of the child sessions started so far).
 *   - `tree`: the SessionTree (`root.kids`, `all()`), built from the task folders; a node with `session` was run by that agent session.
 *   - `prompts`: PromptLog.fold(...) of prompts.jsonl, `{ id -> { subject } }`.
 *   - `snaps`: the day-index snapshots of every session (AISession.all's `ix`, with `id`): name, state, model, usd, parent, links.
 *
 *  Output, `outline.groups`: `[{ kind: "child" | "own", ... , items, usd, done, total }]`; the last group is "own". See `children()` for how
 *  a child is found, `holds()` for which tasks belong to it, and `source()` for the prompt join. */
export default class SessionOutline {

	static DAY = 864e5;
	static HALF_LIFE_DAYS = 2;
	static RECENCY = 0.25;   // the recency term's weight: a free ask from an hour ago beats a free ask from last week, and a $0.20 ask never beats a fresh one

	constructor({ session = null, tree = null, prompts = {}, snaps = [], now = Date.now(), mode = "ranked", linked = [], self = null } = {}){
		Object.assign(this, { session, tree, prompts, snaps, now, mode, linked, self });
		this.refs = new Set(this.record_tasks().map(t => SessionOutline.path_of(t)).filter(Boolean));   // folders a record task points at
		this.by_url = new Map((this.tree?.root?.all?.() ?? []).slice(1).map(n => [SessionOutline.slash(n.url), n]));
		this.used = new Set();   // nodes whose folder kids a record task already drew: two tasks on one folder draw its kids once
		this.found = this.children();
		this.build();
	}

	// ---- the record -------------------------------------------------------------------------------------------------------------

	/** Every record task at any depth, subtasks included. */
	record_tasks(list = [...(this.session?._tasks ?? [])]){ return list.flatMap(t => [t, ...this.record_tasks([...(t._tasks ?? [])])]); }

	static path_of(t){ const p = t?.get_one?.("path"); return typeof p === "string" && p.startsWith("/") ? (p.endsWith("/") ? p : p + "/") : null; }

	/** THE PROMPT JOIN, in one place. Today a record task names its prompt in `source`: the string "prompt:<id>" (what the prompt-tasks
	 *  writer files), or an object `{ prompt }`. When the record gets Prompt entries with their asks nested under them (plan:
	 *  ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-entries/plan.md), return those instead: this method is the
	 *  only place that changes. Returns a Map: top-level record task id -> prompt id, only for tasks that have one. */
	static source(session){
		const out = new Map();
		for (const t of session?._tasks ?? []){
			const s = t.get_one?.("source"), id = typeof s === "string" ? /^prompt:(.+)$/.exec(s)?.[1] : s?.prompt;
			if (id) out.set(t.id, id);
		}
		return out;
	}

	// ---- the child sessions -----------------------------------------------------------------------------------------------------

	static session_nodes(tree){ return (tree?.root?.all?.() ?? []).slice(1).filter(n => typeof n.session === "string"); }

	/** The snapshot for an id or an agent name (a name can repeat across days: the latest activity wins). */
	snap_of(key){
		const hits = this.snaps.filter(s => s.id === key || s.agent === key);
		return hits.sort((a, b) => Date.parse(b.last_activity ?? 0) - Date.parse(a.last_activity ?? 0))[0] ?? null;
	}

	/** THE UNION of four sources, de-duplicated by session id (by name while no id is known). Returns `{ list, counts }`; the counts are
	 *  logged. 1: the `sessions` lines of the record. 2: tree nodes that carry `session`. 3: `links.children` of this session's snapshot
	 *  (plus `linked`, ids a caller read from the item tool's summary). 4: snapshots whose `parent` is this session's agent name; skipped for
	 *  a VS Code tab, because every tab shares the name "vscode-mastermind" and that would adopt another tab's children. */
	children(){
		const found = new Map(), counts = { lines: 0, nodes: 0, links: 0, parent: 0 };
		const add = (key, from, extra = {}) => {
			if (!key) return;
			const snap = this.snap_of(key), id = snap?.id ?? (/^[0-9a-f]{8}-/.test(key) ? key : null), k = id ?? key;
			const c = found.get(k) ?? { key: k, id, name: snap?.agent ?? (id ? null : key), snap, node: null, from: new Set() };
			if (!c.from.has(from)) counts[from]++;
			c.from.add(from);
			if (extra.node && !c.node) c.node = extra.node;
			found.set(k, c);
		};
		for (const s of this.session?.get_one?.("sessions") ?? []) add(typeof s === "string" ? s : s?.id, "lines");
		for (const n of SessionOutline.session_nodes(this.tree)) add(n.session, "nodes", { node: n });
		const own = this.snap_of(this.self ?? this.tree?.snap?.id ?? null) ?? this.tree?.snap ?? null;
		for (const id of [...(own?.links?.children ?? []), ...this.linked]) add(id, "links");
		if (own?.agent && !/^vscode/.test(own.agent)) for (const s of this.snaps) if (s.parent === own.agent) add(s.id, "parent");
		const list = [...found.values()];
		for (const c of list){   // a child found by name or id also owns the nodes that name it
			c.node ??= SessionOutline.session_nodes(this.tree).find(n => n.session === c.id || n.session === c.name || n.agent === c.name) ?? null;
			c.folder = c.node ? SessionOutline.slash(c.node.url) : null;
		}
		return { list, counts: { ...counts, union: list.length } };
	}

	static slash(u){ return typeof u === "string" ? (u.endsWith("/") ? u : u + "/") : null; }

	/** Which child holds this folder url: the TOP-most child whose folder is a prefix of it (a grandchild's work is its parent child's). */
	holds(url){
		const u = SessionOutline.slash(url);
		if (!u) return null;
		return this.found.list.filter(c => c.folder && u.startsWith(c.folder)).sort((a, b) => a.folder.length - b.folder.length)[0]
			?? this.found.list.find(c => c.name && u.split("/").includes(c.name)) ?? null;   // a child with no node yet: a folder named for it
	}

	// ---- the items --------------------------------------------------------------------------------------------------------------

	static time(x){ return Date.parse(x?.started ?? x?.created_at ?? x?._created_at ?? x?._at ?? x?.ended ?? "") || 0; }

	/** A record task as an item: its subtasks, the folder node it points at, and the unreferenced folder nodes under that node. */
	record_item(t){
		const url = SessionOutline.path_of(t), node = url ? this.by_url.get(url) ?? null : null;
		const kids = [...(t._tasks ?? [])].map(k => this.record_item(k));
		if (node && !this.used.has(node)){ this.used.add(node); kids.push(...node.kids.map(k => this.node_item(k)).filter(Boolean)); }
		return this.item({ kind: "record", id: t.id, title: t.get_one("title") ?? t.id, state: t.state, task: t, node, at: SessionOutline.time(t), kids });
	}

	/** An unreferenced, non-session folder node as an item; null for one a record task points at or a child heads (drawn elsewhere). */
	node_item(n){
		if (this.refs.has(SessionOutline.slash(n.url)) || typeof n.session === "string") return null;
		return this.item({ kind: "folder", id: n.rel, title: n.title ?? n.rel, state: n.state, node: n, at: SessionOutline.time(n), kids: n.kids.map(k => this.node_item(k)).filter(Boolean) });
	}

	item(o){
		o.usd = Math.max(o.node?.usd ?? 0, 0) + o.kids.reduce((s, k) => s + k.usd, 0);   // weight for ranking only: never printed (the view asks AICost)
		o.at = Math.max(o.at, ...o.kids.map(k => k.at));
		o.child = o.node && typeof o.node.session === "string" ? this.found.list.find(c => c.node === o.node || c.id === o.node.session || c.name === o.node.session) ?? null : null;
		return o;
	}

	/** Count an item and everything under it: `[done, live]`; a dropped (stopped) item is not counted, as SessionFeed.progress did. */
	static progress(items){
		let done = 0, total = 0;
		const walk = i => { if (i.state === "stopped") return; total++; if (i.state === "complete") done++; i.kids.forEach(walk); };
		items.forEach(walk);
		return { done, total };
	}
	static count(items){ return items.reduce((n, i) => n + 1 + SessionOutline.count(i.kids), 0); }

	// ---- the groups -------------------------------------------------------------------------------------------------------------

	build(){
		const by_child = new Map(this.found.list.map(c => [c, []])), prompt_of = SessionOutline.source(this.session), mine = new Map(), other = [];
		for (const t of this.session?._tasks ?? []){
			const url = SessionOutline.path_of(t), c = url ? this.holds(url) : null, it = this.record_item(t);
			if (c) by_child.get(c).push(it);
			else if (prompt_of.has(t.id)) (mine.get(prompt_of.get(t.id)) ?? mine.set(prompt_of.get(t.id), []).get(prompt_of.get(t.id))).push(it);
			else other.push(it);
		}
		// Folder nodes no record task points at, each drawn once: a node hanging from the root goes to "Other work", one hanging from a session node
		// to the child that holds it. (One under a task node is drawn by that item: record_item / node_item.)
		const lift = (parent, into) => { for (const k of parent.kids){ const it = this.node_item(k); if (it) into(it); } };
		lift(this.tree?.root ?? { kids: [] }, it => other.push(it));
		for (const s of SessionOutline.session_nodes(this.tree)){ const c = this.holds(s.url); lift(s, it => (c ? by_child.get(c) : other).push(it)); }
		const child_groups = this.found.list.map(c => this.group({ kind: "child", child: c, name: c.snap?.title ?? c.name ?? c.key, items: by_child.get(c) }));
		const subs = [...mine].map(([id, items]) => this.group({ kind: "prompt", prompt: id, name: this.prompts[id]?.subject ?? this.prompts[id]?.clean ?? "Prompt " + String(id).slice(0, 8), items }));
		if (other.length) subs.push(this.group({ kind: "other", name: "Other work", items: other }));
		const own_items = subs.flatMap(g => g.items);
		const own = { kind: "own", name: "This session's own work", groups: this.sort(subs), items: own_items, ...SessionOutline.progress(own_items), usd: own_items.reduce((s, i) => s + i.usd, 0), at: Math.max(0, ...subs.map(g => g.at)) };
		this.groups = [...this.sort(child_groups), own];
		this.drawn = SessionOutline.count(this.groups.flatMap(g => g.kind === "own" ? g.items : g.items));
	}

	group(g){
		g.items = this.sort(g.items);
		Object.assign(g, SessionOutline.progress(g.items));
		const snap = g.child?.snap;
		g.usd = g.items.reduce((s, i) => s + i.usd, 0) + (snap ? Math.max(snap.usd ?? 0, 0) : 0);
		g.at = Math.max(0, ...g.items.map(i => i.at), snap ? Date.parse(snap.last_activity ?? "") || 0 : 0);
		g.state = snap?.state ?? g.child?.node?.state ?? null;
		return g;
	}

	// ---- ranking ----------------------------------------------------------------------------------------------------------------

	/** cost × 0.5^(age days ÷ 2) plus a recency term. A $40 task from yesterday outranks a free ask from an hour ago; among free asks the
	 *  newest is first. ⚠ Prompt-filed asks cost nothing until an agent runs them, so most groups rank by recency: intended. */
	score(x){
		const age = Math.max(0, (this.now - (x.at || 0)) / SessionOutline.DAY), decay = Math.pow(0.5, age / SessionOutline.HALF_LIFE_DAYS);
		return (x.usd ?? 0) * decay + SessionOutline.RECENCY / (1 + age);
	}

	sort(list){
		const order = new Map(list.map((x, i) => [x, i]));
		return [...list].sort(this.mode === "newest" ? (a, b) => b.at - a.at || order.get(a) - order.get(b) : (a, b) => this.score(b) - this.score(a) || order.get(a) - order.get(b));
	}

	/** The same outline in another order; nothing is re-read. */
	reorder(mode){ return new SessionOutline({ session: this.session, tree: this.tree, prompts: this.prompts, snaps: this.snaps, now: this.now, linked: this.linked, self: this.self, mode }); }
}
