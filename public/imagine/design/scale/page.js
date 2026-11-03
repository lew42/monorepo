import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/scale/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/scale/](/framework/styles/system/studies/scale/) — how a scale is built and why an even one reads as even."); },
});
