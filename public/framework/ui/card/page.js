import { Page, md, demo, div, h3, p, a, span, button } from "/app.js";

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

// Multiple actions, not one — `flex v-center gap` is the exact class list
// `toolbar`'s own groups use, moved into a card's footer instead of a bar.
const action = () => div.c("surface pad flex v gap", () => {
	div.c("h4 muted", "Team");
	h3("Pro plan");
	p("Unlimited members, priority support.");
	div.c("flex v-center gap", () => {
		button.c("prim", "Upgrade");
		button("Compare");
	}).style("--gap", "0.3em");
}).style("--gap", "0.5em");

// A card as a container for a repeated row — `flex v-center split gap` is
// `alert`'s action row minus the icon, looped instead of written once.
const list = () => div.c("surface pad flex v gap", () => {
	div.c("h4 muted", "Recent activity");
	["Pushed to main", "Opened a pull request", "Merged #482"].forEach(line =>
		div.c("flex v-center split gap", () => {
			span(line);
			span.c("muted h4", "2h");
		}));
}).style("--gap", "0.6em");

// The words matrix: the SAME card, four times, with a class appended and
// nothing else — proof that a template needs no compact or contrast rule of
// its own. No inline `--gap` on the label wrapper (words/page.js's own trap):
// `card()` already sets its own `--gap` at its own root, so nothing leaks.
const labeled = (caption, build) => div.c("flex v gap", () => {
	div.c("h4 muted", caption);
	build();
});

const matrix = () => div.c("grid gap auto", () => {
	labeled("default", () => card());
	labeled("ui-contrast", () => card().ac("ui-contrast"));
	labeled("ui-compact", () => card().ac("ui-compact"));
	labeled("both", () => card().ac("ui-contrast ui-compact"));
}).ac("bleed").style("--column", "14em");

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

		demo.page("action", action, {
			note: "A button ROW, not a link — `flex v-center gap` is `toolbar`'s own group syntax, dropped into a card's footer. `.prim` marks the one action that matters and the second button is free, same as `linked`'s CTA is free above it." }),

		demo.page("list", list, {
			note: "Three rows, one `.forEach`, zero new markup. `flex v-center split gap` lands the label and its timestamp at opposite ends with nothing measuring the distance — the same row `alert`'s action variant uses, without the icon. A card became a feed by looping, not by growing a stylesheet." }),
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

		md("## Four variants, not six");

		md("An avatar-and-name row and a centered empty state were both built and cut here already, twice — `ui/doc/record.md` §7 and §10, and its own rule is not to reopen a written verdict with no new evidence. A `stat` card isn't below either: [Stat tiles](/framework/ui/stats/) already says the tile *is* the card, one token retuned, and a second page would be a second home for the same three lines.");

		md("## The words matrix — zero density or contrast CSS below");

		md("The card at the top of this page, four times, with a class appended and nothing else. `ui-contrast` and `ui-compact` are [config words](/framework/ui/words/) — a class that remaps tokens on whatever it sits on — and `card()` was already reading every token either one retunes. This is not a fifth variant: it is the same one card, proving the other five need no compact or high-contrast rule of their own.");

		matrix();

		md("Next: [Stat tiles](/framework/ui/stats/) — the same surface, four across, one token retuned.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", card)); },
});
