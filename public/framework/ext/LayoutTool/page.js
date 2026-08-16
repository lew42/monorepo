import { Doc, div, p, h2, button, span, md, code } from "/app.js";
import { analyze } from "./LayoutTool.js";
import report from "./report.js";
import vision from "./vision.js";

export default new Doc({
	meta: import.meta,
	title: "LayoutTool",
	description: "Measures a layout and scores it. Ratios, not eyeballs — and no AI at runtime.",
	icon: "straighten",
	children: "library taste tests audit knowledge widths",

	notes: "cost addressing",
	files: "LayoutTool.css LayoutTool.js address.js audit/findings.json audit/page.js audit/pages.js audit/twin.js "
		+ "defer.js highlight.js knowledge/alignment-vs-padding.md knowledge/blind-spots.md knowledge/bounds.md "
		+ "knowledge/characters-per-line.md knowledge/false-positives.md knowledge/page.js "
		+ "knowledge/ideal-ranges.md knowledge/ratios.md knowledge/responsive.md knowledge/thresholds.md "
		+ "taste/ranges.js taste/read.js taste/taste.js taste/page.js taste/readme.md "
		+ "knowledge/widescreen.md library/bad/page.js library/bad/traps.js library/entry.js library/page.js "
		+ "library/patterns.js live.js mirror.js page.js polish.js probe.js ratios.js "
		+ "readme.md report.js rules.js score.js sweep.js tests/cases.js tests/page.js vision.js "
		+ "widths/page.js widths/readme.md widths/urls.js",

	content(){
		code.js(`import { analyze } from "/framework/ext/LayoutTool/LayoutTool.js";

analyze(document.querySelector(".page.active-page"));   // → a report`);

		md("Point it at a page or a single element. It reads the browser once — every rect, every "
			+ "computed style, every line box — and turns that into a score and a ranked list of what "
			+ "is wrong, with a proposed declaration for each.");

		md("That answers *is this broken*. **[Taste](taste/) answers *is this good*** — eleven ideal "
			+ "ranges with weights, because two clean layouts both score 100 here and nothing that has "
			+ "to **choose** between layouts can use that. It is what lets "
			+ "[the layout space](/framework/styles/layouts/space/hunt/) search instead of sample.");

		/* ⚠ The wall goes HERE, not at the foot. It used to sit below the live
		 * report and two screens of prose, which is the same as not existing —
		 * "the audit tool isn't linked to on the LayoutTool page" (Mike). Every
		 * destination this module has is one click from above the fold. */
		this.previews();

		h2("This page, measured");

		this.$live = div.c("lt-live");
		this.$live.append(() => p("Analysing…").ac("muted"));

		div.c("flex gap v-center wrap").append(() => {
			button("Re-run").on("click", () => this.look());
			span("The tool measures whatever is on screen, including itself.").ac("muted");
		});

		this.look();

		md.details(import.meta, "readme.md", "Design record — thresholds, decisions, and what's still open");
	},

	/* ⚠ Measured LATE, on purpose. `content()` is still building when it returns,
	 * and every `md()` on this page resolves a fetch after that — a frame is not
	 * enough. Measured on the next frame this reported 50 nodes and a row of
	 * em-dashes, because none of the prose existed yet. */
	look(){
		setTimeout(() => {
			const el = this.view?.el ?? document.querySelector(".app");
			const data = analyze(el);
			this.$live.empty(() => {
				report(data, { limit: 4 });
				vision(data, { selector: ".page.active-page" });
			});
		}, 600);
	},
});
