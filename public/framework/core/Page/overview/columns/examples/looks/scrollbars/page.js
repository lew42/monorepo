import { Page, demo, div, p, h4, md } from "/app.js";

/* Container: examples/looks child, `wide` for three boxes side by side. Size: each
   box is a two-column `width:"small"` rail + content pair, ~28em plus chrome. Own
   layout: `wall wide`. Regions: one. Preview: default card. */

const long = n => () => { for (let i = 1; i <= n; i++) p(`Line ${i} — enough text to force real height, nothing else to say.`); };

function tree(title, longChild){
	const root = new Page({
		title,
		width: "small",
		initialize(){ this.columns(); },
		content(){ p("Rail."); },
		children: { Long: { content: longChild } },
	});

	return root.children.get("long");
}

const broken  = () => tree("Broken",  long(24));
const fixed   = () => tree("Fixed",   () => { p("Only this bounded region scrolls:"); div.c("looks-scroll flow", long(24)); });

function connected(){
	const root = new Page({
		title: "Rail",
		width: "small",
		initialize(){ this.columns(); },
		content(){ p("Short rail."); },
		children: {
			Intro(){ p("Short content, no bg override — one hairline is the only seam."); },
			Notes(){ p("Same story."); },
		},
	});
	return root.children.get("intro");
}

function box(label, page, height){
	div.c("flex v gap", () => {
		h4(label);
		demo.app(page).style("height", height);
	});
}

export default new Page({
	meta: import.meta,
	title: "Seams + scrollbars",
	description: "A scrollbar is a decision — an accidental one breaks the column boundary; a deliberate one doesn't.",
	icon: "vertical_split",

	content(){
		md("`.page-column-body` auto-scrolls by design (doc/columns.md) — that's fine until the WHOLE column overflows and the browser's own scrollbar lands right on the column's `border-inline-end` hairline, doubling the seam. The fix isn't shorter content everywhere; it's giving the overflow its own bounded, inset region so the column's outer edge never has to carry it.");

		div.c("wall wide", () => {
			box("Broken — the whole column scrolls", broken(), "13em");
			box("Fixed — a bounded, inset scroll region", fixed(), "19em");
			box("Connected — short content, no seam", connected(), "16em");
		}).style("--column", "36em");   // rail (14em) + content (16-40em) both visible needs > the 32em row threshold (Page.css)

		md("**Verdict:** the broken column's scrollbar sits on top of its own border and reads as a doubled edge; a `looks-scroll` sub-region keeps the outer seam a single clean hairline, and staying short avoids the question entirely.");
	},
});
