import { div, span, icon } from "/app.js";
import { rng } from "./gen.js";

/**
 * WHAT A GENERATED PAGE CONTAINS — seeded, and DIFFERENT for every page.
 *
 * The v1 filler was three identical bars, so a tree of nine words rendered as nine
 * identical columns and the word being demonstrated was the only thing on screen that
 * changed. The owner's first note: *"each child appears identical"*. A shape you cannot
 * tell from its neighbour does not demonstrate anything.
 *
 * So every page carries a `key` — an integer derived from its PLACE in the spec — and
 * everything here is drawn from `rng(key)`: how many groups, which kind, how many lines,
 * how wide each one is, and which name the page wears. Distinct siblings, and still
 * bit-reproducible, because the key is a function of the spec text and nothing else. A
 * typed spec gets distinct children for free, having no seed at all.
 *
 * Still grey boxes, on purpose — this page is about the SHAPE of a tree, and real prose
 * would be noise. The same reason `styles/layouts/space` draws parts as grey boxes.
 */

/* A page needs a NAME before it needs anything else: a nav of `wall / wall-2 / list` reads
   as a debug dump, and it is the labels, not the bars, that make a strip of tabs legible.
   Ordinary index words — a generated page is a stand-in for a real one. */
export const TITLES = ("Inbox Signals Reports Drafts Archive Threads Ledger Roster Digest Backlog "
	+ "Atlas Journal Feed Queue Docket Notes Records Bulletin Register Survey Charter Almanac").split(" ");

/* ⚠ `taken` is one Set per SIBLING LIST, not per tree: the point is that a row of tabs
   reads as five different words, and a name repeating three levels down is invisible.
   The wrap-around cannot spin — `gen()` caps a parent at three children. */
export function title_for(key, taken){
	if (taken.size >= TITLES.length) taken.clear();

	let at = key % TITLES.length;
	while (taken.has(at)) at = (at + 1) % TITLES.length;

	taken.add(at);
	return TITLES[at];
}

/* The page's own content. `long` is the leaf: a `prose` page is what it says it is, so it
   gets the paragraphs a page with a nav has no room for. */
export function fill(key, long){
	const next = rng(key);

	return div.c("page-gen-fill", () => {
		for (let i = 0, n = (long ? 2 : 1) + Math.floor(next() * 3); i < n; i++) group(next);
	});
}

/* One group — a headed run of lines, a picture, or a row of chips. Three kinds is enough
   for two columns to look unalike at a glance; a fourth would be decoration. */
function group(next){
	const roll = next();

	// ⚠ The glyph is the difference between "a picture goes here" and "this box failed to
	//   render": `--tint` on a `--wash` host is 3.5% of ink, and an empty rectangle read
	//   as broken (ux recon 2026-08-27, #7).
	if (roll < 0.18) return div.c("page-gen-media", () => icon("image"))
		.style("--gen-h", (4 + Math.floor(next() * 5)) + "em");

	if (roll < 0.34) return div.c("page-gen-chips", () => {
		for (let i = 0, n = 2 + Math.floor(next() * 3); i < n; i++)
			span.c("page-gen-chip").style("--gen-w", (2.5 + next() * 3).toFixed(2) + "em");
	});

	div.c("page-gen-lead").style("--gen-w", (35 + Math.floor(next() * 45)) + "%");

	for (let i = 0, n = 2 + Math.floor(next() * 5); i < n; i++)
		div.c("page-gen-bar").style("--gen-w", (30 + Math.floor(next() * 70)) + "%");
}

/* An inbox row's preview — a line or two of the page behind the link, which is the whole
   reason an inbox column is wider than a rail. ⚠ Its own stream, offset off the same key:
   the peek would otherwise be the first lines of the page it previews, and a preview that
   IS the content is a duplicate, not a preview. */
export function peek(key){
	const next = rng((key ^ 0x9e3779b9) >>> 0);

	return div.c("page-gen-peek", () => {
		for (let i = 0, n = 1 + Math.floor(next() * 2); i < n; i++)
			div.c("page-gen-bar").style("--gen-w", (45 + Math.floor(next() * 55)) + "%");
	});
}

/* A nav word with nothing to navigate. `gen()` never draws one — a childless page is
   `prose` — but a TYPED spec can say `tabs` with no lines under it, and the honest answer
   is the empty state, not an invisible strip. */
export function empty(block){ return div.c("page-gen-empty", `${block} — no children yet`); }

export default fill;
