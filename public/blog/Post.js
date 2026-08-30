import { Page, View, md, toc, div, a, span, time, h1, img, is } from "/app.js";
import { post, dated } from "./posts.js";

View.stylesheet(import.meta, "blog.css");

/**
 * A blog post — a Page that knows how to be READ.
 *
 * A post's own `page.js` is two lines. What a post SAYS ABOUT ITSELF lives in
 * `posts.js`; what it SAYS lives in `.md` files beside it. This class is the seam
 * between them, plus the one shape the three questions in
 * `framework/ai/2026-08-30/blog-arch/` were asked about:
 *
 *   head    crumbs, title, byline — short, because the fold is the ask
 *   read    the measure, hard LEFT (doc/reading-page.md)
 *   exhibit anything wider than prose, in the space beside it — set by blog.css
 *   rail    the parts and the ToC, so the right edge is never bare
 *
 * doc/structure.md · doc/meta-tags.md · doc/reading-page.md
 */
export class Post extends Page {

	/* The manifest is the only copy of the metadata, so a Post looks ITSELF up by the
	 * directory it was imported from — before Page's constructor runs `naming()` and
	 * `declare()`, both of which need `title` and `parts` already assigned.
	 * ⚠ The entry goes in FIRST: later args win, so a page.js can still override one
	 *   field without the manifest stopping being the default. */
	constructor(...args){
		const seed = Object.assign({}, ...args);
		const slug = new URL(".", seed.meta.url).pathname.split("/").filter(Boolean).at(-1);

		super(post(slug) ?? Post.unlisted(slug), ...args);
	}

	// A post nobody added to the manifest still renders — it just says so, rather than
	// throwing inside the route walk, where the message would be a blank page.
	static unlisted(slug){
		console.warn(`blog/${slug} — no entry in posts.js: no date, no description, no meta tags.`);
		return { slug, unlisted: true };
	}

	// ── the parts ────────────────────────────────────────────────────────────
	// `parts: { "<stem>": "<Title>" }` becomes real child Pages at
	// /blog/<slug>/<stem>/, each rendering <stem>.md. Declared, never crawled.
	declare(){
		if (this.parts) this.children = this.part_pages();
		return super.declare();
	}

	part_pages(){
		const meta = this.meta, post = this;

		return Object.entries(this.parts).map(([name, title], i) => ({
			name, title,

			/* ⚠ `default` on the first part — the arrangement contract's own word for
			 *   "shown without being routed to". Landing on /blog/<slug>/ has to open part
			 *   one, or a post is a table of contents. blog.css stands it down the moment a
			 *   real part activates, the same rule Page.css writes for columns. */
			classes: "blog-part" + (i ? "" : " default"),

			content(){ return post.prose(md.file(meta, name + ".md", { h1: false })); },
		}));
	}

	part_default(){ return [...this.children.values()].find(p => p?.classes?.includes("default")); }

	// ── the shape ────────────────────────────────────────────────────────────
	render(){
		if (this.view) return this.view;

		this.view = div.c("page blog-post", () => div.c("blog-body", () => {

			/* The head is INSIDE the reading column, not above the row — so the rail
			 * starts level with the title and the parts are on screen before you have
			 * scrolled anything. Above the fold is the ask (`ai/2026-08-30/blog-program`).
			 * This box is also the region the parts mount in: `container()` walks up for
			 * the nearest `$pages`, so a part lands here without either page naming the
			 * other, and it appends AFTER the head. */
			this.$pages = div.c("blog-read", () => { this.head(); this.read(); });

			this.rail();
		}));

		return this.view;
	}

	head(){
		return div.c("blog-head", () => {
			this.crumbs(this.parent);
			h1.c("page-title", this.title);
			this.byline();
			if (this.description) div.c("blog-standfirst", this.description);
			if (this.image) this.lead();
		});
	}

	/* THE LEAD — the post's own picture, in the exhibit track beside the title.
	 * It is the SAME `image:` the manifest hands to `og:image`, so the card a link
	 * unfurls into and the thing at the top of the post cannot disagree, and nobody
	 * maintains two pictures. */
	lead(){
		return div.c("blog-lead", () => img.attr("src", this.image).attr("alt", this.title));
	}

	byline(){
		return div.c("blog-byline", () => {
			if (this.date) time.c("blog-date", dated(this.date)).attr("datetime", this.date);
			if (this.parts) span.c("blog-parts-count", Object.keys(this.parts).length + " parts");
		});
	}

	/* ⚠ A page marked `default` is never ROUTED to, so nothing would ever build it —
	 *   the host has to, and has to hand it `app` while it does. Same trap
	 *   `Page.render_column()` documents: a default page's `app` is still the undefined
	 *   it was adopted with at module scope, and its content throws on `this.app.…`. */
	read(){
		if (this.parts) return this.part_default()?.assign({ app: this.app }).render();

		return is.fn(this.content) ? this.content() : this.prose(md.file(this.meta, "post.md", { h1: false }));
	}

	/* One markdown file, dressed as the two-track reading grid (blog.css). The class
	 * is added HERE rather than by every caller: `md.file()` builds the box, so this
	 * is the only place that has one to name. */
	prose(loading){
		return loading.then(view => view.ac("blog-prose")).finally(() => this.after_prose());
	}

	/* THE RIGHT-HAND RAIL — the reason the freed space is not dead space.
	 * `.rail` is the framework's own side-region word (Page.css): sticky, its own
	 * scrollport, and a full-width strip below 38em, with nothing restated here. */
	rail(){
		return div.c("rail blog-rail", () => {
			if (this.parts) this.parts_nav();
			this.$toc = div.c("blog-toc");
			this.more();
		});
	}

	parts_nav(){
		const names = [...this.children.keys()];

		return div.c("blog-parts", () => {
			span.c("blog-rail-title h4", "This post");

			names.forEach((name, i) => {
				const nav = this.nav_for(name);

				a.c("blog-part-link").href(nav.url).append(() => {
					span.c("blog-part-n", i + 1);
					span.c("blog-part-label", nav.label);
				});
			});
		});
	}

	/* The post's own headings, once the prose has actually landed.
	 * ⚠ `setTimeout`, not `queueMicrotask`: the markdown is appended by
	 *   `View.append_promise` in a microtask queued AFTER this one, so a microtask here
	 *   reads an empty region and `toc()` deletes itself. A macrotask cannot lose that
	 *   race. Called from `.finally()` so a 404'd part still refreshes the rail. */
	after_prose(){
		setTimeout(() => this.$toc?.empty(() => toc()));
	}

	more(){
		return div.c("blog-more", () => {
			span.c("blog-rail-title h4", "More");
			a.c("blog-more-link", "All posts").href(this.parent?.url ?? "/blog/");
		});
	}
}

export default Post;
