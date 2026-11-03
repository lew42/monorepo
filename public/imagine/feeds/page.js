import { Page, View, md } from "/app.js";

// Container: /imagine/'s row — a columns host stretches above me, so this page is
// one more column in it. Size: `large` (28-64em) — three cards want a row, not the
// 40em default track. Own layout: previews() wall, same shape as gallery/ and vary/.
// `index: true` because content() already draws the three children as cards — without
// it core's column() repeats them a second time as a plain link list right underneath
// (found live 2026-09-04: Video/Data/Live shown twice, same fix as gallery/, design/).
// Regions: one. Preview: default card, now a real still per child (2026-09-05
// rethink — see each child's own preview() override) instead of a bare icon.
//
// 2026-09-05: tried `expand` (an accordion, one row per child, in place of the
// launch-to-a-new-column click) as the surface-change alternative — reverted.
// Built and measured: collapsed it hid every real still behind a bare text row;
// opened, one child alone stood 480px tall at 3440 (vs ~340px for all three as
// cards) while the OTHER two showed nothing. It also fails on its own terms —
// paging's own doc (`/imagine/paging/`) calls `expand` wrong "when the thing you
// opened has children of its own" and has "no url to link to" — true of all
// three of these (readme.md: "every variation is a real page you can link to").
// doc/decisions.md.
View.stylesheet(import.meta, "feeds.css");

export default new Page({
	meta: import.meta,
	title: "Feeds",
	description: "Embeds and data-driven pages — a YouTube picker, one dataset drawn three ways, one live API.",
	icon: "dynamic_feed",
	width: "large",
	index: true,
	children: "video data live",

	content(){
		md("Three feeds, three shapes of content this repo does not author: an embed you have to ask for, a JSON file rendered three ways, and a live public API. Click through — each ends in a one-line verdict.");
		this.previews();
	},
});
