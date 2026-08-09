import { Page, md, demo, div, icon } from "/app.js";
import { palette } from "../parts.js";
import { stats } from "./stats.js";

const items = [["npm deps", "3"], ["build steps", "0"], ["core classes", "5"], ["tokens", "16"]];

export default new Page({
	meta: import.meta,
	title: "Stat tiles",
	description: "A card wall with one token retuned — no new selector.",
	icon: "bar_chart",
	card: "wide",
	classes: "grid",

	content(){

		palette(
			["ui.stats(…)", () => stats(...items)],
			["two up", () => stats(...items.slice(0, 2))],
			["wider tiles", () => stats(...items).style("--column", "14em")],
		);

		md("## Calling it");

		demo(() => {
			stats(["npm deps", "3"], ["build steps", "0"], ["core classes", "5"], ["tokens", "16"]);
		}, "`[label, value]` pairs. Each tile is the same `ui-surface pad flex v` box a [card](/framework/ui/card/) is, and the strip is `grid gap auto`.");

		md("## A token override where a rule was expected");

		md("`grid auto` wraps on `--column`, so **shrinking that token is what turns a two-up card grid into a four-up tile strip** — `9em` here instead of the `14em` default, and no selector was written. Retune it per call:");

		demo(() => {
			stats(["p95", "84ms"], ["deploys", "37"]).style("--column", "16em");
		}, "`.style(\"--column\", \"16em\")` and the same function is a two-up summary. A utility that reads a token is a knob, and this codebase has repeatedly found that more useful than a new class.");

		md("`h4` for the label and `h2` for the number — the [type scale](/framework/styles/layers/theme/) is the whole vocabulary, so a tile never invents a font-size. `ui-muted` is the only colour, and it is derived from the ink it sits on rather than named.");

		md("## When you want more in a tile");

		demo(() => {
			div.c("grid gap auto", () => [
				["trending_up", "requests", "1.2M"],
				["schedule", "p95", "84ms"],
			].forEach(([glyph, label, value]) => div.c("ui-surface pad flex v gap", () => {
				div.c("flex v-center gap", () => {
					icon(glyph).style({ color: "var(--prim)", fontSize: "1em" });
					div.c("h4 ui-muted", label);
				}).style("--gap", "0.4em");
				div.c("h2", value);
			}).style("--gap", "0.1em"))).style("--column", "10em");
		}, "An icon in the label row is past what two strings can express, so this is the tile written out — `ui-surface` and the utilities, which is all `stats()` ever was. **The function is for the list, not for the box.**");

		md("Next: [Badges](/framework/ui/badge/) — and the first thing the token set cannot do.");
	},
});
