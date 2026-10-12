import { Page, md, p, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; nothing here needs more room than that.
   3 OWN LAYOUT headline number, then the three counts, then the ranked proposals,
                then the one recurring lesson worth flagging on its own.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Improvements sweep",
	description: "55 recorded lessons nobody had applied. 48 are now in the skills, 7 were already stale, and 5 real decisions are left for you.",
	icon: "checklist",

	content(){

		p(b("55 lessons were sitting in skills/*/improvements.md, unapplied — some for a month. 48 are now in the skills' SKILL.md and caveats.md files. 7 turned out to be already stale (the fix they asked for already happened) and got deleted. 5 are real decisions, left for you below."), " The rulebook itself got longer, not shorter: about +104 lines added to the nine `SKILL.md` files (mostly new one-line traps with evidence), while the `improvements.md` backlog files dropped from 138 lines to 26 — the queue is what shrank, because a fix that stays as a to-do gets rediscovered by the next agent instead of read once and trusted.");

		md("## The five things left for you\n\n" +
			"1. **Minions may not be able to write files at all right now.** A CLI-launched minion (the real `claude` command line, not an in-process agent) failed to write a single file in five straight tries tonight — $8.50 and 291 turns for nothing — and the one flag that might fix it is itself blocked by the auto-mode safety check. Needs someone to find the working incantation, or every CLI-launched minion tonight may have been silently doing nothing.\n" +
			"2. **The mastermind still does hands-on edits itself sometimes**, which the owner already asked it to stop doing (it buries its own answers in the sidebar chat) — a policy change, not a bug fix.\n" +
			"3. **A `find /` that runs despite the written rule** needs a hook to actually refuse it, not another sentence in a brief — needs `.claude/settings.json`, which is yours, not a skill's.\n" +
			"4. **Should every mastermind run write live `note`/`agent` lines for the v2 board?** It already works well when done; the question is whether to make it standard.\n" +
			"5. **Should a layout's five questions gain a sixth check** — how far a control's visible effect lands from it? Real bug, real fix, but it adds a step every future page-builder pays.\n\n" +
			"Full text of each, with its evidence: [`task.jsonl`](./task.jsonl). The proposals themselves are also left in place, marked PROPOSAL, in `.claude/skills/mastermind/improvements.md` and `.claude/skills/layout/improvements.md` — outside `public/`, so not a clickable url, but exactly where the next reader of those files will find them.");

		md("## The one lesson that kept coming back\n\n" +
			"Three different agents, three different weeks, found the same CSS bug from three angles: `grid-template-columns: repeat(auto-fill, ...)` silently leaves a wall of cards short a column, or with a gap-toothed last row, because it counts columns from the TRACK WIDTH, blind to how many cards actually exist. The fix is `auto-fit` for a variable count, or writing the counts out by hand for a fixed one — and it is now one corrected paragraph in the `layout` skill instead of three separate warnings an agent had to notice were the same thing. That is the shape the owner asked for: when a lesson repeats, that is the strongest signal to fix the rule itself, not to log it a fourth time.");

		md("## What was already stale\n\n" +
			"7 entries asked for a fix that had already happened — a rule the owner had already declined, wording already rewritten, a bug already patched. Deleting them was the fail-safe move: they described a problem that no longer exists, so applying them again would have been a no-op with a false trail.\n\n" +
			"One skill, `auditor`, keeps its own 4-line log as a running grade of past audits (\"useful, keep the shape\") — not a queue of unapplied fixes. Deleting those would break the exact mechanism the skill relies on to know when to change shape, so they were left untouched rather than forced into a bucket they don't belong in.");

		p.c("muted", "Every touched SKILL.md was re-read end to end after editing — the counts, the full evidence for every applied edit, and the reasoning for every proposal and deletion are in the task log.");
	},
});
