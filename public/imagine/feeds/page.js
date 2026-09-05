import { Page, View, md } from "/app.js";

// Container: /imagine/'s row — a columns host stretches above me, so this page is
// one more column in it. Size: `large` (28-64em) — three cards want a row, not the
// 40em default track. Own layout: previews() wall, same shape as gallery/ and vary/.
// `index: true` because content() already draws the three children as cards — without
// it core's column() repeats them a second time as a plain link list right underneath
// (found live 2026-09-04: Video/Data/Live shown twice, same fix as gallery/, design/).
// Regions: one. Preview: default card.
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
