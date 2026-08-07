import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "An auto-fill card wall — one class, no stylesheet, no media query.",
	icon: "grid_view",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "`grid gap auto` is the whole layout: `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))`. The `min()` is what stops it overflowing on a narrow screen, and `--column` is where the wrap point lives — set it on the container to change the card size.");


		md("Resize the window: the count changes and nothing was written to make it. **This is the layout to reach for first** — most grids of anything are this, and half the layouts on this site turn out to be it in disguise.");

		fit("A product grid · A section index · A photo wall · A team page",
			"wide",
			"No measure — a grid of cards has no line length to protect, and holding it to 60em wastes the screen. Keep the inset, so the wall does not touch the window.");

		md("Next: [Dashboard](/framework/styles/layouts/dashboard/) — the same grid, retuned with one token.");
	}
});
