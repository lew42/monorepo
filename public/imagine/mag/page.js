import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/labs/mag/.",
	content(){ md("**This page moved.** It is now [/layouts/labs/mag/](/layouts/labs/mag/) — *The Column*, a magazine cover and six real articles."); },
});
