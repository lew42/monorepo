import { Page, md, demo, div, h3, p } from "/app.js";

// The template, verbatim — one panel, drawn inside `.ui-scale` at two different
// widths, so the SAME markup and the SAME `em` numbers read at two sizes with no
// media query and no second stylesheet.
const box = () => div.c("ui-scale", () => {
	div.c("ui-scale-body surface pad", () => {
		h3("A fixed design").style({ margin: "0 0 0.5em", fontSize: "1.6em" });
		p("Every size in here is `em` — shrink the container and the whole panel shrinks together, in proportion, instead of wrapping onto more lines.").style({ margin: 0, fontSize: "1em" });
	});
}).style("--scale-width", "20");   // a small demo design: 320px / 16 = 20

export default new Page({
	meta: import.meta,
	title: "Scale",
	description: "Shrink a fixed mockup to fit a narrow box, in proportion — never reflow it.",
	icon: "photo_size_select_small",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(box, steer).ac("bleed"),
			def: box,
			file: new URL("page.js", import.meta.url).pathname,
			note: "Drag the stage narrower: the panel's text and padding shrink together, all the way down to `--scale-min` (7px), and grow back up to `--scale-max` (16px) — it never reflows or wraps differently, because nothing inside `.ui-scale-body` measures the viewport, only its own container.",
		});

		md("## Two widths, one panel");

		md("The row below is the exact same `box()` call, once inside a 320px wrapper and once inside an 856px one — `--scale-width` is `20` here (320 / 16), so the panel is at its full 16px size in the wide box and shrunk in the narrow one.");

		div.c("flex gap wrap", () => {
			div.c("flex v gap", box).style({ width: "320px" });
			div.c("flex v gap", box).style({ width: "856px", maxWidth: "100%" });
		});

		md("Built for the Figma \"Sept 2026\" recreations, where a 856px-wide design had to fit a ~400px card column without reflowing what the Figma actually drew: [`/framework/ai2/2026/09/28/figma-sept-2026/`](/framework/ai2/2026/09/28/figma-sept-2026/).");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", box)); },
});
