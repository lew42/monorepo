import { Page, md } from "/app.js";

// One date level of research/YYYY/MM/DD/<topic>/: links to what's under it, newest first (research/readme.md).
export default new Page({
	meta: import.meta,
	title: "2026",
	icon: "calendar_month",
	description: "Research filed in 2026, by month.",
	children: "10",

	content(){
		md("- [October 2026](10/): 1 project");
	},
});
