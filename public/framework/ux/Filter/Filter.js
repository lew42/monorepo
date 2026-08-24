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

		this.ac("surface pad flex wrap gap v-center");
		this.segment_row();
		this.field();
	}

	segment_row(){
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
	// chip's × clears the query from OUTSIDE a keystroke.
	field(){
		return this.$field = input().ac("flex-1").attr("type", "search").attr("placeholder", this.placeholder)
			.style("minWidth", "9em")
			.on("input", e => this.query(e.target.value));
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

Filter.prototype.segments = ["All"];
Filter.prototype.all = "All";
Filter.prototype.segment_field = "tier";
Filter.prototype.search_field = "name";
Filter.prototype.placeholder = "Filter…";

export { Filter };
