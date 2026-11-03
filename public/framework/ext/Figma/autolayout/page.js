import { Page, View, div, p } from "/app.js";
View.stylesheet(import.meta, "../scheme.css");

View.stylesheet(import.meta, "autolayout.css");

const SMALL = "Omg, I’m so small.";

// One pane: a column stack with a big word and the small line
function pane(big, ground = "bg-white") {
	div.c(`aut-pane ${ground}`.trim(), () => {
		p.c("h1", big);
		p.c("muted", SMALL);
	});
}

export default new Page({
	meta: import.meta,
	classes: "figma-scheme",
	title: "Auto layout",
	icon: "view_column",
	width: "full",
	description: "Four slides showing Figma auto layout: absolute text, vertical stack, and horizontal panes.",
	content() {
		// Slide 1
		p.c("muted aut-caption", "no auto layout, absolute text");
		div.c("bg-white aut-slide aut-slide-1", () => {
			p.c("h1", "whoa");
		});

		// Slide 2
		p.c("muted aut-caption", "vertical auto layout, gap 10, padding 120");
		div.c("bg-white aut-slide aut-slide-2", () => {
			p.c("h1", "shift a = auto layout");
			p.c("muted", SMALL);
		});

		// Slide 3
		p.c("muted aut-caption", "horizontal auto layout, two FIXED 960 panes");
		div.c("aut-slide aut-slide-row", () => {
			pane("50");
			pane("50", "bg-darken");
		});

		// Slide 4
		p.c("muted aut-caption", "horizontal auto layout, three FILL panes");
		div.c("aut-slide aut-slide-row", () => {
			pane("33");
			pane("33", "bg-darken");
			pane("33");
		});
	},
});
