import { Page, Sidebar, div, a, img, h1, p, blockquote } from "/app.js";
import Framework from "/framework/page.js";
import Core from "/framework/core/page.js";
import Section from "/framework/core/Section/page.js";
import navPreview from "../preview-nav.js";

// Invented — a stand-in for a page whose real title runs long, so this
// variant has something to truncate. No real page on the site has a title
// this long today; that is the point.
const LONG_TITLE = "Section wrapper, catalog & generator overview";

// The word's own rule: a real SHORT name if the page has one — its own
// `short:` field, or (no page on the site sets one yet) its directory name
// — falling back to the full title only when neither exists. Sidebar.css's
// own ellipsis is what catches the rest: a short name that still runs long
// truncates exactly the way variant B's word already does.
function short_name(page){
	return page.short ?? page.name ?? page.title;
}

/* Variant C — like B, but the word is Section's own SHORT name ("Section",
 * its directory), not the long title. The long title still lives on the
 * page — the H1 below, and the tooltip on the word itself. */
export function header(){
	return div.c("brand", () => {
		a(() => img().attr("src", Sidebar.favicon()).attr("alt", "")).href(Framework.url).ac("brand-logo");
		a(short_name(Section)).href(Section.url).ac("brand-title").attr("title", LONG_TITLE);
	});
}

export const blurb = "Like B, but the word is a real short name (“Section”) with the long title as its tooltip.";

export default new Page({
	meta: import.meta,
	title: "C — short name",
	description: blurb,
	icon: "view_sidebar",

	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a stage owns the whole screen"); },

	preview(nav){ return this.preview_card(nav, () => div.c("sidebar variant-thumb", () => { header(); navPreview(Core); })); },

	render(){
		return this.view ??= div.c("page sidebar-variant-c topic flex fill hides-nav", () => {

			new Sidebar({ app: this.app, header, root: Core });

			div.c("pages", () => {
				div.c("default flow pad", () => {

					a("← Sidebar variants").href("/framework/core/Sidebar/variants/");

					blockquote("“I'm not sure how long page titles can get — there's not a lot of room in the left sidebar, especially if that kind of site name or whatever is pretty big text and we don't want to compete with the H1.”");

					h1(LONG_TITLE);

					p("The H1 says the full, imagined long title — “" + LONG_TITLE + "”. The word in the rail does NOT truncate that string; it's a real short name instead: Section's own page (“Section”, its directory name — a page's own `short:` field would win if it had one). Hover the word to see the full title in a tooltip.");

					p("Ellipsis truncation — what variant B's word would do to this same long title — is the fallback for a page with no short name and no `short:` field, not the plan.");

					p("Trade-off: a short name reads clean on every page, but someone has to write one for every page that needs it — truncation asks nothing of anyone and is always there as the fallback.");
				});
			});
		});
	},
});
