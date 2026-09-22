import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/color/palette/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/color/palette/](/framework/styles/system/studies/color/palette/) — the grounds and inks, one page before the lighten/darken seam."); },
});
