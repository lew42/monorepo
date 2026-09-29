import { Page, View, Sidebar, div, a, span, img, h1, p, blockquote } from "/app.js";
import Framework from "/framework/page.js";
import Core from "/framework/core/page.js";
import navPreview from "../preview-nav.js";

View.stylesheet(import.meta, "../variants.css");

/* Variant D — a breadcrumb, beside the logo. Instead of picking ONE word for
 * the top of the rail (the parent, in B/C), show BOTH hops as two small
 * links on the SAME line as the logo: it answers "how far home" directly,
 * which variant A leaves open. */
export function header(){
	return div.c("brand", () => {
		a(() => img().attr("src", Sidebar.favicon()).attr("alt", "")).href("/").ac("brand-logo");

		div.c("variant-crumbs", () => {
			a(Framework.title).href(Framework.url).ac("variant-crumb");
			span("›").ac("variant-crumb-sep");
			a(Core.title).href(Core.url).ac("variant-crumb");
		});
	});
}

export const blurb = "Logo and a small breadcrumb — Framework › Core — on the SAME line, each word its own link.";

export default new Page({
	meta: import.meta,
	title: "D — breadcrumb",
	description: blurb,
	icon: "view_sidebar",

	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a stage owns the whole screen"); },

	preview(nav){ return this.preview_card(nav, () => div.c("sidebar variant-thumb", () => { header(); navPreview(Core); })); },

	render(){
		return this.view ??= div.c("page sidebar-variant-d topic flex fill hides-nav", () => {

			new Sidebar({ app: this.app, header, root: Core });

			div.c("pages", () => {
				div.c("default flow pad", () => {

					a("← Sidebar variants").href("/framework/core/Sidebar/variants/");

					p("Instead of picking one meaning for the top of the rail, this variant shows both: the logo goes all the way home, and a small breadcrumb beside it shows every stop in between.");

					blockquote("“There's like two different kind of go home, but how far home.”");

					h1("Core");

					p("This spells out A's own observation instead of picking one meaning for it: the logo alone always goes all the way home, and a small breadcrumb beside it — Framework › Core — shows every stop in between, each one its own link. Both marks share the same row the logo and word already had, in the rail's own text colour, underlined only on hover.");

					p("Trade-off: two links tell you exactly where you are, but there's less room for either word before it has to truncate than a single word (B/C) gets.");
				});
			});
		});
	},
});
