import View, { div } from "/framework/core/View/View.js";
import Tree from "/framework/ux/Tree/Tree.js";
import grip from "/framework/ext/grip/grip.js";
import Item from "/framework/core/Item/Item.js";
import { Flex, Grid, Box } from "./items.js";
import { open, list, mint_slug, del, load_layout, save_as_layout, strip_ids } from "./documents.js";
import properties, { paint_readout } from "./properties.js";
import toolbar, { refresh_toolbar, paint_viewport_slot } from "./toolbar.js";
import { canvas, paint_canvas, Canvas, position_handles } from "./canvas.js";

// "Into the selection if it is a container, else beside it" (design §6) — a Box never
// takes children, `Flex`/`Grid` always can, whichever `Item` subclass gets added later.
const is_container = item => item instanceof Flex || item instanceof Grid;

/* ── The one rule (pg-edges; ux proposal §The model) ────────────────────────────────────
 * **An edge inserts a sibling on that side. If the parent doesn't already flow that way,
 * the parent is made to — converted if the node stands alone, wrapping just this node if
 * it has siblings that must stay put.**
 *
 * Everything the owner asked for falls out of it, so none of it is a separate concept:
 * sibling-before/after is WHICH edge; row-vs-column is which PAIR of edges, so direction
 * is never its own gesture again; wrap-into-row/column is the same click when the parent
 * flows the other way. `child` is the one target that is NOT an edge — the blocky centre
 * `+` wave 1 shipped, in flow and reserving its own room. `section` is a child of the
 * root, so it is that same `+` too. */
const FLOWS  = { left: "row", right: "row", top: "column", bottom: "column" };
const BEFORE = { left: true, top: true, right: false, bottom: false };

// A new sibling inherits the clicked node's SIZE words and nothing else — that is the
// proposal's second saving ("a row of cards is equal by construction" instead of one
// `fill` click per card). Its type, label, bg and container config are not information
// about the new box; only how big its slot is.
const size_words = item => Object.fromEntries(["width", "height"].filter(k => item.get(k)).map(k => [k, item.get(k)]));

const next_sibling = item => { const kids = item.parent.items.children; return kids[kids.indexOf(item) + 1] ?? null; };

View.stylesheet(import.meta, "playground.css");

const KEY = "lew42-pg-rails";      // one key, both rail widths — a room is not a document (design §1)
const LAST_KEY = "lew42-pg-last";  // which document a reload should reopen (design §10's own open question)
const TREE_BOUNDS = [11, 30];    // em — mirrors playground.css's clamp() exactly
const PROPS_BOUNDS = [13, 34];

/* An Item tree rendered as the real thing (design.md). Selection is an id, never a
 * node — a reload hydrates a NEW tree, so every held object would be detached. */
export class Playground {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// Synchronous scaffold — toolbar/tree/canvas/properties, both grips, the rail widths —
	// then the document loads async and fills it in (`code` skill: capture the box now,
	// fill it in a callback; nothing here builds DOM after an `await`).
	build(){
		this.viewport ??= "full";   // ⤢ is default (brief) — set before `toolbar()` reads it

		// `.page`'s single child — `flex v flex-1` (utility classes: column, fill the
		// row) — toolbar on top, full shell width, `.pg-shell` (still a flex row, three
		// regions, no nesting) below (design §1's sketch: the toolbar spans all three
		// columns, never just the canvas).
		div.c("pg-frame flex v flex-1", () => {
			toolbar(this);

			div.c("pg-shell flex flex-1", () => {
				this.$tree = div.c("pg-tree", () => {
					grip({ write: px => this.write("tree", px), done: w => this.remember("tree", w), from: "start" });
					this.$tree_body = div.c("pg-tree-body");
				});

				canvas(this);   // `.pg-canvas` + the click-to-select listener (canvas.js)

				this.$props = div.c("pg-properties", () => {
					// Playground's OWN column, never the shared `ext/drawer` rail — two writers
					// blanked it (panel-insight §Avoid — `properties.js:150`).
					grip({ write: px => this.write("props", px), done: w => this.remember("props", w) });
					this.$props_body = div.c("pg-properties-body");
				});
			});
		});

		// Both viewing floors start ON (toolbar.js's own two buttons start `.on` to match) —
		// one class flip each, on the node `paint_canvas()` never rebuilds.
		this.$body.tc("pg-pad-floor pg-gap-floor", true);

		const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
		if (saved.tree) this.write("tree", parseFloat(saved.tree));
		if (saved.props) this.write("props", parseFloat(saved.props));

		// Reload reopens the LAST document (localStorage) over the constructor's own
		// `slug` — page.js always passes "untitled", which is only the first-ever default.
		this.swap(localStorage.getItem(LAST_KEY) || this.slug || "untitled");

		return this;
	}

	// Bounds in em, converted against the RAIL'S OWN font-size — not a hardcoded 16px —
	// so the JS clamp (what `done()` remembers) always agrees with the CSS clamp (what
	// the column actually renders at), whatever the cascade hands this element.
	write(which, px){
		const $el = which === "tree" ? this.$tree : this.$props;
		const em = parseFloat(getComputedStyle($el.el).fontSize);
		const [min, max] = (which === "tree" ? TREE_BOUNDS : PROPS_BOUNDS).map(e => e * em);
		const w = Math.round(Math.max(min, Math.min(px, max)));
		$el.style(`--pg-${which}`, w + "px");
		return w;
	}

	remember(which, w){
		const data = JSON.parse(localStorage.getItem(KEY) || "{}");
		data[which] = w + "px";
		localStorage.setItem(KEY, JSON.stringify(data));
	}

	// One listener at the root (core/List's rule, design §4): `add`/`remove` repaint
	// everything; `change` — a control's `item.set()`, bubbled — writes the one live
	// node, no repaint.
	listen(){
		this.doc.on("add", () => this.repaint());
		this.doc.on("remove", () => this.repaint());
		this.doc.on("change", key => this.apply_change(key));
	}

	// `ext/editor`'s idiom (design §2): ONE function — saver, listener, canvas and
	// selection move onto the new tree together, or not at all. `Item.hydrate` returns a
	// NEW tree every time, so a half-done swap is a live Playground writing to a document
	// nobody is looking at.
	async swap(slug){
		this.doc = await open(slug);
		this.slug = slug;
		this.selected = this.doc.id;
		localStorage.setItem(LAST_KEY, slug);
		this.listen();
		this.repaint();
		await refresh_toolbar(this);
	}

	async create(){
		return this.swap(await mint_slug());
	}

	// Refuses on the last document (`documents.js`'s own rule) — falls back to whatever
	// remains, never to a slug that might not exist any more.
	async delete_current(){
		const ok = await del(this.slug);
		if (!ok) return false;
		const remaining = await list();
		await this.swap(remaining[0]?.slug ?? "untitled");
		return true;
	}

	async save_selected_as_layout(name){
		const item = this.selected_item();
		if (!item || !name) return false;
		await save_as_layout(item, name);
		await refresh_toolbar(this);
		return true;
	}

	// A saved layout file is id-stripped again at `paste()` — inserting it twice mints
	// two disjoint sets of fresh ids, never a collision (design §7).
	async insert_layout(name){
		const json = await load_layout(name);
		return json ? this.paste(JSON.stringify(json)) : undefined;
	}

	// The canvas box's own width (design §4) — never the document's; `--pg-viewport`
	// lives on `.pg-canvas-body`, `.pg-viewport` (a child rebuilt every `paint_canvas()`,
	// canvas.js) reads it back, so a repaint never loses the current preset. Stays here,
	// not canvas.js — it also repaints `toolbar.js`'s preset buttons, and Playground.js
	// is the one file that already imports both.
	set_viewport(preset){
		this.viewport = preset;
		this.$body.style("--pg-viewport", preset === "full" ? "100%" : preset + "px");
		paint_viewport_slot(this);
		// The canvas box just changed width with no repaint, so every handle's computed
		// coordinate is stale. canvas.js's ResizeObserver catches this too — this call is
		// the honest one: the code that MOVED the geometry says so (pg-model).
		position_handles(this.$body.el);
	}

	/* A structural insert makes up to four list mutations (wrap in, move, insert, convert)
	 * and every one of them fires `add`/`remove` → `repaint()` → a `save()`. `batch()`
	 * collapses them into one repaint and one save — and, more than an optimisation, it is
	 * what keeps a half-built tree off the canvas: during a wrap the clicked node is
	 * detached for exactly one statement, and a repaint in that instant would draw a
	 * document with the selection missing. */
	batch(fn){
		this.last_change = undefined;   // structural surgery has no one declaration to point at
		this.quiet = true;
		try { return fn(); } finally { this.quiet = false; this.repaint(); }
	}

	repaint(){
		if (this.quiet) return;
		this.paint_tree();
		paint_canvas(this);   // canvas.js
		this.mark();
		this.doc.save();
	}

	paint_tree(){
		this.nodes_by_id = new Map();

		const node_for = item => {
			const icon = item instanceof Grid ? "▦" : item instanceof Flex ? "▤" : "▪";
			const node = { icon, text: item.data.label || item.wire(), id: item.id };
			this.nodes_by_id.set(item.id, node);
			if (item.items.length) node.children = [...item.items].map(node_for);
			return node;
		};

		const roots = [Object.assign(node_for(this.doc), { open: true })];
		this.$tree_body.empty(() => { this.$tree_widget = new Tree({ nodes: roots, onSelect: n => this.select(n.id) }); });
	}

	select(id){
		this.selected = id;
		this.last_change = undefined;   // a new selection has no "last change" to attribute yet
		this.mark();
	}

	// Called from both `select()` and `repaint()` — the one place selection and the
	// properties column can never disagree (design §4: "selection change redraws the
	// properties column"). `change` never comes through here — see `apply_change()`.
	mark(){
		this.mark_node();
		this.$tree_widget?.select(this.nodes_by_id.get(this.selected));
		this.paint_properties();
	}

	// Just the canvas half — its own seam because a structural `change` (below) redraws the
	// canvas and must re-light the selection, while deliberately leaving the properties
	// column, its readout and the button you just pressed exactly where they are.
	mark_node(){
		this.$body.el.querySelectorAll(".pg-selected").forEach(el => el.classList.remove("pg-selected"));
		this.$body.el.querySelector(`[data-id="${this.selected}"]`)?.classList.add("pg-selected");
	}

	// Rebuilds the properties column's CONTROLS for the newly selected item — never
	// called from `apply_change()`, so a `change` leaves this DOM alone (the design's
	// own proof: `.pg-properties-body`'s element identity survives a `change`).
	paint_properties(){
		const item = this.selected_item();
		this.$props_body.empty(() => item ? properties(item, this) : div.c("muted pad", "Nothing selected."));
	}

	// design §4's `change` row: no repaint — write the ONE live canvas node's style,
	// refresh the readout text (not rebuild it), save. `item.styles()` recomputes every
	// declaration from `data`, so "the one property" lands correctly whichever one
	// changed, without a per-key CSS-prop lookup table.
	apply_change(key){
		const item = this.selected_item();
		// Mid-surgery (`batch()`), every `set()` is a step in a tree that is not finished —
		// patching one live node's style, or worse redrawing the canvas from it below, would
		// draw a half-built document. The batch's own closing repaint draws the finished one.
		if (!item || this.quiet) return;

		const style = item.styles();
		const node = this.$body.el.querySelector(`[data-id="${item.id}"]`);
		// Read the OLD declarations back off the node before overwriting them — that diff is
		// the whole of the readout's attribution (pg-edges item 5), and it needs no
		// key → CSS-property table to exist or stay in sync.
		const before = node?.getAttribute("style") ?? "";
		node?.setAttribute("style", style);

		/* pg-resize seam: ANY data change can shift a flex row's own gap geometry
		 * (a properties-panel edit, not just a drag commit) — one place to keep
		 * every handle in sync, cheap enough for this tree's size.
		 *
		 * `direction` and `wrap` are the two that MOVING a handle cannot fix: a handle's
		 * orientation is baked into its class at render time (`pg-resize-col` vs `-row`,
		 * canvas.js) and a wrapped row draws no handles at all, so flipping either left the
		 * strips lying across the wrong axis until something else happened to repaint — the
		 * readme's own "Left" item, and the one pg-edges could not leave alone, because a
		 * stale handle is now a stale INSERT target too. The canvas is redrawn and the
		 * selection re-lit; the properties column (and this change's own attribution in the
		 * readout, below) is deliberately untouched. */
		if (key === "direction" || key === "wrap"){ paint_canvas(this); this.mark_node(); }
		else position_handles(this.$body.el);

		/* One line per declaration, the ones that just appeared highlighted, and the key that
		 * did it named underneath — including when it wrote nothing, which is half of what
		 * `items.js#size_decls` has to teach ("hug and never-touched are the same thing").
		 *
		 * Held on the instance as well as painted, because five of the sidebar's controls
		 * (`type`, `width`, `height`, `pad`, `bg`) rebuild the whole column right after
		 * writing — they have to, they change which fields exist — and that first paint would
		 * otherwise wipe the attribution of the very change that triggered it. Measured: the
		 * grid prefill and every axis word lost their highlight this way. */
		this.last_change = { key, before };
		if (this.$readout?.el.isConnected) paint_readout(this, style, key, before);

		// A seg button's own highlight is state, not structure — flip it in place
		// (still no repaint: `paint_properties()` never runs on a `change`).
		const field = [...this.$props_body.el.querySelectorAll(".pg-field")]
			.find(f => f.querySelector(".pg-field-label")?.textContent === key);
		field?.querySelectorAll(".pg-seg-btn").forEach($btn => {
			$btn.classList.toggle("pg-seg-active", $btn.textContent === (item.get(key) || "none"));
		});

		this.doc.save();
	}

	selected_item(){ return this.selected && this.doc.find(this.selected); }

	/* Two verbs, two selection rules, one line each (pg-interactions).
	 *
	 * `add_to` is a PLACE — "put one here". Here stays selected, so the canvas + you just
	 * clicked is still lit (playground.css gates it on `.pg-selected:hover`) and you can
	 * click it again, and again. Selecting the new CHILD instead was what broke repeated
	 * adds: the container went unselected, its + vanished, and the child's own + popped up
	 * under the pointer in its place.
	 *
	 * `add()` — the toolbar + — is a VERB ON THE SELECTION, so it keeps the documented
	 * behaviour: what you just made is selected. It has no hover gate to lose, and losing
	 * this would resurrect the 2026-08-19 add-then-remove bug (task 5) on that path.
	 *
	 * Either way selection is right BEFORE `into.add()` fires the repaint — `remove()`'s
	 * rule below — and lands on an item that certainly exists. */
	add(Type){
		const target = this.selected_item();
		const item = this.add_to(is_container(target) ? target : (target?.parent ?? this.doc), Type);
		this.select(item.id);
		return item;
	}

	// The shared mutation both `add()` and the canvas's own `.pg-add` click (explicit
	// target, selection irrelevant — pg-placeholder brief item 2) land through: no gate on
	// `into`'s type, so a plain Box parents exactly like a Flex/Grid (item 3).
	add_to(into, Type = Box){
		const item = new Type({ data: { label: Type.name } });
		this.selected = into.id;
		into.add(item);
		return item;
	}

	/* Which way a parent already flows. Block flow stacks, so a plain Box IS a column and
	 * an edge-insert into one costs no conversion at all. A Grid answers `null` — "no flow
	 * I can re-aim": its template is authored information, and the honest move is to wrap
	 * rather than throw a `grid-template-columns` away to satisfy one click. */
	flow_of(parent){
		if (parent instanceof Grid) return null;
		if (parent instanceof Flex) return parent.get("direction") || "row";
		return "column";
	}

	// The rule at the top of this file, in code. `side` is one of `FLOWS`' four keys.
	insert_at(item, side, Type = Box){
		const parent = item?.parent;
		if (!parent || !FLOWS[side]) return;   // the root has no siblings — its centre + adds children

		const want = FLOWS[side], first = BEFORE[side];
		const twin = new Type({ data: { label: Type.name, ...size_words(item) } });
		const flow = this.flow_of(parent);

		// The CLICKED node stays selected — wave 1's `add_to` rule (a place, not a verb on
		// the selection). The edge you just used is still lit and still under the pointer,
		// so the next click can be the same click: three across is click, click.
		this.selected = item.id;

		return this.batch(() => {
			if (flow === want){
				parent.items.insert_before(twin, first ? item : next_sibling(item));
			} else if (parent.items.length === 1 && flow !== null){
				// It stands alone: nothing else can be disturbed, so make the PARENT flow
				// this way. A Box becomes a Flex; a Flex just re-aims. No wrapper is minted,
				// so the tree gets no deeper — the depth check in the proof reads this.
				const flexed = this.convert(parent, Flex);
				flexed.set("direction", want);
				flexed.items.insert_before(twin, first ? item : null);
			} else {
				// Siblings must stay put — wrap ONLY this node. The wrapper takes over the
				// node's own slot (its width/height words), so every other child of the
				// parent still sees the same box, the same size, in the same place.
				const wrap = new Flex({ data: { label: want, direction: want, ...size_words(item) } });
				parent.items.insert_before(wrap, item);   // the wrapper lands at the node's own index
				item.move(wrap);
				wrap.items.insert_before(twin, first ? item : null);
			}
			return twin;
		});
	}

	// A gap handle that never travelled is a click, not a drag (canvas.js) — and the pair it
	// flanks already flow the right way, so this is the plain insert with no conversion to
	// reason about. Selection is deliberately untouched: what is selected is the CONTAINER
	// (its handle is what you clicked), so every gap stays lit for the next click.
	insert_between(a, b, Type = Box){
		const twin = new Type({ data: { label: Type.name, ...size_words(a) } });
		a.parent.items.insert_before(twin, b);
		return twin;
	}

	// Type toggles CONVERT the node in place (pg-sidebar brief §2) — same id, same data
	// (shallow-copied so the discarded old instance shares nothing live), children moved
	// onto the new instance, never rebuilt (`[...item.items]` snapshots before the old
	// list is abandoned). Same id means `this.selected` is ALREADY right on both sides —
	// no reassignment needed, sidestepping `remove()`'s own "selection has to already be
	// right" trap below. A non-root swap rides the existing `add`/`remove` events straight
	// to `repaint()` (same rule as `add_to`'s own comment); the root has no parent to fire
	// through, so it repaints explicitly and re-listens — `this.doc` is now a new object.
	convert(item, Type){
		if (item.constructor === Type) return item;

		const clone = new Type({ id: item.id, data: { ...item.data } });
		[...item.items].forEach(kid => clone.items.append(kid));

		const parent = item.parent;
		if (parent){
			const siblings = parent.items.children;
			const ref = siblings[siblings.indexOf(item) + 1] ?? null;
			parent.items.remove(item);
			parent.items.insert_before(clone, ref);
		} else {
			this.doc = clone;
			this.listen();
			this.repaint();
		}

		return clone;
	}

	// The parent it leaves behind is captured BEFORE `remove()` runs — `List.remove`
	// deletes `child.parent` the instant it's out, and the `remove` event this fires
	// repaints synchronously, so `this.selected` has to already be right when it does.
	remove(){
		const target = this.selected_item();
		if (!target || target === this.doc) return;
		this.selected = target.parent?.id;
		target.remove();
	}

	// `JSON.stringify(item)` (design §6) — `Item.toJSON()` is the four-key envelope.
	// `navigator.clipboard` needs a permission a headless run won't have, so the string
	// is also kept on the instance — the paste path (and any prover) can read either.
	copy(item = this.selected_item()){
		if (!item) return "";
		const json = JSON.stringify(item);
		navigator.clipboard?.writeText(json)?.catch(() => {});
		return this.clipboard = json;
	}

	// Strip ids, hydrate (fresh ids all round), land it by the same add rule as `add()` —
	// into the selection if it's a container, else beside it in its parent.
	paste(text = this.clipboard){
		if (!text) return;
		let json;
		try { json = JSON.parse(text); } catch { return; }

		const clone = Item.hydrate(strip_ids(json));
		const target = this.selected_item();
		const into = is_container(target) ? target : (target?.parent ?? this.doc);
		this.selected = clone.id;   // same rule as add(): what you just made is selected
		into.add(clone);
		return clone;
	}

	/* "Copy+paste in one verb" (design §6) — but BESIDE the original, not through `paste()`'s
	 * into-or-beside rule. That rule is right for the toolbar verb it was written for; this
	 * verb now runs from a chip sitting ON the node (pg-edges item 3), and a duplicate
	 * landing INSIDE the Flex you just pointed at reads as a bug. The chip is the only
	 * caller left — the toolbar's own `⧉` is gone. */
	duplicate(){
		const item = this.selected_item();
		if (!item?.parent) return;
		const clone = Item.hydrate(strip_ids(JSON.parse(this.copy(item))));
		this.selected = clone.id;
		item.parent.items.insert_before(clone, next_sibling(item));
		return clone;
	}
}

// `static Canvas` lives in canvas.js now (design §9) — attached here, not there, so
// `pg.constructor.Canvas.render` (canvas.js's `paint_canvas`) still resolves through
// the live class (`code` skill §3), and canvas.js never has to import Playground.js back.
Playground.Canvas = Canvas;

export default Playground;
