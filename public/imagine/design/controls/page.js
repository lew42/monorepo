import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/ui/controls/study/.",
	content(){ md("**This page moved.** It is now [/framework/ui/controls/study/](/framework/ui/controls/study/) — the 2026-09-01 survey that counted the control families."); },
});
