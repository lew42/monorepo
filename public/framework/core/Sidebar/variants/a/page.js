import { Page, Sidebar, div, a, img, h1, p, blockquote } from "/app.js";
import Framework from "/framework/page.js";
import navPreview from "../preview-nav.js";

/* Variant A — today. The logo always goes all the way home ("/"); the word
 * beside it is the site's own name, "Framework", and always points to
 * /framework/ — however many levels deep you are, both marks answer the
 * SAME question, "where is home", never "where am I". */
export function header(){
	return div.c("brand", () => {
		a(() => img().attr("src", Sidebar.favicon()).attr("alt", "")).href("/").ac("brand-logo");
		a(Framework.title).href(Framework.url).ac("brand-title");
	});
}

export const blurb = "Logo → home. Word → “Framework”, always. Never changes as you go deeper.";

export default new Page({
	meta: import.meta,
	title: "A — today",
	description: blurb,
	icon: "view_sidebar",

	// A stage owns the whole screen, like /layouts/labs/shells/Shell.js does —
	// mounted straight into app.$pages instead of nesting inside the real
	// /framework/ page's own (real) sidebar, so there is only ever ONE rail
	// on screen: the demo one this page builds.
	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a stage owns the whole screen"); },

	preview(nav){ return this.preview_card(nav, () => div.c("sidebar variant-thumb", () => { header(); navPreview(Framework); })); },

	render(){
		return this.view ??= div.c("page sidebar-variant-a topic flex fill hides-nav", () => {

			new Sidebar({ app: this.app, header, root: Framework });

			div.c("pages", () => {
				div.c("default flow pad", () => {

					a("← Sidebar variants").href("/framework/core/Sidebar/variants/");

					blockquote("“The pattern that we used before on the framework page is that the logo… links to the home page… And then the word framework next to it was kind of like… go back to the framework page. And so there's like two different kind of go home, but how far home.”");

					h1("Sidebar");

					p("This is today's rail, rebuilt here with the real Sidebar component: it looks the same on every page in the framework, however many levels deep you click into. The tree beside it is the real /framework/ tree — click into it and the rows fold open for real.");

					p("Trade-off: the word never changes, so it never has to worry about a long title or truncation — but it also never tells you which page you're actually on.");
				});
			});
		});
	},
});
