import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "An assistant on every page",
	description: "Each page gets a baseline session that has read its readme; Resume continues, New session forks it.",
	icon: "forum",

	content(){
		return md.file(import.meta, "page-assistant.md", { h1: false });
	},
});
