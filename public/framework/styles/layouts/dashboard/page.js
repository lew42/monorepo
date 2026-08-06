import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import viewport from "../viewport.js";

export default new Page({
	meta: import.meta,
	title: "Dashboard",
	description: "Stat tiles over a wide panel and a rail — a grid retuned by one token.",
	route(name){ return name === "viewport" && viewport(this, layout); },

	content(){
		demo(layout, "The tile row is the *same* `grid gap auto` as [Cards](/framework/styles/layouts/cards/), with `--column` set to `8em` so four tiles fit where two cards would. **A token override, not a rule** — and it stays responsive, because `auto-fit` is still doing the counting.");

		viewport.link(this);

		md("The panel row is `flex gap flex-1`: the chart takes what's left, the rail is `.layout-rail`. Two arrangements, one stylesheet rule between them.");

		md("Next: [Split](/framework/styles/layouts/split/) — two panes that stack themselves.");
	}
});
