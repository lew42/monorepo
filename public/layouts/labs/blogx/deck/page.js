import { div, a, span, icon, p } from "/app.js";
import { Blog } from "../Blog.js";
import { lead, posts, when } from "../posts.js";

/* Container: the app region, whole viewport. Size: the rail is 0em on arrival and
   15em open — a grid track sized `auto` follows the rail's own width, so the slide is
   one number and nothing is positioned over anything. Own layout: one centred block,
   sized in `cqw` off the paper. Regions: three (the shut rail, the slide, the foot).
   Preview: the default card.

   THE DECK ANSWER: one post owns the screen, the way a title slide does. It is the
   best-looking candidate here and it fails the brief, which is worth having on record:
   with the rail shut there is no navigation above the fold at all, so the foot strip
   below is not decoration — it is the minimum a deck needs to stop being a dead end. */

export default new Blog({
	meta: import.meta,
	title: "Deck front",
	description: "The latest post as a full screen, nav slid away. Beautiful, and one click short of the brief.",
	icon: "slideshow",
	classes: "blogx-shut",

	rail(){ return this.deep_rail(); },

	content(){
		div.c("blogx-toggle", () => { icon("menu"); span("Notes"); })
			.on("click", () => this.view.tc("blogx-shut"));

		a.c("blogx-deck").href(this.post_url(lead)).append(() => {
			this.eyebrow(lead);
			div.c("blogx-rule");
			div.c("blogx-deck-title", lead.title);
			p.c("blogx-deck-dek", lead.dek);
			span.c("blogx-tag", "Read " + lead.parts.length + " parts");
		});

		div.c("blogx-partnav blogx-foot", () => posts.slice(1, 5).forEach(post =>
			a.c("blogx-part-link").href(this.post_url(post)).append(() => {
				span.c("blogx-part-n", when(post.date));
				span.c("blogx-part-title", post.title);
			})));
	},

	finding: "the best composition and the worst overview - a shut rail means zero navigation above the fold, so the four links along the floor are load-bearing rather than decorative; right for a launch page, wrong for a blog front.",
});
