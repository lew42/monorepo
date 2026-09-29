/* NESTED TASKS — a day's task logs as a tree: which task is whose subtask,
   which subtasks ran side by side (parallel) and which waited for others
   (series), what is in flight, and how far along everything is (%).

   Pure functions, no DOM. The only input is what the task logs already say:

     manifest = { dir, title?, agent?, tab?, parent_task?, after?,
                  requested_at?, landed_at?, step?, steps?, inbox?: [rows] }

   `fold(dir, entries)` turns one task.jsonl's parsed lines into a manifest.
   `build(manifests)` returns the roots. `tree_for_day(date)` does both from
   the site. Each node:

     { dir, title, agent, children, after, state, pct, phases }

   Where the parent comes from, strongest first:
     1. `parent_task` on line 1 (written by Servex's spawn_agent from 09-29).
     2. The folder: a task dir inside another task dir is its subtask.
     3. The inbox: a dir whose line-1 `agent` or `tab` sent a row to another
        dir's inbox.jsonl is that dir's child.
   An inbox sender with no dir of its own becomes a leaf under that dir.
   The view on top of this module is built separately (nested-tasks/minion-view). */

/* "public/framework/ai/2026-09-29/x/y/" or "/framework/ai/…" → "2026-09-29/x/y". */
export const norm = dir => {
	const s = String(dir ?? "").replaceAll("\\", "/").replace(/\/+$/, "");
	const at = s.search(/(^|\/)ai\/\d{4}-\d{2}-\d{2}(\/|$)/);
	return at < 0 ? s.replace(/^\/+/, "") : s.slice(at).replace(/^\/?ai\//, "");
};

const time = t => t ? Date.parse(t) : NaN;

/** One task.jsonl's parsed lines → a manifest. Line 1's facts (agent, tab,
    parent_task, after) belong to the task's owner, so later assigns (a second
    agent sharing the log) never overwrite them. */
export function fold(dir, entries, inbox = []){
	const m = { dir: norm(dir), inbox };
	let first = true;
	for (const e of entries) if (e?.assign){
		const a = e.assign;
		if (first) for (const k of ["agent", "tab", "parent_task", "after", "title", "request", "card"]) if (a[k] != null) m[k] = a[k];
		if (a.requested_at != null) m.requested_at ??= a.requested_at;   // the first start, not a later re-assign
		for (const k of ["landed_at", "step", "steps", "title"]) if (a[k] != null) m[k] = a[k];
		first = false;
	}
	return m;
}

/* A leaf's %: step-1 of steps; landed is 100; no outline reads 0 running / 100 landed. */
const leaf_pct = n => n.state === "landed" ? 100
	: n.steps?.length ? Math.round(100 * (Math.max(1, Math.min(n.step ?? 1, n.steps.length)) - 1) / n.steps.length)
	: 0;

/* A task's title, best first: its own `title`, its brief's first heading
   (`brief_title`, read by tree_for_day), the first sentence of line 1's
   `request`, its card's slug, and only then its folder's slug. */
const short = s => { s = String(s).split(/(?<=[.!?])\s|\n/)[0].trim(); return s.length > 80 ? s.slice(0, 79).trimEnd() + "…" : s; };
export const title_of = m => m.title ?? m.brief_title ?? (m.request ? short(m.request) : null)
	?? (m.card ? String(m.card).replace(/\/+$/, "").split("/").at(-1) : null) ?? norm(m.dir).split("/").at(-1);

/** Every manifest → the roots of the tree. */
export function build(manifests){
	const nodes = new Map();
	for (const m of manifests) nodes.set(norm(m.dir), {
		dir: norm(m.dir), title: title_of(m), agent: m.agent ?? m.tab ?? null,
		names: [m.agent, m.tab].filter(Boolean), parent_task: m.parent_task && norm(m.parent_task),
		after: [].concat(m.after ?? []).map(norm), inbox: m.inbox ?? [],
		start: m.requested_at ?? null, end: m.landed_at ?? null, landed: !!m.landed_at,
		step: m.step, steps: m.steps, children: [] });

	const by_name = new Map();
	for (const n of nodes.values()) for (const name of n.names) by_name.set(name, n);

	// the parent of each dir node
	const parent_of = new Map();
	for (const n of nodes.values()){
		let p = n.parent_task && nodes.get(n.parent_task);
		if (!p){ const up = n.dir.split("/"); while (!p && up.length > 1){ up.pop(); p = nodes.get(up.join("/")); } }
		if (p && p !== n) parent_of.set(n, p);
	}
	// inbox rows: an unparented sender with a dir becomes a child; one without becomes a leaf
	for (const n of nodes.values()){
		const leaves = new Map();
		for (const row of n.inbox){
			const who = row?.from; if (!who) continue;
			const own = by_name.get(who);
			if (own && own !== n){
				if (!parent_of.has(own)) parent_of.set(own, n);
				// a minion that reported "done" but never landed its own log still counts as done
				if (row.kind === "done" && !own.landed && parent_of.get(own) === n){ own.reported = row.at; }
				continue;
			}
			if (own) continue;
			const leaf = leaves.get(who) ?? { dir: `${n.dir}/@${who}`, title: who, agent: who, names: [who], after: [],
				inbox: [], start: null, end: null, children: [], rows: [] };
			leaf.rows.push(row);
			leaves.set(who, leaf);
		}
		for (const leaf of leaves.values()){
			const last = leaf.rows.at(-1);
			leaf.landed = last.kind === "done";
			leaf.stopped = last.kind === "stopped" || last.kind === "error";   // gone, but never landed
			leaf.end = leaf.landed ? last.at : null;
			// a leaf's start is unknown (null), so time-based phasing never opens a new phase for it
			delete leaf.rows;
			parent_of.set(leaf, n);
		}
	}
	for (const [child, p] of parent_of) p.children.push(child);
	for (const n of nodes.values()) if (n.reported && !n.landed && !n.children.length){ n.landed = true; n.end = n.reported; }

	const roots = [...nodes.values()].filter(n => !parent_of.has(n));
	for (const r of roots) settle(r, parent_of);
	return roots.sort((a, b) => (time(a.start) || 0) - (time(b.start) || 0));
}

/* Bottom up: state, %, phases; then drop the working fields. */
function settle(n, parent_of){
	for (const c of n.children) settle(c, parent_of);
	const siblings = parent_of?.get(n)?.children ?? [];
	// `after` is task dirs, normalized like `dir`, and matched exactly — a slug is not accepted.
	const done = dir => siblings.find(s => s.dir === dir)?.state === "landed";
	n.state = n.landed ? "landed" : n.stopped ? "stopped" : n.after.length && !n.after.every(done) ? "waiting" : "running";
	if (n.landed || !n.children.length) n.pct = leaf_pct(n);
	else {
		const w = c => c.steps?.length || 1;
		const total = n.children.reduce((s, c) => s + w(c), 0);
		n.pct = Math.round(n.children.reduce((s, c) => s + c.pct * w(c), 0) / total);
	}
	n.phases = phases(n.children);
	n.children = n.phases.flat();
	for (const k of ["names", "parent_task", "inbox", "landed", "reported", "stopped"]) delete n[k];
	return n;
}

/** Group siblings into series phases; everything inside one phase ran in parallel.
    With `after` edges: a topological layering. Without: by time — a sibling that
    started after every member of the current phase landed opens the next phase. */
export function phases(kids){
	if (!kids.length) return [];
	if (kids.some(k => k.after?.length)){
		const layer = new Map();
		const find = dir => kids.find(k => k.dir === dir);
		const depth = (k, seen = new Set()) => {
			if (layer.has(k)) return layer.get(k);
			if (seen.has(k)) return 0;       // a cycle: read it as parallel rather than loop forever
			seen.add(k);
			const d = Math.max(-1, ...k.after.map(find).filter(Boolean).map(x => depth(x, seen))) + 1;
			layer.set(k, d);
			return d;
		};
		const out = [];
		for (const k of kids) (out[depth(k)] ??= []).push(k);
		return out.filter(Boolean);
	}
	const sorted = [...kids].sort((a, b) => (time(a.start) || time(a.end) || 0) - (time(b.start) || time(b.end) || 0));
	const out = [[sorted[0]]];
	for (const k of sorted.slice(1)){
		const cur = out.at(-1);
		const all_done = cur.every(c => c.state === "landed" && c.end);
		const last_end = Math.max(...cur.map(c => time(c.end)));
		const start = time(k.start);
		all_done && start >= last_end ? out.push([k]) : cur.push(k);
	}
	return out;
}

/** An indented outline, for a terminal or a test. */
export function outline(roots, depth = 0){
	const lines = [];
	for (const n of roots){
		const serial = n.phases.length > 1 ? ` · ${n.phases.length} phases: ${n.phases.map(p => p.length).join(" → ")}` : "";
		lines.push(`${"  ".repeat(depth)}${n.title}  [${n.state} ${n.pct}%]${serial}`);
		lines.push(...outline(n.children, depth + 1));
	}
	return lines;
}

/* ---- from the site ----
   The same source dashboard.js enumerates from (the dev server's
   /framework/directory.json), walked to any depth, since a subtask lives in a
   folder inside its parent's. ⚠ The SPA fallback answers a miss with
   index.html — content-type is the 404. */
const text = url => fetch(url)
	.then(r => r.ok && !r.headers.get("content-type")?.includes("html") ? r.text() : null)
	.catch(() => null);
const lines = t => (t ?? "").split("\n").filter(s => s.trim()).flatMap(s => { try { return [JSON.parse(s)]; } catch { return []; } });

/** The roots of one day's tree, fetched from the site. */
export async function tree_for_day(date){
	const dir = JSON.parse(await text("/framework/directory.json") ?? "null");
	const day = dir?.files?.find(f => f.name === "ai")?.children?.find(d => d.name === date);
	const found = [];
	const walk = (node, base) => {
		for (const kid of node.children ?? []) if (kid.type === "dir"){
			const here = `${base}${kid.name}/`;
			const names = (kid.children ?? []).map(c => c.name);
			if (names.includes("task.jsonl")) found.push({ here, inbox: names.includes("inbox.jsonl") });
			walk(kid, here);
		}
	};
	if (day) walk(day, `/framework/ai/${date}/`);
	const manifests = await Promise.all(found.map(async f => fold(f.here,
		lines(await text(f.here + "task.jsonl")), f.inbox ? lines(await text(f.here + "inbox.jsonl")) : [])));
	return build(manifests);
}
