import { div, h2, p, span, a, icon, md } from "/app.js";
import Menu from "/framework/ux/Menu/Menu.js";
import { Paging } from "../paging.js";
import { PRESETS, preset_url } from "../presets.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the app's middle — a `.pages` region with core's page grid in it.
   2 SIZE       prose keeps the 40em measure; the stage claims `wide`, which starts
                on the same left edge and takes every leftover pixel: ~2830px of a
                3440 screen, ~640 at 1280.
   3 OWN LAYOUT a dropdown, one live page, one line. That is the whole page.
   4 REGIONS    one. The twelve presets are SIBLINGS in the app's middle, not
                regions of this page — clicking one swaps the middle.
   5 PREVIEW    core's card, in the rail's Library section and on the hub's wall.

   ⚠ TWELVE PAGES, NO DIRECTORIES. Each preset is a real `Page` declared in the list
     below, so it has a real url, a real back button and a cold load — and there is
     not one `page.js` for any of them. A preset is a set of words that earned a url
     (`../presets.js`); giving each one a module is exactly the thirteen one-value
     directories the 2026-09-05 audit found and deleted.                          */

/* ── THE DROPDOWN ──────────────────────────────────────────────────────────────
   The site's own menu (`ux/Menu`), and every item is a REAL LINK to that preset's
   real url. So picking one changes the address bar, the back button works, and the
   middle swaps — one click, one visible change. A `<select>` here would have needed
   a change handler that navigated for it. */
const chooser = here => div.c("paging-chooser flex v-center gap wrap", () => {
	span.c("paging-pick-label", "page shape");

	new Menu({
		label: here ? here.title : "Pick one of twelve",
		items: PRESETS.map(preset => ({ text: preset.title, href: preset_url(preset) })),
	});

	if (here) span.c("paging-card-say", here.one_line);
});

/* ── ONE PRESET, AS A PAGE ────────────────────────────────────────────────────
   A configuration on a stage, and nothing else on the page. Hover it and the
   toolbar appears; the drawer holds the rest. */
class Preset extends Paging {

	content(){
		chooser(this.preset);

		this.stage(this.preset.config, this.preset.nest ? { nest: { ...this.preset.nest, title: "the nested page" } } : null);

		md("Every word of this page is a **configuration**, not code — hover the page above to change one, or open **More** for the whole form, the JSON, and the button that writes it to disk as a real page. The five words are [the building blocks](/imagine/paging/).");
	}
}

export default new Paging({
	meta: import.meta,
	title: "Library",
	description: "Twelve whole pages, already configured. Pick one from the dropdown.",
	icon: "collections_bookmark",

	index: true,
	depth: 1,

	children: PRESETS.map(preset => new Preset({
		name: preset.id,
		title: preset.title,
		icon: preset.icon,
		description: preset.one_line,
		preset,
	})),

	content(){
		p.c("paging-lede", "Pick a shape from the dropdown. Each one is a real page, running — hover it to change what a click does, how it is laid out, and its two colours.");

		chooser(null);

		this.stage(PRESETS[0].config);

		h2("All twelve");

		div.c("paging-cards", () => PRESETS.forEach(preset =>
			a.c("paging-card").href(preset_url(preset)).append(() => {
				span.c("paging-card-head", () => { icon(preset.icon); span(preset.title); });
				span.c("paging-card-say", preset.one_line);
			})));
	},
});
