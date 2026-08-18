import { Page, View, div, h1, h2, h3, md } from "/app.js";
import { shot, pair, figures, tmp } from "./shots.js";
import { NEEDS, WEAK, REST } from "./copy.js";

View.stylesheet(import.meta, "report.css");

// The frozen shots live outside the repo (RULE#12); `tmp()` routes them through
// the loopback-only /screenshot route, and says so off localhost.
const SHOTS = "C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/c6315543-dde2-46c6-b052-c819794f42e8/scratchpad/shots/";
const DT = "/framework/ai/2026-08-17/";

export default new Page({
	meta: import.meta,
	title: "Today, ranked",
	description: "Thirty tasks landed. Five need Mike. The rest, in order of what changes a decision — with the pictures.",
	icon: "flag",

	/* ⚠ Takes the screen instead of sitting in the day's catalog rail. Same shape as
	   styles/layouts/page.js: Page.render() emits the h1 outside content(), so this
	   replaces the view and draws its own title.
	   ⚠ A bare `page` now — no `full`. `full` meant `--measure: none`, and `none`
	     removes the reading CEILING without removing the width: measured 2026-08-17,
	     this page ran 2248px of prose at 3440, about 250 characters a line. The shell
	     caps `main` and every band below claims `wide`. */
	render(){
		return this.view ??= div.c("page", () => this.content())
			.ac(this.name && "page-" + this.name);
	},

	content(){
		h1(this.title);

		md("**30 tasks landed today, 19 of them started after you left at 11:00.** "
			+ "The [day dashboard](/framework/ai/2026-08-17/) has them in the order they happened, and shows what is still running. This page has them in the order they matter.");

		this.needs();
		this.rebuilt();
		this.instrument();
		this.weak();
		this.landed();
	},

	needs(){
		h2("Five things need you");
		div.c("report-needs report-wide wide", () => NEEDS.forEach(([title, body]) =>
			div.c("report-need surface pad flex v gap", () => { h3(title); md(body); })));
	},

	rebuilt(){
		h2("Two walls were rebuilt");
		md("`/framework/ui/` and `/framework/styles/layouts/` were both one flat run of cards this morning. "
			+ "Both are now a sticky filter rail beside one grid **per band** — and it is the same mechanism, factored into `ext/catalog`'s `browse()`, not two walls that drift apart.");

		div.c("report-wide wide flex v gap-2em", () => {
			pair([tmp(SHOTS + "before-3440.png"), [3440, 1000], "Before — /framework/ui/ at 3440, 19 components in one flat run"],
				[tmp(SHOTS + "ui-after-3440.png"), [3440, 1000], "After — four bands, most useful first, a rail that counts them"]);

			figures([["width used, 3440", "0.561 → 0.943"], ["rate()", "85/B → 90/A"], ["components", "19 in 4 bands"], ["variants", "31 → 32"]]);

			shot([tmp(SHOTS + "wall-3440.png"), [3440, 1900],
				"/framework/styles/layouts/ at 3440 — the whole 29-card catalog, six columns, one frame. Its own before shot was lost to a filename collision."]);

			figures([["wall width, of 3440", "1450 → 2815px"], ["cards", "23 → 29"], ["vocabulary", "12 → 6 words"], ["at 390", "155px → stacks"]]);
		});

		md("`ext/Panel` was **dropped** from the layouts page: its shrink-wrap gave the wall 1450px of a 3440 screen, and at 390 the row would not stack at all — 155px of a 390 screen. "
			+ "Plain `flex gap wrap` with a real `22em` basis fixes both. The module itself is untouched. "
			+ "Preview scrollbars are gone site-wide (`scrollbar-width: none` in `Page.css` — 12 nested scrollers on that one index).");
	},

	instrument(){
		h2("The tool now measures what it claims");
		md("Five mechanisms fixed and **not one threshold moved**, then three bands re-derived. The headline: `width-used` — the prime objective as a number — was two *spans*, "
			+ "hard-zeroing 16 of 18 pages and silently forfeiting 13% of the rating's own weight. It is a union of intervals now, and the full corpus reads "
			+ "**0.92 at 1280 against 0.58 at 3440** — it distinguishes the two widths for the first time.");

		div.c("report-wide wide flex v gap", () =>
			figures([["width-used, hard zeros", "16 → 0"], ["scale, hard zeros @3440", "42 → 5"], ["measure, min chars", "13.7 → 35.5"],
				["contrast, max ratio", "18.20 → 3.91"], ["repetition, out of range", "8/18 → 1/17"], ["tier spread (sd)", "7.60 → 8.71"]]));

		md("**The spread grew while the mean stood still** — the signature of better discrimination, and the opposite of a tier flattening toward a constant. "
			+ "`/framework/` went 68 → **94**; `/notes/git-branch-names/`, the page both tiers wrongly crowned, went 86 → **71**, without anyone tuning toward that. "
			+ "The rules tier's **aggregate score is deleted** — it was anti-correlated with how pages look and could not go below 70. Every detector stays: they are what found the scroll boundary hiding content on 18 pages.");

		md("⚠ **Half of the generator's measured 33-point quality gap was the ruler.** `width-used` (28.1%) and `repetition` (21.0%) were its two largest bands and both were instrument error. Nobody should quote the old breakdown.");

		h3("And the devbar was manufacturing its own top finding");
		md("Opening the rail pushes `.app` over by 272px, so `.pages` measures 1648 of a 1920 viewport and passes the *is-this-the-shell* test. "
			+ "Measured with the rail as the only variable across 24 page × width pairs: **rail closed, 0 `gutter` findings. Rail open, 18 of 24 — the top finding on 12.** Its ring covered **79% of the viewport**.");

		div.c("report-wide wide", () =>
			pair([DT + "designtool-ui/shots/21-annotated-wholepage-ring-3440.png", [3440, 1440], "Before — one finding, ringing the whole 3440×1440 viewport, the tool included"],
				[DT + "designtool-ui-build/shots/selected-finding-1280.png", [1280, 1080], "After — the ring lands on the box that broke, names it, and carries the fix"]));

		div.c("report-wide wide flex v gap", () =>
			figures([["rings the analysis root", "16 → 0"], ["rings ≥60% of viewport", "47 → 0"], ["drew nothing, now marked", "0 → 37"],
				["controls on the screen", "20 → 2"], ["measurements moved", "0 of 24"]]));

		md("[DevBar](/framework/dev/DevBar/) · [DesignTool](/framework/ext/DesignTool/) — one screen, two controls, and no ring that lies.");
	},

	weak(){
		h2("What is still weak");
		md("Eight. Every one but the last was raised by the worker that did the work, not found on it afterwards.\n\n"
			+ WEAK.map(line => "- " + line).join("\n"));
	},

	landed(){
		h2("Everything else");
		div.c("report-wide wide grid auto gap").style("--column", "22em").append(() => REST.forEach(([title, body]) =>
			div.c("report-need surface pad flex v gap", () => { h3(title); md(body); })));
		md("Every task keeps its own log on the [day dashboard](/framework/ai/2026-08-17/); the run that scheduled them is [mastermind-layout](/framework/ai/2026-08-16/mastermind-layout/).");
	},
});
