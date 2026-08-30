import { Page, div, p, demo, md } from "/app.js";
import { Blog } from "../Blog.js";
import { sections, of_section, lead, rest } from "../posts.js";

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

const notes = new Page({
	title: "Notes",
	width: "small",
	initialize(){ this.columns(); },

	children: [
		{
			title: "Latest",
			width: "large",
			classes: "default",

			content(){
				div.c("blogx-hero", () => {
					div.c("blogx-eyebrow", "Newest");
					div.c("blogx-hero-title", lead.title);
					p.c("blogx-hero-dek", lead.dek);
				});
			},

			children: Object.fromEntries(rest.slice(0, 5).map(post => [post.title, { content(){ md(post.dek); md(post.body); } }])),
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

	finding: "the best use of a 3440 monitor and the worst front page - four columns of live content fill the screen with no wasted band, but you arrive at a rail rather than at a post, so it wants to be the ARCHIVE behind a front, not the front.",
});
