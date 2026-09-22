import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/labs/screens/.",
	content(){ md("**This page moved.** It is now [/layouts/labs/screens/](/layouts/labs/screens/) — eight demos of what a click does to your screen."); },
});
