import { Page, md, h2 } from "/app.js";
import specs from "./specs.js";
import entry from "../400/entry.js";

export default new Page({
	meta: import.meta,
	title: "Wireframes",
	description: "Eight generic page skeletons from the Figma, each as one class string — and the one seam the vocabulary cannot say.",
	icon: "view_quilt",
	group: "Reference",

	/* ⚠ `entry` is `400/`'s, imported rather than copied: one spec → one twin card, wired
	   for a bare `/full/` url so a real viewport can measure it. Second caller, which is
	   this tier's own bar for promoting a helper — see doc/decisions.md. */
	children: specs.map(entry),

	initialize(){ this.catalog(); },

	content(){

		md("**Eight wireframes, eight class strings.** They come from the Figma frame *AI Slop* "
			+ "(`51:1477`) — eight generic page skeletons, grey boxes with labels in them. The owner's "
			+ "question was not *port these*, it was **can our words produce these outcomes, on Mega and "
			+ "Mobile, with some wrapping**. Seven of the eight: yes, in one string, with no query "
			+ "written down anywhere.");

		md("**The eighth is the finding.** A bento — two-thirds beside one-third — has no word. Every "
			+ "flexible class we own splits a row *equally*: `.flex.auto` hands every child "
			+ "`flex: 1 1 var(--column)`, `.all-1` hands every child `flex: 1`, and `.basis` is a fixed "
			+ "track. *Twice the other, and still fluid* is an inline `flex: 2 1 30em` in two of these "
			+ "eight pages. [doc/bento.md](./doc/bento.md) has the two candidate fixes, one of which "
			+ "needs no new CSS.");

		h2("Two values, and one of them is the default");

		md("`--pad` is never set — every box is a plain `.pad` at its 1em default — and `--gap: 0.4em` "
			+ "sits between a label and its line. That is the whole spacing budget for eight layouts, "
			+ "which is what makes a `div.pad` with an `h3` in it identical in all eight. Every other "
			+ "number here is a `--column`, and a `--column` is a **wrap threshold** — the layout "
			+ "decision itself, not spacing.");

		h2("Measured");

		md("Each card wires a bare `/full/` url — no stage, no `zoom` — so every layout was read in a "
			+ "real viewport at **400, 1280, 1920 and 3440**. No horizontal overflow at any width on any "
			+ "of the eight. [doc/measured.md](./doc/measured.md) has the numbers and the two traps that "
			+ "produced them.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
