import { Doc, md, div, span, h4, button } from "/app.js";
import Popover, { tooltip, menu } from "./Popover.js";
import Tree from "/framework/ux/Tree/Tree.js";

/* ═══ OPTION A — near its content, in flow, `position: absolute` ═══
   A plain popup: a sibling of the trigger, inside the SAME wrapper, shown and
   hidden with `.show()`/`.hide()`. No placement code at all — that is its whole
   appeal, and also its whole limit: `position: absolute` places it against its
   OWN nearest positioned ancestor, which for a card `overflow: hidden` wraps in
   is the card itself. */
const popup_a = () => div.c("ux-popover-a-wrap", () => {
	let $pop;
	button.c("btn", "Open — absolute ▾").attr("type", "button").click(() => $pop.toggle());
	$pop = div.c("ux-popover-a-pop", () => {
		span("I'm position: absolute, a plain child of my trigger's wrapper.");
	}).hide();
});

/* ═══ OPTION B — the `popover` attribute, the top layer, CSS anchor positioning ═══
   The Popover class below IS the winner; this is just it, wired to a button. */
const popup_b = () => {
	const $trigger = button.c("btn", "Open — top layer ▾").attr("type", "button");
	new Popover({
		anchor: $trigger.el, place: "bottom",
		content(){ span("I'm [popover]. Anchored with CSS, painted above everything — never clipped, never z-fought."); },
	}).draw();
};

/* The hostile box both options share: an `overflow: hidden` card, inside a
   scrolling column, inside its own stacking context — and a sticky bar right
   beside it. Scroll the small box down to bring the card into view. */
const hostile = (label, draw) => div.c("ux-popover-hostile flex v", () => {
	div.c("ux-popover-hostile-sticky pad", () => span.c("muted", "a sibling — its own stacking context, z-index: 1"));
	div.c("ux-popover-hostile-scroll", () => {
		div.c("pad", () => span.c("muted", "↓ scroll — the card is below the fold")).style("blockSize", "6em");
		div.c("ux-popover-hostile-card pad flex v gap", () => {
			h4(label);
			draw();
		});
	});
});

export default new Doc({
	meta: import.meta,
	title: "Popover",
	description: "The owner's two popup options, built and compared: near-content position: absolute, against the popover attribute's top layer.",
	icon: "picture_in_picture",

	files: "Popover.js Popover.css page.js readme.md",
	notes: "decisions",

	content(){

		md("## The top layer wins — the demo below says why");

		md("**The conclusion first:** option B — the `popover` attribute, painted in the browser's *top layer* — is the one `Popover` is built from. It gets both things the owner asked for: authored right beside the content it belongs to (so it moves with that content, no placement code), and never clipped or buried, because the top layer paints above every `overflow: hidden` box and every z-index on the page — not by winning a z-index fight, by not being IN one.");

		md("Both are built below, in the same hostile box, so you can see the difference instead of taking it on faith.");

		md("### The comparison");

		div.c("flex wrap gap-2em", () => {
			div.c("flex v gap").style("flex", "1 1 20em").append(() => {
				div.c("h4 muted", "A — in flow, position: absolute");
				hostile("Option A", popup_a);
				md("**Wins:** zero placement code — it just sits where the CSS box model puts it, and moves if its content does. **Breaks here:** the card's `overflow: hidden` clips it the instant it would extend past the card's own edge — open it and scroll: most of the popup is simply gone, not behind anything, unpainted. And even where a popup isn't clipped, it is still confined to its own stacking context: raising its `z-index` to any number cannot lift it over the sticky bar beside it, because z-index only competes *inside one stacking context* — the owner's own read of it, confirmed here.");
			});

			div.c("flex v gap").style("flex", "1 1 20em").append(() => {
				div.c("h4 muted", "B — the popover attribute, the top layer");
				hostile("Option B", popup_b);
				md("**Wins:** open it in the same box — whole, on top of the sticky bar, never clipped by the card's `overflow: hidden`. It is still a DOM sibling of its trigger (View Source and it's right there, \"nearby\"), it just *paints* in a different layer. **Costs:** one browser feature ([`popover`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), shipped everywhere this site targets) and, for placement, CSS anchor positioning where the browser has it — checked below.");
			});
		});

		md("Chromium here reports **151.0.7922.34** — CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`) has shipped unflagged since Chrome 125 (May 2024), so this whole demo runs on the declarative path. Where a browser does not have it, `Popover.js`'s own `place()` measures the trigger with `getBoundingClientRect()` once per open and writes `left`/`top` itself — the exact fallback `ext/Dropdown` already carries. The full argument, and what was rejected: [`doc/decisions.md`](./doc/decisions/).");

		md("## `Popover` — the class the winner became");

		md("About a hundred lines, no dependency. `new Popover({ anchor, content(){…}, place, trigger })` — `draw()` builds the box once; `open()` / `close()` / `toggle()` do what they say; outside-click and Escape are the browser's own (`popover=\"auto\"`); focus returns to the anchor on close, but only if the keyboard had actually moved into the box. Any UI can go inside — a filter box, buttons, a Tree.");

		md("## Three things on top of it");

		md("**A tooltip** — hover or focus, a short delay, `role=\"tooltip\"`, text only:");

		div.c("pad", () => {
			const $t = span.c("btn", "Hover or Tab to me").attr("tabindex", "0");
			tooltip($t.el, "A short delay, then this — and it closes the moment you leave.");
		});

		md("**A menu** — a list of actions, arrow keys walk it, and it can open **to the side** instead of below — the owner's own second placement. Resize the window narrow and this one sits near the edge to prove the flip:");

		div.c("flex gap", () => {
			const $m = button.c("btn", "Actions ▸").attr("type", "button");
			const items = [
				{ text: "Rename", pick: () => {} },
				{ text: "Duplicate", pick: () => {} },
				{ text: "Delete", pick: () => {} },
			];
			menu($m.el, items, { place: "right" });
		}).style("justifyContent", "flex-end");

		md("**A tree menu** — [`ux/Tree`](/framework/ux/Tree/) inside a `Popover`, nothing else: the tree already owns its own keyboard (arrows, Home/End, Enter), so wrapping it costs no extra code.");

		div.c("pad", () => {
			const $tree_trigger = button.c("btn", "Browse ▾").attr("type", "button");
			new Popover({
				anchor: $tree_trigger.el, place: "bottom",
				content(){
					new Tree({
						nodes: [
							{ text: "framework", children: [
								{ text: "core", href: "/framework/core/" },
								{ text: "ux", href: "/framework/ux/" },
							] },
							{ text: "imagine", href: "/imagine/" },
						],
					});
				},
			}).draw();
		});

		md("This is the same shape `/framework/ai/`'s own version picker now uses — a hugging trigger, a `Popover`, a `Tree` inside it: [`ai/page.js`](/framework/ai/).");

		md("## What should move onto this later — not done today");

		md("`ext/Dropdown`'s own placement, `ux/Menu`'s `<details>` panel, and `ext/Panel`'s overlay ladder are all the same shape this replaces. How many of the site's ~40 hand-set z-indexes that migration could retire, and which ones are structural instead (a sticky header, an elevated row) and would stay: [`doc/decisions.md`](./doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => popup_b())); },
});
