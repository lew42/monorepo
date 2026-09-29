import { Page, Sidebar, div, a, span, img, h1, p, blockquote } from "/app.js";
import Framework from "/framework/page.js";
import Core from "/framework/core/page.js";

/* Variant D — a breadcrumb. Instead of picking ONE word for the top of the
 * rail (the parent, in B/C), show BOTH hops as two small links under the
 * logo: it answers "how far home" directly, which variant A leaves open. */
export function header(){
	return div(() => {
		div.c("brand", () => {
			a(() => img().attr("src", Sidebar.favicon()).attr("alt", "")).href("/").ac("brand-logo");
		}).style({ paddingBottom: "0" });

		div.c("flex gap", () => {
			a(Framework.title).href(Framework.url).style({ fontSize: "0.78em", opacity: "0.75", textDecoration: "none" });
			span("›").style({ fontSize: "0.78em", opacity: "0.5" });
			a(Core.title).href(Core.url).style({ fontSize: "0.78em", opacity: "0.75", textDecoration: "none" });
		}).style({ padding: "0 var(--gutter) 1.2em" });
	});
}

export const blurb = "Logo alone on top; a small breadcrumb — Framework › Core — underneath, each word its own link.";

export default new Page({
	meta: import.meta,
	title: "D — breadcrumb",
	description: blurb,
	icon: "view_sidebar",

	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a stage owns the whole screen"); },

	preview(nav){ return this.preview_card(nav, () => div.c("sidebar variant-thumb", header)); },

	render(){
		return this.view ??= div.c("page sidebar-variant-d topic flex fill hides-nav", () => {

			new Sidebar({ app: this.app, header, root: Core });

			div.c("pages", () => {
				div.c("default flow pad", () => {

					a("← Sidebar variants").href("/framework/core/Sidebar/variants/");

					blockquote("“There's like two different kind of go home, but how far home.”");

					h1("Core");

					p("This spells out A's own observation instead of picking one meaning for it: the logo alone always goes all the way home, and a small breadcrumb under it — Framework › Core — shows every stop in between, each one its own link.");

					p("Trade-off: two links tell you exactly where you are, but the strip needs a second line under the logo — today's rail has no room budgeted for one.");
				});
			});
		});
	},
});
