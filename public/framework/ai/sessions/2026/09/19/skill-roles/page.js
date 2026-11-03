import { Page, md, div, p, span, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the roles table, the split and the process
                page's first version claim wide.
   3 OWN LAYOUT prose, one roles table, one before/after list, one card wall.
   4 REGIONS    none.  5 PREVIEW  core's default card.
   ⚠ No template literals — plain "…" strings with \n. */

const ROLES = [
	["**Fast assistant** — `every-prompt`", "sorts, logs everything loggable, echoes the prompt verbatim, writes the card, routes it", "reasons deeply · builds · decides", "Sonnet, low effort"],
	["**Master assistant** — new", "supervises, opines in one or two sentences, documents the process, audits between questions", "builds · edits the site · assigns work", "Opus (Fable for architecture)"],
	["**Mastermind**", "decides, briefs, assigns, judges, reports", "writes code, CSS, hooks or scripts by hand", "Fable — one per worktree or target"],
	["**Minion**", "builds one thing, proves it, lands it; stays wakeable for that page", "works outside its fence · decides what the owner decides", "Opus or Sonnet, one per page"],
];

const CONTRADICTIONS = [
	{
		head: "It still calls the skill `assistant`",
		body: "Line 238: \"can run the `assistant` skill\". It is `every-prompt` now; the old path survives only as a forwarder for say.mjs. One word.",
	},
	{
		head: "Two tiers race for the same card",
		body: "\"Post first, work second\" gives the mastermind the owner's card \"at once\". The fast assistant now posts it in about two seconds. The mastermind's job is to REFINE that card under the same id — never to post a second one.",
	},
	{
		head: "The fast tier reads as optional",
		body: "\"A second, light Claude tab CAN run the assistant skill.\" In the roles table it is not optional: with no fast tier, nothing echoes the owner's words and nothing routes them.",
	},
	{
		head: "The master assistant does not exist there",
		body: "Nothing says who answers \"don't forget X\", who keeps the process page, or who audits between questions. Today the mastermind does all three implicitly. One line pointing at `master-assistant` fixes it.",
	},
	{
		head: "Nothing says how routing works with several masterminds",
		body: "The table says one mastermind per worktree or target; the skill never says a mastermind OWNS topics, and two have already run at once without knowing. The smallest fix is a `masterminds` list in the ledger that `say.mjs state` prints — proposed, not built.",
	},
];

export default new Page({
	meta: import.meta,
	title: "Skill roles",
	description: "The fast assistant re-reads a 35-line core; a new master assistant supervises, opines and audits. Four roles, one table.",
	icon: "account_tree",

	content(){

		p("Whatever must happen ", b("every prompt"), " has to be the cheapest thing on the page — a Sonnet at low effort has already skipped a step twice because the step cost thought. So the fast assistant's skill is now a 35-line core it can re-read every time, and everything it needs only sometimes moved one click down, named by the question that sends you there.");

		md("## The four roles\n\n| role | does | never does | who runs it |\n| --- | --- | --- | --- |\n" +
			ROLES.map(r => "| " + r.join(" | ") + " |").join("\n") +
			"\n\nAssistants do **no deep reasoning**. Anything that needs thought is relayed to the mastermind that owns the topic, which does the deep work and spawns minions in parallel.").ac("wide");

		md("## What moved where\n\n" +
			"- **`every-prompt/SKILL.md` — 128 lines to 43** (36 of body): who you are, the two commands in order, the doorbell, routing, what you never do, and a \"load this if…\" list.\n" +
			"- **`cards.md`** — ids, icons, status, `--re`, `--parent`, `--focus`, and the rule that the fast tier may be wrong about what a request *means* but never about what was *said*.\n" +
			"- **`headless.md`** — the server-spawned mode, where `say.mjs` must not be called at all.\n" +
			"- **`tiers.md`** — the roles table above, and routing when there are several masterminds.\n" +
			"- **`trouble.md`** — \"relay NOT delivered\", the echo hook and how to tell it is off, quoting, a stale state.\n" +
			"- **`master-assistant/SKILL.md` — new, 52 lines.** Supervises from `state`, the board and the task logs; answers in one or two sentences of opinion; keeps one page current on how the process is going; loads `auditor` when a mistake or a wrong judgment call arrives.\n\n" +
			"Nothing was dropped: every sentence of the old file is in one of the five.").ac("wide");

		md("## Two decisions\n\n" +
			"**The auditor stays its own skill** and the master assistant loads it. Supervision is everyday and must stay cheap to re-read; an audit is rare, long, and grows with each audit's own evidence (81 lines already). Two small skills, one role wearing both.\n\n" +
			"**Model: Opus, with Fable for architecture questions** — a role boundary, a skill rewrite, a system-shaped judgment call. The owner said Fable; the weekly line was hit today, and the everyday job is reading state and giving two sentences. Their call to confirm — it is a `decision` line in this task's log with the alternative.");

		md("## For the mastermind — five contradictions with the table above").ac("wide");
		this.wall();

		md("## The process page, first version\n\n" +
			"`public/framework/ai/process/` belongs to the master assistant: **how the work itself is going**, never what was built. One screen —\n\n" +
			"1. **The roles, as they are actually running right now**: who is awake, on what, since when.\n" +
			"2. **What the owner owes an answer on** — the open `decision` lines, newest first, one line each.\n" +
			"3. **Audits and what changed** — one line per audit: what it found, what was applied, what is still waiting.\n" +
			"4. **Where the process is failing today** — one or two, with the evidence. Today: three of four failing agents never loaded the skill that held the rule they broke; and a proposal from 2026-09-04 (the mastermind makes no hands-on edits) has been waiting fifteen days while today gave it two more occurrences.\n\n" +
			"It updates when something structural changes — a role added, an audit landed, a rule that stopped firing — never on a timer.").ac("wide");

		p.c("muted", "Skill text: 2,593 lines before, 2,667 after — the whole gain is the new master assistant and its notes. The number that matters is the other one: the fast assistant's core went 128 → 43, and it is the only file re-read on every prompt.");
	},

	wall(){
		return div.c("grid auto gap", () => {
			CONTRADICTIONS.forEach(c => { this.card(c); });
		}).style({ "--column": "16rem" }).ac("wide");
	},

	card(c){
		return div.c("surface pad flex v gap-25", () => {
			p.c("h4", c.head);
			p(c.body);
		});
	},
});
