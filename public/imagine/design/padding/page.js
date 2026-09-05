import { Page, div, h2, p, a, span, img, figure, figcaption, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* ── The ladder ──────────────────────────────────────────────────────────
   One fixed-width card, six padding steps as a % of ITS OWN width — the
   owner's own framing. Same content every rung so the eye reads padding,
   not copy. */
const CARD_W = 280;
const LADDER = [0, 0.5, 2, 5, 12, 30];

const rung = pct => div.c("flex v gap").style({ gap: "0.4em", width: CARD_W + "px" }).append(() => {
	span.c("muted", `${pct}%  ·  ${Math.round(CARD_W * pct / 100)}px`);
	div.c("flex v gap").style({
		gap: "0.3em", padding: `${CARD_W * pct / 100}px`,
		border: "1px solid var(--line)", borderRadius: "0.3em", background: "var(--surface)",
	}).append(() => {
		div().style({ fontWeight: "700" }).text("Card title");
		div().style({ color: "var(--subtle)", fontSize: "0.9em" }).text("One line of body text, the same in every rung.");
	});
});

/* ── The shots ───────────────────────────────────────────────────────────
   Each entry: what the crop shows, the measured value, and whether it's a
   real miss or a false alarm the raw padding number invited. */
const SHOTS = [
	{ file: "worst-md-details.png", url: "/web/", tag: "closest real miss",
		note: "a `<details>` summary — 0 padding on either side, only a hairline top rule. Text runs the full column width with no inset at all; comfortable only because the column itself is narrow." },
	{ file: "check-scene-hint.png", url: "/imagine/scenes/", tag: "borderline",
		note: "a hint pill — 0.9px / 0.1em top-bottom, well under the 0.35em cramped line. Reads fine here because line-height buys back what padding doesn't; no margin left if the font ever changes." },
	{ file: "worst-panel-workspace.png", url: "/framework/", tag: "false alarm",
		note: "0 computed padding on a bordered card — but the content is centered and small, so it never reaches the edge. 0 padding only fails when something is near the edge to begin with." },
	{ file: "falsepos-thumb.png", url: "/framework/styles/elements/table/", tag: "false alarm",
		note: "the thumb itself has 0 padding — its child carries `.pad` (1em). The pattern `alignment-vs-padding.md` already names: check the child before calling a 0 a miss." },
	{ file: "good-page-preview.png", url: "/", tag: "comfortable",
		note: "`.page-preview` — 0.9em / 1em on a ~150–330px card. Squarely mid-band at every width sampled." },
	{ file: "good-sidebar-link.png", url: "/", tag: "comfortable",
		note: "`.sidebar-link` — 0.64em vertical, 1.4em horizontal. No frame at all, just breathing room, and it's enough." },
];

const shot = s => figure.c("flex v gap").style({ margin: 0, gap: "0.4em" }).append(() => {
	a().href(s.url).append(() => img().attr("src", here + "shots/" + s.file).attr("alt", s.url)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" }));
	figcaption(() => {
		span(s.tag.toUpperCase() + " — ").style({ fontWeight: "700", color: s.tag === "comfortable" ? "var(--prim)" : "inherit" });
		a(s.url).href(s.url);
		span.c("muted", " — " + s.note);
	});
});

/* ── The band table ───────────────────────────────────────────────────── */
const BAND_ROWS = [
	["padding as % of the box's OWN width (framed boxes, this crawl)", "p10 0.6% · median 5.8% · p90 26%", "27 urls × 390/1280/3440, 4891 framed boxes"],
	["padding as % of width, real content only (w ≥ 150px, text ≥ 15 chars)", "0% never seen over 20%", "2178 rows — the site never over-pads a real card"],
	["`pad-share` (DesignTool, vs `min(3.5% width, 3.5em)`)", "ideal 0.75–1.7×, ok 0.2–4×", "ideal-ranges.md — site-wide median 0.037–0.038 of width"],
	["`frame-gap` (gap ÷ font-size at the nearest text)", "fine ≥ 0.35×, touching < 0.12×", "ratios.md / thresholds.md"],
	["house tokens", "`.pad` 1em · `--pad-control` 0.25em/0.6–1em · `code` 0.15em/0.4em", "framework.css"],
];

export default new Page({
	meta: import.meta,
	title: "Padding",
	description: "Padding only — a live ladder from 0% to 30% of a box's own width, the comfortable band measured against DesignTool's prior numbers, and where the site's own padding actually gets thin.",
	icon: "crop_free",
	width: "full",

	children: "one-rule",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink). `preview_card`'s own rule: a thumb present
	// means the description is dropped, not doubled — the picture IS the pitch.
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/good-page-preview.png").attr("alt", nav.label));
	},

	content(){
		md("**The owner's hypothesis:** padding as a % of a box's own width — 1% is almost always too little, 30% is almost always too much, unless the box is a large section (at which point it's not really padding any more). Measured here: 27 urls × 390/1280/3440, 4891 boxes that actually draw a border/shadow/background around text (raw data: [padding-study task dir](/framework/ai/2026-09-01/padding-study/)).");

		h2("The ladder");
		p.c("muted", `A ${CARD_W}px card, six padding steps as a % of its own width. Same content at every rung.`);
		/* Not `bleed`: these are CARDS — their own bg and border — and bleed is for
		   paint. A bled wall put the leftmost card 0px from the viewport edge. */
		div.c("flex gap wrap", () => LADDER.forEach(pct => rung(pct)));

		h2("The comfortable band");
		/* `.wide`: a table in the measure squeezes its columns; the cap stands down. */
		md("| what | comfortable range | source |\n|---|---|---|\n" +
			BAND_ROWS.map(([a_, b_, c_]) => `| ${a_} | ${b_} | ${c_} |`).join("\n")).ac("wide");
		md("Two ways of reading the ladder above agree: **the comfortable stretch is roughly 2%–12% of a box's own width**, with the low end held up by an em floor (nothing under ~0.4em survives contact with real text) and the high end held down by an em ceiling (`min(3.5% of width, 3.5em)` — past a few hundred pixels wide, 3.5em is already generous, so the % keeps climbing while the comfortable feeling does not).");

		h2("Where it fails");
		p.c("muted", "Chasing 0-padding boxes across the crawl turned up fewer real misses than expected — most resolve one level down. The honest set: one real near-miss, one borderline, and the false alarms worth naming so the next crawl doesn't repeat them.");
		/* Same rule as the ladder: framed figures never bleed — "CLOSEST REAL MISS"
		   sat 0px from the viewport edge when this wall did (2026-09-01). */
		div.c("grid auto gap", () => SHOTS.forEach(s => shot(s))).style("--column", "22em");

		h2("The rule");
		md("**Padding on a real content box should land between about 0.5em and `min(6% of its own width, 3em)`** — a flat em floor so nothing touches, a shrinking ceiling so a small chip and a 3440 band don't get judged by the same percentage. Below ~150px wide, read padding in `em`, not `%` — the percentage number stops meaning anything on a box that narrow. Above roughly 30% of a box's own width, it has stopped being padding and become a *section* — the owner's own exception, and the one this crawl never saw crossed by an actual card.");
	},
});
