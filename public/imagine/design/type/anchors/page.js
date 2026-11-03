import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/type/anchors/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/type/anchors/](/framework/styles/system/studies/type/anchors/) — the repeated anchor mark, measured."); },
});
