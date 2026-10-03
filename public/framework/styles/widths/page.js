import { Page, View, h2, h3, h4, div, p, md, img } from "/app.js";

View.stylesheet(import.meta, "widths.css");
const here = new URL(".", import.meta.url).pathname;

/* The widths lab — one measure, one margin, for cards and flowing text.
 *
 * The owner, 2026-10-03: "At 3440 the Now card's sections run the full width.
 * I don't want to just restrain them, because then you can't easily have
 * full-width pages. But with our bleed system we should have control over
 * card widths, and maybe putting the measure on them is the way: the whole
 * card hits the measure. Try putting a paragraph of text outside one of these
 * cards, just in the flow: we won't always want cards. Flowing text and cards
 * should share the same margin, and we should be able to explore the options:
 * centred, restrained, or full width."
 *
 * Content: the Now card's own three sections (core/Page/Page.css's
 * `.page-content-row.card` shape, copied exactly — h4.page-content-title +
 * div.page-content-text(md) — so this lab tests the real card, not a lookalike).
 */

const SECTIONS = [
	{
		title: "AI system: the dashboard you're reading",
		text: "**Landed today**\n- Cards show their content: a section's text appears under its title, on white cards over a gray background, and the card scrolls.\n- No more 404 on Your prompts.\n- AI 2 is out of the menu, the first step of retiring it.\n\n**Working on now**\n- Readable cards: previews that say something real, plain-word titles, the Activity tab bug.\n- The drawer: a tight header, one scrolling chat area, the talk box pinned to the bottom.",
	},
	{
		title: "Page system: how every page stores and draws itself",
		text: "**Landed today**\n- One simpler data model: a Page extends an Item directly; every value lives in `data`.\n- Simpler log lines: the nesting of a line IS its path.\n- Dragging is opt-in: only a list marked sortable can be reordered.\n\n**Working on now**\n- Framework home grids: no gaps under short cards, a switch that labels every grid.\n- Layout check: links styled the same everywhere; a merge fails when text touches its box's edge.\n- This lab: cards and flowing text on one margin; backgrounds that lighten or darken by what they sit on.",
	},
	{
		title: "Servex and your machine",
		text: "**Landed today**\n- Leftover dev servers cleaned up: 13 node processes, down from 59.\n- Every test browser is logged and closed when its job ends.\n- Spending follows results: an agent gets more budget only after it shows something working.\n\n**Problems known about**\n- Masterminds fall asleep when their first task lands, even with work queued.\n- Usage is over pace: about three fifths of the week used, so agents run on Sonnet with small budgets.",
	},
];

function card({ title, text }){
	return div.c("page-content-row card", () => {
		h4.c("page-content-title", title);
		div.c("page-content-text", () => md(text));
	});
}

function cards(){ return div.c("page-content-rows", () => SECTIONS.forEach(s => card(s))); }

export default new Page({
	meta: import.meta,
	title: "Widths",
	description: "One measure, one margin — four ways to size the same three cards.",
	icon: "straighten",
	width: "full",

	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/1920.png").attr("alt", nav.label));
	},

	content(){
		md("**The same three cards, the Now card's own, in four arrangements.** Every arrangement below uses the SAME markup and the real `.page-content-row.card` class — only the wrapper around `.page-content-rows` changes. Scroll through all four, then the recommendation at the bottom.");

		md("**A finding before the four, because it changes what \"full width\" even means here:** a page is a CSS grid (`core/Page/Page.css`, `.page`) with a `main` track capped at `--measure` (40em) and a `wide` track that takes every leftover pixel — a direct child gets `main` by default, and only opts into `wide` by name. **The owner's bug has nothing to do with that grid at all** — the AI board's card detail view (`ux/Card/Card.css`, `.page.ai2-card-page`) overrides the template entirely for its own split-pane layout (`grid-template-columns: minmax(0, 1fr)`, one column, no `main`/`wide` tracks), so neither the cap nor the opt-out ever reached it: nothing capped it. Arrangement 1 recreates that absence — a `wide`-track block with the row's own cap removed too, the same net effect the real bug has.").ac("color-fail");

		h2("1 — Full width (the ai2 bug, recreated)");
		md("`.page-content-rows` with no cap, in the `wide` track. At a narrow window it reads as a column by accident; past about 1600px the row just keeps stretching — this is what the Now card's panel still looks like today, outside this lab.").ac("muted");
		div.c("widths-uncapped wide", () => div.c("page-content-list flow", () => cards()));

		h2("2 — Restrained, start-aligned (now the default, everywhere)");
		md("Plain, default markup — no extra class, in the ordinary `main` track. `.page-content-rows` itself is now capped at `--measure` in `core/Page/Page.css` (today's fix, below), so this works even in a panel with no `main`/`wide` tracks at all — which is the point: the AI board's card detail panel gets the fix for free, with no change to its own layout.").ac("muted");
		div.c("page-content-list flow", () => cards());

		h2("3 — Restrained, centred");
		md("The same cap, centred instead — `margin-inline: auto` added on top, nothing else different (the framework's own `.measure` utility redeclares `--measure` to its own smaller default, 34em, so this lab adds one narrow local class instead of reusing it, to keep the comparison apples-to-apples at 40em).").ac("muted");
		div.c("page-content-list flow widths-centre", () => cards());

		h2("4 — Mixed: flowing text + cards, one shared left edge");
		md("The owner's literal ask: a paragraph of plain prose, outside any card, directly above the three cards. No extra class needed here either — the `main` track's own cap applies to a bare paragraph exactly the way it applies to `.page-content-list`, so they already land on one left edge and one width.").ac("muted");
		p("This paragraph is what the owner asked to see: real flowing prose, sitting in the normal page flow with no card around it, sharing one margin with the cards underneath. A page won't always want cards — sometimes the content is just a paragraph, and it should line up with whatever cards sit near it rather than starting from a different edge.");
		div.c("page-content-list flow", () => cards());

		h2("Screenshots");
		md("At 1920 and 3440 — the full page, all four arrangements stacked, so the widescreen case (the owner's actual complaint) and the laptop case are both on record.").ac("muted");
		div.c("grid auto gap", () => {
			figure_shot("1920.png", "The lab at 1920.");
			figure_shot("3440.png", "The lab at 3440 — arrangement 1 (full width) stretching, and the other three staying put.");
		});

		h2("Recommendation");
		md.details(import.meta, "recommendation.md", "The finding — which arrangement, and what the alternative was");
	},
});

function figure_shot(file, caption){
	div.c("flow-figure").append(() => {
		img.c("design-shot").attr("src", here + "shots/" + file).attr("alt", caption).style({ "max-width": "100%", border: "1px solid var(--line)", "border-radius": "var(--radius)" });
		p.c("muted", caption).style({ "font-size": "0.85em" });
	});
}
