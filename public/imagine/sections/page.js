import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/labs/sections/.",
	content(){ md("**This page moved.** It is now [/layouts/labs/sections/](/layouts/labs/sections/) — one horizontal band cut into 2, 3 or 4 columns."); },
});
