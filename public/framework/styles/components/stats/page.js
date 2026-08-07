import { Page, md, demo, div, icon } from "/app.js";
import { surface } from "../parts.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Stat tiles",
	description: "A card wall with one token retuned — no new selector.",
	icon: "bar_chart",

	content(){

		demo(component, "The same `grid gap auto` as a card wall, with `--column: 9em` set on the container. **A token override where a rule was expected:** `grid auto` reads `--column`, so shrinking it turns a two-up card grid into a four-up tile strip and no selector was written.");

		md("`h4` for the label and `h2` for the number — the [type scale](/framework/styles/layers/theme/) is the whole vocabulary, so a stat tile never invents a font-size. `--subtle` on the label is the only colour, and it is a token.");

		demo(() => {
			div.c("grid gap auto", () => [
				["trending_up", "requests", "1.2M"],
				["schedule", "p95", "84ms"],
				["cloud_done", "deploys", "37"],
			].forEach(([glyph, label, value]) => div.c("pad flex v", () => {
				div.c("flex v-center", () => {
					icon(glyph).style({ color: "var(--prim)", fontSize: "1em" });
					div.c("h4", label).style("color", "var(--subtle)");
				}).style("gap", "0.4em");
				div.c("h2", value);
			}).style({ ...surface, gap: "0.1em" })
			)).style("--column", "9em");
		}, "With an icon in the label row: `flex v-center` beside the `h4`, and `--column` up to `9em` to make room. Every tile is still the same `pad flex v` box.");

		md("Next: [Badges](/framework/styles/components/badge/) — and the first thing the token set cannot do.");
	}
});
