import { Page, div, p, h2, a, span, button, md, ui } from "/app.js";
import { frame } from "../LayoutTool.js";
import live from "../live.js";
import cases from "./cases.js";

const WIDTHS = [400, 1280, 1920, 3440];
const url_of = c => `/framework/ext/LayoutTool/tests/${Page.slug(c.title)}/`;

export default new Page({
	meta: import.meta,
	title: "Test corpus",
	description: "Sixteen layouts with a declared verdict — twelve broken on purpose, four that should score clean.",

	/* Each case renders beside a live score that recomputes as you drag the
	 * window — the only way to see WHERE a layout stops working, rather than
	 * whether it works at the four widths someone thought to check.
	 *
	 * ⚠ The rail is `data-layout-ignore`, so the case is measured without it.
	 * It still NARROWS the case, which is honest — the body is as wide as it
	 * really is — but it means a case's verdict here and in the headless suite
	 * are taken at different content widths. */
	children: cases.map(c => [c.title, {
		classes: c.classes,
		description: c.why,

		content(){
			div.c("lt-case grid gap").append(() => {
				const $body = div.c("lt-case-body").append(() => c.build());
				div.c("lt-case-rail").append(() => live($body, { label: c.title }));
			});
		},
	}]),

	content(){
		md("Ground truth. Each case declares **what it is** — a `bad` case names the one rule it exists "
			+ "to trip, a `good` case claims to trip nothing — so the suite scores the analyzer rather "
			+ "than the analyzer scoring itself.");

		this.$run = div.c("lt-run flex gap v-center wrap");
		this.$out = div.c("lt-out");

		this.$run.append(() => {
			span("Run the suite at").ac("muted");
			WIDTHS.forEach(w => button(`${w}px`).on("click", () => this.run(w)));
		});

		this.$out.append(() => p("Pick a width. Each case loads in its own iframe at that size and is "
			+ "analyzed there — same module, same rules, its own viewport.").ac("muted"));

		this.previews();
	},

	/* ⚠ Every factory call after the first `await` lands wherever the captor has
	 * drifted to, so the whole render goes inside `empty(fn)` — which re-establishes
	 * it — and never straight into the loop. */
	async run(width){
		this.$out.empty(() => p(`Running ${cases.length} cases at ${width}px…`).ac("muted"));

		const rows = [];

		/* ⚠ The case BODY, not the page and not `.app`. The shell is on every
		 * case equally — its 21px theme toggle scored a `hit-size` against all
		 * sixteen — and the page adds a title and a live rail that are furniture,
		 * not the specimen. Measuring the body is the only root whose width is
		 * the case's own. */
		for (const c of cases){
			try {
				rows.push({ c, report: await frame(url_of(c), width, { root: ".lt-case-body" }) });
			} catch (error){
				rows.push({ c, error: error.message });
			}
		}

		this.$out.empty(() => this.results(rows, width));
	},

	results(rows, width){
		const scored = rows.map(r => ({ ...r, ...verdict(r, width) }));
		const hits = scored.filter(r => r.pass).length;

		h2(`${hits} / ${scored.length} at ${width}px`);

		ui.table(
			["Case", "Expected", "Score", "Detected", ""],
			scored.map(r => [
				() => a(r.c.title).attr("href", url_of(r.c)),
				r.n_a ? `n/a below ${r.c.from}px` : r.c.verdict === "bad" ? `bad — ${r.c.rule}` : "clean",
				r.error ? "—" : `${r.report.grade} ${r.report.score}`,
				r.error ? r.error : top_rules(r.report),
				r.pass ? "✓" : "✗",
			]),
		);
	},
});

/* A `bad` case passes when its named rule fired; a `good` case passes when
 * nothing high-severity did. A `bad` case declaring `from:` is only a finding at
 * that width and above — 420px of content is not dead space on a phone — so
 * below it, passing means staying QUIET. */
function verdict({ c, report, error }, width){
	if (error) return { pass: false };

	if (c.verdict === "good") return { pass: report.counts.high === 0 };
	if (c.from && width < c.from) return { pass: !report.issues.some(i => i.rule === c.rule), n_a: true };

	return { pass: report.issues.some(i => i.rule === c.rule) };
}

function top_rules(report){
	if (!report) return "—";

	const by = new Map();
	report.issues.forEach(i => by.set(i.rule, (by.get(i.rule) ?? 0) + 1));

	return [...by].sort((a, b) => b[1] - a[1]).slice(0, 4)
		.map(([rule, n]) => `${rule}×${n}`).join(", ") || "clean";
}
