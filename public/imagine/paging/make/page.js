import { Page, View, div, p, h1, span, a, icon, md } from "/app.js";
import { Paging } from "../paging.js";
import { Stage } from "../stage.js";
import { config_of, mode_for } from "../blocks.js";
import { baseline } from "../baseline.js";
import { draw_blocks } from "../build/draw.js";
import { store_for, LocalStore, at, walk, name_for, clone, file_of, SEED, DEFAULTS } from "./made.js";
import { tree_pane } from "./tree.js";
import { settings_pane } from "./settings.js";
import { Pick, pick_at, paint, dress, announce, clicking_off, escaping, same_path } from "./select.js";
import { real_pane, commit as commit_real } from "./real.js";
/* ⚠ THE ONE TRANSLATION FROM A SAVED `page.json` TO A STAGE — whose children to draw
     and what to put in the box. It lives in `../stage.js` because a page NESTED inside
     another needs exactly the same answer, and writing it here alone is what made a
     made page draw somebody else's tabs the moment it was nested (paging-audit-5b). */
import { stage_props } from "../stage.js";

View.stylesheet(import.meta, "make.css");

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the realm's middle (`.paging-app-centre`), which is a page grid —
                so the screen claims `wide`, the same track Build's card claimed.
                Not a columns host: `Paging.column_host()` returns undefined.
   2 SIZE       `wide` is 957px at 1280, ~1500px at 1920 and ~2850px at 3440. Three
                tracks, each with a floor and a ceiling: the tree `min(24%, 26rem)`,
                the settings `min(30%, 30rem)`, and the LIVE PAGE takes everything
                left — which at 3440 is most of the screen. Under 54rem of SCREEN
                width (not window width) the three stack, in the reading order
                tree · page · settings.
   3 OWN LAYOUT every pane is a `flex v gap` stack — tool rhythm (`--gap`), never
                prose rhythm (`--flow`), and no `--measure` cap on any of them.
   4 REGIONS    one — core's. The pages you make are real CHILDREN of this page and
                open at their own urls; `index: true`, because this screen already
                lists every one of them.
   5 PREVIEW    core's default card.

   ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────────
   ONE SCREEN for making pages, and there is no second one. The tree on the left is
   every page you have made; the middle is the page you have selected, drawn for
   real; the right is everything that page says about itself. Click a row and all
   three agree; change anything on the right and the middle moves on the same frame.

   In dev every page here is a REAL FILE on disk that you can open in an editor,
   edit by hand, and commit.

   ⚠ IT USED TO BE TWO SCREENS. `/imagine/paging/build/` had the live page and no
     tree; this page had the tree and no live page — so you made a page in one place
     and found out what it looked like in the other, and neither could do the job
     alone (the owner, 2026-09-13: *"are they rendered somewhere? were they supposed
     to be?"*). Build is one sentence and a link now; everything it could do is here.

   ── HOW IT WORKS, IN THREE SENTENCES ──────────────────────────────────────────
   1. A page is a plain JSON object: a title, the realm's seven words, and a list of
      the names of its children. Nothing else.
   2. `children:` already accepts real `Page` objects and `Page.add()` gives each one
      a real url — so turning that JSON into a live tree needs no new machinery.
   3. Every edit produces a NEW TREE and hands it to `apply()`, which redraws the
      screen and works out the smallest set of files that gets there. Nothing is
      patched in place, so the tree, the live page and the files on disk can never
      disagree.

   ⚠ WHERE the pages live is `made.js`, and only `made.js`: files under
     `public/imagine/paging/made/` when a dev socket answers, `localStorage` when
     none does. This file never asks which. `../doc/persistence.md` is the rule.

   ⚠ A page's URL and its FILE PATH are deliberately different. The page you made is
     a child of THIS page, so its url is `/imagine/paging/make/notes/`; its file is
     `/imagine/paging/made/notes/page.json`. `make/` is the tool and stays one
     directory of code; `made/` is the data it writes.                             */


/* JSON → REAL PAGES. Each node becomes a `Paging` wearing its seven words, and its
   own children are built the same way. `Page.add()` (reached through `declare()`)
   hands each one a real url derived from this page's.

   `make` is the Make page itself and `path` is where this node sits in its tree —
   the two things the bar over a made page needs in order to WRITE what you set.

   ⚠ NOT `Page.from()`, AND THE TWO ARE NOT DOING THE SAME JOB. Core's `Page.from()`
     reads a `page.json` OFF DISK, at a url, and hands back a plain `Page` — the right
     seam for "run the page at this address", which is what the stage's `content` word
     and `?nest=` use. This walks a tree Make ALREADY HAS IN MEMORY (`make.tree`, the
     one thing every edit rebuilds) and hangs the editor on each node: `node_now()` so
     the drawer prints the page as it is now rather than as it was one click ago,
     `delete_now()` so a page can be unmade, and a `content()` whose bar WRITES what
     you set. Swapping this for `Page.from()` would re-fetch every file Make is holding
     and drop all three. */
/* ── A PAGE YOU MADE IS A CORE PAGE CARRYING ITS OWN FILE ─────────────────────
   `data:` hands core the very object `made.js` writes to disk, so the title, the icon
   and the description are read off the FILE by core's own reader — `Page.props()` — and
   not one line below copies them. One function, `file_of()`, now answers three questions
   that used to be answered separately: what gets written, what the drawer prints, and
   what the live page says about itself. `core/Page/doc/data.md`.

   ⚠ TWO THINGS CORE MUST NOT READ OFF THAT FILE, and both are because MAKE'S URLS ARE
     NOT ITS FILE PATHS — a made page lives at `/imagine/paging/make/notes/` and its file
     lives at `/imagine/paging/made/notes/page.json`.

     THE SIX PAGE WORDS. This realm draws them itself, through the Stage in `content()`
     below; letting core stamp them as well would put a second frame around every made
     page. `props()` here answers with the three LABELS and nothing else, which is
     exactly the one-method override core's `props()` was split out for.

     THE CHILDREN. A name in a `page.json` resolves against that file's own directory,
     which is `made/` — these pages are under `make/`, and `grow()` builds them from the
     tree Make is already holding in memory. So `read_data()` reads the labels and
     answers with no children at all.

   ⚠ THE SAME PAGES, OPENED AT THEIR FILE URLS, ARE ORDINARY CORE PAGES — try
     [/imagine/paging/made/notes/](/imagine/paging/made/notes/). No Make, no Paging, no
     override: core's own `page.json` rung reads the same file and the six words DO draw
     core's frame. Two readers, one file. */
class MadePage extends Paging {
	static props(data){ return { title: data.title, icon: data.icon, description: data.description }; }
	read_data(data){ super.read_data(data); return []; }
}

function grow(nodes, make, path = []){
	return nodes.map(node => {
		const config = config_of(node);
		const here = [...path, node.name];

		return new MadePage({
			name: node.name,
			data: file_of(node),

			/* ⚠ KEEP CORE'S OWN `h1`. `Paging.render()` removes it from every page in
			     this realm, because a demo page opens on its demo and the h1 was the
			     first 193px of the screen. A page you MADE is not a demo — it is a page,
			     and the one thing every page on this site says at the top is its own
			     name (the owner, 2026-09-13). */
			heading: true,
			children: grow(node.children ?? [], make, here),

			/* ⚠ READ OUT OF THE TREE, NOT OUT OF THE CLOSURE. `node` is the node this
			     page was GROWN from; every edit rebuilds the tree, and this view stays on
			     screen — so the closure's copy goes stale the moment you set a word in the
			     bar, and the drawer would print the page as it was one click ago. */
			node_now(){ return at(make.tree, here); },

			/* WHERE THIS PAGE ACTUALLY IS. The drawer's first box asks the page for its
			   own address before it decides there isn't one — a page you made HAS one,
			   whether you are standing on it or looking at it in Make's middle. */
			node_url(){ return this.url; },

			/* ── AND IT CAN BE UNMADE ─────────────────────────────────────────
			   `remove_at()` is Make's own one write seam and it does both halves in one
			   save: `rm` on the directory, and the parent's file rewritten without the
			   name. ⚠ IT ANSWERS WITH WHERE TO GO — the page you are standing on has
			   just stopped existing — and the parent url is read BEFORE the removal,
			   while the parent page is still in the tree. */
			delete_now(){
				const back = here.length > 1 ? (make.at_path(here.slice(0, -1))?.url ?? make.url) : make.url;
				make.remove_at(here);
				return back;
			},

			content(){
				/* THE STAGE DRAWS THIS PAGE: its own children by its own navigation word,
				   and its own blocks in the box. `stage_props()` (`../stage.js`) is the one
				   translation, so this page and the same page nested inside another draw
				   the same thing. `../doc/builder.md` records the decision. */
				const stage = this.stage(config, stage_props(node, {
					page: this,
					url_of: kid => this.children?.get(kid.name)?.url,
				}));

				/* ⚠ THE RUN WORDS ARE PUT ON HERE TOO, not only in Make's middle. A run of
				     text can say three things about itself (tone, size, align) and they are
				     stored on the block; `dress()` is the one place that turns them into
				     classes, and it has to run on BOTH drawings or the word you set in the
				     editor would be true only inside the editor. `select.js`. */
				dress(stage.el, at(make.tree, here));

				/* ── THE BAR ON YOUR OWN PAGE IS AN EDITOR ────────────────────────
				   Every other stage in the realm is a demo: you change a word, the address
				   says so, and a refresh puts it back (decision 4). THIS page is yours —
				   the words in the bar are the words in its file — so the bar writes them,
				   through Make's own one write seam. */
				const $kept = p.c("muted paging-kept");

				stage.keep = (axis, value) => {
					// The file says this now, so it is one of the page's OWN words and the
					// address has nothing left to say about it.
					stage.base = { ...stage.base, [axis]: value };
					make.edit_at(here, { [axis]: value });

					$kept.empty(() => {
						icon("check_circle");
						span("Saved to " + here.join("/") + "/page.json. Reload and it is still there.");
					});
				};

				stage.keep_nest = id => {
					stage.base_nest = stage.nest;
					make.edit_at(here, { nest: id ?? undefined });

					$kept.empty(() => {
						icon("check_circle");
						span(id ? "Saved. " + (stage.nest?.title ?? id) + " runs inside this page now."
							: "Saved. The page that was inside this one has been taken out.");
					});
				};

				this.lede("A real page at a real url, drawn from one small JSON file. Change a word in the bar and it is written to the file. [Edit it in Make](/imagine/paging/make/).");
			},
		});
	});
}


export default new Paging({
	meta: import.meta,
	title: "Make",
	description: "One screen for making pages: the tree, the page itself, and everything it says.",
	icon: "add_circle_outline",
	index: true,

	/* ⚠ NO TAKEAWAY, AND NO LEDE. It described the three panes the reader is looking at
	     — "the tree on the left is every page you have made, the middle is the one you
	     picked drawn for real…" — 55 words telling you what the picture already shows,
	     which is the defect that was deleted from the other screen and left on this one
	     (self-evident-critique-2, finding 5). The one sentence that was doing real work
	     is the one the picture CANNOT show — which host is writing, disk or browser —
	     and `where()` below has said it, under the screen, all along. */

	// ── loading ───────────────────────────────────────────────────────────────
	/* ⚠ `made`, NOT `store` — `store()` is core's own method on every Page, and a FIELD
	     of that name shadows it: `LocalStore` calls `this.page.store()` and would get an
	     object instead of a function. */
	initialize(){ this.made = store_for(this); },

	/* THE PAGES YOU MADE, AS REAL CHILDREN. `children` may be a FUNCTION that returns a
	   promise, and core calls it ONCE, on the first ask — the Router walking into a made
	   page, or a cold landing on this screen. So `/imagine/paging/make/notes/today/`
	   pasted into a new tab waits for the file store, then draws.
	   ⚠ NOT `initialize()`: the store is a fetch, and a constructor may not fetch. Until
	     2026-09-17 this file wrote `child()` and `load_all_children()` itself, with a copy
	     of core's own guard; `core/Page/doc/data-children.md` says why that is core's now. */
	children(){
		return this.made.load().then(tree => {
			this.tree = tree;
			return grow(tree, this);
		});
	},

	// ── the one write seam ────────────────────────────────────────────────────
	/* EVERY edit calls this with the tree it wants. The screen is redrawn from the
	   new tree immediately and the store catches up behind it, so a click never waits
	   on a file — and if the write fails (the dev server went away mid-session) the
	   page falls back to the browser store and says so rather than losing the edit. */
	apply(next_tree, options){
		const was = this.tree;

		this.tree = next_tree;
		this.regrow();
		this.redraw(options);

		this.made.save(next_tree, was).then(() => this.settled()).catch(() => this.settled());

		return this;
	},

	/* ⚠ IT REDRAWS ONLY WHEN THE STORE CHANGED UNDER IT. This used to redraw after
	     EVERY save, which was invisible while the only control was a chip — and is a
	     cursor thrown out of a text field one keystroke later now that the right pane
	     is full of inputs. The fallback (the dev server went away mid-session) is the
	     one case where the screen really is out of date: the edit is saved in the
	     browser instead and the line under the tree changes to say so. */
	async settled(){
		if (!this.made.failed) return this;

		this.made = new LocalStore({ page: this });
		await this.made.save(this.tree, []);

		return this.redraw();
	},

	// ⚠ A NEW MAP FIRST. `declare()` ADDS to the children already there, so re-growing
	//   without clearing would leave the previous tree's pages standing beside the new.
	regrow(){ this.children = new Map(); return this.declare(grow(this.tree ?? [], this)); },

	/* ── THE ONE REDRAW ───────────────────────────────────────────────────────
	   Three panes, and a caller says which of them it is standing in. The rules:

	     tree      cheap, and nothing in it holds focus — redrawn unless a drag is
	               mid-flight.
	     centre    a NEW `Stage`, so the settings go with it (below).
	     settings  holds the text fields, so anything that types passes `false`.

	   ⚠ THE SETTINGS FOLLOW THE CENTRE, ALWAYS. The bar in the settings pane holds a
	     reference to the stage in the centre (`Toolbar.stage`), so a rebuilt centre
	     with the old bar over it leaves seven dropdowns wired to a stage that is no
	     longer on screen — every one of them a silent no-op. One `||` is the whole
	     fix, and it is why no caller ever passes `centre: true, settings: false`. */
	redraw({ tree = true, centre = true, settings = true } = {}){
		this.settle_pick();
		this.settle_sel();

		if (tree) this.$tree?.empty(() => { this.tree_pane(); });
		this.$where?.empty(() => { this.where(); });
		if (centre) this.$centre?.empty(() => { this.centre(); });
		if (centre || settings) this.$settings?.empty(() => { this.settings(); });

		this.$baseline?.check();
		this.app?.router?.mark_links();

		// ⚠ LAST, because it reads the DOM the three lines above just rebuilt.
		return this.repaint();
	},

	count(){ return walk(this.tree ?? []).length; },

	// ── which page you are editing ────────────────────────────────────────────
	/* A PATH, not a node — the node is looked up fresh on every read, so a redraw can
	   never show you the page as it was one edit ago. `[]` means nothing is picked,
	   which is only true when you have no pages at all. */
	/* ⚠ AND IT HAS TO SURVIVE A DELETE. The page you were editing can stop existing
	     (you deleted it, or an ancestor took it with it), so this walks up to the
	     nearest surviving ancestor and falls back to the first page in the tree. */
	settle_pick(){
		const nodes = this.tree ?? [];

		if (this.picked?.length && at(nodes, this.picked)) return this;

		let path = (this.picked ?? []).slice(0, -1);
		while (path.length && !at(nodes, path)) path = path.slice(0, -1);

		this.picked = path.length ? path : (nodes[0] ? [nodes[0].name] : []);
		return this;
	},

	/* ── THE ONE SELECTION ────────────────────────────────────────────────────
	   Two words, and they are NOT the same thing:

	     picked   WHICH PAGE the middle is drawing. It always has one (there is nowhere
	              else for the middle to go), and the tree row for it is lit.
	     sel      WHAT IS SELECTED inside that page — the page itself, one of its blocks,
	              or one run inside a block. It can be NOTHING, and then the right pane
	              says so and shows no controls at all.

	   Clicking a tree row does both: it opens that page in the middle and selects the
	   page, which is what the right pane then fills with. `select.js` is the rest. */
	pick(path){
		this.picked = path;
		this.asking = false;
		this.real_picked = this.real_move = this.real_fail = null;   // a made page and a real one are never both selected
		this.sel = new Pick({ kind: "page", path, what: at(this.tree ?? [], path)?.title });

		this.redraw();
		announce(this.sel);
		return this;
	},

	/* A CLICK IN THE MIDDLE. `pick_at()` answers what was clicked — and answers
	   `undefined` for a click on a link or a button inside the drawn page, which means
	   "leave it alone": the page you are editing is a real page and its own controls
	   keep working. */
	click_middle(event){
		const node = this.node_now();
		if (!node) return this;

		const next = pick_at(event.target, node, this.sel, this.picked);
		return next === undefined ? this : this.select(next);
	},

	/* THE ONE WRITE OF `sel`, and the only place the document is told. Only the right
	   pane is rebuilt — the middle has not changed, and rebuilding it would throw away
	   the very element the ring is about. */
	select(sel){
		this.sel = sel ?? null;
		this.asking = false;

		this.$settings?.empty(() => { this.settings(); });
		this.repaint();
		announce(this.sel);

		return this;
	},

	// A block written AND selected in one act — what "Add a block" and the two arrows
	// both want, since the thing you just made or moved is the thing you are editing.
	select_block(path, at_index, blocks){
		this.sel = new Pick({ kind: "block", path, at: at_index, what: blocks[at_index]?.type });
		return this.edit_at(path, { blocks });
	},

	// The tree's × opens the right pane's own delete question, about the row you pressed.
	ask_delete(path){
		this.picked = path;
		this.sel = new Pick({ kind: "page", path, what: at(this.tree ?? [], path)?.title });
		this.asking = true;
		return this.redraw();
	},

	/* THE OUTLINE AND THE BADGE, AND THE RUN WORDS — everything that is written ONTO the
	   drawn page rather than built with it. Run after every redraw, and again by hand
	   whenever the stage redraws itself in place (typing in a paragraph). */
	repaint(){
		dress(this.$centre?.el, this.node_now());
		paint(this.$centre, this.sel);
		return this;
	},

	/* ⚠ THE SELECTION HAS TO SURVIVE THE PAGE UNDER IT CHANGING. You can delete the block
	     that is selected, or the page it was in; `settle_pick()` above already walks the
	     picked path back to a page that exists, and this walks the selection back to the
	     largest thing that still does — the page.

	   ⚠ `null` AND `undefined` ARE NOT THE SAME STATE HERE, and the whole of this method
	     turns on it. `null` is "the reader pressed Escape, or clicked off" — a state they
	     chose, and it is left alone so the pane keeps saying "select something". `undefined`
	     is "nobody has ever selected anything", which is only true on the first draw — and
	     on the first draw the page in the middle IS what you are looking at, so it is what
	     is selected. Opening this screen on an empty right pane would be a worse first
	     screen than the one this pass replaced. */
	settle_sel(){
		const node = this.node_now();

		if (!node) return void (this.sel = null);
		if (this.sel === null) return this;

		const here = () => new Pick({ kind: "page", path: this.picked, what: node.title });

		if (!this.sel) return void (this.sel = here());

		const gone = !same_path(this.sel.path, this.picked)
			|| (this.sel.kind !== "page" && !(node.mode?.blocks ?? [])[this.sel.at]);

		if (gone) this.sel = here();
		else if (this.sel.kind === "page") this.sel.what = node.title;

		return this;
	},

	// The node you are editing, read live out of the tree. `null` when there is none.
	// ⚠ `at(tree, [])` answers the tree's STAND-IN PARENT, which is not a page.
	node_now(){ return this.picked?.length ? (at(this.tree ?? [], this.picked) ?? null) : null; },

	/* THE ADDRESS OF THE PAGE YOU PICKED — the same one the middle prints under its
	   title, answered for the drawer.

	   ⚠ THE DRAWER IS ABOUT THE PICKED PAGE, NOT ABOUT THIS SCREEN. Its first box used
	     to open with "There is no link to this exact page" while that page's real url
	     was a live link four inches to the left: the box asks `stage.inner`, and this
	     screen's stage IS inner (a page drawn inside another page never reads or writes
	     the address bar) — but "cannot write the address" is not "has no address"
	     (self-evident-critique, defect 1). */
	node_url(){ return this.at_path(this.picked)?.url ?? null; },

	// The live page a path stands for, so the middle can link its real url.
	at_path(path){
		let page = this;
		for (const name of path) page = page?.children?.get(name);
		return page;
	},

	// ── the screen ────────────────────────────────────────────────────────────
	content(){
		// ⚠ THE MARK STAYS ON TOP. Every other page in this realm opens straight onto
		//   its demo with the sentence underneath — but this page really does write
		//   files, and "it remembered you" is the one thing that must be visible before
		//   you touch anything (`../doc/persistence.md`).
		mark(this);

		// ⚠ BEFORE THE SCREEN, because the left pane reads it on its first draw.
		this.real_for(new URLSearchParams(location.search).get("real"));

		this.screen();

		/* ── LETTING GO ───────────────────────────────────────────────────────
		   Escape clears the selection; so does a click on anything that is not one of the
		   three panes. Both are `ext/Panel`'s own rules, in `select.js`, for the reason
		   that module records: a control that redraws its own pane has detached the
		   clicked button by the time a bubbling listener runs. */
		this.letting_go ??= [
			escaping(() => this.sel && this.select(null)),
			clicking_off(() => this.sel && this.select(null)),
		];

		// ⚠ UNDER THE SCREEN, NOT IN THE TREE. It is one sentence naming the store and
		//   it wrapped to six lines inside a 230px pane. Redrawn on every edit, because
		//   the answer can change mid-session if the dev server goes away.
		this.$where = p.c("muted paging-make-where-line", () => { this.where(); });

		md.details(import.meta, "readme.md", "Readme — what each pane does, and the traps");
	},

	/* ── THE THREE PANES ──────────────────────────────────────────────────────
	   ⚠ CAPTURED NOW, FILLED IN A CALLBACK. `ready()` is a fetch, and a factory call
	     after the await would land in whatever box is current by then. */
	screen(){
		return div.c("paging-make-screen wide", () => {
			/* ⚠ TWO ELEMENTS, NOT ONE. A box cannot answer its own container query,
			     so the outer one measures and this one reads the measurement. */
			div.c("paging-make-panes", () => {
				this.$tree = div.c("paging-make-pane paging-make-left", () => { p.c("muted", "Loading…"); });

				/* ⚠ ONE LISTENER, ON THE PANE — not on the page inside it. The middle is
				     emptied and rebuilt on nearly every edit, so anything bound to what it
				     holds would be gone a keystroke later. This box is built once. */
				this.$centre = div.c("paging-make-pane paging-make-middle").on("click", e => this.click_middle(e));

				this.$settings = div.c("paging-make-pane paging-make-right");
			});

			this.source_children().then(() => this.redraw());
		});
	},

	tree_pane(){ return tree_pane(this); },

	/* ⚠ A REAL PAGE OWNS THE PANE WHEN IT HAS ONE. The rule this screen is built on is
	     "a control that is not about the thing you have selected is not on screen"
	     (doc/decisions.md), and a real page you dragged IS the selected thing — the made
	     page's own rows would be about something else entirely. `real_pane()` answers
	     null whenever no real page is selected and no move is pending, and then this is
	     the pane it always was. */
	settings(){
		const real = real_pane(this);
		if (real) return real;

		const node = this.node_now();
		return node && this.$stage ? settings_pane(this, node, this.picked, this.$stage) : null;
	},

	// ── real pages: the directories, moved on disk ────────────────────────────
	/* Read on every render, because the address is where it lives — `?real=<url>` and the
	   left pane grows a group for that subtree. Changing the url forgets everything the
	   old one had selected or pending; nothing half-belonging to one tree survives into
	   another. `real.js` is the whole of what a real page means here. */
	real_for(url){
		const want = url ? "/" + String(url).replace(/^\/+/, "").replace(/\/*$/, "/") : null;
		if (want === this.real_url) return this;

		this.real_url = want;
		this.real = this.real_loading = null;
		this.real_picked = this.real_move = this.real_undo = this.real_fail = null;
		return this;
	},

	pick_real(url){
		if (!url) return this;

		this.real_picked = url;
		this.real_move = this.real_fail = null;
		return this.redraw({ tree: false, centre: false });
	},

	// A drop asks; it never writes. `null` is Cancel.
	propose_real(plan){
		this.real_move = plan;
		this.real_fail = null;
		if (plan) this.real_picked = plan.from;

		return this.redraw({ tree: false, centre: false });
	},

	/* THE BUTTON THAT ACTUALLY MOVES A DIRECTORY. `commit()` does the four steps in
	   `real.js`; this one owns what the screen says while they run and afterwards.
	   ⚠ THE TREE IS REDRAWN, and it has to be: `commit()` moved the live pages in memory
	     the same way it moved the files, so the pane rebuilt from them is the new tree. */
	async run_real_move(plan, { undoing } = {}){
		this.real_move = this.real_fail = null;
		this.real_busy = plan;
		this.redraw({ centre: false });

		const done = await commit_real(plan);
		this.real_busy = null;

		if (!done.ok){
			this.real_fail = done.why;
			return this.redraw({ centre: false });
		}

		this.real_picked = done.was_to;

		// The cached links.json preview is now stale (a move just rewrote some of it, on
		// the server) — forget it so the NEXT proposed move fetches a fresh copy rather
		// than showing yesterday's count. `real.js`'s `links_of()` reloads on demand.
		this.real_links = this.real_links_loading = undefined;

		// ⚠ ONE STEP, NEVER A STACK. An undo offers no undo of its own — "no history
		//   beyond that" is the decision, and a redo is history (doc/decisions.md).
		this.real_undo = undoing ? null : done;

		clearTimeout(this.real_timer);
		if (this.real_undo) this.real_timer = setTimeout(() => this.forget_real_undo(), 60000);

		return this.redraw({ centre: false });
	},

	forget_real_undo(){
		clearTimeout(this.real_timer);
		this.real_undo = this.real_fail = null;
		return this.redraw({ tree: false, centre: false });
	},

	/* ── THE MIDDLE: THE PAGE ITSELF ──────────────────────────────────────────
	   Not a picture of it and not a description of it — the same `Stage` a made page
	   draws at its own url, from the same `stage_props()`. What you see here is what
	   the page shows. */
	centre(){
		const node = this.node_now();

		if (!node) return p.c("muted", "No page yet. Press “New page” on the left and it appears here.");

		const page = this.at_path(this.picked);

		this.head_line();


		/* ⚠ `draw` READS THE NODE FRESH, rather than closing over this one. Typing in a
		     prose block must move the middle WITHOUT rebuilding it — the textarea being
		     typed in is on screen and the cursor is in it — so the stage is redrawn in
		     place, and a closure over `node` would redraw the text as it was one
		     keystroke ago. Everything else `stage_props()` answers is structural and is
		     rebuilt with the pane. */
		const props = stage_props(node, { page: this, url_of: kid => page?.children?.get(kid.name)?.url });

		this.$stage = new Stage({
			config: config_of(node),
			...props,
			/* ⚠ `sample()` IS ALWAYS CALLED, with or without blocks. `draw` REPLACES the
			     stage's own call to it, so a `draw` that returns early on a page with no
			     blocks left the box holding nothing but its children list — the content
			     word set in the bar drew nothing at all, and no control said so. `named`
			     is "blocks were drawn above this", which is what puts the eyebrow over
			     the sample naming the control it belongs to.
			   ⚠ AND WITH NO BLOCKS THE SAMPLE STILL NAMES ITSELF, above the box's first
			     word: a page you just made opened on 300 words of somebody else's article
			     under your own title, and the only thing that said so was a grey line
			     below the whole article — off screen at a 900px window
			     (self-evident-critique, defect 2). */
			draw: stage => {
				const drew = !!draw_blocks(this.node_now(), this);
				if (!drew) stage.sample_note();
				stage.sample(drew);
			},
			// ⚠ `inner` — a page drawn INSIDE another page never reads or writes the
			//   address. Two stages writing one url would fight, and this screen's own
			//   url is not the edited page's.
			inner: true,
			page: this,
			classes: "paging-make-live",
		});

		this.$stage.keep = (axis, value) => {
			// The file says this now, so it is one of the page's OWN words.
			this.$stage.base = { ...this.$stage.base, [axis]: value };
			this.edit_at(this.picked, { [axis]: value }, { centre: false, settings: false });
		};

		/* THE EIGHTH THING A PAGE SAYS: the page INSIDE it. Its own hook, because it is
		   not one of the seven and has no axis to name. */
		this.$stage.keep_nest = id => {
			this.$stage.base_nest = this.$stage.nest;
			this.edit_at(this.picked, { nest: id ?? undefined }, { centre: false, settings: false });
		};

		// The run words, put onto the runs — the same call the page at its own url makes.
		dress(this.$stage.el, node);

		/* ⚠ AND NOTHING IS SAID UNDER THE PAGE. There was a grey line here explaining
		     that the text in the box is the content word's sample — 300 words BELOW the
		     sample it was about, off screen at a 900px window. The sample says it itself
		     now, one line above its own first word (self-evident-critique, defect 2). */
		return this.$stage;
	},

	/* THE PAGE'S OWN TITLE, and its real address as a link that opens it — the one
	   thing a picture of a page cannot be.

	   ⚠ A REAL `h1.page-title`, the same heading core writes at the top of every page
	     on this site. The owner, 2026-09-13: *"the Notes page should have an h1 'Notes'
	     right?"* — right, and a page you made had none anywhere: `Paging.render()`
	     strips core's h1 on every page in this realm (a demo opens on its demo), so a
	     made page was the one page where that rule was wrong. The pages `grow()` builds
	     carry `heading: true` now, so the page at its own url has it too.

	   `$head` is its own box so renaming redraws the title without rebuilding the
	   stage under it. */
	head_line(){
		return this.$head = div.c("paging-make-head", () => { this.head_parts(); });
	},

	/* ⚠ THE HEAD IS WHAT THE PAGE'S OWN HEAD IS, and nothing else. Core writes
	     `h1.page-title` at the top of every page body, ABOVE the stage — so on
	     `/imagine/paging/make/notes/` you get "Notes" at `clamp(1.75rem, 9vw, 3em)`
	     and then the box. This preview draws the same h1, at core's own size, in the
	     same place, so the picture and the page agree.

	     Putting the h1 INSIDE the stage box instead was the other option and it is
	     the wrong one: the page does not do that, and a preview that invents a
	     heading the page has not got is a picture of a different page.

	     The icon went with the change for the same reason — the page shows no icon
	     beside its title, and the icon is already said twice (the tree row, and the
	     ICON control on the right). The url drops to its own line under the heading
	     as the caption it is. */
	head_parts(){
		const node = this.node_now();
		if (!node) return null;

		const page = this.at_path(this.picked);

		h1.c("page-title paging-make-head-title", node.title);

		if (page?.url) a.c("paging-make-url").attr("title", "open " + node.title + " at its own address")
			.href(page.url).append(() => { span(page.url); icon("open_in_new"); });

		/* ⚠ AND WHEN THE TWO DISAGREE, IT SAYS SO. Rename a page and the title, the
		     tree row and the file all change on the keystroke — the address does not,
		     because the directory is named once, when the page is made, so a url
		     anybody saved keeps working (`move_to()` below keeps the same rule). That
		     is deliberate and it was invisible: a page renamed on the keystroke sat four
		     lines above `/imagine/paging/make/new-page/` with nothing between them
		     (self-evident-critique-2, finding 11). Only when they actually disagree —
		     on a page whose name still matches its title there is nothing to explain. */
		if (page?.url && Page.slug(node.title) !== node.name)
			p.c("muted paging-make-note", "The address was set when this page was made. Renaming it never moves the page, so links anybody saved still work.");

		return this;
	},

	// Redrawn on its own when the title or the icon changes — the two edits the stage
	// does not show and the header does.
	rehead(){ this.$head?.empty(() => { this.head_parts(); }); return this; },

	// ── create · update · delete, each one a new tree ─────────────────────────
	// ⚠ The tree is CLONED before it is changed. `apply()` compares the new tree with
	//   the old one to decide which files to write, and mutating the old one in place
	//   would make every comparison say "nothing changed".

	// One of the seven words, or one of the three the builder keeps inside `mode`.
	/* ⚠ THE WHOLE MODE IS REWRITTEN, not patched. `mode_for()` returns the seven words
	     plus the fields the builder keeps, so a node written in some older vocabulary is
	     rewritten in the current one on its first edit. */
	edit_at(path, change, options){
		const tree = clone(this.tree);
		const node = at(tree, path);
		if (!node) return this;

		node.mode = { ...mode_for(node), ...change };
		return this.apply(tree, options);
	},

	// A top-level field — title, description, icon. Not a word.
	set_at(path, change, options){
		const tree = clone(this.tree);
		const node = at(tree, path);
		if (!node) return this;

		Object.assign(node, change);
		return this.apply(tree, options);
	},

	/* A NEW PAGE, under `path` — `[]` for a top-level one. It is SELECTED as it
	   arrives, because the next thing you do is name it, and the field that names it
	   is in the right pane. */
	add_under(path, title){
		const tree = clone(this.tree);
		const parent = at(tree, path);
		if (!parent) return this;

		const siblings = parent.children ??= [];
		const name = name_for(title, siblings, Page.slug);

		siblings.push({ name, title, mode: { ...DEFAULTS }, children: [] });
		this.picked = [...path, name];

		return this.apply(tree);
	},

	/* ⚠ A TOP-LEVEL PAGE IS THE ONE CASE THAT IS NOT A CHILD OF ANYTHING. `at(tree, [])`
	     hands back a stand-in parent `{ children: tree }`, which is fine for `push`
	     (it mutates the real array) and silently WRONG for `filter` (it assigns a new
	     array onto the stand-in and the tree never changes). Deleting a top-level page
	     did nothing at all until this line. Measured 2026-09-05. */
	remove_at(path){
		const tree = clone(this.tree);

		if (path.length === 1) return this.apply(tree.filter(kid => kid.name !== path[0]));

		const parent = at(tree, path.slice(0, -1));
		if (!parent) return this;

		parent.children = parent.children.filter(kid => kid.name !== path.at(-1));
		return this.apply(tree);
	},

	/* ── A DROP ───────────────────────────────────────────────────────────────
	   The one thing drag-and-drop asks of the tree: take the node at `from`, put it
	   inside the node at `to`, before the node at `before` (or last, when `before` is
	   null). Reordering among siblings and moving into another page are the SAME call
	   with a different `to` — which is why there are no up and down buttons any more.

	   ⚠ A MOVE CAN COLLIDE. A directory name is unique among its siblings, so landing
	     `today` next to a `today` that is already there renames the arrival the way a
	     new page is named. The file follows: `save()` sees a path that is gone and one
	     that is new, so it `rm`s the old directory and writes the new one.
	   ⚠ AND THE SELECTION FOLLOWS THE PAGE. You dragged it; it is still the page you
	     are editing, at its new address. */
	move_to(from, to, before){
		const tree = clone(this.tree);

		const source = at(tree, from.slice(0, -1))?.children;
		const i = source?.findIndex(kid => kid.name === from.at(-1)) ?? -1;
		if (i < 0) return this;

		const [node] = source.splice(i, 1);

		const parent = at(tree, to);
		if (!parent) return this;

		const list = parent.children ??= [];

		/* ⚠ ONLY ON A COLLISION. A directory name is unique among its siblings, so a
		     page landing next to one that already has its name is renamed the way a new
		     page is named — but a page whose TITLE was changed keeps the directory it
		     has, because renaming never moves a file here and a url somebody saved has
		     to keep working. Recomputing the name every move would have quietly moved
		     `made/notes/` to `made/reading-list/` the first time anybody dragged it. */
		if (list.some(kid => kid.name === node.name)) node.name = name_for(node.title, list, Page.slug);

		const j = before ? list.findIndex(kid => kid.name === before.at(-1)) : -1;
		list.splice(j < 0 ? list.length : j, 0, node);

		this.picked = [...to, node.name];
		return this.apply(tree);
	},

	// ── the mark, and the one line that says where these pages are ────────────
	where(){
		if (!this.tree) return span("Looking for the pages…");

		md(this.made.label(this.count()));
	},
});


/* THE MARK — "these pages are KEPT, not a demo you drifted off". Green, naming the
   store, with the way back to the baseline. `../doc/persistence.md` is the rule; it
   is kept out of the object literal because it is the persistence CONTRACT rather
   than a control. */
function mark(page){
	return baseline(page, {
		what: "the pages you made",
		restorable: true,
		restore: () => page.apply(clone(SEED)),
		// ⚠ THE MARK SAYS THE COUNT; the line under the tree says the whole sentence.
		//   Both used to call `label()`, so the same 30 words appeared verbatim twice.
		saved: () => page.tree ? page.made.mark(page.count()) : null,
	});
}
