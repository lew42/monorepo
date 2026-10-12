import { AITask, div, p, span, b, a, img, small } from "/app.js";

/* An `AITask`, not a plain `Page` — a task dir with its own `page.js` must be
   named in the day page's `children:`, and a declared child never reaches the
   day dashboard's generic `route()`, so a plain Page would make this task's
   landing report, links and log unreachable (`dictate-silence`, 2026-09-22).

   ── layout, answered before the first factory call ────────────────────────
   1 CONTAINER  `AITask`'s own track; `ai.css` holds prose at --measure inside
                it, so the sentences read normally and only the picture spreads.
   2 SIZE       one screen: what it is, the way in, the picture. Every number
                and every decision is one click down, in the record above and
                in the module's own doc — never on this page.
   3 OWN LAYOUT `flex v gap` for the stack; nothing else has a size.
   4 REGIONS    one.
   5 PREVIEW    one line on the day board. */

export default new AITask({
	meta: import.meta,
	title: "talk",
	icon: "mic",
	description: "Press the mic, talk, and one card fills with your words — without anything jumping.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "A new page on the AI board: press the microphone, talk, and watch one card fill with your words in real time. Nothing on it moves."));
	},

	extra(){
		p(() => {
			span("Open ");
			a("Talk").href("/framework/ai/talk/");
			span(" — or click ");
			b("🎤 talk");
			span(" on the AI board's top line. Press the microphone and start talking.");
		});

		// ⚠ `img()`, never `img.attr(…)` — a bare element factory is not a View
		// until it is called or `.c()`'d, and `img.attr(…)` renders nothing.
		img().attr("src", "talking.png")
			.attr("alt", "The Talk page: a large microphone button, and under it one card holding a heading, two spoken sentences and three chips.");

		p(b("Your words appear as you say them."), " A grey guess shows up about half a second after you start a sentence and keeps changing while you talk. When the sentence finishes, the grey is replaced by the real words in solid ink, and the next sentence starts underneath. Text only ever gets added at the bottom.");

		p(b("The assistant answers in place."), " A second or two after a sentence lands, the fast assistant sends back a title — which becomes the card's heading — and the things you named, which become the chips under the text. They fill a heading and a chip row that were already sitting there, so nothing is inserted and nothing shifts.");

		p(b("Nothing jumps — and that is measured, not claimed."), " A recorded voice clip was played into the page at two screen widths, and the card's top edge was read ten times during the session. It was the same number every time: 256.3px at 1280 wide, 329.63px at 400, while the card's own height grew from 115px to 232px underneath it. No console errors in either run.");

		p(() => {
			span("The microphone it is built on is ");
			a("ux/Dictate").href("/framework/ux/Dictate/");
			span(", used unchanged — this page only redirects where its words go. How the card is kept still, with the full table of numbers, is written up beside the page itself in ");
			a("its doc").href("/framework/ai/talk/doc/no-jump.md");
			span(" for whoever touches it next.");
		});

		small.c("muted", "Every decision, finding and dead end is in this page's own record above.");
	},
});
