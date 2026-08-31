import { Page, View, md, toc, div, a, span, time, h1, img, is } from "/app.js";
import { post, section, section_url, under_blog, url, dated, reading, next_post } from "./posts.js";

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
	 * `<section>/<name>` it was imported from — before Page's constructor runs
	 * `naming()` and `declare()`, both of which need `title` and `parts` assigned.
	 * ⚠ The entry goes in FIRST: later args win, so a page.js can still override one
	 *   field without the manifest stopping being the default. A post in parts whose
	 *   entry has no `parts:` yet declares them in its own two-line page.js. */
	constructor(...args){
		const seed = Object.assign({}, ...args);
		const path = under_blog(seed.meta).join("/");

		super(post(path) ?? Post.unlisted(path), ...args);
	}

	// A post nobody added to the manifest still renders — it just says so, rather than
	// throwing inside the route walk, where the message would be a blank page.
	static unlisted(path){
		console.warn(`blog/${path} — no entry in posts.js: no date, no description, no meta tags.`);
		return { name: path.split("/").at(-1), section: path.split("/")[0], unlisted: true };
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

			/* Moving between parts does not re-run `content()` — the view is already
			 * built — so the rail would still list the part you left. `deactivated` too:
			 * going UP to the post itself activates nothing, so leaving is the only
			 * event there is (the lesson `Page.deactivate()` records for columns). */
			activated(){ post.after_prose(); },
			deactivated(){ post.after_prose(); },
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
			/* ⚠ `return this.read()`, and the missing word cost every SINGLE-PART post its
			 *   prose, silently. A multi-part post's `read()` renders a child Page, which
			 *   appends itself to the captor as a side effect — so the bug was invisible on
			 *   the only post that existed. A one-part post returns the `md.file()` PROMISE,
			 *   and a promise the callback drops on the floor is never appended: no error,
			 *   no 404, an empty column. A block-bodied arrow inside a factory must return. */
			this.$pages = div.c("blog-read", () => {
				this.head();

				/* ⚠ CREATED HERE, FILLED LATER, and both halves are forced. Created here
				 *   because a factory needs a captor and `after_prose()` runs in a bare
				 *   macrotask; filled later because `read()` returns a PROMISE for a
				 *   single-part post — `View.append_promise` appends whenever it resolves,
				 *   so anything built synchronously after it lands ABOVE the prose.
				 *   `next_up()` moves this box to the end (`el.append` on a node already
				 *   in the tree is a move) once there is prose for it to follow. */
				this.$next = div.c("blog-next");

				return this.read();
			});

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
			if (this.image && this.lead) this.lead_image();
		});
	}

	/* THE LEAD — the post's own picture, in the exhibit track beside the title.
	 * It is the SAME `image:` the manifest hands to `og:image`, so the card a link
	 * unfurls into and the thing at the top of the post cannot disagree, and nobody
	 * maintains two pictures.
	 * ⚠ OPT-IN (`lead: true`), because most posts' `image:` is a screenshot their own
	 *   prose already shows in context — drawn here as well it is the same picture
	 *   twice, once without the sentence that explains it.
	 * ⚠ `lead_image()`, not `lead()`: `lead: true` is a FIELD, and a field silently
	 *   shadows a method of the same name (`opens` did this in core). */
	// ⚠ `alt` before `title`: the manifest carries a line describing the PICTURE now (it
	//   is what `og:image:alt` says), and the title describes the post. A screen reader
	//   hearing the title twice learns nothing the heading above did not already say.
	lead_image(){
		return div.c("blog-lead", () => img().attr("src", this.image).attr("alt", this.alt ?? this.title));
	}

	/* ⚠ `reading(this)` is asked of the MANIFEST ENTRY, not of this page — a Post is
	 *   assigned its entry's fields, so `slug()` finds it either way, and asking the
	 *   manifest keeps one lookup for the byline, the card and the hero. Empty when the
	 *   post has not been counted yet (`words.js`), and an empty string draws nothing
	 *   rather than "0 min read". */
	byline(){
		return div.c("blog-byline", () => {
			if (this.date) time.c("blog-date", dated(this.date)).attr("datetime", this.date);
			if (this.parts) span.c("blog-parts-count", Object.keys(this.parts).length + " parts");
			if (reading(this)) span.c("blog-minutes", reading(this));
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
		setTimeout(() => { this.skip_closed_parts(); this.next_up(); this.$toc?.empty(() => toc()); this.watch_pin(); });
	}

	/* ══ THE READING PATH — what is at the BOTTOM of a post ═══════════════════
	   A post used to end at a rail of back-links: "all Framework posts", "the blog".
	   Both of those are up, and up is where a reader goes when there is nothing forward.
	   This is forward — the next part if the post has one, else the next post in the
	   archive, else the front. Nothing here is stored: the order is `listed()`'s and the
	   parts' is the manifest's, so adding a post re-links the chain on both sides of it.

	   ⚠ Rebuilt on every `after_prose()`, which is also fired by a part activating and
	     deactivating (see `part_pages()`) — moving between parts does not re-run
	     `content()`, so a footer drawn once would keep offering part two from part three.
	   ⚠ `el.append` MOVES a node that is already in the tree. That is the whole trick:
	     the box was created before the prose promise resolved, so this is what puts it
	     after it — and it is idempotent, so a second call is not a second box. */
	next_up(){
		const box = this.$next;

		if (!box) return;
		this.$pages.el.append(box.el);

		const to = this.next_part() ?? this.next_read();

		box.empty(() => a.c("blog-next-link").href(to.url).append(() => {
			span.c("blog-eyebrow", to.eyebrow);
			span.c("blog-next-title", to.title);
			if (to.meta) span.c("blog-next-meta", to.meta);
			if (to.dek) div.c("blog-next-dek", to.dek);
		}));
	}

	/* The part after the one on screen — "routed to, or else the default one", the same
	 * test `skip_closed_parts()` makes, asked of the pages rather than of the DOM. */
	open_part(){
		const open = page => page?.view?.el.matches(".active-page, .active-ancestor");
		return this.parts && ([...this.children.values()].find(open) ?? this.part_default());
	}

	next_part(){
		const parts = [...(this.children?.values() ?? [])];
		const after = parts[parts.indexOf(this.open_part()) + 1];

		if (!after) return null;

		const nav = this.nav_for(after.name);
		return { url: nav.url, title: nav.label, eyebrow: "Next in this post" };
	}

	/* The next post, or the front. `Post.wall` says the same three things about a post
	 * — where it is filed, how long it is, what it is about — so this reads as the card
	 * it is a link to. The last post gets the front, because "keep reading" with nothing
	 * left to read is worse than saying so. */
	next_read(){
		const next = next_post(this);

		if (!next) return { url: "/blog/", title: "Back to the blog", eyebrow: "That is the archive, for now" };

		return {
			url: url(next),
			title: next.title,
			eyebrow: "Next post",
			meta: [section(next.section)?.title, reading(next)].filter(Boolean).join(" · "),
			dek: next.description,
		};
	}

	/* THE PINNED FIRST EXHIBIT — the one thing on this page that has to be MEASURED.
	 * Above 130em blog.css lifts the first exhibit into the head's empty exhibit track,
	 * which means taking it out of flow — and a positioned box is not in the float chain,
	 * so the next exhibit's `clear: right` has nothing to clear. Measured at 3440 the two
	 * overlapped by 128px on /blog/systems/panel-playground/ and 116px on
	 * /blog/ai/claude-tooling/. The test is "is the pinned box taller than the run of
	 * prose above the next one" — two rendered heights — and no selector can ask that, so
	 * CSS pins and this stands the pin down where it would collide. The posts it skips are
	 * the ones whose exhibit already opens above the fold.
	 * ⚠ A ResizeObserver, not this macrotask: a page is built DETACHED, so the first
	 *   measurement here is all zeros. It also has to run again when the column changes
	 *   width or a picture finishes loading, both of which change the pinned height.
	 *   Observing the EXHIBIT is what keeps this out of a resize loop — the class changes
	 *   where that box sits, never how big it is. */
	watch_pin(){
		const exhibit = this.$pages?.el.querySelector(".blog-prose > .blog-exhibit");

		if (!exhibit || exhibit === this.pinned) return;
		this.pinned = exhibit;

		(this.pin_watch ??= new ResizeObserver(() => this.check_pin())).disconnect();
		this.pin_watch.observe(exhibit);
	}

	/* ⚠ ALWAYS MEASURE PINNED. Stood down, the second exhibit clears the first and the
	 *   two never overlap — so testing the stood-down layout says "safe", the pin goes
	 *   back on, and the post flickers between the two forever. */
	check_pin(){
		const read = this.$pages?.el;
		const [first, second] = read?.querySelectorAll(".blog-prose > .blog-exhibit") ?? [];

		read?.classList.remove("blog-pin-off");
		if (first && second) read.classList.toggle("blog-pin-off",
			first.getBoundingClientRect().bottom > second.getBoundingClientRect().top);
	}

	/* ⚠ EVERY part stays in the DOM — `@layer util` only stops a closed one PAINTING —
	 *   and `toc()` scans the whole enclosing `.page`, so the rail listed part one's
	 *   headings above part two's. `.toc-skip` is ext/toc's own opt-out.
	 * ⚠ Asked of the CLASSES, not of `offsetParent`: a page is built DETACHED, so on a
	 *   cold load every part measures as hidden and the one actually on screen was
	 *   skipped. This is `blog.css`'s visibility rule said in JS — the same "routed, or
	 *   else the default one" test — so the two cannot disagree. */
	skip_closed_parts(){
		const parts = [...(this.$pages?.el.querySelectorAll(":scope > .page") ?? [])];
		const open = el => el.matches(".active-page, .active-ancestor");
		const routed = parts.some(open);

		parts.forEach(el => el.classList.toggle("toc-skip",
			routed ? !open(el) : !el.classList.contains("default")));
	}

	/* Where to go next, and both links are REAL pages: the section this post is filed
	 * under and the front. `section()` rather than `this.parent` so the label says
	 * which section — a rail that only says "up" makes the reader remember. */
	more(){
		const filed = section(this.section);

		return div.c("blog-more", () => {
			span.c("blog-rail-title h4", "More");
			if (filed) a.c("blog-more-link", "All " + filed.title + " posts").href(section_url(filed));
			a.c("blog-more-link", "The blog").href("/blog/");
		});
	}

	/* ══ A POST SEEN FROM OUTSIDE — statics, because the caller has a manifest ENTRY
	   and not a Post. The front and the three section indexes both draw these, and
	   drawing them from the class keeps one description of what a post looks like.

	   ⚠ `.page-previews` / `.page-preview` are Page.css's own card wall — the same
	     arrangement /framework/ and the homepage use, so the blog does not introduce a
	     second kind of card to the site. Only the byline is the blog's own, and
	     `--column` is set by blog.css, which is the only thing that knows the room. */
	/* ⚠ ONE meta line, not two: the date used to sit on its own line under the title and
	 *   the length would have been a third row of small grey type in a card that is four
	 *   rows tall. `<time>` keeps the machine-readable date, and the length rides beside
	 *   it — the two facts a reader weighs a card on, on one line. */
	static card(post){
		return a.c("page-preview").href(url(post)).append(() => {
			span.c("page-preview-title", post.title);

			div.c("blog-card-meta", () => {
				time(dated(post.date)).attr("datetime", post.date);
				if (reading(post)) span(reading(post));
			});

			div.c("page-preview-desc", post.description);
		});
	}

	static wall(list){ return div.c("page-previews bleed", () => list.forEach(post => this.card(post))); }

	/* THE LEAD, as the composition it deserves: display type, the dek, and the whole
	 * block is the link. Sized in `cqw` off its OWN box, so the hero is the same
	 * fraction of a 900px band as of a 400px phone — never sized off the viewport. */
	static hero(post){
		return a.c("blog-hero").href(url(post)).append(() => {
			div.c("blog-eyebrow", () => {
				span(section(post.section)?.title ?? post.section);
				span.c("blog-dot", "·");
				span(dated(post.date));

				if (reading(post)){ span.c("blog-dot", "·"); span(reading(post)); }
			});

			div.c("blog-hero-title", post.title);
			div.c("blog-hero-dek", post.description);
		});
	}
}

export default Post;
