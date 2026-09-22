import { Page } from "/app.js";
import { design, derive } from "../../../Design.js";
import { tallerHero } from "../page.js";

/* The taller hero, with the wall taken away. `null` is how a design SUBTRACTS a
   band: the drawer skips any band whose spec key is null, so nothing else moves. */
export const noWall = derive(tallerHero, { wall: null });

export default new Page(design(noWall, {
	meta: import.meta,
	title: "No wall",
	description: "The taller hero with the card wall removed, so the page is a bar, a hero and a footer.",
	changed: "SUBTRACTED the wall. The page is now three bands instead of four, and the hero has the whole fold to itself — which is what a landing page is, as opposed to a directory. Nothing was moved to make room; a band whose spec key is null simply is not drawn.",
	children: "dark-band",
}));
