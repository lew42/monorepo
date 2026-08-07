import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Masthead",
	description: "Hero over a feature row — a landing page, and not one line of CSS.",
	icon: "web",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "A whole landing page: `flex v gap` stacks the two bands, `grid gap three` holds three feature columns and then drops **straight to one** — the Heydon Pickering flip, done with `clamp()` instead of a breakpoint. Type from the scale (`h1`, `h4`), colour from the tokens, and nothing to load.");


		md("This is the payoff. Eight layouts, three CSS rules between them, and those three name two gaps: **there is no utility for a flex basis, and none for a centred measure.**");

		fit("A marketing home page · A landing page · A section cover · A campaign page",
			"bleed",
			"The band across the top has to touch the window or it is not a masthead. The sections below it bring their own padding, which is exactly what `bleed` assumes.");

		md("Next: [Utilities](/framework/util/) — the JS helpers, which are far fewer.");
	}
});
