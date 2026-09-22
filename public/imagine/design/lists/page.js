import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/styles/system/studies/lists/.",
	content(){ md("**This page moved.** It is now [/framework/styles/system/studies/lists/](/framework/styles/system/studies/lists/) — six live, pressable list shapes over one shared team fixture."); },
});
