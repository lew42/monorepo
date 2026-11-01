import { Page, md } from "/app.js";

// One date level of research/YYYY/MM/DD/<topic>/: links to what's under it, newest first (research/readme.md).
export default new Page({
	meta: import.meta,
	title: "October 2026",
	icon: "calendar_month",
	description: "Research filed in October 2026, by day.",
	children: "29",

	content(){
		md("- [October 29, 2026](29/): Persistence & sync, build or buy");
	},
});
