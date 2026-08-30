import { Page, View, md } from "/app.js";

// Container: /imagine/'s row — a columns host stretches above me, so this page is
// one more column in it. Size: default track (16-40em). Own layout: previews()
// wall, same shape as gallery/ and vary/. Regions: one. Preview: default card.
View.stylesheet(import.meta, "feeds.css");

export default new Page({
	meta: import.meta,
	title: "Feeds",
	description: "Embeds and data-driven pages — a YouTube picker, one dataset drawn three ways, one live API.",
	icon: "dynamic_feed",
	children: "video data live",

	content(){
		md("Three feeds, three shapes of content this repo does not author: an embed you have to ask for, a JSON file rendered three ways, and a live public API. Click through — each ends in a one-line verdict.");
		this.previews();
	},
});
