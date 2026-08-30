import { div, a, span, icon, p } from "/app.js";
import { Blog } from "../Blog.js";
import { posts, sections, of_section } from "../posts.js";

/* Container: the app region, whole viewport. Size: a 15em rail whose CONTENTS change
   with depth, beside the paper. Own layout: a wall, then a section index, then an
   article. Regions: three. Preview: the default card.

   THE DYNAMIC RAIL, and the mechanism is the framework's own — not a state machine.
   Every depth is already a different CLASS (Blog, Blog.Section, Blog.Post), each
   built by the Router as you walk down, so "what does the rail show here" is answered
   by which class you are standing in. One `rail()` per class, nothing computed:

     /dig/                          the three sections
     /dig/framework/                that section's five posts, and a way back up
     /dig/framework/layout-generators/   this post's four parts, then its neighbours

   The crumb strip at the top of the paper is derived from chain(), so the way back is
   never written down either.

   ⚠ A static part is inherited, not re-wired — but ONLY down its own branch.
     `Dig.Section` extends `Blog.Section`, so its `.Post` still resolves to `Blog.Post`
     and the third rail would silently be the second one. The two lines at the bottom
     are what put Dig's own classes back in the chain (code skill, parts as statics). */

// LEVEL 3 — shared by the post and by any part of it, because a part is still
// standing in the same place and the rail must not flicker between them.
const post_rail = page => div.c("blogx-rail", () => {
	a.c("blogx-back").href(page.parent.url).append(() => { icon("arrow_back"); span(page.parent.title); });

	if (page.post.parts) div.c("blogx-nav", () => {
		div.c("blogx-group", "In this post");
		page.post.parts.forEach((part, i) => page.nav_link((i + 1) + ". " + part.title, page.part_url(part)));
	});

	div.c("blogx-nav", () => {
		div.c("blogx-group", "More in " + page.parent.title);
		of_section(page.post.section).filter(post => post !== page.post)
			.forEach(post => page.nav_link(post.title, page.post_url(post)));
	});

	p.c("blogx-note", "Level 3 — the parts of this post, then its neighbours. The crumbs above are the way back.");
});

const Dig = class DigBlog extends Blog {
	rail(){
		return div.c("blogx-rail", () => {
			this.brand();

			div.c("blogx-nav", () => {
				div.c("blogx-group", "Sections");
				sections.forEach(section => this.nav_link(section.title, this.section_url(section), section.icon));
			});

			p.c("blogx-note", "Level 1 — three sections. Enter one and this rail becomes its posts.");
		});
	}

	content(){ this.wall(posts); }
};

Dig.Section = class DigSection extends Blog.Section {
	aside(){}

	rail(){
		return div.c("blogx-rail", () => {
			a.c("blogx-back").href(this.posts_at().url).append(() => { icon("arrow_back"); span("All sections"); });

			div.c("blogx-nav", () => {
				div.c("blogx-group", () => { icon(this.section.icon); span(this.section.title); });
				of_section(this.section.name).forEach(post => this.nav_link(post.title, this.post_url(post)));
			});

			p.c("blogx-note", "Level 2 — this section's posts. Open one and the rail becomes its parts.");
		});
	}

	content(){ this.strip(); super.content(); }
};

Dig.Post = class DigPost extends Blog.Post {
	aside(){}
	rail(){ return post_rail(this); }
	content(){ this.strip(); super.content(); }
};

Dig.Post.Part = class DigPart extends Blog.Post.Part {
	aside(){}
	rail(){ return post_rail(this.parent); }
	content(){ this.strip(); super.content(); }
};

Dig.Section.Post = Dig.Post;

export default new Dig({
	meta: import.meta,
	title: "Dynamic rail",
	description: "One rail, three contents: sections, then posts, then this post's parts — each one a class the Router already built.",
	icon: "account_tree",

	finding: "the answer for an archive that outgrows a two-level rail - the rail is never longer than one screen at any depth, and it costs one rail() per class because the Router has already built the class that knows what to show.",
});
