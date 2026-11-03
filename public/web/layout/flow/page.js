import { Page, demo, md, div, p, h3 } from "/app.js";
import layout from "/framework/ext/layout/layout.js";

const article = () => {
	h3("Blocks stack, for free");
	p("A `p`, an `h3`, a `div` — each takes a full line and the next starts under it. That is normal document flow, and you get it by writing nothing at all.");
	p("What it does not give you is air. No element here carries a margin: the framework evicted them, because a paragraph cannot know what it is inside.");
	h3("Rhythm belongs to the box");
	p("`flow` zeroes its children's block margins and puts `--flow` between them instead — so an area that changes its font size retunes its own rhythm, and depth stops mattering.");
};

const box = () => div.c("flow measure pad wash", article).style("--measure", "30em");

export default new Page({
	meta: import.meta,
	group: "Reading",
	icon: "reorder",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", box)); },

	content(){
		div.c("layout bleed", () => {
			const $box = box();
			layout.bar($box, "flow");
		});

		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Click `flow` off.** The blocks are still stacked — that costs nothing and always worked — but they touch, because nothing on this site puts a margin on a paragraph. Rhythm is a property of the *container*: `flow` zeroes its children's block margins and spaces between them with one unregistered token, `--flow: 2em`, which resolves at each child so a heading takes air in proportion to its own size.");

		md("Every `.page` and every `md()` block already wears it, so you inherit the rhythm by doing nothing. Where it does **not** belong is inside a component: a laid-out box owns its spacing with `gap`, and page rhythm in a card once put an eyebrow 32px from its own title.");

		md("Reference: [Stack](/framework/styles/layouts/stack/) — the flow rules in full · [Text](/framework/styles/elements/text/) — the type scale they space.");
	},
});
