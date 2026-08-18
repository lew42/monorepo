import { Page, md, demo, div, h3, p, a } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
const card = () => div.c("surface pad flex v gap", () => {
	div.c("h4 muted", "Core");
	h3("View");
	p("A DOM element with a chainable API, and one idea: capturing.");
}).style("--gap", "0.5em");

const linked = () => div.c("surface pad flex v gap", () => {
	h3("View");
	p("A DOM element with a chainable API.");
	a.c("page-link", "Read →").href("/framework/core/View/").style("color", "var(--prim)");
}).style("--gap", "0.5em");

const media = () => div.c("surface flex v", () => {
	div.c("wash").style({ aspectRatio: "16 / 9" });

	div.c("pad flex v gap", () => {
		div.c("h4 muted", "Core");
		h3("View");
		p("A DOM element with a chainable API.");
	}).style("--gap", "0.5em");
});

export default new Page({
	meta: import.meta,
	title: "Card",
	description: "A template, not a function — one div, and the class it wears belongs to framework.css.",
	icon: "web_asset",

	children: [
		demo.page("linked", linked, {
			note: "A card with a call to action. The link is a `.page-link`, and the accent is its own explicit call — `framework.css` has no rule for `a` at all." }),

		demo.page("media", media, {
			note: "The figure goes **outside** the `pad`, so the image reaches the card's own edge and the radius clips it. That is the whole difference between this and the primary: one surface, two children instead of one. Swap the washed box for your `<img>` — `framework.css` already gives one `max-width: 100%`." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(card, steer).ac("bleed"),
			def: card,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.card()`, and there is no `.ui-card` either.** The function was one `div.c()` with five class names in it; the class was styled by nothing. Both were a second name for `surface pad flex v gap`, which is already the sentence you would write.",
		});

		md("## `surface` is the shared look, and it is `framework.css`'s");

		md("```css\n.surface {\n\tbackground: var(--surface);\n\tcolor: var(--ink);\n\tborder: 1px solid var(--line);\n\tborder-radius: var(--radius);\n}\n```");

		md("`ui/` used to ship a `.ui-surface` that was this rule character for character. A duplicate is not an alias — it is a second definition that can drift — so it is gone and every template on these pages writes `surface`, the same class the [sections](/framework/styles/sections/) cards already wore.");

		md("**`color` is not decoration.** A box that paints its own fill owns its own ink: without that line a card inherits whatever is around it, and on a dark or accent band a `section()` hands down `color: var(--surface)` — every card in the testimonials, pricing and team bands rendered white text on white. Measured, once.");

		md("**A wall of cards is not a card variant.** `grid gap auto` is a layout word and it has one address: [`grid gap auto`](/framework/styles/layouts/grid/auto/), where the same three cards re-count their own columns on a stage you can drag. It used to be a child page here, which made the vocabulary two-homed for no gain.");

		md("One thing to know: `pad flow` looks like the obvious inner class and it is wrong. `flow` is **page** rhythm — a small heading takes `--flow × 1.5`, so an eyebrow label and its title land 48px apart. `flex v` plus a small gap is a component's own rhythm, which is why `--gap` is `0.5em` here.");

		md("Next: [Stat tiles](/framework/ui/stats/) — the same surface, four across, one token retuned.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", card)); },
});
