import { Page, View, p, div, button } from "/app.js";
import { section, file, code } from "../ui.js";
import { install, remove, installed } from "./direction.js";

View.stylesheet(import.meta, "direction.css");

/* One row with all three moves the Router can make: up, sideways, down. Written
 * once rather than five times inline, because the point of this page is the
 * MOTION between these pages, not their content. */
function level(page){
	div.c("motion-level", () => {
		page.parent.link("↑ " + page.parent.title);
		page.parent.children.forEach(sib => sib && sib !== page && sib.link("→ " + sib.title));
		page.children.forEach(child => child && child.link("↓ " + child.title));
	});

	probe(page);
}

// the attribute, read out of the DOM on demand — the reader's browser, not mine
function probe(page){
	const $readout = div.c("motion-readout", "—");

	div.c("motion-controls", () => button.c("motion-btn", "read data-direction")
		.click(() => $readout.text(`.pages[data-direction] = ${page.app.$pages.attr("data-direction") ?? "(not set)"}`)));
}

export default new Page({
	meta: import.meta,
	title: "Deeper or back",
	classes: "motion motion-slide",

	// two branches, because "across" only exists if there is somewhere to go
	// sideways TO. Each has a child, so all three moves are reachable.
	initialize(){
		this.add("deep", {
			title: "Down here",
			classes: "motion motion-slide",
			content(){ level(this); },
			initialize(){ this.add("deeper", { title: "Deeper still", classes: "motion motion-slide", content(){ level(this); } }); },
		});

		this.add("wide", {
			title: "Over here",
			classes: "motion motion-slide",
			content(){ level(this); },
			initialize(){ this.add("further", { title: "Further over", classes: "motion motion-slide", content(){ level(this); } }); },
		});
	},

	content(){
		div.c("motion-level", () => this.children.forEach(child => child && child.link("↓ " + child.title)));

		probe(this);

		p("Walk down, back up, and sideways between the two branches. The page arriving moves from the side you came from — and neither page, nor `Page`, nor `Router` was told which way you went.").ac("note");

		file(import.meta, "direction.js");

		section("Three words, by subtraction");

		code.fn(() => {
			from.length === shared;   // I only ADDED segments      -> deeper
			to.length === shared;     // I only REMOVED segments    -> back
			// both differ            // I swapped a branch         -> across
			// from is empty          // first paint                -> cold
		});

		p("Nothing is remembered between navigations, so nothing can go stale. That is the difference between this and the `data-mode` attribute the readme deleted: `mode` was a resolved, remembered, must-be-unset property; `direction` is two lengths and a comparison.").ac("note");

		file(import.meta, "direction.css");

		section("The cost of getting it for free");

		code.fn(() => {
			// the patch, because it stands OUTSIDE activate()
			const from = this.chain(), to = page.chain();
			const shared = this.shared_depth(from, to);

			// activate(), one stack frame later, computing exactly the same three
			const from2 = this.chain(), to2 = page.chain();
			const shared2 = this.shared_depth(from2, to2);
		});

		p("Twice, every navigation. `chain()` walks `.parent` to the root, so the second derivation is O(depth) — trivial in cost and irritating in principle: the answer existed and was thrown away one line before it was recomputed.").ac("note motion-warn");

		section("The proposed diff — one line, one method");

		code.js(`
// Router.activate(), one line after \`shared\` is computed
this.app.$pages.attr("data-direction", this.direction(from, to, shared));

// and the method it calls — the only thing in this tier that knows a
// navigation has a shape as well as a destination
direction(from, to, shared){
    if (!from.length) return "cold";
    if (from.length === shared) return "deeper";
    if (to.length === shared) return "back";
    return "across";
}`);

		section("What it costs in this codebase's currency");

		code.css(`
+  one method name on Router          direction(from, to, shared)
+  one attribute name                 .pages[data-direction]
+  one claim the tier does not make   "how you got here", not just "where you are"

−  no state. Nothing to unset, nothing to keep in sync, nothing to resolve.
−  no new page property. A page still declares nothing and knows nothing.`);

		p("The third line is the real one. `new/1`'s boast is that `Router.mark()` writes exactly two classes and that every arrangement is CSS somebody opted into by name. A direction attribute is a third thing the tier asserts, and it asserts something about the *journey* rather than the *position* — which is a genuinely new kind of claim. Worth it for motion; not obviously worth it for anything else.").ac("note motion-verdict");

		section("Dissent, recorded");

		p("An attribute rather than a class, because a class would have to be removed — `rc(\"deeper back across cold\")` is exactly the remembered-list smell that killed `mode`. Overwriting one attribute needs no cleanup and cannot desynchronise. If the council prefers classes, it should also accept the removal list.").ac("note");

		section("Next");

		p("`/motion/arrangements/` — replace, columns, tabs and full want four different motions, and none of them wants a new property.").ac("note");
	},

	/* Installed on ACTIVATION, not in content(), because content() runs once and a
	 * reader who leaves and comes back would find the patch gone. This is the
	 * override-with-no-super wart /motion/view-transitions/ describes. */
	activate(){
		install(this.app.router, this.app.$pages);
		return Page.prototype.activate.call(this);
	},

	deactivate(){
		remove(this.app.router, this.app.$pages);
		return Page.prototype.deactivate.call(this);
	},
});
