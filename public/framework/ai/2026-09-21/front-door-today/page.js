import { Page, md, div, p, pre } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the before/after block claims wide.
   3 OWN LAYOUT headline, before/after, the two counts, what is not proven.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "The front door showed Friday",
	icon: "history",
	description: "Now notices when its own heading is stale and offers one click to today — the view itself is untouched.",

	content(){

		md("**`/framework/ai/` opens on the Now view**, and Now is built around one heading: " +
			"the newest thing the owner said. The newest owner-authored card on the whole board " +
			"is from **2026-09-19**, because the fast assistant that turns the owner's words into " +
			"a card was not running today — so that two-day-old heading was what greeted anyone " +
			"landing on the page, all day, while 27 fresh cards sat one click away in the timeline. " +
			"Full brief: [requirements.md](requirements.md).").ac("wide");

		before_after(
			"Before — Now, silently",
			"you, Fri 5:21 PM\n\"I thought our mastermind process was\nable to set the effort level...\"\n\n[answers below, no notice this is old]",
			"Nothing on screen says this is two days old. A reader has to already know to click \"timeline\" to find today.",
		);
		before_after(
			"After — Now, noticing",
			"⚑ This thread is from Friday, Sep 19 —\n   today's newest activity is in the\n   timeline.                [Show today]\n\nyou, Fri 5:21 PM\n\"I thought our mastermind process...\"",
			"One sentence, one button. Clicking it switches the page to the timeline view and saves that as the new preference — the same thing the timeline tab already does.",
		);

		md("**The rule:** Now shows a banner when the owner's own card is not from today " +
			"*and* the board itself has something that is — so a genuinely quiet day never false-" +
			"alarms. Only `now_view()` in [`page.js`](/framework/ai/v/3/page.js) and a few lines " +
			"of [`v3.css`](/framework/ai/v/3/v3.css) changed; the timeline, the grid, the head row " +
			"and the links are untouched. Why this route over the other two considered — a " +
			"`decision` line in this task's `task.jsonl`.").ac("wide");

		md("## The two counts, confirmed on the real board\n\n" +
			"Newest owner-authored card: `o-172112`, **2026-09-19T17:21:12**. Cards dated **today**, " +
			"2026-09-21: **27**, every one of them authored `mastermind`, none `owner`. (The brief's " +
			"own count of 26 is a card behind mine — one more landed in the minutes between.)").ac("wide");

		p.c("muted", "Not proven this session: this shell refused every command that runs or " +
			"loads code — `node --check`, `node .claude/hooks/append.mjs`, and the `mcp__site__*` " +
			"tools that would have taken the four proof shots the brief asks for (1920 and 400, " +
			"with and without a stored `now` preference). Each refusal is logged individually in " +
			"`task.jsonl`; the mastermind runs the proofs at harvest.");
	},
});

function before_after(heading, body, caption){
	div.c("surface pad flex v gap-25", () => {
		p.c("h4", heading);
		pre(body);
		p.c("muted", caption);
	});
}
