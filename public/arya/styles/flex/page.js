import { h2, p, div, strong, a } from "/app.js";
import Page from "../../lib/Page.js";
import { demo, snippet, note, api } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Eleven classes, all on the parent. `box` in these examples is my own class, just something with a background so you can see the boxes.");

		api({
			".flex": "display: flex",
			".gap / .gap-2em": "1em or 2em between children",
			".v": "stack vertically",
			".reverse": "right to left",
			".wrap": "allow wrapping",
			".auto": "children wrap when they would go under `--column`",
			".three": "three across, then one per line — nothing in between",
			".split": "first child left, last child right",
			".h-center / .v-center": "centre along or across the main axis",
			".all-1": "every child takes an equal share",
			".flex-1": "on a child — take the leftover space"
		});

		h2("flex gap");

		demo(() => {
			div.c("flex gap", () => {
				div.c("box", "one");
				div.c("box", "two");
				div.c("box", "three");
			});
		});

		h2("v");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("box", "one");
				div.c("box", "two");
			});
		});

		h2("all-1");

		p("Equal columns, regardless of content length.");

		demo(() => {
			div.c("flex gap all-1", () => {
				div.c("box", "short");
				div.c("box", "a rather longer piece of text");
				div.c("box", "mid");
			});
		});

		h2("flex-1");

		p("The same idea, but on one child. Everything else keeps its natural width.");

		demo(() => {
			div.c("flex gap", () => {
				div.c("box", "fixed");
				div.c("box flex-1", "flex-1 — I take the rest");
				div.c("box", "fixed");
			});
		});

		h2("split");

		p("The header pattern. Works with any number of children — it spreads them, so two is the common case.");

		demo(() => {
			div.c("flex split v-center", () => {
				div.c("box", "logo");
				div.c("box", "menu");
			});
		});

		h2("v-center");

		p("Children of different heights line up on their centres.");

		demo(() => {
			div.c("flex gap v-center", () => {
				div.c("box tall", "tall");
				div.c("box", "short");
				div.c("box", "short");
			});
		});

		h2("auto — the one to remember");

		p("`.flex.auto` sets `flex: 1 1 var(--column)` on every child. Each one wants to be `--column` wide, grows to fill a row, and drops to the next line when it cannot. ", strong("This is responsive layout without a single media query."));

		demo(() => {
			div.c("flex auto gap", () => {
				div.c("box", "auto one");
				div.c("box", "auto two");
				div.c("box", "auto three");
				div.c("box", "auto four");
			});
		});

		p("Change where it breaks by setting `--column` on the container:");

		demo(() => {
			div.c("flex auto gap", () => {
				div.c("box", "narrow columns");
				div.c("box", "wrap later");
				div.c("box", "because --column");
				div.c("box", "is only 7em");
			}).style("--column", "7em");
		});

		h2("three");

		p("Three across or one per line, never two. The trick is a `flex-basis` that goes hugely negative below the threshold and hugely positive above it, so there is no in-between state.");

		snippet(`.flex.three > * {
    flex: 1 1 calc(((var(--column) * 3) - 100%) * 999);
}`);

		demo(() => {
			div.c("flex three gap", () => {
				div.c("box", "one");
				div.c("box", "two");
				div.c("box", "three");
			});
		});

		note(p("`.flex > * { margin: 0 }` is in the util layer, so paragraphs and headings lose their margins the moment you put them in a flex container. Use `gap` for spacing instead — that is the intent, but it catches you out the first time a heading collapses."));

		h2("Putting it together");

		p("A toolbar, using nothing but these classes:");

		demo(() => {
			div.c("flex split v-center gap", () => {
				div.c("flex gap v-center", () => {
					div.c("box", "Logo");
					a("Docs").href("#");
					a("Pricing").href("#");
				});
				div.c("flex gap", () => {
					a("Log in").ac("btn").href("#");
					a("Sign up").ac("btn prim").href("#");
				});
			});
		});

		p("Same ideas in CSS grid on the ", a("Grid").href("/arya/styles/grid/"), " page.");
	}
});
