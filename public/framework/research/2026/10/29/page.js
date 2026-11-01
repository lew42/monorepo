import { Page, md } from "/app.js";

// One date level of research/YYYY/MM/DD/<topic>/: links to what's under it, newest first (research/readme.md).
export default new Page({
	meta: import.meta,
	title: "October 29, 2026",
	icon: "today",
	description: "Research started on October 29, 2026.",
	children: "persistence-sync",

	content(){
		md("- [Persistence & sync research](persistence-sync/): build or buy the save, sync and streaming layer? Keep the Item / List / Page core and fix it.");
	},
});
