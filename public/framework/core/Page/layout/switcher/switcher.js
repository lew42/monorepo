import { Page, View, div, details, summary, icon } from "/app.js";
import "/framework/ext/tabs/tabs.js";

// css: .switcher, .switcher-drop, .switcher-toggle, .switcher-skin-* — all in switcher.css.
View.stylesheet(import.meta, "switcher.css");

/**
 * switcher() — a routed list that switches the content beside it. Vertical tabs, a
 * file tree and a left nav are three CSS SKINS of this one mechanism, nothing more:
 *
 *     content(){ this.switcher("guide api reference"); }               // vertical tabs (default)
 *     content(){ this.switcher("index-js router-js", { skin: "tree" }); } // file tree
 *     content(){ this.switcher("home settings", { skin: "nav" }); }       // left nav
 *
 * It is built entirely on `this.tabs(names).ac("vertical")` (ext/tabs) — the exact
 * same routing, the exact same `.active-page` / `.active-ancestor` (core/Router,
 * Page.css) and `.active` / `.in-path` (Router.mark_links()) classes that already
 * run every tab strip and every nav link on the site. This file never sets or reads
 * any of those four classes — see doc/decide.md for the proof, with the files and
 * lines that make it true.
 *
 * The one thing switcher.js adds is presentational: a `<details>` TOGGLE (empty but
 * for its own `<summary>`) sits BESIDE the tab list, never wrapped around it —
 * `<details>`'s native "hide my content unless open" behaviour is not reliably
 * overridable by CSS (a first version nested the list inside it and it silently
 * measured 0px tall; doc/decide.md §2 has the story). switcher.css instead reads the
 * toggle's `[open]` state off its NEXT SIBLING with the `~` combinator, only inside a
 * container query, to turn the list into a one-row sticky header on a narrow box.
 * Design record: readme.md.
 */
Page.prototype.switcher = function(names, opts = {}){
	const skin = opts.skin ? " switcher-skin-" + opts.skin : "";

	return div.c("switcher" + skin, ($switcher) => {
		const $drop = details.c("switcher-drop", () => {
			summary.c("switcher-toggle", () => icon("expand_more"));
		});

		this.tabs(names).ac("vertical");

		// ⚠ Only closes the toggle once a choice is made, so the next narrow visit
		// starts collapsed again — it reads which link was clicked, never which one
		// carries ".active": Router decides that on its own, after this returns. Skip
		// this and the pattern still works; it only saves the reader a second tap.
		$switcher.el.addEventListener("click", e => {
			if (e.target.closest("a.tab")) $drop.el.removeAttribute("open");
		});
	});
};

export default Page.prototype.switcher;
