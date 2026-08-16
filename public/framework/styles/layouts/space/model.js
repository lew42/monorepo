/* THE MODEL: what a page is made of, as weights. Everything the generator draws is
 * a draw from this file, and `chaos` is how far it is allowed to stray from it.
 *
 * The old generator drew a part uniformly from a flat list, so a `footer` could land
 * in a rail and a `topbar` three levels down inside a card. That is not a wilder
 * layout, it is a wrong one — and it is why nothing it rolled could be scored. A
 * **role** is a position; a **part** is what may fill it, with a weight.
 *
 * ⚠ Every name on the right of ROLES must be in `spec.js`'s PARTS *and* in
 *   `ext/Panel/generate.js`'s PANELS map — those three lists are one commit-unit,
 *   and Panel's is owned by another session. Add roles freely; add PARTS never.
 *
 * Design record: readme.md, "A grammar, not a flat pick".
 */

/* A shape is the BODY of a page — what sits between the masthead and the footer.
 * `dir` is the body's own axis; `tracks` are its regions, in order. These nine are
 * the shapes `presets.js` spends a directory each on, which is the argument for
 * exactly this list: they are what the site is actually built from.
 *
 * ⚠ THE WEIGHTS ARE MEASURED, NOT CHOSEN — 360 rolls rated at three widths and
 *   grouped by shape, each old weight scaled by its lift cubed
 *   (`ai/2026-08-16/layout-generator-rules/hunt.md`, "Shapes, redone"). `shell` won
 *   at lift 1.14 and `deck` lost at 0.90. Cubed rather than raw, so one run of
 *   evidence moves a weight without replacing it: a 14% lift is worth about half
 *   again, not fourteen per cent.
 * ⚠ And the FIRST run of that search said something different — `mail` led it and
 *   `gallery` was last by a mile — because three bugs in the rating tier were fixed
 *   between the two runs, and two of them hit the text-poorest shapes hardest. The
 *   first thing a search finds is the scorer's bugs. Never retune off one run. */
export const SHAPES = {
	bands:   { w: 6, dir: "v", tracks: ["feature", "wall", "prose", "wall"], vary: true },
	column:  { w: 5, dir: "v", tracks: ["prose"] },
	rail:    { w: 5, dir: "h", tracks: ["rail", "main"] },
	docs:    { w: 4, dir: "h", tracks: ["rail", "main", "aside"] },
	split:   { w: 4, dir: "h", tracks: ["index", "main"] },
	shell:   { w: 3, dir: "h", tracks: ["rail", "stack", "aside"] },
	gallery: { w: 3, dir: "h", tracks: ["rail", "wall"] },
	deck:    { w: 2, dir: "v", tracks: ["wall"] },
	mail:    { w: 2, dir: "h", tracks: ["rail", "index", "main"] },
};

/* Role → the parts that belong in it, weighted. A part with no weight in a role is
 * not forbidden — it is off-model, and `chaos` is exactly the dial that reaches it. */
export const ROLES = {
	masthead: { topbar: 6, toolbar: 3, brand: 1 },
	rail:     { menu: 6, toc: 2 },
	aside:    { toc: 6, menu: 1 },
	feature:  { hero: 6, cards: 1, tiles: 1 },
	prose:    { sections: 6, notes: 1 },
	wall:     { cards: 5, tiles: 4, notes: 2 },
	index:    { rows: 6, notes: 1 },
	main:     { sections: 5, cards: 3, rows: 2, tiles: 2, notes: 1 },
	foot:     { footer: 1 },
};

/* What a track CLAIMS of the line it is on. A rail is a measure, a main is fluid,
 * and prose is a measure that centres — the three claims every layout in this rail
 * writes by hand. `stack` is the one composite: a column inside a row. */
export const CLAIM = {
	rail: "rail", aside: "rail", index: "index",
	prose: "measure", main: "fluid", wall: "fluid", feature: "full", stack: "fluid",
};

/* WHAT IS BEST INSIDE WHAT. When a track is deep enough to split, its children are
 * drawn from here — a `main` splits into prose and walls, a wall of cards splits
 * into more walls, and a rail never splits at all (it is not in this table, and
 * `gen.js` treats a fixed-measure role as a leaf: a nav rail that divides is two
 * nav rails, which is not a shape anybody wants).
 *
 * This is the second half of the answer to "a header in the wrong area". ROLES keeps
 * chrome out of a rail; INNER keeps a rail out of the middle of an article. */
export const INNER = {
	main:    { prose: 4, wall: 4, index: 2, feature: 1 },
	wall:    { wall: 5, prose: 2, index: 1 },
	prose:   { prose: 5, wall: 2, feature: 1 },
	index:   { index: 5, prose: 2 },
	feature: { feature: 3, prose: 2, wall: 2 },
};

/* How many items a repeated part draws, per role. A wall wants a wall's worth; a
 * rail wants a rail's worth, and twelve links in a 14em rail is a scroll nobody
 * asked for. → `taste`'s `repetition` band. */
export const COUNTS = {
	rail: [4, 7], aside: [3, 6], index: [6, 14],
	prose: [3, 6], wall: [6, 12], main: [3, 8], feature: [1, 3],
};

/* Depth, as a preference rather than a cap. The dial is still a ceiling; this is
 * what the model asks for underneath it. Past 3 the fourth column is a sliver —
 * which `taste`'s `slivers` band measures rather than asserts.
 *
 * ⚠ It runs all the way to 10 for a reason that has nothing to do with taste: the
 *   table's KEYS are the vocabulary `draw.js` blends toward uniform, so a table
 *   stopping at 5 made the right half of the dial unreachable at any chaos. The tail
 *   weights are deliberately tiny — on the model those rolls are rare; at chaos 1
 *   they are one in eleven, which is what "uniform over everything the format can
 *   say" has to mean if the dial is not to be lying. */
export const DEPTHS = { 0: 2, 1: 5, 2: 5, 3: 3, 4: 1.5, 5: 0.8, 6: 0.5, 7: 0.3, 8: 0.2, 9: 0.15, 10: 0.1 };

/* THE SITE'S OWN COLOURS, not a random hue. `--tone` is a token REFERENCE now, mixed
 * at low alpha by `spec.js`'s `tone` word — so it still composites darker with every
 * level of nesting (which is what makes depth legible), and it still inherits down a
 * subtree (which is what makes it a scheme rather than a rainbow), but every colour
 * on the page is one the theme already owns and a retheme moves all of them.
 *
 * ⚠ Deliberately NOT the `--wash`/`--tint`/`--surface` ladder: those three are OPAQUE
 *   by decision (`layers/theme/lew42/lew42.css`), so nesting them cannot composite
 *   and ten levels look like one. */
export const TONES = { "var(--ink)": 5, "var(--subtle)": 3, "var(--prim)": 2 };

export const PARTS_ALL = "topbar toolbar brand hero menu toc sections cards rows tiles notes footer".split(" ");
