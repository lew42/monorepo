import { View, div, span, a, p, icon } from "../../core/View/View.js";
import { ui } from "../../ui/ui.js";

View.stylesheet(import.meta, "nested.css");

/* Nested tasks, drawn — three designs over the same tree (tree.js's nodes:
   {dir, title, agent, children, after, state, pct, phases}). doc/nested.md.

   `TaskTree` is the base: the parts every design shares (the state mark, the %,
   the bar, "waits for …", the phase grouping, the counts). Each design is a
   subclass that overrides `root()` — v1 of any of them stays reachable, because
   a new idea is one more subclass, never an edit to an old one (the owner,
   2026-09-29: "never destroy a viable version").

   The reading is the same in all three:
     landed  — a check                       (--ok)
     running — a pulsing dot and its %       (--prim)
     waiting — a hollow clock, "waits for …" (--subtle)
   Parallel = side by side (or badged "together"); series = a "then" between. */

export class TaskTree {
	static id = "tree";
	static title = "Tree";

	constructor(roots = []){ this.roots = roots; }

	// Draws into whatever is capturing. Returns the box.
	draw(){
		return div.c(`ai-tree ai-tree-${this.constructor.id}`, () => this.roots.forEach(n => this.root(n)));
	}

	root(n){ this.head(n); }

	/* ---- shared parts ---- */

	// A title, linked to the task's own page when it has a dir.
	title(n){
		const url = TaskTree.url(n);
		return url ? a.c("ai-tree-title", n.title || n.agent || "untitled").attr("href", url)
			: span.c("ai-tree-title", n.title || n.agent || "untitled");
	}

	// The state mark: check, pulsing dot, hollow clock.
	mark(n){
		const s = n.state || "running";
		if (s === "running") return span.c("ai-tree-mark is-running", () => span.c("ai-tree-dot")).attr("title", "running");
		return icon(s === "landed" ? "check_circle" : "schedule").ac(`ai-tree-mark is-${s}`).attr("title", s);
	}

	// "60%", or "waits for Read today's logs, Build the tree".
	status(n, siblings = []){
		if (n.state === "waiting"){
			const names = this.waits(n, siblings);
			return span.c("ai-tree-status is-waiting", names.length ? `waits for ${names.join(", ")}` : "waiting");
		}
		return span.c(`ai-tree-status is-${n.state}`, n.state === "landed" ? "done" : `${TaskTree.pct(n)}%`);
	}

	bar(n){
		return div.c(`ai-tree-bar is-${n.state}`, () => span().style("width", TaskTree.pct(n) + "%"));
	}

	// One line: mark, title, status.
	head(n, siblings){
		return div.c(`ai-tree-head is-${n.state}`, () => {
			this.mark(n);
			this.title(n);
			this.status(n, siblings);
		});
	}

	// The unfinished tasks this one waits for, by title.
	waits(n, siblings){
		const by = TaskTree.index(siblings);
		return (n.after || []).map(x => by(x)).filter(s => s && s.state !== "landed").map(s => s.title || s.agent);
	}

	/* A node's children as series phases — each phase a list run side by side.
	   Uses tree.js's `phases` (nodes or dirs), else layers by `after`. */
	phases(n){
		const kids = n.children || [];
		if (!kids.length) return [];
		if (Array.isArray(n.phases) && n.phases.length){
			const by = TaskTree.index(kids);
			return n.phases.map(ph => (Array.isArray(ph) ? ph : ph?.children || ph?.tasks || []).map(x => typeof x === "string" ? by(x) : x).filter(Boolean));
		}
		return TaskTree.layer(kids);
	}

	/* ---- statics: pure helpers ---- */

	static pct(n){
		if (n.state === "landed") return 100;
		let v = Number(n.pct) || 0;
		return Math.max(0, Math.min(100, Math.round(v)));
	}

	static url(n){
		let d = n.url === false ? null : n.dir;
		// An inbox sender with no log of its own (tree.js names it `<parent>/@<agent>`) has no page.
		if (!d || /(^|\/)@[^/]*\/?$/.test(d)) return null;
		d = d.replace(/\\/g, "/").replace(/^public\//, "");
		if (!d.startsWith("/")) d = (/^framework\//.test(d) ? "/" : "/framework/ai/") + d;
		return d.endsWith("/") ? d : d + "/";
	}

	// Look a sibling up by its dir, its last path part, or its agent.
	static index(list = []){
		const tail = s => String(s).replace(/\/+$/, "").split("/").pop();
		return x => list.find(s => s.dir === x || s.agent === x || (s.dir && tail(s.dir) === tail(x)));
	}

	// Topological layers over `after`, siblings only.
	static layer(kids){
		const by = TaskTree.index(kids);
		const depth = new Map();
		const at = (n, seen = new Set()) => {
			if (depth.has(n)) return depth.get(n);
			if (seen.has(n)) return 0;
			seen.add(n);
			const ups = (n.after || []).map(by).filter(Boolean);
			const v = ups.length ? 1 + Math.max(...ups.map(u => at(u, seen))) : 0;
			depth.set(n, v);
			return v;
		};
		const out = [];
		kids.forEach(k => (out[at(k)] ||= []).push(k));
		return out.filter(Boolean);
	}

	// Every node in the forest, depth first.
	static walk(roots, fn){
		roots.forEach(n => { fn(n); TaskTree.walk(n.children || [], fn); });
	}

	static counts(roots){
		const c = { running: 0, waiting: 0, landed: 0 };
		TaskTree.walk(roots, n => { c[n.state] = (c[n.state] || 0) + 1; });
		return c;
	}

	// Running first, then waiting, then landed.
	static order(roots){
		const rank = { running: 0, waiting: 1, landed: 2 };
		return [...roots].sort((x, y) => (rank[x.state] ?? 3) - (rank[y.state] ?? 3));
	}
}

/* Lanes — the phases run left to right as columns, with "then" between them; the
   tasks in one column run at the same time. A task with subtasks draws its own
   lanes inside its card, to any depth. */
export class Lanes extends TaskTree {
	static id = "lanes";
	static title = "Lanes";

	root(n){
		div.c(`ai-tree-root ${n.children?.length ? "has-kids" : ""}`, () => this.card(n, []));
	}

	card(n, siblings){
		div.c(`ai-tree-card is-${n.state}`, () => {
			this.head(n, siblings);
			if (n.state === "running") this.bar(n);   // a check says 100%, a clock says not started
			if (n.children?.length) this.lanes(n);
		});
	}

	lanes(n){
		const phases = this.phases(n);
		div.c("ai-tree-phases", () => phases.forEach((ph, i) => {
			if (i) div.c("ai-tree-then", () => { icon("arrow_forward"); span("then"); });
			div.c("ai-tree-lane", () => {
				span.c("ai-tree-label", ph.length > 1 ? `${ph.length} at once` : "one task");
				ph.forEach(c => this.card(c, n.children));
			});
		}));
	}
}

/* Outline — an indented tree of icon rows (ui/item). Each group of children is
   badged: "together" for tasks that run side by side, "then" when a group waits
   for the one above it. The % sits at the end of every row. */
export class Outline extends TaskTree {
	static id = "outline";
	static title = "Outline";

	root(n){
		div.c("ai-tree-root", () => this.row(n, []));
	}

	row(n, siblings){
		const kids = n.children?.length;
		const spec = {
			name: n.title || n.agent || "untitled",
			end: () => this.status(n, siblings),
		};
		if (kids){
			spec.open = true;
			spec.children = () => this.groups(n);
		} else {
			spec.href = TaskTree.url(n) || undefined;
		}
		const $row = ui.item(spec).ac(`ai-tree-row is-${n.state}`);
		// The state mark leads the row, in the icon's place.
		const $name = $row.el.querySelector(":scope > .item > .item-name, :scope.item > .item-name");
		if ($name) $name.before(this.mark(n).el);
		return $row;
	}

	groups(n){
		this.phases(n).forEach((ph, i) => div.c("ai-tree-group", () => {
			span.c(`ai-tree-badge ${i ? "is-then" : ""}`, (i ? "then · " : "") + (ph.length > 1 ? `${ph.length} together` : "one task"));
			ph.forEach(c => this.row(c, n.children));
		}));
	}
}

/* Flow — a node graph: the parent on the left, each phase a column, and an arrow
   for every "waits for". A task's own subtasks show as small marks inside its
   node. Plain HTML boxes on a grid, one SVG underneath for the arrows. */
export class Flow extends TaskTree {
	static id = "flow";
	static title = "Flow";

	// Node box and gaps, in px — the SVG and the boxes share one coordinate system.
	static W = 240; static H = 96; static GX = 56; static GY = 14;

	root(n){
		const phases = this.phases(n);
		const cols = [[n], ...phases];
		const { W, H, GX, GY } = this.constructor;
		const rows = Math.max(1, ...cols.map(c => c.length));
		const width = cols.length * W + (cols.length - 1) * GX;
		const height = rows * H + (rows - 1) * GY;
		const pos = new Map();
		cols.forEach((col, i) => {
			const top = (height - (col.length * H + (col.length - 1) * GY)) / 2;
			col.forEach((c, j) => pos.set(c, { x: i * (W + GX), y: top + j * (H + GY) }));
		});

		div.c("ai-tree-root ai-tree-scroll", () => {
			div.c("ai-tree-graph", $g => {
				$g.style("width", width + "px").style("height", height + "px");
				$g.el.insertAdjacentHTML("afterbegin", this.edges(n, cols, pos));
				cols.forEach(col => col.forEach(c => {
					const { x, y } = pos.get(c);
					this.node(c, c === n ? [] : n.children).style("left", x + "px").style("top", y + "px")
						.style("width", W + "px").style("height", H + "px");
				}));
			});
		});
	}

	node(n, siblings){
		return div.c(`ai-tree-node is-${n.state}`, () => {
			this.head(n, siblings);
			this.bar(n);
			if (n.children?.length) div.c("ai-tree-subs", () => {
				n.children.forEach(k => this.mark(k).attr("title", `${k.title || k.agent}: ${k.state}`));
				span.c("ai-tree-label", `${n.children.length} subtasks`);
			});
		});
	}

	// Parent → phase 1; each later task ← what it waits for (or all of the phase before).
	edges(n, cols, pos){
		const { W, H } = this.constructor;
		const by = TaskTree.index(n.children || []);
		const lines = [];
		const line = (from, to, cls) => {
			const a = pos.get(from), b = pos.get(to);
			if (!a || !b) return;
			const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, mx = (x1 + x2) / 2;
			lines.push(`<path class="${cls}" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2 - 6},${y2}" marker-end="url(#ai-tree-arrow)"/>`);
		};
		cols.forEach((col, i) => {
			if (!i) return;
			col.forEach(c => {
				const ups = (c.after || []).map(by).filter(Boolean);
				const from = ups.length ? ups : cols[i - 1];
				from.forEach(u => line(u, c, `is-${u.state === "landed" ? "landed" : (c.state === "waiting" ? "waiting" : "running")}`));
			});
		});
		const w = cols.length * (W + 56), h = Math.max(...[...pos.values()].map(p => p.y)) + H;
		return `<svg class="ai-tree-edges" width="${w}" height="${h}" aria-hidden="true">
			<defs><marker id="ai-tree-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
			<path d="M0,0 L10,5 L0,10 z"/></marker></defs>${lines.join("")}</svg>`;
	}
}

// The designs, in the order the pages list them; the first is the default.
export const designs = { lanes: Lanes, outline: Outline, flow: Flow };
export const Winner = Lanes;

// The counts line: "3 running · 2 waiting · 4 landed".
export function counts(roots){
	const c = TaskTree.counts(roots);
	return div.c("ai-tree-counts", () => {
		["running", "waiting", "landed"].forEach(s => span.c(`ai-tree-count is-${s}`, () => {
			span.c("ai-tree-n", String(c[s] || 0)); span(" " + s);
		}));
	});
}
