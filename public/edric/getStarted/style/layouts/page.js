import { Page, h2, md, demo } from "/app.js";

import cards from "/framework/styles/layouts/cards/layout.js";
import centered from "/framework/styles/layouts/centered/layout.js";
import dashboard from "/framework/styles/layouts/dashboard/layout.js";
import holyGrail from "/framework/styles/layouts/holy-grail/layout.js";
import masthead from "/framework/styles/layouts/masthead/layout.js";
import sidebar from "/framework/styles/layouts/sidebar/layout.js";
import split from "/framework/styles/layouts/split/layout.js";
import stack from "/framework/styles/layouts/stack/layout.js";

// Real layouts, borrowed straight from framework/styles/layouts/: each one's
// own layout.js, unmodified.
const layouts = [
	{ title: "Cards", fn: cards, desc: "An auto-fill card wall, one class, no stylesheet, no media query." },
	{ title: "Centered", fn: centered, desc: "A measure of prose, centred, the one rule utilities can't spell." },
	{ title: "Dashboard", fn: dashboard, desc: "Stat tiles over a wide panel and a rail, a grid retuned by one token." },
	{ title: "Holy grail", fn: holyGrail, desc: "Header, sidebar, main, aside, footer, the five-region page." },
	{ title: "Masthead", fn: masthead, desc: "Hero over a feature row, a landing page, and not one line of CSS." },
	{ title: "Sidebar", fn: sidebar, desc: "A fixed panel beside fluid content, two classes and one rule." },
	{ title: "Split", fn: split, desc: "Two equal panes that stack themselves, no CSS, no breakpoint." },
	{ title: "Stack", fn: stack, desc: "Vertical rhythm, and a form that needed none of its own CSS." },
];

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "Whole-page arrangements, each one a class or two, not a stylesheet.",

	content(){
		layouts.forEach(l => {
			h2(l.title).ac("mb");
			demo(l.fn, l.desc).ac("mb");
		});

		h2("Fit").ac("mb");
		md("A page picks how it holds whichever of the above it uses, with one word: `classes: \"grid\"` for prose that occasionally breaks out wide, `\"pad\"` for a wall like the ones above, `\"full\"` when the layout IS the page. Nothing to override, `--measure` and `--page-pad` are the whole mechanism.").ac("mb");

		md("Back to [Style](/edric/getStarted/style/).");
	}
});