import { Page, div, a, p, demo, md } from "/app.js";
import { Blog } from "../Blog.js";
import { sections, section_of, of_section, lead, rest } from "../posts.js";

/* Container: the app region, whole viewport. Size: the paper is a full-height columns
   row — a 14em `small` rail, a `hug` section list, a 40em post, a 40em part. Own
   layout: core's column row, one call. Regions: two, and the second is a whole Page
   tree. Preview: the default card.

   THE FINDER ANSWER: a blog is a tree, so browse it as one. Nothing here is written —
   `columns()` is the whole opt-in, `width` is one word per level, and `classes:
   "default"` is what makes the row arrive with something open instead of 93% grey.

   ⚠ A real columns host CANNOT be nested under /imagine/: `column_host()` returns the
     SHALLOWEST columnar ancestor and /imagine/ is already one. `demo.app()` is a whole
     Page tree playing App and Router in a box, and it is the way — a separate tree
     with its own root is exactly what "a row inside a shell" means.
   ⚠ Opened AT a page, not at the root: DemoApp.mark() strips every `.default` in its
     region and re-marks only the shown page's own chain, so a default column is open
     only if it is IN that chain.
   ⚠ A `hug` column is its max-content width, and the max-content width of a PARAGRAPH
     is the paragraph on one line — so the section columns carry a list and no prose. */

const post_page = post => new Page({
	title: post.title,
	content(){
		md("*" + post.dek + "*");
		md(post.body);
	},
	children: (post.parts ?? []).map(part => new Page({
		title: part.title,
		content(){ md("*" + part.dek + "*"); md(part.body); },
	})),
});

/* ⚠ The tree's root title IS its address (`Blogx Notes` → /blogx-notes/), and it has
   to be one nothing on the site owns: DemoApp intercepts a click only when the link's
   pathname starts with the root url, so a tree titled `Notes` would ship anchors to
   the site's real /notes/ that only JavaScript is stopping. */
const notes = new Page({
	title: "Blogx Notes",
	label: "Notes",
	initialize(){ this.columns(); },

	children: [
		/* ⚠ `fill`, and it is the one word this page turns on. A column browser that
		   arrives showing only its rail leaves 80–93% of the row grey (measured,
		   core/Page/doc/columns.md); `fill` takes everything the rails did not, and a
		   WALL is exactly the content that earns it — the ceiling is removed for a grid,
		   never for prose. So the finder arrives as a front and becomes an archive as
		   you dig: opening a section stands this column down, because `default` means
		   "shown until something real opens". */
		{
			title: "Latest",
			width: "fill",
			classes: "default blogx-latest",

			content(){
				a.c("blogx-hero bleed").href(inside(lead)).append(() => {
					div.c("blogx-eyebrow", "Newest");
					div.c("blogx-hero-title", lead.title);
					p.c("blogx-hero-dek", lead.dek);
				});

				div.c("blogx-wall bleed", () => rest.forEach(post => a.c("blogx-card").href(inside(post)).append(() => {
					div.c("blogx-eyebrow", section_of(post.section).title);
					div.c("blogx-card-title", post.title);
					p.c("blogx-dek", post.dek);
				})));
			},
		},

		...sections.map(section => new Page({
			title: section.title,
			icon: section.icon,
			width: "hug",
			children: of_section(section.name).map(post_page),
		})),
	],
});

export default new Blog({
	meta: import.meta,
	title: "Columns",
	description: "The blog browsed as the tree it is — sections, posts, parts, each a column opening to the right.",
	icon: "view_column",

	rail(){ return this.sections_rail(); },

	main(){
		return div.c("blogx-main blogx-stage", () => {
			demo.app(notes.children.get("latest")).ac("blogx-app");
		});
	},

	finding: "one shell that is a front AND an archive - `fill` gives the wall the whole row on arrival, and digging stands it down for a rail-section-post-part row; the cost is that the front and the archive are never on screen together.",
});

/* A post's address INSIDE the demo tree. Derived from the same two titles the tree is
   built from, so a card and the column it opens cannot drift apart. */
function inside(post){
	return notes.url + Page.slug(section_of(post.section).title) + "/" + Page.slug(post.title) + "/";
}
