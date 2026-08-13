import { Page, md, h2, h3, div, span, input, label, select, option, demo } from "/app.js";

/* The live variants demo below is a real Page tree in a box — the same three
 * children `/framework/ui/field/` actually declares, previewed with the same
 * `preview_card()` the rail is made of. Nothing here is a screenshot. */
const field = () => label.c("flex v gap", () => {
	div.c("h4", "Email");
	input().attr("type", "email").attr("value", "mike@lew42");
	span.c("muted", "We never send anything.");
}).style("--gap", "0.4em");

const invalid = () => label.c("flex v gap", () => {
	div.c("h4", "Email");
	input().attr("type", "email").attr("value", "mike@lew42").attr("aria-invalid", "true")
		.style("borderColor", "var(--prim)");
	span("That address is missing a domain.").style("color", "var(--prim)");
}).style("--gap", "0.4em");

const chooser = () => label.c("flex v gap", () => {
	div.c("h4", "Tier");
	select(() => { option("core"); option("ext"); option("util"); });
}).style("--gap", "0.4em");

const form = () => div.c("flex v gap", () => { field(); chooser(); });

// A demo page's config, the shape `demo.page()` builds — stage above, cards below.
const variant = (name, fn) => ({
	name,
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", fn)); },
	content(){ div.c("surface pad", fn); },
});

const tree = () => new Page({
	title: "Form field",
	icon: "input",

	children: [variant("invalid", invalid), variant("select", chooser), variant("form", form)],

	content(){
		div.c("surface pad", field);
		h2("Variants");
		this.previews().style({ "--column": "9em", "--thumb-max": "4.5em" });
	},
});

export default new Page({
	meta: import.meta,
	title: "Unify",
	description: "ui/ joins the one page system, the exhibit lays itself out mobile → mega, and any demo can carry variants.",
	icon: "join_inner",

	content(){

		md("**One page system everywhere.** Three problems, one thesis: a reader should find any thing by clicking through previews, and every thing they land on should be the *same* thing. Nothing below is a screenshot — the box in the middle is a real `Page` tree running the pattern it describes.");

		h2("Before / after");

		md(`| | before | after |
|---|---|---|
| **the \`ui/\` index** | a \`previews()\` wall + three token overrides | \`initialize(){ this.catalog(); }\` — the rail every other section wears |
| **a \`ui/\` leaf** | \`palette()\` + \`copy()\` + prose + loose \`demo()\` boxes | \`demo.exhibit()\`: the component live on a stage, the bar wired to it, the template open beside it |
| **preview mechanisms** | four (cards, \`palette()\`, \`copy()\`, in-page \`demo()\`) | **one** — \`preview_card()\`, at three zooms |
| **the exhibit's DOM** | four siblings, each picking its own page track | one \`bleed\` band that lays itself out |
| **at 3440** | a 3020px render above a 936px code block | 1767px render, 661px of code **beside** it |
| **at 390** | 2em of gutter on every side of the render | the render is the full 390 |
| **a demo's sub-examples** | scrolled past, below the fold | child pages, real urls, cards under a \`Variants\` heading |
| **copy to clipboard** | \`ui/parts.js\`, on 19 pages | \`demo.source()\`, on every detail page on the site |`).ac("wide");

		h2("The band, measured");

		md("The exhibit is now one `bleed` block holding a **render column** (`flex: 3 1 84em`) and a **definition column** (`flex: 1 1 32em`). `flex-wrap` and a basis, not a media query — the width that varies is the band's, and the band is what knows it. The bases sum past `--breakout`'s own `96em` knee on purpose:");

		md(`| viewport | band | render | definition | |
|---:|---:|---:|---:|---|
| 390 | 390 | **390** | 390 | flush — the gutter is 16% of a phone |
| 810 | 810 | 745 | 745 | stacked, on the axis |
| 1440 | 839 | 772 | 772 | **byte-identical to before** |
| 3440 | 2698 | **1767** | **661** | the code moves beside the render |`).ac("wide");

		md("Measured in a real browser at all four, on `ui/field`, `styles/sections/hero`, `styles/layouts/cards` and a `demo.tree()` page: **no console errors and no horizontal overflow anywhere.** Below ~2.5K nothing moves at all, which is the whole reason the split is a basis and not a breakpoint — a laptop sees the layout it already had.");

		h2("Variants — the simple example is the category");

		md("Any demo page can now carry child variants. `demo.exhibit({ page: this, … })` renders `h2(\"Variants\")` and `this.previews()` when the page has children and nothing when it doesn't, so `styles/sections` and `styles/layouts` gained the capability by adding one word each. **Zero new preview mechanisms** — the cards are `Page.css`'s, the same ones the rail is made of.");

		demo.app(tree(), { nav: true }).ac("wide").style("height", "33em");

		md("**Click a card.** That is `/framework/ui/field/` and its three real children, running in a box: the primary above, its variants below as live cards, each one a url of its own. The address bar never moves — `demo.app()` plays App and Router for this tree alone.");

		md("```js\nchildren: [\n    demo.page(\"invalid\", invalid, { note: \"…\" }),\n    demo.page(\"select\", chooser, { note: \"…\" }),\n],\n\ncontent(){\n    demo.exhibit({ page: this, stage: …, def: field, note: \"…\" });\n}\n```");

		md("⚠ The heading and the wall are emitted **outside** the band, as direct children of the page: `previews()` carries `bleed`, and both that track and its `--gutter-x` payback are written with a child combinator.");

		h2("Go and look");

		md("- [UI](/framework/ui/) — the index, now a rail of twenty live cards\n- [Form field](/framework/ui/field/) — three variants, the fullest conversion → [invalid](/framework/ui/field/invalid/) · [select](/framework/ui/field/select/) · [form](/framework/ui/field/form/)\n- [Data table](/framework/ui/table/) — a function component; its `file:` points at `table.js`, not `page.js`\n- [Tooltip](/framework/ui/tooltip/) — the out-of-flow case, and the `pad` wrapper that is part of its template\n- [Hero](/framework/styles/sections/hero/) · [Cards](/framework/styles/layouts/cards/) · [range](/framework/styles/elements/forms/range/) — unchanged pages, on the new band\n- [demo — design record §19](/framework/ext/demo/) · [ui — design record](/framework/ui/)");

		h2("Per-page judgment calls");

		md("Nineteen for nineteen took the exhibit: the brief allowed a page to keep prose where a render+code assembly would be forced, and not one of them was that page. What differed is only **what became a variant**.");

		md(`| pages | variants | the call |
|---|---|---|
| \`table\` \`timeline\` \`kbd\` | \`num\` \`cells\` · \`single\` · \`keys\` \`bare\` | the three real functions — \`file:\` points at the component's own \`.js\`, because that file *is* the lesson |
| \`field\` | \`invalid\` \`select\` \`form\` | its trailing "two fields is a form" demo became the third variant rather than staying a box |
| \`card\` \`stats\` \`alert\` \`pagination\` \`tags\` \`avatar\` \`progress\` | 2 each | palette entry + trailing demo; in five of the seven those were **already the same function** |
| \`crumbs\` \`badge\` \`toolbar\` \`panel\` \`menu\` \`accordion\` | 1 each | the palette's second entry and the page's trailing demo were literally the same \`const\` |
| \`dialog\` | \`open\` | the primary is the real modal — Esc, focus trap and all; the variant is what \`showModal()\` shows, because a closed \`<dialog>\` renders nothing on a card |
| \`tooltip\` \`menu\` | — | the templates carry a \`pad\` wrapper: bubble and panel are out of flow, and on a flush render they would be invisible rather than clipped |
| \`stats\` \`timeline\` | — | keep \`card: "wide"\` / \`card: "tall"\` — the rail already knows to reinterpret a wall claim |`).ac("wide");

		md("**Card zoom went `zoom-75` → `zoom-50`.** A rail is 19em with `--thumb-max: none`, so twenty three-quarter-scale renders made a rail four screens tall — and `zoom-50` is what `demo.page()`'s card already used, so a component card and a variant card are now the same size.");

		h2("Also fixed");

		md("**`.demo-note` had no padding outside a `.demo`.** It read `padding: var(--demo-pad)` with no fallback and only `.demo` declares that token, so on *every* exhibit page the caption was a tinted, hairlined strip with its text against both edges. Invalid at computed-value time is not an error anybody sees. The box treatment is now scoped to `.demo > .demo-note`; on a page the caption is muted prose under the source, which is what it always meant.");

		h2("Open");

		md("- **A tall bare stage letterboxes on a mega monitor.** A `demo.tree()` with `height: \"18em\"` in a 1900px render column is a 7:1 strip. The column caps nothing on purpose; if this bites, the cap belongs on the *tree*, which is the thing that knew it wanted a window.\n- **The definition column does not stick.** Beside a tall render at 3440 you scroll the code out of view. `position: sticky` is three lines and has no asker yet.\n- **`/web/layout/tracks/` still hand-rolls its exhibit** — it overrides `demo.tree()`'s `content()` to bleed the stage and print the file rather than the definition. Last page on the site outside the assembly, and its lesson genuinely is the page template.\n- **`Variants` is a fixed word.** *Related* was the other candidate; a config key for it would be API surface forever, so the word is the API — rename it in one place if it turns out wrong.\n- **The mobile flush is a `36em` media query.** It bends `doc/layout.md`'s one-left-edge rule exactly as far as \"the measure is for reading\" already does. If a phone exhibit ever reads as detached rather than generous, that is the number to move.");

		h3("Not done, deliberately");

		md("The `--gutter-x` payback rules in `stage.css` were **left in place** rather than deleted: they no longer match an exhibit's stage, but `styles/layouts/word.js` still composes a stage without the assembly and needs them. That file is a sibling agent's this session.");
	},
});
