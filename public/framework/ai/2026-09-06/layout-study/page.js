import { Page, md, div, span, h2 } from "/app.js";

const META = import.meta;

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a page in `/framework/ai/`'s catalog detail column — a normal page
                grid, `main` for prose and `wide` for the leftover. Not a columns row.
   2 SIZE       prose at `--measure`; the picture and the table claim `wide`, so the
                four cards sit on one row from ~1100px and wrap to two below it.
   3 OWN LAYOUT `.flow` prose, one `.wall` of four cards, one small table. Nothing else.
   4 REGIONS    one — core's. `Plan` is the only child and holds the long form.
   5 PREVIEW    core's default card, on the day board.

   ⚠ ONE SCREEN. The plan is ~600 lines; this page is what a reader needs before
     deciding to open it. Detail nests one click down, never here.
   ⚠ Spacing is the three ramps (`--pad-ramp` `--gap-ramp` `--flow-ramp`), never a
     hand-typed constant — the site-wide pass landed this morning. */

// The four things nineteen places become, and what each one is made of today.
const BECOMES = [
	{
		name: "core/Layout",
		is: "The browsable tree. Thirty layouts, one column first, filters that default to all.",
		from: ["imagine/layouts · 18 as data", "DesignTool/library · 11 measured", "styles/layouts · 33 as pages"],
		note: "a port, not a design job",
	},
	{
		name: "demo",
		is: "The one demo system. It already has the viewport, the handle, the path bar and the toolbar.",
		from: ["ext/demo · 202 callers", "+ a title", "+ a footer"],
		note: "90% already built",
	},
	{
		name: "core/Section",
		is: "A plain div with a 2.5em floor that, when editing is on, offers one control: pick an approved layout.",
		from: ["imagine/sections · the prototype", "ext/Playground · the gesture"],
		note: "no padding schemes",
	},
	{
		name: "LayoutRules",
		is: "Three checks, dev only, one dashed outline. The first is size: this box is narrower than this layout is proven at.",
		from: ["design/layout/approved · the bar", "styles/stacks · the contrast data", "styles/rules · the prose"],
		note: "content scale is CSS, not a rule",
	},
];

// The census, rolled up. The full nineteen-row table is in the plan.
const CENSUS = [
	["Catalogues of shapes", "imagine/layouts · styles/layouts · DesignTool/library · design/layout/approved", "62 layouts, three times over", "become core/Layout's thirty"],
	["Demo chrome", "ext/demo · styles/layouts/full.js · imagine/layouts/LayoutsCard.js", "202 callers, and two rivals", "ext/demo wins; the rivals die"],
	["Layout editors", "ext/Playground · imagine/sections", "0 importers · 2 importers", "become core/Section's overlay"],
	["Control surfaces", "ext/layout · ext/Panel · ext/Panel/Workspace", "12 · 7 · 1 importers", "all three stay, untouched"],
	["Vocabularies", "design/vocabulary · styles/doc · paging/blocks.js · styles/elements", "29 tags · 5 words · 7 shapes", "become the filter facets"],
];

const card = it => div.c("surface pad flow").style({ borderRadius: "0.4em" }).append(() => {
	// ⚠ NOT `.h4` — this theme renders it uppercase and letter-spaced, which turned
	//   `core/Layout` into CORE/LAYOUT and lost the casing that carries the meaning.
	span(it.name).style({ display: "block", fontWeight: "700", marginBlockEnd: "calc(var(--flow-ramp) * 0.3)" });
	span.c("muted", it.is).style({ display: "block", fontSize: "0.95em" });
	div.c("flex v").style({ gap: "calc(var(--gap-ramp) * 0.2)", marginBlockStart: "calc(var(--flow-ramp) * 0.5)" })
		.append(() => it.from.forEach(line => span.c("muted", line).style({ fontSize: "0.85em" })));
	span.c("muted", it.note).style({ display: "block", marginBlockStart: "calc(var(--flow-ramp) * 0.4)", fontStyle: "italic", fontSize: "0.85em" });
});

export default new Page({
	meta: META,
	title: "One layout system",
	description: "Nineteen places on this site answer \"how is a page arranged\". The census of all of them, and the plan that makes four.",
	icon: "dashboard_customize",

	children: {
		Plan: {
			icon: "menu_book",
			description: "The full plan: the nineteen-row census, the demo decision, core/Layout, LayoutRules, core/Section, the template seam, four slices, what to delete.",
			content(){ return md.file(META, "plan.md", { h1: false }); },
		},
	},

	content(){

		md("**Nineteen directories on this site answer \"how is a page arranged\". Nine of them are the same shapes written out again.** "
			+ "This is the census of all nineteen and the plan that turns them into four things — and the four are mostly a port, "
			+ "because the shapes already exist.");

		md("**What becomes core: `Layout` and `Section`, both extending `Page`** — a layout declares an arrangement of named slots "
			+ "and the width range it is proven at, and a section picks one. **A layout owns no content**, which is what lets thirty of "
			+ "them be browsed without writing thirty pages: the tree pours the same six stress fixtures into every layout's slots.");

		h2("The four");
		div.c("wide wall").style({ "--column": "15em", gap: "var(--gap-ramp)" }).append(() => BECOMES.forEach(card));

		h2("The census, rolled up");
		md("Five groups; the full nineteen-row table, one row per directory opened, is in the plan.\n\n"
			+ "| group | where | today | becomes |\n|---|---|---|---|\n"
			+ CENSUS.map(row => "| **" + row[0] + "** | " + row[1] + " | " + row[2] + " | " + row[3] + " |").join("\n"));

		h2("Three things the census found");
		md("1. **`ext/layout` is not dead.** The brief said one importer; there are **twelve files**, including `ext/demo/shell.js` — "
			+ "which is why every demo on the site can wear a control bar. It is the control surface, not a rival catalogue.\n"
			+ "2. **There is no missing catalogue — there are three, and they disagree by accident.** All three re-list the five surface "
			+ "words by hand.\n"
			+ "3. **The demo consolidation is 90% done.** Of the owner's five demo parts, exactly two do not exist: a title and a footer.");

		h2("Four slices");
		md("Each leaves the site green. **A and C1 run together** — different files. Then B, then C2 and D.\n\n"
			+ "- **A · `core/Layout` + the tree.** Thirty layouts ported, each opening its viewport at its own natural width, with a "
			+ "seven-width responsiveness strip beside it. No file outside `core/Layout/` changes.\n"
			+ "- **B · `core/Section` + the picker.** One overlay button that moves zero pixels; a refresh resets it.\n"
			+ "- **C · the demo consolidation.** A title and a footer on `ext/demo`; then the deletions.\n"
			+ "- **D · templates linked.** Sixteen lines on `Page.prototype`: `make()`, `views`, `update()`. No events, no state machine.");

		md("**About 2,600 lines deleted against about 700 added** — and 1,895 of the deletion is one tool with zero importers.");

		md("**[Read the plan →](./plan/)** — the nineteen-row census with importer counts, every decision in file:line, "
			+ "the three rules and what CSS answers instead, the fixture harness, the four slices written for a cold reader to execute, and the risks.");
	},
});
