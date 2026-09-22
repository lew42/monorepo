import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/color/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/color/](/framework/styles/system/studies/color/) — the grounds, the inks, the ratios."); },
});
