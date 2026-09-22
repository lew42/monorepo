/* Where two grounds meet — the study behind `/framework/styles/system/studies/color/sections/`.
 *
 * It is the lighten/darken study's own `ColorStudy` with three methods added and two
 * replaced, NOT a copy of it: `slider()`, `paint()`, `measure()` and the whole
 * read-the-rendered-pixels machinery are inherited from `../study.js`. Everything this
 * page says about a colour is read back off what the browser actually painted; nothing
 * here is typed from a hex the author had in mind.
 *
 * ⚠ Same trap as the parent study: a page is built DETACHED on this site, so nothing can
 *   be measured until the boxes are in the document. `watch()` (inherited) hangs a
 *   `ResizeObserver` on the root, which fires on first layout and on every resize.
 */

import { div, figure, figcaption, h3, h4, p, ul, li, span } from "/app.js";
import { ColorStudy, GROUNDS } from "../study.js";
import { parse, ratio, lightness } from "/framework/styles/stacks/stacks.js";

/** The six grounds. The five greys are the parent study's own list, so the two pages
 *  can never disagree about what "mid gray" is; the accent is the sixth, painted with
 *  `--prim` so the hue slider drives it.
 *  `dark` means the section sets `color-scheme: dark`, which is how this site makes a
 *  band pick the light half of `--ink` — the same `.color-island` trick the palette page
 *  uses. Mid gray keeps the dark ink on purpose: it measures 3.7:1 there against the
 *  light ink's 2.3:1, so dark is the better of two bad options and the page shows it. */
export const BANDS = [
	...GROUNDS.map(([name, paint]) => ({ name, paint, dark: name === "Dark gray" || name === "Black" })),
	{ name: "Accent", paint: "var(--prim)", accent: true },
];

const HEAD = "A heading";
const BODY = "Body text, in the ink the theme picks for this ground.";
const ITEMS = ["the first item", "the second", "the third"];
const CARD_BODY = "A card, with a ground of its own.";

export class SectionsStudy extends ColorStudy {
	assign(...args){
		super.assign(...args);
		this.pairs ??= [];        // every specimen on the page: {kind, a, b, $cap}
		this.accents ??= [];      // the accent sections, whose ink flips with the slider
		this.roots ??= [];        // every box the slider's colour has to reach
		return this;
	}

	/** ⚠ The parent writes `--prim` onto its lab, because its lab CONTAINS the tiles it
	 *  drives. Here the walls are the lab's siblings — the page's own prose column owns
	 *  the rhythm between them, and wrapping them in a div would take the reading cap
	 *  off every heading in it — so each wall is registered as a root of its own and the
	 *  colour is written onto all of them. Nothing global is touched. */
	paint(){
		const value = this.hsl(1);
		this.roots.forEach($r => {
			$r.el.style.setProperty("--prim", value);
			$r.el.style.setProperty("--prim-ink", value);
		});
		super.paint();
	}

	/* ---- building ---------------------------------------------------------- */

	/** The specimen text. Identical in every cell on the page on purpose: the only
	 *  thing that changes from one cell to the next is the ground under it, so the
	 *  text has to be a constant or it would be a second variable. Returns the
	 *  paragraph, because the paragraph is the ink the ratio is about. */
	specimen(level, text, list){
		level(HEAD);
		const $p = p.c("color-sections-p", text);
		if (list) ul.c("color-sections-list", () => { ITEMS.forEach(t => { li(t); }); });
		return $p;
	}

	/** One painted box — a whole section, or a card nested in one. `extra` is what
	 *  goes between the text and the readout line (the nested card, for a nesting
	 *  cell). The readout names the ground and, once measured, says what the browser
	 *  composited and what the body ink measures on it. */
	box(band, cls, level, text, list, extra){
		const cell = { band };
		cell.$bar = div.c(cls + (band.dark ? " dark" : ""), () => {
			cell.$name = this.specimen(level, text, list);
			if (extra) extra();
			div.c("color-sections-meta", () => {
				span.c("color-sections-name", band.name);
				cell.$num = span.c("color-sections-num", "");
			});
		}).style({ background: band.paint });
		this.cells.push(cell);
		if (band.accent) this.accents.push(cell.$bar);
		return cell;
	}

	section(band, extra){ return this.box(band, "color-sections-ground", h3, BODY, true, extra); }
	card(band){ return this.box(band, "color-sections-card", h4, CARD_BODY, false); }

	/** (a) Two sections stacked, the seam between them running the full width of the
	 *  cell — nothing is inset, so the only thing you are looking at is the edge. */
	seam(a, b){
		figure.c("color-sections-cell", () => {
			const pair = { kind: "seam" };
			div.c("color-sections-stack", () => {
				pair.a = this.section(a);
				pair.b = this.section(b);
			});
			pair.$cap = figcaption.c("color-sections-cap", "");
			this.pairs.push(pair);
		});
	}

	/** (b) One section with a card inside it. The card is padded because it has a
	 *  ground of its own — that is the box rule, and the caption says whether the
	 *  rule was worth obeying here. */
	nest(outer, inner){
		figure.c("color-sections-cell", () => {
			const pair = { kind: "nest" };
			pair.a = this.section(outer, () => { pair.b = this.card(inner); });
			pair.$cap = figcaption.c("color-sections-cap", "");
			this.pairs.push(pair);
		});
	}

	/** One wall of cells, and a root the slider's colour reaches. */
	wall(build){
		const $wall = div.c("grid auto gap color-sections-wall", () => { build(); });
		this.roots.push($wall);
		return $wall;
	}

	/** Every ordered pair of two different grounds, grouped by the first — 6 → 30. */
	seams(){
		return this.wall(() => {
			BANDS.forEach(a => BANDS.forEach(b => { if (a !== b) this.seam(a, b); }));
		});
	}

	/** The same 30, nested — and one more in front of them that the six grounds cannot
	 *  show: the theme's OWN card, `--surface` on `--wash`, where the box rule is obeyed
	 *  and you still cannot see the box. */
	nests(){
		return this.wall(() => {
			this.nest({ name: "--wash", paint: "var(--wash)" }, { name: "--surface", paint: "var(--surface)" });
			BANDS.forEach(a => BANDS.forEach(b => { if (a !== b) this.nest(a, b); }));
		});
	}

	/** Two zero-size boxes painted with the theme's floor and its card, so the page can
	 *  measure the site's own quietest deliberate step instead of quoting a number. */
	probes(){
		return div.c("color-sections-probes", () => {
			this.$wash = div.c("color-sections-probe wash");
			this.$surface = div.c("color-sections-probe surface");
		});
	}

	/** The head of the page: the two sliders, then the sentence they rewrite, directly
	 *  under them. (The parent study learned this the hard way — a control's
	 *  consequence belongs next to the control, not 900px above it.) */
	lab(){
		return div.c("color-sections-lab", $lab => {
			this.$lab = $lab;
			div.c("color-sliders", () => {
				this.slider("Hue", "h", 0, 360, "°");
				this.slider("Saturation", "s", 0, 100, "%");
			});
			this.$takeaway = div.c("color-takeaway color-sections-takeaway", "Reading the colours…");
			this.probes();
		});
	}

	/* ---- reading it back --------------------------------------------------- */

	/** The accent is the one ground whose ink has to be DECIDED, and the decision
	 *  changes as you drag: at the site's orange the dark ink wins 4.7:1 to 2.2:1, and
	 *  at a deep blue it is the other way round. Read what is painted, pick the winner,
	 *  and flip `color-scheme` on the accent sections before anything is measured. */
	flip_accent(){
		if (!this.accents.length || !this.light_ink || !this.dark_ink) return;
		const floor = parse(getComputedStyle(this.accents[0].el).backgroundColor);
		if (!floor[3]) return;
		const dark_wins = ratio(this.dark_ink, floor) >= ratio(this.light_ink, floor);
		this.accents.forEach($a => $a.el.classList.toggle("dark", !dark_wins));
	}

	/** The two inks, taken off the page rather than typed: whatever the first light
	 *  section resolved `--ink` to, and whatever the first dark one did. */
	inks(){
		const light = this.cells.find(c => c.band.dark);
		const dark = this.cells.find(c => !c.band.dark && !c.band.accent);
		if (light) this.light_ink = parse(getComputedStyle(light.$name.el).color);
		if (dark) this.dark_ink = parse(getComputedStyle(dark.$name.el).color);
	}

	measure(){
		this.inks();
		this.flip_accent();
		super.measure();                      // fills every cell's ground_rgb + readout, then calls takeaway()
		this.pairs.forEach(pr => this.caption(pr));
	}

	/** ΔL* between a pair's two grounds — the honest "can you see the edge" number. */
	dl(pair){
		if (!pair.a?.ground_rgb || !pair.b?.ground_rgb) return 0;
		return Math.abs(lightness(pair.a.ground_rgb) - lightness(pair.b.ground_rgb));
	}

	/** Does the ink change across this seam? This is the whole difference between a
	 *  step and a break, and it is a fact rather than a taste: one side is reading
	 *  dark-on-light and the other light-on-dark. */
	flips(pair){
		const a = pair.a?.ink_rgb, b = pair.b?.ink_rgb;
		if (!a || !b) return false;
		return Math.round(a[0]) !== Math.round(b[0]);
	}

	/** The theme's own card-off-the-floor step, in ΔL*. Everything quieter than this is
	 *  quieter than the smallest step this site deliberately makes. */
	lift(){
		if (!this.$wash) return 0;
		const w = parse(getComputedStyle(this.$wash.el).backgroundColor);
		const s = parse(getComputedStyle(this.$surface.el).backgroundColor);
		return Math.abs(lightness(w) - lightness(s));
	}

	/** ⚠ One decimal under 10, none above. The control cell IS the theme's card step, so
	 *  its ΔL* and the step it is compared against are the same measurement — rounded to
	 *  whole numbers the caption read "ΔL* 5 · under the … step at 4.5", which looks
	 *  like the page contradicting itself. */
	num(d){ return d < 10 ? d.toFixed(1) : d.toFixed(0); }

	caption(pair){
		if (!pair.$cap) return;
		const d = this.dl(pair), lift = this.lift();
		const num = "ΔL* " + this.num(d) + " · ";
		if (pair.kind === "seam")
			pair.$cap.text(num + (this.flips(pair)
				? "the ink flips — two pages"
				: d <= lift ? "no wider than the theme's own card step — one page"
				: "one ink — two sections of one page"));
		else
			pair.$cap.text(num + (d <= lift
				? "no wider than the theme's own card step — the padding floats"
				: this.flips(pair) ? "the ink flips — the card sits hardest"
				: "the card sits"));
	}

	/** The page's one conclusion, rewritten every time a slider moves. Every number in
	 *  it is counted off the cells above, which are read off the rendered pixels. */
	takeaway(){
		if (!this.pairs.length || !this.pairs[0].a?.ground_rgb) return "Reading the colours…";
		this.cells.forEach(c => { c.ink_rgb = parse(getComputedStyle(c.$name.el).color); });

		const lift = this.lift();
		const seams = this.pairs.filter(x => x.kind === "seam");
		const nests = this.pairs.filter(x => x.kind === "nest");
		const soft = seams.slice().sort((x, y) => this.dl(x) - this.dl(y))[0];
		const quiet = seams.filter(x => this.dl(x) <= lift).length;
		const flips = seams.filter(x => this.flips(x)).length;
		const floats = nests.filter(x => this.dl(x) <= lift).length;

		const n = seams.length;
		return `${quiet ? quiet + " of these " + n + " seams hide themselves" : "Every one of these " + n + " seams is visible"}: `
			+ `the quietest — ${soft.a.band.name.toLowerCase()} against ${soft.b.band.name.toLowerCase()}, `
			+ `${this.num(this.dl(soft))} ΔL* apart — is ${quiet ? "no wider than" : "still wider than"} the smallest step this theme `
			+ `makes on purpose, a card off the page floor at ${this.num(lift)} ΔL*. `
			+ `The ${flips} that flip the ink from dark to light read as two pages; the other ${n - flips} read as two `
			+ `sections of one page. Nested, the same distance says whether the box rule paid: `
			+ `${floats === 1
				? "1 of these " + nests.length + " cards is closer to its section than that step, so its padding buys nothing you can see"
				: floats + " of these " + nests.length + " cards are closer to their section than that step, so their padding buys nothing you can see"}.`;
	}
}
