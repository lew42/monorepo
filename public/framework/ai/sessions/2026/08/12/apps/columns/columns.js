import View, { div, a, span, icon } from "/app.js";

View.stylesheet(import.meta, "columns.css");

/**
 * columns(page) — Miller columns on a real Page tree, applied top to bottom.
 *
 *     demo.app(columns(sitemap()))
 *
 * Every page mounts its child BESIDE itself: `$pages` is the column to my right, so
 * `container()`'s walk up the parents lands each page one track further along and
 * depth becomes horizontal distance. `children` is the whole data model, `nav_for()`
 * draws the row, and the lit trail is `demo.app.mark()`'s `aria-current`.
 *
 * A page with no children is the detail column instead, keeping the content its own
 * `page.js` declared — so the last track is a page, not a preview of one.
 *
 * Design record: ../readme.md.
 */
export function columns(page){
	const own = page.content;

	page.assign({
		classes: "full apps-page",

		content(){
			div.c("apps-cols flex", () => {
				if (this.children.size){
					div.c("apps-col", () => rows(this));
					this.$pages = div.c("apps-next");
				} else {
					div.c("apps-detail flow pad", () => own?.call(this));
				}
			});
		},
	});

	page.children.forEach(child => child && columns(child));
	return page;
}

const rows = page => page.children.forEach((child, name) => {
	const nav = page.nav_for(name);

	a.c("apps-row").href(nav.url).click(trail).append(() => {
		icon(nav.icon ?? "description");
		span.c("flex-1", nav.label);
		if (child?.children.size) icon("chevron_right");
	});
});

/* ⚠ A frame, not now: the column this click opens is appended by an `await` inside
   demo.app.go(), so its width does not exist yet. Does nothing outside a demo box. */
function trail(){
	const scroller = this.el.closest(".demo-app-pages");

	if (scroller) requestAnimationFrame(() =>
		scroller.scrollTo({ left: scroller.scrollWidth, behavior: "smooth" }));
}

export default columns;
