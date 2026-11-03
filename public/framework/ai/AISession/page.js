import { Page, md, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "AISession",
	description: "One Claude session read once from its transcript, and the family of classes around it: the sessions grid, a session's own page, the node tools.",
	icon: "forum",

	content(){
		// No DOM after the await: the box is captured first, filled in the callback.
		div.c("flow", async $box => {
			const text = await (await fetch(new URL("./readme.md", import.meta.url))).text();
			$box.empty(() => md(text));
		});
	},
});
