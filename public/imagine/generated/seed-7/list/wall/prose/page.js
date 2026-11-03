import { Page, md } from "/app.js";

// The leaf. Replace this line with the page.

export default new Page({
	meta: import.meta,
	title: "Digest",

	content(){ md("The end of a branch — this is where the real page goes."); },
});
