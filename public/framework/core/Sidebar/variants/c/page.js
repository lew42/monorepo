import { Page, Sidebar, div, a, img, h1, p, blockquote } from "/app.js";
import Framework from "/framework/page.js";
import Core from "/framework/core/page.js";

// Invented — a stand-in for a page whose real title runs long, so this
// variant has something to truncate. No real page on the site has a title
// this long today; that is the point.
const LONG_TITLE = "Section wrapper, catalog & generator overview";

/* Variant C — like B, but the word is a SHORT label instead of the page's
 * real title: Sidebar.css already truncates a long .brand-title with an
 * ellipsis (it has to, for the search box above it to keep its own room),
 * so the fix here is one attribute — a `title=""` tooltip with the full
 * text — not a second word. */
export function header(){
	return div.c("brand", () => {
		a(() => img().attr("src", Sidebar.favicon()).attr("alt", "")).href(Framework.url).ac("brand-logo");
		a(LONG_TITLE).href(Core.url).ac("brand-title").attr("title", LONG_TITLE);
	});
}

export const blurb = "Like B, but the word truncates with an ellipsis and a full-title tooltip — for a long page title.";

export default new Page({
	meta: import.meta,
	title: "C — short name",
	description: blurb,
	icon: "view_sidebar",

	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a stage owns the whole screen"); },

	preview(nav){ return this.preview_card(nav, () => div.c("sidebar variant-thumb", header)); },

	render(){
		return this.view ??= div.c("page sidebar-variant-c topic flex fill hides-nav", () => {

			new Sidebar({ app: this.app, header, root: Core });

			div.c("pages", () => {
				div.c("default flow pad", () => {

					a("← Sidebar variants").href("/framework/core/Sidebar/variants/");

					blockquote("“I'm not sure how long page titles can get — there's not a lot of room in the left sidebar, especially if that kind of site name or whatever is pretty big text and we don't want to compete with the H1.”");

					h1(LONG_TITLE);

					p("The word in the rail is the exact same long title as the H1 below, but the rail already clips a long .brand-title with an ellipsis, so it just reads as “Section wrapper…” there. Hover it to see the full title, same as any truncated label on the site.");

					p("Trade-off: truncating protects the rail's own layout — the fold arrows and the footer never move — but a chopped title reads as a mystery until you hover it.");
				});
			});
		});
	},
});
