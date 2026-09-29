import { Page, Sidebar, div, a, img, h1, p, blockquote } from "/app.js";
import Framework from "/framework/page.js";
import Core from "/framework/core/page.js";

/* Variant B — one level down. The logo now goes to the PARENT (Framework),
 * not all the way home — and the word becomes the current page's own title,
 * pointing at itself. The nav below switches too: instead of the whole
 * framework tree, it shows this page's OWN children.
 *
 * The "current page" pretended here is Core (/framework/core/) — a real,
 * routable page with real children, reached the same way any other demo on
 * this site reaches one. */
export function header(){
	return div.c("brand", () => {
		a(() => img().attr("src", Sidebar.favicon()).attr("alt", "")).href(Framework.url).ac("brand-logo");
		a(Core.title).href(Core.url).ac("brand-title");
	});
}

export const blurb = "Logo → the parent page. Word → the current page's own title. Nav → its own children.";

export default new Page({
	meta: import.meta,
	title: "B — one level down",
	description: blurb,
	icon: "view_sidebar",

	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a stage owns the whole screen"); },

	preview(nav){ return this.preview_card(nav, () => div.c("sidebar variant-thumb", header)); },

	render(){
		return this.view ??= div.c("page sidebar-variant-b topic flex fill hides-nav", () => {

			new Sidebar({ app: this.app, header, root: Core });

			div.c("pages", () => {
				div.c("default flow pad", () => {

					a("← Sidebar variants").href("/framework/core/Sidebar/variants/");

					blockquote("“What I was actually thinking is that instead of the M logo linking home and the word framework linking to the framework, we could just repeat that pattern. So now the M logo links to the framework if we're on like a sub framework page and then the word could become whatever page we're on.”");

					h1("Core");

					p("Pretend this is /framework/core/: the logo now points back up to Framework, the word says “Core” and points at this page itself, and the tree below is Core's own ten children instead of the whole framework.");

					p("Trade-off: the word now says something different on every page, so it has to share the top of the rail with the H1 just below it — kept smaller and lighter here so the H1 still wins.");
				});
			});
		});
	},
});
