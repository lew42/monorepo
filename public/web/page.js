import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Web",
	description: "The guide — how to build things on the web, shown live.",
	icon: "language",

	children: "nav layout",

	content(){
		this.previews();

		md("**`/framework/` is the reference; this is the guide.** A reference page says what an API *is* — [`Page`](/framework/core/Page/), [`Router`](/framework/core/Router/), [the CSS layers](/framework/styles/). A guide page takes one decision you actually have to make, shows it working in a site you can click, and links back for the detail.");

		md("Every demo here is a real `Page` tree running in a box — so a claim about navigation is something you can test by clicking it.");

		md("[Navigation](/web/nav/) is nine patterns and two studies. [Layout](/web/layout/) is seven principles — flow, measure, the two arrangers, the page's tracks, and the two cases that decide between them.");

		md.details(import.meta, "readme.md", "Design record — the split, and what belongs on which side");
	},
});
