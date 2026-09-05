import { div, p, span, a, icon, details, summary } from "/app.js";
import { press } from "./paging.js";

/* ── THE FOUR MECHANISMS, SHOWN ────────────────────────────────────────────────
   Four miniatures for the hub. Each one is a small box you can click RIGHT THERE,
   with nothing to navigate to and nothing to read first — the whole point is that
   the effect is visible in one gesture, before any vocabulary has been introduced.

   They are miniatures on purpose. The real `launch` and the real `takeover` are
   core's columns (a child column, and `width: "full"`), which need the whole row to
   show — and a reader who has not met the row yet cannot see what changed. So the
   hub teaches the SHAPE of each gesture in a 200px box, and every miniature carries
   a link to the real thing underneath it.

   ⚠ Imports flow DOWN. `paging.js` never imports this file; this file takes one
     helper from it (`press` — a clickable that is a span, not a `<button>`, because
     the site theme styles every button as an uppercase CTA and wins).             */

/* ── SWAP, as TABS ─────────────────────────────────────────────────────────────
   The most familiar switcher there is, and it is exactly `swap`: click a tab and
   the panel's content changes while the panel itself does not move a pixel.

   ⚠ THE PANEL HAS EDGES. The site's default tab strip (`ext/tabs`) draws a label,
     a hairline and a 2px mark, and leaves the panel transparent — so there is no
     boundary between a tab and the thing it opens, and a reader cannot point at the
     rectangle that is about to change (the owner, 2026-09-05). The four classes
     below are this realm's folder-tab set: the selected tab and the panel share one
     surface with no line between them. paging.css has the rule and the proposal for
     doing it site-wide. */
const TABS = [
	["Overview", "Click the other two tabs. Watch the white box: its edges do not move."],
	["Pricing",  "Same box, same place, same size — different content. That is the whole of `swap`."],
	["Contact",  "You have used this a hundred times. A tab strip is one way to draw a swap; there are three more at the page below."],
];

export function swap_demo(){
	return div.c("paging-tabs paging-tabsdemo", () => {
		const $bar = div.c("paging-tab-bar");
		const $panel = div.c("paging-tab-panel");

		const show = i => {
			$bar.el.querySelectorAll(".paging-tab").forEach(($tab, n) => $tab.classList.toggle("on", n === i));
			$panel.empty(() => { p(TABS[i][1]); });
		};

		$bar.append(() => TABS.forEach(([label], i) =>
			press(span.c("paging-tab", label).ac(!i && "on"), () => show(i))));

		$panel.append(() => { p(TABS[0][1]); });
	});
}

/* ── LAUNCH — a column appears beside the box ──────────────────────────────────
   Two panes in one frame. Clicking a row opens the second pane to its RIGHT; the
   first pane keeps its place and its own state. Clicking the row again closes it,
   so the appearing is repeatable — which is the thing worth seeing twice. */
const OPENS = {
	Alpha: "Alpha opened as a pane of its own, to the RIGHT. Look at the list beside it: it did not move, and nothing about it changed.",
	Beta:  "Beta, in the same new pane. The list is still the list — a launch never replaces the page you clicked from.",
	Gamma: "Gamma. In the real thing this pane is a full column of the row, and the row scrolls sideways if it has to.",
};

export function launch_demo(){
	return div.c("paging-mini paging-mini-row", $frame => {
		let open = null;

		const draw = () => $frame.empty(() => {
			/* ⚠ `paging-mini-keep` — a FIXED track, not a share. In the real thing a
			   column keeps its own width when a child opens beside it and the ROW
			   scrolls; a miniature whose first pane halved as the second appeared
			   would teach the opposite of what the sentence above it says. */
			div.c("paging-mini-pane paging-mini-keep", () => {
				span.c("paging-mini-head", "A page with three children");

				Object.keys(OPENS).forEach(name => press(
					span.c("paging-item").ac(open === name && "paging-mini-on").append(() => {
						span.c("paging-item-words", name);
						icon("chevron_right").ac("paging-sign");
					}),
					() => { open = open === name ? null : name; draw(); }));
			});

			if (open) div.c("paging-mini-pane paging-mini-opened", () => {
				span.c("paging-mini-head", open);
				p(OPENS[open]);
			});
		});

		draw();
	});
}

/* ── EXPAND — the row itself grows ─────────────────────────────────────────────
   `ui/accordion`, verbatim: `<details class="ui-accordion-item pad">` inside a
   `.surface flex v` box, with a shared `name` so only one is open at a time. No
   JavaScript at all — the browser does the disclosure, and the ui/ stylesheet
   draws the hairline between rows. The row you click gets taller and everything
   below it slides down; nothing opens anywhere else. */
const QA = [
	["What is expand?", "The answer arrives UNDER the question, and the question is still on screen. The page did not change and no new column opened."],
	["When is it the right answer?", "When the answer is short enough to read without losing your place — a definition, a count, a caption."],
	["When is it the wrong one?", "When the thing you opened has children of its own. An expanded panel has no url, so there is nothing to link to or come back to."],
];

export function expand_demo(){
	return div.c("paging-mini surface flex v", () => QA.forEach(([question, answer]) =>
		details.c("ui-accordion-item pad", () => {
			summary(question);
			p.c("muted", answer);
		}).attr("name", "paging-expand-demo")));
}

/* ── TAKEOVER — the row becomes one page ───────────────────────────────────────
   Three panes, and the maximise icon on one of them. Click it and the other two
   collapse into a CRUMB STRIP along the top of the frame while the one you clicked
   fills the whole frame; click the crumb and the row is back, exactly as it was.

   That is a true miniature of the real mechanism, and of its one surprising
   property: nothing was closed. In the real thing every page behind a takeover is
   still mounted with its own state — only its layout is gone — which is why one
   click on a crumb restores the row and no url changes shape. */
const PANES = ["Rail", "Paging", "Takeover"];

export function takeover_demo(){
	return div.c("paging-mini", $frame => {
		let full = null;

		const draw = () => $frame.empty(() => {
			$frame.rc("paging-mini-row").ac(!full && "paging-mini-row");

			if (full){
				div.c("paging-mini-crumbs", () => PANES.filter(name => name !== full).forEach(name =>
					press(span.c("paging-mini-crumb", name), () => { full = null; draw(); })));

				div.c("paging-mini-pane paging-mini-fill", () => {
					span.c("paging-mini-head", full);
					p("The other two are still there — they are the crumbs above. Nothing was closed; only the layout changed. Click a crumb and the row comes back exactly as it was.");
				});

				return;
			}

			PANES.forEach(name => div.c("paging-mini-pane", () => {
				span.c("paging-mini-head", name);
				press(span.c("paging-mini-max").append(() => {
					icon("open_in_full");
					span("take the row");
				}), () => { full = name; draw(); });
			}));
		});

		draw();
	});
}

/* The hub draws these four in order, each under its own takeaway sentence and above
   a link to the page where the real mechanism lives.

   ⚠ `says` IS THE LINK TEXT, and it is per-mechanism on purpose. It used to read
     "The real X, at full size" for all four, which promised something three of them
     do not do: `swap`, `launch` and `expand` open as an ordinary column of the row,
     and only `takeover` is full size. The owner caught it on the swap link
     (2026-09-05). A link now says what its page actually does, in the page's own
     first words. */
export const DEMOS = [
	{
		word: "swap",
		icon: "swap_horiz",
		takeaway: "Click a tab and the panel's content changes. The box itself does not move — that is swap, and you already use it every day.",
		draw: swap_demo,
		real: "/imagine/paging/mechanisms/swap/",
		says: "The real swap — four visuals on one stage →",
	},
	{
		word: "launch",
		icon: "chevron_right",
		takeaway: "Click a row and a new pane opens to the RIGHT. The page you clicked from stays exactly where it was.",
		draw: launch_demo,
		real: "/imagine/paging/mechanisms/launch/",
		says: "The real launch — real columns, three deep →",
	},
	{
		word: "expand",
		icon: "expand_more",
		takeaway: "Click a row and it grows downward, in place. Nothing opens anywhere else and everything below simply slides down.",
		draw: expand_demo,
		real: "/imagine/paging/mechanisms/expand/",
		says: "The real expand — a page that never changes the url →",
	},
	{
		word: "takeover",
		icon: "open_in_full",
		takeaway: "Click the maximise icon and one pane fills the whole frame. The others are not closed — they become the crumb strip above it.",
		draw: takeover_demo,
		real: "/imagine/paging/mechanisms/takeover/",
		says: "The real takeover — it fills the whole row →",
	},
];

export default DEMOS;
