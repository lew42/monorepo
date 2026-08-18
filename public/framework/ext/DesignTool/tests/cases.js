/* The corpus. Every case declares what it IS — `bad` cases name the one rule
 * they exist to trip, `good` cases claim to trip nothing — so the suite can
 * score the analyzer instead of the analyzer scoring itself.
 *
 * Breakage is written INLINE, on purpose. A stylesheet of deliberately wrong
 * rules would be a stylesheet someone later copies; here the CSS that breaks
 * the layout is the same three lines the reader is being shown.
 *
 * ⚠ INLINE MEANS THE BREAKAGE, AND NOTHING ELSE. Every case used to sit in a
 * wrapper carrying `padding: 1.5em` for looks, which is not what any of them
 * demonstrate — and on `Wide measure` that stray 2em stepped the paragraphs
 * 32px right of the page title and misaligned the two. The page already has a
 * gutter. If a declaration here is not the thing being shown, delete it. */

import { div, p, h2, h3, a, button, span, table, thead, tbody, tr, th, td } from "/app.js";

const PROSE = "The framework has no build step, so everything under public/ is served exactly "
	+ "as written and runs in the browser as native ES modules. That constraint is the whole "
	+ "design: import paths are real URLs, a page is a file on disk, and the thing you read in "
	+ "the editor is the thing the browser executes. Nothing is compiled away between them.";

const WORDS = "Layout is measured, not eyeballed, and a ratio holds where a pixel count does not.";

const cards = (n, style) => Array.from({ length: n }, (_, i) =>
	div().style(style).append(() => { h3(`Card ${i + 1}`); p(WORDS); }));

export const cases = [

	{
		title: "Cramped card", verdict: "bad", rule: "cramped", classes: "standard",
		why: "A bordered card with no padding — the owner's original example. The text sits 0px from a line it can see.",
		build(){
			div.c("flex gap wrap").append(() => cards(3, {
				border: "1px solid var(--line)", borderRadius: "6px", padding: "0", flex: "1 1 16em",
			}));
		},
	},

	{
		title: "Wide measure", verdict: "bad", rule: "measure", classes: "dt-page", from: 1100,
		why: "Prose with nothing holding its width — ~160 characters a line at 1920 against a readable 45–85, "
			+ "and it crosses the 85 mark near 1100px. Below that the window and the live rail are already "
			+ "doing the job. Drag the handle and watch the reading move.",
		build(){ div().append(() => { h2("An unbounded column"); p(PROSE); p(PROSE); }); },
	},

	{
		title: "Clipped rail", verdict: "bad", rule: "clipped", classes: "standard",
		why: "Eight cards in a fixed row with overflow:hidden. The content exists and cannot be reached — no scrollbar, no affordance.",
		build(){
			div().style({ width: "30em", overflow: "hidden", display: "flex", gap: "0.75em" })
				.append(() => cards(8, { flex: "0 0 14em", padding: "1em", border: "1px solid var(--line)" }));
		},
	},

	{
		title: "Sideways scroll", verdict: "bad", rule: "doc-overflow", classes: "dt-page",
		why: "One child at 150% width drags the whole document into horizontal scroll — the bug every phone user meets first.",
		build(){
			div().style({ width: "150%", background: "var(--wash)" })
				.append(() => { h2("Wider than the window"); p(WORDS); });
		},
	},

	{
		title: "Illegible text", verdict: "bad", rule: "illegible", classes: "standard",
		why: "7px type, and a second block scaled to 0.3 — both render under the 10.5px floor where reading stops.",
		build(){
			div().append(() => {
				p(PROSE).style({ fontSize: "7px" });
				div().style({ zoom: "0.3" }).append(() => p(PROSE));
			});
		},
	},

	{
		title: "Tight lines", verdict: "bad", rule: "line-height", classes: "standard",
		why: "line-height 0.95 on wrapping prose — the descenders of one line touch the ascenders of the next.",
		build(){ div().style({ lineHeight: "0.95" }).append(() => { p(PROSE); p(PROSE); }); },
	},

	{
		title: "Overlapping cells", verdict: "bad", rule: "collision", classes: "standard",
		why: "Two grid children placed in the same cell. Both are statically positioned, so neither asked to overlap.",
		build(){
			div().style({ display: "grid" }).append(() => {
				div().style({ gridArea: "1 / 1", background: "var(--surface)", border: "1px solid var(--line)", padding: "1em" })
					.append(() => { h3("Underneath"); p(WORDS); });
				div().style({ gridArea: "1 / 1", background: "var(--wash)", padding: "1em", marginTop: "2em", marginLeft: "3em" })
					.append(() => { h3("On top"); p(WORDS); });
			});
		},
	},

	{
		title: "Broken rhythm", verdict: "bad", rule: "rhythm", classes: "standard",
		why: "A stack whose gaps run 8px, 8px, 96px, 8px. One item drifts and the eye reads it as a section break that isn't there.",
		build(){
			div().append(() => {
				p(WORDS).style({ margin: "0 0 8px" });
				p(WORDS).style({ margin: "0 0 8px" });
				p(WORDS).style({ margin: "0 0 96px" });
				p(WORDS).style({ margin: "0 0 8px" });
				p(WORDS).style({ margin: "0" });
			});
		},
	},

	{
		title: "Laddering column", verdict: "bad", rule: "measure", classes: "standard",
		why: "Prose in a 70px column: two words a line for a dozen lines. The classic un-reflowed grid track.",
		build(){ div().style({ width: "70px" }).append(() => p(PROSE)); },
	},

	{
		title: "Tap targets", verdict: "bad", rule: "hit-size", classes: "standard",
		why: "Controls 14px tall. Under the 24px minimum, which is a miss on a touchscreen and a squint on a mouse.",
		build(){
			div.c("flex gap").append(() => {
				["Save", "Cancel", "More"].forEach(t =>
					button(t).style({ height: "14px", minHeight: "0", padding: "0 3px", fontSize: "9px", lineHeight: "1" }));
			});
		},
	},

	{
		title: "Collapsed box", verdict: "bad", rule: "zero-size", classes: "standard",
		why: "A flex child at height 0 that still holds a paragraph — the content is in the DOM and occupies nothing.",
		build(){
			div.c("flex gap").style({ alignItems: "flex-start" }).append(() => {
				div().style({ height: "0", overflow: "visible", flex: "1" }).append(() => p(PROSE));
				div().style({ flex: "1", padding: "1em", border: "1px solid var(--line)" }).append(() => p(WORDS));
			});
		},
	},

	{
		title: "Unreachable content", verdict: "bad", rule: "unreachable", classes: "standard",
		why: "A 300px box with overflow:hidden holding ten sections. Several times more is hidden than "
			+ "shown and there is no scrollbar anywhere — the heaviest finding the tool has, because "
			+ "a reader cannot get to it by any means.",
		build(){
			div().style({ height: "300px", overflow: "hidden" })
				.append(() => cards(10, { padding: "1em", border: "1px solid var(--line)", marginBottom: "1em" }));
		},
	},

	{
		title: "Nested padding", verdict: "bad", rule: "double-pad", classes: "standard",
		why: "1.5em of inset inside 1.5em of inset, both boxes painting identically. The second one "
			+ "marks nothing — the content just sits further in than anyone meant.",
		build(){
			div().style({ padding: "1.5em" }).append(() =>
				div().style({ padding: "1.5em" }).append(() => { h3("Inset twice"); p(PROSE); }));
		},
	},

	{
		title: "Unmarked structure", verdict: "bad", rule: "invisible", classes: "standard",
		why: "Three groups of three blocks and not one surface between them. The grouping is real and "
			+ "the reader has to infer it from whitespace alone.",
		build(){
			div().append(() => Array.from({ length: 3 }, (_, g) =>
				div().append(() => Array.from({ length: 3 }, (_, i) =>
					div().append(() => { h3(`Group ${g + 1} · block ${i + 1}`); p(WORDS); })))));
		},
	},

	{
		title: "Dead widescreen", verdict: "bad", rule: "dead-space", classes: "dt-page", from: 1500,
		why: "Content pinned to 420px whatever the window does. At 3440 that leaves 87% of the screen as background. "
			+ "Not a finding below 1500px, where 420px is a reasonable column.",
		build(){
			div().style({ width: "420px" }).append(() => {
				h2("Fixed at 420px"); p(PROSE); p(PROSE); p(WORDS); p(WORDS);
			});
		},
	},

	/* ── ground truth for the GUARDS: shapes a rule used to misread ───────────
	 *
	 * `quiet` names rules that must not fire at all, which is a stronger claim
	 * than "no high findings" and the only way to test an exemption. Each of
	 * these was a real false-positive class on the site, counted in
	 * knowledge/false-positives.md. */

	{
		title: "Data table", verdict: "good", quiet: "cramped measure", classes: "standard",
		why: "A plain table as `framework.css` draws it: 4px of vertical cell padding, a rule between "
			+ "rows, and one narrow column that ladders. A row cannot hold an inset and a narrow cell "
			+ "is a column — 175 findings on one page before the guard.",
		build(){
			table.c("md").append(() => {
				thead(() => tr(() => { th("Rule"); th("What it measures"); th("Notes"); }));
				tbody(() => ["cramped", "measure", "rhythm", "gutter"].forEach(name =>
					tr(() => {
						td(name);
						td("A ratio, never a pixel count.");
						td(WORDS);
					})));
			});
		},
	},

	{
		title: "Contents wrapper", verdict: "good", quiet: "zero-size", classes: "standard",
		why: "`display: contents` — a wrapper that deliberately generates no box. Its 0×0 rect still "
			+ "holds text, which is 360 of the site's 371 `zero-size` findings.",
		build(){
			div().style({ display: "contents" }).append(() => {
				h3("Two children, one absent wrapper");
				p(PROSE);
			});
		},
	},

	{
		title: "Clamped card", verdict: "good", quiet: "clipped", classes: "standard",
		why: "A description clamped to two lines with `-webkit-line-clamp` and no `max-height` to show "
			+ "for it. The inline `code` lands on line four, outside a box that is cropping on purpose.",
		build(){
			div().style({ width: "18em" }).append(() => {
				h3("A preview description");
				p(PROSE + " It ends on a `token` several lines down.").style({
					display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: "2",
					overflow: "hidden",
				});
			});
		},
	},

	{
		title: "Repeated rows", verdict: "good", at_most: { alignment: 1 }, classes: "standard",
		why: "Twenty rows, each with one child sitting 5px off the lane the other nineteen share. "
			+ "Twenty wobbles, one declaration — and each offender is an only child, so only the "
			+ "structure roll-up can collapse them.",
		build(){
			div().append(() => Array.from({ length: 20 }, (_, i) =>
				div().append(() => div(`Row ${i + 1} — measured, not eyeballed.`).style({ marginLeft: "5px" }))));
		},
	},

	// ── the other half: layouts that should score clean ──────────────────────

	{
		title: "Good prose", verdict: "good", classes: "standard",
		why: "The house default — the `main` track at 52em, `.flow` rhythm, nothing overridden.",
		build(){ div.c("flow").append(() => { h2("A reading column"); p(PROSE); p(PROSE); p(WORDS); }); },
	},

	{
		title: "Good cards", verdict: "good", classes: "standard",
		why: "`grid auto gap` with a 14em column and real padding. Reflows on its own from phone to mega.",
		build(){
			div.c("grid auto gap").append(() => cards(6, {
				padding: "1em", border: "1px solid var(--line)", borderRadius: "6px",
			}));
		},
	},

	/* ⚠ This case was written as `.grid.auto` with `--column: 40em` — the advice
	 * the layout-design skill gave — and the analyzer failed it at 1280 with
	 * 112 characters a line. `auto-fill` with a `1fr` MAX is unbounded: at one
	 * column the track takes the whole width. A reading column needs a ceiling
	 * as well as a floor. See knowledge/thresholds.md. */
	{
		title: "Good widescreen", verdict: "good", classes: "dt-page",
		why: "Tracks bounded at both ends — `minmax(min(34em, 100%), 38em)`. Three reading columns at 3440, "
			+ "two at 1920, and at 1280 the single column stops at 38em instead of running to 112 characters.",
		build(){
			div().style({
				display: "grid", gap: "2em",
				gridTemplateColumns: "repeat(auto-fill, minmax(min(34em, 100%), 38em))",
			}).append(() => Array.from({ length: 3 }, (_, i) =>
				div.c("flow").append(() => { h3(`Column ${i + 1}`); p(PROSE); })));
		},
	},

	{
		title: "Good controls", verdict: "good", classes: "standard",
		why: "A toolbar built from `flex gap v-center` with 2.2em targets — a UI cluster on gap, not on flow.",
		build(){
			div.c("flex gap v-center wrap").style({ padding: "1em", border: "1px solid var(--line)", borderRadius: "6px" })
				.append(() => {
					span("Filter").style({ fontWeight: "600" });
					["All", "Open", "Landed"].forEach(t => button(t).style({ minHeight: "2.2em", padding: "0 0.9em" }));
					a("Reset").attr("href", "#").style({ minHeight: "2.2em", display: "inline-flex", alignItems: "center" });
				});
		},
	},
];

export default cases;
