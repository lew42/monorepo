import { md, div, span, h2, code } from "/app.js";

/* fit(examples, key, why) — what a layout is FOR, and how a page should hold it.
 *
 *     fit("A settings screen · A docs page", "default",
 *         "Prose is the content, so the measure is the layout.");
 *
 * Every layout page ends with the same two questions, so they are asked in the
 * same words and answered from one table. The alternative was eight hand-written
 * sections that would have drifted into eight vocabularies for four choices.
 *
 * The four fits are the page vocabulary — default, `pad`, `full` — plus the one
 * that isn't a page at all (`route`). See /framework/styles/layouts/fit/ live.
 */
const FITS = {
	default: {
		label: "Default",
		how:   `// no class — the region's sheet is the reading column`,
		tokens: "--measure: 60em · --page-pad: 3em clamp(0px, 6%, 5em)",
		why:   "The reading column. Right whenever the words are the point.",
	},
	pad: {
		label: "Pad",
		how:   `classes: "pad"`,
		tokens: "--measure: none · padding: 2em",
		why:   "No measure, but still inset from the edge. A gallery, an index, a board.",
	},
	full: {
		label: "Full",
		how:   `classes: "full"`,
		tokens: "--measure: none · --page-pad: 0",
		why:   "Edge to edge inside the region. The layout supplies its own padding, or wants none.",
	},
	route: {
		label: "Own url",
		how:   `route(name){ return name === "full" && full(this, layout); }`,
		tokens: "position: fixed · inset: 0",
		why:   "Its own url, over everything. For when the region itself is too small a stage.",
	},
};

/* The pre-rename vocabulary, kept so the eight layout pages' calls work
 * untouched. Transitional debt on purpose: delete an alias when its callers are
 * next edited. `full` (old: the overlay) maps to `route`, so the alias table is
 * consulted FIRST — a canonical `full` call is the one thing an old caller
 * cannot mean. */
const KEYS = { measured: "default", wide: "pad", bleed: "full", full: "route" };

export default function fit(examples, key, why){
	const chosen = FITS[KEYS[key] ?? key];

	if (!chosen)
		return div.c("demo-error", `fit(): no such fit "${key}"`);

	h2("What you'd build with it");

	md(examples.split("·").map(e => "- " + e.trim()).join("\n"));

	h2("How a page should hold it");

	div.c("layout-fit pad flow", () => {
		div.c("flex gap v-center", () => {
			span.c("h4 pill", chosen.label);
			span.c("layout-fit-tokens", chosen.tokens);
		});

		code.js(chosen.how);

		md(why ?? chosen.why);
	});

	md(`Every layout on this site can be shown any of the four ways — the fit above is the one it *wants*. The vocabulary, live: [Fit](/framework/styles/layouts/fit/).`);
}

export { fit, FITS };
