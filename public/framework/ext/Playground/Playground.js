import View, { div } from "/framework/core/View/View.js";
import Tree from "/framework/ux/Tree/Tree.js";
import grip from "/framework/ext/grip/grip.js";
import Item from "/framework/core/Item/Item.js";
import { Flex, Grid, Box } from "./items.js";
import { open, list, mint_slug, del, load_layout, save_as_layout, strip_ids } from "./documents.js";
import properties from "./properties.js";
import toolbar, { refresh_toolbar, paint_viewport_slot } from "./toolbar.js";
import { canvas, paint_canvas, Canvas, position_handles } from "./canvas.js";

// "Into the selection if it is a container, else beside it" (design §6) — a Box never
// takes children, `Flex`/`Grid` always can, whichever `Item` subclass gets added later.
const is_container = item => item instanceof Flex || item instanceof Grid;

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
	}

	repaint(){
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
		this.mark();
	}

	// Called from both `select()` and `repaint()` — the one place selection and the
	// properties column can never disagree (design §4: "selection change redraws the
	// properties column"). `change` never comes through here — see `apply_change()`.
	mark(){
		this.$body.el.querySelectorAll(".pg-selected").forEach(el => el.classList.remove("pg-selected"));
		this.$body.el.querySelector(`[data-id="${this.selected}"]`)?.classList.add("pg-selected");
		this.$tree_widget?.select(this.nodes_by_id.get(this.selected));
		this.paint_properties();
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
		if (!item) return;

		const style = item.styles();
		const node = this.$body.el.querySelector(`[data-id="${item.id}"]`);
		node?.setAttribute("style", style);

		// pg-resize seam: ANY data change can shift a flex row's own gap geometry
		// (a properties-panel edit, not just a drag commit) — one place to keep
		// every handle in sync, cheap enough for this tree's size.
		position_handles(this.$body.el);

		const readout = this.$props_body.el.querySelector(".pg-readout");
		if (readout) readout.textContent = node ? node.getAttribute("style") : style;

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

	// "Into the selection if it is a container, else beside it" (design §6).
	// Selection moves to the new item BEFORE `add()` fires the repaint (remove()'s own
	// rule) — add-then-remove used to delete the OLD selection (found 2026-08-19, task 5).
	add(Type){
		const target = this.selected_item();
		this.add_to(is_container(target) ? target : (target?.parent ?? this.doc), Type);
	}

	// The shared mutation both `add()` (selection-gated, `is_container`) and the canvas's
	// own `.pg-add` click (explicit target, selection irrelevant — pg-placeholder brief
	// item 2) land through: same selection-before-repaint rule as `add()`, no gate on
	// `into`'s type, so a plain Box parents exactly like a Flex/Grid (item 3).
	add_to(into, Type = Box){
		const item = new Type({ data: { label: Type.name } });
		this.selected = item.id;
		into.add(item);
		return item;
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

	// "Copy+paste in one verb" (design §6) — same clipboard string, same landing rule.
	duplicate(){
		const item = this.selected_item();
		if (!item) return;
		this.copy(item);
		this.paste();
	}
}

// `static Canvas` lives in canvas.js now (design §9) — attached here, not there, so
// `pg.constructor.Canvas.render` (canvas.js's `paint_canvas`) still resolves through
// the live class (`code` skill §3), and canvas.js never has to import Playground.js back.
Playground.Canvas = Canvas;

export default Playground;
