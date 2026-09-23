import { Page, md, div, p, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on the day board — the ordinary page grid. Prose in
                main at --measure; the four headline cards claim wide so they
                can sit in a row instead of stacking a phone-width column.
   2 SIZE       this is the whole page: one intro line, four cards, the total.
                Everything else is one click down inside the cards themselves
                (md.details renders each doc/*.md collapsed in place).
   3 OWN LAYOUT a grid auto wall, four known items — auto-fit with a floor,
                never auto-fill (four cards, not a reserved fifth track).
   4 REGIONS    two: the intro + total, and the four-card wall (which also
                holds the collapsed detail).
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN — the brief's own words. No template literals, plain "…"
     strings with \n; no new CSS class names, existing utilities + .style(). */

const DOCS = [
	{
		title: "The day",
		file: "day.md",
		icon: "summarize",
		text: "34 tasks landed today for about $552. What each group of them built, the full cost table sorted by spend, the five biggest spenders, and a timeline of what took longest.",
	},
	{
		title: "The laws said more than once",
		file: "laws.md",
		icon: "gavel",
		text: "Fifteen rules pulled from today's chat — the layout never jumps, hold for seconds not minutes, no approve on everything — with where each one is written now, or that it isn't yet.",
	},
	{
		title: "Where the system stands",
		file: "state.md",
		icon: "schedule",
		text: "Nine tiers, three lines each: the fast assistant, the master assistant, the mastermind, task masterminds, minions, the log, the boards, live reload, worktrees.",
	},
	{
		title: "What goes where",
		file: "where.md",
		icon: "rule",
		text: "A table of ten kinds of thing (a decision, a proof, a recording, a card that grew into a page) and where each belongs, then five ranked suggestions for making the whole system easier to follow.",
	},
];

export default new Page({
	meta: import.meta,
	title: "System retro — 2026-09-22",
	description: "The day's report, the laws said more than once, where the agent system stands, and what goes where.",
	icon: "history_edu",

	content(){

		p("Six kinds of agent worked today — the mastermind, one fast assistant, and 34 landed minion tasks — for ",
			b("about $552"),
			". Four reports, each one click down: what happened, what you said more than once, where every " +
			"tier of the system actually stands tonight, and the rules for what goes where.");

		this.docs();

		p.c("muted", "Each one in full, without leaving this page — click a title to open it.");

		this.reading();

		p.c("muted", "Written 2026-09-22 as the system retrospective the owner asked for while away for the " +
			"hour. Source: the run ledger at ai/2026-09-22/mastermind-servex/task.jsonl, read start to " +
			"finish, plus the tiers-design, worktree-design and reload-rethink reports it names.");
	},

	docs(){
		return div.c("grid auto gap", () => {
			DOCS.forEach(d => { this.doc_card(d); });
		}).style({ "--column": "16rem" }).ac("wide");
	},

	doc_card(d){
		return div.c("card flex v gap-25", () => {
			p.c("h4", d.title);
			p(d.text);
			p.c("muted", "doc/" + d.file);
		});
	},

	/* The four docs, rendered and collapsed — one click down, without leaving
	   the page. Same pattern as tiers-design: md.details reads the file fresh
	   from disk, so there is nothing here to keep in sync by hand. */
	reading(){
		return div.c("flex v gap-25", () => {
			DOCS.forEach(d => {
				md.details(import.meta, "doc/" + d.file, d.title + " — doc/" + d.file);
			});
		}).style({ "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},
});
