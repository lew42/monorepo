import { Page, md, div } from "/app.js";
import Concepts from "/framework/ux/Content/Concepts/Concepts.js";

const items = [
	{ name: "Layout", slug: "layout", icon: "view_quilt" },
	{ name: "Color", slug: "color", icon: "palette" },
	{ name: "Navigation", slug: "navigation", icon: "explore" },
	{ name: "Content", slug: "content", icon: "article" },
	{ name: "UI", slug: "ui", icon: "smart_button" },
];

export default new Page({
	meta: import.meta,
	title: "Design",
	description: "Everything that goes into making anything new: layout, color, navigation, content and UI.",
	icon: "palette",
	children: "layout color navigation content ui",

	content(){
		div.c("pad", () => new Concepts({ items }));
		md("**Design is what decides how a page, a card or a view looks and behaves — before any code is written.** It is browsable: a readme per topic, live examples, detail one click down.");

		md("## The order of the job\n\n1. What is it, and who is it for?\n2. Where does it live, and how is it reached? → [navigation](/framework/design/navigation/)\n3. How big is it, and how does it use the space? → [layout](/framework/design/layout/)\n4. What does it say, and in what order? → [content](/framework/design/content/)\n5. What does the reader press, and how does it feel? → [ui](/framework/design/ui/), carried by [color](/framework/design/color/)\n\nFull version: [doc/job.md](/framework/design/doc/job.md).");

		md("**The two tests for every element:** self-evident (would the reader know what it is and does without reading more?) and necessary (does it earn its space here?).");

		md("This page links to, and never repeats, [/framework/styles/](/framework/styles/) (the CSS vocabulary) and [/framework/ui/](/framework/ui/) (the component gallery).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
