import { Page, md, p, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary page
                grid, everything at --measure prose width.
   2 SIZE       one screen: headline numbers, the ranked list, the noisy-rules note.
                The full 11-item breakdown and the raw data are both one click down.
   3 OWN LAYOUT no grid needed — a stack of paragraphs and two markdown lists.
   4 REGIONS    none.   5 PREVIEW  core's default card on the day board.
   ⚠ No template literals anywhere in this file — plain "…" strings, so a stray
     backtick can never end one (the site blanked twice today that way). */

export default new Page({
	meta: import.meta,
	title: "Health triage",
	description: "1,040 lines from tonight's health watcher, sorted into about ten real things — two live bugs, zero broken pages right now, and two rules producing mostly noise.",
	icon: "health_and_safety",

	content(){
		p(b("The health watcher wrote 1,040 lines tonight (861 warnings, 161 errors, 18 recoveries). They collapse to about ten distinct things."), " Two are real, unfixed, one-line bugs still sitting in the log right now. ", b("Zero pages are actually broken"), " — I loaded the five worst-looking ones headless just now (v/3, the day page, card-replies, inbox-zero, skill-roles) and every one renders real content with no console errors. Two of the watcher's own rules are mostly noise.");

		md("## Worth fixing (real, still there)\n\n" +
			"1. **Six log lines this task itself wrote are missing a closing brace** — `public/framework/ai/2026-09-19/page-health/task.jsonl` lines 3, 4, 5, 10, 11, 12. Every page that reads the site's activity log re-parses this broken file on every load, which is why six bad lines produced 185 warnings tonight.\n" +
			"2. **One line from three weeks ago is plain text, not JSON** — `public/framework/ai/2026-08-21/pg-tree/task.jsonl` line 2 just says `TREE MIGRATION LANDED`. Same story: 185 warnings from one line, forever, until it's wrapped as real JSON.\n" +
			"3. **Two old tasks use a `step` field the log format doesn't recognize** — `panel-pad-gap/task.jsonl` and `imagine-mag/task.jsonl` (four lines total). This one was already found and knowingly left alone earlier tonight, so it isn't new — but it's still 370 warnings a night for a two-line fix.");

		md("## Rules making mostly noise\n\n" +
			"- **`row-pitch-over-40px`** fires only on activity lists ([today's board](/framework/ai/2026-09-19/), [v/3](/framework/ai/v/3/)) where each 'row' is a whole card — a title, a summary, a timestamp — not a single line. 150-220px between cards is correct there, not cramped. The rule should skip a list whose rows hold more than one line of text, or raise its threshold well past 220px.\n" +
			"- **`padding-under-8px`** mostly re-flags the same two sitewide styles — inline `code` chips and `th`/`td` table cells — as new bugs on every page that happens to use them. The rule already excuses buttons and inputs for the same reason ('a control keeps its own em'); `code`, `th` and `td` want the same exception.");

		md.details(import.meta, "full.md", "All 11 things, including the six that already fixed themselves while agents were mid-edit tonight").ac("wide");

		md("Ranked data behind this page: [triage.jsonl](/framework/ai/2026-09-19/health-triage/triage.jsonl) — one line per finding, with the file and line number for whoever fixes it.");
	},
});
