import { Page, md, demo, div, h3, p, a, span, button } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran. One class, `card` — framework.css's own
// rule already pads it (`--pad-card`), spaces its children (`--gap`), and gives it
// a radius and a shadow. Nothing here is this page's own CSS.
const card = () => div.c("card", () => {
	div.c("h4 muted", "Core");
	h3("View");
	p("A DOM element with a chainable API, and one idea: capturing.");
});

const linked = () => div.c("card", () => {
	h3("View");
	p("A DOM element with a chainable API.");
	a.c("page-link", "Read →").href("/framework/core/View/").style("color", "var(--prime)");
});

// The one variant that needs more than `.card` alone: the figure has to reach the
// card's own edge so the radius clips it. `.card`'s padding is one rule
// (`--pad-card`), so pulling the image out to the edge is one negative margin the
// same size, with `overflow: hidden` to clip its square corners to the round ones.
const media = () => div.c("card flex v", () => {
	div.c("wash").style({ aspectRatio: "16 / 9", margin: "calc(var(--pad-card) * -1) calc(var(--pad-card) * -1) 0" });
	div.c("h4 muted", "Core");
	h3("View");
	p("A DOM element with a chainable API.");
}).style("overflow", "hidden");

// Multiple actions, not one — `flex v-center gap` is the exact class list
// `toolbar`'s own groups use, moved into a card's footer instead of a bar.
const action = () => div.c("card", () => {
	div.c("h4 muted", "Team");
	h3("Pro plan");
	p("Unlimited members, priority support.");
	div.c("flex v-center gap", () => {
		button.c("prim", "Upgrade");
		button("Compare");
	}).style("--gap", "calc(var(--gap) * 0.3)");
});

// A card as a container for a repeated row — `flex v-center split gap` is
// `alert`'s action row minus the icon, looped instead of written once.
const list = () => div.c("card", () => {
	div.c("h4 muted", "Recent activity");
	["Pushed to main", "Opened a pull request", "Merged #482"].forEach(line =>
		div.c("flex v-center split gap", () => {
			span(line);
			span.c("muted h4", "2h");
		}));
});

// The words matrix: the SAME card, four times, with a class appended and
// nothing else — proof that a template needs no compact or contrast rule of
// its own.
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

// Grounds — the same `card` template, nested one level inside each of the four
// `bg-` grounds (styles/doc/architecture.md §2–3). The nested card needs no class
// of its own to go one step darker: `:where(.card) .card` in framework.css does it,
// on every ground, automatically.
const grounds = () => div.c("grid gap auto", () => {
	["bg-white", "bg-light", "bg-prime", "bg-dark"].forEach(ground =>
		div.c(`card ${ground}`, () => {
			div.c("h4 muted", ground);
			card();
		}));
}).ac("bleed").style("--column", "16em");

export default new Page({
	meta: import.meta,
	title: "Card",
	description: "The one card page — a template, not a function. `div.c(\"card\", …)` and framework.css does the rest: padding, child spacing, radius, shadow.",
	icon: "web_asset",

	children: [
		demo.page("linked", linked, {
			note: "A card with a call to action. The link is a `.page-link`, and the accent is its own explicit call — `framework.css` has no rule for `a` at all." }),

		demo.page("media", media, {
			note: "The image bleeds to the card's own edge with one negative margin the size of `--pad-card`, clipped to the radius by `overflow: hidden`. That is the whole difference from the primary card — one extra line, not a second component." }),

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
			note: "**There is no `ui.card()`, and there is no `.ui-card` either.** The function above is one `div.c(\"card\", …)` holding a heading and a paragraph — `card` is the only class, and it already looks finished. No `pad`, no `flex v gap`, no `--gap` override: `.card` in `framework.css` is that whole sentence.",
		});

		md("## `.card` already does the whole job");

		md("```css\n.surface, .card {\n\tbackground: var(--surface);\n\tcolor: var(--ink);\n\tborder: 1px solid var(--line);\n\tborder-radius: var(--radius);\n}\n.card { padding: var(--pad-card); box-shadow: var(--shadow); }\n:where(.card) > * + * { margin-block-start: var(--gap); }\n```");

		md("`.card` shares `.surface`'s exact selector — one declaration, never a forked look — and adds the two things a card needs that a plain surface doesn't: padding, and automatic spacing between its own children. Every variant on this page used to write `surface pad flex v gap` by hand and then override `--gap` itself; that was a second, hand-rolled copy of the three lines above, repeated once per variant. It's gone — see [`architecture.md` §3](/framework/styles/doc/architecture.md)." );

		md("**`color` is not decoration.** A box that paints its own fill owns its own ink: without that line a card inherits whatever is around it, and on a dark or accent ground it would render white-on-white. Measured, once.");

		md("## Grounds — the same card, four grounds, one nested step darker");

		grounds();

		md("Each `bg-` ground sets its own background **and** its own ink, so text never needs recolouring by hand. A card dropped inside any of them needs no class of its own to read as nested: `:where(.card) .card` drops the shadow and hairline and steps the background one shade darker than whatever ground it's sitting on — the same rule, on every ground. Detail: [`architecture.md` §2–3`](/framework/styles/doc/architecture.md).");

		md("## Card vs section");

		md("A **card** always paints its own background and pads itself. A [Section](/framework/core/Section/) does neither — it's a band, and its parent decides both. Full writeup: [`styles/doc/architecture.md`](/framework/styles/doc/architecture.md).");

		md("## Four variants, not six");

		md("An avatar-and-name row and a centered empty state were both built and cut here already, twice — `ui/doc/record.md` §7 and §10, and its own rule is not to reopen a written verdict with no new evidence. A `stat` card isn't below either: [Stat tiles](/framework/ui/stats/) already says the tile *is* the card, one token retuned, and a second page would be a second home for the same three lines.");

		md("## The words matrix — zero density or contrast CSS below");

		md("The card at the top of this page, four times, with a class appended and nothing else. `ui-contrast` and `ui-compact` are [config words](/framework/ui/words/) — a class that remaps tokens on whatever it sits on — and `card()` was already reading every token either one retunes. This is not a fifth variant: it is the same one card, proving the other five need no compact or high-contrast rule of their own.");

		matrix();

		md("## Other card pages");

		md("This is the one card page; the others below are a different thing sharing the word, or an earlier lab — linked, never deleted:\n\n- [`core/Page/card/`](/framework/core/Page/card/) — the earlier card lab (grounds, headers, nesting levels); superseded by the grounds shown above.\n- [`ux/Card/`](/framework/ux/Card/) — the AI board's own card page.\n- [`imagine/gallery/cards/`](/imagine/gallery/cards/)\n- [`imagine/vary/colstyles/cards/`](/imagine/vary/colstyles/cards/)\n- [`imagine/feeds/data/cards/`](/imagine/feeds/data/cards/)\n- [`ux/Dictate/variants/cards/`](/framework/ux/Dictate/variants/cards/)\n- [`blog/framework/class-cards/`](/blog/framework/class-cards/)\n- [`core/new/1/site/nav/cards/`](/framework/core/new/1/site/nav/cards/)");

		md("Next: [Stat tiles](/framework/ui/stats/) — the same surface, four across, one token retuned.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", card)); },
});
