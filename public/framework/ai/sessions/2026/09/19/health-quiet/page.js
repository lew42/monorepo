import { Page, md, p, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid, everything at --measure prose width.
   2 SIZE       one screen: the before/after count, then a short list of what
                was actually wrong. The numbers and reasoning live in this
                task's own task.jsonl, one click down (the page's own log tab).
   3 OWN LAYOUT no grid needed — a stack of paragraphs and one markdown list.
   4 REGIONS    none.   5 PREVIEW  core's default card on the day board.
   ⚠ No template literals anywhere in this file — plain "…" strings, so a
     stray backtick can never end one. */

export default new Page({
	meta: import.meta,
	title: "Health quiet",
	description: "Eleven broken log lines and three crying-wolf rules were making tonight's health watcher warn 861 times a night for almost nothing — and a fourth fix means the watcher can finally pick up its own corrections without being killed.",
	icon: "notifications_off",

	content(){
		p(b("Tonight's health watcher had logged 1,062 lines before this fix; the site's own log has shown zero new warnings of any kind this task repaired ever since, even as the watcher kept checking pages for the rest of the evening."), " Most of the noise — well over 700 of tonight's 861 warnings — was eleven broken lines in five old log files, not real bugs. The rest was three health-watcher rules flagging things that are actually fine.");

		md("## What was actually wrong\n\n" +
			"1. **Eleven log lines in five files were malformed** — six missing a closing brace, one plain text instead of JSON, four using an old field name in the wrong place. Every page that reads the site's activity log re-parses every one of these files on every load, so eleven bad lines produced most of tonight's warnings. All eleven now parse; the site's live log shows zero new hits for them since each fix landed, even though the watcher kept checking pages the whole time. (One of the four step-key lines was found only after this page first went up — the same task that triaged this bug had quietly written a fresh copy of it into its own log while triaging.)\n" +
			"2. **Three health-watcher rules were flagging correct things as bugs.** `padding-under-8px` re-flagged three sitewide, deliberately compact styles as mistakes — a `code` chip, a `th`/`td` table cell, and a disclosure toggle (`.ai-fold-bar`, whose own CSS comment already called it a control, in writing, before this task ever ran). The rule already excused buttons and form fields for the same reason; it just never got these three added to that list, so they were. `row-pitch-over-40px` flagged activity lists whose 'rows' are really multi-line cards (a title, a summary, a timestamp) — a 150–230px gap there is correct, not cramped, so the threshold moved from 40px to 250px.\n" +
			"3. **The old `step`-key bug in the original two files was a known, deliberate choice, respected here.** An earlier task tonight decided not to change the *watcher's* parser for it, to avoid teaching the schema a one-off legacy key. That was a decision about the parser, not about the data — so the affected lines were still repaired (the field moved to where the schema already expects it), without touching the parser the earlier task chose to leave alone.\n" +
			"4. **The real defect wasn't the two rules — it was that a correct fix to `Server/health.mjs` had no way to reach the running watcher short of killing it.** `Server/health-supervisor.mjs` now watches `health.mjs` itself and cycles it automatically when the file changes (parses first — a broken save is never allowed to touch the working process). Proved in an isolated copy, not on the live process. This still needs the live supervisor restarted once by hand to pick up today's version of itself — that one restart is the owner's, not this task's.");

		md("Full numbers, every line fixed, the isolated proof of the new self-watch code, and the `.ai-fold-bar` decision in full: this task's own log, reachable from [today's board](/framework/ai/2026-09-19/).");
	},
});
