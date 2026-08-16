/* One library entry, as a page: the declaration, the pattern rendered at the
 * page's own width, a score that follows the window, and the same pattern
 * measured in an iframe at three real viewports.
 *
 * Both wings use this — a `bad` entry differs by what it says, not by what it
 * is, and reading the two side by side is the point.
 *
 * ⚠ The body is NOT a demo stage. `probe.IGNORE` covers `.demo-screen`, so a
 * pattern built inside one measures zero nodes, and the stage simulates a width
 * with `zoom`, which is the one thing a responsive measurement cannot survive. */

import { div, p, code, md, ui } from "/app.js";
import { frame } from "../LayoutTool.js";
import live from "../live.js";

/* ⚠ 1280 is not decoration. Half the don'ts here are clean at 400 and at 1920
 * and broken in between — an unbounded reading track fails only in the band
 * where it holds ONE column, which on this site is roughly 1100–1300px. */
const WIDTHS = [400, 1280, 1920, 3440];

export function entry(spec){
	return {
		title: spec.title,
		description: spec.short,
		group: spec.group,
		classes: "lt-page",

		preview(nav){ return this.preview_card(nav, () => div.c("zoom-25").append(spec.build)); },

		/* ⚠ The page is `lt-page` — full width, no measure — because the SPECIMEN
		 * needs the window. Prose does not, so every sentence here sits in its own
		 * 34em track; left unbounded it ran 190 characters a line at 3440 and made
		 * these pages the worst-measuring ones on the site. */
		content(){
			code.css(spec.decl);

			const $body = div.c("lt-case-body").append(spec.build);

			prose(spec.caption);

			live($body, { label: spec.title });

			this.$widths = div.c("flex v gap");
			this.widths();

			if (spec.see) prose(spec.see);
		},

		/* ⚠ `frame()` loads THIS page in an iframe, and the page inside would run
		 * this method too — three frames per frame, forever. The top window is the
		 * only one that measures. */
		async widths(){
			if (window.top !== window) return;

			this.$widths.empty(() => p(`Measuring at ${WIDTHS.join(", ")}px…`).ac("muted"));

			const rows = [];

			for (const width of WIDTHS)
				rows.push({ width, ...await measured(this.url, width) });

			this.$widths.empty(() => widths_table(rows));
		},
	};
}

const prose = text => div.c("measure start flow").append(() => md(text));

/* The same body, in a real viewport of its own. `root` is the pattern and not
 * the page: the title, the prose and the live rail are furniture, and only the
 * body's width is the pattern's own. */
export async function measured(url, width, root = ".lt-case-body"){
	try { return { report: await frame(url, width, { root }) }; }
	catch (error){ return { error: error.message }; }
}

export function widths_table(rows){
	return ui.table(["Width", "Grade", "Score", "measure", "used", "Leading finding"],
		rows.map(({ width, report, error }) => [
			`${width}px`,
			report ? report.grade : "—",
			report ? String(report.score) : "—",
			report?.metrics.measure == null ? "—" : `${report.metrics.measure}ch`,
			report?.metrics.width_used == null ? "—" : `${report.metrics.width_used}%`,
			error ?? finding(report),
		]));
}

export function finding(report){
	const top = report.leading[0];
	return top ? `${top.sev} · ${top.rule} — ${top.detail}` : "clean";
}

/* Every entry of a wing, at one width. Sequential on purpose: a dozen iframes
 * laying out at 3440 at once is a dozen layouts competing for one main thread,
 * and the numbers drift. */
export async function run_all(list, width, url_of){
	const rows = [];

	for (const spec of list)
		rows.push({ spec, ...await measured(url_of(spec.title), width) });

	return rows;
}

export default entry;
