/* ── THE VOCABULARY ────────────────────────────────────────────────────────────
   Every word this realm uses, in one small file. Nothing here imports anything, so
   a page, a chip, a url, a sample and a doc can all read the same list and never
   disagree — and `samples.js` can use these words without importing `paging.js`
   back (imports flow DOWN: page.js → paging.js → samples.js → words.js).

   `paging.js` re-exports all of it, so `import { MECHANISMS } from "../paging.js"`
   goes on working exactly as it did.                                            */

/* WHAT A CLICK DOES. Four answers, and every item on the site that navigates wears
   the icon of the one it uses. Two of the four are core's columns vocabulary said
   out loud — `launch` IS a child column, `takeover` IS `width: "full"`
   (core/Page/doc/columns.md) — and the other two never navigate at all: they happen
   inside the box you are already looking at, which is what makes them feel
   different. */
export const MECHANISMS = {
	launch:   { icon: "chevron_right", does: "opens to the RIGHT as a new column; this page stays where it is" },
	expand:   { icon: "expand_more",   does: "opens BELOW, in place; the item grows and nothing else moves" },
	swap:     { icon: "swap_horiz",    does: "replaces what is in this box; the box does not move at all" },
	takeover: { icon: "open_in_full",  does: "fills the screen; every page behind it collapses to the crumb strip" },
};

/* WHAT THE PAGE LOOKS LIKE WHILE IT DOES IT. One CSS class each, all tokens, no
   hex — paging.css. */
export const STYLES = ["plain", "card", "tint", "prim", "dark"];

/* HOW MUCH CONTENT THERE IS. Five rungs, and each rung KEEPS everything the rungs
   below it showed — `l` is `m` plus four cards, not different words. That is the
   whole point of the axis: the box grows, the sample does not change.

   ⚠ It used to swap the text for different text at every rung, which read as five
     unrelated samples rather than one sample at five sizes. Fixed 2026-09-04 on the
     owner's report ("the size toggle buttons seem to switch content, rather than
     affect size?"); doc/decisions.md has the before/after measurements. */
export const RUNGS = [
	{ word: "xs", adds: "the title, on its own" },
	{ word: "s",  adds: "+ one line under it" },
	{ word: "m",  adds: "+ a paragraph" },
	{ word: "l",  adds: "+ four cards, the ui/ card template verbatim" },
	{ word: "xl", adds: "+ a wall of real cards from the blog's own manifest" },
];

export const CONTENT = RUNGS.map(rung => rung.word);

/* HOW MUCH ROOM IT GETS. A layout word is a column WIDTH word, not a new mechanism
   — `TRACK` in paging.js maps each one onto core's own `page-column-*` class. */
export const LAYOUT = ["center", "column", "wide", "full"];

export const LAYOUT_MEANS = {
	center: "a narrow track, and the content floats centre-centre in it",
	column: "the default reading column — 40 to 46em",
	wide:   "core's `large` track — 28 to 64em, so it grows with the screen",
	full:   "the whole row; every page behind it collapses to the crumb strip",
};

/* WHERE THE MODE TOOLBAR SITS. `inside` nests it as a flex child of the box — on
   `card` that is literally inside the white padded frame; `outside` keeps it a
   sibling of the box, on the stage. */
export const TOOLBAR = ["top-inside", "top-outside", "left-inside", "left-outside", "right-inside", "right-outside", "bottom-inside", "bottom-outside"];

/* ── THE ONE STORAGE NAMESPACE ─────────────────────────────────────────────────
   Everything a reader changes anywhere in this realm is remembered in the browser
   under ONE key prefix, so one RESET button can clear the lot and put the whole
   suite of demos back to its baseline.

     lew42:paging:<page url>     ONE record per page — its mode (style, content, layout,
                                 mech, toolbar), and on make/ its `spec` text too

   `lew42:` is core's own prefix (Page.Store) and is not ours to change; `paging:`
   is the part this realm owns. One key per page is the whole rule: a `Paging` gets it
   for free (`store()` stamps `store_key`), and a page keeping a second thing under
   the same key uses `patch()`, never `set()`. doc/persistence.md. */
export const NS = "paging:";

export const FULL_NS = "lew42:" + NS;

/* RESET — forget every remembered thing in this realm, and nothing else on the
   site. Returns how many keys it removed, so the button can say so out loud.
   ⚠ Collect the keys FIRST: `localStorage.key(i)` re-indexes on every removal, so
     removing inside the walk skips every other match. */
export function reset(){
	let keys = [];

	try {
		for (let i = 0; i < localStorage.length; i++){
			const key = localStorage.key(i);
			if (key?.startsWith(FULL_NS)) keys.push(key);
		}

		keys.forEach(key => localStorage.removeItem(key));
	} catch { /* private mode: nothing was persisted, so nothing needs clearing */ }

	return keys.length;
}
