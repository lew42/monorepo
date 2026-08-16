import { Page, div, h2, md } from "/app.js";
import tier400 from "/framework/styles/layouts/400/page.js";
import widths from "/framework/ext/LayoutTool/widths/page.js";

export default new Page({
	meta: import.meta,
	title: "Layout overnight",
	description: "Width-based layout library, curated overnight: five 400px-first entries plus the meter that measures them at four widths.",
	icon: "insights",

	content(){

		md("**Mike's brief, verbatim:** *\"we need a layout library, based on width. 400px "
			+ "layouts: 1 column, mobile friendly. What can we do with 400px? how do they "
			+ "look at 1920, 3440?\"* Thirteen minions, one night — census → direction → build "
			+ "×2 → forensics. This is the curation, not the log: [requirements](requirements.md) "
			+ "· [census](census.md) · [direction](direction.md) · [forensics](forensics.md) · "
			+ "[task.jsonl](task.jsonl).");

		h2("What landed");

		div.c("page-previews bleed", () => { tier400.preview(); widths.preview(); });

		h2("Found tonight");

		md("- **`frame()`'s 350ms settle can silently fall back to `doc.body`** and report a "
			+ "vacuous A100 — reproduced in [forensics](forensics.md); fix proposed, not shipped.\n"
			+ "- **`styles/sections/full` genuinely grades F at 400** — cramped blockquote and "
			+ "`.section-band`, predates tonight, confirmed by a fresh headless run.\n"
			+ "- **[direction.md](direction.md)'s own `full()` recipe needed `.ac(\"default\")`** "
			+ "or the nested `.page` stays hidden and `/full/` renders empty — fixed in the shipped "
			+ "tier, the doc left as written.");

		h2("Parked for Mike");

		md("- Fix `frame()`'s silent `doc.body` fallback — shipped ext, out of fence.\n"
			+ "- Fix `styles/sections/full`'s cramped blockquote/section-band at 400.\n"
			+ "- `--measure: 52em` measured 94.5ch/line at 3440 — the token or the rule is wrong; a site-wide call.\n"
			+ "- Twin card's phone pane is hard-coded 390 while the tier is named 400 — `narrow` as config, or accept the 10px?\n"
			+ "- `carousel`, `hero`, `overlay`, `pricing` ship but are missing from the layouts readme's table.\n"
			+ "- Should every `library/` entry cite the `bad/` trap it replaces, site-wide?\n"
			+ "- `space`'s `bands()`, `gen.js` phase-2 families, Panel's `structure(seed, width)` — out of scope tonight.");

		h2("Spend");

		md("Thirteen minions, **~1.45M** subagent tokens, session window held green all night (peaked **~37%**); one self-inflicted dashboard regression caught by our own crawl and fixed within the hour.");
	},
});
