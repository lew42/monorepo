import { Page } from "/app.js";
import { design, derive } from "../../Design.js";
import { home } from "../page.js";

/* Home, with the hero taken away — the wall starts the page. */
export const noHero = derive(home, { hero: null });

export default new Page(design(noHero, {
	meta: import.meta,
	title: "No hero",
	description: "Home with the hero removed, so the wall of cards is the first thing under the bar.",
	changed: "SUBTRACTED the hero. The wall is now the first thing a reader sees, which is the right shape for a page whose job is to send people somewhere rather than to say what the site is. Nothing grew to fill the space: the bands above and below simply meet.",
}));
