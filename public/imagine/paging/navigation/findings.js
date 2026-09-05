/* THE MEASUREMENTS. Every row was produced by driving the real page headless and
   reading one element's `getBoundingClientRect()` before and after the click.

     moved  — pixels the thing you were reading slid SIDEWAYS   [at 1280, at 3440]
     jumped — pixels it slid UP OR DOWN                         [at 1280, at 3440]

   The element watched is named per row, because "what you were reading" is not the
   same box for a column and for a tab: for a column mechanism it is the column you
   clicked in; for anything that changes height it is the first thing BELOW the part
   that changed, which is where a reader's eye is actually resting.

   The runner, the plans and the raw json are the task's:
   /framework/ai/2026-09-05/nav-stability/ — and doc/measurements.md beside this file
   has the before/after numbers each pair came from.                              */

/* stable — nothing you were reading moves. dynamic — something moves. The two
   words are `../blocks.js`'s, where every navigation word already carries the flag:
   one list, so a gesture cannot be stable here and dynamic there (paging-audit-4b). */
import { STABLE, DYNAMIC } from "../blocks.js";
export { STABLE, DYNAMIC };

export const FINDINGS = [

	{ name: "A sidebar rail", kind: STABLE, moved: [0, 0], jumped: [0, 0],
		url: "/framework/",
		watched: "the rail itself",
		says: "The rail is chrome: it is drawn once, and a click only changes what is beside it." },

	{ name: "The crumb strip", kind: STABLE, moved: [0, 0], jumped: [0, 0],
		url: "/imagine/paging/mechanisms/takeover/",
		watched: "the crumb strip",
		says: "Click a crumb and a whole row of columns comes back — and the strip you clicked in does not move." },

	{ name: "A tab strip", kind: STABLE, moved: [0, 0], jumped: [0, 0],
		url: "/framework/ext/tabs/",
		watched: "the tab strip",
		says: "The strip is chrome too. It is the PANEL under it that jumps — three rows down." },

	{ name: "A stage with a reserved height", kind: STABLE, moved: [0, 0], jumped: [0, 0],
		url: "/imagine/paging/mechanisms/swap/",
		watched: "the heading under the stage",
		says: "The box is given a height and keeps it, so swapping what is inside cannot resize it." },

	{ name: "A drawer opening", kind: DYNAMIC, moved: [18, 0], jumped: [0, 0],
		url: "/framework/ext/drawer/",
		watched: "a paragraph of the page",
		says: "It takes a strip off the side of the page, and the text reflows into what is left." },

	{ name: "An accordion opening", kind: DYNAMIC, moved: [0, 0], jumped: [81, 68],
		url: "/framework/ui/accordion/",
		watched: "the row below the one opened",
		says: "Everything under the row you opened slides down by the height of the panel." },

	{ name: "A panel expanding in place", kind: DYNAMIC, moved: [0, 0], jumped: [113, 135],
		url: "/imagine/paging/mechanisms/expand/",
		watched: "the last row of the list",
		says: "The same gesture as an accordion, drawn inside this realm's own list of children." },

	{ name: "A toolbar word — the surface", kind: DYNAMIC, moved: [0, 0], jumped: [158, 133],
		url: "/imagine/paging/skin/",
		watched: "the paragraph under the stage",
		says: "Pressing `card` adds a frame and padding, so the box grows and the page under it moves. (Measured on `/imagine/paging/styles/`, which is now Skin.)" },

	{ name: "A column opening beside you", kind: DYNAMIC, moved: [126, 62], jumped: [0, 0],
		url: "/imagine/paging/mechanisms/launch/",
		watched: "the column you clicked in",
		says: "The new column has to come from somewhere: every open column gives up width and slides left." },

	{ name: "A swap into a box that fits its content", kind: DYNAMIC, moved: [0, 0], jumped: [259, 89],
		url: "/imagine/paging/mechanisms/swap/",
		watched: "the box itself",
		says: "The box keeps its place but not its size, so the new panel resizes it under your eye." },

	{ name: "A tab switch", kind: DYNAMIC, moved: [0, 0], jumped: [1720, 1933], big: true,
		url: "/framework/ext/tabs/",
		watched: "the panel under the strip",
		says: "The worst vertical case measured. Nothing slides — the panel simply becomes a completely different height, so the scrollbar and everything below it jump." },

	{ name: "A toolbar word — how much content", kind: DYNAMIC, moved: [0, 0], jumped: [920, 716],
		url: "/imagine/paging/room/",
		watched: "the paragraph under the stage",
		says: "Pressing `xl` puts a wall of posts where four cards were, and the prose under it goes off the bottom of the screen. (Measured on `/imagine/paging/sizes/`, which is now Room.)" },

	{ name: "A link that opens TWO columns at once", kind: DYNAMIC, moved: [194, 0], jumped: [0, 0], big: true,
		url: "/imagine/",
		watched: "the column you clicked in",
		says: "The worst sideways case measured. At 1280 the column you were reading drops from its 64em ceiling (963px) to its 28em floor (421px) in one click. At 3440 there is room, so it only narrows. This opens the columns row it happens in — click any link two levels down and watch the column you were in." },

	{ name: "A page taking the whole screen", kind: DYNAMIC, moved: null, jumped: null, big: true,
		url: "/imagine/paging/mechanisms/takeover/",
		watched: "the column you clicked in",
		says: "There is no number: what you were reading is not on the screen any more. Every column collapses into the crumb strip, which is the way back." },
];

// The worst number in the set, so a bar can be drawn as a share of it.
export const WORST = Math.max(...FINDINGS.flatMap(f => [...(f.moved ?? [0]), ...(f.jumped ?? [0])]));
