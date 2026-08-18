import { Page, div, p, h2, ul, li, a, span, button, ui } from "/app.js";
import { RANGES } from "../../taste/ranges.js";
import report from "../../report.js";

const WIDTHS = [1280, 3440];

/* The same audit, on the other axis. `audit/page.js` ranks the site by what
 * `analyze()` finds BROKEN; this ranks it by what `taste/rate()` finds GOOD —
 * eleven weighted ideal ranges that can tell two clean pages apart where a
 * findings score cannot. Baseline: `../taste.json`, generated headlessly. */
export default new Page({
	meta: import.meta,
	title: "Taste",
	description: "The site ranked by rate() — what is GOOD, not what is broken. Same audit, the other axis.",
	icon: "auto_awesome",
	classes: "dt-page",

	content(){
		this.width = 1280;
		this.by = "score";

		div.c("dt-audit flow").append(() => {
			this.$headline = div.c("dt-headline flow");

			this.$run = div.c("dt-run flex gap v-center wrap");
			this.$run.append(() => {
				span("Width:").ac("muted");
				WIDTHS.forEach(w => button(`${w}px`).on("click", () => this.show(w)));
				span("· Sort by:").ac("muted");
				button("score").on("click", () => this.resort("score"));
				RANGES.forEach(r => button(r.id).attr("title", r.what).on("click", () => this.resort(r.id)));
			});

			// ⚠ `frame-gap` reads an identical value across several `styles/elements/*`
			// rows (their own swatches sit behind `.page-preview-thumb`, which
			// `probe.IGNORE` excludes by policy, so the band falls back to whatever
			// framed chrome IS visible — the shared sidebar). A repeated value on that
			// band is a tell that a row's own content wasn't read, not a real finding.
			p("`frame-gap` reading the same value on several `styles/elements/*` pages is a known tell, "
				+ "not a coincidence — their demo swatches sit behind `.page-preview-thumb`, which "
				+ "`probe.IGNORE` skips by policy, so that one band falls back to shared sidebar chrome. "
				+ "Distrust a repeated frame-gap value before trusting it.").ac("muted");

			this.$out = div.c("dt-out");
			this.$out.append(() => p("Loading the saved run…").ac("muted"));
		});

		this.load();
	},

	async load(){
		try {
			const data = await fetch("/framework/ext/DesignTool/audit/taste.json").then(r => r.json());
			this.generated_at = data.generated_at;
			this.rows = data.rows;
			this.draw();
		} catch (error){
			this.$out.empty(() => p(`No saved run (${error.message}).`).ac("muted"));
		}
	},

	show(width){ this.width = width; this.draw(); },
	resort(by){ this.by = by; this.draw(); },

	// ⚠ Not `render` — Page.class.js already owns that name for the router's own
	// mount step, and a same-named config method silently overrides it.
	draw(){
		if (!this.rows) return;

		const at_width = this.rows.filter(r => r.width === this.width);
		const rows = at_width.filter(r => !r.error);
		const failed = at_width.filter(r => r.error);

		// ⚠ Mostly-picture and unrated rows are pinned LAST, never sorted as if they
		// scored zero. A mostly-picture page's whole subject is a demo stage
		// `probe.IGNORE` skips by policy, so this tier only rated the caption around
		// it. An unrated page (`score: null`) is one the tier has NOTHING to say
		// about — not measured-and-terrible, just unmeasured. Neither is "the worst
		// layout on the site"; both are the tier's blind spot.
		const out_of_ranking = r => r.mostly_picture || r.score == null;
		const pictures = rows.filter(r => r.mostly_picture).length;
		const unrated = rows.filter(r => r.score == null).length;
		const ranked_count = rows.filter(r => !out_of_ranking(r)).length;
		const ranked = [...rows].sort((a, b) => {
			const oa = out_of_ranking(a), ob = out_of_ranking(b);
			if (oa !== ob) return oa - ob;
			if (oa) return 0;   // both out of ranking — no ordering claim between them
			return this.by === "score" ? a.score - b.score : credit(a, this.by) - credit(b, this.by);
		});

		this.$headline.empty(() => this.headline(rows));
		this.$out.empty(() => {
			h2(`${ranked.length} pages at ${this.width}px, sorted by ${this.by === "score" ? "taste score" : this.by} — worst first`);
			// The honest headline: how much of the corpus this ranking actually covers.
			p(`${pictures} of these are mostly a picture (a demo stage probe.IGNORE skips by policy — `
				+ `only the caption around it gets rated) and ${unrated} are unrated (nothing this tier could `
				+ `measure at all) — ${ranked_count} of ${ranked.length} pages actually ranked.`).ac("muted");
			this.table(ranked);
			failed.forEach(r => p(`${r.url} — ${r.error}`).ac("muted"));
			p(`Baseline generated ${this.generated_at?.slice(0, 10) ?? "—"} — see taste.json for how to regenerate.`).ac("muted");
		});
	},

	/* The headline finding: not "here is a table" but "here is where the two tiers
	 * disagree" — a page can be well-shaped and still broken, or fire nothing at all
	 * and still have nothing to admire, and only reading both axes says which.
	 *
	 * ⚠ It used to rank by |taste score − analyze score| on the theory that the two
	 *   numbers shared a ladder. They never did: `analyze()`'s score was
	 *   anti-correlated with appearance and has been removed (score.js). The
	 *   comparison that survives is against the finding CENSUS, which makes no claim
	 *   to be a quality number — so this shows the extremes of each side rather than
	 *   a difference between them. Mostly-picture rows stay out: the disagreement
	 *   there is the blind spot, not the page. */
	headline(rows){
		const real = rows.filter(r => r.score != null && !r.mostly_picture && r.counts);
		const broken = [...real].filter(r => r.counts.high).sort((a, b) => b.score - a.score).slice(0, 3);
		const dull = [...real].filter(r => !r.counts.total).sort((a, b) => a.score - b.score).slice(0, 3);

		h2("Where the two tiers disagree");

		if (!real.length) return void p("No comparable rows yet.").ac("muted");

		ul.c("dt-instances").append(() => {
			broken.forEach(r => li(() => {
				a(r.url).attr("href", r.url);
				span(` — taste ${r.grade} ${r.score} · ${r.counts.high} high — `);
				span("well-shaped but broken: the proportions are right and a rule still fires").ac("muted");
			}));

			dull.forEach(r => li(() => {
				a(r.url).attr("href", r.url);
				span(` — taste ${r.grade} ${r.score} · nothing fires — `);
				span("clean but dull: no rule can fault it and there is still nothing to admire").ac("muted");
			}));
		});
	},

	table(rows){
		ui.table(
			["Page", "Taste", "Findings", "Covered", "Weakest bands"],
			rows.map(r => {
				const found = () => (r.counts ? report.census(r) : span("—").ac("muted"));

				if (r.mostly_picture) return [
					() => a(r.url).attr("href", r.url),
					() => span(r.score == null ? "picture" : `picture — ${r.grade} ${r.score}`).ac("muted"),
					found,
					`${r.covered}%`,
					() => span(`${Math.round(r.ignored * 100)}% of the root is a skipped demo stage`).ac("muted"),
				];
				if (r.score == null) return [
					() => a(r.url).attr("href", r.url),
					() => span("unrated").ac("muted"),
					found,
					`${r.covered}%`,
					() => span("nothing on this page was measurable").ac("muted"),
				];
				return [
					() => a(r.url).attr("href", r.url),
					() => report.badge({ grade: r.grade, score: r.score }),
					found,
					`${r.covered}%`,
					() => span(weakest(r).map(b => `${b.id} ${Math.round(b.credit * 100)}%`).join(" · ")).ac("muted"),
				];
			}),
		);
	},
});

function credit(row, id){
	const i = RANGES.findIndex(r => r.id === id);
	const c = row.bands[i]?.[1];
	return c == null ? 1 : c;   // an unmeasured band sorts last, not first
}

function weakest(row, n = 3){
	return row.bands
		.map(([value, credit], i) => ({ id: RANGES[i].id, weight: RANGES[i].weight, value, credit }))
		.filter(b => b.credit != null)
		.sort((a, b) => a.credit - b.credit || b.weight - a.weight)
		.slice(0, n);
}
