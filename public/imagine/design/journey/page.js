import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /framework/ext/DesignTool/journey/.",
	content(){ md("**This page moved.** It is now [/framework/ext/DesignTool/journey/](/framework/ext/DesignTool/journey/) — one overnight crawl, a screenshot of every page on the site."); },
});
