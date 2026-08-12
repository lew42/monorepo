import { div, p } from "/app.js";
import { band } from "./tone.js";
import { timeline } from "/framework/ui/timeline/timeline.js";

/* The Timeline component with real releases in it — one function, two call
 * sites, nothing to drift. Every colour in it derives from the band's own ink,
 * which is what lets this band be any of the four tones. */
const RELEASES = [
	["Aug 2026", "The sheet is the default", "A region hands every page a 60em measure. Four opt-in classes retired."],
	["Jul 2026", "One flow token", "`--flow: 2em`, one em token in place of four, so an area's rhythm scales with its font-size."],
	["Jun 2026", "The Pager tier died", "An arrangement became a class a page opts into. Four core classes left."],
	["May 2026", "Layers landed", "base, theme, site, util — and a rule that says which one you are in."],
];

export default (tone = "surface") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "SHIPPED").style("color", "var(--eyebrow, var(--prim))");

			p.c("h2", "What changed, and when");

			timeline(...RELEASES);

			p.c("muted", "Every entry is a commit you can read — there is no compiled artefact to diff against.");
		}).style("--measure", "46em")
	).style(band(tone));
