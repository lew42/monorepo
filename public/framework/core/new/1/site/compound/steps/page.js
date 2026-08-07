import { Page, p, div, a, input } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

/* STEPS — a navigation type the framework has no name for, and needs no
 * mechanism for. A stepper is a tab set whose bar is numbered and whose pages
 * know their neighbours. Both of those are derived from `children` order, so
 * inserting a step between two others rewires the numbering AND both of its
 * neighbours' links, and no file mentions a step it isn't.
 */
export default new Page({
	meta: import.meta,
	title: "Steps",

	initialize(){
		this.add("account", {
			title: "Account",
			content(){
				p("Sequential navigation: one page at a time, in a fixed order, with a sense of progress. Every step below is inline — this whole flow is one file.");
				div.c("row", () => input().attr("placeholder", "name"));
				this.parent.step_bar(this);
			}
		});

		this.add("plan", {
			title: "Plan",
			content(){
				p("The bar above is `tabs()`. The numbers are a CSS counter. Nothing in the framework knows this is a sequence — order is the only thing a stepper needs, and `children` is already ordered.");
				this.parent.step_bar(this);
			}
		});

		this.add("payment", {
			title: "Payment",
			content(){
				p("Type in the box on step 1 and come back: the value is still there. Pages are built once, so a half-filled form survives moving through the flow — and the url still says exactly which step you are on.");
				this.parent.step_bar(this);
			}
		});

		this.add("done", {
			title: "Done",
			content(){
				p("Last step, so `step_bar()` renders no `next`. It didn't have to be told it was last; it counted.");
				this.parent.step_bar(this);
			}
		});

		/* Free here, and only here: every child is already in memory, so this
		 * imports nothing and just lets tabs() label the bar with real titles
		 * instead of declared names. On LAZY children it would cost the laziness,
		 * which is why it is not the default. */
		this.load_all_children();
	},

	/* Prev and next ARE the declaration order — no page links to a name anyone
	 * typed. Insert a step in initialize() and both neighbours rewire themselves.
	 */
	step_bar(step){
		const names = [...this.children.keys()];
		const i = names.indexOf(step.name);
		const step_link = (name, text) => a.c("page-link", text).href(this.url + name + "/");

		p.c("note", `Step ${i + 1} of ${names.length}`);

		return div.c("row", () => {
			if (i > 0) step_link(names[i - 1], "← " + this.children.get(names[i - 1]).title);
			if (i < names.length - 1) step_link(names[i + 1], this.children.get(names[i + 1]).title + " →");
		});
	},

	content(){
		when("a task is linear and the reader needs to know how far along they are — onboarding, checkout, a long form in parts, a tutorial.");

		this.$steps = this.tabs("account plan payment done").ac("steps");

		section("The file");

		this_file(import.meta);

		p("`tabs()` gives the whole thing for free: the bar, the panel, and — because the first tab's link IS this page's url — a `/compound/steps/` that already shows step 1. No redirect, and none of the `redirect()` machinery the readme records backing out.").ac("note");

		cost("the bar lets you jump to step 4 from step 1. A stepper that must gate progress needs state a url cannot carry, and at that point it is not this pattern any more.");
	}
});
