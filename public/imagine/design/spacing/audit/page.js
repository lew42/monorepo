import { Page, md, h2, p, div, figure, figcaption, img, a, span } from "/app.js";
import DATA from "./data.js";

const here = new URL(".", import.meta.url).pathname;

/* Container: a plain column of /imagine/'s row, under the columns host — so no page grid,
   no `wide`, and `.page-column-prose` caps prose at the measure while a `div.grid` child is
   free. Size: `full`, like the study above it and `ceilings` beside it: forty screenshots
   need the whole column. Own layout: `md()` prose in the column's own `.flow`, two tables
   (`.ac("wide")`, or the measure compresses them), and one `.grid.auto` wall of pairs at
   `--column: 55em` — one pair per row at 1280, three across at 3440, each shot still
   readable. Regions: none. Preview: the three levels, not the default icon card.

   Every number here is generated (`data.js`) from the four auditors' before/after json.
   Nothing on this page is a conclusion — the judge's reasoning is in `../decision.md`. */

const px = v => v === null || v === undefined ? "—" : `${v}px`;
const x  = v => v === null || v === undefined ? "—" : `${v}×`;

const shot = (slug, round) => a().href(here + `shots/${slug}-${round}.jpg`).append(() =>
	img().attr("src", here + `shots/${slug}-${round}.jpg`).attr("alt", `${slug}, ${round}, 3440`)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" }));

// The third round's pair: the decision's "after" is this round's "before".
const movePair = r => figure.c("flex v gap").style({ margin: 0, gap: "0.4em" }).append(() => {
	div.c("grid").style({ gridTemplateColumns: "1fr 1fr", gap: "0.5em" }).append(() => {
		div.c("flex v").style({ gap: "0.25em" }).append(() => {
			span.c("muted", "tokens only").style({ fontSize: "0.75em", letterSpacing: "0.04em" });
			shot(r.slug, "after");
		});
		div.c("flex v").style({ gap: "0.25em" }).append(() => {
			span.c("muted", "components too").style({ fontSize: "0.75em", letterSpacing: "0.04em" });
			shot(r.slug, "components");
		});
	});
	figcaption(() => {
		a(r.url).href(r.url);
		md(` — median gap at 3440 **${px(r.m3440_b)} → ${px(r.m3440_a)}**, growth ${x(r.growth_b)} → ${x(r.growth_a)}.`);
	}).style({ fontSize: "0.85em" });
});

const pair = r => figure.c("flex v gap").style({ margin: 0, gap: "0.4em" }).append(() => {
	div.c("grid").style({ gridTemplateColumns: "1fr 1fr", gap: "0.5em" }).append(() => {
		div.c("flex v").style({ gap: "0.25em" }).append(() => {
			span.c("muted", "before").style({ fontSize: "0.75em", letterSpacing: "0.04em" });
			shot(r.slug, "before");
		});
		div.c("flex v").style({ gap: "0.25em" }).append(() => {
			span.c("muted", "after").style({ fontSize: "0.75em", letterSpacing: "0.04em" });
			shot(r.slug, "after");
		});
	});
	figcaption(() => {
		a(r.url).href(r.url);
		md(` — median gap at 3440 **${px(r.m3440_b)} → ${px(r.m3440_a)}**, at 1280 ${px(r.m1280_b)} → ${px(r.m1280_a)}. ${r.findings_before} findings → ${r.findings_after}.`);
	}).style({ fontSize: "0.85em" });
});

export default new Page({
	meta: import.meta,
	title: "Audit",
	description: "Every page shot before and after, at 3440.",
	icon: "compare",
	width: "full",

	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/levels-3440.jpg").attr("alt", nav.label));
	},

	content(){
		md(`**Four auditors, ${DATA.totals.pages} pages, five widths (400 · 1280 · 1920 · 2560 · 3440), shot twice** — once before the [decision](../decision.md), once after. Every number below is measured headless at \`deviceScaleFactor: 1\`; the raw tables are in each auditor's task dir ([A](/framework/ai/2026-09-05/spacing-audit-a/) · [B](/framework/ai/2026-09-05/spacing-audit-b/) · [C](/framework/ai/2026-09-05/spacing-audit-c/) · [D](/framework/ai/2026-09-05/spacing-audit-d/)), and the ranked list they were read from is [here](/framework/ai/2026-09-05/spacing-audit/ranked.md).`);

		h2("The three levels");
		// ⚠ `figure.c(…)` first: `style()` lives on the View, not on the bare factory —
		// `figure.style({…})` is "not a function" and kills the whole page silently.
		figure.c("flex v").style({ margin: "0 0 1.5em", gap: "0.4em" }).append(() => {
			a().href(here + "shots/levels-3440.jpg").append(() =>
				img().attr("src", here + "shots/levels-3440.jpg").attr("alt", "tight, regular and airy at 3440")
					.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" }));
			figcaption("The same block three times at 3440 — `spacing-tight` 0.6 · regular 1 · `spacing-airy` 1.6. The ramp is 1 : 1.67 : 2.67.")
				.style({ fontSize: "0.85em", marginTop: "0.4em" });
		});

		h2("The numbers");
		md(`| | before | after |\n|---|---|---|\n` +
			`| median sibling gap @ 1280 | ${px(DATA.totals.median_1280_before)} | ${px(DATA.totals.median_1280_after)} |\n` +
			`| median sibling gap @ 3440 | ${px(DATA.totals.median_3440_before)} | ${px(DATA.totals.median_3440_after)} |\n` +
			`| median growth 1280 → 3440 | ${x(DATA.totals.median_growth_before)} | ${x(DATA.totals.median_growth_after)} |\n` +
			`| findings, all kinds | ${DATA.totals.findings_before} | ${DATA.totals.findings_after} |`).ac("wide");
		p.c("muted", "The viewport itself grows 2.69× between those two widths.");

		md(`| | pages | median gap @ 3440 | growth 1280 → 3440 |\n|---|---|---|---|\n` +
			`| pages whose spacing moved | ${DATA.totals.pages_that_moved} | ${px(DATA.totals.moved_median_3440_before)} → **${px(DATA.totals.moved_median_3440_after)}** | ${x(DATA.totals.moved_growth_before)} → **${x(DATA.totals.moved_growth_after)}** |\n` +
			`| pages whose spacing did not | ${DATA.totals.pages_that_did_not} | unchanged | unchanged |`).ac("wide");

		const kinds = [...new Set([...Object.keys(DATA.totals.kind_before), ...Object.keys(DATA.totals.kind_after)])].sort();
		md(`| kind | before | after |\n|---|---|---|\n` +
			kinds.map(k => `| \`${k}\` | ${DATA.totals.kind_before[k] || 0} | ${DATA.totals.kind_after[k] || 0} |`).join("\n")).ac("wide");
		p.c("muted", "Read `padding-inversion` and `x0` with a caveat: `/imagine/paging/` was rebuilt by a different task between the two rounds, which renamed that subtree's classes and left the auditors' page-gutter probe reading 0 there. 197 of the 269 `padding-inversion` hits and 7 of the 26 `x0` hits sit on those pages. Every other kind is a clean comparison.");
		p.c("muted", "The site-wide median is the same number in both rounds, because on 65 of the 91 pages the median gap is a constant written inside a component (a card's `0.6em`, a rail row's `0.45em`) and reads no token at all. The 26 pages whose gaps do read the tokens are the row above. That is what the next section fixes.");

		h2("After the components");
		md(`The tokens grew but the site did not, because most gaps were constants written inside components. **${DATA.components.rules_changed} of them now read the ramps** (\`gap: 0.6em\` became \`calc(var(--gap-ramp) * 0.6)\` — the same 0.6em at 1280, three times that at 3440) and the site-wide median gap at 3440 went **${px(DATA.components.median_3440_before)} → ${px(DATA.components.median_3440_after)}**.`);
		md(`| | tokens only | components too |\n|---|---|---|\n` +
			`| median sibling gap @ 1280 | ${px(DATA.components.median_1280_before)} | ${px(DATA.components.median_1280_after)} |\n` +
			`| median sibling gap @ 3440 | ${px(DATA.components.median_3440_before)} | ${px(DATA.components.median_3440_after)} |\n` +
			`| median growth 1280 → 3440 | ${x(DATA.components.growth_before)} | ${x(DATA.components.growth_after)} |\n` +
			`| spacing rules found | ${DATA.components.rules_found} | ${DATA.components.rules_changed} changed · ${DATA.components.rules_kept} kept |`).ac("wide");
		p.c("muted", `${DATA.components.pages} pages, both widths: ${DATA.components.invariants}. A kept constant has a reason — ` +
			Object.entries(DATA.components.kept_why).map(([w, n]) => `${n} ${w}`).join(" · ") + ".");
		p.c("muted", "2.78× is more than the 1.8× the round before it reached, and that is the ramp itself: `--gap-ramp` is 15px at 1280 and 46px at 3440, so a gap that fully reads it grows 3.07×. It is not blown out — the prose pages that already read tokens sit at 51–54px at 3440, and these component pages sit at 25px, still half the prose rhythm.");

		md(`| realm | pages | median gap @ 3440 | growth 1280 → 3440 |\n|---|---|---|---|\n` +
			DATA.components.realms.map(r => `| \`${r.realm}\` | ${r.pages} | ${px(r.m3440_b)} → ${px(r.m3440_a)} | ${x(r.growth_b)} → ${x(r.growth_a)} |`).join("\n")).ac("wide");
		p.c("muted", "`/imagine/paging/` was being rebuilt by another task and is not this round's; `/notes/` and `/framework/` are prose, which already read the tokens and did not need a component.");

		div.c("grid auto").style({ "--column": "55em", "--gap": "1.6em" }).append(() => DATA.components.movers.forEach(movePair));

		h2("Control padding");
		p.c("muted", "The widest instance the auditors flagged for each named control, at any width. “none flagged” means no instance of it crossed 3× its own content in the second pass.");
		const c = z => z ? `${z.width}px wide · ${z.ink}px ink · ${z.padding ?? 0}px pad · @${z.at}` : "none flagged";
		md(`| control | before | after |\n|---|---|---|\n` +
			DATA.controls.map(r => `| \`${r.selector}\` | ${c(r.before)} | ${c(r.after)} |`).join("\n")).ac("wide");

		h2("Still flagged in the second pass");
		p.c("muted", "The widest remaining control per selector, any width — what a third pass would start from.");
		md(`| control | width / content | ratio | where |\n|---|---|---|---|\n` +
			DATA.remaining.map(r => `| \`${r.selector}\` | ${r.width}px / ${r.ink}px | ${r.ratio}× | [${r.url}](${r.url}) @${r.at} |`).join("\n")).ac("wide");

		h2(`The ${DATA.pairs.length} worst pages, before and after at 3440`);
		p.c("muted", "Ranked by the summed severity of everything the four auditors found on them in the first pass. Click a shot for full size.");
		div.c("grid auto").style({ "--column": "55em", "--gap": "1.6em" }).append(() => DATA.pairs.forEach(pair));

		h2("Every page");
		p.c("muted", "Biggest mover first.");
		md(`| page | @1280 before → after | @3440 before → after | growth before → after |\n|---|---|---|---|\n` +
			DATA.pages.map(r => `| [${r.url}](${r.url}) | ${px(r.m1280_b)} → ${px(r.m1280_a)} | ${px(r.m3440_b)} → ${px(r.m3440_a)} | ${x(r.growth_b)} → ${x(r.growth_a)} |`).join("\n")).ac("wide");
	},
});
