import { div, h2, span, a, icon, md } from "/app.js";
import { Paging } from "../paging.js";
import { PRESETS, preset_url } from "../presets.js";
import { nest_of } from "../url.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the app's middle — a `.pages` region with core's page grid in it.
   2 SIZE       prose keeps the 40em measure; the stage claims `wide`, which starts
                on the same left edge and takes every leftover pixel: ~2830px of a
                3440 screen, ~640 at 1280.
   3 OWN LAYOUT one live page under its bar, and one line. That is the whole page.
   4 REGIONS    one. The twelve presets are SIBLINGS in the app's middle, not
                regions of this page — clicking one swaps the middle.
   5 PREVIEW    core's card, in the rail's Library section and on the hub's wall.

   ⚠ TWELVE PAGES, NO DIRECTORIES. Each preset is a real `Page` declared in the list
     below, so it has a real url, a real back button and a cold load — and there is
     not one `page.js` for any of them. A preset is a set of words that earned a url
     (`../presets.js`); giving each one a module is exactly the thirteen one-value
     directories the 2026-09-05 audit found and deleted.                          */

/* ── WHICH ONE YOU ARE LOOKING AT LIVES IN THE BAR ────────────────────────────
   Every page here carries a `shape` — the preset it is — and the toolbar over the
   stage turns that into its EIGHTH labelled dropdown, showing the running page's own
   name beside the seven words (`../toolbar.js`).

   It used to be a grey chip-button above the bar, in a style nothing else on the page
   used, reading "Pick one of twelve" while the blog preset was already running under
   it (paging-audit-3, item 5). One bar, eight controls, and the one that changes the
   whole page reads its name.                                                       */

/* ── ONE PRESET, AS A PAGE ────────────────────────────────────────────────────
   A configuration on a stage, and nothing else on the page. Hover it and the
   toolbar appears; the drawer holds the rest. */
class Preset extends Paging {

	content(){
		// `nest_of()` turns the preset id into the nested page AND gives it that id, so
		// the address says `?nest=…`, the drawer's chip is lit, and one click takes it out.
		this.stage(this.preset.config, this.preset.nest ? { nest: nest_of(this.preset.nest) } : null);

		md("Every word of this page is a **configuration**, not code — change one in the bar, or press **More** for the whole form, the link to this exact page, the JSON, the `page.js`, and the button that writes it to disk. The seven words are [the six building blocks](/imagine/paging/).");
	}
}

export default new Paging({
	meta: import.meta,
	title: "Library",
	description: "Twelve whole pages, already configured. Pick one from the dropdown.",
	icon: "collections_bookmark",

	index: true,
	depth: 1,

	// The stage below opens on the first preset, so that is the shape the bar names.
	shape: PRESETS[0],

	// `shape` is what the bar's eighth dropdown reads: the ready-made page this is.
	children: PRESETS.map(preset => new Preset({
		name: preset.id,
		title: preset.title,
		icon: preset.icon,
		description: preset.one_line,
		preset,
		shape: preset,
	})),

	content(){
		this.lede("Pick a shape in the bar over the page, then change a word to make it your own.");

		this.stage(PRESETS[0].config);

		h2("All twelve");

		div.c("paging-cards", () => PRESETS.forEach(preset =>
			a.c("paging-card").href(preset_url(preset)).append(() => {
				span.c("paging-card-head", () => { icon(preset.icon); span(preset.title); });
				span.c("paging-card-say", preset.one_line);
			})));
	},
});
