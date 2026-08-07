import { Page, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated, per_call } from "/perf/ui.js";

// N anchors in a real subtree inside $app, so the real sweeps really see them.
function stage_anchors(root, n){
	const stage = document.createElement("div");
	stage.style.display = "none";
	for (let i = 0; i < n; i++){
		const link = document.createElement("a");
		link.setAttribute("href", `/perf/mark/synthetic/${i}/`);
		stage.appendChild(link);
	}
	root.appendChild(stage);
	return () => root.removeChild(stage);
}

export default new Page({
	meta: import.meta,
	title: "mark()'s two sweeps",

	content(){
		code(source(Router.prototype.mark), "Router.mark() — read off the live prototype");
		code(source(Router.prototype.mark_links), "Router.mark_links()");

		p("Two `querySelectorAll` passes over the whole of `$app`, on every navigation. This is the part of the design that looks most like it should be expensive. It is — but not in the place everyone expects.").ac("note");

		section("On this document, as it stands");

		// await ready first: content() runs DURING render, when $app is still
		// detached and router.active is not yet assigned. Measuring then would
		// measure an empty document — and calling mark() would throw.
		measured(async () => {
			await this.app.ready;
			const root = this.app.$app.el;

			return [
				["anchors in $app right now", root.querySelectorAll("a[href]").length],
				["elements in $app", root.getElementsByTagName("*").length],
				["µs — querySelectorAll('.active-page, .active-ancestor')",
					per_call(9, 500, () => root.querySelectorAll(".active-page, .active-ancestor")).med * 1000],
				["µs — querySelectorAll('a[href]')",
					per_call(9, 500, () => root.querySelectorAll("a[href]")).med * 1000],
				["µs — the whole of router.mark()",
					per_call(9, 500, () => this.app.router.mark()).med * 1000],
			];
		}, "both sweeps, timed in batches of 500 because they are far too fast to time singly");

		p("Microseconds, at the size this site actually is. `mark()` runs once per navigation, and a navigation is already a repaint.").ac("note");

		section("Where does it stop being free?");

		gated(async () => {
			await this.app.ready;
			const root = this.app.$app.el;
			const rows = [];

			for (const n of [100, 1000, 5000, 20000]){
				const clean = stage_anchors(root, n);

				const find = per_call(5, 100, () => root.querySelectorAll("a[href]"));
				const classes = per_call(5, 100, () => root.querySelectorAll(".active-page, .active-ancestor"));
				const whole = per_call(5, 100, () => this.app.router.mark());

				clean();
				rows.push([n, classes.med * 1000, find.med * 1000, whole.med * 1000]);
			}

			return { head: ["anchors in $app", "class sweep µs", "link sweep µs", "whole mark() µs"], rows };
		}, "the two sweeps, and all of mark(), at 100 / 1000 / 5000 / 20000 anchors");

		p("The two sweeps stay cheap the whole way up — finding twenty thousand anchors costs a few hundred microseconds. `mark()` does not. Something between the sweep and the classes is costing two orders of magnitude more, so measure the inside of the loop.").ac("note");

		section("Inside mark_links()");

		gated(async () => {
			await this.app.ready;
			const root = this.app.$app.el;
			const here = this.url;
			const rows = [];

			for (const n of [1000, 5000, 20000]){
				const clean = stage_anchors(root, n);
				const links = [...root.querySelectorAll("a[href]")];

				// the loop, cut into the three things it actually does
				const parse = per_call(5, 20, () => { for (const l of links){ void l.origin; void l.pathname; } });
				const compare = per_call(5, 20, () => { let hit = 0;
					for (const l of links) if (l.getAttribute("href") === here) hit++; return hit; });
				const write = per_call(5, 20, () => { for (const l of links){
					l.classList.toggle("active", false); l.classList.toggle("in-path", false); } });
				const all = per_call(5, 20, () => this.app.router.mark_links(here));

				clean();
				rows.push([n, parse.med * 1000, compare.med * 1000, write.med * 1000, all.med * 1000]);
			}

			return { head: ["anchors", "read .origin/.pathname µs", "compare a string µs",
			                "two classList.toggle µs", "whole mark_links() µs"], rows };
		}, "the same loop, decomposed — which of the three is the cost?");

		p("`link.origin` and `link.pathname` are not properties, they are a URL parse. `mark_links()` reads both on every anchor on every navigation, so the cost is one URL parse per link per navigation — and that, not `querySelectorAll`, is the whole of the expense.").ac("note");

		section("For scale");

		measured(() => [
			["one 60fps frame, ms", 16.7],
			["mark() calls per navigation", 1],
			["µs — an empty loop body, for the clock floor", per_call(9, 20000, () => {}).med * 1000],
		], "what the numbers above have to fit inside");

		p("At this site's real size — around 70 anchors — `mark()` is a rounding error and no change is needed. The number worth writing down is the slope: it is linear in anchors, and a page with several thousand links would spend a visible part of a frame parsing urls it parsed on the last navigation too. The report proposes the one-line fix and predicts what it saves.").ac("note");

		div.c("row", () => {
			a.c("page-link", ":has() recalc →").href("/perf/css/");
			a.c("page-link", "first paint →").href("/perf/paint/");
		});
	},
});
