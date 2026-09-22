import { div, a } from "/app.js";
import { Screen, area, sheet } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* A DECK — full-screen slides swapped in place. Every slide is `full`, so opening one
   hides the one before it: the vary lab's carousel verdict (swap is right for
   one-at-a-time) with a url per slide instead of an index in memory. Each slide cold-
   loads on its own, Back walks the deck backwards, and the crumb strip says where you
   are. Click anywhere to advance; ← and → do the same while a slide is on screen. */

const slide = (page, n, label, note) => sheet(null, () => {
	div.c("screens-eyebrow", n + " of 3");
	div.c("screens-label", label);
	div.c("screens-note", note);

	div.c("flex gap", () => {
		if (page.prev) a.c("btn", "Back").href(page.prev);
		if (page.next) a.c("btn", "Next").href(page.next);
	}).style("--gap", "0.5em");
})
	// The whole slide advances — but a real link inside it has to win, or Back
	// would step forwards.
	.on("click", event => { if (!event.target.closest("a") && page.next) page.go(page.next); });

/* Arrow keys take the SAME path a click does — `router.go()`, the method the Router's own
   click handler calls — so the keyboard cannot drift from the links.
   ⚠ `keys` is stored on the page so one function reference is added and removed; a fresh
     arrow function each time would leave a listener per visit.
   ⚠ The HOST carries this too. At /deck/ the page you are looking at is slide one, but it
     was built by the host rather than activated, so its own `activated()` never ran and the
     keyboard was dead until the first click (measured). The host binds the same pair. */
const arrows = {
	activated(){
		this.keys ??= event => {
			/* ⚠ ONLY THE PAGE YOU ARE ON MAY ACT. Going deeper never deactivates an
			   ancestor, so the host's listener outlives its screen — measured: ArrowRight
			   on slide three walked BACK to two, because the deck was still listening and
			   its own `next` is slide two. One line, and a stale listener cannot fire. */
			if (location.pathname !== this.url) return;

			const to = { ArrowRight: this.next, ArrowLeft: this.prev }[event.key];
			if (to) this.go(to);
		};
		addEventListener("keydown", this.keys);
	},
	deactivated(){ removeEventListener("keydown", this.keys); },
};

export default new Screen({
	meta: import.meta,
	title: "Deck",
	description: "Slides swapped in place, one url each.",
	icon: "slideshow",
	shapes: ["1", "1", "1"],

	// Arriving here shows slide ONE (it is `default`), so the host's own arrows step to
	// two — the same thing clicking the slide does.
	...arrows,
	next: here + "two/",

	// Never seen: the `default` slide covers it. This is the fallback if that ever stops
	// being true, which is the only reason it exists.
	content(){ area("Deck", "Three slides, three urls.", here + "one/"); },

	children: [
		new Screen({
			title: "One", classes: "default", ...arrows,
			next: here + "two/",
			content(){ slide(this, 1, "Swap", "One thing at a time wants the whole screen and nothing beside it. The row already does that: a full column hides every column left of it."); },
		}),

		new Screen({
			title: "Two", ...arrows,
			prev: here + "one/", next: here + "three/",
			content(){ slide(this, 2, "Address", "A slide is a page, so it has a url. Reload here and you are still on slide two — a carousel holding its index in memory cannot say that."); },
		}),

		new Screen({
			title: "Three", ...arrows,
			prev: here + "two/",
			content(){ slide(this, 3, "Return", "Back walks the deck backwards, because every advance was a navigation. Nothing had to be written to make that true."); },
		}),
	],
});
