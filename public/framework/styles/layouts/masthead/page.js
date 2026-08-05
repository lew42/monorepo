import { Page, md, demo, a } from "/app.js";
import layout from "./layout.js";

export default new Page({
	meta: import.meta,
	title: "Masthead",
	description: "Hero over a feature row — a landing page, and not one line of CSS.",
	children: "full",

	content(){
		demo(layout, "A whole landing page: `flex v gap` stacks the two bands, `grid gap three` holds three feature columns and then drops **straight to one** — the Heydon Pickering flip, done with `clamp()` instead of a breakpoint. Type from the scale (`h1`, `h4`), colour from the tokens, and nothing to load.");

		a.c("page-link", "Full size ↗").href(this.url + "full/");

		md("This is the payoff. Eight layouts, three CSS rules between them, and those three name two gaps: **there is no utility for a flex basis, and none for a centred measure.**");

		md("Next: [Utilities](/framework/util/) — the JS helpers, which are far fewer.");
	}
});
