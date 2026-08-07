import { div, a, icon } from "/app.js";

/* One layout, the whole window, and a way out.
 *
 *     route(name){ return name === "full" && full(this, layout); },
 *     demo(layout, { full: this });
 *
 * A URL, not a class — so a live reload comes back to what you were looking at,
 * which is the whole reason to iterate in here. `route()` claims the segment
 * without a directory: this replaced eight `full/` folders holding four lines
 * each, and the only thing they said was which layout to draw.
 *
 * **The demo box links here rather than owning a mode of its own.** `demo()`
 * takes `{ full: page }` and turns its expand control into an anchor at
 * `page.url + "full/"`. So the button that says "bigger" produces a url, and a
 * reload lands back on it — which a class toggle can never do. A demo with no
 * `full:` still gets the in-place toggle, because most demos are components with
 * nowhere to route to.
 *
 * `render()` and not `content()` because Page draws an h1 for whatever title it
 * has, and the point of this page is that there is nothing above the layout. The
 * three things an override owes (core/Page/readme.md): set `this.view`, carry
 * `.page`, never nest a second one.
 */
export default function full(page, layout){
	return {
		title: page.title + " — full",

		render(){
			return this.view ??= div.c("page layout-full", () => {
				a.c("layout-close", () => icon("close")).href(page.url);
				layout();
			});
		},
	};
}

export { full };
