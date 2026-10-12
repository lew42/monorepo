import { Page, div, p, b, a, img, small } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column,
                prose measure, page rhythm. Nothing here needs `wide`.
   2 SIZE       one screen at every width: the sentence, the picture, then the
                five things that were measured, as one line each.
   3 OWN LAYOUT `.flow` for the prose the page already is; `flex v gap-25` for
                the measured lines, which are short facts and would be five
                boxes if each got a card.
   4 REGIONS    three — the picture, what was measured, the way in.
   5 PREVIEW    the day board's own card; one line. */

const SHOT = new URL("shots/ai2-1280.png", import.meta.url).pathname;
const SHOT_LIST = new URL("shots/ai2-400-list.png", import.meta.url).pathname;
const SHOT_CARD = new URL("shots/ai2-400-card.png", import.meta.url).pathname;

/* The numbers the proof run actually read back, at 1280 and at 400, driving the
   real page rather than describing it. */
const MEASURED = [
	["Nothing moved", "With a card open and the list scrolled 600px down, three cards were posted two seconds apart. The open card's top edge, its scroll position, the list's scroll position and the first row's top were identical before and after — four numbers, no change at either width."],
	["They waited, and said so", "The three did not enter the list. A “3 new cards ↑” pill appeared over it; pressing it added exactly three rows, put the list back at the top, and left the open card open."],
	["Arriving quietly still works", "With the list at the top and the pointer away, a card entered on its own, with no pill, and still did not move the open card."],
	["The selection survives everything", "Reload the page: same card. Paste the card's url into a browser that has never seen the site: same card, opened on the right and marked in the list on the left."],
	["The links wear the theme", "295 links, two colours — the body's ink and the accent for the one you are on. Not a single browser-default blue, where every link on the page was one before."],
	["The splitter works and is remembered", "Dragging it 180px moved the rail exactly 180px, 331 → 504. The width came back after a reload; a double-click put it back to 331 and forgot it."],
	["Nothing errored", "Zero console errors across every run, at 400, 1280, 1920 and 3440, with one scrolling box on the page — the list, which is the one that was meant to."],
];

export default new Page({
	meta: import.meta,
	title: "ai2-master-detail",
	icon: "vertical_split",
	description: "AI 2 is a list on the left and one page on the right; nothing jumps.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Click a card and it opens on the right and stays there. Cards that arrive while you are reading wait behind a quiet pill instead of pushing anything down."));
	},

	content(){
		p(b("AI 2 is a list on the left and one page on the right."), " The rail previews every card there is, newest first, with the box you talk to pinned at its top. Click one and it opens on the right — at its own address, so a reload, the Back button and a pasted link all land on the same card. It stays open while the list keeps filling behind it.");

		// `wide` — main plus the breakout, growing rightward. A 1280px screenshot
		// squeezed into the 40em prose measure is a picture of a page you cannot
		// read, which teaches nothing; a picture is the one thing on a report
		// that wants more room than the sentences around it.
		div.c("flex v gap-25 wide", () => {
			a.c("page-link").href(SHOT).append(() => img.c("card").attr("src", SHOT)
				.attr("alt", "AI 2 at 1280: a narrow rail on the left with a text box at its top and a column of card previews under it, one of them marked; the whole right-hand side is that card's own page, with its title, who said it and when, the assistant's reading, and a fold holding the owner's own sentences.")
				.style({ display: "block", width: "100%" }));
			small.c("muted", "1280 — the rail, and one card's own page beside it.");

			div.c("flex wrap gap", () => {
				[[SHOT_LIST, "400 — the list", "At a phone width the rail is the whole screen."],
				 [SHOT_CARD, "400 — the card", "Opening a card replaces the list with the card's own page and a link back to all cards."]]
					.forEach(([src, caption, alt]) => {
						div.c("flex v gap-25", () => {
							a.c("page-link").href(src).append(() => img.c("card").attr("src", src)
								.attr("alt", alt).style({ display: "block", width: "9em" }));
							small.c("muted", caption);
						});
					});
			});
		}).style({ marginBlock: "1.5em" });

		p("Three separate things make it hold still. The page on the right is a ", b("different page"), " from the list, so a repaint of the rail cannot reach it. The rail and the page each ", b("scroll inside themselves"), ", so the window never grows. And a new row only ", b("enters the list when the list is quiet"), " — at the top, with your pointer somewhere else. Any other time it waits, a pill counts what is waiting, and no row moves until you press it.");

		p("The blue links are fixed at the cause. The site's theme styles links inside prose only, on purpose, so that everything that is really navigation can opt out — and a card's links live in a plain box, so no rule reached them at all and the browser's own blue showed through. They wear the site's own class for a link outside prose now; no rule here restates the theme.");

		p(a.c("page-link").href("/framework/ai2/").text("Open AI 2"), " — the old board at ", a.c("page-link").href("/framework/ai/v/3/").text("/framework/ai/v/3/"), " is untouched.");

		p.c("h3", "What was measured");
		p.c("muted", "Driven headless at 1280 and 400 against the real page. The full readings are in the task log below.");
		div.c("flex v gap-25", () => {
			MEASURED.forEach(([title, line]) => {
				div(() => { b(title + " — "); small.c("muted", line); });
			});
		}).style({ marginBlock: "1em" });

		p.c("h3", "Deeper");
		div.c("flex v gap-25", () => {
			div(() => { a.c("page-link").href("/framework/ai2/readme.md").text("The module's readme"); small.c("muted", " — what it is, and the four traps worth knowing before you touch it."); });
			div(() => { a.c("page-link").href("/framework/ai2/doc/decisions.md").text("Every decision, with the alternative named"); small.c("muted", " — including the two bugs that were invisible: a grid row that let the rail grow to 23,429px with no scrollbar and nothing in the console, and the pill that pushed the rows down by 36px while trying to stop them moving."); });
			div(() => { a.c("page-link").href("/framework/ai2/doc/logs.md").text("The four logs it reads"); small.c("muted", " — and why a .jsonl never fires the dev socket's data event, however plainly the tab has fetched it."); });
		});
	},
});
