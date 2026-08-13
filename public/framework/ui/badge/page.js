import { Page, md, demo, div, span, icon } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
const badges = () => div.c("flex wrap v-center gap", () => {
	span.c("ui-badge ui-pill h4", "default");
	span.c("ui-badge ui-pill h4 accent", "shipped");
	span.c("ui-badge ui-pill h4 outline", "outline");
	span.c("ui-badge ui-pill h4 dot accent", "live");
	span.c("ui-badge ui-pill h4 count accent", "7");
}).style("--gap", "0.4em");

const composed = () => div.c("flex wrap v-center gap", () =>
	[["verified", "check"], ["draft", "edit"], ["archived", "inventory_2"]].forEach(([text, glyph]) =>
		span.c("ui-badge ui-pill h4 flex v-center gap", () => {
			icon(glyph).style("fontSize", "1em");
			span(text);
		}).style("--gap", "0.35em"))).style("--gap", "0.4em");

export default new Page({
	meta: import.meta,
	title: "Badges",
	description: "A template plus five variant classes — the class name is the component.",
	icon: "label",

	children: [
		demo.page("icons", composed, {
			note: "An icon badge is the same span with utility classes added and a body function instead of a string. No `icon` option, no variants map — the class attribute is the whole extension mechanism, which is the argument for handing you the markup." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(badges, steer).ac("bleed"),
			def: badges,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.badge()`.** Its body was one `span.c()` — the class list *is* the component, so the function was a second way to spell three words. `ui-badge ui-pill h4` is the pill: `h4` is already a small, tracked, uppercase label, `ui-pill` is `--wash` with a `999px` radius, and `.ui-badge` exists so the five variants have something to hang off.",
		});

		md("## The variants, which is all `badge.js` is now");

		md("```css\n.ui-badge.accent  { background: var(--prim); color: var(--surface); }\n.ui-badge.dark    { background: var(--ink);  color: var(--surface); }\n.ui-badge.outline { background: none; border: 1px solid var(--line); }\n.ui-badge.count   { padding: 0.15em 0.5em; }\n```");

		md("Both filled tones read `var(--surface)` for their ink rather than a literal `white`, which is what they said before — and *naming a colour is the thing a component may not do.* `--ink`/`--surface` is the pair the theme already guarantees contrast between, in both modes.");

		md("## The dot is a pseudo-element, not markup");

		md("```css\n.ui-badge.dot::before {\n\tcontent: \"\";\n\twidth: 0.5em;\n\theight: 0.5em;\n\tborder-radius: 999px;\n\tbackground: currentColor;\n}\n```");

		md("`background: currentColor` is what makes it free: the dot is whatever colour the badge already is, so `accent`, `dark` and `outline` each tint it without a second rule.");

		md("## Four tones, not six");

		md("The token set has **one accent**. `--prim --bg --wash --subtle --surface --line`, plus `--error`, which arrived to replace `#c00` in three stylesheets rather than for components. Nothing means *good* or *warning*. So a badge honestly offers neutral, accent, dark and outline, and one that wants green-for-passing would have to name a colour.\n\nThat is a finding, not a workaround: **the status axis is a third done.** `--ok` and `--warn` beside `--error` would finish it for every badge, alert, meter and diff row after. On the [record](/framework/ui/).");

		md("Next: [Alerts](/framework/ui/alert/) — the same idea at block scale.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", badges)); },
});
