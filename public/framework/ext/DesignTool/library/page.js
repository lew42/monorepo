import { Page, div, p, h2, a, span, button, md, ui } from "/app.js";
import { patterns } from "./patterns.js";
import { entry, run_all, finding } from "./entry.js";
import { census } from "../score.js";

const WIDTHS = [400, 1280, 1920, 3440];
const url_of = title => `/framework/ext/DesignTool/library/${Page.slug(title)}/`;

export default new Page({
	meta: import.meta,
	title: "Layout library",
	description: "Every arrangement this site is built from, live and measured — and the don'ts beside them.",
	icon: "grid_view",

	// The catalog, then the wing that says what not to write. `bad/` is a
	// directory; every pattern is an inline page built by entry().
	children: [...patterns.map(entry), "bad"],

	content(){
		md("**Eleven arrangements and ten ways to get them wrong.** Each card opens a page holding the "
			+ "declaration, the pattern rendered live at the width you are reading at, a census that follows "
			+ "the window, and the same pattern measured in its own viewport at 400, 1920 and 3440.\n\n"
			+ "Nothing here is asserted. Every verdict on every entry is `analyze()` run at render time, so a "
			+ "claim that stops being true stops being made.");

		this.previews();

		h2("The whole library at one width");

		this.$run = div.c("dt-run flex gap v-center wrap");
		this.$out = div.c("dt-out");

		this.$run.append(() => {
			span("Measure every entry at").ac("muted");
			WIDTHS.forEach(w => button(`${w}px`).on("click", () => this.run(w)));
		});

		this.$out.append(() => p("Each entry loads in its own iframe at that width and is analyzed there — "
			+ "same module, same rules, its own viewport. Eleven loads, about six seconds.").ac("muted"));

		md("**A finding here is not automatically a fault.** A reading column at 3440 trips `dead-space` "
			+ "because one column *does* leave five sixths of a mega monitor as background — the entry says so, "
			+ "and names the arrangement that spends it. Read the number, then read what the page says about it.\n\n"
			+ "Where the rules came from: [thresholds](/framework/ext/DesignTool/knowledge/thresholds/) · "
			+ "what never to flag: [false positives](/framework/ext/DesignTool/knowledge/false-positives/) · "
			+ "does it hold at every width: [responsiveness](/framework/ext/DesignTool/knowledge/responsiveness/).\n\n"
			+ "This catalog answers *what to write*. [Test corpus](/framework/ext/DesignTool/tests/) answers a "
			+ "different question — whether the analyzer itself is right — and is the only place a layout is "
			+ "broken for the tool's benefit rather than the reader's.");
	},

	/* ⚠ Every factory call after the first `await` lands wherever the captor has
	 * drifted to, so the whole render goes inside `empty(fn)`, never in the loop. */
	async run(width){
		this.$out.empty(() => p(`Measuring ${patterns.length} entries at ${width}px…`).ac("muted"));

		const rows = await run_all(patterns, width, url_of);

		this.$out.empty(() => this.results(rows, width));
	},

	results(rows, width){
		const clean = rows.filter(r => r.report && !r.report.counts.high).length;

		h2(`${clean} / ${rows.length} with nothing high at ${width}px`);

		ui.table(["Entry", "Findings", "measure", "used", "Leading finding"],
			rows.map(({ spec, report, error }) => [
				() => a(spec.title).attr("href", url_of(spec.title)),
				report ? census(report.counts) : "—",
				report?.metrics.measure == null ? "—" : `${report.metrics.measure}ch`,
				report?.metrics.width_used == null ? "—" : `${report.metrics.width_used}%`,
				error ?? finding(report),
			]));
	},
});
