// Design corpus: pairs that test whether a rule fires correctly.
// History and reasons: doc/corpus-notes.md

const each = (text, fn) => text.split("\n").map(fn).join("\n");

// ⚠ The CLASS token only. `\bpad\b` also matches inside `--pad:`, which turned every
//   declaration into `--:0em` and made two subjects score BETTER after the break.
const declass = (text, word) => each(text, l => l.replace(new RegExp(`(^|\\s)${word}(?=\\s|$)`, "g"), "$1"));

export const BREAKS = [{
	id: "unbound the prose",
	band: "measure",
	why: "a reading column with no ceiling runs past 110 characters a line",
	base: text => bound(text, "30em"),
	apply: text => bound(text, "400em"),
}, {
	id: "took the padding out",
	band: "pad-share · frame-gap",
	why: "text against the edge of every box that draws one",
	base: text => paint(text) + "",
	apply: text => declass(paint(text), "pad").replace(/--pad:[\d.]+em/g, "--pad:0em"),
}, {
	id: "scrambled the spacing",
	band: "scale",
	expect: false,
	why: "a spec cannot reach this: the gap vocabulary belongs to the components, not the layout",
	base: text => each(text, l => bar(l) ? add(l, "gap --gap:1em") : l),
	apply: text => each(text, (l, i) => bar(l) ? add(l, `gap --gap:${(0.2 + (i * 0.53) % 3.4).toFixed(2)}em`) : l),
}, {
	id: "pinned the body narrow",
	band: "width-used",
	at: 3440,
	why: "a 3440 screen spent on a 20em column and 3000px of gutter",
	base: text => each(text, l => /\bflex-1\b/.test(l)
		? l.replace(/--measure:[\d.]+em/, "").replace(/\bmeasure\b/, "") : l),
	apply: text => each(text, l => /\bflex-1\b/.test(l) ? add(l, "measure --measure:20em") : l),
}, {
	id: "laddered the columns",
	band: "slivers",
	why: "eight tracks in one row, so every heading wraps a letter at a time",
	apply: text => each(text, l => /\bflex-1\b/.test(l) && /\bwrap\b/.test(l)
		? l + "\n" + Array.from({ length: 8 }, () => "    basis --basis:3em pad tone > sections 2").join("\n")
		: l),
}, {
	id: "hid the text",
	band: "—",
	expect: false,
	why: "ink the colour of its ground: unreadable, and not one of these bands is about colour",
	apply: text => each(text, (l, i) => i ? l : add(l, "color:transparent")),
}];

export const SUBJECTS = ["document", "docs", "dashboard", "landing", "gallery", "masonry", "split"];
export const WIDTHS = [390, 1280, 3440];

// A line that carries a flex container, and so can carry a gap.
const bar = l => /\bflex\b/.test(l);

function add(line, tokens){
	const indent = line.match(/^\s*/)[0];
	const [head, tail] = line.trim().split(">");

	return indent + (head.trim() + " " + tokens).trim() + (tail === undefined ? "" : " >" + tail);
}

const paint = text => each(text, l => l.trim() ? add(l, "tone") : l);

const bound = (text, to) => each(text, l => /\bflex-1\b/.test(l) || /\bmeasure\b/.test(l)
	? add(l.replace(/--measure:[\d.]+em/, "").replace(/\bmeasure\b/, ""), "flow measure --measure:" + to)
	: l);

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

	if (ids.length && (was == null || now == null)) return { pass: null, band: null, total };

	if (ids.length && expect && was <= 0.001) return { pass: null, band: null, total };

	const moved = ids.length ? round(was - now) : total;

	return { pass: (moved > 0.001) === expect, band: ids.length ? moved : null, total };
}

function credit(marks, ids){
	const got = marks.flatMap(m => m.bands.filter(b => ids.includes(b.id) && b.credit != null));
	return got.length ? got.reduce((sum, b) => sum + b.credit, 0) / got.length : null;
}

export const mean = marks => marks.reduce((sum, m) => sum + m.score, 0) / (marks.length || 1);

const round = n => Math.round(n * 100) / 100;

export default BREAKS;
