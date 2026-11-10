import { Page, md, demo, div, h1, h2, h3, h4, p, ul, ol, li, a } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran. Every demo here is a bare framework
// element: no class, no page CSS. `styles/elements/text/` already carries the full
// inline-element reference (emphasis, semantic tags, blockquote, hr); this page is
// the ui-tier entry — the smallest useful unit at the top of the kit's tree, so the
// library's Elements band has something to link to.
const h1_ = () => h1("Page title");
const h2_ = () => h2("Section title");
const h3_ = () => h3("Sub-section title");
const h4_ = () => h4("Annotation heading");
const para = () => p("Body copy, with ", "a run of text at the paragraph size.");

const items = () => div.c("flex v gap", () => {
	ul(() => { li("First item"); li("Second item"); li("Third item"); });
	ol(() => { li("First step"); li("Second step"); li("Third step"); });
});

const link = () => p("A link ", a("inside text").href("/framework/"), " keeps the body's colour and takes the accent as an underline.");

// The rhythm between elements — not a new element, the `flow` spacing that already
// applies to any run of blocks. Two transitions, side by side: one `h2` follows a
// `p`, the other follows a `.card`. Measured headless at 400px: 63px above both —
// `margin-block-start: var(--flow)` reads the NEXT element's own font-size, never
// what came before it, so the two transitions were always equal. `framework.css`'s
// `.flow` rule did need a fix, but for a different reason: `.card`'s OWN box is also
// `.flow` (`PageCard.View` renders `"part-card card flow"`), so without `:not(.card)`
// this same rule was reaching INSIDE every card and overriding its title-to-body
// gap. See the task log for the full before/after.
const flow = () => div.c("flow", () => {
	div.c("h4", "after a paragraph");
	p("A paragraph, ahead of the next heading.");
	h2("Same gap above this heading…");
	div.c("h4", "after a card");
	div.c("card", () => {
		h3("A card");
		p("Its own body text.");
	});
	h2("…as above this one.");
});

export default new Page({
	specimen: h1_,
	meta: import.meta,
	title: "Text",
	description: "The element the kit's tree starts from — headings, a paragraph, a list, a link, and the rhythm between them. No class, no page CSS.",
	icon: "text_fields",

	children: [
		demo.page("h1", h1_, { note: "`h1` — 1.9em/900, `-0.015em` tracking. Size, weight and tracking only (`styles/elements/text/`)." }),
		demo.page("h2", h2_, { note: "`h2` — 1.4em/700. Size and weight only; margins are rhythm and belong to whatever arranges the content (`styles/elements/text/`)." }),
		demo.page("h3", h3_, { note: "`h3` — 1em/700." }),
		demo.page("h4", h4_, { note: "`h4` — 0.8em/700, uppercase, tracked. The level `.h4` lends to a label that isn't literally a heading (a card's `div.c(\"h4 muted\", …)` eyebrow)." }),
		demo.page("p", para, { note: "Body copy: `clamp(1rem, 0.68rem + 0.36vw, 1.25rem)`, line-height 1.5." }),
		demo.page("li", items, { note: "`ul, ol { padding-left: 1.2em }` — the entire list stylesheet. Markers stay the browser's own." }),
		demo.page("link", link, { note: "A link inside prose keeps the body's colour and underlines in the accent — scoped to text, not to every `a` (`styles/elements/text/`, \"links\")." }),
		demo.page("flow", flow, { note: "Two transitions into an `h2` — one after a `p`, one after a `.card` — measuring the same 63px at 400px: `--flow` reads the heading's own font-size, never its predecessor's. `framework.css`'s flow rule did change (`:not(.card)` on `.flow > * + *`), but to stop it reaching INSIDE a card and overriding its own title-to-body gap, not to change this reading." }),
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
