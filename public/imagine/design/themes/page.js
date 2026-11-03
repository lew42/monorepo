import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/themes/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/themes/](/framework/styles/system/studies/themes/) — the theme dropdown, and what a theme is allowed to retune."); },
});
