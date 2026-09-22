import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/padding/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/padding/](/framework/styles/system/studies/padding/) — padding on its own, and the one rule: a box that paints its own ground is padded."); },
});
