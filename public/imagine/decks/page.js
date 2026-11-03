import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/labs/decks/.",
	content(){ md("**This page moved.** It is now [/layouts/labs/decks/](/layouts/labs/decks/) — nine ways to cut a screen into regions."); },
});
