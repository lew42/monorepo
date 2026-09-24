import { Page, md, div, p, span, b, a } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-22/'s board — the ordinary
                page grid. Prose sits in main at --measure; the ladder and the
                five doc cards claim wide.
   2 SIZE       the ladder is a diagram, so it has a natural size: capped at
                54em and left-aligned on the prose axis (margin-inline: 0), not
                centred — a capped region that centres beside left-aligned prose
                reads as two misaligned columns (layout, 2026-09-17). At 400 the
                two front-desk cards wrap to one column; at 3440 the cap holds
                and the leftover stays gutter.
   3 OWN LAYOUT the ladder is flex v gap: alternating role bands and arrow
                strips. The front desk is one flex auto pair (--column 15rem, so
                it wraps below ~31rem). The five docs are a grid auto wall.
   4 REGIONS    three: the one-paragraph intro, the ladder, the doc wall.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN: the ladder is the page. Every detail is in doc/, one click down.
   ⚠ No template literals in this file — plain "…" strings with \n — and no new
     CSS class names: existing utilities plus .style() only. */

/* Each band: the role, then one muted line carrying its id, its model and the
   log it writes, then one sentence of what it is for. */
const ROLES = [
	{
		role: "The owner",
		who: "one person, usually dictating",
		does: "Says what they want: long prompts, several things at once, watched on a live board rather than in a chat.",
		writes: "nothing — the words are captured for them",
		lead: true,
	},
	{
		role: "Fast assistant",
		who: "assistant-fast · Sonnet, low",
		does: "Echoes the words verbatim, names the thing at once, writes the card, routes it. Ten seconds, every time.",
		writes: "board.jsonl — the raw prompt and the card",
	},
	{
		role: "Master assistant",
		who: "assistant-master · Fable",
		does: "Watches the three tiers below it and says the one thing about to be forgotten.",
		writes: "the process page, and each skill's improvements.md",
	},
	{
		role: "Master-mastermind",
		who: "mastermind · Fable · exactly one",
		does: "Owns the budget and the order of the queue, and turns a long dictation into a few task briefs.",
		writes: "its run ledger, one task.jsonl for the whole run",
	},
	{
		role: "Task masterminds",
		who: "mastermind-<task> · Opus · one per task",
		does: "Owns one task end to end: makes the worktree if it needs one, fences the minions, judges every deliverable against the owner's own sentence.",
		writes: "that task's task.jsonl",
	},
	{
		role: "Minions",
		who: "minion-<task> · Sonnet builds, Opus judges, Haiku scans",
		does: "Builds one thing, proves it, lands it — then stays wakeable for follow-ups on that same page.",
		writes: "its own agent log, and the task log",
	},
];

/* What flows on each arrow. `up` is what comes back — and it is always tiny,
   because the logs carry everything and a message is only blocked or done. */
const ARROWS = [
	{ after: 0, down: "their words, verbatim, the moment they are spoken" },
	{ after: 2, down: "the same words, unfiltered, as an agent_msg — and a card already on the board", up: "an opinion, in one or two sentences, when it is asked for" },
	{ after: 3, down: "a boiled-down requirements page, and a fence", up: "taken · blocked · landed — three messages, ever" },
	{ after: 4, down: "a brief, and the exact files it may touch", up: "done · blocked — everything else is in the log" },
];

const DOCS = [
	{
		title: "The six roles",
		file: "roles.md",
		icon: "groups",
		text: "What each one does, what it never does, its model, its id, and how it is stood down. The task mastermind is the new role and gets the most room — including the one rule that stops it parking forever.",
	},
	{
		title: "Coordination",
		file: "coordination.md",
		icon: "swap_horiz",
		text: "The protocol. Logs carry everything; a direct message is only blocked or done. The envelope, how a prompt is routed when several masterminds run, what a cycle is once Servex takes three of its steps, and what done means.",
	},
	{
		title: "Version control",
		file: "version-control.md",
		icon: "account_tree",
		text: "Main tree or worktree, in five lines. Branch names. Who may commit and where — an agent may, inside its own worktree branch, and nowhere else. How a judge merges two teams, and the never-list git has earned here.",
	},
	{
		title: "The skills",
		file: "skills.md",
		icon: "menu_book",
		text: "All 19 skills in one table: who loads it, always or on demand, its line count, and keep / shrink / split / merge / retire. Then the lean always-loaded set per role — a minion at 128 lines instead of today's 427.",
	},
	{
		title: "In-process tools",
		file: "tools.md",
		icon: "build",
		text: "The rule from 2026-09-23: anything an agent would do with a shell is a tool whose handler is a node function inside Servex - the LLM triggers, node stamps, logs and follows through. What moves to tools first, and the one case where a shell still wins.",
	},
	{
		title: "The phases",
		file: "phases.md",
		icon: "flag",
		text: "Seven things phase 1 still lacks once today's four tasks land, then phase 2 as ten ordered briefs a master-mastermind can dispatch exactly as they are written.",
	},
];

export default new Page({
	meta: import.meta,
	title: "The agent system",
	description: "Six roles, what flows between them, and which log each one writes.",
	icon: "hub",

	content(){

		p("Six kinds of agent, in one ladder. ", b("Each tier hands the one below it less freedom and more detail"), " — and what comes back up an arrow is only ever one word. Everything else lives in the logs, where anyone can read it without being sent it.");

		this.ladder();

		this.aside();

		md("## The five pieces").ac("wide");

		this.docs();

		p.c("muted", "Each one in full, without leaving this page — click a title to open it.");

		this.reading();

		p.c("muted", "Written 2026-09-22 as the integrating design over sections B, C, D, E, F and H of the Servex architecture brief. It is paper: pages, docs, and two new skills. The substrate is being built beside it by ", a("servex-port").href("../servex-port/"), ", ", a("agent-host").href("../agent-host/"), ", ", a("log-model").href("../log-model/"), " and ", a("worktree-design").href("../worktree-design/"), ".");
	},

	/* The diagram. A column of role bands with a labelled strip between each
	   pair — a picture made of boxes, so it is readable at 400 and at 3440 and
	   needs no SVG. */
	ladder(){
		return div.c("flex v gap-50", () => {
			ROLES.forEach((r, i) => {
				if (i === 1) { this.desk(); return; }
				if (i === 2) return;            // drawn inside desk() beside the fast assistant
				this.band(r);
				const arrow = ARROWS.find(a2 => a2.after === i);
				if (arrow) this.arrow(arrow);
			});
		}).style({ "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},

	/* The front desk is two roles at once, so it is one row, not two bands. */
	desk(){
		div.c("flex auto gap", () => {
			this.band(ROLES[1]);
			this.band(ROLES[2]);
		}).style({ "--column": "15rem" });
		p.c("muted", "The front desk: the fast one answers in seconds and never thinks; the slow one thinks and never hurries.").style({ "padding-inline-start": "0.5em" });
		this.arrow(ARROWS.find(a2 => a2.after === 2));
	},

	/* A band is one ROW — the name and its id on the left, what it is for on the
	   right — so six of them plus their arrows still fit one screen. Both halves
	   carry a rem basis, so the row stacks by itself under about 33rem (inside
	   the front-desk pair at any width, and everywhere at 400). */
	band(r){
		return div.c("card size-small flex wrap gap", () => {
			div.c("flex v gap-25", () => {
				span.c("h4", r.role);
				p.c("muted", r.who);
			}).style({ flex: "1 1 13rem" });
			div.c("flex v gap-25", () => {
				p(r.does);
				p.c("muted", "writes → " + r.writes);
			}).style({ flex: "2 1 20rem" });
		}).style({ "--card-edge": r.lead ? "var(--prim)" : "var(--ink)" });
	},

	/* Down and up on ONE wrapping row: what the tier above hands down, and the
	   one word that ever comes back. Two lines here cost 90px a strip. */
	arrow(a2){
		return div.c("flex wrap gap muted", () => {
			p("↓  " + a2.down);
			if (a2.up) p("↑  " + a2.up);
		}).style({ "padding-inline-start": "0.5em" });
	},

	/* The sixth role hangs off the log, not off the ladder — it has no parent
	   and no cycle, and drawing it in the chain would say the wrong thing. */
	aside(){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", "Log assistant — the sixth role, off to the side");
			p.c("muted", "assistant-log · Sonnet, low · woken by the appender, never on a schedule");
			p("It has no parent, so it is not in the ladder. Every ordinary write to the log is programmatic and free; this agent is woken only when a write fails a naming check, reads just the contested entries, appends one verdict, and stops.");
		}).style({ "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},

	docs(){
		return div.c("grid auto gap", () => {
			DOCS.forEach(d => { this.doc_card(d); });
		}).style({ "--column": "17rem" }).ac("wide");
	},

	doc_card(d){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", d.title);
			p(d.text);
			p.c("muted", "doc/" + d.file);
		});
	},

	/* The five docs themselves, rendered and collapsed — one click down, without
	   leaving the page. A bare link to a .md serves RAW markdown here (there is no
	   renderer route for a file under a task dir), so the details block is the way
	   in; the files are still ordinary doc/*.md anyone can read on disk. */
	reading(){
		return div.c("flex v gap-25", () => {
			DOCS.forEach(d => {
				md.details(import.meta, "doc/" + d.file, d.title + " — doc/" + d.file);
			});
		}).style({ "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},
});
