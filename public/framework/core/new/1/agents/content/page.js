import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, section } from "/content/show.js";

/* The Editor's report — twelfth seat.
 *
 * Absolute imports, because this module lives in agents/ and the code it talks
 * about lives in site/content/ — under the sub-server `/app.js` and
 * `/content/show.js` both resolve from here.
 *
 * Nothing serves `/agents/`, so this file has no url of its own. `site/council/`
 * gives it one: council/content/page.js imports this module and calls
 * `report.content.call(this)`, so the report lives beside the seat's work and is
 * readable at /council/content/. Edits here appear there with no copy to sync.
 */
export default new Page({
	meta: import.meta,
	title: "Content-driven navigation — the Editor's report",

	content(){

		// ── THE GRAPH PROBLEM ────────────────────────────────────────────────

		show(() => {
			const Page = {
				// ONE article, THREE tags. This walks exactly ONE parent:
				chain(){
					const chain = [this];
					for (let page = this; page.parent; ) chain.unshift(page = page.parent);
					return chain;
				},
			};

			// So the article has two addresses and CANNOT be one object:
			//   /content/blog/2026-07-04-what-a-tree-cannot-say/          canonical
			//   /content/tags/graph/2026-07-04-what-a-tree-cannot-say/    a second Page
		}, "the finding, in one method");

		md("A page tree is a beautiful abstraction until an article belongs in two places. `parent` is singular, so ask the concrete question — *what is `parent` for an article reachable at both urls?* — and every answer is wrong differently. The blog page: breadcrumbs lie at the tag url. The tag page: they lie at the canonical url. **Whoever adopted last: `add()` assigns `parent` unconditionally, so the second adoption silently rewrites the first** — two urls that are each correct alone and wrong in sequence. That third one is what happens by accident, the moment you reuse the instance.");

		md("**What I built: one node per path.** Two `Page` objects, two `view`s, two chains, and *one* network request — `md.cache` is keyed by resolved href, not by page. Both levels of `route()` live in one file and read top to bottom: a tag claims its own name, then claims the articles under it. Live at [/content/tags/](/content/tags/); open one article both ways and compare the crumbs.");

		section("What it costs — measured, not asserted");

		md([
			"| what | cost |",
			"| --- | --- |",
			"| identity | `blog_copy !== tag_copy`. Measured: **2** DOM instances of one article. |",
			"| `parent` | means *\"my parent on the path you arrived by\"*, not *\"who owns this article\"*. |",
			"| `chain()` | correct — for the path taken. There is no way to ask for the other one. |",
			"| `.in-path` | measured at the canonical url: `blogInPath: true, tagsInPath: false`. Each url marks only its own path. |",
			"| canonical | undecidable by the framework. `posts.js` picks; every second node says so on screen. |",
			"| network | **one** fetch. Second url cost `/content/blog/page.js` and **zero** `.md`. |",
			"| what can be duplicated | **only content that is data.** |",
		].join("\n"));

		md("That last row was found by a 404, and it is the sharpest thing in this report. A second node re-fetches the same `.md`. A post whose words are a `page.js` has no `.md` to re-fetch, so it has exactly one url and appears in a tag listing only as a link. **Data can live at two addresses; code cannot.**").ac("note");

		md("Verified both ways: clicking through to `/content/tags/graph/<slug>/` and reloading that url produce byte-identical title, crumbs, length and first paragraph.").ac("note");

		// ── THE MANIFEST ─────────────────────────────────────────────────────

		section("The manifest is the general escape from the lazy-title trap");

		show(() => {
			// THE TRAP, three costumes, one sentence — a page's title lives INSIDE
			// the page, so an index of pages must import every one of them.
			this.previews();      // draws url segments
			this.tabs("a b c");   // labels tabs with declared NAMES
			// site/app.js's sidebar: hand-typed, with a comment explaining why

			// THE ESCAPE. One module, and every title is already here.
			chronological().map(post => post.title);
		}, "the recurring wall, and the way through it");

		md("This is the most useful sentence I have: **if the thing you are indexing is content, put its metadata in data and the lazy-title problem disappears entirely. If it is code, accept the lazy title.** A page is code — its title cannot be read without running it. A post is data with a body attached, and data can be read without being run.");

		md([
			"| you want | you write | fetches |",
			"| --- | --- | --- |",
			"| reverse-chronological index | `chronological()` | 0 |",
			"| a tag cloud with counts | `tags()` | 0 |",
			"| prev / next | `neighbors(url)` | 0 |",
			"| search over titles, dates and tags | `posts.filter(…)` | 0 |",
			"| the article body | `md.file(meta, body(slug))` | 1, on demand |",
		].join("\n"));

		md("Measured: `/content/blog/` draws seven dated entries with real titles for **four** modules — `/page.js`, `/content/page.js`, `/content/blog/page.js`, `posts.js` — and it stays four whether the manifest holds six posts or six hundred. The bodies stay lazy, and the bodies are the only large thing.").ac("note");

		md("**The honest cost:** two sources of truth, hand-maintained, no build step. A `.md` with no manifest entry is invisible — nothing crawls the filesystem, and on static hosting nothing can. An entry with no file renders `Error loading …` in red. Both failures are loud, which is the best available without a generator. I chose the manifest over hand-rolled front-matter parsing because front matter is a second format nobody validates, and over a build step because this repo's defining constraint is not having one.");

		md("It does **not** rescue pages. [/content/](/content/) has a hand-written recipe list beside `previews()` so the difference is visible on one screen: the data-driven list reads properly and duplicates each title; the tree-driven one prints `article`, `blog`, `tags`. A manifest *of pages* trades the trap for drift. Content escapes cleanly because the manifest is the title's only home.").ac("note");

		// ── THE RECIPES ──────────────────────────────────────────────────────

		section("The recipes, and when to reach for each");

		md([
			"| recipe | reach for it when | cost |",
			"| --- | --- | --- |",
			"| [content is a file](/content/article/) — `content(){ return md.file(meta, \"x.md\", { h1: false }) }` | the page *is* a document | 1 fetch, 1 line, no support from `Page` |",
			"| [`route()` over a manifest](/content/blog/) | url segments are data (dates, slugs, ids) | 0 directories, 1 module, index gets real titles |",
			"| declared **and** dynamic children | one entry outgrows markdown | a directory for that one; nothing branches |",
			"| [tags — list](/content/tags/) | the default, always | nothing |",
			"| [tags — contain](/content/tags/graph/) | the tag is a genuine reading context | a node per path; see the table above |",
			"| [an index from data](/content/index/) | anything that is content | one module |",
			"| [a TOC from headings](/content/toc/) | one long document | place both containers sync, fill in a `.then` |",
			"| [an editorial sequence](/content/order/) | the order crosses directories | a list carrying titles, so prev/next imports nothing |",
			"| [search](/content/search/) | you have a manifest | instant on metadata; opt-in on full text |",
			"| [a book](/content/book/) | chapters need urls *and* one long read | render twice from one set of files |",
		].join("\n"));

		md("**Declaration is the switch, and it is the nicest thing in this tier.** `child(name)` reads `children` first, so a declared slug is imported and an undeclared one is offered to `route()`. A post that outgrows markdown gets a real `page.js` by adding its slug to `children`; no flag, no registry, and `route()` structurally cannot shadow a file you asked for.").ac("note");

		// ── FRAMEWORK REQUESTS ───────────────────────────────────────────────

		section("Requests — 1. Router drops the fragment (a bug)");

		show(() => {
			const Router = {

				click(e){
					const link = this.link_clicked(e);
					if (!link) return;
					e.preventDefault();
					this.go(link.pathname + link.hash);        // was: link.pathname
				},

				// walk the path, push the whole url, then honour the hash
				async go(url){
					const [path, hash] = url.split("#");

					if (await this.load(path)){
						history.pushState({}, "", url);
						this.scroll_to(hash);
					} else {
						location.assign(url);
					}
				},

				// the one new name, called from go() and from popstate
				scroll_to(hash){
					if (hash) document.getElementById(hash)?.scrollIntoView();
				},
			};
		}, "PROPOSED — Router.js");

		md("Measured: from `/content/toc/`, clicking `/content/book/#chapter-two-one-parent` lands on the right page with `location.hash === \"\"` and `scrollTop === 0`, while the target exists at `offsetTop: 1507`. Same-page anchors already work perfectly and need no change — `link_clicked()` returns `null` for them and the browser does it, which is the right default achieved by doing nothing.");

		md("`scroll_to` is the name I'd defend: it says what happens, it is a method because it does work, and it is the only new name in the diff. The `split(\"#\")` matters — `load_segments` splits the url on `/`, so a hash would otherwise become part of the last segment and 404.").ac("note");

		section("Requests — 2. mark_links() lights every in-page anchor");

		show(() => {
			const Router = {
				mark_links(here = this.active?.url){
					if (!here) return;

					this.root().querySelectorAll("a[href]").forEach(link => {
						if (link.origin !== location.origin) return;
						if (link.getAttribute("href").startsWith("#")) return;   // ← ADD THIS

						link.classList.toggle("active", link.pathname === here);
						link.classList.toggle("in-path",
							link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
					});
				},
			};
		}, "PROPOSED — Router.js");

		md("A fragment-only href reports the *current* pathname, so it matches `here` and every anchor in a table of contents is marked active at once. Measured on `/content/toc/`: **9 of 9**. An in-page anchor is a position, not a route, and `.active` means \"this link is where you are\" — which is true of none of them and all of them simultaneously.");

		section("Requests — 3. two caches for one file");

		md("`md.cache` and `code.cache` are separate objects, so a page that renders a file *and* shows its source fetches it twice. Measured: `/content/article/` costs 2 `.md` for one `article.md`; `/content/toc/` costs 2 for one `long.md`. Not urgent, and the fix is a shared `util/text/text.js` both exts call — one cache, one error path, one place that remembers to `delete cache[href]` on failure. I did not build it: it touches two exts and neither is mine.");

		section("Requests — 4. tokens for the sketch tier — LANDED, one missing");

		md("`ext/demo`'s `demo.css` and `ext/markdown`'s `md.css` consume `--line`, `--surface`, `--wash`, `--subtle`, `--radius` and `--prim` from `framework.css`, which `new/1` does not load. A `var()` that is invalid at computed-value time falls back to `unset`, so any seat calling `demo()` got a box with no border and no background, and nothing warned.");

		md("**Five of the six landed in `site/styles.css` while I was writing this** — on `:root`, which is the right place for defaults; a theme would override on `.app`. `--prim` is still missing, and `md.css` uses it for `.md-details > summary:hover`. One line: `--prim: #0a58ca;` — a value that already appears six times in that file.").ac("note");

		section("Requests — 5. markdown's generic elements");

		md("`site/styles.css` styles `.code pre` and a global inline `code`, because until this section nothing in `new/1` rendered markdown. A marked fence is a plain `<pre><code class=\"language-js\">`: it arrives with no box, and with the inline-code chip painted *inside* the block. Tables have no `border-collapse` and no cell padding. I put the fix in `content/content.css` scoped to `.md`, with the bug report written into the file — but it belongs in `site/styles.css`, on `pre`/`table`/`blockquote` directly, where the rest of this tier's opinion about generic HTML already lives. Moving it there means deleting my scoped copy and the now-redundant `.code pre` padding.");

		md("The sharpest one in that group is a **specificity accident**: `.page p { margin: 0 }` is `(0,1,1)` and `.page > * + * { margin-top: 1rem }` is `(0,1,0)`, so a shorthand `margin: 0` silently wins and every top-level `p` on the site loses its rhythm — including `p()`, not just markdown. `:where(.page) p` would fix it at the source and cost nothing. **No measurement catches this; I found it by reading a screenshot.**").ac("note");

		// ── FOR THE README ───────────────────────────────────────────────────

		section("Requests — 6. for the readme: what a deep url costs");

		show(() => {
			const Router = {
				activate(page){
					// …
					to.slice(shared).forEach(p => p.activate());   // EVERY ancestor, root-to-leaf
				},
			};

			const Page = {
				activate(){
					if (this.render().el.parentNode !== container.el)   // render() runs content()
						container.append(this.view);
				},
			};
		}, "the two lines that decide it");

		md("A deep url does not render its leaf. It renders **every page in the chain**, and rendering runs `content()` — so a fetch in a page that other pages sit underneath is a fetch on every url below it. Nobody else measured this, and it applies to every section with file-backed content.");

		md([
			"| url | `.md` fetched | why |",
			"| --- | --- | --- |",
			"| `/content/book/` | 3 | its own three chapters |",
			"| `/content/book/capture/` | **3** | the book's whole-read view builds first |",
			"| `/content/book/graph/` | **3** | …and the chapter itself then costs 0 |",
			"| `/content/book/manifest/` | **3** | same three, whichever chapter you asked for |",
			"| `/content/blog/<slug>/` | 1 | ancestors fetch nothing |",
			"| `/content/tags/graph/<slug>/` | 1 | three ancestors, none of them file-backed |",
		].join("\n"));

		md("The cost is **the ancestors' content, not the depth** — five segments cost 1 under `/blog/`, three segments cost 3 under `/book/`. It is paid once per page load, because `render()` memoises `this.view`: chapter → chapter adds 0, and arriving by click from `/content/book/` adds 0, since `md.cache` already holds every chapter.");

		show(() => {
			// THE RULE, for the readme:
			//
			//   A deep url pays for every ancestor's content(), not just the leaf's.
			//   Put a fetch in a page that others sit underneath and you have put it
			//   on every url below it.
			//
			// The lever is placement, not laziness: move the expensive part DOWN
			// into a child, and the parent stays cheap for everything beneath it.
		}, "one sentence to keep");

		md("This is not a bug and it is not free. `/content/book/` wants all three chapters — that page *is* the long read — so the book pays honestly and every chapter under it is then instant. A section where that trade is wrong should push the fetch into a child instead.").ac("note");

		// ── DISSENT ──────────────────────────────────────────────────────────

		section("Dissent");

		md("**Do not add `also: [url]` / multi-url pages for tags.** It is the obvious answer and I argued myself out of it. It needs `load_segments` to resolve a second address onto an existing node, and it needs `chain()` to take a path as an argument — because with two addresses there is no longer *a* chain, there is a chain per url. `chain()` is the method every layout in the framework calls. One node per path is uglier and costs one object; the alternative costs the one abstraction everything else is built on. Build it when a *second* feature wants it, not for tags.");

		md("**Do not add `page.next()` / `sequence`.** Prev/next over an author-supplied list is six lines of userland where it can be read. A framework method would have to decide what happens when a page appears twice in one list, in two lists, or in none — three questions the list itself never raises. The list is doing the work; the API would only be somewhere to put it.");

		md("**Do not make `previews()` async.** It has been proposed once per seat and it is wrong every time. The fix for a bad index is a manifest, not an import.");

		md("**Mild dissent on `container()`'s reach.** The readme calls it action at a distance and keeps it; I agree it should stay. What I want written down beside it is the *other* half of the same mechanism — that rendering root-to-leaf means a deep url pays for its ancestors' content. Request 6 above has the numbers.").ac("note");

		// ── HOUSEKEEPING ─────────────────────────────────────────────────────

		section("On showing the code");

		md("Two helpers in `content/show.js`, both in `site/ui.js`'s existing `.code` box so this section looks like every other seat's:");

		md([
			"| helper | what it takes | when |",
			"| --- | --- | --- |",
			"| `show(fn, label)` | a real function, **never called** | code that must not run — a `page.js` shape, a proposal, a rejected version |",
			"| `run(fn, label)` | a real function, shown **then called** | code that *is* this page's body — one source of truth, no copy to drift |",
			"| `raw(meta, url, label)` | a real file, fetched and highlighted | the whole module, the markdown behind a page |",
			"| `folded(text, fn)` | anything, collapsed | the verbatim source at the bottom of every page |",
		].join("\n"));

		md("`site/ui.js`'s `code(source, label)` takes a **string**, and a string is dead text in the editor — no highlighting, no completion, no syntax errors, and nothing stopping it drifting from the code it claims to show. Nothing in this section passes a string. I used `code.fn` from `ext/highlight` rather than `demo()` because half these snippets must not run, and because `demo.css`'s box is invisible in this tier until request 4 lands.").ac("note");

		section("Verified");

		md([
			"```",
			"13 routes, real root page.js, 1400×900   all clean",
			"console errors                            0 on every route",
			"horizontal overflow                       0 on every route",
			"md-error / code-error                     0 on every route",
			"markdown actually present                 asserted on rendered text, 1385–10151 chars",
			"highlighted fences                        1–9 per route",
			"click == reload, deep tag url             byte-identical title, crumbs, length, first paragraph",
			"one article, two urls                     both render; 2nd costs 1 module, 0 .md",
			"same-page anchor                          scrollTop 0 -> 2163",
			"cross-page anchor                         BUG: hash dropped, target at offsetTop 1507",
			"toc links marked .active                  BUG: 9 of 9",
			"search, metadata                          instant, 0 fetches",
			"search, full text                         6 of 7 indexed (7th is a module), finds body-only words",
			"404 (/content/tags/not-a-tag/)            App.error renders, chrome intact",
			"```",
		].join("\n"));

		md("`ext/markdown` and `ext/highlight` both work unmodified in this sketch tier — that was the first thing tested, and it is worth recording as a result: they patch `View`, and `new/1` imports the same `View` module instance, so nothing about having its own `App`/`Page`/`Router` matters to them.").ac("note");

		section("Where it lives");

		div.c("row", () => [
			["/content/", "the section"],
			["/content/tags/", "the graph problem"],
			["/content/index/", "the manifest argument"],
		].forEach(([url, text]) => a.c("page-link", text).href(url)));
	}
});
