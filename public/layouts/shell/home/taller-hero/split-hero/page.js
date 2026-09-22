import { Page } from "/app.js";
import { design, derive } from "../../../Design.js";
import { tallerHero } from "../page.js";

/* The taller hero, split in two: words on the left, a picture on the right. */
export const splitHero = derive(tallerHero, { hero: { split: true } });

export default new Page(design(splitHero, {
	meta: import.meta,
	title: "Split hero",
	description: "The tall hero divided into two columns — words beside a picture — which stacks back to one when the viewport is narrow.",
	changed: "CHANGED the hero from one column to two: the words keep the left, a picture takes the right. The split is a container query on the viewport, not on the window, so dragging the sidebar wider collapses it back to a stack at exactly the width the words stop reading — which is the whole reason the viewport is a container.",
}));
