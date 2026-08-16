import { Page, div, p, h2, a, span, button, md, ui } from "/app.js";
import { measured, finding } from "../library/entry.js";
import urls from "./urls.js";

const WIDTHS = [400, 1280, 1920, 3440];

export default new Page({
	meta: import.meta,
	title: "Widths",
	description: "The width tier's bare /full/ urls, and the library arrangements they cite, read at 400/1280/1920/3440.",
	icon: "straighten",

	content(){
		md("**Ten urls, one meter.** The five [width tier](/framework/styles/layouts/400/) entries and the "
			+ "[sections](/framework/styles/sections/) band they're built from — each a bare `/full/` route, "
			+ "no stage, no `zoom` — plus the four [library](/framework/ext/LayoutTool/library/) arrangements "
			+ "the tier cites. `frame()` reads every one in a real viewport.");

		this.$run = div.c("lt-run flex gap v-center wrap");
		this.$out = div.c("lt-out");

		this.$run.append(() => {
			span("Measure every url at").ac("muted");
			WIDTHS.forEach(w => button(`${w}px`).on("click", () => this.run(w)));
		});

		this.$out.append(() => p("Ten urls, one width, sequentially — the same reason the library measures "
			+ "one at a time.").ac("muted"));

		md.details(import.meta, "readme.md", "Design record — the ten rows and the seam that makes them honest");
	},

	/* ⚠ Every factory call after the first `await` lands wherever the captor has
	 * drifted, so the render goes inside `empty(fn)`, never in the loop. */
	async run(width){
		this.$out.empty(() => p(`Measuring ${urls.length} urls at ${width}px…`).ac("muted"));

		const rows = [];

		for (const row of urls)
			rows.push({ ...row, ...await measured(row.url, width, row.root) });

		this.$out.empty(() => this.results(rows, width));
	},

	results(rows, width){
		const clean = rows.filter(r => r.report && !r.report.counts.high).length;

		h2(`${clean} / ${rows.length} with nothing high at ${width}px`);

		ui.table(["Entry", "Grade", "Score", "measure", "used", "Leading finding"],
			rows.map(({ label, url, report, error }) => [
				() => a(label).attr("href", url),
				report ? report.grade : "—",
				report ? String(report.score) : "—",
				report?.metrics.measure == null ? "—" : `${report.metrics.measure}ch`,
				report?.metrics.width_used == null ? "—" : `${report.metrics.width_used}%`,
				error ?? finding(report),
			]));
	},
});
