import { Page, demo, md, div, p } from "/app.js";

const band = (track, text) => div.c(track + " pad wash flow", () => {
	p.c("h4", "." + track);
	p(text);
});

const atlas = () => new Page({
	title: "Atlas",
	icon: "map",

	content(){
		md("Prose lands on **main** — the measure, and nothing wider. It is the only track a page gets without asking for one.");

		band("wide", "One class, and the block spends the breakout track on its right. This is where an exhibit goes: a demo, a diagram, a table with eight columns.");

		md("Back on **main**, at exactly the width it was before. The reading column never moves — that is what a template buys over a per-block width.");

		band("bleed", "The whole page, gutters included. A wall of cards, a stage, a band of colour: things that want the region rather than the column.");

		md("**Every block starts on the same left edge.** The wider ones grow rightward; only `.bleed` reaches back through the gutter, because it is the page's own width by definition.");
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "The page",
	icon: "table_rows",

	tree: atlas,
	height: "34em",

	content(){
		this.stage().ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**The measure is for reading; what you look at leaves it.** A standard page is a four-track grid — gutter, measure, breakout, gutter — and a block claims a wider one with a single class. `.wide` spends the breakout; `.bleed` spends everything, gutters included. **Drag the stage wide:** the reading column holds while the two bands keep growing, because `--breakout` is the responsive one and `--measure` never is.");

		md("**The tracks are anchored left, and that is the whole composition.** The gutter is fixed (`clamp(2em, 4%, 5em)`) and every leftover pixel goes to the right, so a title, a paragraph and a wall of cards all start on one line and the wide things grow away from it. A page that mixed a centred column with an edge-to-edge wall was reading as two compositions at once.");

		md("Reference: [Page](/framework/core/Page/) — the template and its tokens · [Page shapes](/framework/styles/layouts/fit/) — `standard`, `pad`, `full`, `fill`.");
	},
}));
