import View, { div, a, span, is } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import { stage, WIDTHS } from "./stage.js";
import { source, source_block, source_code, source_file } from "./demo.js";

/* The site's one control surface. An ext may lean on an ext; only core may never. */
import layout from "../layout/layout.js";

/* Patches demo.app() on — app mode is that box. The side effect IS the import. */
import "./app.js";
import demo from "./demo.js";

View.stylesheet(import.meta, "shell.css");

/**
 * page.demo(options) — ONE demo UX, and any page can wear it.
 *
 *     import rail from "/web/nav/rail/page.js";
 *     content(){ rail.demo(); }                     // the whole page, as a demo
 *     content(){ rail.demo({ code: false }); }      // the render alone
 *
 * The shape is fixed, so a reader learns it once:
 *
 *   ┌ path ──────────────────────┐  ┌ source ─────┐
 *   │ /web/ › nav/ › rail/       │  │             │
 *   ├ tools: 390 810 1440 3440 ⤢ ┤  │ page.js,    │
 *   │ the page, running          │  │ open, a     │
 *   │                    1440px  │  │ PEER        │
 *   ├ the layout bar ────────────┤  │             │
 *   └────────────────────────────┘  └─────────────┘
 *
 * Four rules it never breaks, which is the whole point of one shell:
 *
 *   - the PATH is always above, so routing is visible;
 *   - the width READOUT is always under the render;
 *   - the source is a COLUMN beside the render where there is room and a block
 *     under it where there isn't — never a `<details>` you have to open;
 *   - the render has no height, only a floor. Nothing is ever cut off.
 *
 * Options, all optional — one object, no positional arguments:
 *
 *   code    true (the page's own `page.js`) · false · a function · a string
 *   file    the "whole file" link beside the source. Defaults to the page's `page.js`
 *   app     live navigation inside the box. Defaults on when the page has children
 *   nav     the rail, in app mode
 *   widths  the simulation presets, `[[px, label], …]`; `false` for none
 *   min     a minimum height — a FLOOR. There is deliberately no `height`
 *   path    false to drop the path bar
 *   bar     the layout bar under the render — `ext/layout`, pointed at what is shown
 *   run     `fn(shell)` — the run column, prebuilt. This is what makes the four
 *           sugars thin: `demo.page`, `demo.tree`, `demo.exhibit` and `demo.layout`
 *           each know one thing the shell should not (a bleeding canvas, a bare
 *           frame, a mini app of some OTHER tree) and hand back their own `stage()`.
 *           Everything around it — band, path, source, bar — is the shell's, once.
 *           ⚠ Whatever it returns must be a `stage()`, or the readout is not there.
 *
 * ⚠ A Page memoizes its view, so demoing a page the real Router also shows moves
 *   that view into this box. Import a page the site does not route to, or build
 *   one for the demo — `demo.sample()` is the house tree.
 */
Page.prototype.demo = function(options){
	return new DemoShell({ page: this }, options);
};

class DemoShell extends View {

	render(){
		// Children mean there is something to navigate, and navigation is what the
		// path bar is for. A leaf has nothing to route to, so it renders bare.
		this.app ??= !this.run && this.page.children.size > 0;

		div.c("demo-shell-run", () => {
			if (this.path) this.$path = div.c("demo-shell-path");

			this.stage();

			/* ⚠ Placed AFTER the stage and filled from a slot: `steer()` fires while
			   the stage is still building — before this exists — so the slot draws the
			   first bar itself and every later one arrives through `empty()`. */
			if (this.bar) this.$bar = div.c("demo-shell-steer", () => { if (this.target) layout.bar(this.target); });
		});

		if (this.code !== false) div.c("demo-shell-code", () => { this.source(); });

		this.crumbs(this.page);
	}

	// The site's one stage: its strip, its handle, and — always — its readout.
	// ⚠ No `height`, ever. `min` is a floor on the RENDER, so content can only add.
	stage(){
		if (this.run) return this.run(this);

		const { $stage, $render } = stage(() => this.mount(), "", this.widths);

		this.$render = $render;
		this.target ??= $render;

		if (this.min) $render.style("min-height", this.min);

		return $stage.ac("demo-shell-stage");
	}

	/* `default` is the arrangement contract's word for "shown without being routed
	   to" (Page.css) — without it a `.page` nothing marked is `display: none`. */
	mount(){
		// ⚠ `scope`, always: without it the box roots at the tree's own root, which for
		// an imported site page is the whole site (app.js `root_of()`).
		if (this.app)
			return demo.app(this.page, { scope: this.page, urls: true, nav: this.nav, shown: page => this.shown(page) });

		try {
			return this.page.render().ac("default");
		} catch (error) {
			return div.c("demo-error", "This page cannot render outside its route: " + error.message);
		}
	}

	/* What a box hands back every time it shows a page: the strip follows the
	   navigation, and so does the bar — so the controls point at the page you are
	   looking at rather than at the one the box opened on. */
	shown(page){
		this.crumbs(page);
		this.steer(page);
	}

	// What the layout bar points at. A View, an element or a live Page — `layout.bar`
	// takes all three, which is why a run column can hand back whichever it has.
	steer(target){
		this.target = target;
		this.$bar?.empty(() => layout.bar(target));
	}

	/* The path bar — the demo app's own url strip, promoted to the shell so every
	   demo has one and there is only ever one. In app mode the box calls this back
	   with each page it shows, so the strip follows the navigation; hidden in the
	   box itself by shell.css, or the pair would stack. */
	crumbs(page){
		this.$path?.empty(() => page.chain().forEach((step, i) => {
			if (i) span.c("demo-shell-sep", "›");
			a.c("demo-app-crumb", i ? step.name + "/" : step.url).href(step.url);
		}));
	}

	/* A PEER surface, not a disclosure: open, beside the render, with the file it
	   came from named above it. `code: true` reads the page's own `page.js` — the
	   thing a reader asking "how is this built" actually wants. `source_block()` is
	   demo.js's, and every `demo.source()` on the site is the same block. */
	source(){
		const own = this.page.meta && new URL("page.js", this.page.meta.url).pathname;
		const file = this.file ?? own;

		// A function or a string is an EXCERPT — it is called "Source" and the file
		// link beside it is how you reach the imports it leaves out. `code: true` is
		// the whole file already, so the file's own name is the honest label.
		const excerpt = is.fn(this.code) || is.str(this.code);

		return source_block(excerpt ? "Source" : file?.split("/").at(-1) ?? "Source", $src => {
			if (is.fn(this.code)) source_code(source(this.code));
			else if (is.str(this.code)) source_code(this.code);
			else if (this.page.meta) $src.append(source_file(this.page.meta, "page.js"));
			else source_code("// no meta: on this page — pass code: a function or a string");
		}, file);
	}

	// The render box, and a way to rebuild it — `demo.layout`'s parts chips redraw
	// the frame in place, and a sugar that built its own `run` owns its own.
	redraw(){ this.$render?.empty(() => this.mount()); }
}

/* ⚠ The prototype, never class fields: `render()` runs inside `super()` (View's
   constructor calls it), so a field would arrive after the shell had already been
   built — and it would overwrite whatever the caller passed.

   `bleed` is the page's widest grid track (Page.css): a demo is an exhibit, and the
   whole point of the two-column band is spending a 3440 on it. */
Object.assign(DemoShell.prototype, { classes: "bleed", code: true, path: true, bar: false, widths: WIDTHS, min: "" });

export default Page.prototype.demo;
export { DemoShell };
