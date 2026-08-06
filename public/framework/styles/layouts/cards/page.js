import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import viewport from "../viewport.js";

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "An auto-fill card wall — one class, no stylesheet, no media query.",
	route(name){ return name === "viewport" && viewport(this, layout); },

	content(){
		demo(layout, "`grid gap auto` is the whole layout: `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))`. The `min()` is what stops it overflowing on a narrow screen, and `--column` is where the wrap point lives — set it on the container to change the card size.");

		viewport.link(this);

		md("Resize the window: the count changes and nothing was written to make it. **This is the layout to reach for first** — most grids of anything are this, and half the layouts on this site turn out to be it in disguise.");

		md("Next: [Dashboard](/framework/styles/layouts/dashboard/) — the same grid, retuned with one token.");
	}
});
