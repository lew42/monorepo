import { Page } from "/app.js";
import { design, derive } from "../../../../Design.js";
import { noWall } from "../page.js";

/* The hero-only page, with a dark band ADDED under the hero. */
export const darkBand = derive(noWall, {
	band: {
		quote: "Every page on this site is the framework documenting itself — so the docs cannot go stale without the site going with them.",
		who: "the thesis this whole repo is a test of",
	},
});

export default new Page(design(darkBand, {
	meta: import.meta,
	title: "Dark band",
	description: "One dark band added between the hero and the footer, to break a page that had become two pale bands.",
	changed: "ADDED one band: a dark quote between the hero and the footer. It is the deepest design in this tree, four changes from Home, and it exists to show that a page with nothing in the middle reads as unfinished — one band of a different ground is enough to fix it.",
}));
