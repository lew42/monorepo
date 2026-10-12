import { Page, div, p, b, a, img, code } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — plain prose
                for main, four screenshots as the walkthrough.
   2 SIZE       one screen: headline, four shots in a row, a short "how to
                undo" note under them. Nothing scrolls past that except detail.
   3 OWN LAYOUT prose + an image grid. Nothing else.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN, mostly pictures — the brief's own words. What was decided
     (why "reopen" instead of deleting a verdict, the two Server/ bugs found
     and worked around) lives in this task's own task.jsonl, never repeated
     here. */

const shot = name => new URL(name + ".png", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "Inbox zero",
	icon: "inbox",
	description: "Approve or Improve on every V3 board card, so the owner can work through it one at a time and get to zero.",

	content() {
		p(b("The V3 board is now an inbox you can actually clear."), " Every card reporting finished work gets an ",
			code("Approve"), " and an ", code("Improve"), " button. Approve drops the card out of the list. Improve asks for one sentence about what is wrong and sends it straight to the mastermind's own inbox, the same road the owner's spoken words already travel. Whichever you press, the page moves you on to the next undecided card by itself — no scrolling to find it.");

		p(b("The board has 185 cards; the inbox opens at 46, not 117."), " Most cards are not a thing a verdict means anything on — the owner's own words echoed back, a rolling status update, a plain question needing a yes or no. A card only counts toward \"N left\" and the undecided queue when it reports something ", code("done"), ". Everything else still shows on the board exactly as before; its own detail just says why there is nothing to approve there yet, instead of showing buttons that would not mean anything. ",
			b("46 is still more than a sitting clears — said plainly, not glossed over: "), "tonight is the first time any verdict has existed on this board, so 46 finished, unjudged reports is a real backlog, not a number tuned to look small. See ", code("decision: verdict-eligibility-rule"), " in this task's own log for the rule and the alternative it rejected.");

		this.walkthrough();

		p.c("muted", "Live at ", a("/framework/ai/v/3/?view=timeline").href("/framework/ai/v/3/?view=timeline"), " — open it, press Approve on anything eligible, watch the count drop.");

		this.detail();
	},

	walkthrough() {
		return div.c("grid gap", () => {
			[
				["shot-inbox", "46 left, not 117 — and the open card, still `working`, shows why it carries no buttons instead of ones that would not mean anything."],
				["shot-approve", "One press of Approve on an eligible card: the count drops, a \"N approved\" toggle appears, and the page has already moved on to the next undecided, eligible card — skipping past anything still in progress."],
				["shot-improve", "Improve, with a required sentence: the note is saved on the card AND relayed to the mastermind's inbox in the same turn — proven by reading the mastermind's own task.jsonl afterward."],
				["shot-undo", "Approve is undoable: open the \"approved\" list, press undo, and the card is back in the main inbox — nothing was ever deleted."],
			].forEach(([name, caption]) => div.c("flow", () => {
				img().attr("src", shot(name)).attr("alt", caption).attr("loading", "lazy");
				p.c("muted", caption);
			}));
		});
	},

	detail() {
		return div.c("card", () => {
			p(b("What counts as an inbox item: "), "top-level (not a child preview), not the owner's own card, and ",
				code('status === "done"'), ". A ", code("working"), " card is not finished yet; a ", code("needs-you"), " card is a direct yes-or-no ask, not a quality judgment — that already has its own mechanism (", code("say.mjs --ask"), "), so folding it in here would put Approve/Improve on cards where neither button means anything.");
			p(b("Where a verdict lives: "), "a new file, ", code("public/framework/ai/verdicts.jsonl"),
				" — beside ", code("board.jsonl"), ", outside every dashboard version (a verdict judges a card, not this version's own UI, so a future V4 needs the exact same ones). A line never changes the board card itself; it only points at one by its ",
				code("id"), " and says ", code('"approve"'), ", ", code('"improve"'), " (with a sentence), or ", code('"reopen"'), ".");
			p(b("How to undo one: "), "press ", code("undo"), " on an approved card (open the \"N approved\" list to find it), or ",
				code("change"), " on an improved one. Either just appends ANOTHER line — the newest line for a card's ",
				code("id"), " is the one the page shows, so nothing is ever rewritten and the whole history stays on disk.");
		});
	},
});
