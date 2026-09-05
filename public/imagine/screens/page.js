import { Page, md, div, p } from "/app.js";
import { frames } from "./screen.js";      // css: .page-preview, .screens-thumb, .screens-verdict

/* Container: /imagine/'s column row, one `large` column. Size: 28–64em. Own layout:
   a line of prose and core's previews wall, one tile per demo — each tile now also
   carries the number that demo actually measured (below), so the readme's table is not
   the only place to see it. A 3-column-row alternative (owner's brief, 2026-09-05) was
   built and measured against this: it doubled the column's own content height (695→1439
   at 1280, 856→1747 at 3440) for no gain in width used or dead space, since this column's
   width is capped either way — reverted; the numbers are in doc/decisions.md.

   This index is an ordinary column ON PURPOSE — it is the last thing you see before a
   screen takes over, so it keeps its head, its × and its nav rows. Everything it links
   to has none of them. */

// What each demo actually measured — from readme.md's table, shown on the card itself
// instead of only behind the readme link.
const EXPERIMENTS = [
	{ slug: "divide", verdict: "1920/960/640/480 at 1920 — nothing re-renders." },
	{ slug: "stack",  verdict: "Each band count redraws the whole screen; a band has no url." },
	{ slug: "title",  verdict: "733 + 1187 at 1920 — no second render." },
	{ slug: "read",   verdict: "1696 + 224 — whichever page leads keeps the room." },
	{ slug: "deck",   verdict: "A url per slide; Back walks the deck backwards." },
	{ slug: "uneven", verdict: "61.8/38.2 at both 1920 and 3440 — exactly." },
	{ slug: "quad",   verdict: "Stacks at 531px of its own column, not a guessed breakpoint." },
	{ slug: "mix",    verdict: "A cover, a split height, and a third column it opens." },
];

export default new Page({
	meta: import.meta,
	title: "Screens",
	description: "Full-screen experiences — how navigation transforms a whole screen.",
	icon: "fullscreen",
	width: "large",
	index: true,

	children: "divide stack title read deck uneven quad mix",

	content(){
		md("**Eight tiny demos of one question: when you click through to something new, what happens to the screen you were just looking at?** Click any card below — each is a real page. Sometimes your old screen disappears and the new one takes over; sometimes it shrinks and the two sit side by side.");

		md("A click either **replaces** what you were looking at, or **joins** it and the two split the space evenly — that's the whole vocabulary. Each card shows the shape it builds and the number it measured; the [readme](/imagine/screens/readme/) has the caveats.");

		div.c("page-previews bleed", () => EXPERIMENTS.forEach(exp => {
			const page = this.children.get(exp.slug);
			const nav = this.nav_for(exp.slug);

			this.preview_card(nav, () => frames(...(page?.shapes ?? []))).append(() => {
				p.c("page-preview-desc", nav.description);
				p.c("screens-verdict", exp.verdict);
			});
		}));
	},
});
