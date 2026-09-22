import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/labs/blogx/.",
	content(){ md("**This page moved.** It is now [/layouts/labs/blogx/](/layouts/labs/blogx/) — eight blog shells rendering the same eight posts at 3440."); },
});
