import { Page, div, p, a, span, md } from "/app.js";
import { designs, Winner, counts } from "../nested.js";
import plan from "../plan.js";

/* One page per design, all drawn on the same made-up plan (../plan.js), so the
   three can be compared on exactly the same tasks. The demo page is the winner's. */

const BASE = "/framework/ext/AITask/tree/";

// The design switcher: plain links, one url per design (route everything).
export function switcher(current){
	div.c("ai-tree-designs", () => {
		span.c("ai-tree-label", "Designs");
		a("The winner, on today's tasks").attr("href", BASE);
		Object.entries(designs).forEach(([id, D]) => {
			const $a = a(D.title + (D === Winner ? " (the default)" : "")).attr("href", `${BASE}${id}/`);
			if (D === current) $a.attr("aria-current", "page").style("font-weight", "700");
		});
	});
}

export function design_page(meta, Design, { title, description, icon, intro }){
	return new Page({
		meta, title, description, icon,
		content(){
			div.c("ai-tree-page wide", () => {
				p(intro);
				switcher(Design);
				counts(plan);
				new Design(plan).draw();
				md("The plan is made up: a root task; phase 1 is three tasks at once (one landed, one at 60% with two minions of its own, one at 20%); phase 2 is two tasks that wait for all of phase 1. How the tree is built from real logs: [doc/nested.md](/framework/ext/AITask/doc/nested/).");
			});
		},
	});
}
