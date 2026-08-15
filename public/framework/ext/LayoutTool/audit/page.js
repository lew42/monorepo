import { Page, div, p, h2, h3, a, span, button, md, ui } from "/app.js";
import { frame } from "../LayoutTool.js";
import twin from "./twin.js";
import report from "../report.js";
import vision from "../vision.js";
import PAGES from "./pages.js";

const WIDTHS = [400, 1280, 1920, 3440];

export default new Page({
	meta: import.meta,
	title: "Site audit",
	description: "Every framework page, measured and ranked. Worst first, with a before/after for each fix.",
	icon: "fact_check",

	/* ⚠ NOT `full`. `.page.full` sets `--page-pad: 0`, and the page TITLE is
	 * rendered by Page outside anything this file builds — so padding added to an
	 * inner wrapper misses it and the h1 lands flush in the corner of the region.
	 * A page that wants full width WITH a gutter declares the two tokens; it does
	 * not take `full` and try to put the padding back. */
	classes: "lt-page",

	content(){
		div.c("lt-audit flow").append(() => {
			md("Every page below loads in its own iframe at the chosen width and is analyzed there. "
				+ "Nothing is cached and **nothing is edited** — a finding is a proposal until you accept "
				+ "it, and accepting appends to a review queue, never to a stylesheet.");

			this.$run = div.c("lt-run flex gap v-center wrap");
			this.$out = div.c("lt-out");
			this.$detail = div.c("lt-detail");

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
	 * run is 116 iframe loads and about two minutes. `findings.json` is generated
	 * by the same module through Playwright; see the readme. */
	async load(width){
		try {
			const all = await fetch("/framework/ext/LayoutTool/audit/findings.json").then(r => r.json());
			const rows = all.filter(r => r.width === width && !r.error);

			if (!rows.length) throw new Error(`no saved run at ${width}px`);

			this.width = width;
			this.rows = rows.sort((a, b) => a.score - b.score);
			this.$out.empty(() => {
				p(`Saved run — ${all.find(r => r.at)?.at ?? "generated headlessly"}. Re-measure live for what is on disk now.`)
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
			try { rows.push(await frame(url, width)); }
			catch (error){ rows.push({ url, error: error.message }); }
		}

		this.rows = rows.filter(r => !r.error).sort((a, b) => a.score - b.score);
		this.$out.empty(() => this.ranked(rows.filter(r => r.error)));

		if (this.rows[0]) this.open(this.rows[0]);
	},

	/* Grouped by PROBLEM, not by page. "95 pages run prose past 95 characters" is
	 * one fix to one stylesheet; the same finding spread down a ranked list of 95
	 * rows reads as 95 problems. */
	problems(){
		const by = new Map();

		for (const row of this.rows)
			for (const i of row.issues ?? []){
				const seen = by.get(i.rule) ?? { rule: i.rule, title: i.title, high: 0, pages: new Map() };
				if (i.sev === "high") seen.high++;
				seen.pages.set(row.url, Math.max(seen.pages.get(row.url) ?? 0, i.sev === "high" ? 2 : 1));
				by.set(i.rule, seen);
			}

		const ranked = [...by.values()].sort((a, b) => b.high - a.high || b.pages.size - a.pages.size);

		h2(`${ranked.length} kinds of problem across ${this.rows.length} pages`);

		div.c("lt-problems flex v gap").append(() => ranked.forEach(pr => {
			const worst = [...pr.pages].sort((a, b) => b[1] - a[1]).slice(0, 8);

			div.c("lt-issue flex v").append(() => {
				div.c("flex gap v-center wrap").append(() => {
					span(pr.rule).ac("lt-rule");
					span(pr.title);
					span(`${pr.pages.size} pages · ${pr.high} high`).ac("muted");
				});

				div.c("flex gap wrap").append(() => worst.forEach(([url]) => {
					const row = this.rows.find(r => r.url === url);
					a(url).attr("href", url).ac("lt-eg");
					button("audit").on("click", () => this.open(row));
				}));
			});
		}));
	},

	ranked(failed){
		const below = this.rows.filter(r => r.score < 90).length;

		this.problems();

		h2(`${below} of ${this.rows.length} pages score below A at ${this.width}px`);

		ui.table(
			["Page", "Grade", "High", "Med", "Measure", "Width used", "Leading"],
			this.rows.map(r => [
				() => a(r.url).attr("href", r.url),
				() => report.badge(r),
				String(r.counts.high),
				String(r.counts.med),
				r.metrics.measure === null ? "—" : `${r.metrics.measure} ch`,
				r.metrics.width_used === null ? "—" : `${r.metrics.width_used}%`,
				() => button(r.leading[0]?.rule ?? "clean").on("click", () => this.open(r)),
			]),
		);

		failed.forEach(r => p(`${r.url} — ${r.error}`).ac("muted"));
	},

	/* ⚠ The saved baseline carries issues only for rows worth opening (score < 80)
	 * — keeping them for all 232 runs made an 854KB file the page downloads to
	 * draw a table. A clean row re-measures live instead. */
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
