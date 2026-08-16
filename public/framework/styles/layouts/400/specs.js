import { div, span } from "/app.js";
import { site } from "../web.js";

/* Five class strings, one column at 400, five ways past it. Every `layout()`
 * renders the SAME `site` — nothing here is new copy, nothing is new CSS. */
export const specs = [

	{
		title: "Column",
		note: "`page full fill flex v` and nothing more — one column, forever. At 400 that IS the job; at "
			+ "3440 it never widens, so the `site.blurb` inside `sections()` sits on one ~140-character line. "
			+ "This is `library/bad/stacked-forever`, kept live so the other four have something to answer.",
		layout(){
			return div.c("page full fill flex v", () => {
				site.topbar();

				div.c("flex-1", () => { site.hero(); div.c("pad", () => site.sections(4)); })
					.style({ minHeight: "0", overflowY: "auto" });

				site.footer();
			});
		},
	},

	{
		title: "Wrap",
		note: "`flex gap wrap` — a `basis` rail beside an article at `flex: 1 1 24em`, the article's own text "
			+ "held to a `measure start`. Under about 34em the row reads as one column; past it, two. "
			+ "`library/rail-content` — its own warning is the body needs that inner measure, or the trap is "
			+ "`bad/rail-that-never-wraps`.",
		layout(){
			return div.c("page full fill flex v", () => {
				site.topbar();

				div.c("flex gap wrap flex-1", () => {
					div.c("basis pad", () => site.menu()).style("--basis", "15em");
					div.c("pad", () => div.c("measure start flow", () => site.sections(4)))
						.style({ flex: "1 1 24em", minWidth: "0" });
				}).style({ minHeight: "0", overflowY: "auto" });

				site.footer();
			});
		},
	},

	{
		title: "Wall",
		note: "`grid gap auto` with `--column: 14em` — `site.cards()` and nothing else. One card wide at 400, "
			+ "four-plus across at 3440, no breakpoint written down. `library/tile-wall`, the fix for "
			+ "`bad/fixed-track-wall`'s named pixel tracks.",
		layout(){
			return div.c("page full fill flex v", () => {
				site.topbar();
				div.c("flex-1 pad", () => site.cards(8, "14em")).style({ minHeight: "0", overflowY: "auto" });
				site.footer();
			});
		},
	},

	{
		title: "Rows",
		note: "A full-row item stays a row at every width; its INSIDE wraps at a `20em` basis — identity, "
			+ "detail, figures, one column below it. `library/dashboard-row`, avoiding `bad/stacked-forever`'s "
			+ "one crammed line per row.",
		layout(){
			const words = site.topics.split(" ");

			return div.c("page full fill flex v", () => {
				site.topbar();

				div.c("flex v flex-1 pad", () => words.forEach((word, i) =>
					div.c("flex gap wrap", () => {
						div.c("basis h4", word).style("--basis", "12em");
						span.c("muted", site.blurb.slice(0, 52) + "…").style({ flex: "1 1 20em", minWidth: "0" });
						span(String(137 * (i + 1))).style({ flex: "0 0 auto", marginInlineStart: "auto" });
					}).style({ "--gap": "1.5em", alignItems: "baseline", padding: "0.7em 0.9em", borderBottom: "1px solid var(--line)" })))
					.style({ minHeight: "0", overflowY: "auto" });

				site.footer();
			});
		},
	},

	{
		title: "Bands",
		note: "A full-width hero, then a `pad` shell around a `measure flow` column — the band spends the "
			+ "width, the reading stays a column. `library/section-band`; drop the outer `pad` and it's "
			+ "`bad/band-with-no-gutter`.",
		layout(){
			const band = (tone, fn) => div.c("pad", () => div.c("measure flow", fn).style("--measure", "40em"))
				.ac(tone).style("--pad", "3em 2em");

			return div.c("page full fill flex v", () => {
				site.topbar();

				div.c("flex v flex-1", () => {
					site.hero().ac("wash");
					band("", () => site.sections(4));
				}).style({ minHeight: "0", overflowY: "auto" });

				site.footer();
			});
		},
	},
];

export default specs;
