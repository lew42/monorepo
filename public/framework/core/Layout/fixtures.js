import { div, p, h3, h4, span, a, button, img, table, thead, tbody, tr, th, td } from "../View/View.js";

/* ── THE STRESS FIXTURES ───────────────────────────────────────────────────────

   A layout owns no content (the owner, addendum 2). These eight are what gets
   poured into its slots instead, and they ARE the separation: a layout that only
   looks right with particular content fails one of them visibly.

   Three axes, both ends of each, plus the two worst corners:

     text    "OK" — two characters in every slot   ·   900 words, no paragraph breaks
     image   none at all                           ·   one 4000 x 3000 per image slot
     tone    light                                 ·   dark (color-scheme: dark)

   ⚠ THE HUGE IMAGE IS A DATA URI, not a file. A 4000 x 3000 SVG costs 90 bytes and
     has the same intrinsic size a photograph would, so it exercises exactly the
     thing being tested — framework.css's `img { max-width: 100% }` against a track
     that may be 200px wide — with no network and no asset to keep in step.

   ⚠ EVERY PROSE SLOT IS BOUNDED AT THE MEASURE, and that is a decision made in the
     port: `.page.standard` bounds prose for every layout on the live site, so a
     layout lifted out of a page has to say it itself or it is being judged without
     the thing that was holding it. A box says `measure: false` to opt out, and then
     the checker's measure rule can fire on it. doc/porting.md.                    */

const SHORT = "OK";

const WORD = "the quick brown fox jumps over a lazy dog while nine plum trees lean into the wind and every layout in this catalogue is asked to hold the sentence without breaking ";

// 900 words, one block, no paragraph breaks — the longest-text fixture.
const LONG = WORD.repeat(30).trim() + ".";

const HUGE = "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'4000'%20height%3D'3000'%3E%3Crect%20width%3D'4000'%20height%3D'3000'%20fill%3D'%23888'%2F%3E%3C%2Fsvg%3E";

export const MEASURE_CAP = "min(var(--measure, 40em), 100%)";

/* The eight runs. `tone: "dark"` sets `color-scheme: dark` on the host, which is the
   one line that flips every `light-dark()` token inside it (framework.css:180). */
export const FIXTURES = [
	{ id: "short",    chip: "Short",     label: "Shortest text — two characters in every slot",     text: "short", image: "none", tone: "light" },
	{ id: "long",     chip: "Long",      label: "Longest text — 900 words, no paragraph breaks",    text: "long",  image: "none", tone: "light" },
	{ id: "no-image", chip: "No image",  label: "No image at all",                                  text: "some",  image: "none", tone: "light" },
	{ id: "huge",     chip: "Huge image", label: "One 4000 x 3000 image per image slot",            text: "some",  image: "huge", tone: "light" },
	{ id: "light",    chip: "Light",     label: "Light tone",                                       text: "some",  image: "huge", tone: "light" },
	{ id: "dark",     chip: "Dark",      label: "Dark tone — color-scheme: dark flips every token", text: "some",  image: "huge", tone: "dark"  },
	{ id: "worst",    chip: "Worst",     label: "The worst corner — longest + huge + dark",         text: "long",  image: "huge", tone: "dark"  },
	{ id: "emptiest", chip: "Emptiest",  label: "The emptiest corner — shortest + none + light",    text: "short", image: "none", tone: "light" },
];

export const fixture_of = id => FIXTURES.find(f => f.id === id) ?? FIXTURES[4];

const words = fixture => fixture.text === "short" ? SHORT
	: fixture.text === "long" ? LONG
	: "A heading and a sentence or two, which is all one slot ever holds.";

/* ── ONE BOX, FILLED ───────────────────────────────────────────────────────────
   `kind` is the slot's own word for what pours into it. Six kinds cover all thirty
   layouts; a seventh would be a new shape, not a new layout. */
const KINDS = {

	/* ⚠ THE MEASURE CAP LANDS ON THE PARAGRAPH, never on the BOX. On the box it also
	   stops the TRACK's content from filling it — a shell's 1fr body ended 260px
	   short of its aside with a hole between them — and a hole is not what the rule
	   is for. On the paragraph it is exactly what `.page.standard` does. */
	prose(box, fixture){
		h3(box.label);
		const n = fixture.text === "long" ? 1 : (box.repeat ?? 2);

		for (let i = 0; i < n; i++){
			const $p = p(words(fixture));
			if (box.measure !== false) apply($p, { "max-width": MEASURE_CAP });
		}
	},

	list(box, fixture){
		h4(box.label);
		for (let i = 0; i < (box.repeat ?? 5); i++)
			a.c("page-layout-row", fixture.text === "long" ? words(fixture).slice(0, 90) : "Item " + (i + 1)).href("#");
	},

	media(box, fixture){
		if (fixture.image === "huge") picture();
		else div.c("page-layout-plate");
		span.c("muted", box.label);
	},

	tiles(box, fixture){
		for (let i = 0; i < (box.repeat ?? 6); i++)
			div.c("page-layout-tile", () => {
				h4(box.label + " " + (i + 1));
				if (fixture.image === "huge" && i === 0) picture();
				p(box.ragged && i % 3 === 1 ? words(fixture) + " " + words(fixture) : words(fixture));
			});
	},

	controls(box, fixture){
		span.c("page-layout-legend", box.label);
		["All", "Broken", "Polish", "Waived", "Reset"].forEach(t =>
			button.c("page-layout-btn", fixture.text === "long" ? t + " every layout in the catalogue" : t));
	},

	table(box, fixture){
		table.c("page-layout-table", () => {
			thead(() => tr(() => ["Rule", "Measurement", "high", "medium", "low", "Tier"].forEach(h => th(h))));
			tbody(() => {
				for (let i = 0; i < 5; i++)
					tr(() => ["cramped", fixture.text === "long" ? words(fixture).slice(0, 120) : "text-to-frame", "< 0.12", "—", "< 0.35", "broken"]
						.forEach(cell => td(cell)));
			});
		});
	},

	/* A slot that holds a token — a name, a figure, a status bar's label. It still
	   gets the longest-text fixture, because "what happens when this is long" is the
	   question; and its paragraph is still capped at the measure, because a bar with
	   a long label is not a licence to run a 57em line. */
	bare(box, fixture){
		div.c("page-layout-tokens", () => {
			span.c("page-layout-legend", box.label);
			if (box.note) span.c("muted", box.note);
		});

		if (fixture.text === "long") apply(p(words(fixture)), { "max-width": MEASURE_CAP });
	},
};

const picture = () => img.c("page-layout-image").attr("src", HUGE).attr("alt", "4000 by 3000");

/* ── THE ARRANGEMENT, WITH A FIXTURE IN IT ─────────────────────────────────────
   One renderer for all thirty: the entry's `decl` goes on the container, one box
   per track, and `kids` is a track that holds a split of its own. This is the
   `arrange()` the plan asked for — written once, over data, so there are not
   thirty copies of it to keep in step.

   `count` overrides a wrapping box's item count: the 1 · 2 · 3 · 5 · 7 fixtures
   that prove a `flex wrap` or `grid auto-fill` at awkward numbers.               */
export function arrange(layout, fixture = FIXTURES[4], count){
	return apply(div.c("page-layout-render"), layout.decl)
		.append(() => (layout.boxes ?? []).forEach(box => draw(box, fixture, count)));
}

function draw(box, fixture, count){
	const kind = KINDS[box.kind] ?? KINDS.bare;
	const many = count && (box.repeat ?? 1) > 1 ? { ...box, repeat: count } : box;

	const $box = div.c("page-layout-box").ac(box.kind && "page-layout-" + box.kind);

	return apply($box, box.decl).append(() => {
		if (box.kids) return box.kids.forEach(kid => draw(kid, fixture, count));
		kind(many, fixture);
	});
}

/* ⚠ `setProperty`, never `el.style[prop]` — one call takes a custom property and a
   kebab-case property alike, and neither depends on the CSSOM's dashed-attribute
   aliases. Lifted verbatim from `/imagine/layouts/system.js:29`, which learned it. */
export function apply($el, decl){
	for (const prop in decl ?? {}) $el.el.style.setProperty(prop, decl[prop]);
	return $el;
}

/* The tone a fixture asks for, as declarations for the HOST — never for the layout
   itself, which owns no colour any more than it owns content. */
export const tone_of = fixture => fixture.tone === "dark"
	? { "color-scheme": "dark", background: "var(--surface)", color: "var(--ink)" }
	: { "color-scheme": "light", background: "var(--surface)", color: "var(--ink)" };

export default FIXTURES;
