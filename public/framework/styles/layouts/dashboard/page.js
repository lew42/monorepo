import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Dashboard",
	description: "Stat tiles over a wide panel and a rail — a grid retuned by one token.",
	icon: "dashboard",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "The tile row is the *same* `grid gap auto` as [Cards](/framework/styles/layouts/cards/), with `--column` set to `8em` so four tiles fit where two cards would. **A token override, not a rule** — and it stays responsive, because `auto-fit` is still doing the counting.");


		md("The panel row is `flex gap flex-1`: the chart takes what's left, the rail is `.layout-rail`. Two arrangements, one stylesheet rule between them.");

		fit("A metrics overview · An analytics home · A status board · An order summary",
			"wide",
			"The same call as Cards, for the same reason: tiles are not prose. `--column: 8em` is what makes them tiles rather than cards, and it is a token override, not a rule.");

		md("Next: [Split](/framework/styles/layouts/split/) — two panes that stack themselves.");
	}
});
