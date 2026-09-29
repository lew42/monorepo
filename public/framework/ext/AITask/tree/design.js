import { Page, div, p, a, span, md } from "/app.js";
import { designs, counts } from "../nested.js";
import plan from "../plan.js";

/* One page per design, all drawn on the same made-up plan (../plan.js), so the
   three can be compared on exactly the same tasks. /tree/demo/ is an alias of
   the Lanes page (the default design), and is not listed a second time. */

const BASE = "/framework/ext/AITask/tree/";

// The design switcher: plain links, one url per view (route everything).
export function switcher(current){
	div.c("ai-tree-designs", () => {
		span.c("ai-tree-label", "Views");
		const link = (label, href, on) => { const $a = a(label).attr("href", href); if (on) $a.attr("aria-current", "page").style("font-weight", "700"); };
		link("Today's tasks", BASE, current === null);
		Object.entries(designs).forEach(([id, D]) => link(D.title, `${BASE}${id}/`, D === current));
	});
}

export function design_page(meta, Design, { title, description, icon, intro }){
	return new Page({
		meta, title, description, icon,
		content(){
			div.c("ai-tree-page wide", () => {
				counts(plan);
				new Design(plan).draw();
				p(intro);
				switcher(Design);
				md("The plan is made up: a root task; phase 1 is three tasks at once (one landed, one at 60% with two minions of its own, one at 20%); phase 2 is two tasks that wait for all of phase 1. How the tree is built from real logs: [doc/nested.md](/framework/ext/AITask/doc/nested/).");
			});
		},
	});
}
