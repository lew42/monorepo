import { View, div, pre, a, span, p, table, thead, tbody, tr, th, td } from "/app.js";

View.stylesheet(import.meta, "versus.css");

/* A comparison page has one integrity rule, and every helper here exists to hold
 * it: code from a tier that EXISTS is fetched, never retyped. A retyped copy is a
 * thing that can drift, and a comparison built on drifted copies is worth nothing.
 * Code for a design nobody built has nothing to drift from, so it is typed — and
 * the label always says which of the two you are reading.
 *
 *     file("/framework/core/Pager/ColumnPager.js", "108-124")   real — fetched
 *     code(src, "a slot system — sketch, nothing implements this")   typed
 */

// Two boxes side by side. They stack below 62rem, because a code column narrower
// than its own longest line is a comparison nobody can read.
export function pair(fn){ return div.c("pair", fn); }

/* A real file, or ONE NAMED BLOCK of it. The label links to the whole file, so
 * an excerpt can always be checked against its source in one click.
 *
 *     file("/framework/core/new/1/Page.class.js", "container")   the method
 *     file("/framework/core/new/1/site/styles.css", ".cols")     the rule
 *     file("/framework/core/new/starter/App.js")                 all of it
 *
 * By NAME, never by line number. This started as `file(url, "159-167")` and the
 * ranges silently rotted within the hour, because the tier is still being edited
 * — which is precisely the drift this whole helper exists to prevent. A name
 * re-finds its block on every load, and when the block is gone it says so on the
 * page in red instead of quietly showing the wrong nine lines.
 */
export function file(url, name){
	return div.c("code", () => {
		div.c("code-label", () => {
			a.c("code-path", url).href(url);
			if (name) span.c("code-lines", name);
		});

		// Placed NOW, while the captor is still ours; only the TEXT arrives late.
		// The <pre> already knows where it lives, so nothing is built after the
		// await — see "Capturing is synchronous" in CLAUDE.md.
		const $pre = pre("…");

		fetch(url)
			.then(res => res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`)))
			.then(src => {
				const found = !name ? src.trimEnd()
					: /^\d+-\d+$/.test(name) ? range(src, name)
					: block(src, name);

				$pre.text(found ?? `"${name}" is no longer in this file — the excerpt rotted, which is the failure this helper is built to show rather than hide.`);
				if (!found) $pre.ac("error");
			})
			.catch(error => $pre.ac("error").text(`could not fetch ${url} — ${error.message}`));
	});
}

/* The block that STARTS with `name`, through the closing brace at its own
 * indentation. Indent-matching rather than brace-counting because these files
 * are uniformly tab-indented and a brace counter has to understand strings,
 * template literals and regexes to be right — three ways to be subtly wrong in
 * exchange for handling a style nothing here uses.
 */
function block(src, name){
	const lines = src.split("\n");
	const start = lines.findIndex(line => line.trim().startsWith(name));
	if (start < 0) return null;

	const head = lines[start];
	const indent = head.match(/^\s*/)[0];

	// A plain statement, or a one-liner like `deactivate(){ return this; }`,
	// is its own end. Everything else closes on a line of nothing but closers
	// at the SAME indentation — `}`, `};`, `});`.
	const closes = line => line.startsWith(indent) && /^[)}\]]+[;,]?$/.test(line.slice(indent.length));
	let end = single(head) ? start : lines.findIndex((line, i) => i > start && closes(line));

	if (end < 0) end = lines.length - 1;

	return dedent(lines.slice(comment_above(lines, start), end + 1)).join("\n").trimEnd();
}

const single = line => !line.includes("{")
	|| (line.match(/}/g) ?? []).length >= (line.match(/{/g) ?? []).length;

// Only for FROZEN tiers — new/0 and starter are history and cannot move. Never
// for new/1 or core/, which is where the ranges rotted in the first place.
function range(src, spec){
	const [from, to] = spec.split("-").map(Number);
	return dedent(src.split("\n").slice(from - 1, to)).join("\n").trimEnd();
}

// A doc comment sitting directly above IS part of the method — in this codebase
// it is usually the most valuable half.
function comment_above(lines, start){
	let i = start;
	while (i > 0 && /^\s*(\/\/|\/\*|\*)/.test(lines[i - 1])) i--;
	return i;
}

function dedent(lines){
	const indents = lines.filter(line => line.trim()).map(line => line.match(/^\s*/)[0].length);
	const strip = indents.length ? Math.min(...indents) : 0;
	return strip ? lines.map(line => line.slice(strip)) : lines;
}

/* `**bold**` in prose, without importing anything.
 *
 * `p()` runs backtick_append, which does `code` and NOTHING else — bold, italics
 * and links pass through as literal characters. Two other seats measured that on
 * this site; before this helper existed, all nine pages below shipped it too, 195
 * times. Measured, then fixed, which is the only honest order.
 *
 * `capture: false` is the whole trick: an element factory auto-appends to the
 * ambient captor the instant it is CALLED, and these are built in argument
 * position, before the <p> that will hold them exists. A detached View is built
 * where it is written and appended where it is passed.
 *
 * Local on purpose. `ext/markdown` would do this better and would patch
 * `View.prototype` for the thirteen other seats rendering into this same
 * document — which is not one seat's call to make. See /versus/council/.
 */
/* A backtick span is literal: the `*` in `.chain-*` is a class name, not an
 * italic marker. But a bold span may CONTAIN code — "**`full` is three bugs**"
 * is the common case — so the code cannot simply be split out first. Both
 * failures shipped on this section before this loop existed: splitting code
 * first orphaned every `**` that opened on a backtick, and not splitting at all
 * turned `.chain-*` into an open italic.
 *
 * So: find the code ranges, then mark the prose, skipping any marker that falls
 * inside one. The strings that survive still reach backtick_append, which is
 * what turns their code spans into <code>.
 */
function emphasis(text){
	const code_spans = [...text.matchAll(/`[^`]+`/g)].map(m => [m.index, m.index + m[0].length]);
	const in_code = i => code_spans.some(([from, to]) => i >= from && i < to);

	const parts = [];
	const marks = /\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;
	let last = 0, match;

	while ((match = marks.exec(text))){
		if (in_code(match.index)) continue;

		if (match.index > last) parts.push(text.slice(last, match.index));

		parts.push(new View({ tag: match[1] !== undefined ? "strong" : "em", capture: false })
			.backtick_append(match[1] ?? match[2]));

		last = marks.lastIndex;
	}

	if (last < text.length) parts.push(text.slice(last));
	return parts;
}

// A paragraph that reads as an aside — the site's own `.note`, plus bold.
export function note(text){ return p.c("note", ...emphasis(text)); }

// The claim, before the evidence for it. Every page here leads with one.
export function verdict(text){ return p.c("verdict", ...emphasis(text)); }

// A ledger — the only prose shape that can hold "what was lost" honestly, because
// it forces a call in the last column for every row.
export function ledger(head, rows){
	return table.c("ledger", () => {
		thead(() => tr(() => head.forEach(cell => th(cell))));
		// td() captures into the tr first, THEN fills — so the cell's own bold and
		// backticks are appended to a view that already knows where it lives.
		tbody(() => rows.forEach(row => tr(() => row.forEach(cell => td().backtick_append(...emphasis(cell))))));
	});
}

// Where a number came from. A count with no command behind it is an opinion, so
// the command IS the label. Same box as every other code block — only the label
// reads differently, because it is a thing you can run rather than a path.
export function measured(command, output){
	return div.c("code measured", () => {
		div.c("code-label", command);
		pre(output.trim());
	});
}
