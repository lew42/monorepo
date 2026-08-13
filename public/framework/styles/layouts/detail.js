import { div, demo } from "/app.js";

/* What every layout detail page is — `demo.exhibit()`, the same assembly
 * `styles/sections` and the Page overview demos use: the layout on a stage you can
 * drag, the layout bar wired to it, and the function that built it, open below.
 *
 *     export default new Page(detail({
 *         meta: import.meta, title: "Cards",
 *         layout(){ return div.c("page pad flex v gap", () => { … }); },
 *     }));
 *
 * A config factory, not a `Page` subclass: the subclass existed to override
 * `render()` so the page could BE the layout, and on a stage it no longer is.
 * `demo.tree()` and `word()` are the same shape. Design record: readme.md.
 *
 * ⚠ `layout()` returns its own `div.c("page …")` — the class string is the lesson
 *   here, so it has to be the first line of what the reader is shown.
 * ⚠ `default` is the arrangement contract's own word for "shown without being routed
 *   to" (Page.css). Without it a `.page` no Router marked is `display: none`;
 *   `demo.app()` marks the pages in its box the same way.
 * ⚠ `height:` only where the shape wears `fill` — `min-height: 100%` needs a parent
 *   that has one, and a stage's render is sized by its content.
 */
export default config => ({
	classes: "standard",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.frame())); },

	content(){
		demo.exhibit({
			page: this,
			stage: steer => demo.stage(() => this.frame(), steer).ac("bleed"),
			def: this.layout,
			file: new URL("page.js", this.meta.url).pathname,
			note: this.note,
		});
	},

	frame(){ return this.layout().ac("default").style("height", this.height ?? ""); },

	...config,
});
