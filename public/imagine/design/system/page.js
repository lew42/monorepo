import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/system/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/system/](/framework/styles/system/studies/system/) — a proposal for the padding/scale/layout system, written against the tool."); },
});
