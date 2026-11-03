import { Blog } from "../Blog.js";
import { posts } from "../posts.js";

/* Container: the app region, whole viewport. Size: a 15em two-level rail beside the
   paper. Own layout: the wall. Regions: three. Preview: the default card.

   THE STATIC MULTI-LEVEL RAIL, and the point is that NOTHING here computes a state.
   Router.mark_links() stamps `.active` on the anchor whose pathname IS the url you
   are on and `.in-path` on every anchor that is a prefix of it — so the section
   lights up when you are inside it and the post lights up when you are on it, both
   derived from the address bar and unable to disagree with it.

   That only works because a post has ONE address, <candidate>/<section>/<post>/. A
   flat /<post>/ url has no ancestor for `in-path` to find, and the section heading
   would stay grey however deep you went — the file structure IS the active state.

   To see all three states at once, open a post:
   /imagine/blogx/rail/framework/layout-generators/ */

export default new Blog({
	meta: import.meta,
	title: "Two-level rail",
	description: "Sections over posts, with active and in-path both derived from the url — never computed, never stale.",
	icon: "list",

	rail(){ return this.deep_rail(); },
	aside(){ return this.topics_rail(); },

	content(){ this.wall(posts); },

	finding: "the right default for a blog with fewer than about forty posts - the whole archive is on screen, both states are free, and it stops scaling the moment a section needs its own scrollbar.",
});
