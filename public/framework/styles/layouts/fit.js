import { md, div, span, h2, code } from "/app.js";

/* fit(examples, key, why) — what a layout is FOR, and how a page should hold it.
 *
 *     fit("A settings screen · A docs page", "measured",
 *         "Prose is the content, so the measure is the layout.");
 *
 * Every layout page ends with the same two questions, so they are asked in the
 * same words and answered from one table. The alternative was eight hand-written
 * sections that would have drifted into eight vocabularies for four choices.
 *
 * The four fits are the four things `--measure` and `--page-pad` can be, plus the
 * one that isn't a page at all. See core/Page/layouts/ for each of them live.
 */
const FITS = {
	measured: {
		label: "Measured",
		how:   `classes: "paper"`,
		tokens: "--measure: 60em · --page-pad: 3em 4em",
		why:   "The reading column. Right whenever the words are the point.",
	},
	wide: {
		label: "Wide",
		how:   `classes: "dash"`,
		tokens: "--measure: none · --page-pad: 2em",
		why:   "No measure, but still inset from the edge. A gallery, an index, a board.",
	},
	bleed: {
		label: "Bleed",
		how:   `classes: "page-full"`,
		tokens: "--measure: none · --page-pad: 0",
		why:   "Edge to edge inside the region. The layout supplies its own padding, or wants none.",
	},
	full: {
		label: "Full",
		how:   `route(name){ return name === "full" && full(this, layout); }`,
		tokens: "position: fixed · inset: 0",
		why:   "Its own url, over everything. For when the region itself is too small a stage.",
	},
};

export default function fit(examples, key, why){
	const chosen = FITS[key];

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

	md(`Every layout on this site can be shown any of the four ways — the fit above is the one it *wants*. The catalogue is [Page layouts](/framework/core/Page/layouts/).`);
}

export { fit, FITS };
