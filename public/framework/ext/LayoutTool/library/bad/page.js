import { Page, div, p, h2, a, span, button, md, ui } from "/app.js";
import { traps } from "./traps.js";
import { entry, run_all, finding } from "../entry.js";

const WIDTHS = [400, 1280, 1920, 3440];
const url_of = title => `/framework/ext/LayoutTool/library/bad/${Page.slug(title)}/`;

export default new Page({
	meta: import.meta,
	title: "Bad layouts",
	description: "Ten fragile patterns, live-measured, each linking the library entry that replaces it.",
	icon: "report",
	group: "The don'ts",
	card: "two",

	children: traps.map(entry),

	content(){
		md("**Every one of these is a layout someone would plausibly write.** Not a minimal rule-tripper — a "
			+ "card wall, a nav beside an article, a table — broken in the one way that shape usually breaks, so "
			+ "the tool can put a number on how badly and at which width.\n\n"
			+ "Each entry names the rule it trips, the width where it stops working, and the library entry that "
			+ "replaces it. **A don't with no alternative is a complaint, not doctrine.**");

		this.previews();

		h2("Every don't at one width");

		this.$run = div.c("lt-run flex gap v-center wrap");
		this.$out = div.c("lt-out");

		this.$run.append(() => {
			span("Measure every don't at").ac("muted");
			WIDTHS.forEach(w => button(`${w}px`).on("click", () => this.run(w)));
		});

		this.$out.append(() => p("Pick a width. Half of these score fine at 1920 and fail at 400 or 3440 — "
			+ "which is the whole reason the column exists.").ac("muted"));

		md("**Fires** says whether the rule the entry was built to trip actually did, at that width. A quiet "
			+ "row is not a clean layout: `dead-space` is not a finding below 1500px, and a rail that ladders on "
			+ "a phone is silent on a monitor. Where an entry is quiet at *every* width, the tool has a blind "
			+ "spot and the entry says so — [Scroller in a wrapping row](/framework/ext/LayoutTool/library/bad/scroller-in-a-wrapping-row/) "
			+ "is the standing example.\n\n"
			+ "The counterpart wall: [Layout library](/framework/ext/LayoutTool/library/). The analyzer's own "
			+ "ground truth, which is a different question: [Test corpus](/framework/ext/LayoutTool/tests/).");
	},

	/* ⚠ Nothing built after the await — the whole render goes inside `empty(fn)`. */
	async run(width){
		this.$out.empty(() => p(`Measuring ${traps.length} don'ts at ${width}px…`).ac("muted"));

		const rows = await run_all(traps, width, url_of);

		this.$out.empty(() => this.results(rows, width));
	},

	results(rows, width){
		const firing = rows.filter(r => r.report && fires(r)).length;

		h2(`${firing} / ${rows.length} caught at ${width}px`);

		ui.table(["Don't", "Trips", "Fires", "Grade", "Score", "Leading finding"],
			rows.map(row => [
				() => a(row.spec.title).attr("href", url_of(row.spec.title)),
				row.spec.rule,
				row.report ? (fires(row) ? "✓" : "quiet") : "—",
				row.report ? row.report.grade : "—",
				row.report ? String(row.report.score) : "—",
				row.error ?? finding(row.report),
			]));
	},
});

// Did the rule this entry exists to demonstrate actually fire? `rule` reads as
// prose — "escape · dead-space" — so the check is per named id, any of them.
function fires({ spec, report }){
	const named = spec.rule.split("·").map(s => s.trim());
	return report.issues.some(i => named.includes(i.rule));
}
