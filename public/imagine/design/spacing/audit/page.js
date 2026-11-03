import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/spacing/audit/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/spacing/audit/](/framework/styles/system/studies/spacing/audit/) — every `/imagine/` realm's landing page measured, 1,166 boxes at two widths."); },
});
