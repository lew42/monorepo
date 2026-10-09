import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Lab",
	description: "Small experiments with browser features, each a live demo.",
	icon: "science",
	children: "notifications",
	content(){
		md("The lab is where we try one browser feature at a time, with a live page that shows what the browser is really doing. Today: **[Notifications](notifications/)**, from a normal Android Chrome tab, no app install.");
		this.previews();
		md.details(import.meta, "readme.md", "Readme");
	},
});
