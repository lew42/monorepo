import { Page, md, div, p, span, b, a } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-24/'s board — the ordinary
                page grid. The rule sits in main at --measure; the picture, the
                topic wall and the folds claim wide.
   2 SIZE       the picture is capped at 60em and left-aligned on the prose axis
                (margin-inline: 0), like tiers-design. Its three lanes wrap to one
                column below about 42rem; at 3440 the cap holds.
   3 OWN LAYOUT the picture is flex v gap: a band, an arrow strip, three lanes. The
                seven topics are a grid auto wall (--column 20rem: 4 + 3 at 1920, not 5 + 2). The folds are
                a flex v stack of md.details.
   4 REGIONS    three: the rule and the picture, the topic wall, the folds.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN: rule, picture, seven one-sentence topics. Detail is in doc/.
   ⚠ No template literals in this file, and no new CSS class names: existing
     utilities plus .style() only. */

/* A .md in this dir renders at md/<path>/ (core/Page/Markdown.js); a bare .md
   link would serve raw text. Resolved against import.meta, never the document. */
const route = f => new URL("md/" + f.replace(/\.md$/, "/"), import.meta.url).pathname;

const TOPICS = [
	{ title: "Who may message whom", file: "messaging.md",
		text: "Each agent talks only to its parent and its own children, never sideways. A person waiting jumps the queue; finished work waits its turn." },
	{ title: "Forks for side decisions", file: "forks.md",
		text: "An agent that needs one decision copies itself with fork_self, keeps answering messages, and gets the fork's answer back as a message." },
	{ title: "Node does the background work", file: "node-jobs.md",
		text: "Reading files, scanning, loading a page and running a test are start_job calls: plain node inside Servex, no tokens, a short result back." },
	{ title: "Swarms from several angles", file: "swarms.md",
		text: "Several agents take one question from different angles, each writing its own file. The parent reads them once the last one is done." },
	{ title: "Recursive masterminds", file: "tree.md",
		text: "A mastermind may spawn three sub-masterminds, and they spawn minions. Servex refuses anything past depth 3 or over budget, and cost adds up the tree." },
	{ title: "The dashboard shows the tree", file: "dashboard.md",
		text: "The board indents each agent under its parent, with its own cost and its whole branch's cost; forks and node jobs are small marks on their caller." },
	{ title: "Agents survive a restart", file: "restart.md",
		text: "At boot, Servex resumes each agent from its recorded session_id under the same id. One that was mid-turn is told to check where it was and continue." },
];

export default new Page({
	meta: import.meta,
	title: "How agents collaborate",
	description: "Who talks to whom, and who does the waiting.",
	icon: "hub",

	content(){

		p(b("A mastermind only reads, decides and sends messages."), " Facts go to node, a side decision goes to a fork, building goes to a minion — and every answer comes back as a message, so no agent is ever stuck waiting while someone is trying to reach it.");

		this.picture();

		this.topics();

		this.reading();

		p.c("muted", "Merged from three proposals written side by side: ", a("messaging").href(route("proposal-messaging.md")), ", ", a("node").href(route("proposal-node.md")), " and ", a("the tree").href(route("proposal-tree.md")), ".");
	},

	/* The picture: who hands what down, and what comes back up. Boxes built from
	   utilities, so it reads at 400 and at 3440 with no SVG. */
	picture(){
		return div.c("flex v gap-50", () => {
			this.band("The owner, or a VS Code tab", "through the fast assistant, which answers in seconds", "var(--ink)");
			this.arrow("↓  next — a person is waiting, so it jumps the queue", "↑  a reply in about 30 seconds, not minutes");
			this.band("Mastermind · depth 0", "coordination tools only: spawn, send, fork_self, start_job, read a log. No shell, so it is never busy.", "var(--prim)");
			this.arrow("↓  a question, a job, or a brief with a fence and a budget", "↑  one line back: done · blocked — and its cost adds up the tree");
			div.c("flex auto gap", () => {
				this.lane("Node job", "inside Servex", "Reads files, scans, loads a page, runs a test. No model, no tokens.", "↑  job-7 done: 200, 0 errors");
				this.lane("Fork", "a copy of the mastermind", "Answers one side decision, warm from the prompt cache. Cannot spawn or write.", "↑  its answer, as a message — measured: 98% from cache, $0.014");
				this.subs();
			}).style({ "--column": "13rem" });
			p.c("muted", "Nothing goes sideways: siblings never message each other; their parent decides.").style({ "padding-inline-start": "0.5em" });
		}).style({ "max-width": "60em", "margin-inline": "0" }).ac("wide");
	},

	band(title, line, edge){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", title);
			p.c("muted", line);
		}).style({ "--card-edge": edge });
	},

	arrow(down, up){
		return div.c("flex wrap gap muted", () => {
			p(down);
			p(up);
		}).style({ "padding-inline-start": "0.5em" });
	},

	lane(title, who, does, back){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", title);
			p.c("muted", who);
			p(does);
			p.c("muted", back);
		}).style({ "--card-edge": "var(--ink)" });
	},

	/* The recursive lane: three sub-masterminds, each with its own minions. */
	subs(){
		return div.c("card size-small flex v gap-25", () => {
			span.c("h4", "Sub-masterminds × 3");
			p.c("muted", "depth 1 · one angle each");
			p("Each spawns minions (depth 2) to build. A minion may fork, but never spawn.");
			p.c("muted", "↑  one screen up, plus its branch's cost");
		}).style({ "--card-edge": "var(--ink)" });
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
			p.c("muted", a("doc/" + t.file).href(route("doc/" + t.file)));
		});
	},

	/* One click down, without leaving the page: each doc rendered in a fold.
	   The choices come first — every disagreement between the proposals, settled
	   in two lines: what was chosen, and the alternative. */
	reading(){
		return div.c("flex v gap-25", () => {
			md.details(import.meta, "doc/choices.md", "Six choices, each with the alternative — and the build order");
			TOPICS.forEach(t => {
				md.details(import.meta, "doc/" + t.file, t.title + " — doc/" + t.file);
			});
		}).style({ "max-width": "60em", "margin-inline": "0" }).ac("wide");
	},
});
