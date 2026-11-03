import { AITask, div, p, b, a, span, small, img, code, ui } from "/app.js";

/* ⚠ An `AITask`, not a plain `Page`. This dir is NOT named in the day page's
   `children:` (that file is outside this task's fence), so the day dashboard's
   own `route()` stands aside the moment `has_page_js()` sees this file and
   `Page.child()` dynamic-imports it instead — which works, but whatever class
   is exported here is the whole page. A plain `Page` would therefore throw away
   the landing record, the links and the log; `AITask` renders all of that and
   calls `extra()` for the one thing this task uniquely has to show, which is
   the picture below.

   ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  `AITask`'s own `wide` track, with `ai.css` holding prose at
                --measure inside it — so the sentences read normally and only
                the shot pair and the table take the extra room.
   2 SIZE       one screen: the two shots side by side at 1280 (each about
                26em), stacked below about 56em. The numbers sit under them.
   3 OWN LAYOUT `flex gap wrap` for the shot pair — a UI row of exactly two,
                each `flex: 1 1 22em` so they stack rather than shrink to
                thumbnails; `ui.table` for the five measurements.
   4 REGIONS    two — the picture, and the numbers under it.
   5 PREVIEW    one line on the day board. */

const shot = name => import.meta.resolve("./shots/" + name);

/** One captured screen with its caption under it. `flex: 1 1 22em` is the pair's
 *  whole responsive story: two across while there is room for two 22em columns,
 *  stacked the moment there is not. */
function screen(file, alt, caption) {
	div.c("flex v gap-25").style({ flex: "1 1 22em", minWidth: "0" }).append(() => {
		img.c("card").attr("src", shot(file)).attr("alt", alt).style({ display: "block", width: "100%" });
		small.c("muted", caption);
	});
}

export default new AITask({
	meta: import.meta,
	title: "board-declutter",
	icon: "dashboard_customize",
	description: "Three rows of chrome down to one, 202px of dead space down to 68, and five views that are finally five urls.",

	preview(nav) {
		return this.preview_card(nav, () => p.c("muted", "The AI board lost its chrome: one quiet line on top, cards with a real background, a rail on a border, and a url for every view."));
	},

	extra() {
		p.c("h2", "Before and after, /framework/ai/ at 1280");

		div.c("flex gap wrap", () => {
			screen("before-1280.png", "The AI board before: three rows of chrome — the AI head with four links and a version picker, the view switch with seven words and three controls, and a strip naming four idle agents — above 202px of dead space before the first card.",
				"Before — three rows of chrome, and the first card 202px down the screen.");
			screen("after2-1280.png", "The AI board after: one line — AI, the four view words, a 4 idle fold, and More at the right end — with the first card 62px down.",
				"After — one line, and the first card 62px down.");
		});

		p.c("h2", "The numbers");

		ui.table(["what was measured", "before", "after"], [
			["dead space above the first card (1280)", "202.4px", "61.6px"],
			["rows of chrome (1280 / 400 / 1920)", "3 / 3 / 2", "1 / 2 / 1"],
			["space above the chrome line (1280 / 3440)", "15.0px / 62.1px", "9.0px / 10.8px"],
			["agent chips shown, all of them idle", "4", "0, and one “4 idle” fold"],
			["the “sorted by…” line's text, from the rail", "0px — against the border", "15.1px at 1280, 62.1px at 3440"],
			["the timeline rail's right edge", "no border — its scrollbar floated in the gap", "1px --line, and the drag handle stands on it"],
			["a card's background / the selected card's", "the page's own #f2f2f2 / #fafafa", "#f9f9f9 / #ffffff"],
			["view words on the line", "7, two of them greyed and dead", "4 — grid is hidden behind one flag"],
		]);

		p("The rail also stopped hanging off the bottom of the screen: the board is ", b("100dvh starting at y=0"), " now, where it used to be 100dvh starting 45px down, so its usage footer was cut off at every window height. That 45px was the whole cause of the dead space — the board sits in a ", code(".page.flow"), " whose ", code("h1"), " is hidden, and a hidden element is still a sibling, so the page's own rhythm rule separated the board from nothing at all.");

		p.c("h2", "Every view is a url");

		p("Four words on screen, five addresses, at both roots — ", code("/framework/ai/days/"), ", ", code("now"), ", ", code("timeline"), ", ", code("prompts"), ", and the same under ", code("/framework/ai/v/3/"), ". Each view word is a real link, so the back button works. The url decides the view, always; the saved preference is read only when the url names none, and the bare url then rewrites itself to the view it settled on. Open a card in the timeline and it gets its own url under that view, so a reload reopens the same card. Every link written before today still works — it rewrites itself to the new shape.");

		p(b("The grid is hidden, not deleted."), " One flag (", code("HIDDEN_VIEWS"), ") takes its word off the line, and ", code("/framework/ai/grid/"), " still resolves — it lands on days and rewrites itself there, so an old link, a bookmark and a saved preference reading “grid” all end up somewhere real. Taking the word out of that array brings the whole view back with its url intact.");

		p(b("Why clicking a view word went blank."), " ", code("Router.go()"), " loads first and pushes the url second, on purpose — a failed navigation should leave no history entry. So while a page builds itself on a real in-app click, ", code("location.pathname"), " is still the url you are leaving, and the check that stops this board drawing itself twice saw a mismatch and drew nothing at all. Every cold load passed, which is exactly why it shipped. Each page now draws one tick later, when the url is certainly final.");

		p(() => {
			span("Nothing was deleted but the two permanently-disabled view words. ");
			b("Today's board, Everything, Process, Start here, the version picker, the count, Live, the author filter and the card-width slider");
			span(" all live behind one ");
			b("More ▾");
			span(" at the end of the line, and open in place. The component itself is ");
			a("ai/v/3").href("/framework/ai/v/3/");
			span("; the traps this hit — a utility class silently zeroing a margin, and routing that made the board build twice — are in its readme and in the record above.");
		});
	},
});
