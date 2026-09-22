import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/.",
	content(){ md("**This page moved.** It is now [/layouts/](/layouts/) — the layout standard, every arrangement named, defined and drawn."); },
});
