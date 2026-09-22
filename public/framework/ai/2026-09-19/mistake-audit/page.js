import { Page, md, div, p, span, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid: main for prose, wide for the two tables and the
                four-card wall.
   2 SIZE       four cards at 1 1 18em wrap to 4 / 2 / 1 columns; the tables need
                the leftover room, so both claim wide. Prose stays at --measure.
   3 OWN LAYOUT prose, one card wall, two tables, three short lists. Nothing else.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN: the finding, then the four cases, then the ranked changes. The
     evidence is in the task log, not here.
   ⚠ No template literals anywhere in this file — plain "…" strings with \n, so a
     stray backtick can never end one. Same reason the site blanked twice today. */

/* Each case: what happened · why the system let it through · the change. */
const CASES = [
	{
		n: "1",
		head: "Every page blank, twice",
		what: "Backticks in a comment inside a css() template in ui/tree/tree.js. The module stopped parsing; every page imports it; the owner was using the site.",
		why: "The rule was written in three places, and the minion wrote it a fourth time — in its own log, at 14:54, in its own words — then broke the same file the same way at 15:05. Text was never the missing piece.",
		fix: "A check: .claude/hooks/syntax-guard.mjs blocks any .js write that stops parsing (built by the mastermind, already live).",
	},
	{
		n: "2",
		head: "The sidebar shipped visibly wrong",
		what: "46.5px rows, labels 80px in, a 9px fold glyph, the filter in a bordered card inside the rail. Three tasks landed on it and all three called it verified.",
		why: "They verified in NUMBERS: 0px drift over five page switches, 80/80 crawl checks, 12 rows narrowed to 2, 0 console errors. All true. None of them can see a 46px row. Not one of the four tasks recorded loading css or layout, so the rule that covers it never entered the room.",
		fix: "Proposal 1 — a visible change lands with one picture of the WHOLE thing, and the mastermind opens it at harvest.",
	},
	{
		n: "3",
		head: "The mastermind broke its own hook",
		what: "A Python script written through a bash heredoc lost its backslashes; ledger.mjs stopped parsing. Restored from backup in seconds.",
		why: "That trap is written in the minion skill, which the mastermind does not load, and in the code skill, which it does not load either. The trap was findable by everyone except the one who hit it.",
		fix: "Proposal 2 — harness traps move to CLAUDE.md, the only file every agent gets. Proposal 3 — the mastermind writes no code.",
	},
	{
		n: "4",
		head: "Fixed rem spacing at 3440",
		what: "The V2 board took hand-written rem paddings, against the design system's own tokens, under a comment claiming the opposite. The owner caught it in one look.",
		why: "Same cause as case 3: the mastermind edited CSS itself, having loaded neither css nor layout — both of which state this rule, with measurements, near the top.",
		fix: "Proposal 3, again. One line prevents this case and case 3 together.",
	},
];

const RANKED = [
	["1", "A visible change lands with ONE picture of the whole thing, at 1920, plus one sentence on what a stranger sees. Replaces finish-task's \"a picture when there is one\".", "2", "proposal", "+2 / −1"],
	["2", "Two harness traps (heredoc → Write tool; a .js write that stops parsing) move into CLAUDE.md's \"Traps that never throw\", paid for by cutting the duplicated copies in code #7 and minion.", "3", "proposal — CLAUDE.md is never edited without asking", "+2 / −7"],
	["3", "The mastermind writes no code: briefs, reports, board cards and logs only; a hook, a stylesheet or a script goes to a minion that loads the craft skills.", "3 and 4", "proposal", "+1"],
	["4", "The landing line names the skills the agent actually loaded, so \"loaded and ignored\" can be told from \"never loaded\".", "the next audit", "proposal", "+1"],
	["5", "The backtick rule now has a check, so its text shrinks to one line in one place — two applied improvements entries deleted, the surviving caveat sharpened to name the comment and the symptom.", "1", "APPLIED", "−2"],
];

export default new Page({
	meta: import.meta,
	title: "Mistake audit",
	description: "Four mistakes reached the owner today. In three of them the rule existed and the skill holding it was never loaded.",
	icon: "fact_check",

	content(){

		p("Four mistakes, one pattern. ", b("In three of the four the rule existed, was clearly written, and the agent never loaded the skill it lives in."), " Adding words to those skills would have changed nothing. What stops these is a check that fires without being read, a picture the mastermind opens, and the mastermind not doing hands-on work at all.");

		this.wall();

		md("## The five changes, ranked by mistakes prevented per line\n\n| | the change | stops case | status | lines |\n| --- | --- | --- | --- | --- |\n" +
			RANKED.map(r => "| " + r.join(" | ") + " |").join("\n")).ac("wide");

		md("### Applied now (fail-safe)\n\n" +
			"- **css/caveats.md** — the backtick line rewritten to name where it sneaks in (a comment quoting a class), what you see (every page blank, one SyntaxError naming no file), and the hook that now blocks it.\n" +
			"- **css/improvements.md, code/improvements.md** — the two entries asking for exactly that, deleted: they are applied.\n" +
			"- **code/SKILL.md, minion/SKILL.md** — one clause each, saying the guard exists, so nobody re-litigates a solved trap.\n" +
			"- **.claude/skills/auditor/** — new, 81 lines, loaded by nobody else.\n\n" +
			"### Waiting on the owner (Approve / Improve on the Decisions tab)\n\n" +
			"Proposals 1–4 above, plus: the mastermind's own \"audit a mistake\" section should shrink to two lines pointing at the auditor skill. Each is a decision line in this task's log with its alternative written out.");

		this.auditor();

		md("## What I would not change\n\n" +
			"- **The css and layout skills' content.** Both already carry the rules these mistakes broke, with measurements. Neither failing agent loaded them. More words there is pure cost.\n" +
			"- **The briefs.** All three sidebar briefs asked for proof and got honest proof of the wrong kind. The gap is what counts as proof, which is one line in finish-task, not four lines in every brief.\n" +
			"- **Nothing gets a new rule to punish case 1.** It has a hook now; the remaining sentence is one line, in one place.");

		p.c("muted", "Numbers: 2,295 lines of skill text (other agents are editing skills as this is written, so the day's total is not a clean before/after). This audit's own net on the skills agents load: −2 lines and about 360 words of duplicated backtick prose gone, one line sharpened. The new auditor skill is +81 lines that only an auditor ever reads. Measured evidence, timestamps and the five decision lines: this task's log.");
	},

	/* A tile wall, so the four cards share one rule instead of four inline flex
	   bases: .grid.auto with a --column override is the blessed way to say "tiles
	   about this wide" (layout Q3 — a wrap floor is a real length, so rem). */
	wall(){
		return div.c("grid auto gap", () => {
			CASES.forEach(c => { this.card(c); });
		}).style({ "--column": "18rem" }).ac("wide");
	},

	card(c){
		return div.c("surface pad flex v gap-25", () => {
			span.c("h4 muted", "Case " + c.n);
			p.c("h4", c.head);
			p(c.what);
			p.c("muted", c.why);
			p(b("The change: "), c.fix);
		});
	},

	auditor(){
		return md("## The decision auditor (the owner, mid-task)\n\n" +
			"Written as [.claude/skills/auditor/](/framework/ai/2026-09-19/mistake-audit/) — 81 lines, a role, not a rule: a **system architect** that reads CLAUDE.md and every skill once, then audits **judgment calls** as well as breakages. Its raw material is the `decision` lines agents already write (the question, the options, the one chosen, why, and the rule that produced it): a call that turned out wrong names the rule that steered it.\n\n" +
			"- **The misuse report is one dated, signed line in that skill's existing improvements.md** — not a new file. The evidence is already in three places (the ledger's skill lines, improvements.md, the decision lines); a second log per skill would split it and leave fifteen near-empty files. The format widens to allow a plain opinion: `date (who · task) · what happened · the opinion or the change · the evidence`.\n" +
			"- **Who files one:** the agent that was misled (skill-improvement), the mastermind at harvest when a deliverable came back wrong, or the auditor.\n" +
			"- **Cadence:** when a mistake reaches the owner, or when a judgment call turns out wrong. No standing job — the mastermind already reads every improvements.md each cycle.\n" +
			"- **Persistence:** wake the same auditor with SendMessage while it lives (it skips ~2,300 lines of re-reading); spawn fresh if it does not answer. Never block on a resume — a transcript can vanish after about 45 idle minutes.\n" +
			"- **It logs as it goes**, so a long Opus or Fable run that dies leaves its findings behind.\n" +
			"- **The mastermind grades it** in one line in the auditor's own improvements.md: useful or not, what changed. Three useless audits and the shape is dropped, not tuned.\n\n" +
			"⚠ One thing the owner asked for cannot be measured today: *was every skill used correctly?* The ledger records a subagent's skill call only after that agent's first edit, so reference skills loaded up front leave no trace — **401 skill lines across 123 tasks since 2026-09-05, and zero for new-task**, the one skill that must run before the first edit. That is proposal 4.").ac("wide");
	},
});
