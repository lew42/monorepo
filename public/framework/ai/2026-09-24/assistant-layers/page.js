import { Page, div, p, span, b, a, details, summary, table, tr, th, td } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-24/'s board — the ordinary
                page grid. The lead sits in main at --measure; the picture, the
                topic wall and the fold claim wide.
   2 SIZE       the picture is capped at 60em, left-aligned (margin-inline: 0),
                like concurrency. Its lanes wrap to one column on a narrow screen.
   3 OWN LAYOUT the picture is flex v gap: a "you" line, a row of two card
                columns (assistant, manager, minions), then master and mastermind. The topics are a grid auto
                wall (--column 20rem). The fold is one native details.
   4 REGIONS    three: the lead and the picture, the topic wall, the fold.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN: lead, picture, four one-sentence topics. Detail is in doc/.
   ⚠ No template literals in this file, and no new CSS class names: existing
     utilities plus .style() only. */

/* A .md in this dir renders at md/<path>/ (core/Page/Markdown.js); a bare .md
   link would serve raw text. Resolved against import.meta, never the document. */
const route = f => new URL("md/" + f.replace(/\.md$/, "/"), import.meta.url).pathname;

const TOPICS = [
	{ title: "Two agents per card", text: "Each card has an assistant that turns your words into UI, and a manager that plans the work and starts minions." },
	{ title: "Starting work, exactly once", text: "A manager claims its topic on the claims list first, so two cards can never start the same work." },
	{ title: "Who may message whom", text: "Servex stamps who sent every message, and a table says who may talk to whom, so nobody can pretend to be you." },
	{ title: "What each agent knows", text: "Every card shows how full each agent's memory is, with Compact and Recycle buttons to shrink it." },
];

const TIERS = [
	["fast", "Sonnet", "card assistants, the master assistant, minions that build"],
	["manager", "Opus", "card managers, task masterminds"],
	["architect", "Opus", "mastermind-servex"],
	["scan", "Haiku", "minions that only scan"],
];

const RULES = [
	["the owner (a tab, the dashboard)", "anyone"],
	["a card assistant", "its own card's manager, the master assistant, the Servex mastermind"],
	["a card manager", "its own card's assistant, its own minions, the Servex mastermind"],
	["the master assistant", "any card assistant, the Servex mastermind"],
	["the Servex mastermind", "anyone Servex runs"],
	["a minion", "its parent only (the automatic wake)"],
	["anyone", "whoever messaged them in the last 30 minutes, so a reply always goes back"],
];

export default new Page({
	meta: import.meta,
	title: "Assistant layers",
	description: "One assistant per card, one master assistant, one launcher.",
	icon: "groups",

	content(){

		p(b("You talk on any card; its own assistant answers and turns it into UI, and its own manager does the work; the master assistant and the Servex mastermind watch across all cards."));

		this.picture();

		this.topics();

		this.tiers();

		this.rules();
	},

	/* Boxes built from utilities, so it reads at 400 and at 3440 with no SVG. */
	picture(){
		return div.c("flex v gap-50", () => {
			this.arrow("You  ↓  speak onto a card");
			div.c("flex auto gap", () => {
				this.column("Card A", "a");
				this.column("Card B", "b");
			}).style({ "--column": "18rem" });
			this.arrow("┄ dashed: both card assistants are heard by the master assistant · ↓ each manager \"claims a topic\"");
			div.c("flex auto gap", () => {
				this.box("master-assistant", "hears every card, launches nothing", "var(--ink)").style({ "border-style": "dashed" });
				div.c("flex v gap-25", () => {
					this.box("mastermind-servex", "systems architect; audits, keeps the claims list, launches nothing", "var(--prim)");
					this.box("claims list 🔒", "one manager per topic", "var(--ink)");
				});
			}).style({ "--column": "18rem" });
		}).style({ "max-width": "60em", "margin-inline": "0" }).ac("wide");
	},

	column(card, id){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", card);
			this.box("assistant-" + id, "turns your words into UI", "var(--ink)");
			this.arrow("↓  hands off work");
			this.box("manager-" + id, "plans, starts minions; session kept for the card's life", "var(--prim)");
			this.arrow("↓  starts");
			div.c("flex gap", () => {
				span.c("card size-small", "minion 1");
				span.c("card size-small", "minion 2");
			});
		}).style({ "--card-edge": "var(--ink)" });
	},

	box(title, line, edge){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", title);
			p.c("muted", line);
		}).style({ "--card-edge": edge });
	},

	arrow(text){
		return p.c("muted", text).style({ "padding-inline-start": "0.5em" });
	},

	topics(){
		return div.c("grid auto gap", () => {
			TOPICS.forEach(t => { this.topic(t); });
		}).style({ "--column": "20rem" }).ac("wide");
	},

	topic(t){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", t.title);
			p(t.text);
			p.c("muted", a("doc/design.md").href(route("doc/design.md")));
		});
	},

	tiers(){
		return details(() => {
			summary("Roles, for any provider — the tier table");
			p("A role is its skill, its tier, its effort and its tools, and a tier maps to a model in one place, so moving to another provider is a one-line change.");
			table(() => {
				tr(() => { th("tier"); th("model today"); th("used by"); });
				TIERS.forEach(r => { tr(() => { td(r[0]); td(r[1]); td(r[2]); }); });
			});
		}).style({ "max-width": "60em", "margin-inline": "0" }).ac("wide");
	},

	rules(){
		return details(() => {
			summary("Who may message whom — the table");
			table(() => {
				tr(() => { th("from"); th("may message"); });
				RULES.forEach(r => { tr(() => { td(r[0]); td(r[1]); }); });
			});
		}).style({ "max-width": "60em", "margin-inline": "0" }).ac("wide");
	},
});
