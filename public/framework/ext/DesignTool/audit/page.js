import { Page, div, p, h2, h3, a, span, button, md, ui } from "/app.js";
import { frame } from "../DesignTool.js";
import { worst_first } from "../score.js";
import twin from "./twin.js";
import report from "../report.js";
import vision from "../vision.js";
import PAGES from "./pages.js";

const WIDTHS = [400, 1280, 1920, 3440];

/* A saved baseline row and a freshly-measured one must expose the same
 * rank-support fields — `rules` for problems(), `leading_rule` for the
 * table's Leading column — so both read the same way regardless of source.
 * Only a fresh measurement also carries full `issues`; see open(). */
const rank_shape = full => ({
	...full,
	leading_rule: full.leading[0]?.rule ?? null,
	rules: full.issues.map(i => ({ rule: i.rule, title: i.title, sev: i.sev })),
});

export default new Page({
	meta: import.meta,
	title: "Site audit",
	description: "Every framework page, measured and ranked. Worst first, with a before/after for each fix.",
	icon: "fact_check",
	children: "taste",

	/* ⚠ NOT `full`. `.page.full` sets `--page-pad: 0`, and the page TITLE is
	 * rendered by Page outside anything this file builds — so padding added to an
	 * inner wrapper misses it and the h1 lands flush in the corner of the region.
	 * A page that wants full width WITH a gutter declares the two tokens; it does
	 * not take `full` and try to put the padding back. */
	classes: "dt-page",

	content(){
		div.c("dt-audit flow").append(() => {
			md("Every page below loads in its own iframe at the chosen width and is analyzed there. "
				+ "Nothing is cached and **nothing is edited** — a finding is a proposal until you accept "
				+ "it, and accepting appends to a review queue, never to a stylesheet.");

			md("The table ranks; it does not explain. The written audit does — the whole site crawled at "
				+ "400/1920/3440, the worst twenty checked against their screenshots, and a proposed "
				+ "declaration per family: [layout-hunt](/framework/ai/2026-08-15/layout-hunt/).");

			md.details(import.meta, "/framework/ai/2026-08-15/layout-hunt/audit.md",
				"The 2026-08-15 site audit — ranked worst-first, screenshot-verified");

			md("This table is a **worklist**, not a ranking of quality: it counts findings, severest first, and "
				+ "it makes no claim that a page with fewer of them looks better. It once carried a score out of "
				+ "100 and that number came out *anti*-correlated with how pages look — it counted findings, and "
				+ "findings scale with content, so it rewarded emptiness ([the evidence](/framework/ai/2026-08-17/vision-baseline/)). "
				+ "Every rule survived; the average did not. [**Taste →**](taste/) is the tier that ranks what is **good**.");

			this.$run = div.c("dt-run flex gap v-center wrap");
			this.$out = div.c("dt-out");
			this.$detail = div.c("dt-detail");

			this.$run.append(() => {
				span("Saved run:").ac("muted");
				[1280, 3440].forEach(w => button(`${w}px`).on("click", () => this.load(w)));
				span("· Re-measure live:").ac("muted");
				WIDTHS.forEach(w => button(`${w}px`).on("click", () => this.run(w)));
			});

			this.$out.append(() => p("Loading the last saved run…").ac("muted"));
		});

		this.load(1280);
	},

	/* The committed baseline, so the page is useful the moment it opens — a live
	 * run is 168 iframe loads, about a minute. `findings.json` is generated
	 * by the same module through Playwright; see the readme. */
	async load(width){
		try {
			const baseline = await fetch("/framework/ext/DesignTool/audit/findings.json").then(r => r.json());
			const rows = baseline.rows.filter(r => r.width === width && !r.error);

			if (!rows.length) throw new Error(`no saved run at ${width}px`);

			this.width = width;
			this.rows = rows.sort(worst_first);
			this.$out.empty(() => {
				p(`Saved run — ${baseline.generated_at ?? "generated headlessly"}. Re-measure live for what is on disk now.`)
					.ac("muted");
				this.ranked([]);
			});
			if (this.rows[0]) this.open(this.rows[0]);
		} catch (error){
			this.$out.empty(() => p(`No saved run (${error.message}). Re-measure live.`).ac("muted"));
		}
	},

	// ⚠ Everything after the first `await` renders inside `empty(fn)`, which
	// re-establishes the captor. A factory call in the loop would land in $app.
	async run(width){
		this.width = width;
		this.$detail.empty();

		const rows = [];

		for (const url of PAGES){
			this.$out.empty(() => p(`${rows.length} / ${PAGES.length} at ${width}px…`).ac("muted"));
			try { rows.push(rank_shape(await frame(url, width))); }
			catch (error){ rows.push({ url, error: error.message }); }
		}

		this.rows = rows.filter(r => !r.error).sort(worst_first);
		this.$out.empty(() => this.ranked(rows.filter(r => r.error)));

		if (this.rows[0]) this.open(this.rows[0]);
	},

	/* Grouped by PROBLEM, not by page. "95 pages run prose past 95 characters" is
	 * one fix to one stylesheet; the same finding spread down a ranked list of 95
	 * rows reads as 95 problems. */
	problems(){
		const by = new Map();

		for (const row of this.rows)
			for (const i of row.rules ?? []){
				const seen = by.get(i.rule) ?? { rule: i.rule, title: i.title, high: 0, pages: new Map() };
				if (i.sev === "high") seen.high++;
				seen.pages.set(row.url, Math.max(seen.pages.get(row.url) ?? 0, i.sev === "high" ? 2 : 1));
				by.set(i.rule, seen);
			}

		const ranked = [...by.values()].sort((a, b) => b.high - a.high || b.pages.size - a.pages.size);

		h2(`${ranked.length} kinds of problem across ${this.rows.length} pages`);

		div.c("dt-problems flex v gap").append(() => ranked.forEach(pr => {
			const worst = [...pr.pages].sort((a, b) => b[1] - a[1]).slice(0, 8);

			div.c("dt-issue flex v").append(() => {
				div.c("flex gap v-center wrap").append(() => {
					span(pr.rule).ac("dt-rule");
					span(pr.title);
					span(`${pr.pages.size} pages · ${pr.high} high`).ac("muted");
				});

				div.c("flex gap wrap").append(() => worst.forEach(([url]) => {
					const row = this.rows.find(r => r.url === url);
					a(url).attr("href", url).ac("dt-eg");
					button("audit").on("click", () => this.open(row));
				}));
			});
		}));
	},

	ranked(failed){
		const dirty = this.rows.filter(r => r.counts.high).length;

		this.problems();

		h2(`${dirty} of ${this.rows.length} pages fire something HIGH at ${this.width}px`);

		ui.table(
			["Page", "Findings", "High", "Med", "Measure", "Width used", "Leading"],
			this.rows.map(r => [
				() => a(r.url).attr("href", r.url),
				() => report.census(r),
				String(r.counts.high),
				String(r.counts.med),
				r.metrics.measure === null ? "—" : `${r.metrics.measure} ch`,
				r.metrics.width_used === null ? "—" : `${r.metrics.width_used}%`,
				() => button(r.leading_rule ?? "clean").on("click", () => this.open(r)),
			]),
		);

		failed.forEach(r => p(`${r.url} — ${r.error}`).ac("muted"));
	},

	/* ⚠ The saved baseline never carries full issue detail (selector, path, fix)
	 * for ANY row — only a compact {rule,title,sev} summary (`rules`, for
	 * problems() below) that can't be capped because nothing in it is heavy.
	 * A row's real findings are always fetched live on open, same as a clean
	 * row has always done — findings.json's own `format` field states this. */
	async open(row){
		const full = row.issues?.length ? row : await frame(row.url, this.width).catch(() => row);

		this.$detail.empty(() => {
			h3(full.url);
			twin(full, this.width);
			vision(full, { selector: ".pages", width: this.width });
			report(full);
		});
	},
});
