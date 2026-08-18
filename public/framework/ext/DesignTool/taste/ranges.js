/* THE RULEBOOK. Eleven quantities a good layout lands inside, each a dimensionless
 * ratio, each with the weight of its influence on the total.
 *
 * `rules.js` says what is BROKEN and `polish.js` says what is OFF. Neither can tell
 * two clean layouts apart — both score 100 — and ranking clean layouts is exactly
 * what a generator needs. This is the third tier: what is GOOD.
 *
 * ⚠ A range is not a rule. Outside `ok` costs credit; it fires nothing, proposes
 *   nothing and appears in no issue list. Prose: ../knowledge/ideal-ranges.md.
 */

export const RANGES = [{
	id: "measure",
	what: "characters per line, across the page's prose — code, cells and framed text excluded",
	ideal: [52, 68], ok: [34, 92], weight: 10,
	why: "45–85 is the typographic consensus and `--measure: 52em` is this site's own answer; the band is tighter than the rule's, because the rule asks whether text is readable and this asks whether it is comfortable. ⚠ THE THRESHOLDS DID NOT MOVE WHEN THE POPULATION WAS FIXED, and that is the finding rather than a coincidence. The band used to be justified as the site's own interquartile range (52–68, n=26) — but that IQR was measured over a population that admitted card captions and table cells, and it sat inside the ideal band only because two errors cancelled: prose running 75–103 characters averaged against 19–26 character captions. Read over prose alone the site's IQR is **59–78 at 1280 and 60–77 at 3440**, which is above the band, and `knowledge/characters-per-line.md`'s independent hand count (52em = 83–108 characters, two methods, four viewports) says the same thing. So the band now rests on the typographic consensus and on the site's own stated intent, NOT on where the site happens to sit — and it charges the site for the gap, which is the open `--measure` decision. `ai/2026-08-17/band-rederive/`.",
}, {
	id: "frame-gap",
	what: "the TIGHTEST frame gap on the page — padding ÷ font-size, at the 10th percentile",
	ideal: [0.45, 2.2], ok: [0.1, 4.2], weight: 5,
	why: "The measurement DesignTool exists for, read as a target rather than a floor. ⚠ BIMODAL, which is why the band is wide and the weight is low: the site clusters at ~0.4–0.8 (chrome — nav rows, toolbars) AND at ~1.6–1.9 (cards using the `clamp(0.75em, 3.5%, 3.5em)` pattern), with the median sitting in the empty middle. A single band cannot say more than 'inside one of the two clusters' until it is split by the box's role. ⚠ The ceiling had to clear **3.5**, because that is where the site's OWN formula lands a full-width band at 3440 — a band inset by `min(3.5%, 3.5em)` is 3.5× its font size by construction, and a ceiling of 3.2 made the house pattern unrepresentable. ⚠ And it reads the TIGHT END, not the average. Averaged it saturated — 0.01 of separation over 120 layouts — because a page's mean inset is fine while one box is touching, and because `pad-share` was already measuring the typical inset. This one asks what the tool was built for: how close does the tightest framed box get.",
}, {
	id: "pad-share",
	what: "side padding ÷ what a box that size should have — `min(3.5% of width, 3.5em)`",
	ideal: [0.75, 1.7], ok: [0.2, 4], weight: 7,
	why: "The frame gap alone cannot tell a 200px card from a 2000px band — both can sit at 1.0×, and one of them is wrong. This was a raw share of the width, calibrated TIGHT (median 0.037, IQR 0.033–0.047, unchanged from 1280 to 3440) — and then it put two ranges into direct conflict: 3.7% of a 3440 band is 127px, which is 7em, which `frame-gap` calls badly over-padded. Both numbers were right about DIFFERENT BOXES. `polish.js`'s `pad-scale` already writes the resolution — proportional until a box gets wide, then flat — so this measures against that expectation instead, and a 300px card with 11px and a 3440 band with 56px both read 1.0.",
}, {
	id: "gap-share",
	what: "the median gap between siblings ÷ their container's width",
	ideal: [0.008, 0.04], ok: [0, 0.09], weight: 4,
	why: "Same argument as padding, one level out: a 24px gap is generous in a card and invisible across 3440. ⚠ Measured over BOTH axes — the first version reused `ratios.gaps()`, which answers a stack only, and most 3+-child boxes on this site are grids, so the median page had no reading at all.",
}, {
	id: "scale",
	what: "share of the page's gaps that come from the four sizes it uses most, rounded to 4px",
	ideal: [0.8, 1], ok: [0.5, 1], weight: 4,
	why: "A layout drawing on a spacing scale takes most of its gaps from a handful of sizes. ⚠ IT WAS A COUNT — 'how many sizes cover four fifths' — AND A COUNT OF THAT SHAPE MEASURES THE SAMPLE. Subsampled from one page's OWN gaps it read 7.6 → 11.0 → 13.8 → 15.2 → 17.0 as n went 25 → 50 → 200 → 400 → 888, roughly doubling on every page tried, and across the corpus it ranked pages 0.55 with their gap count: `framework/ui/`, nineteen component demos on one page, scored zero for being large. The share is the same question asked so that it converges — 0.74 → 0.66 → 0.61 → 0.60 → 0.58 over the same sweep, flat by n=100. ⚠ The two constants are inherited, not fitted: FOUR is the top of the old ideal ('2–4 is a scale someone chose') and the 0.8 ideal floor is the old definition's own 'four fifths'. The `ok` floor says a page whose four commonest sizes cover less than half its gaps has no vocabulary at all. ⚠ AND THE OLD LOW END WAS DEAD: 'one gap is no hierarchy' never fired, because the minimum reading across 168 pages at both widths was 2.00 and the ideal began at 2.",
}, {
	id: "lanes",
	what: "share of blocks whose left edge shares a lane with two others",
	ideal: [0.75, 1], ok: [0.35, 1], weight: 6,
	why: "Alignment, counted rather than eyeballed. `polish.js`'s `alignment` reports the near-misses; this reports how much of the page is on a lane at all — the positive form, which a near-miss rule cannot express. TIGHT (median 0.93–0.94, IQR 0.89–0.97) ⚠ but PARTLY AN ARTEFACT: measured on a whole `.app`, the nav and page chrome anchor most boxes whatever the content does — the `library/bad/` traps score HIGHER on it than the good pages. Hence 0.75 rather than the measured 0.85, and six rather than eight.",
}, {
	id: "repetition",
	what: "share of text inside a group of three or more IDENTICALLY-CLASSED siblings",
	ideal: [0.1, 0.45], ok: [0.02, 0.85], weight: 4,
	why: "BOTH ends are wrong, which is why it is a band and not a floor. All-unique is noise with no pattern to learn; all-repeated is a wall with no hierarchy. ⚠ It is STRUCTURAL, and the wording above is load-bearing: siblings are grouped by `probe.js`'s `label()` — tag plus its first three classes — and the text is never read. Six `div.flex.v.gap` boxes are a repetition whether they hold six different paragraphs or one paragraph six times, which was proved by writing six of each and measuring 1.00 both times. So this band asks whether a page is built from repeated COMPONENTS, and no amount of rewriting the copy moves it. ⚠ The band also moved a long way on measurement: written at 0.3–0.75 from intuition, and the site's good pages sit at 0.23 (p10–p90 0.09–0.42). DIFFUSE — page type drives it, so the weight is low.",
}, {
	id: "slivers",
	what: "share of text-holding boxes under 160px wide",
	ideal: [0, 0.02], ok: [0, 0.22], weight: 6,
	why: "What deep nesting actually COSTS. A depth-6 roll is not bad because it is deep; it is bad because the fourth column is 80px and the heading ladders one letter a line. Measured directly, the depth dial needs no cap.",
}, {
	id: "depth",
	what: "median depth of a text leaf, from the analysis root",
	ideal: [3, 9], ok: [1, 16], weight: 3,
	why: "Flat is a list, not a layout; deep is slivers. ⚠ ROOT-RELATIVE — it compares two pages only when both are measured from the same kind of root, which is true of a generator search and false of a site-wide audit: measured from `.app`, this site's pages read 8 and 13–15 with nothing between, because four of those levels are chrome. Bimodal AND root-relative is two reasons to weight it last.",
}, {
	id: "width-used",
	what: "content span ÷ the width the layout was given",
	ideal: [0.7, 1], ok: [0.28, 1], weight: 8,
	why: "The prime objective, as a number: the room gets USED, not left as gutter. ⚠ UNGATED, where `dead-space` only fires at 1500px and up — that rule asks whether the window is to blame, and this asks whether the layout spent what it was given, which is a fair question at 390 too. ⚠ And NO CEILING: the band charged a full-bleed shell for spanning 99% until it was noticed that padding is already its own range — 'nothing is breathing' is `pad-share`'s complaint, and taking it twice made every app shell on the site read worse than a centred column.",
}, {
	id: "contrast",
	what: "the largest HEADING ÷ the median text size",
	ideal: [2.2, 4.2], ok: [1.15, 7], weight: 5,
	caveat: "SATURATED ON THIS SITE — full credit on 163 of 165 rows, because one theme means one type ramp and every page draws the same five ratios from it. Not a defect to fix here: over 360 generated layouts this was one of only four bands that told a good roll from a bad one. A band can be saturated for one population and sharp for another.",
	why: "Type hierarchy, the one non-geometric quantity here. A page whose largest text is 1.2× its body has no heading; one at 7× has a poster and a footnote and nothing between. ⚠ THE LARGEST HEADING, not the largest TEXT: `max(fs)` let one decorative glyph set the whole band — a 125.7px clock inside an unmarked Panel demo over a 15px median read 8.38, and a component's oversized numeral read 18.20 at 3440. On 165 of 169 pages the largest text already IS a heading, so this changes four rows and removes both outliers (max 8.38 → 3.92 at 1280, 18.20 → 3.91 at 3440). ⚠ A character floor was tried first and is the instructive failure: a page TITLE is short — 4–9 characters — so any threshold that excludes an 8-character clock excludes most of the site's h1s too, and the median fell 3.42 → 2.36.",
}];

/* ⚠ A RANGE THAT SEPARATES NOTHING IS NOT A RANGE THAT IS WRONG. Searched against
 *   360 generated layouts, only four of the eleven told a good roll from a bad one:
 *   `frame-gap`, `pad-share`, `measure`, `contrast`. `slivers`, `depth`,
 *   `repetition`, `scale` and `gap-share` were saturated — the generator's model
 *   already keeps every roll clear of the zones they exist to catch — and
 *   `width-used` went saturated the moment its own bug was fixed. None of that is
 *   an argument for dropping any of them: the nine HAND-WRITTEN layouts in
 *   `styles/layouts/space/presets.js` fail `width-used` hard at 3440, and a range
 *   can be saturated for one population and the sharpest thing you own for another.
 *   `ai/2026-08-16/layout-generator-rules/hunt.md` holds both runs. */
export const BY_ID = Object.fromEntries(RANGES.map(r => [r.id, r]));

export const TOTAL = RANGES.reduce((sum, r) => sum + r.weight, 0);

/* Full credit inside `ideal`, falling linearly to zero at the far edge of `ok`.
 * ⚠ Not a step: a step cannot tell 79 characters a line from 300, which is the same
 *   mistake `rules.js` documents as "severity is a curve, not a line". */
export function credit(value, range){
	if (!Number.isFinite(value)) return null;

	const [i0, i1] = range.ideal, [o0, o1] = range.ok;

	if (value >= i0 && value <= i1) return 1;
	if (value < i0) return i0 > o0 ? Math.max(0, (value - o0) / (i0 - o0)) : 0;
	return o1 > i1 ? Math.max(0, (o1 - value) / (o1 - i1)) : 0;
}

/* THE SAME TABLE FROM THE OTHER SIDE: what to WRITE so the measurement lands in the
 * band. `styles/layouts/space/gen.js` samples these, `RANGES` above grades the
 * result, and the loop between them is the whole self-improving story — a generator
 * that draws from the rulebook the analyzer marks it against.
 *
 * Every value is an `em` unless it says otherwise. */
export const AUTHOR = {
	pad:     [0.8, 1.4],       // → frame-gap, on ~1em text
	/* → pad-share. A BAND pads more than a card, and it has to say so on the track
	   rather than let it inherit down — `--pad: 3em` on a wide track is 3em on the
	   300px card inside it too, which reads as badly over-padded and cost nine points
	   of mean fitness across a sweep before every leaf reclaimed `pad` above. */
	bandpad: [2.4, 3.5],
	gap:     [0.6, 1.6],       // → gap-share, at the widths this site lays out at
	/* → measure. ⚠ NOT the site's `--measure: 52em`, and that is a finding rather than
	   a disagreement: Montserrat runs ~2 characters per em here, so 52em measures
	   ~104 characters a line at every viewport — which `knowledge/characters-per-line.md`
	   already records as 83–103, above the tool's own band. The rulebook's job is to
	   author a value that MEASURES right, so it writes the em that lands at 54–68. */
	measure: [27, 34],
	rail:    [12, 17],         // a navigation rail: wide enough for two words, never a third
	index:   [21, 30],         // a list track beside a detail pane
	band:    [16, 34],         // a fixed track that is neither
	depth:   [1, 3],           // → depth and slivers. Past 3 the fourth column is a sliver
	tracks:  [1, 3],           // columns in the body row
	repeat:  [3, 9],           // items in a repeated group → repetition
};

export default RANGES;
