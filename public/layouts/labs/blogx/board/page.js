import { div, a, p } from "/app.js";
import { Blog } from "../Blog.js";
import { posts, sections, lead, series, when } from "../posts.js";

/* Container: the app region, whole viewport. Size: a 15em rail and a region grid of
   24em cells — five across at 3440, three at 1920, one at 400. Own layout: one
   auto-fill grid with 1px seams. Regions: two. Preview: the default card.

   THE DASHBOARD ANSWER: every region is a different WAY IN — by recency, by topic, by
   series, by where to start — and each one is nothing but links. The lead spans the
   whole first row so the front still has a front.

   ⚠ A region is a heading and a list, never a card: no radius, no shadow, no border.
     Five bordered cards in a row read as five apps; five ruled regions read as one
     page (the shells lab's inner-chrome rule, applied to a grid). */

const region = (title, fill, span_all) => div.c("blogx-region", () => {
	div.c("blogx-region-title", title);
	fill();
}).ac(span_all && "blogx-span");

export default new Blog({
	meta: import.meta,
	title: "Dashboard front",
	description: "Recent, topics, series and about as regions of one grid — four ways into the same eight posts.",
	icon: "dashboard",

	rail(){ return this.sections_rail(); },

	content(){
		div.c("blogx-board", () => {
			region("Latest", () => this.hero(lead), true);

			region("Recent", () => this.rows(posts.filter(post => post !== lead).slice(0, 5)));

			region("Topics", () => {
				div.c("blogx-chips", () => sections.forEach(section =>
					a.c("blogx-chip", section.title).href(this.section_url(section))));

				sections.forEach(section => p.c("blogx-dek", section.blurb));
			});

			region("In parts", () => this.rows(series));

			region("Start here", () => this.rows(posts.filter(post => post.read >= 8)));

			region("About", () => {
				p.c("blogx-dek", "One person, one framework, no build step. Every page on this site is a file you can open, and every import is a real url.");
				div.c("blogx-chips", () => ["Source", "Feed", "Contact"].forEach(label =>
					a.c("blogx-chip", label).href(this.url)));
				p.c("blogx-note", "Last post " + when(posts[0].date) + " - " + posts.length + " in total");
			});
		});
	},

	finding: "the most complete map and the weakest front page - four ways in beats one, but with every region equally loud there is nothing to read first, and the lead has to be given a whole row back to fix it.",
});
