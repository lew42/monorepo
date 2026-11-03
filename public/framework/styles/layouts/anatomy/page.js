import { Page, md, h2 } from "/app.js";
import specs from "./specs.js";
import entry from "../400/entry.js";

export default new Page({
	meta: import.meta,
	title: "Anatomy",
	description: "Seven \"generic layouts\" from the Figma, and the two class strings — a stack, a --grow row — they all turn out to be.",
	icon: "account_tree",
	group: "Reference",

	/* `entry` is `400/`'s, imported rather than copied — see wire/'s own record for why
	   this is the promotion bar (second caller) rather than a rename this task doesn't
	   own. One spec → one twin card, wired for a bare `/full/` url so a real viewport
	   can measure it. */
	children: specs.map(entry),

	initialize(){ this.catalog(); },

	content(){

		md("**Seven shapes, two class strings.** They come from the Figma frame *Frame 12* "
			+ "(node `181:1457`) — Burger, 3× Burgers, Burger with Columns, Burger with "
			+ "Columns with Burger, Columns, Columns with Burger, 3× Columns. The owner: "
			+ "*\"the parent container should not be mocked up, each of the children "
			+ "should\"* — so the wrapper frame is not built, and these seven are.");

		md("**Every one of them is composition, not a new shape.** A Burger is `flex v` — "
			+ "bands stacked, no gap. Columns is `flex auto` with `--grow: 2` on the "
			+ "centre — a fluid track twice its neighbours, the word that shipped tonight. "
			+ "Nest one inside the other, in either order, and all seven fall out. No "
			+ "layout on this page ships a class string the rest of this directory doesn't "
			+ "already have.");

		h2("Why one page and not seven directories");

		md("Six of this tier's other Figma frames already existed as real layouts — "
			+ "[shell](/framework/styles/layouts/shell/), "
			+ "[dashboard](/framework/styles/layouts/dashboard/), "
			+ "[sidebar](/framework/styles/layouts/sidebar/) / "
			+ "[docs](/framework/styles/layouts/docs/), "
			+ "[hero](/framework/styles/layouts/hero/), "
			+ "[document](/framework/styles/layouts/document/) — and this tier's own "
			+ "precedent for the rest, [Wire](/framework/styles/layouts/wire/), is a "
			+ "single `Reference` page of inline class strings rather than eight sibling "
			+ "dirs, for exactly this reason. This frame is a stronger case: Burger with "
			+ "Columns *is* [shell](/framework/styles/layouts/shell/)'s own row, and "
			+ "the other six are that same row and stack, nested. One page, seven inline "
			+ "children, one word in `BANDS` — not seven new directories restating "
			+ "`flex v` and `flex auto` under new names.");

		h2("The one genuine finding: `--grow` replaces an older idiom");

		md("[App shell](/framework/styles/layouts/shell/) and "
			+ "[Sidebar](/framework/styles/layouts/sidebar/) predate `--grow` "
			+ "(shipped 2026-08-18) and reach for a fixed `basis` rail plus an inline "
			+ "`flex: 1 1 24em` for a fluid-but-uneven row. Every Columns shape here uses "
			+ "`--grow: 2` instead: one token, no inline `flex`, and the centre stays "
			+ "fluid rather than the rail staying fixed. Same picture, cheaper string — "
			+ "worth a look next time one of those pages changes.");

		h2("Two spacing values, and one of them is the default");

		md("`--pad` is never set — every box is a plain `.pad` at its 1em default — and "
			+ "`--gap: 0.4em` sits between a label and its line. `--column: 12em` is the "
			+ "one wrap threshold, on the Columns row. That is the whole spacing budget "
			+ "for seven layouts, which is what the owner's `div.card.pad` + `h2` test "
			+ "asks for.");

		h2("Measured");

		md("Each card wires a bare `/full/` url — no stage, no `zoom` — so every shape "
			+ "was read in a real viewport at **400, 1280, 1920 and 3440**. No horizontal "
			+ "overflow at any width on any of the seven, zero console errors. "
			+ "[doc/decisions.md](./doc/decisions.md) has the record.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
