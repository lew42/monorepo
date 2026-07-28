import { h2, p, div, strong } from "/app.js";
import Page from "../lib/Page.js";
import { demo, snippet, note, api, cards } from "../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("`framework.css` is 110 lines and it is the only stylesheet you get by default. It does three things and then stops.");

		cards("/arya/styles/html/", "/arya/styles/forms/", "/arya/styles/flex/", "/arya/styles/grid/", "/arya/styles/build/");

		h2("Three layers");

		p("The file opens with `@layer base, theme, util;`, which fixes the specificity problem before it starts. Anything you write outside a layer beats all three, so your own CSS wins without `!important` and without counting selectors.");

		api({
			"base": "the reset — border-box, no body margin, sane media and form defaults",
			"theme": "the look — colours, focus rings, input borders, buttons",
			"util": "the classes you actually type — `pad`, `flex`, `grid`, `gap`, `mb`"
		});

		note(p("If you want your stylesheet to lose to the framework on purpose, wrap it in `@layer theme { ... }` like mine does. Otherwise just write plain CSS and it wins."));

		h2("Four variables");

		p("The whole palette is this:");

		snippet(`--prim: #5a57ff;            /* accent, focus rings, .prim buttons */
--bg: #42404B;             /* the dark surface used by .bg buttons */
--subtle: rgba(0,0,0,0.5); /* input borders */
--column: 14em;            /* the width every layout utility wraps at */`);

		demo(() => {
			div.c("flex gap", () => {
				div.c("pad", "--prim").style({ background: "var(--prim)", color: "white" });
				div.c("pad", "--bg").style({ background: "var(--bg)", color: "white" });
				div.c("pad", "--subtle").style({ border: "1px solid var(--subtle)" });
			});
		});

		p(strong("`--column` is the important one."), " Both the flex and the grid helpers wrap when a column would get narrower than it, so setting `--column` on a container is how you tune a layout — not media queries.");

		h2("Everything is opt-in");

		p("A fresh page has a reset, readable type, styled form controls, and nothing else. No container, no padding, no colours. That is deliberate: you add `pad` when you want padding, and it is obvious from the markup where it came from.");

		demo(() => {
			div("no class");
			div.c("pad", "class pad").style("outline", "1px dashed #999");
			div.c("pad mb", "class pad mb").style("outline", "1px dashed #999");
			div("after");
		});

		h2("The full utility list");

		api({
			".pad / .all-pad": "1em of padding, on the element or on each child",
			".mb": "1em of bottom margin",
			".flex": "plus `v` `wrap` `auto` `three` `split` `h-center` `v-center` `reverse` `all-1`",
			".grid": "plus `auto` and `three`",
			".gap / .gap-2em": "1em or 2em, works on flex and grid",
			".flex-1": "let this child take the leftover space",
			".btn": "give a link the button look — pair with `prim` or `bg`",
			".capitalize / .uppercase": "text-transform",
			".zoom-50 … .zoom-200": "scale a whole subtree, handy for previews",
			"textarea.auto": "height follows the content"
		});

		p("That is the entire vocabulary. The next five pages show each group running.");
	}
});
