import { View, div, p, span, a, icon, details, summary, md } from "/app.js";
import { clean, is_url, is_off_site, nav_of, title_of, NAVIGATION, ARRANGEMENT, ROOM, SURFACES, TYPE } from "./blocks.js";
import { CONTENT_DRAW, PAGES } from "./content.js";
import { from_url, write_url, nest_of } from "./url.js";
import { blocks_of, is_default } from "./build/words.js";
import { draw_blocks } from "./build/draw.js";

/* ⚠ IMPORTED FOR ITS TWO CSS RULES, and that is the whole of `ui/accordion`: there is
     no `ui.accordion()` to call, because the component is a `<details>` element and a
     hairline between two of them. The `expand` navigation word below is that element.
     (`/framework/ui/accordion/` says why the counter that used to be here was deleted.) */
import "/framework/ui/accordion/accordion.js";

// ⚠ ONE LIST PER WORD, and it is the list in `blocks.js`. These five used to be
//   hand-typed arrays of ids in `paint()` below — a sixth copy of the vocabulary,
//   which is exactly what the 2026-09-05 audit found five of.
const ids = list => list.map(entry => entry.id);

/* THE FILE BEHIND A MADE PAGE'S URL. `/imagine/paging/make/notes/` is the page;
   `/imagine/paging/made/notes/page.json` is the file it is drawn from (`make/made.js`
   owns that directory, and `make/page.js` says why the two differ). Anything else is
   fetched as it was given, so a `page.json` written by hand can be nested too. */
const dir_of = url => url.replace(/\/?$/, "/");

const file_for = url => dir_of(url.startsWith("/imagine/paging/make/")
	? url.replace("/imagine/paging/make/", "/imagine/paging/made/")
	: url) + "page.json";

// A url ending in `.md` is prose to render; anything else is a page to run.
const is_md = url => /\.md(\?|#|$)/i.test(url);

/* ⚠ A MISSING FILE CAN ANSWER 200 WITH `index.html`. The dev server's SPA fallback
     means `res.ok` is not "the file is there" — the CONTENT-TYPE is the 404. The same
     guard `make/made.js`'s `FileStore.read()` carries, for the same reason. */
async function read_file(path, as){
	const res = await fetch(path, { cache: "no-cache" }).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return res[as]().catch(() => null);
}

/* ── A SAVED PAGE, READ WHOLE ──────────────────────────────────────────────────
   A `page.json` names its children by DIRECTORY NAME (`make/made.js`), so the titles
   a tab strip needs are one more fetch each — which is what a child costs anywhere on
   this site. A child that is missing is skipped rather than fatal. */
async function read_node(url){
	const node = await read_file(file_for(url), "json");
	if (!node) throw new Error("no page at " + url);

	const kids = await Promise.all((node.children ?? []).map(async name => {
		const kid = await read_file(file_for(dir_of(url) + name + "/"), "json");
		return kid && { ...kid, name };
	}));

	return { ...node, children: kids.filter(Boolean) };
}

/* ── A SAVED PAGE, AS THE TWO THINGS A STAGE NEEDS BEYOND ITS SEVEN WORDS ──────

   A `page.json` says more than seven words. It has CHILDREN, and it may have BLOCKS —
   and the stage draws neither on its own: `pages:` is whose children the navigation
   word draws, and `draw:` is what goes in the box. Something has to turn one into the
   other, and THIS IS THE ONE PLACE THAT DOES IT.

   ⚠ ONE PLACE ON PURPOSE. The same translation was written into `make/page.js` alone,
     so a page you made drew its own children when you opened it and FOUR CANNED
     SAMPLES when the same page was nested inside another — the identical defect, one
     level deeper, four audits running (paging-audit-5b). Every caller comes through
     here now, at every depth, so there is no third level for it to reappear at.

   `url_of` answers where a child actually lives — a live `Page`'s own url on a made
   page, a path under the parent's url for a page read off disk.                     */
export function stage_props(node, { page, url_of } = {}){
	const kids = node?.children ?? [];

	return {
		/* ⚠ ALWAYS AN ARRAY, EVEN AN EMPTY ONE. `undefined` means "I have no children to
		     give you, draw the four samples", which is right for a demo and wrong for a
		     saved page: `made/ideas/` has no children, and with a rail it listed
		     Overview · Pricing · Docs · Contact — four strangers on somebody's own page.
		     An empty list is the truth, and the stage says so out loud. */
		pages: kids.map(kid => child_for(kid, url_of)),

		/* ⚠ THE BLOCKS DO NOT SWITCH THE CONTENT WORD OFF. `draw` used to be the whole
		     of the box, so one prose block silently made `content` draw nothing while
		     the control still cycled it and still wrote it to the file (paging-audit-5b).
		     They COMPOSE: your blocks first, then the content word's own sample under a
		     line naming it. Both controls are live, and the box says which half is which. */
		draw: blocks_of(node).length
			? stage => { draw_blocks(node, page); stage.sample(true); }
			: undefined,

		/* WHICH TAB OPENS FIRST. Build's star writes `default: true` into a child's
		   `mode`, the file kept it, the builder's own preview opened it — and the SAVED
		   page read nothing, so the tab you marked opened first in one place and nowhere
		   else (paging-audit-6b, break 1). `null` is "the page's own content", which is
		   what a page with no default shows. */
		open: kids.findIndex(is_default) < 0 ? null : kids.findIndex(is_default),

		/* THE PAGE INSIDE THIS PAGE. A string in the file — a preset id, or the address
		   of a page — and `initialize()` below turns it into the page it names. */
		nest: node?.mode?.nest,
	};
}

/* WHAT TO SAY WHEN AN ADDRESS ANSWERS WITH NOTHING — and it has to say WHICH
   addresses work, because the old sentence ("There is no page or file at /framework/ui/")
   was false about a page that plainly exists: it is a `page.js`, so there is no
   `page.json` for the box to read (paging-audit-6, item 3). */
const missing = url => {
	p.c("muted", "Nothing here could be read at " + url + ".");

	md("An address in this box is **a page you made**, **a ready-made page** from the library, or **a `.md` file** — those are the three things that answer with something to draw. "
		+ "Every other page of this site is a `page.js`, which is code: there is no file here to fetch and draw.").ac("muted paging-means");

	a.c("page-link", "Every page you have made →").href("/imagine/paging/make/");
};

const child_for = (kid, url_of) => ({
	title: kid.title,
	icon: kid.icon ?? "description",
	text: kid.description || "A page you made. Open it on its own and it gets the whole middle, with its own bar over it.",
	url: url_of?.(kid),
});

/* ⚠ `paging.css` is loaded by `paging.js`, not here. Every page that puts a Stage on
     screen is a page of this realm and so extends `Paging`; loading the sheet twice
     would put two identical <link>s in the head for one file. */

/* ── THE STAGE ─────────────────────────────────────────────────────────────────

   ONE BOX, and five words over it. Give it a configuration and it draws a whole,
   real page: chrome around a content box, a list of children, and a caption under
   it saying what your last click did.

       new Stage({ config: { navigation: "tabs", content: "article", … } })

   THIS IS THE ONE RENDERER FOR A CONFIGURED PAGE. A preset is a configuration; the
   bar edits one; the drawer prints one as JSON; a `?…` url names one — and every one
   of those goes through this class. What is NOT drawn here is the two tools that
   draw something else: the BUILDER draws a node you are still assembling
   (`build/stage.js`), and the navigation labs draw one gesture at a time
   (`navigation/lab.js`). The builder should be this class too, and the schema stopped
   being the reason it is not — `doc/builder.md` has the order it happens in.

   ⚠ THE BOX NEVER MOVES unless the configuration says it should. That is the whole
     idea a "stage" names, and it is why the caption measures the box before and
     after every click instead of claiming anything: `stable` navigation reads
     "0px" out loud, and `columns`/`takeover` read the real number they moved it by.
     (Decision 5 of 2026-09-05 — stable navigation versus dynamic.)               */

export class PagingStage extends View {

	// ── state ────────────────────────────────────────────────────────────────
	// `open` is which child is showing (null = the page's own content). Held in
	// memory only, never in storage: a refresh puts the demo back to the page it is.
	/* ⚠ THE FIELDS ARE SET BEFORE `super.initialize()`, NOT AFTER. `View.initialize()`
	     IS the render — it calls `append(this.render)` — so anything assigned after it
	     is assigned to a view that has already drawn itself, and `render()` threw on an
	     undefined `pages` list. `PagingSwapper` in this realm already had it in this
	     order; the note was not written down until now. */
	initialize(){
		/* `base` is the page's OWN words, before the url gets a vote — the drawer's
		   link and `write_url()` both send only what differs from it, so a preset's
		   address stays clean until you change something. */
		this.base = clean(this.config);

		// ⚠ A NESTED STAGE NEVER READS OR WRITES THE ADDRESS. It is a page inside a
		//   box, not the page you are on; two stages writing one url would fight.
		const opening = this.inner ? { config: this.base, nest: undefined } : from_url(this.base, this.page?.url);

		this.config = opening.config;

		/* The page's OWN nested page, before the url gets a vote — the same idea as
		   `base`, and what the address falls back to when it says nothing.
		   ⚠ THE ADDRESS WINS, exactly as it does for the seven words. `??=` was here,
		     which meant a page that ships WITH a nested page (`library/nest/`) ignored
		     `?nest=magazine` entirely. `undefined` is "the address said nothing";
		     `null` is "the address said none" (`url.js`). */
		/* ⚠ `nest` MAY ARRIVE AS A STRING — a preset id or a page's address, which is
		     what the FILE says and what `?nest=` says. One line turns it into the page
		     it names, so a saved page, a url and a hand-written `page.js` can all say
		     `nest: "dashboard"` and mean the same thing. */
		if (typeof this.nest === "string") this.nest = nest_of(this.nest);

		this.base_nest = this.nest ?? null;
		this.nest = opening.nest === undefined ? this.base_nest : opening.nest;
		this.pages ??= PAGES;
		this.open ??= null;

		/* WHICH TAB THIS PAGE OPENS ON — `base` and `base_nest`'s third sibling. A saved
		   page says which child is the default (`stage_props()` above), and `reopen()`
		   below puts the page back to its own words on every arrival: without this it
		   put `open` back to "the page's own content" instead, so the default tab
		   opened cold and never again. */
		this.base_open = this.open;
		super.initialize();
	}

	/* ⚠ THE CLASS NAME IS THE CSS CLASS. `View.classify()` walks the constructor chain
	     and adds each name lowercased, so a class called `Stage` wore the framework's
	     own `.stage` layout word — `container-type: inline-size; overflow: hidden` —
	     and shrink-wrapped itself to 307px inside a 1546px frame with nothing thrown
	     (measured 2026-09-05, 1920). A View's class name goes through the same
	     new-css-class check as a hand-written selector: `PagingStage` → `paging-stage`. */
	render(){
		this.paint();
		this.frame();
	}

	// ── the paint ────────────────────────────────────────────────────────────
	// Six classes, one per word, all on the frame — so a repaint is one remove and
	// one add, and two colours can never end up as one class fighting itself.
	paint(){
		const c = this.config;

		this.rc(...ids(SURFACES).map(w => "paging-bg-" + w))
			.rc(...ids(TYPE).map(w => "paging-type-" + w))
			.rc(...ids(ROOM).map(w => "paging-room-" + w))
			.rc(...ids(ARRANGEMENT).map(w => "paging-arr-" + w))
			.rc(...ids(NAVIGATION).map(w => "paging-nav-" + w))
			.ac("paging-bg-" + c.background, "paging-type-" + c.type,
				"paging-room-" + c.room, "paging-arr-" + c.arrangement, "paging-nav-" + c.navigation);

		return this;
	}

	// ── the frame ────────────────────────────────────────────────────────────
	frame(){
		const c = this.config;

		// A takeover has eaten the stage: one trail back, then the child, alone.
		if (c.navigation === "takeover" && this.open !== null) return this.taken();

		if (c.room === "full") this.exit();
		if (c.arrangement === "bar-top") this.bar("top");

		div.c("paging-stage-body", () => {
			if (c.navigation === "rail") this.rail("left");
			if (c.arrangement === "rail-left") this.panel("left");

			div.c("paging-stage-mid", () => {
				if (c.navigation === "tabs") this.tabs();
				this.box();
				if (c.navigation === "columns" && this.open !== null) this.pane();
			});

			if (c.navigation === "rail-right") this.rail("right");
			if (c.arrangement === "rail-right") this.panel("right");
			if (c.arrangement === "main-aside") this.aside();
		});

		if (c.arrangement === "bar-bottom") this.bar("bottom");

		if (!this.inner) this.$cap = div.c("paging-cap", () => { this.caption(); });
	}

	/* THE BOX. The only element the caption measures, and the only one wearing the
	   CONTENT colour — which is the second of the owner's two independent colour
	   controls (the first is the frame's background, above). */
	box(){
		return this.$box = div.c("paging-canvas")
			.ac("paging-surface-" + this.config.surface)
			.append(() => { this.held(); });
	}

	/* ── WHAT THE BOX HOLDS ───────────────────────────────────────────────────

	   ⚠ THE BOX RESERVES ITS HEIGHT. Every panel is drawn — the page's own content
	     AND all four children — stacked in ONE grid cell, and the ones you are not
	     reading are `visibility: hidden`: hidden, but still MEASURED. So the box is
	     always as tall as its tallest panel, the browser works that number out, and
	     clicking a tab cannot resize it.

	     This is `nav-stability`'s own rule (`navigation/navigation.css`,
	     `.paging-nav-reserve`), lifted here because the caption underneath is a
	     MEASUREMENT: before it, the first demo in the realm said "the box did not
	     move" over a line reading "the box is 335px shorter" (paging-audit-2, break
	     #2). `visibility`, never `display: none` — a display-hidden panel is not
	     measured, which is the whole thing being bought.

	   ⚠ ONLY THE WORDS THAT SWAP. `expand`, `columns` and `takeover` are the DYNAMIC
	     words (decision 5, 2026-09-05): they are supposed to move things, so their
	     child opens in the row, beside the box or over the whole stage, and the
	     caption reports the real pixels. Reserving there would hide the very thing
	     they demonstrate. `swaps()` below is the one question this asks. */
	held(){
		if (!this.swaps()) return this.own_panel();

		div.c("paging-nav-reserve", () => {
			this.slot(null);
			this.pages.forEach((child, i) => this.slot(i, child));
		});
	}

	/* Which navigation words change what is IN the box (rather than beside, below or
	   over it) — a flag `blocks.js` carries on each word, and reading it is the whole
	   of this method.
	   ⚠ IT IS NOT `stable`. It was `stable && id !== "none"`, and adding `expand`
	     would have made it `stable && !== "none" && !== "expand"` — two exceptions
	     hand-written here, which is how the realm grew five copies of its vocabulary
	     in the first place. "Does the box swap?" is its own question, so it is its own
	     flag, answered once, in the list. */
	swaps(){ return nav_of(this.config.navigation).swaps === true; }

	// One reserved panel. `i === null` is the page's own content.
	slot(i, child){
		return div.c("paging-slot").ac(this.open !== i && "paging-nav-hidden").append(() => {
			if (i === null) return void this.own_panel();

			div.c("paging-held", () => { this.child_panel(child, i); });
		});
	}

	/* ONE CHILD, DRAWN — and the SEAM a caller overrides to draw its own. The four
	   demo children are a title and a paragraph; a REAL child — a page you made —
	   also has a url, and then the panel carries the way to it. Before this a page you
	   made drew four canned samples and had no link to any of its own children
	   (paging-audit-4b); `make/page.js` hands the real ones in.

	   ⚠ `draw_child` IS THE OTHER HALF OF `draw`. `draw` puts the caller's own thing in
	     the box; `draw_child` puts the caller's own thing in a CHILD's panel. The
	     builder needs both — its panel says "the url did not change" under a page that
	     does not exist yet — and it is the seam `doc/builder.md` named as missing. */
	child_panel(child, i){
		if (this.draw_child) return this.draw_child(child, i, this);

		p.c("h2", child.title);
		p(child.text);

		if (child.url) a.c("paging-panel-link").href(child.url)
			.append(() => { span("open " + child.title + " as its own page — this is where the url changes"); icon("chevron_right"); });

		return this;
	}

	/* THE PAGE'S OWN CONTENT, and the list of children when the navigation word draws
	   that list INSIDE the box. Three words do: `columns` and `takeover` list the rows
	   you navigate from (before this, both presets drew a box with nothing to click and
	   the gesture could not be reached at all), and `expand` draws the rows themselves.
	   ⚠ Called from inside `box()`'s own captured callback, so the factories append on
	     their own — nothing here may `empty()` the box. */
	own_panel(){
		if (this.config.navigation === "columns" || this.config.navigation === "takeover") this.rows();
		if (this.config.navigation === "expand") this.expander();

		// `draw` is the seam a page uses to put its OWN thing in the box — the
		// templates realm hands over a family's real machinery this way, so the
		// two colours and the type scale repaint a real magazine cover. A page with
		// blocks draws them AND its content word, through `stage_props()` above.
		if (this.draw) this.draw(this);
		else this.sample();

		return this.nest_box();
	}

	/* ── THE CONTENT WORD, DRAWN ──────────────────────────────────────────────
	   Eight canned samples (`content.js`) — or a URL, which is the ninth answer and
	   the one that is not a list. A page's address is fetched as its `page.json` and
	   RUN inside the box, wearing its own seven words; a `.md` address is fetched and
	   rendered as prose. So the stage can hold a page nobody wrote when this realm
	   was written, by address, cold.

	   `named` is true when BLOCKS were drawn above this: the sample then gets a line
	   over it saying which control it belongs to, because two things in one box with
	   nothing between them is how a reader ends up blaming the wrong dropdown. */
	sample(named){
		const kind = this.config.content;

		if (named) span.c("paging-eyebrow", "and the content word — " + title_of("content", kind));

		if (is_off_site(kind)) return this.off_site(kind);
		if (is_url(kind)) return is_md(kind) ? this.prose_at(kind) : this.page_at(kind);

		return (CONTENT_DRAW[kind] ?? CONTENT_DRAW.article)();
	}

	/* AN ADDRESS ON SOMEBODY ELSE'S SITE — said out loud, and not drawn. This site is
	   static: a page here can only read files this site serves, so `https://…` is a
	   value the box keeps, shows and refuses, rather than one it drops. (Before this
	   the value was thrown away, the dropdown fell back to Card wall and the address
	   bar still said `?content=https://…` — the page and its own url disagreeing, which
	   is the one promise this realm makes on every page. paging-audit-6, item 4.) */
	off_site(url){
		return div.c("paging-content-url", () => {
			p.c("muted", "That address is on another site: " + url);

			md("This box reads files **from this site**, so an address here starts with `/` — a page you made, a ready-made page, or a `.md` file. "
				+ "An off-site address is kept in the url and in the field above, and nothing is fetched.").ac("muted paging-means");
		});
	}

	/* A `.md` FILE, IN THE BOX. ⚠ NO DOM AFTER THE AWAIT: the box is captured
	   synchronously and filled in the callback — the realm's oldest trap. */
	prose_at(url){
		return div.c("paging-content-url", $box => {
			$box.append(() => { p.c("muted", "Reading " + url + "…"); });

			read_file(url, "text")
				.then(text => $box.empty(() => {
					if (text === null) return void missing(url);
					md(text);
				}))
				.catch(() => $box.empty(() => { missing(url); }));
		});
	}

	/* PUT A PAGE INSIDE THIS ONE (or take it out), and say so in the address — one
	   seam, so the drawer, a `?nest=` url and a preset all arrive the same way. */
	nest_to(preset){
		this.nest = preset ? (preset.config ? { ...preset.config, id: preset.id, title: preset.title } : preset) : null;
		this.redraw();

		/* ⚠ `keep_nest` IS `keep` FOR THE EIGHTH THING A PAGE SAYS, and it runs BEFORE
		     the address is written for the same reason: a page that SAVES the page
		     inside it has moved its own words, so the query has nothing left to say. A
		     demo leaves the hook unset and nothing persists (decision 4). */
		this.keep_nest?.(this.nest?.id ?? null);

		if (!this.inner) write_url(this.config, this.base, this.nest, this.base_nest);
		return this;
	}

	/* A WHOLE PAGE INSIDE THIS ONE. `nest` is another configuration, and it is drawn
	   by this same class — so a nested page really navigates, really repaints, and
	   really wears its own two colours. The owner's ask: "we want to be able to put
	   any one of these page types inside any other." The drawer sets it; the `nest`
	   preset ships with one already in.
	   ⚠ `inner: true` on the nested one, and the method is `nest_box()` — a FIELD and a
	     METHOD of the same name is the shadowing trap this realm has already been bitten
	     by twice (`chosen`, `opens`): `this.nested` would have been a boolean where a
	     function was called. The inner stage drops its caption and cannot take the
	     screen: a page inside a box may not eat the screen. */
	nest_box(){
		if (!this.nest) return null;

		return div.c("paging-nest", () => {
			span.c("paging-eyebrow", "a whole page, running inside this box");

			// A preset arrives with its words. Any other url arrives as a promise.
			if (this.nest.navigation) return void this.inside(this.nest);

			this.page_at(this.nest.url, true);
		});
	}

	/* ⚠ `level` IS A LOOP FUSE, and it is needed because `content` takes a url: a page
	     whose saved `content` is its OWN address would read itself, draw itself, read
	     itself… for ever, with nothing thrown. The bar on a page you made writes to the
	     file, so a reader can produce exactly that in two clicks. Two levels of nesting
	     draw; the third says so and hands over a link. */
	inside(config, extra){
		return new PagingStage({
			config: { ...config, room: "reading" },
			inner: true,
			level: (this.level ?? 0) + 1,
			...extra,
		});
	}

	/* ── A PAGE AT A URL, READ AND RUN INSIDE THIS BOX ────────────────────────
	   Two controls arrive here: `?nest=` puts a page inside this one, and the `content`
	   word can BE a page. Both are a url, both are read the same way, and both end up
	   as a stage — one path, so a fix to either is a fix to both.

	   ⚠ IT HANDS THE INNER STAGE THE NODE'S OWN CHILDREN AND BLOCKS. It used to hand
	     over the seven words alone, so `library/blog-post/?nest=/imagine/paging/make/notes/`
	     drew Notes wearing the demo's four canned tabs — Overview · Pricing · Docs ·
	     Contact — while the same page opened on its own read Today · Later
	     (paging-audit-5b). `stage_props()` at the top of this file is that seam.

	   ⚠ NO DOM AFTER THE AWAIT. The box is captured synchronously and filled in the
	     callback — the realm's oldest trap, and the reason this is not one `await`.
	   ⚠ THE URL AND THE FILE ARE DIFFERENT PATHS. A made page lives at
	     `/imagine/paging/make/notes/` and its file at `/imagine/paging/made/notes/`
	     (`make/page.js` says why), so the url is translated rather than fetched. */
	page_at(url, named){
		if ((this.level ?? 0) >= 2) return div.c("paging-nest-fetch", () => {
			p.c("muted", "Two pages deep is as far as this box draws.");
			a.c("page-link").href(url).append(() => { span("Open " + url + " on its own"); icon("chevron_right"); });
		});

		/* ⚠ ASK `nest_of()` FIRST. A ready-made page has no `page.json` — it IS seven
		     words, written in `presets.js` — so fetching its address answered nothing and
		     `?content=/imagine/paging/library/blog-post/` said "there is no page or file
		     at…" about one of the twelve pages the rail links, while `?nest=` with the
		     SAME address ran it (paging-audit-6b, break 3). Two fields that look
		     identical now accept the same pages, because they ask the same question. */
		const preset = nest_of(url);
		if (preset?.navigation) return div.c("paging-nest-fetch", () => {
			if (named) this.nest_name(url, preset.title);
			this.inside(preset);
		});

		return div.c("paging-nest-fetch", $box => {
			$box.append(() => { p.c("muted", "Reading " + url + "…"); });

			read_node(url)
				.then(node => $box.empty(() => { this.run(node, url, named); }))
				.catch(() => $box.empty(() => { missing(url); }));
		});
	}

	/* ONE NODE, RUNNING. ⚠ THE NAME IS A LINK. The dashed band said which page was
	   inside this one and gave no way to it — the only door was the drawer
	   (paging-audit-5, item 7). */
	run(node, url, named){
		if (named) this.nest_name(url, node.title);

		return this.inside(clean(node.mode),
			stage_props(node, { page: this.page, url_of: kid => dir_of(url) + kid.name + "/" }));
	}

	// The band's name, and it is a LINK: the dashed band said which page was inside this
	// one and gave no way to it (paging-audit-5, item 7).
	nest_name(url, title){
		return a.c("paging-nest-name").href(url)
			.append(() => { span(title); icon("chevron_right"); });
	}

	/* ── `expand` — THE CHILD OPENS IN THE ROW ────────────────────────────────
	   A `<details>` per child and the site's own `ui/accordion` rules, which means
	   there is no JavaScript in the gesture: the browser opens the row, the box grows
	   downward, and nothing above it moves. It is the one navigation word that never
	   changes the address, so an opened row cannot be linked to or reached with Back —
	   which is what `/imagine/paging/mechanisms/expand/` is for.

	   ⚠ THE RECT IS TAKEN ON THE PRESS, NOT IN `toggle`. `toggle` fires AFTER the
	     browser has already opened the row, so the "before" would be the "after" and
	     the caption would report 0px on a gesture whose whole point is that it grows. */
	expander(){
		return div.c("paging-expand", () => {
			span.c("paging-eyebrow", "pages under this one — open one and it grows right here");
			if (this.none_yet()) return;

			this.pages.forEach((child, i) => details.c("ui-accordion-item paging-expand-item", () => {
				summary.c("paging-expand-head", () => { icon(child.icon); span(child.title); })
					.on("mousedown", () => { this.grew_from = this.rect(); })
					.on("keydown", event => { if (event.key === "Enter" || event.key === " ") this.grew_from = this.rect(); });

				div.c("paging-held", () => { this.child_panel(child, i); });
			}).on("toggle", event => this.grew(child, event.target.open)));
		});
	}

	// What opening a row did to the box, in pixels — the same report every other
	// gesture in this realm files, so `expand` can be compared with the other five.
	grew(child, open){
		this.change = {
			from: open ? "closed" : child.title,
			to: open ? child.title : "closed",
			before: this.grew_from, after: this.rect(),
		};

		this.$cap?.empty(() => { this.caption(); });
		return this;
	}

	// ── the child list, drawn four ways ──────────────────────────────────────

	/* ⚠ A LIST WITH NOTHING IN IT SAYS SO. A page you MADE hands over its real children
	     — and a page with none hands over an empty list rather than the four samples, so
	     every one of these four drawings has to have an answer for it. */
	none_yet(){
		if (this.pages.length) return false;
		p.c("muted paging-no-pages", "No pages under this one yet.");
		return true;
	}

	tabs(){
		return div.c("paging-strip", () => {
			if (this.none_yet()) return;
			this.pages.forEach((child, i) => this.tab(child, i));
		});
	}

	tab(child, i){
		return this.press(span.c("paging-strip-tab", child.title).ac(this.open === i && "on"), i);
	}

	rail(side){
		return div.c("paging-rail paging-rail-" + side, () => {
			span.c("paging-eyebrow", "pages");
			if (this.none_yet()) return;
			this.pages.forEach((child, i) => this.row(child, i));
		});
	}

	// The same rows, listed INSIDE the box — what `columns` and `takeover` navigate
	// from. A page that opens its children as columns lists them; that is the gesture.
	rows(){
		return div.c("paging-rows", () => {
			span.c("paging-eyebrow", "pages under this one");
			if (this.none_yet()) return;
			this.pages.forEach((child, i) => this.row(child, i));
		});
	}

	// A row, for the rail and for the two mechanisms that navigate. It carries the
	// icon of what clicking it will DO, which is the promise the row makes.
	row(child, i){
		const nav = nav_of(this.config.navigation);

		return this.press(span.c("paging-row").ac(this.open === i && "on").append(() => {
			icon(child.icon).ac("paging-row-glyph");
			span.c("paging-row-words", child.title);
			icon(nav.icon).ac("paging-sign");
		}), i);
	}

	// `columns` — the child opens as a pane to the RIGHT, inside the stage, and the
	// box shrinks to make room. Nothing else about the page changes.
	pane(){
		const child = this.pages[this.open];

		return div.c("paging-pane", () => {
			span.c("paging-eyebrow", "opened to the right — the box shrank to make room");
			this.child_panel(child, this.open);
			this.press(span.c("paging-back", () => { icon("close"); span("close this column"); }), this.open);
		});
	}

	/* `takeover` — the child has the whole stage, and the trail is the way back.
	   ⚠ THE WAY OUT IS DRAWN TWICE, on purpose: the crumb (back to the page that was
	     here) and, when the stage has the whole screen, the exit chip (back to the
	     app). Before this, a takeover on a `full` stage had NEITHER — `frame()`
	     returned here before the `full` branch ran, so at 1280 the only way out of
	     `/library/takeover/` was the browser's Back button (paging-audit-2, break
	     #4). A gesture that fills the screen owes the reader a door. */
	taken(){
		const child = this.pages[this.open];

		if (this.config.room === "full") this.exit();

		div.c("paging-trail", () => {
			this.press(span.c("paging-crumb", () => { icon("arrow_back"); span("Northwind"); }), this.open);
			icon("chevron_right");
			span.c("paging-crumb on", child.title);
		});

		div.c("paging-canvas").ac("paging-surface-" + this.config.surface).append(() => {
			div.c("paging-held", () => {
				span.c("paging-eyebrow", "this child took the whole stage — everything behind it is the trail above");
				this.child_panel(child, this.open);
			});
		});

		this.$cap = div.c("paging-cap", () => { this.caption(); });
	}

	// ── the chrome the ARRANGEMENT word adds ─────────────────────────────────
	// Real controls, not decoration: a bar of the same page's own actions.
	bar(where){
		return div.c("paging-bar paging-bar-" + where, () => {
			["Save", "Share", "History"].forEach(word => span.c("paging-bar-btn", word));
			span.c("paging-bar-gap");
			span.c("paging-bar-note", where === "top" ? "toolbar" : "footer");
		});
	}

	/* ── A PANEL IS NOT A RAIL ────────────────────────────────────────────────
	   `arrangement: rail-left` and `navigation: rail` both put a column beside the
	   content, and they hold DIFFERENT THINGS: a navigation rail lists this page's
	   children, and an arrangement panel is anything else — a filter, the properties
	   of the thing you are reading. `blocks.js` has said so in words since 2026-09-05
	   and this renderer drew the children for both, which made the distinction the
	   vocabulary insists on invisible on screen. */
	panel(side){
		return div.c("paging-aside", () => {
			span.c("paging-eyebrow", side === "left" ? "filters" : "properties");
			(side === "left"
				? ["Everything", "Only mine", "Shared with me", "Archived"]
				: ["Anyone with the link can read", "Edited 2 hours ago", "4 pages under this one", "Comments on"])
				.forEach(words => span.c("paging-aside-row", words));
		});
	}

	aside(){
		return div.c("paging-aside", () => {
			span.c("paging-eyebrow", "on this page");
			["Notes that other people can read", "What a child costs", "Writing a page"]
				.forEach(words => span.c("paging-aside-row", words));
		});
	}

	// The way out of a full-screen stage, always at the top-left where the eye is.
	exit(){
		return this.press(span.c("paging-exit", () => {
			icon("close_fullscreen");
			span("leave full screen");
		}), null, () => this.set("room", "reading"));
	}

	// ── clicking ─────────────────────────────────────────────────────────────
	/* ⚠ A CLICKABLE THAT IS NOT A `<button>`. The site theme styles every `button`
	     as a small uppercase CTA at (0,2,0) in the same layer, so a chip cannot win
	     that at its own specificity and the answer the styles docs already reached
	     is a clickable span. The keyboard half is what a button gave for free, so
	     it is restated here. */
	press($el, i, act){
		return $el.attr("role", "button").attr("tabindex", "0")
			.click(() => (act ?? (() => this.pick(i)))())
			.on("keydown", e => {
				if (e.key !== "Enter" && e.key !== " ") return;
				e.preventDefault();
				(act ?? (() => this.pick(i)))();
			});
	}

	/* ONE SEAM for every click on a child. Measures the box, redraws, measures again
	   — so the caption reports what happened rather than what was intended.
	   ⚠ `getBoundingClientRect()` flushes layout synchronously, so the "after" is
	     real and no frame has to be waited for. */
	pick(i){
		const was = this.open === null ? null : this.pages[this.open].title;
		const before = this.rect();

		this.open = this.open === i ? null : i;

		this.redraw();

		this.change = {
			from: was ?? "the page itself",
			to: this.open === null ? "the page itself" : this.pages[this.open].title,
			before, after: this.rect(),
		};

		this.$cap?.empty(() => { this.caption(); });

		/* ⚠ WHICH CHILD IS OPEN LIVES HERE, and a caller that REBUILDS this view on
		     every press needs to know it — the builder redraws its whole middle column
		     when you touch a control, so without this hook the tab you were on reset
		     itself. One hook, same shape as `changed`. */
		this.picked?.(this.open);
		return this;
	}

	// Change one word of the configuration. The toolbar, the drawer and the preset
	// dropdown all come through here, so "a chip" and "a line of code" are one call.
	set(axis, value){
		const was = this.config[axis];
		if (was === value) return this;

		const before = this.rect();
		this.config = { ...this.config, [axis]: value };

		// A navigation word that cannot hold an open child closes it rather than
		// leaving a stage in a state its own word does not describe.
		if (axis === "navigation" && value === "none") this.open = null;

		this.redraw();

		/* ⚠ `changed` TELLS; `keep` WRITES — and they are two hooks because the bar
		     already owns `changed` (it writes its own dropdowns back through it), so a
		     page that wanted to SAVE the word you just set had nowhere to hang. That is
		     why five of the seven words could be saved and two could not: the bar on a
		     page you made changed the address and never the file (paging-audit-5b).
		     A stage on a page that OWNS these words sets `keep`; a demo leaves it unset
		     and nothing persists, which is decision 4.
		   ⚠ AND IT RUNS BEFORE THE ADDRESS IS WRITTEN. A page that keeps the word also
		     moves its OWN words (`base`) to match, and the query says only what differs
		     from those — so saving a word leaves the address clean instead of carrying
		     a `?room=wide` the file already says. */
		this.keep?.(axis, value);

		/* THE ADDRESS IS THE CONFIGURATION. One `replaceState` per change, so the page
		   you are looking at is always the page the url names — copy it, send it, open
		   it cold, and you get this. `url.js` has the whole seam. */
		if (!this.inner) write_url(this.config, this.base, this.nest, this.base_nest);

		this.change = { axis, from: title_of(axis, was), to: title_of(axis, value), before, after: this.rect() };
		this.$cap?.empty(() => { this.caption(); });

		this.changed?.(axis, value);
		return this;
	}

	redraw(){ this.paint(); this.empty(() => { this.frame(); }); return this; }

	/* ── ARRIVING AT A PAGE THAT WAS ALREADY BUILT ────────────────────────────
	   A page in this realm is built ONCE: core caches it, and the second time you
	   arrive `activate()` re-appends the view it already has. So a stage that read the
	   address when it was built is still showing that answer — and the realm's FRONT
	   page is worse, because it is built at boot and merely hidden, so a link into it
	   carrying a configuration (`cross/`'s nine cells) reached a stage that had made up
	   its mind before the link existed. Measured 2026-09-05.

	   This re-reads the address and redraws. When the address says nothing about this
	   page, the words go back to the page's own — which is decision 4, a demo does not
	   persist. `paging.js` calls it on arrival. */
	reopen(){
		if (this.inner) return this;

		const opening = from_url(this.base, this.page?.url);

		this.config = opening.config;
		// ⚠ `undefined` is "the address said nothing", so the page keeps its own nest;
		//   `null` is "the address said none", which is a nest you clicked off and sent.
		this.nest = opening.nest === undefined ? this.base_nest : opening.nest;
		this.open = this.base_open ?? null;
		this.change = null;

		this.redraw();
		this.changed?.();        // the toolbar writes its dropdowns back
		return this;
	}

	rect(){
		const box = this.$box?.el?.getBoundingClientRect();
		return box ? { w: Math.round(box.width), h: Math.round(box.height) } : null;
	}

	// ── the caption ──────────────────────────────────────────────────────────
	/* WHAT JUST CHANGED, and what it did to the box. Never a conclusion, never a
	   claim — a report, in the reader's own words and in pixels. ("Nothing on this
	   page navigates" and "Same box" were deleted on 2026-09-05: both are things you
	   only understand after you have already seen it work.) */
	caption(){
		const change = this.change;

		// ⚠ The invitation has to match the page. On a stage whose navigation word is
		//   `none` there are no page names to click, and the line said to click one.
		if (!change) return p.c("muted", this.config.navigation === "none"
			? "Change a word in the bar above. This line will say what changed, in pixels."
			: "Click a page name, or change a word in the bar above. This line will say what changed.");

		const moved = this.moved(change.before, change.after);

		return p(() => {
			span.c("paging-cap-what", change.axis
				? title_of(change.axis, change.to)
				: change.from + " → " + change.to);
			span(" " + moved);
		});
	}

	moved(before, after){
		if (!before || !after) return "";

		const dw = after.w - before.w, dh = after.h - before.h;

		if (!dw && !dh) return "The box did not move: still " + after.w + " × " + after.h + "px.";
		if (dw && dh)   return "The box went from " + before.w + " × " + before.h + "px to " + after.w + " × " + after.h + "px.";
		if (dh)         return "The box is " + Math.abs(dh) + "px " + (dh > 0 ? "taller" : "shorter") + " — same width.";

		return "The box is " + Math.abs(dw) + "px " + (dw > 0 ? "wider" : "narrower") + " — same height.";
	}
}

export const Stage = PagingStage;
export default PagingStage;
