import { Page } from "../../core/Page/Page.class.js";
import { p } from "../../core/View/View.js";

/**
 * sample(root) — the shared sample tree: one fictional site, rendered many ways.
 *
 *     demo.app(sample())                                  // the default wall
 *     demo.app(sample({ initialize(){ this.catalog(); } }))  // the same nine, rearranged
 *
 * Nine children; html, css and js go a level deeper. A demo that needs a tree
 * takes this one and overrides the ROOT — content(), previews(), card claims —
 * so what changes between demos is exactly the thing each demo teaches.
 *
 * ⚠ Object children only: nothing here is on disk — the root's url derives from
 * its title (`Web` → `/web/`), and a name string (`children: "html"`) would
 * probe the server (see app.js).
 */
export function sample(root){
	return new Page({
		title: "Web",
		icon: "language",

		children: {
			HTML: { icon: "code", content(){ this.previews(); }, children: {
				Elements: { icon: "html", content(){ p("Every element is a word; a page is a sentence."); } },
				Attributes: { icon: "tune", content(){ p("What an element says about itself."); } },
				Semantics: { icon: "psychology", content(){ p("`<article>` says what `<div>` only means."); } },
			} },

			CSS: { icon: "palette", content(){ this.previews(); }, children: {
				Selectors: { icon: "colorize", content(){ p("Which elements a rule reaches."); } },
				Layout: { icon: "grid_view", content(){ p("Where boxes go, and who decides."); } },
				Color: { icon: "opacity", content(){ p("`light-dark()` and the tokens that carry it."); } },
			} },

			JS: { icon: "data_object", content(){ this.previews(); }, children: {
				Syntax: { icon: "code", content(){ p("The grammar under everything else."); } },
				DOM: { icon: "account_tree", content(){ p("The page, as an object you can hold."); } },
				Events: { icon: "bolt", content(){ p("What happened, and who is listening."); } },
			} },

			HTTP: { icon: "swap_horiz", content(){ p("A question, an answer, and headers about both."); } },
			SVG: { icon: "polyline", content(){ p("Drawings that are also documents."); } },
			A11y: { icon: "accessibility", content(){ p("A page everyone can read."); } },
			Fonts: { icon: "text_fields", content(){ p("The letters themselves."); } },
			Media: { icon: "image", content(){ p("Images, audio, video — the heavy cargo."); } },
			Forms: { icon: "list_alt", content(){ p("The half of the web that talks back."); } },
		},

		content(){ this.previews(); },

		...root,
	});
}

export default sample;
