import { Page, md, div, p, pre } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the before/after code blocks claim wide.
   3 OWN LAYOUT headline, then the rail's shape, then what Live means now,
                then the bug found along the way, then what this session
                could not prove and why.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Live becomes selection",
	icon: "vertical_align_top",
	description: "The sticky pinned box is gone; the rail is one chronological list with two card sizes; Live now means \"nothing selected,\" not \"auto-scroll.\"",

	content(){

		md("**Three changes to the V3 timeline's left rail**, all in " +
			"[`page.js`](/framework/ai/v/3/page.js) and [`v3.css`](/framework/ai/v/3/v3.css): " +
			"the sticky box that held the current hour/clock and the pinned `needs-you` cards is " +
			"gone; ordinary rail cards shrink to one compact line each so more fit on screen; and " +
			"the **Live** button now means exactly one thing — \"nothing is selected.\" Full brief: " +
			"[requirements.md](requirements.md).").ac("wide");

		md("## The rail: a box on top of a list becomes just the list\n\n" +
			"The owner: \"that box is sticky, I don't like it, it looks kind of broken.\" It held the " +
			"current hour, a live clock, and every `needs-you` card pinned above the real chronology — " +
			"three different things in one floating strip. All of it is deleted. What is left:").ac("wide");

		div.c("grid auto gap", () => {
			before_after(
				"Before — a strip, then the list",
				"[hour · clock · New item]\n[needs-you card]\n[needs-you card]\n[+21 more]\n──────────────\n11:12 AM card\n11:08 AM card\n10:54 AM card\n…",
				"A floating box that duplicated cards already below it, plus an always-empty 30px band (the bug, below) — the owner's own \"it looks kind of broken.\"",
			);
			before_after(
				"After — one list; a control only when it's needed",
				"[↑ Back to top]  ← hidden until scrolled\n11:12 AM   ⚑ needs-you card (big)\n11:08 AM   ordinary card, one line\n10:54 AM   ordinary card, one line\n…",
				"The needs-you card still can't get buried — it renders bigger, right where its own time puts it — instead of living a second time in a box above everything.",
			);
		}).style({ "--column": "20rem" }).ac("wide");

		md("## Two sizes, and the icon moved onto the heading's own line\n\n" +
			"The owner: \"the cards are really big, so I have to scroll a lot... the icon is on its " +
			"own line and wastes a bunch of space.\" An ordinary card used to be three stacked blocks " +
			"inside a full `.card` (icon-only row, title row, a truncated sentence, an author row) — " +
			"four children, each one getting the card's own rhythm gap between it and the next. Now " +
			"it is icon + title + author on **one line**, a small control-scale row instead of a full " +
			"`.card`, no truncated sentence. " +
			"Only a `needs-you` card or the current focus card keeps the old big-card shape (icon " +
			"beside the title, then the one real sentence, then the author) — reusing the grid view's " +
			"own `.v3-tile-big`, the exact rule `weight()` already uses to decide what matters.").ac("wide");

		before_code(
			"row_of() before — 4 stacked blocks per ordinary card",
			`.v3-tile-head  (icon only)\n.v3-tile-title\n.v3-tile-sentence\n.v3-tile-foot  (author)`,
			"row_of() after — 1 compact row, no .card ground at all",
			`.v3-tile-compact\n  icon · title (ellipsis) · author   ← one line`,
		);

		md("**Not measured against the live board this session** — the shell that runs this session " +
			"could not launch a browser (see the last section). The honest headline the brief asks for " +
			"— pixel height of one ordinary row, and how many fit in 1000px, before and after — still " +
			"needs `ui-test` run against the real page; what changed structurally (four rhythm-spaced " +
			"blocks in a padded card → one small padded row with no card ground) is real and reviewable " +
			"in the code above right now.").ac("wide");

		md("## Live: a switch, not a mode\n\n" +
			"The owner: \"it's almost like selection and deselection... Live on = nothing is selected." +
			" As new updates come in, the newest one keeps being shown. If I've selected something, " +
			"the view should never jump.\"\n\n" +
			"- **Live on** — the newest card is always what's showing, and stays that way as more " +
			"arrive. No url for any one card.\n" +
			"- **Selecting a card** (a click, a card's own url, Back/Forward landing on one) turns " +
			"Live off and locks the view there — new cards append to the rail underneath and change " +
			"nothing else.\n" +
			"- **Turning Live back on** is the deselect gesture: clears the selection, scrolls the " +
			"rail to top, returns to the bare board url, shows the newest again.\n\n" +
			"A plain scroll no longer touches Live at all (it did before, as of yesterday's fix) — " +
			"under this model scrolling the rail doesn't select anything, so it has nothing to turn " +
			"off. The back-to-top control doubles as Fix 3's smallest honest version of \"does it " +
			"flash\": a small count appears on it when cards arrived while one was selected and the " +
			"rail was scrolled away — no sound, no popup, nothing auto-switches. Three separate " +
			"`decision` lines in this task's `task.jsonl` cover the calls made here (what replaces " +
			"the pinned strip's needs-you guarantee, why scrolling no longer drops Live, why deselect " +
			"scrolls to top).").ac("wide");

		md("## The empty white box, explained\n\n" +
			"The owner flagged \"it looks kind of broken\" without separating this out, but it was a " +
			"real, separate bug: a ~30px empty `.card` sat right under the old sticky strip, always, " +
			"holding nothing. Cause — the verdict toast (`.v3-toast`) carries the `flex` utility class " +
			"so its rows lay out correctly once it *has* content, but that same authored `display: flex`" +
			" always beats the browser's own `[hidden] { display: none }`, even from inside a CSS layer " +
			"(the `code` skill's own documented trap — the identical bug is why `ai.css` and " +
			"`devbar.css` both carry their own `[hidden]` overrides already). `page.js` was setting " +
			"`el.hidden = true` correctly the whole time; the CSS just never listened. One rule added, " +
			"`.v3-toast[hidden] { display: none; }`, fixes it.").ac("wide");

		md("## Not yet proven — this session's shell refused every command that runs code\n\n" +
			"Measured, twice, before this task started (`ai-front`, `safe-rollout` — see this task's " +
			"own brief): a minion launched this way can write files but its shell refuses anything " +
			"that executes. Refused here: `node Server/hold.mjs` (no reload hold was taken before " +
			"this batch), `node --check` on both changed files, and anything Playwright/`ui-test` " +
			"needs to actually load a page. Nothing above is a screenshot or a live measurement — it " +
			"is code, read back carefully, with the reasoning next to each change in `task.jsonl`. " +
			"What still needs a run, in order: `node --check` on `page.js` and `v3.css`; a reload-" +
			"hold-wrapped load of `/framework/ai/` to confirm the live page still boots; then the full " +
			"shot list the brief asks for (1920 and 400, rail before/after, scroll/back-to-top, Live " +
			"on/off, a card selected while a new one arrives, clicking Live with a card selected) " +
			"against a scratch copy of `board.jsonl` — never the real file.").ac("wide");

		p.c("muted", "The reasoning behind every change above — what was tried, what was rejected and " +
			"why, the exact refused commands — is in this task's task.jsonl, not restated here.");
	},
});

function before_after(heading, body, caption){
	div.c("surface pad flex v gap-25", () => {
		p.c("h4", heading);
		pre(body);
		p.c("muted", caption);
	});
}

function before_code(before_heading, before_body, after_heading, after_body){
	div.c("grid auto gap", () => {
		div.c("surface pad flex v gap-25", () => { p.c("h4", before_heading); pre(before_body); });
		div.c("surface pad flex v gap-25", () => { p.c("h4", after_heading); pre(after_body); });
	}).style({ "--column": "20rem" }).ac("wide");
}
