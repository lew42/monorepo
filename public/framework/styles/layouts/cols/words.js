/* The word set as data, and the one measuring helper every page in this lab uses.

   A word is: the class, the tracks it expects, and the ratio it CLAIMS. The claim is the
   point — a demo that only shows boxes proves nothing, so every row on every page prints
   its intended ratio beside its measured one and marks them agreeing or not. */

import { View, div, span } from "/app.js";

/* css: every `.cols-*` class below and on the two pages. Loaded HERE rather than in
   page.js because both pages import this module and either can be the first one routed. */
View.stylesheet(import.meta, "cols.css");

/* ── the proposal ── */

export const WORDS = [{
	name: "half",
	claim: "50 / 50",
	floor: "34rem",
	note: "Two peers. The row the site hand-rolls most often.",
	tracks: [
		{ name: "Feature", kind: "a stage — scales", w: 1 },
		{ name: "Feature", kind: "a stage — scales", w: 1, quiet: true },
	],
}, {
	name: "golden",
	claim: "61.8 / 38.2",
	floor: "34rem",
	note: "The ratio the decks lab measured wrong at first: a zero basis reads 1.527, a percentage basis reads 1.618.",
	tracks: [
		{ name: "Statement", kind: "scales with the region", w: 61.8 },
		{ name: "Notes", kind: "caps at its measure", w: 38.2, quiet: true },
	],
}, {
	name: "two-one",
	claim: "2 : 1",
	floor: "34rem",
	note: "The seam wire/doc/bento.md could not say from a class string. Two pages ship an inline flex: 2 1 30em for it.",
	tracks: [
		{ name: "Stage", kind: "scales with the region", w: 2 },
		{ name: "Wall", kind: "adds columns", w: 1, quiet: true },
	],
}, {
	name: "main-aside",
	claim: "68 / 32, aside capped at 26rem",
	floor: "34rem",
	note: "The first word with a CEILING. An aside holds a list, and a list does not scale.",
	tracks: [
		{ name: "Article", kind: "scales", w: 68 },
		{ name: "On this page", kind: "a list — capped at 26rem", w: 32, quiet: true },
	],
}, {
	name: "thirds",
	claim: "1 : 1 : 1",
	floor: "52rem",
	note: "Three peers, and the case .flex.auto answers with an orphan second row.",
	tracks: [
		{ name: "One", kind: "a peer", w: 1 },
		{ name: "Two", kind: "a peer", w: 1, quiet: true },
		{ name: "Three", kind: "a peer", w: 1 },
	],
}, {
	name: "rail-main-aside",
	claim: "16em rail, then 70 / 30, aside capped at 22rem",
	floor: "60rem",
	note: "Fixed rail, fluid main, capped aside — the documentation shape, and the one .flex.auto cannot express at all.",
	tracks: [
		{ name: "Sections", kind: "a list — fixed 16em", w: null, quiet: true },
		{ name: "Article", kind: "scales", w: 70 },
		{ name: "On this page", kind: "a list — capped at 22rem", w: 30, quiet: true },
	],
}];

/* ── today, for the indictment ──
   The same intents, said with the words that exist. `style` is per-child and applies in
   order; an inline style here is the finding, not a shortcut. */

export const TODAY = [{
	name: "2 peers",
	cls: "flex auto gap",
	claim: "50 / 50",
	note: "`.flex.auto` with two children. The one case it is genuinely good at.",
	tracks: [{ name: "Feature", w: 1 }, { name: "Feature", w: 1, quiet: true }],
}, {
	name: "2:1, per-child --column",
	cls: "flex auto gap",
	claim: "2 : 1",
	note: "bento.md's candidate 1 — two bases under one class string. It decays.",
	tracks: [
		{ name: "Stage", w: 2, style: { "--column": "30em" } },
		{ name: "Wall", w: 1, quiet: true, style: { "--column": "15em" } },
	],
}, {
	name: "2:1, --grow",
	cls: "flex auto gap",
	claim: "2 : 1",
	note: "What framework.css shipped instead: the basis scales with the weight, so the ratio holds — and the wrap threshold moves to 42em.",
	tracks: [
		{ name: "Stage", w: 2, style: { "--grow": "2" } },
		{ name: "Wall", w: 1, quiet: true },
	],
}, {
	name: "3 peers",
	cls: "flex auto gap",
	claim: "1 : 1 : 1",
	note: "Three children, one --column. Watch the second line.",
	tracks: [{ name: "One", w: 1 }, { name: "Two", w: 1, quiet: true }, { name: "Three", w: 1 }],
}, {
	name: "aside, --grow",
	cls: "flex auto gap",
	claim: "68 / 32 — and nothing stops the aside",
	note: "The ratio holds. That is the trouble: there is no ceiling in the vocabulary, so 32% of 3440 is 32% of 3440, and an aside holds a list.",
	tracks: [
		{ name: "Article", w: 68, style: { "--grow": "2.125" } },
		{ name: "On this page", kind: "a list", w: 32, quiet: true },
	],
}, {
	name: "rail + main",
	cls: "flex gap",
	claim: "16em rail, main takes the rest",
	note: "`.basis` + `.flex-1` — the one 2-track shape today already gets right, and it never stacks.",
	tracks: [
		{ name: "Sections", kind: "a list", w: null, quiet: true, cls: "basis", style: { "--basis": "16em" } },
		{ name: "Article", w: 1, cls: "flex-1" },
	],
}];

/* ── drawing ── */

const cell = track => {
	let $px;

	const $cell = div.c("cols-cell" + (track.quiet ? " cols-quiet" : "") + (track.cls ? " " + track.cls : ""), () => {
		span.c("cols-name", track.name);
		$px = span.c("cols-px", "-");
		if (track.kind) span.c("cols-note", track.kind);
	});

	if (track.style) $cell.style(track.style);
	$cell.$px = $px;

	return $cell;
};

/* ⚠ The cells are built INSIDE the row's callback — the factories append to whatever
   callback is running, so a cell made before the row would land in the row's parent. */
export const row = word => {
	const cells = [];
	const $row = div.c(word.cls ?? "cols-row cols-" + word.name,
		() => word.tracks.forEach(track => cells.push(cell(track))));

	$row.cells = cells;
	return $row;
};

/* Two numbers that have to agree. `intent` is read off the track weights: the ratio of
   the first two that HAVE one, so a fixed rail (w: null) sits out of the comparison it
   was never part of.
   ⚠ ResizeObserver, not one measurement — the point of this lab is what happens as the
     row changes width, and a hidden tab never lays out at all. */
export const measure = ($row, word, $read) => {
	const weighted = word.tracks.map((t, i) => [t, i]).filter(([t]) => t.w != null);
	const want = weighted.length > 1 ? weighted[0][0].w / weighted[1][0].w : null;

	const paint = () => {
		const box = $row.cells.map($c => $c.el.getBoundingClientRect());
		box.forEach((r, i) => $row.cells[i].$px.text(Math.round(r.width) + "px"));

		/* Two cells are on one line when their vertical ranges OVERLAP — a top comparison
		   is wrong the moment two tracks have different heights (the layout skill's own
		   caveat, learned on the homepage topbar).
		   Counting LINES rather than "did it stack" is what catches the orphan: three
		   tracks on two lines is neither three columns nor one. */
		const lines = box.reduce((n, r, i) => n + (i && r.top >= box[i - 1].bottom - 1 ? 1 : 0), 1);

		$read.empty(() => {
			span(Math.round($row.el.getBoundingClientRect().width) + "px row");

			if (lines === box.length && lines > 1) return span.c("cols-ok", "stacked");
			if (lines > 1) return span.c("cols-bad", lines + " lines — orphan");
			if (want == null) return span.c("cols-ok", "fixed track");

			/* ⚠ A CEILING CHANGES THE CLAIM. Once an aside is at its cap the row is no
			   longer 68/32, and calling that a 239% error would be reporting the feature
			   as the bug. A cap is detected STRUCTURALLY — a track narrower than its own
			   share of the room — rather than by repeating 26rem here: the stylesheet owns
			   the number, and this reads back what it did.
			   ⚠ `getComputedStyle(el).maxWidth` cannot do it: the value is
			     `max(26rem, calc((34rem - 100%) * 999))` and Chrome hands that back
			     unresolved, so parseFloat is NaN and every cap reads as absent. */
			const room = $row.el.getBoundingClientRect().width;
			const gaps = (box.length - 1) * (parseFloat(getComputedStyle($row.el).columnGap) || 0);
			const fixed = word.tracks.reduce((n, t, i) => n + (t.w == null ? box[i].width : 0), 0);
			const sum = weighted.reduce((n, [t]) => n + t.w, 0);
			const share = i => (room - gaps - fixed) * word.tracks[i].w / sum;

			/* ⚠ Both halves are needed. "Narrower than its share" alone calls `.flex.auto`'s
			   DECAY a cap and hides the very finding this lab is for; "has a max-width"
			   alone fires before the ceiling has bitten. Chrome hands the max-width back
			   unresolved, so it can be tested for presence and not for its value. */
			const capped = weighted.map(([, i]) => i).find(i =>
				getComputedStyle($row.cells[i].el).maxWidth !== "none" && box[i].width < share(i) - 1);

			if (capped != null){
				const spent = box.reduce((n, r) => n + r.width, 0) + gaps;

				span("capped " + Math.round(box[capped].width) + "px");
				span("its share was " + Math.round(share(capped)) + "px");
				return span.c(Math.abs(spent - room) <= 2 ? "cols-ok" : "cols-bad",
					Math.abs(spent - room) <= 2 ? "row fully spent" : "leaks " + Math.round(room - spent) + "px");
			}

			const got = box[weighted[0][1]].width / box[weighted[1][1]].width;
			const off = Math.abs(got - want) / want;

			span("want " + want.toFixed(3));
			span("got " + got.toFixed(3));
			span.c(off <= 0.01 ? "cols-ok" : "cols-bad",
				off <= 0.01 ? "holds" : "off by " + (off * 100).toFixed(1) + "%");
		});
	};

	new ResizeObserver(paint).observe($row.el);
	paint();

	return $read;
};

/* One word, drawn and read, as a block. */
export const demo = word => div.c("flex v gap", () => {
	const $row = row(word);
	measure($row, word, div.c("cols-read"));
}).style("--gap", "0.5em");
