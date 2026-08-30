import { Page, div, a, span, p, md } from "/app.js";
import { Blog } from "../Blog.js";
import { lead, when } from "../posts.js";

/* Container: the app region, whole viewport. Size: a 15em rail, a part strip that
   never moves, and a 42em reading region under it. Own layout: a flex column whose
   LAST BOX is a page region. Regions: three. Preview: the default card.

   THE SWAP ANSWER, and the part strip is PERSISTENT for real — it is drawn once and
   never rebuilt. The parts mount in `this.$pages`, a region belonging to the post,
   because core's container() walks up to the nearest ancestor holding one; so
   navigating between parts renders the part and nothing else, and Router.mark_links()
   slides `.active` along a strip that was never touched.

   That is the whole difference from the columns treatment next door. There, going to
   part two ADDS a column. Here it REPLACES a region, and everything around the region
   — the rail, the crumbs, the strip, your scroll position in all three — is untouched.

   ⚠ A part page has to draw itself. /imagine/ is a columns host, so an ordinary Page
     down here renders as a COLUMN of that row instead of a box in my region.
   ⚠ The overview is a plain div wearing `page … default`, not a Page: the arrangement
     contract shows a `.default` and blogx.css stands it down the moment a real part is
     routed beside it — the same shape Page.css uses for a default column. */

const Part = class BlogxSwapPart extends Page {
	render(){
		return this.view ??= div.c("page blogx-part", () => this.content());
	}
};

const Swap = class SwapBlog extends Blog {

	rail(){ return this.deep_rail(); }

	content(){
		this.strip();
		this.partnav();

		// ⚠ The region is captured SYNCHRONOUSLY and the default is built inside it —
		//   a page is only constructed when it activates, so an overview that was only
		//   marked would have nothing to show.
		this.$pages = div.c("blogx-part-body", () => div.c("page blogx-part default", () => {
			div.c("blogx-article", () => {
				this.eyebrow(lead);
				div.c("blogx-article-title", lead.title);
				p.c("blogx-lede", lead.dek);
				md(lead.body);
			});
		}));
	}

	partnav(){
		return div.c("blogx-partnav", () => {
			a.c("blogx-part-link").href(this.url).append(() => {
				span.c("blogx-part-n", "Overview");
				span.c("blogx-part-title", when(lead.date) + " · " + lead.read + " min");
			});

			lead.parts.forEach((part, i) => a.c("blogx-part-link").href(this.url + part.name + "/").append(() => {
				span.c("blogx-part-n", "Part " + (i + 1));
				span.c("blogx-part-title", part.title);
			}));
		});
	}
};

export default new Swap({
	meta: import.meta,
	title: "Parts in place",
	description: "One four-part post, one persistent strip, and a region that swaps — the nav is drawn once and never rebuilt.",
	icon: "swap_horiz",

	children: lead.parts.map(part => new Part({
		name: part.name,
		title: part.title,
		content(){
			div.c("blogx-article", () => {
				div.c("blogx-eyebrow", () => {
					span("Part " + (lead.parts.indexOf(part) + 1) + " of " + lead.parts.length);
					span.c("blogx-dot", "·");
					span(lead.title);
				});

				div.c("blogx-article-title", part.title);
				p.c("blogx-lede", part.dek);
				md(part.body);
			});
		},
	})),

	finding: "right when the parts are READ in order - one place to look, no sideways scroll, and it is the only treatment here that works unchanged at 400; it cannot show you two parts at once, which is exactly what the columns treatment is for.",
});
