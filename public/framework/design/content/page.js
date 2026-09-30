import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Content",
	description: "The iceberg: level of detail, what is foundational, importance and prioritization.",
	icon: "article",

	content(){
		md("**Show it, then tell it.** Files → a tree. An object → its live instance. A task → its checklist. A layout → a screenshot. Words come after the picture, and only as many as it takes.");
		md("**The tip of the iceberg comes first** — usually the list of what a thing is made of, as linked items. Detail sits one click down, never deleted.");
		md("| You have… | Often reads best as |\n|---|---|\n| One big idea | a large icon card |\n| A few related things | a section: a title over icon cards |\n| A few destinations to label | a section with a background |\n| Things inside things | an outline |");
		md("Could the reader get this page's point in ten seconds? If not, cut it and move the rest one click down. Full rules, and the Cards system: [doc/rules.md](/framework/design/content/doc/rules.md).");
		md.details(import.meta, "readme.md", "Readme");
	},
});
