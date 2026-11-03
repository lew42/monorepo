import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/vocabulary/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/vocabulary/](/framework/styles/system/studies/vocabulary/) — the tag vocabulary — 29 tags on 4 axes."); },
});
