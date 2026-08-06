import { div, a, icon } from "/app.js";

/* One layout, the whole window, and a way out.
 *
 *     route(name){ return name === "viewport" && viewport(this, layout); }
 *     viewport.link(this);
 *
 * A URL, not a class — so a live reload comes back to what you were looking at,
 * which is the whole reason to iterate in here. `route()` claims the segment
 * without a directory: this replaced eight `full/` folders holding four lines
 * each, and the only thing they said was which layout to draw.
 *
 * The word appears twice per page, at both call sites, and that is on purpose —
 * a page should be readable as "I claim this url, and here is the link to it".
 *
 * `render()` and not `content()` because Page draws an h1 for whatever title it
 * has, and the point of this page is that there is nothing above the layout. The
 * three things an override owes (core/Page/readme.md): set `this.view`, carry
 * `.page`, never nest a second one.
 */
export default function viewport(page, layout){
	return {
		title: page.title + " — viewport",

		render(){
			return this.view ??= div.c("page layout-viewport", () => {
				a.c("layout-close", () => icon("close")).href(page.url);
				layout();
			});
		},
	};
}

viewport.link = page => a.c("page-link", "Viewport ↗").href(page.url + "viewport/");

export { viewport };
