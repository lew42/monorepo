import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/spacing/nesting/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/spacing/nesting/](/framework/styles/system/studies/spacing/nesting/) — the four-variant comparison for nested spacing."); },
});
