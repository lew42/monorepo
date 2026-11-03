import { Page } from "/app.js";
import { design, derive } from "../../Design.js";
import { home } from "../page.js";

/* Home, with the hero's fold budget raised. ONE key moves; everything else on the
   page is the same object the parent drew. */
export const tallerHero = derive(home, {
	hero: { fold: "clamp(20rem, 62vh, 44rem)" },
});

export default new Page(design(tallerHero, {
	meta: import.meta,
	title: "Taller hero",
	description: "The same page with the hero given most of the fold — the bar above it and the wall below it are untouched.",
	changed: "CHANGED one number: the hero's fold budget, from clamp(13rem, 34vh, 26rem) to clamp(20rem, 62vh, 44rem). A hero's height is a fold budget rather than a fixed size, so raising it means moving the floor, the fluid middle and the cap together — a taller hero at 3440 that was still a hero at 400.",
	children: "no-wall split-hero",
}));
