import Item from "/framework/core/Item/Item.js";
import View, { div, span, button, icon } from "/framework/core/View/View.js";

/* A flow is a recorded progression of panel steps. Start, split, split, resize, sow —
   each gesture is one step, and a step is the whole tree, so you can replay what you
   built and step through it afterwards. Nothing on disk; memory only. Record: doc/flow.md.

   ⚠ Imports `Item` and `View` and nothing else in this module: `workspace.js` reads THIS
   file for its one hook, so this file may never read `workspace.js` back.

   css: .panel-flow-bar and its parts (flow.css). */
View.stylesheet(import.meta, "flow.css");

export class Flow {

	constructor(...args){
		this.assign(...args);
		this.steps = [];
		this.start = this.capture();      // frame 0 — the panel everything was built from
		this.at = 0;
		this.listen();
	}

	assign(...args){ return Object.assign(this, ...args); }

	/* ⚠ A DEEP copy, not `root.toJSON()` on its own: that hands back the LIVE `data`
	   object and the live child Items, so the next `set()` would rewrite a step that
	   had already been recorded. `JSON.parse(JSON.stringify(root))` walks the same
	   `toJSON()` and lands plain. */
	capture(){ return { at: Date.now(), snapshot: JSON.parse(JSON.stringify(this.root)) }; }

	/* The three Item events `mount()` already binds, and not the six verbs: `divide`,
	   `split`, `close`, `absorb`, `sow` and a drag all mutate through these, and a drag
	   through none of the others. */
	listen(){
		["change", "add", "remove"].forEach(event => this.root.on(event, () => this.touch()));
		return this;
	}

	/* ⚠ A grip drag fires `change` per pixel. The step lands `burst` ms after the LAST
	   event of a gesture, so a gesture is one step rather than four hundred — and
	   `replaying` is the guard that stops a replayed step from recording itself. */
	touch(){
		if (this.replaying) return this;
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.commit(), this.burst);
		return this;
	}

	// ⚠ Scrubbed back and then built on: the future it left is not what you made.
	commit(){
		const step = this.capture();
		if (this.same(step)) return this;

		this.steps.length = this.at;
		this.steps.push(step);
		while (this.steps.length > this.max) this.steps.shift();

		this.at = this.steps.length;
		return this.changed();
	}

	// A gesture that ended where it began is not a step.
	same(step){ return JSON.stringify(step.snapshot) === JSON.stringify(this.frame(this.at).snapshot); }

	frame(n){ return n > 0 ? this.steps[n - 1] : this.start; }
	count(){ return this.steps.length; }
	live(){ return this.at === this.steps.length; }

	// The whole recording, frame 0 first — enough for a caller to keep one.
	save(){ return [this.start, ...this.steps]; }

	/* Replay. The snapshot IS the state, so stepping anywhere is one `hydrate` and one
	   redraw — there is no inverse-operation table to get wrong, and stepping back costs
	   exactly what stepping forward costs. */
	go(n){
		const at = Math.max(0, Math.min(n, this.steps.length));

		this.at = at;
		this.replaying = true;
		clearTimeout(this.timer);         // a gesture still settling is not part of the past
		this.swap(this.frame(at).snapshot);
		this.replaying = false;

		return this.changed();
	}

	back(){ return this.go(this.at - 1); }
	forward(){ return this.go(this.at + 1); }

	/* One swap and one announcement — `roll()`'s idiom in workspace.js. Removing the
	   children one at a time redraws the whole workspace once per panel and refetches
	   every lazy template with it. ⚠ The root OBJECT stays: `mount()`'s listeners, the
	   selection and the saver all hold it, so a replay dresses it rather than replacing it. */
	swap(json){
		const fresh = Item.hydrate(json);
		const root = this.root;

		[...root.items].forEach(kid => { delete kid.parent; });
		root.items.children = [...fresh.items].map(kid => root.items.adopt(kid));
		root.data = fresh.data;
		root.id = fresh.id;

		return root.emit("add");
	}

	/* What a step DID, named from the two snapshots either side of it: panels gained or
	   lost, else the first data key that reads differently. One clause — anything
	   cleverer is the inverse-operation table this design exists not to have. */
	verb(n){
		const before = this.frame(n - 1)?.snapshot, after = this.frame(n)?.snapshot;
		if (!n || !before || !after) return "start";

		const gain = panels(after) - panels(before);

		if (gain) return `${gain > 0 ? "+" : "−"}${Math.abs(gain)} panel${Math.abs(gain) > 1 ? "s" : ""}`;
		return differs(before, after) ?? "changed";
	}

	// One strip watches one flow — the page mounts exactly one beside its workspace.
	changed(){ this.watcher?.(this); return this; }
}

Flow.mounted = [];

Flow.prototype.burst = 150;
Flow.prototype.max = 200;
Flow.prototype.replaying = false;
Flow.prototype.timer = null;

const panels = json => 1 + (json.items ?? []).reduce((n, kid) => n + panels(kid), 0);

const differs = (a, b) => {
	for (const key of new Set([...Object.keys(a.data ?? {}), ...Object.keys(b.data ?? {})]))
		if (JSON.stringify(a.data?.[key]) !== JSON.stringify(b.data?.[key])) return key;

	const kids = a.items ?? [], theirs = b.items ?? [];
	for (let i = 0; i < kids.length; i++){
		const hit = differs(kids[i], theirs[i] ?? {});
		if (hit) return hit;
	}
	return null;
};

/* Strips built before their workspace has loaded its document — which is every strip a
   page mounts, because `workspace()` places its box now and fills it in a callback. */
const waiting = [];

/* `workspace.js`'s one hook. Every mount records: a flow is three listeners and an array
   until something mutates. */
export function record(root, $root){
	const flow = new Flow({ root, $root });
	$root.flow = flow;

	// ⚠ Several workspaces share one page — the Doc page holds one plus five demo panels,
	// and an SPA keeps the page you came from mounted — so "the last one" cannot say which
	// is which. Pruned to what is still on screen, and nothing ON a page reads it: it is
	// the door a headless driver opens (`Flow.mounted.find(f => f.$root.el.closest(…))`).
	Flow.mounted = Flow.mounted.filter(made => made.$root.el.isConnected).concat(flow);

	const strip = waiting.find(s => s.$ws === $root);
	if (strip){
		waiting.splice(waiting.indexOf(strip), 1);
		strip.take(flow);
	}

	return flow;
}

/* The scrubber: ⏮ ◀ n / N ▶ ⏭ · what the step did · ● rec. Mounted by the PAGE beside
   its workspace, never inside a panel's own hover bar — a flow is the document's, and
   every panel in it would otherwise carry a copy of the same strip. */
export function scrubber($ws){
	const $bar = div.c("panel-flow-bar");
	const draw = flow => $bar.empty(() => controls(flow));
	const take = flow => { flow.watcher = draw; draw(flow); };

	$ws.flow ? take($ws.flow) : waiting.push({ $ws, take });
	return $bar;
}

const btn = (name, title, fn) => button.c("panel-flow-btn", () => icon(name)).attr("title", title).click(fn);

function controls(flow){
	const n = flow.at, total = flow.count();

	btn("first_page", "The start — the panel everything was built from", () => flow.go(0));
	btn("chevron_left", "Step back", () => flow.back());
	span.c("panel-flow-count", `${n} / ${total}`);
	btn("chevron_right", "Step forward", () => flow.forward());
	btn("last_page", "The newest step", () => flow.go(total));

	span.c("panel-flow-verb", flow.verb(n));
	span.c("panel-flow-rec", "● rec").ac(flow.live() && "on")
		.attr("title", flow.live() ? "Recording — every gesture is a step" : "Replaying a step. Build anything and the flow carries on from here.");
}

export default Flow;
