import { div, span } from "../../core/View/View.js";
import Filter from "./Filter.js";

/**
 * FilterChips extends Filter — the active segment and the query, shown as
 * dismissable `ui-pill` chips (`ui/badge`'s pill, `ui/tags`'s × — same markup,
 * a real listener). One new piece: `chip_list()`. Everything else — `set()`,
 * `query()`, `predicate()` — is inherited untouched.
 */
export default class FilterChips extends Filter {

	render(){
		super.render();
		this.$chips = div.c("flex wrap v-center gap").style("--gap", "0.4em");
		this.chips();
	}

	// What is active right now, as { label, clear() } pairs — never more than
	// one per fact, because a Filter holds exactly two facts.
	chip_list(){
		const list = [];
		if (this.active !== this.all) list.push({ label: this.active, clear: () => this.set(this.all) });
		if (this.needle) list.push({ label: `"${this.needle}"`, clear: () => this.clear_query() });
		return list;
	}

	chip(item){
		return span.c("ui-badge ui-pill h4 flex v-center gap", () => {
			span(item.label);
			span.c("muted", "×").style("cursor", "pointer").click(() => item.clear());
		}).style("--gap", "0.35em");
	}

	clear_query(){
		this.needle = "";
		this.$field.el.value = "";
		return this.changed();
	}

	chips(){
		return this.$chips.empty(() => this.chip_list().forEach(item => this.chip(item)));
	}

	// The base seam, plus keeping the chip row honest — a subclass adding a
	// redraw calls `super.changed()` first so the predicate it hands out is
	// unchanged (`ux/doc/system.md` — a variant is a subclass, not a fork).
	changed(){
		const predicate = super.changed();
		this.chips();
		return predicate;
	}
}

export { FilterChips };
