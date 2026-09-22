import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/size/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/size/](/framework/styles/system/studies/size/) — one `--size` knob, the three clamps, and the control rule."); },
});
