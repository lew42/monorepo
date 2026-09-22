import { Page, View, md } from "/app.js";

// `.design-shot` (every child's own `preview()` override) now lives in core's own
// Page.css, beside `.page-preview-thumb` — moved there 2026-09-18 because by the time
// these ten studies landed here, `.design-shot` also had users outside this tree
// (`ui/controls/study/`, `layouts/doc/studies/`, `web/nav/doc/study/`,
// `ext/DesignTool/journey/`), so no one studies-only file was the right place to keep
// declaring it. This file needs no stylesheet of its own.

/* Container: a child of /framework/styles/system/, previewed and routed like any other
   page under it. Size: `full` — ten real screenshots read as a wall, not a word list
   (the exact failure these studies themselves diagnose in other realms — the old
   `/imagine/design/` index made this mistake itself before it was fixed 2026-09-04,
   `public/framework/ai/2026-09-04/imagine-design/`).
   Own layout: `index: true` + previews() — the cards ARE the nav. Regions: none.
   Preview: the default card on /framework/styles/system/. */
export default new Page({
	meta: import.meta,
	title: "Studies",
	description: "Ten finished studies — the evidence behind --size, the four rungs, and every rule on the page above.",
	icon: "science",
	width: "full",
	index: true,

	children: "size spacing padding scale type color themes system vocabulary lists",

	content(){
		md("**Ten studies, each answering one question with real screenshots from the site — not opinions.** These are the studies behind [the system page](/framework/styles/system/)'s numbers: the size ladder, the four spacing rungs, the padding rule, the colour ratios, the type scale. Four sibling studies — controls, layout, navigation, journey — moved into their own module instead, because each one proved a rule for that module specifically: [`/framework/ui/controls/study/`](/framework/ui/controls/study/), [`/layouts/doc/studies/`](/layouts/doc/studies/), [`/web/nav/doc/study/`](/web/nav/doc/study/), [`/framework/ext/DesignTool/journey/`](/framework/ext/DesignTool/journey/). All fourteen used to share one rail at `/imagine/design/`, which still answers — a one-line pointer at every old address (`ai/2026-09-18/imagine-move-2/`).");

		md("**A note on 2026-09-19:** a hard reset that night wiped this whole module — it had been `git add`ed but never committed. Two recovery tasks searched every session transcript on the machine and could not find a full copy of any of the nine files below, and marked them gone for good. They were wrong: an untouched `git stash` from the exact moment of the reset held every one of them, byte-identical to the three files that had survived on disk. All nine are restored below. The full story is at [`ai/2026-09-20/studies-honest/`](/framework/ai/2026-09-20/studies-honest/).").ac("muted");
		this.previews().style("--column", "20em");
	},
});
