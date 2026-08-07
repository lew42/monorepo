import { Page, md, demo, code, div, p, h2, span } from "/app.js";
import sample from "../sample.js";

export default new Page({
	meta: import.meta,
	title: "Breakout",
	description: "A measured page that can let one thing out.",
	icon: "unfold_more",
	classes: "breakouts",

	content(){
		md("This page is `classes: \"breakouts\"`. The prose you are reading is in the measure. The two blocks below are not.");

		code.js(`classes: "breakouts",
content(){
    md("prose");
    demo(chart).ac("wide");
    div.c("bleed", () => banner());
}`);

		md("**`.wide` takes the measure plus the two `--breakout` tracks beside it** — enough for a demo, a wide table, or two columns that would be cramped in a reading column:");

		demo(sample.dashboard, "This box is `.ac(\"wide\")`. Scroll up: it starts left of the paragraph above it and ends right of it.").ac("wide");

		md("**`.bleed` takes everything**, edge to edge, including the page's own inset:");

		div.c("bleed pad", () => {
			p.c("h3", "Edge to edge");
			p("A banner, a hero, a full-width image. The outer tracks collapsed to zero to make room, which is why this cannot overflow the way a negative margin would.");
		}).style({ background: "var(--wash)", borderBlock: "1px solid var(--line)" });

		md("And prose resumes in the measure, with nothing to reset — a breakout is a *column assignment*, not a state.");

		h2("Why not negative margins");

		md("`margin-inline: -7em` renders identically **until the window is narrower than the measure**, and then it is horizontal overflow on every page that used it. Containing it means `overflow: hidden` on the page, which kills a sticky ToC in the same stroke.");

		md("Grid tracks cannot do that. The outer track is `minmax(--page-pad, 1fr)` and the breakout tracks are `minmax(0, 7em)`, so at any width the page cannot ask for more room than it has — the tracks give up their space in order, and the measure is the last to shrink.");

		md("← [Page layouts](/framework/core/Page/layouts/)");
	}
});
