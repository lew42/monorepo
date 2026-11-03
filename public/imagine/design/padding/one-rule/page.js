import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/padding/one-rule/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/padding/one-rule/](/framework/styles/system/studies/padding/one-rule/) — one declaration, every framed box."); },
});
