import View, { div, span, small } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "variants.css");

/* The one segmented, nested progress bar all three variants use. N children = N equal segments; a finished child is lit,
   a child that is partly done fills its segment that far, at half strength (the composite). A leaf is one segment.
   Past MAX segments it becomes one meter and a count. Proposed home: core/Task/TaskView.bar (doc/views-plan.md §5). */
export default class SegBar extends View {
	static MAX = 12;

	initialize(){
		const n = this.node, kids = n.kids.length ? n.kids : [n];
		const pct = Math.round(n.completion * 100);
		this.ac("svv-bar");
		this.attr("title", `${pct}% complete · ${kids.filter(k => k.completion === 1).length} of ${kids.length} done`);
		this.append(() => {
			if (kids.length > this.constructor.MAX) div.c("svv-meter", () => span.c("svv-fill").style({ width: pct + "%" }));
			else div.c("svv-segs", () => kids.forEach(k => {
				const c = k.completion;
				span.c("svv-seg", () => span.c("svv-fill").ac(c < 1 ? "is-part" : "is-full").style({ width: Math.round(c * 100) + "%" }));
			}));
			if (this.label !== false) small.c("svv-pct", pct + "%");
		});
	}
}
