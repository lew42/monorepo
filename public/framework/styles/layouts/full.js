import { Page, div, a } from "/app.js";

/* Maximize — one layout, the whole region, and a way back.
 *
 *     export default full(import.meta, layout, "Holy grail");
 *
 * A url and not a query param: this router keys on path segments, so `?full`
 * would resolve to the same page and mean nothing. A child page is the honest
 * spelling — it has its own url, it is linkable, and Back leaves it.
 *
 * `render()` and not `content()` because Page draws an h1 for whatever title it
 * has, and the point of this page is that there is nothing above the layout. The
 * three things an override owes (core/Page/readme.md): set `this.view`, carry
 * `.page`, never nest a second one.
 */
export default (meta, layout, title) => new Page({
	meta,
	title: title + " — full size",

	render(){
		return this.view ??= div.c("page layout-full hides-nav", () => {
			a.c("page-link", "← " + title).href(this.parent.url);
			layout();
		});
	},
});
