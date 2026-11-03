import { View, icon } from "../../core/View/View.js";
import { Dropdown } from "../../ext/Dropdown/dropdown.js";

View.stylesheet(import.meta, "FilterPill.css");

/**
 * class FilterPill extends Dropdown — one filter as a small rounded pill: "Today ▾".
 * Its choice lives in the url (`?<param>=<value>`, left out when it is the default), so a reload
 * or a shared link lands on the same view. A page adds one in one line:
 *
 *   FilterPill.add({ param: "kind", options: [{ value: "all", label: "All" }, …], changed: v => redraw() });
 *
 * Subclass to give it meaning (`TimeFilter`). Doc: readme.md, "Filter pills".
 */
export default class FilterPill extends Dropdown {

	// Built and drawn under whatever is capturing; returns the instance, not the view, so the caller can ask it things.
	static add(...args){ const f = new this(...args); f.draw(); return f; }

	constructor(...args){
		super(...args);
		this.fallback ??= this.value ?? this.options[0]?.value;
		const asked = new URLSearchParams(location.search).get(this.param);
		this.value = this.options.some(o => o.value === asked) ? asked : this.fallback;
	}

	draw(){ return super.draw().ac("filter-pill").attr("title", this.title ?? ""); }

	// Dropdown calls pick(value) once per choice: remember it, write it to the url, redraw the face, tell the caller.
	pick(value){
		this.value = value;
		this.write();
		this.$trigger.empty(() => { this.face(this.chosen()); icon("expand_more"); });
		this.$list.el.querySelectorAll(".dropdown-option").forEach((b, i) => b.classList.toggle("on", this.options[i]?.value === value));
		this.changed?.(value, this);
	}

	write(){
		const q = new URLSearchParams(location.search);
		this.value === this.fallback ? q.delete(this.param) : q.set(this.param, this.value);
		history.replaceState(history.state, "", location.pathname + (q.size ? "?" + q : "") + location.hash);
	}
}

FilterPill.prototype.param = "filter";

export { FilterPill };
