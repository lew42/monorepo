import { Page, md, div, img, a, span } from "/app.js";

const HERE = "/framework/ai/2026-08-19/page-simplify-preview/";

// url, caption. Screenshot order = shoot order in page-simplify-preview.mjs.
const PAIRS = [
	["/framework/core/View/", "Overview tab widens — the intro paragraph goes from wrapping at ~510px to one line. It's a `.doc-section`; standard added, `--measure` now inherits from the region instead of the page declaring its own 40em."],
	["/framework/core/View/api/append/", "**The self-check.** `.tab-panel .page`'s main grid track: 601.59px → 967.28px — the panel's own width, not a fixed 40em. `.tab-panel`'s `--measure: none → 100%` is what changed it."],
	["/framework/core/", "Identical. A default `standard` page already reads `--measure: 40em` from its region (`.pages`) either way — removing the page's own declaration changes nothing when the region agrees."],
	["/framework/ext/catalog/", "Overview tab widens the same way as View — one more line of the closing paragraph fits before it wraps."],
	["/framework/styles/layouts/dashboard/", "Identical. The `full fill flex v` specimen itself renders inside a `demo.layout()` iframe — a separate document the injected stylesheet never reaches. The wrapping doc page (`standard`) is unaffected either way."],
	["/framework/ext/DesignTool/", "Overview tab widens and the preview-card wall reflows from 3 to 4 across at this width."],
];

export default new Page({
	meta: import.meta,
	title: "Opt-in grid — before / after",
	description: "Six urls, shot twice: the site today, and with proposal.md §5 injected live. No files touched.",
	icon: "compare",

	content(){
		md("**The patch:** `Page.css`'s grid moves from bare `.page {}` to `.page.standard {}`; "
			+ "`.page.standard` stops declaring `--measure: 40em` and inherits it; five regions' "
			+ "`--measure: none` become `100%` so it actually reaches them; `.page.full` / `.page.solo` "
			+ "are deleted; 7 call sites that opted out but still want the grid gain the word `standard`. "
			+ `Full detail: [proposal.md](../page-layout-audit/proposal.md) §5 · [patch.md](${HERE}patch.md) · [patch.css](${HERE}patch.css).`);

		md("**How \"after\" was made:** headless, no disk edits — `page.addStyleTag()` injects the "
			+ "proposal's CSS live (`@layer theme`, appended so it wins ties by source order) and "
			+ "`page.evaluate()` adds `standard` to the 7 call sites' elements, then it's screenshotted. "
			+ "Script: `page-simplify-preview.mjs` (session scratchpad).");

		PAIRS.forEach(([url, caption], i) => this.pair(i + 1, url, caption));
	},

	pair(n, url, caption){
		div.c("wide flex v gap").style("--gap", "0.4em").append(() => {
			a.c("h4").href(url).text(url);
			div.c("flex gap wrap").append(() => {
				["before", "after"].forEach(when => a.c("")
					.attr("href", `${HERE}${when}-${n}.png`)
					.style({ flex: "1 1 22em", maxWidth: "50%", minWidth: "0" })
					.append(() => {
						span.c("muted h4", when);
						img.c("").attr("src", `${HERE}${when}-${n}.png`).attr("alt", `${when}, ${url}`)
							.style({ display: "block", width: "100%", border: "1px solid var(--line)" });
					}));
			});
			md(caption);
		});
	},
});
