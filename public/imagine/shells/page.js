import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/labs/shells/.",
	content(){ md("**This page moved.** It is now [/layouts/labs/shells/](/layouts/labs/shells/) — ten app-shell layouts, each at its own url."); },
});
