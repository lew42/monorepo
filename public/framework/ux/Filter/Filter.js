import { View, div, button, input } from "../../core/View/View.js";

/**
 * class Filter extends View — a segmented category plus a text search, both
 * remembered. Renders `ui/toolbar`'s `filter()` template verbatim (segment
 * buttons + a `flex-1` search field, `ui/toolbar/page.js`) with state behind it.
 *
 *   const f = new Filter({
 *       segments: ["All", "core", "ux"], segment_field: "tier",
 *       search_field: "name", placeholder: "Filter modules…",
 *       changed(predicate){ … },   // OR onChange — both spellings work
 *   });
 *   f.predicate()      a row => boolean, built from the CURRENT state
 *   f.set("ux")         pick a segment, fire changed()
 *   f.query("tr")        type into the field, fire changed()
 *
 * ⚠ Never reaches into a caller's DOM. `changed()` hands out a PLAIN FUNCTION —
 * the same shape `Tree.selected_change(node)` hands out a node (ux/Tree/Tree.js).
 * The page owns the data and the regions; this owns only its own two facts.
 * A caller runs `data.filter(predicate)` and refills whatever it likes.
 */
export default class Filter extends View {

	// ⚠ NOT `this.text` — `View.text()` is a getter/setter every View inherits,
	// so `this.text ??= ""` would silently skip (a function is never nullish)
	// and leave `this.text` pointing at the METHOD. `needle` is the free word.
	render(){
		this.active ??= this.all;
		this.needle ??= "";
		this.buttons = new Map();

		this.ac("flex wrap gap v-center");
		this.ac(this.chrome && "surface pad");
		this.segment_row();
		this.field();
	}

	// NOTHING TO SHOW, NOTHING DRAWN. A Filter with no segments — `core/Sidebar`'s,
	// because a rail narrows by exactly one fact (a page title) — still drew this
	// row, empty and zero wide. The parent's own `gap` then applied to it anyway, so
	// the field started a whole gap to the right of nothing: 25px of it at 1920, and
	// the owner read the result as a box inside a box. 2026-09-19.
	segment_row(){
		if (!this.segments.length) return;

		return div.c("flex v-center gap", () =>
			this.segments.forEach(s => this.segment_button(s))).style("--gap", "0.15em");
	}

	segment_button(segment){
		const $b = button(segment).click(() => this.set(segment));
		if (segment === this.active) $b.ac("prim");
		this.buttons.set(segment, $b);
		return $b;
	}

	// ⚠ Kept on `this.$field` so a subclass (`FilterChips`) can blank the box when a
	// chip's × clears the query from OUTSIDE a keystroke, and so Escape (below) can
	// blank it from a keystroke that is not an `input` event at all.
	field(){
		return this.$field = input().ac("flex-1").attr("type", "search").attr("placeholder", this.placeholder)
			.style("minWidth", "9em")
			.on("input", e => this.query(e.target.value))
			.on("keydown", e => { if (e.key === "Escape"){ e.preventDefault(); this.clear_query(); } });
	}

	// ---- the two facts ----------------------------------------------------

	// Toggles two classes rather than rebuilding the row — the same move as
	// `Tree.select()`, which only touches the previous and the new row.
	set(segment){
		this.buttons.get(this.active)?.rc("prim");
		this.active = segment;
		this.buttons.get(this.active)?.ac("prim");
		return this.changed();
	}

	query(text){
		this.needle = text;
		return this.changed();
	}

	// The base half of a chip's × — clears the QUERY only, never the segment. Added
	// as its own method (not inlined into Escape's handler above) because
	// `FilterChips`'s own × needs the exact same two lines — one method, two
	// callers, added 2026-09-18 when `core/Sidebar` needed Escape to do what a chip
	// already did (ux/Filter/doc/decisions.md).
	clear_query(){
		this.needle = "";
		this.$field.el.value = "";
		return this.changed();
	}

	// A plain function, built fresh from the current state — never a DOM read.
	predicate(){
		const needle = this.needle.trim().toLowerCase();
		const { active, all, segment_field, search_field } = this;

		return row => (active === all || row[segment_field] === active)
			&& (!needle || String(row[search_field]).toLowerCase().includes(needle));
	}

	// The seam — `Tree.selected_change(node)` copied one rung up: a subclass
	// overrides this ONE method; `onChange` still works as the callback spelling.
	changed(){
		const predicate = this.predicate();
		this.onChange?.(predicate);
		return predicate;
	}
}

// ⚠ `chrome: false` drops the card — the `.surface.pad` box this draws itself in —
// and nothing else: the same segments, the same field, the same events. It is for a
// Filter that is ALREADY inside something with a ground and a padding of its own,
// where a second box reads as a box inside a box (core/Sidebar's rail, 2026-09-19).
// A config word rather than an outside `.sidebar-filter { border: none }` override,
// because the caller that knows it is nested is the one that should say so, and
// framework's own rule is that overriding a base look is a bug report about it.
Filter.prototype.chrome = true;

Filter.prototype.segments = ["All"];
Filter.prototype.all = "All";
Filter.prototype.segment_field = "tier";
Filter.prototype.search_field = "name";
Filter.prototype.placeholder = "Filter…";

export { Filter };
