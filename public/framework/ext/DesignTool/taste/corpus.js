/* THE ORDERING CORPUS. `tests/` asks whether a rule FIRES; nothing asked whether a
 * rating is in the right ORDER, and a rulebook that cannot be wrong is not a rulebook.
 *
 * A corpus of "pages a person ranked" needs a person. A corpus of PAIRS does not: take
 * a layout, break one named thing about it, and the original is better by
 * construction. Every case declares the band it is about, so a failure says WHICH band
 * stopped working rather than only that something did.
 *
 * ⚠ These are transforms on `styles/layouts/space/`'s spec text, so this file knows
 *   that format. A real dependency, and the cheapest one available: the alternative is
 *   a second corpus of hand-written pages that would drift from the first.
 *
 * Design record: readme.md, "Does it agree with an obvious right answer".
 */

const each = (text, fn) => text.split("\n").map(fn).join("\n");

// ⚠ The CLASS token only. `\bpad\b` also matches inside `--pad:`, which turned every
//   declaration into `--:0em` and made two subjects score BETTER after the break.
const declass = (text, word) => each(text, l => l.replace(new RegExp(`(^|\\s)${word}(?=\\s|$)`, "g"), "$1"));

export const BREAKS = [{
	/* ⚠ `base` first, and this case is why it exists. Unbounding `--measure: 52em`
	   changed NOTHING at any width, because 52em is already ~100 characters a line
	   here (hand-counted: `ai/2026-08-16/mastermind-layout/measure-verdict.md`) —
	   the subject was broken before the break. A pair only means something if the
	   left-hand side is actually good, so the baseline binds it properly. */
	id: "unbound the prose",
	band: "measure",
	why: "a reading column with no ceiling runs past 110 characters a line",
	base: text => bound(text, "30em"),
	apply: text => bound(text, "400em"),
}, {
	/* ⚠ BOTH sides paint their boxes, and that is not decoration. `frame-gap` and
	   `pad-share` measure boxes that draw an edge, and a preset's spec-level `pad`
	   sits on unpainted wrappers — so removing it moved neither band by anything. The
	   only difference between these two layouts is the inset. */
	id: "took the padding out",
	band: "pad-share · frame-gap",
	why: "text against the edge of every box that draws one",
	base: text => paint(text) + "",
	apply: text => declass(paint(text), "pad").replace(/--pad:[\d.]+em/g, "--pad:0em"),
}, {
	/* ⚠ EXPECTED TO FAIL, and it is a finding rather than a bad case. A layout's gap
	   VOCABULARY is set by the components inside it — `web.js`'s cards, rows and
	   tiles carry dozens of gaps between them — and a spec can add at most one per
	   container. Eleven scrambled spec gaps are a rounding against that population, so
	   `scale` cannot be moved from the layout at all. It is a band about a design
	   system, not about an arrangement.
	   ⚠ STILL TRUE after `scale` was re-derived from a count into a share
	   (2026-08-17): +0 on all seven subjects, measured. The boundary this case marks is
	   a fact about where the gaps live, not about the statistic reading them. */
	id: "scrambled the spacing",
	band: "scale",
	expect: false,
	why: "a spec cannot reach this: the gap vocabulary belongs to the components, not the layout",
	base: text => each(text, l => bar(l) ? add(l, "gap --gap:1em") : l),
	apply: text => each(text, (l, i) => bar(l) ? add(l, `gap --gap:${(0.2 + (i * 0.53) % 3.4).toFixed(2)}em`) : l),
}, {
	/* ⚠ JUDGED AT 3440 ALONE, and that is the resolution of the one case that used to
	   disagree. Pinning a body to 20em costs `width-used` at 3440 and HELPS it at 390,
	   where 20em is most of the screen — so averaging the three widths washed the
	   break out and `gallery` read as a disagreement. A break that is about a width is
	   judged at that width. */
	id: "pinned the body narrow",
	band: "width-used",
	at: 3440,
	why: "a 3440 screen spent on a 20em column and 3000px of gutter",

	// ⚠ The baseline UNPINS first, for the same reason "unbound the prose" binds
	//   first: `document` is already a 52em column at 3440, so narrowing it further
	//   cost nothing — both sides were already at zero credit.
	base: text => each(text, l => /\bflex-1\b/.test(l)
		? l.replace(/--measure:[\d.]+em/, "").replace(/\bmeasure\b/, "") : l),
	apply: text => each(text, l => /\bflex-1\b/.test(l) ? add(l, "measure --measure:20em") : l),
}, {
	id: "laddered the columns",
	band: "slivers",
	why: "eight tracks in one row, so every heading wraps a letter at a time",
	/* ⚠ A WRAPPING ROW only, and that guard is a case the corpus found about itself:
	   eight fixed tracks added to a COLUMN body stack full-width and ladder nothing,
	   so `document` and `landing` scored the break as "no change" when the honest
	   answer is that it does not apply to them. `pair()` reports that as n/a. */
	apply: text => each(text, l => /\bflex-1\b/.test(l) && /\bwrap\b/.test(l)
		? l + "\n" + Array.from({ length: 8 }, () => "    basis --basis:3em pad tone > sections 2").join("\n")
		: l),
}, {
	/* ⚠ THE CONTROL, and it is expected to FAIL. Every band here is geometry, so ink
	   the same colour as its ground is invisible to all eleven — `rules.js`'s
	   `invisible` is what owns it. A corpus with no declared boundary reads as a claim
	   that the tier catches everything. */
	id: "hid the text",
	band: "—",
	expect: false,
	why: "ink the colour of its ground: unreadable, and not one of these bands is about colour",
	apply: text => each(text, (l, i) => i ? l : add(l, "color:transparent")),
}];

/* The layouts every break is applied to. Named rather than generated: a corpus whose
 * subjects move when the generator is retuned proves nothing about the generator.
 *
 * ⚠ `masonry` and `split` were added when "laddered the columns" went to 0 OF 0 —
 *   every original subject either had no wrapping row for it to ladder (`document`,
 *   `dashboard`, `landing`) or too little text for `slivers` to read after the sample
 *   gates landed (`docs`, `gallery`). **A case that tests nothing is worse than a case
 *   that fails**, because it reports as a clean n/a and nobody looks again. The
 *   corpus caught that about itself, which is the strongest thing it has done. */
export const SUBJECTS = ["document", "docs", "dashboard", "landing", "gallery", "masonry", "split"];
export const WIDTHS = [390, 1280, 3440];

// A line that carries a flex container, and so can carry a gap.
const bar = l => /\bflex\b/.test(l);

/* ⚠ TOKENS GO IN THE HEAD, before the `>`. Appending to the end of the line puts them
 *   in the PART half, where `basis pad > menu` + ` tone` reads as the part `menu` with
 *   a count of `tone` — the layout still renders, the token does nothing, and three
 *   cases quietly measured zero change. */
/* ⚠ And the INDENT survives. `"  > topbar"` has an empty head, so trimming it moved
 *   the line from depth 2 to depth 1 and silently reparented half the tree. */
function add(line, tokens){
	const indent = line.match(/^\s*/)[0];
	const [head, tail] = line.trim().split(">");

	return indent + (head.trim() + " " + tokens).trim() + (tail === undefined ? "" : " >" + tail);
}

// Every box painted, so the two bands that only look at painted boxes have something
// to look at. `tone` is the spec's own ground; nothing else changes.
const paint = text => each(text, l => l.trim() ? add(l, "tone") : l);

/* Bind the reading column — and INSTALL one where the subject has none. Unbounding a
   `--measure: 52em` that already runs ~100 characters a line changes nothing, so a
   pair built that way compares two broken layouts. */
const bound = (text, to) => each(text, l => /\bflex-1\b/.test(l) || /\bmeasure\b/.test(l)
	? add(l.replace(/--measure:[\d.]+em/, "").replace(/\bmeasure\b/, ""), "flow measure --measure:" + to)
	: l);

/* ⚠ THE CASE PASSES ON ITS NAMED BAND, not on the total — and that distinction is
 *   what makes this a corpus rather than a smoke test. Taking the padding out of a
 *   gallery RAISES its total, because the content then spreads across more of the
 *   screen and `width-used` gains more than `pad-share` loses. That is a true fact
 *   about a weighted sum and it is not a failure of `pad-share`, which did exactly
 *   what it should. The total is reported beside it as information.
 *
 * ⚠ Judged on the MEAN across widths, never the worst. Half these breaks only bite at
 *   one end — an unbounded measure is harmless at 390 and ruinous at 3440 — and the
 *   worst width is usually the other one. Fitness uses the worst width because a
 *   layout must work everywhere; a CORPUS asks whether the tier noticed at all.
 * ⚠ And no margin: "worse by 5" would be a second threshold nobody calibrated. The
 *   margin is reported so a reader can see how close it was. */
/* The two layouts a case compares. `same` means the break had nothing to change on
 * this subject — a column body cannot be laddered into slivers — which is n/a, not a
 * failure, and reporting it as one made the corpus look broken when it was silent. */
export function pair(brk, text){
	const base = (brk.base ?? (t => t))(text);
	const broken = brk.apply(text);

	return { base, broken, same: base === broken };
}

export function judge(before, after, brk){
	const expect = brk.expect !== false;
	const ids = brk.band.split("·").map(s => s.trim()).filter(id => id !== "—");

	// A break about one width is judged at that width. Everything else, all three.
	const only = marks => (brk.at ? marks.filter((m, i) => WIDTHS[i] === brk.at) : marks);

	const was = credit(only(before), ids), now = credit(only(after), ids);
	const total = round(mean(before) - mean(after));

	/* ⚠ A band with nothing to measure is NOT A FAILURE, it is a case that does not
	   apply — `slivers` reads null on a dashboard of tiles because none of them holds
	   twenty characters. Scored as a failure it made the corpus look broken when it
	   was silent; `null` is the third verdict. */
	if (ids.length && (was == null || now == null)) return { pass: null, band: null, total };

	/* ⚠ NOTHING LEFT TO LOSE is also n/a. `gallery` already scores zero on
	   `width-used` at 3440, so pinning its body narrower cannot cost it anything and
	   the pair proves nothing either way. A subject that already fails the band a case
	   is about is not a subject for that case. */
	if (ids.length && expect && was <= 0.001) return { pass: null, band: null, total };

	const moved = ids.length ? round(was - now) : total;

	return { pass: (moved > 0.001) === expect, band: ids.length ? moved : null, total };
}

// The mean credit of the named bands over every width, or `null` if none of them read.
function credit(marks, ids){
	const got = marks.flatMap(m => m.bands.filter(b => ids.includes(b.id) && b.credit != null));
	return got.length ? got.reduce((sum, b) => sum + b.credit, 0) / got.length : null;
}

export const mean = marks => marks.reduce((sum, m) => sum + m.score, 0) / (marks.length || 1);

const round = n => Math.round(n * 100) / 100;

export default BREAKS;
