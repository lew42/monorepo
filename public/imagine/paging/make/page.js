import { Page, div, p, h3, span, a, input, textarea, icon, md } from "/app.js";
import { Paging, press, STYLES, CONTENT, MECHANISMS } from "../paging.js";
import { baseline } from "../baseline.js";
import { store_for, FileStore, LocalStore, at, walk, name_for, clone, SEED, DEFAULTS, DIR } from "./made.js";
import { KIDS, KIDS_ICON, kids_of, tabs_items, row_acts } from "./tabs.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row (no page grid; `.page-column-prose`).
   2 SIZE       `large` — 28–64em. A row here is a title, three word chips and two
                icon buttons: it needs more than the 40em reading column and never
                more than 64em.
   3 OWN LAYOUT prose, then the list (a flex column of rows), then the form, then
                the JSON box. One rhythm per box.
   4 REGIONS    one — core's. The pages you make are real CHILDREN of this page and
                open as columns of the same row. `index: true`, because the list
                below already draws every one of them.
   5 PREVIEW    core's default card.

   ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────────
   The CRUD screen for pages. Type a name and you get a real page — a real url, the
   real Router, core's own columns — and in dev it is a REAL FILE on disk that you
   can open in an editor, edit by hand, and commit.

   ── HOW IT WORKS, IN THREE SENTENCES ──────────────────────────────────────────
   1. A page is a plain JSON object: a title, three words, and a list of the names
      of its children. Nothing else.
   2. `children:` already accepts real `Page` objects and `Page.add()` gives each one
      a real url — so turning that JSON into a live tree needs no new machinery.
   3. Every edit produces a NEW TREE and hands it to `save()`, which works out the
      smallest set of files that gets there. Nothing is patched in place, so the
      list, the JSON box and the files on disk can never disagree.

   ⚠ WHERE the pages live is `made.js`, and only `made.js`: files under
     `public/imagine/paging/made/` when a dev socket answers, `localStorage` when
     none does. This file never asks which. `../doc/persistence.md` is the rule.

   ⚠ A page's URL and its FILE PATH are deliberately different. The page you made is
     a child of THIS page, so its url is `/imagine/paging/make/notes/`; its file is
     `/imagine/paging/made/notes/page.json`. `make/` is the tool and stays one
     directory of code; `made/` is the data it writes.                             */

const words = node => ({ ...DEFAULTS, ...node.mode });

// The next word in a list, wrapping — what a click on a word chip does.
const next = (list, word) => list[(list.indexOf(word) + 1) % list.length];

/* JSON → REAL PAGES. Each node becomes a `Paging` wearing its three words, and its
   own children are built the same way. `Page.add()` (called by `regrow()` below)
   hands each one a real url derived from this page's. */
function grow(nodes){
	return nodes.map(node => {
		const { style, content, mech } = words(node);

		/* ⚠ THE FOURTH WORD. `kids` says how this page draws its CHILDREN — as
		   columns you launch (the url changes), or as tabs in a panel (it does not).
		   It is only ever an `items()` override, so a page with `tabs` is the same
		   page with a different picker; `make/tabs.js` has the argument. */
		const kids = kids_of(node);

		return new Paging({
			name: node.name,
			title: node.title,
			icon: node.icon ?? "description",
			description: node.description ?? ("A page you made, wearing " + style + " · " + content + " · " + mech + "."),
			takeaway: "**You made this page, and it is a real page** — a real url, the real router, real columns. Everything about it comes from one small JSON file: `"
				+ JSON.stringify({ title: node.title, mode: { style, content, mech, kids } }) + "`. Its chips work exactly like every other page's here"
				+ (kids === "tabs" ? ", and its children are drawn as **tabs**: clicking one shows it in the panel and does NOT change the url. Each panel links to the same page as a column, which does." : "."),
			axes: "style content mech",
			mode: { style, content, mech, kids },
			children: grow(node.children ?? []),
			content(){ this.lede(); this.paging(); },
			...(kids === "tabs" ? { items(){ return tabs_items(this); } } : {}),
		});
	});
}

export default new Paging({
	meta: import.meta,
	title: "Make",
	description: "Make real pages — a real url, and in dev a real page.json file on disk.",
	icon: "add_circle_outline",
	width: "large",
	index: true,
	axes: "",

	takeaway: "**Type a name and you get a real page: a real url, the real router, real columns — and, in dev, a real file on disk.** Each page below is one small JSON file under `made/`; open one in an editor and it is the whole page. On a static host with no dev server there is nothing to write to, so the same tree is kept in your browser instead — the line under the list always says which.",

	// ── loading ───────────────────────────────────────────────────────────────
	// ⚠ NOT `initialize()` any more: the file store is a fetch, so the tree arrives
	//   asynchronously and the two overrides below are what make a cold deep url
	//   (`/imagine/paging/make/notes/today/`) still work. The same two `cms/json`
	//   needs, for the same reason — and `route()` is NOT the seam, because core
	//   calls it synchronously and would assign a promise onto a Page.
	/* ⚠ `made`, NOT `store` — `store()` is core's own method on every Page (the
	     localStorage handle), and a FIELD of that name shadows it: `LocalStore` calls
	     `this.page.store()` and would get an object instead of a function. Exactly the
	     shadowing trap the code skill names, met once already in this realm. */
	initialize(){ this.made = store_for(this); },

	ready(){
		return this.fetching ??= this.made.load().then(tree => {
			this.tree = tree;
			this.regrow();
			return this;
		});
	},

	async child(name, levels){
		await this.ready();
		return Page.prototype.child.call(this, name, levels);
	},

	/* ⚠ THE GUARD IS MINE TO KEEP, and leaving it out throws from the microtask queue
	     with a message that names nothing: "Chaining cycle detected for promise".
	     Core's `load_all_children` returns `this` UNCHANGED when `levels <= this.loaded`
	     — it does not touch `this.loading` — so on the second call `.loading` is the
	     promise being assigned on that very line, and `p.then(() => p)` is a cycle.
	     So: answer core's guard here, then clear it so core still does the real walk.
	     (`cms/json/page.js` carries the same override without the guard and throws the
	     same error; the fix is this block, and it belongs in that file too.) */
	load_all_children(levels = this.depth){
		if (levels <= this.loaded) return this;
		this.loaded = levels;

		this.loading = this.ready().then(() => {
			this.loaded = -1;
			return Page.prototype.load_all_children.call(this, levels).loading;
		});

		return this;
	},

	// ── the one write seam ────────────────────────────────────────────────────
	/* EVERY edit calls this with the tree it wants. The screen is redrawn from the
	   new tree immediately and the store catches up behind it, so a click never waits
	   on a file — and if the write fails (the dev server went away mid-session) the
	   page falls back to the browser store and says so rather than losing the edit. */
	apply(next_tree){
		const was = this.tree;

		this.tree = next_tree;
		this.regrow();
		this.redraw();

		this.made.save(next_tree, was).then(() => this.settled()).catch(() => this.settled());

		return this;
	},

	/* THE FALLBACK, in one readable idea: a file store that could not write (the dev
	   server went away mid-session) is swapped for the browser store, the edit is
	   saved there instead, and the line under the list changes on the same repaint to
	   say so. The edit is never lost and nothing throws. */
	async settled(){
		if (this.made.failed){
			this.made = new LocalStore({ page: this });
			await this.made.save(this.tree, []);
		}

		return this.redraw();
	},

	regrow(){
		this.children = new Map();
		grow(this.tree ?? []).forEach(page => this.add(page.name, page));
		return this;
	},

	// One seam every write goes through, so the list, the JSON box, the mark and the
	// tree can never show four different answers.
	redraw(){
		this.$list?.empty(() => { this.rows(); });
		if (this.$text) this.$text.el.value = this.json();
		this.$where?.empty(() => { this.where(); });
		this.$baseline?.check();
		this.app?.router?.mark_links();
		return this;
	},

	count(){ return walk(this.tree ?? []).length; },

	json(){ return JSON.stringify(this.tree ?? [], null, "\t"); },

	// ── the mark: these pages are KEPT, not a demo you drifted off ────────────
	// ⚠ Overrides `Paging.lede()`, which draws the amber "modified" mark every other
	//   page in the realm gets. Wrong here: the pages you made are the point of the
	//   page, not a demo that quietly desynced — so it is the green "saved" mark,
	//   naming the store, with the way back to the baseline. ../doc/persistence.md.
	lede(text){
		baseline(this, {
			what: "the pages you made",
			restorable: true,
			restore: () => this.apply(clone(SEED)),
			saved: () => this.tree ? this.made.label(this.count()) : null,
		});

		return md(text ?? this.takeaway).ac("paging-lede");
	},

	// ── the page ──────────────────────────────────────────────────────────────
	content(){
		this.lede();

		h3("The pages you have made");

		md("Each row is a real page. **Click its title** to open it as a column. **Click one of its four words** to change it — the word cycles through the vocabulary and the page is rebuilt immediately. Then the five buttons at the end of the row: **rename** it in place, move it **up** or **down** among its siblings, **add** a child under it, **delete** it and its file.");

		// ⚠ Captured NOW, filled in the callback: `ready()` is a fetch, and a factory
		//   call after the await would land in whatever box is current by then.
		this.$list = div.c("paging-make-list", $list => {
			$list.append(() => p.c("muted", "Loading…"));
			this.ready().then(() => this.redraw());
		});

		this.$where = div.c("paging-make-where", () => { this.where(); });

		h3("Tabs — how to add one, and how to configure them");

		/* THE OWNER'S TWO QUESTIONS, ANSWERED WHERE THE CONTROLS ARE. "what's the ux
		   for adding tabs to a page? what's the ux for configuring tabs?" — so the
		   answer sits directly under the list those controls are in, not in a doc. */
		md("**A tab is a child page, drawn as a tab instead of as a column.** There is no separate tab object to create, and nothing new to learn: the fourth word on every row above is `columns` or `tabs`, and it decides how that page draws *its children*.");

		md("- **Make a page use tabs** — click its fourth word until it says `tabs`. Its children immediately become a tab strip with a bounded panel underneath, instead of a list of rows you launch.\n" +
			"- **Add a tab** — the `+ tab` button on that row. (On a `columns` page the same button says `+ page`, because that is what you get.)\n" +
			"- **Rename a tab** — the pencil on the tab's own row. The label changes; the file does not move, so a url somebody saved still works.\n" +
			"- **Reorder the tabs** — the ↑ and ↓ buttons on the tab's row. Tabs appear in the order the parent lists its children, which is the order you see here.\n" +
			"- **Remove a tab** — `×`. It is a page, so this deletes the page.");

		md("⚠ **Tabs do not change the url.** A tab strip is `swap`: the panel changes and the address bar does not, so a tab cannot be linked to or reached with the Back button. Every panel therefore carries a link that opens the same child as a column, which does change the url. If a child deserves an address, leave the parent on `columns` ([the four mechanisms](/imagine/paging/mechanisms/)).");

		md("The word you just set is written into the parent's own file as `\"kids\": \"tabs\"`, beside the three it already had — **watch the JSON box below change as you click**. That box is the tree exactly as it goes to disk.");

		h3("Add a page");

		this.form();

		h3("The same tree, as the JSON it actually is");

		md("This is the whole tree as data — the exact shape that goes into the files. One object per page: a `title`, three `mode` words, and `children`. Change it and press Save.");

		this.editor();

		h3("What a page can and cannot say as JSON");

		md("`title`, `icon`, `description`, `width` and `children` are read straight off the object by core's own `declare()` — that is why these are real pages with real urls and no code. What JSON *cannot* say is a `content()` body: for that a page needs a renderer, which is js. The full table, and the shortest path from here to every kind of page on the site: [doc/persistence.md](/imagine/paging/doc/persistence.md).");
	},

	// The one line that says where these pages actually are. Redrawn on every edit,
	// because the answer can change mid-session if the dev server goes away.
	where(){
		if (!this.tree) return p.c("muted", "Looking for the pages…");

		md(this.made.label(this.count()));

		// ⚠ `LocalStore extends FileStore` (it reads files, it just cannot write them),
		//   so this asks the narrow question, not the broad one.
		if (!(this.made instanceof LocalStore))
			md("The page at `/imagine/paging/make/notes/` is the file at `public" + DIR + "notes/page.json` — the url is a child of this page, the file is beside it. [Open the root file](" + DIR + "page.json).");
	},

	// ── the list: one row per made page, at any depth ─────────────────────────
	rows(path = [], nodes = this.tree ?? []){
		if (!nodes.length && !path.length)
			return p.c("muted", "No pages. Add one below, or press “Back to the baseline” on the mark above.");

		nodes.forEach(node => {
			const here = [...path, node.name];
			this.row(node, here);
			if (node.children?.length) div.c("paging-make-kids", () => { this.rows(here, node.children); });
		});
	},

	/* ONE ROW. The title, the four words that configure the page, then the acts:
	   rename · up · down · add · delete. `$row` is captured so the rename can turn
	   this row into an input in place rather than opening a dialog somewhere else. */
	row(node, path){
		const mode = words(node);
		const page = this.at_path(path);
		const kids = kids_of(node);

		return div.c("paging-make-row", $row => {
			icon(node.icon ?? "description");

			a.c("paging-make-title", node.title).href(page?.url ?? this.url);

			this.word(path, "style", mode.style, STYLES);
			this.word(path, "content", mode.content, CONTENT);
			this.word(path, "mech", mode.mech, Object.keys(MECHANISMS));
			this.word(path, "kids", kids, KIDS);

			row_acts(this, node, path, kids, $row);
		});
	},

	// The live page a row stands for, so the title can link to its real url.
	at_path(path){
		let page = this;
		for (const name of path) page = page?.children?.get(name);
		return page;
	},

	/* A WORD YOU CAN CLICK. One chip per axis, and a click advances it to the next
	   word in that axis — three chips instead of fourteen, and the cycling is what
	   teaches the vocabulary: press `style` five times and you have seen all five
	   surfaces without reading a list of them. */
	word(path, axis, value, list){
		return press(span.c("paging-chip paging-make-word").attr("title", axis + " — click for the next one").append(() => {
			if (axis === "mech") icon(MECHANISMS[value].icon);
			if (axis === "kids") icon(KIDS_ICON[value]);
			span(value);
		}), () => this.edit_at(path, { [axis]: next(list, value) }));
	},

	// ── create · update · delete, each one a new tree ─────────────────────────
	// ⚠ The tree is CLONED before it is changed. `apply()` compares the new tree with
	//   the old one to decide which files to write, and mutating the old one in place
	//   would make every comparison say "nothing changed".
	edit_at(path, change){
		const tree = clone(this.tree);
		const node = at(tree, path);
		if (!node) return this;

		node.mode = { ...words(node), ...change };
		return this.apply(tree);
	},

	add_under(path, title){
		const tree = clone(this.tree);
		const parent = at(tree, path);
		if (!parent) return this;

		const siblings = parent.children ??= [];
		siblings.push({ name: name_for(title, siblings, Page.slug), title, mode: { ...DEFAULTS }, children: [] });

		return this.apply(tree);
	},

	/* ⚠ A TOP-LEVEL PAGE IS THE ONE CASE THAT IS NOT A CHILD OF ANYTHING. `at(tree, [])`
	     hands back a stand-in parent `{ children: tree }`, which is fine for `push`
	     (it mutates the real array) and silently WRONG for `filter` (it assigns a new
	     array onto the stand-in and the tree never changes). Deleting a top-level page
	     did nothing at all until this line — the row came back on the next redraw and
	     the file stayed on disk. Measured 2026-09-05. */
	remove_at(path){
		const tree = clone(this.tree);

		if (path.length === 1) return this.apply(tree.filter(kid => kid.name !== path[0]));

		const parent = at(tree, path.slice(0, -1));
		if (!parent) return this;

		parent.children = parent.children.filter(kid => kid.name !== path.at(-1));
		return this.apply(tree);
	},

	// ── create ───────────────────────────────────────────────────────────────
	form(){
		return div.c("paging-make-form", () => {
			const $name = input().attr("type", "text").attr("placeholder", "A name — “Reading list”").ac("paging-make-name");

			const add = () => {
				const title = ($name.el.value || "").trim();
				if (!title) return $name.el.focus();

				$name.el.value = "";
				this.add_under([], title);
			};

			$name.on("keydown", event => { if (event.key === "Enter"){ event.preventDefault(); add(); } });

			press(span.c("paging-chip on").append(() => { icon("add"); span("Add the page"); }), add);

			p.c("muted", "It arrives wearing " + DEFAULTS.style + " · " + DEFAULTS.content + " · " + DEFAULTS.mech + ". Click its words in the list to change them.");
		});
	},

	// ── update, the whole tree at once ────────────────────────────────────────
	editor(){
		return div.c("paging-make-editor", () => {
			this.$text = textarea.c("paging-make-text").attr("rows", "12").attr("spellcheck", "false");
			this.$text.el.value = this.json();

			this.$says = p.c("muted", "");

			div.c("paging-make-form", () => {
				press(span.c("paging-chip on").append(() => { icon("save"); span("Save"); }), () => this.save_json());

				press(span.c("paging-chip").append(() => { icon("refresh"); span("Back to the baseline"); }),
					() => this.apply(clone(SEED)));
			});
		});
	},

	/* ⚠ A TYPED TREE IS UNTRUSTED TEXT. Bad JSON says so in the line under the box
	     rather than throwing, and a node with no `name` is given one from its title —
	     otherwise it would be written to a directory called `undefined`. */
	save_json(){
		let tree;

		try { tree = JSON.parse(this.$text.el.value); }
		catch (error){ return this.says("That is not valid JSON — " + error.message); }

		if (!Array.isArray(tree)) return this.says("The top level has to be an array of pages — `[ { \"title\": \"…\" } ]`.");

		this.says("");
		return this.apply(this.named(tree));
	},

	named(nodes, path = []){
		const out = [];

		nodes.forEach(node => {
			const title = String(node?.title ?? "Untitled");
			const name = node?.name || name_for(title, out, Page.slug);
			out.push({ ...node, name, title, mode: words(node ?? {}), children: this.named(node?.children ?? [], [...path, name]) });
		});

		return out;
	},

	says(line){ this.$says?.empty(() => { if (line) span(line); }); return this; },
});
