import { Page, View, div, p, a, span, icon, img, md } from "/app.js";
import { posts, sections, section_of, find, when } from "./posts.js";

View.stylesheet(import.meta, "blogx.css");

/**
 * Blog — one blog shell, at its own url, wearing the whole screen.
 *
 *     export default new Blog({
 *         meta: import.meta,
 *         title: "Magazine front",
 *         rail(){ return this.sections_rail(); },
 *         content(){ this.hero(lead); this.wall(rest); },
 *         finding: "the one line this candidate is for",
 *     });
 *
 * Declare the regions you have — rail() aside() — and the one grid in blogx.css
 * drops each into its area. A region you don't declare costs an `auto` track of
 * 0px, so every candidate is the same template (the shells lab's finding, reused).
 *
 * ⚠ A blog shell is NOT a column. /imagine/ is a columns host and column_host()
 *   returns the SHALLOWEST columnar ancestor, so a page down here renders as a
 *   column of that row unless it draws itself. container() + render() are the
 *   escape; demo.app() is the only way to put a real columns row back inside one.
 *
 * ⚠ EVERY POST HAS A REAL URL UNDER EVERY CANDIDATE. route() claims any name that
 *   is a post, so /imagine/blogx/front/layout-generators/ cold-loads — the card
 *   wall is content-as-navigation for real, not a wall of dead rectangles.
 */
export class Blog extends Page {

	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a blog shell is its own screen"); }

	// The card on the lab's own index is a REAL STILL of this shell, not the icon
	// it wore before (2026-09-05 ux-rethink). Eight different icons (newspaper,
	// dashboard, slideshow, view_column, list, account_tree, view_week,
	// swap_horiz) all just said "here is a page" — a stranger could not tell a
	// hero-plus-wall front from a rail-driven archive without opening both, on a
	// realm whose ENTIRE subject is what the layout looks like. A screenshot does
	// the choosing a name and an icon cannot — the same finding as design, shells
	// and decks. The slug is read off the child's own url, never typed twice, so
	// a renamed candidate can't point at a stale file. `Blog.Section`/`.Post`/
	// `.Part` inherit this too, but nothing on the site calls `previews()` over
	// one of those — only the index's eight children ever render through it.
	// Regenerate a still: headless screenshot, viewport 960x600, of
	// `http://localhost:8110/imagine/blogx/<slug>/`, saved to `shots/<slug>.jpg`.
	preview(nav){
		const slug = nav.url.replace(/\/$/, "").split("/").pop();

		return this.preview_card(nav, () => img().attr("src", `/imagine/blogx/shots/${slug}.jpg`).attr("alt", `The ${nav.label ?? nav.title} shell`).attr("loading", "lazy")
			.style({ width: "100%", height: "100%", objectFit: "cover" }));
	}

	// `hides-nav` (/styles.css) takes the site's strip away: the blog's own rail IS
	// the navigation, and a second site rail beside it is two rails saying different
	// things. That is the first verdict this lab reaches.
	render(){
		return this.view ??= div.c("page blogx hides-nav", () => {
			this.rail?.();
			this.main();
			this.aside?.();
			this.lab_bar();
		}).ac(this.classes);
	}

	main(){ return div.c("blogx-main", () => this.content()); }

	// ── every post is a page ────────────────────────────────────────────────
	// route() is consulted for UNDECLARED names only, so a candidate that declares
	// its own children keeps them and still gets every post for free.
	// ⚠ A SECTION, never a post: two urls for one post is what you get if a front
	//   claims post names too, and the rail's `in-path` mark then has no ancestor to
	//   light up. One post, one address: <candidate>/<section>/<post>/.
	route(name){
		const section = section_of(name);
		if (section) return new this.constructor.Section({ section, title: section.title, finding: this.finding });
	}

	// The page post urls hang off — MINE on a front, and recursively my parent's on
	// anything the front routed to, so a rail drawn three levels down still points at
	// the same eight addresses.
	posts_at(){ return this; }
	post_url(post){ return this.posts_at().url + post.section + "/" + post.name + "/"; }
	section_url(section){ return this.posts_at().url + section.name + "/"; }

	// ── the lab's own chrome — a floor, never a header ──────────────────────
	// It spans under both rails and costs ~2% of a 1440-tall screen, so the fold
	// above it is the candidate's, undiluted. A bar at the TOP would take the one
	// band every one of these compositions is competing for.
	lab(){ return this.chain().find(page => page.name === "blogx"); }

	lab_bar(){
		const lab = this.lab();
		if (!lab) return;

		return div.c("blogx-lab", () => {
			a.c("blogx-lab-home").href(lab.url).append(() => { icon("arrow_back"); span("blogx"); });

			lab.children.forEach((child, name) => a.c("blogx-lab-link", child?.title ?? name).href(lab.url + name + "/"));

			if (this.finding) span.c("blogx-lab-verdict", this.finding);
		});
	}

	// ── the rails ───────────────────────────────────────────────────────────
	brand(){
		return a.c("blogx-brand").href(this.lab()?.url ?? "/").append(() => {
			span.c("blogx-mark", "lew42");
			span.c("blogx-sub", "notes on a framework");
		});
	}

	// One level: the three sections. The rail every front uses.
	sections_rail(){
		return div.c("blogx-rail", () => {
			this.brand();

			div.c("blogx-nav", () => sections.forEach(section => this.nav_link(section.title, this.section_url(section), section.icon)));

			// ⚠ No "Elsewhere / About / Feed" group, and it is not an omission. Written
			//   as `#about` anchors those three links resolve to the page you are ON, so
			//   Router.mark_links() marked all three `.active` on every screen — three
			//   permanent false actives beside the one real one. A rail says only what
			//   it can point at; About lives in the topics rail, where it has a page.
		});
	}

	// Two levels: sections, each with its posts. Router.mark_links() stamps
	// `.active` on the url you are on and `.in-path` on every ancestor of it, so
	// both states are DERIVED and cannot disagree with the address bar.
	deep_rail(open = true){
		return div.c("blogx-rail", () => {
			this.brand();

			sections.forEach(section => div.c("blogx-nav", () => {
				a.c("blogx-group").href(this.section_url(section)).append(() => { icon(section.icon); span(section.title); });

				if (open) posts.filter(post => post.section === section.name)
					.forEach(post => this.nav_link(post.title, this.post_url(post)));
			}));
		});
	}

	// The right-hand rail — topics, the series, and who wrote this. Content as
	// navigation: every line in it is a link to something that exists.
	topics_rail(){
		return div.c("blogx-aside", () => {
			div.c("blogx-nav", () => {
				div.c("blogx-group", "Topics");
				div.c("blogx-chips", () => sections.forEach(section =>
					a.c("blogx-chip", section.title + " " + posts.filter(p => p.section === section.name).length).href(this.section_url(section))));
			});

			div.c("blogx-nav", () => {
				div.c("blogx-group", "In parts");
				posts.filter(post => post.parts).forEach(post => this.nav_link(post.title, this.post_url(post)));
			});

			div.c("blogx-nav", () => {
				div.c("blogx-group", "About");
				p.c("blogx-note", "One person, one framework, no build step. Everything here runs in the browser as it is written.");
			});
		});
	}

	// The trail from the candidate root to me, one link per page — DERIVED from
	// chain(), so it cannot be wrong and nothing has to be kept in step.
	strip(){
		const chain = this.chain(), from = chain.indexOf(this.posts_at());

		// ⚠ `a.c(class, text)`, never `a.href(…)`: the exported `a` is a FACTORY, and
		//   only the View it builds has the chaining methods.
		return div.c("blogx-strip", () => chain.slice(Math.max(from, 0)).forEach((page, i) => {
			if (i) icon("chevron_right");
			a.c("blogx-crumb", page.title).href(page.url);
		}));
	}

	nav_link(label, href, ico){
		return a.c("blogx-link").href(href).append(() => {
			if (ico) icon(ico);
			span.c("blogx-link-label", label);
		});
	}

	// ── the pieces every candidate composes from ────────────────────────────
	eyebrow(post){
		return div.c("blogx-eyebrow", () => {
			span(section_of(post.section)?.title ?? post.section);
			span.c("blogx-dot", "·");
			span(when(post.date));
			span.c("blogx-dot", "·");
			span(post.read + " min");
		});
	}

	// The lead, as the composition it deserves: display type, a dek, and the whole
	// block is the link. Sized in `cqw` off its own area, so it is the same fraction
	// of a 3440 band as of a 400 one (the screens lab's finding).
	hero(post){
		return a.c("blogx-hero").href(this.post_url(post)).append(() => {
			this.eyebrow(post);
			div.c("blogx-hero-title", post.title);
			p.c("blogx-hero-dek", post.dek);
			if (post.parts) span.c("blogx-tag", post.parts.length + " parts");
		});
	}

	// ⚠ `post_card`, NOT `card`: `card` is a FIELD core reads back in nav() and hands
	//   to `.ac()` as a class name, so a method by that name reached View.ac() as a
	//   function and every preview on the index died on `arg.split is not a function`.
	//   The same family as `opens` shadowing `opens()` in core (doc/columns.md).
	post_card(post){
		return a.c("blogx-card").href(this.post_url(post)).append(() => {
			this.eyebrow(post);
			div.c("blogx-card-title", post.title);
			p.c("blogx-dek", post.dek);
			if (post.parts) span.c("blogx-tag", post.parts.length + " parts");
		});
	}

	// A wall of cards. `--column` is set by the sheet, not here: the same call has to
	// give one column at 400 and five at 3440, and only the container knows the room.
	wall(list){ return div.c("blogx-wall", () => list.forEach(post => this.post_card(post))); }

	// The compact form — a rail, a region, a column. Title, dek, one meta line.
	rows(list){
		return div.c("blogx-rows", () => list.forEach(post => a.c("blogx-row").href(this.post_url(post)).append(() => {
			div.c("blogx-row-title", post.title);
			div.c("blogx-row-meta", () => { span(when(post.date)); span(post.parts ? post.parts.length + " parts" : post.read + " min"); });
		})));
	}

	// ── an open post ────────────────────────────────────────────────────────
	article(post, body = post.body){
		return div.c("blogx-article", () => {
			this.eyebrow(post);
			div.c("blogx-article-title", post.title);
			p.c("blogx-lede", post.dek);
			md(body);
			if (post.real) this.real_link(post);
		});
	}

	// One honest link out of the mock and into the post that actually got written —
	// only the entries in posts.js carrying `real` show it, so most posts show nothing.
	real_link(post){
		return a.c("blogx-real").href("/blog/" + post.real + "/").append(() => {
			icon("open_in_new");
			span("Read the real post");
		});
	}
}

/* The page every post url lands on. A static part on the constructor, so a
   candidate with its own treatment declares `static Post = class …` and the whole
   machine travels down its branch — nothing to wire (code skill §3). */
/* A section index. The rail's top level has to lead somewhere real, or
   "content as navigation" is a claim the mock cannot keep. */
Blog.Section = class BlogSection extends Blog {
	posts_at(){ return this.parent.posts_at(); }
	rail(){ return this.deep_rail(); }
	aside(){ return this.topics_rail(); }

	route(name){
		const post = find(name);
		if (post?.section === this.section.name)
			return new this.constructor.Post({ post, title: post.title, finding: this.finding });
	}

	content(){
		div.c("blogx-head", () => {
			div.c("blogx-eyebrow", "Section");
			div.c("blogx-article-title", this.section.title);
			p.c("blogx-lede", this.section.blurb);
		});

		this.wall(posts.filter(post => post.section === this.section.name));
	}
};

Blog.Post = class BlogPost extends Blog {
	posts_at(){ return this.parent.posts_at(); }
	rail(){ return this.deep_rail(); }
	aside(){ return this.topics_rail(); }

	// ⚠ The measure is 42em and stays 42em at 3440. What fills the rest is the parts
	//   strip, the neighbours rail and the topics rail — MORE columns, never a wider
	//   one. A single post is the one screen in this lab that cannot fill a 3440
	//   monitor honestly, which is why two candidates exist for multi-part posts.
	content(){
		this.article(this.post);
		if (this.post.parts) this.parts_strip();
	}

	// Where the parts of MY post live — mine on the post, my parent's on a part, so
	// the strip is the same five urls wherever it is drawn.
	part_url(part){ return this.url + part.name + "/"; }

	route(name){
		const part = this.post.parts?.find(p => p.name === name);
		if (part) return new this.constructor.Part({ post: this.post, part, title: part.title, finding: this.finding });
	}

	parts_strip(){
		return div.c("blogx-partnav blogx-foot", () => this.post.parts.forEach((part, i) =>
			a.c("blogx-part-link").href(this.part_url(part)).append(() => {
				span.c("blogx-part-n", "Part " + (i + 1));
				span.c("blogx-part-title", part.title);
			})));
	}
};

Blog.Post.Part = class BlogPostPart extends Blog.Post {
	posts_at(){ return this.parent.posts_at(); }
	part_url(part){ return this.parent.url + part.name + "/"; }

	content(){
		div.c("blogx-article", () => {
			div.c("blogx-eyebrow", () => {
				a.c("blogx-crumb", this.post.title).href(this.parent.url);
				span.c("blogx-dot", "·");
				span("Part " + (this.post.parts.indexOf(this.part) + 1) + " of " + this.post.parts.length);
			});

			div.c("blogx-article-title", this.part.title);
			p.c("blogx-lede", this.part.dek);
			md(this.part.body);
		});

		this.parts_strip();
	}
};

export default Blog;
