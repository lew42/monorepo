import { View, div, span, a, p } from "../../core/View/View.js";
import { designs, counts } from "./nested.js";

/* TaskViews — the task tree drawn in one of its views (Lanes, Outline, Flow), switched by plain links to
   `?view=` so a reload or back button lands on the same view. Used by the Tree tab on AITask.js.
   `roots` come from tree.js (tree_for_task). What each view is and who uses it: doc/views.md. */
export default class TaskViews {

	/** Lanes is the default: the winning design of the nested-tasks task (doc/nested.md). */
	static default = "lanes";

	constructor(roots, { view } = {}){
		this.roots = roots;
		this.view = designs[view] ? view : TaskViews.default;
	}

	static from_url(roots){
		return new TaskViews(roots, { view: new URLSearchParams(location.search).get("view") });
	}

	// Tasks inside the root task, to any depth (the root itself is not counted).
	static inner(roots){
		const n = list => list.reduce((t, k) => t + 1 + n(k.children || []), 0);
		return n(roots.flatMap(r => r.children || []));
	}

	draw(){
		return div.c("ai-task-views", () => {
			div.c("ai-tree-designs", () => {
				span.c("ai-tree-label", "Views");
				Object.entries(designs).forEach(([id, D]) => {
					const $a = a(D.title).attr("href", "#").on("click", e => { e.preventDefault(); this.pick(id); });
					if (id === this.view) $a.attr("aria-current", "page").style("font-weight", "700");
				});
			});
			this.$body = div.c("ai-task-views-body", () => this.body());
		});
	}

	pick(id){
		this.view = id;
		const u = new URL(location.href);
		u.searchParams.set("view", id);
		history.replaceState(null, "", u);
		this.$body.empty(() => this.body());
		this.$body.el.parentElement.querySelectorAll(".ai-tree-designs a").forEach(el =>
			(el.textContent === designs[id].title ? el.setAttribute("aria-current", "page") : el.removeAttribute("aria-current"),
			el.style.fontWeight = el.textContent === designs[id].title ? "700" : ""));
	}

	body(){
		counts(this.roots);
		new designs[this.view](this.roots).draw();
	}
}

