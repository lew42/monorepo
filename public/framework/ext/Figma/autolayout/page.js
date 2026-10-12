import { Page, View, div, p } from "/app.js";

View.stylesheet(import.meta, "autolayout.css");

const SMALL = "Omg, I’m so small.";

// One pane: a column stack with a big word and the small line
function pane(big, grey = false) {
	div.c(grey ? "aut-pane-grey" : "aut-pane", () => {
		p.c("aut-big", big);
		p.c("aut-small", SMALL);
	});
}

export default new Page({
	meta: import.meta,
	title: "Auto layout",
	icon: "view_column",
	width: "full",
	description: "Four slides showing Figma auto layout: absolute text, vertical stack, and horizontal panes.",
	content() {
		// Slide 1
		p.c("aut-caption", "no auto layout, absolute text");
		div.c("aut-slide-1", () => {
			p.c("aut-whoa", "whoa");
		});

		// Slide 2
		p.c("aut-caption", "vertical auto layout, gap 10, padding 120");
		div.c("aut-slide-2", () => {
			p.c("aut-big", "shift a = auto layout");
			p.c("aut-small", SMALL);
		});

		// Slide 3
		p.c("aut-caption", "horizontal auto layout, two FIXED 960 panes");
		div.c("aut-slide-3", () => {
			pane("50");
			pane("50", true);
		});

		// Slide 4
		p.c("aut-caption", "horizontal auto layout, three FILL panes");
		div.c("aut-slide-4", () => {
			pane("33");
			pane("33", true);
			pane("33");
		});
	},
});
