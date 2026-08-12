import { Page, md, demo, div, icon } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const stats = () => {
	const items = [["npm deps", "3"], ["build steps", "0"], ["core classes", "5"], ["tokens", "16"]];

	return div.c("grid gap auto", () => items.forEach(([label, value]) =>
		div.c("surface pad flex v gap", () => {
			div.c("h4 muted", label);
			div.c("h2", value);
		}).style("--gap", "0.1em"))).style("--column", "9em");
};

const with_icons = () => div.c("grid gap auto", () => [
	["trending_up", "requests", "1.2M"],
	["schedule", "p95", "84ms"],
].forEach(([glyph, label, value]) => div.c("surface pad flex v gap", () => {
	div.c("flex v-center gap", () => {
		icon(glyph).style({ color: "var(--prim)", fontSize: "1em" });
		div.c("h4 muted", label);
	}).style("--gap", "0.4em");
	div.c("h2", value);
}).style("--gap", "0.1em"))).style("--column", "10em");

export default new Page({
	meta: import.meta,
	title: "Stat tiles",
	description: "A template, not a function — a card wall with one token retuned.",
	icon: "bar_chart",
	card: "wide",

	content(){

		palette(
			["four tiles", stats],
			["with an icon", with_icons],
		);

		md("## Copy it");

		copy(stats);

		md("**There is no `ui.stats()`.** It had zero call sites while **three** hand-rolled copies of the tile existed on this site — `sections/parts.js`'s `stat()`, the versus page, and the demo two boxes above, which abandoned the function the moment it wanted an icon in the label row. A function that its own documentation page stops using is finished.");

		md("## A token override where a rule was expected");

		md("`grid auto` wraps on `--column`, so **shrinking that token is what turns a two-up card grid into a four-up tile strip** — `9em` here instead of the `14em` default, and no selector was written:");

		demo(() => {
			div.c("grid gap auto", () => [["p95", "84ms"], ["deploys", "37"]].forEach(([label, value]) =>
				div.c("surface pad flex v gap", () => {
					div.c("h4 muted", label);
					div.c("h2", value);
				}).style("--gap", "0.1em"))).style("--column", "16em");
		}, "`.style(\"--column\", \"16em\")` and the same markup is a two-up summary. A utility that reads a token is a knob, and this codebase has repeatedly found that more useful than a new class.");

		md("`h4` for the label and `h2` for the number — the [type scale](/framework/styles/layers/theme/) is the whole vocabulary, so a tile never invents a font-size. `muted` is the only colour, and it is derived from the ink it sits on rather than named.");

		md("## The tile is the card again");

		md("A tile is [Card](/framework/ui/card/) with a `--gap` of `0.1em` and two lines in it; the strip is `grid gap auto`. There was never a component here — there was a wall, and the wall is one class.");

		md("Next: [Badges](/framework/ui/badge/) — and the first thing the token set cannot do.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", stats)); },
});
