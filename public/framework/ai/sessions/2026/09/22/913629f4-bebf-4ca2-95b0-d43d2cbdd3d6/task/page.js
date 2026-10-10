import { Page, md, div, p, span, b, a } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-22/'s board — the ordinary
                page grid. Prose sits in main at --measure; the three numbers,
                the table and the decision cards claim wide.
   2 SIZE       everything wide is capped at 54em and left-aligned on the prose
                axis (margin-inline: 0), so a capped region never reads as a
                second, misaligned column beside the prose (layout, 2026-09-17).
   3 OWN LAYOUT the numbers are one flex auto row (--column 13rem, so three wrap
                to one column under about 41rem and to a single stack at 400).
                The table is markdown. The decisions are a grid auto wall.
   4 REGIONS    three: the headline number, the per-skill table, what was left.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN: the three numbers are the page. Everything else is a table you
     can skim and two links. No template literals here and no new class names. */

/* The headline, three ways. Lines is the unit the brief asked for; words is the
   unit that measures what an agent actually reads. They disagree, and that
   disagreement is the finding. */
const NUMBERS = [
	{
		n: "6,294",
		was: "was 7,577",
		label: "words a fresh minion reads before its first write",
		note: "17% less. Not one rule and not one story was deleted to get there.",
		lead: true,
	},
	{
		n: "353",
		was: "was 359",
		label: "lines, the unit the target was set in",
		note: "The target was 200, and it was never reachable — see below.",
	},
	{
		n: "20 of 20",
		was: "",
		label: "trap stories still readable in full",
		note: "16 moved behind a link to the task that holds them; 4 stayed inline, because their task log does not.",
	},
];

/* Every file this task touched. Before is the file as it stood at 16:38 today;
   after is now. `wc -l -w -c`, both times. */
const TABLE = [
	"| skill | lines | words | what changed |",
	"| --- | --- | --- | --- |",
	"| `minion` | 74 → 70 | 2,008 → 1,907 | Says in one line what it carries by default and lists everything else as read-X-when-Y. The reload hold is four lines and a link. Five traps became a sentence plus a link. |",
	"| `new-task` | 108 → 87 | 1,572 → 1,221 | The BOM, ANSI, clock-drift and escape prose became one paragraph naming `append.mjs`. What a line IS — one object, one verb — stayed. |",
	"| `code` | 177 → **196** | 3,997 → 3,166 | Section 7 regrouped under seven headings, 16 stories moved behind links. Lines went UP because the headings cost a line each; words went down 19%. |",
	"| `finish-task` | 84 → 70 | 970 → 728 | The landing line is written with the Write tool and appended with `append.mjs`. The backtick-eats-your-words hazard stayed, because it is not a jsonl problem. |",
	"| `mastermind` | 386 → 343 | 5,169 → 4,676 | The 35-line CLI launch recipe became 9 lines led by `spawn_agent`; the Agent-tool era is gone. |",
	"| **total** | **829 → 766** | **13,716 → 11,698** | −15% of the words across the five files. |",
].join("\n");

const LEFT = [
	{
		title: "Who owns the improvements loop",
		icon: "gavel",
		text: "The 2026-09-19 audit wanted the master assistant to become the Fable architect and absorb the auditor skill. That decides what a ROLE is, so the text was left alone. The recommendation is to merge: the backlog this task worked through had entries five weeks old that nobody owned, and two skills both call themselves the system architect.",
	},
	{
		title: "Every number and never-list the owner chose",
		icon: "lock",
		text: "Untouched, all of them. Nothing in this pass changed what a skill decides — only how much text a decision is wrapped in. A hard rule here is earned by breaking things repeatedly, and the owner deliberately loosened two numeric rules once before because agents were reading thresholds as verdicts.",
	},
	{
		title: "Four traps that could not be shrunk",
		icon: "warning",
		text: "The audit assumed every story is already in a task log, so the story could be replaced by a link. Checked all twenty: paging-clarity, list-shapes, even-columns and real-page-move do not mention their trap anywhere in the task dir. Linking those would have destroyed the only copy, so they keep their full paragraph.",
	},
];

export default new Page({
	meta: import.meta,
	title: "Skills shrink",
	description: "The five skill changes that were written down twice and applied never — now applied, measured and proven.",
	icon: "compress",

	content(){

		p("A minion reads its instructions before it is allowed to touch anything. Two audits in September measured how much that costs and ranked what to cut. ", b("Neither audit's changes were ever applied."), " They are applied now — and every trap, every story and every rule the owner chose survived it.");

		this.numbers();

		md("## Every file, before and after").ac("wide");

		md(TABLE).ac("wide");

		this.why();

		md("## What was left alone, on purpose").ac("wide");

		this.left();

		md("## How it was proved").ac("wide");

		this.proof();

		p.c("muted", "Written 2026-09-22 as phase-2 item 10 of ", a("the agent system design").href("../tiers-design/"), ", applying changes 1, 2, 4 and 5 of ", a("the 2026-09-19 skill audit").href("/framework/ai/2026-09-19/system-eval/"), ". The measurement script is ", a("load-count.mjs").href("load-count.mjs"), "; every measurement is in this task's log.");
	},

	/* The page's one picture: three numbers, biggest first. */
	numbers(){
		return div.c("flex auto gap", () => {
			NUMBERS.forEach(n => { this.number(n); });
		}).style({ "--column": "13rem", "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},

	number(n){
		return div.c("card flex v gap-25", () => {
			span.c("h1", n.n).style({ "line-height": "1.1" });
			if (n.was) p.c("muted", n.was);
			p(b(n.label));
			p.c("muted", n.note);
		}).style({ "--card-edge": n.lead ? "var(--prim)" : "var(--ink)" });
	},

	/* The one thing a reader will ask: why is it 353 and not 200? */
	why(){
		return div.c("card flex v gap-25", () => {
			span.c("h4", "Why 353 lines and not 200");
			p("These files put a whole paragraph on one physical line, so counting lines never measured what an agent reads. ", b("code/SKILL.md is 196 lines holding 3,166 words"), " — its section 7 alone is 58 lines holding 2,080.");
			p("The arithmetic settles it. Sections 1–6 and 8 of the code skill, which the audit itself says earn every line, are 138 lines. So ", b("minion (70) + new-task (87) + code with section 7 deleted entirely (138) = 295"), " — still 95 over the target, with not one trap left in the file. A 200-line target was unreachable by construction.");
			p("Measured in words, the thing an agent actually pays for, the cut is 17% and nothing was lost. That correction is now filed against the mastermind skill, so the next shrink sets its target in words.");
		}).style({ "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},

	left(){
		return div.c("grid auto gap", () => {
			LEFT.forEach(d => {
				div.c("card size-small flex v gap-25", () => {
					span.c("h4", d.title);
					p(d.text);
				});
			});
		}).style({ "--column": "17rem" }).ac("wide");
	},

	proof(){
		return div.c("card size-small flex v gap-25", () => {
			p(b("Frontmatter"), " — all five edited files still parse, each with a name and a description.");
			p(b("The Skill tool still lists them"), " — a Haiku session asked for its skills named code, finish-task, mastermind, minion and new-task among the 21 repo skills.");
			p(b("A real minion still lands"), " — a Haiku session launched with the CLI recipe on a two-line brief in this dir loaded the shrunk minion skill, wrote its file and landed: 5 turns, 9.4 seconds, six cents.");
			p(b("The two counts agree"), " — ", a("load-count.mjs").href("load-count.mjs"), " parses the minion skill for the sentence naming what it carries by default, sums only those files, and returns 353, the same number `wc -l` gives by hand.");
		}).style({ "max-width": "54em", "margin-inline": "0" }).ac("wide");
	},
});
