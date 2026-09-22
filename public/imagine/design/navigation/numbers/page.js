import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /web/nav/doc/study/numbers/.",
	content(){ md("**This page moved.** It is now [/web/nav/doc/study/numbers/](/web/nav/doc/study/numbers/) — the stability numbers, page by page."); },
});
