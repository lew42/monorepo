import { View, div, a, icon } from "/app.js";

/* css: .layout-full, .layout-close */
View.stylesheet(import.meta, "layouts.css");

/* One layout, the whole window, and a way out.
 *
 *     route(name){ return name === "full" && full(this, page); },
 *     demo(page, { full: this });
 *
 * A url, not a class — so a live reload comes back to what you were looking at.
 * `route()` claims the segment without a directory.
 *
 * `render()` and not `content()` because Page draws an h1 for whatever title it
 * has, and the point of this view is that there is nothing above the layout. The
 * three things an override owes: set `this.view`, carry `.page`, never nest a
 * second one. Design record: readme.md.
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
