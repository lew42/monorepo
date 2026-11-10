import { Page, md, demo, div, h1, h2, h3, h4, p, ul, ol, li, a } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran. Every demo here is a bare framework
// element: no class, no page CSS. `styles/elements/text/` already carries the full
// inline-element reference (emphasis, semantic tags, blockquote, hr); this page is
// the ui-tier entry — the smallest useful unit at the top of the kit's tree, so the
// library wall's Elements band has something to link to (see B below).
const h1_ = () => h1("Page title");
const h2_ = () => h2("Section title");
const h3_ = () => h3("Sub-section title");
const h4_ = () => h4("Annotation heading");
const para = () => p("Body copy, with ", "a run of text at the paragraph size.");

const items = () => div.c("flex v gap", () => {
	ul(() => { li("First item"); li("Second item"); li("Third item"); });
	ol(() => { li("First step"); li("Second step"); li("Third step"); });
}).style("--gap", "calc(var(--gap) * 0.8)");

const link = () => p("A link ", a("inside text").href("/framework/"), " keeps the body's colour and takes the accent as an underline.");

// The rhythm between elements — not a new element, the `flow` spacing that already
// applies to any run of blocks: a heading tighter to what follows it than a
// paragraph is, a card no different from a paragraph (see C below).
const flow = () => div.c("flow", () => {
	h2("A section");
	p("A paragraph under the heading, spaced by `--flow`.");
	div.c("card", () => {
		h3("A card");
		p("The same spacing rule reaches a card as it reaches a paragraph.");
	});
	h2("A second section");
	p("Another paragraph, so the rhythm repeats.");
	ul(() => { li("A list"); li("closes the run."); });
});

export default new Page({
	specimen: h1_,
	meta: import.meta,
	title: "Text",
	description: "The element the kit's tree starts from — headings, a paragraph, a list, a link, and the rhythm between them. No class, no page CSS.",
	icon: "text_fields",

	children: [
		demo.page("h2", h2_, { note: "`h2` — 1.4em/700. Size and weight only; margins are rhythm and belong to whatever arranges the content (`styles/elements/text/`)." }),
		demo.page("h3", h3_, { note: "`h3` — 1em/700." }),
		demo.page("h4", h4_, { note: "`h4` — 0.8em/700, uppercase, tracked. The level `.h4` lends to a label that isn't literally a heading (a card's `div.c(\"h4 muted\", …)` eyebrow)." }),
		demo.page("p", para, { note: "Body copy: `clamp(1rem, 0.68rem + 0.36vw, 1.25rem)`, line-height 1.5." }),
		demo.page("li", items, { note: "`ul, ol { padding-left: 1.2em }` — the entire list stylesheet. Markers stay the browser's own." }),
		demo.page("link", link, { note: "A link inside prose keeps the body's colour and underlines in the accent — scoped to text, not to every `a` (`styles/elements/text/`, \"links\")." }),
		demo.page("flow", flow, { note: "Two headings, two paragraphs, a card and a list, in one column — the gap above an `h2` is the same whether a `p` or a `.card` came before it (fixed here, item C of this step: `framework.css`'s flow rule now reads `:is(p, .card, …)` instead of just the elements it used to list)." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(h1_, steer).ac("bleed"),
			def: h1_,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.text()` and no `.ui-text`.** `h1`–`h4` and `p` are plain elements; `framework.css` sets their size, weight and tracking and nothing else.",
		});

		md("## Elements, not a component");

		md("Every other page in this kit is built from these: a card's title is an `h3`, its body a `p`; a menu row's label is a `span` borrowing `h4`. This page is the one stop before the tree branches into parts, cards and menus — see the kit's order on [Library](/framework/library/?at=ui).");

		md("## The full reference");

		md("[styles/elements/text/](/framework/styles/elements/text/) carries the rest of the vocabulary this page doesn't repeat: `h5`/`h6`, every inline element (`strong`, `em`, `mark`, `abbr`, `time`…), `blockquote` and `hr`. That page is the CSS layer's own doc of what a bare element looks like; this one is the ui kit's entry point into the same elements, kept short on purpose.");

		md("Next: [Icon](/framework/ui/icon/) — the next element up the tree.");
	},
});
