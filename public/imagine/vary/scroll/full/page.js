import { Page, p, md } from "/app.js";

// Container: its own columns() row — a `small` rail plus one `full` child, the
// doc's own pairing (core/Page/overview/columns/finder): every real `width:
// "full"` usage in the codebase is a NESTED child, never the host itself — a
// lone `width: "full"` HOST collapsed the site's own sidebar to 0 width
// (measured 2026-08-29, an untested combination, not this fence's to fix).
// Size: rail 14em, `Content` claims the whole row on arrival (`default`). Own
// layout: the column's default `.page-column-prose flow`. Regions: two
// columns, one shown at a time. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Full-viewport",
	description: "One column claims the whole row — its scrollbar reads as an ordinary page scrolling.",
	icon: "crop_free",
	width: "small",

	initialize(){ this.columns(); },

	content(){ md('`width: "full"` — the column to the right claims the whole row on arrival; the rail collapses into the crumb strip above it.'); },

	children: {
		Content: {
			width: "full", classes: "default",
			content(){
				md("No rail beside it, no gutter around it. A hundred short lines, nothing else on screen.");
				for (let i = 1; i <= 100; i++) p(`Line ${i} — enough text to force real height, nothing else to say.`);
				md("**Verdict:** a full-viewport scrollbar reads as an ordinary page scrolling, not a widget bolted onto one — scrolling column pages are fine once the scrollbar owns the whole edge.");
			},
		},
	},
});
