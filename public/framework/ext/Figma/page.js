import { FigmaBrowse } from "./FigmaBrowse.js";

export default new FigmaBrowse({
	meta: import.meta,
	title: "Figma",
	description: "Figma files we track, as previews you can browse; every design in them can become a framework page.",
	icon: "design_services",
	width: "full",
	children: "colors palette",
});
