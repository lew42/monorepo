import { Page, View, div, p, h2, h3, span, icon, md, input, textarea, pre } from "/app.js";
import { Paging, press, Toolbar } from "../paging.js";
import { baseline } from "../baseline.js";
import { copy_chip, select_text } from "../config.js";
import { store_for, LocalStore, DIR } from "../make/made.js";
import BuildStage from "./stage.js";
import {
	PIECES, ICONS,
	NEW_PAGE, mode_of, blocks_of, config_of, name_for, next_in, code_for_node,
	is_default, edit, set_mode, add_block, edit_block, remove_block, move_block,
	add_child, edit_child, remove_child, move_child, set_default,
} from "./words.js";

View.stylesheet(import.meta, "build.css");

/* ── layout, answered before the first factory call ────────────────────────────
   ⚠ TWO COLUMNS AND TWO ROWS, since 2026-09-05. The card was controls | page | file.
     The bar over the middle sets all seven words, so the left column stopped repeating
     three of them — and the FILE moved out of a 287px column onto its own full-width
     row, because a `page.json` line runs past 60 characters and every value was off the
     right edge (paging-audit-6, item 6). Left: the things only the left column can say
     (Name, Blocks, Pages). Middle: the page, under the realm's own bar. Under both: the
     file, then the code.

   1 CONTAINER  a column in /imagine/'s columns row — no page grid, so `wide` means
                nothing here and only the prose is measure-capped. `width: "full"`:
                a builder is a TOOL, and three columns of controls do not fit in a
                shared row. Takeover gives it the whole row at every width, and the
                crumb strip is how you get back out.
   2 SIZE       the card is 957px at 1280 and ~2850px at 3440 — the realm's middle,
                which is the window minus the app's rail (the note here used to say
                "the row: 1238px at 1280", true only while Build was a column of
                /imagine/'s row rather than a page of this app). It is a three-track
                grid, each track with a floor and a ceiling; the side tracks cap at
                `min(24%, 26rem)` and `min(30%, 30rem)` so the STAGE takes everything
                3440 has spare. Under 54rem of CARD width - not window width - the
                three stack, which at 1280 they no longer do.
   3 OWN LAYOUT each column is a `flex v gap` stack of small titled groups. The stage
                is one drawn rectangle — the white card the swap happens on.
   4 REGIONS    one, core's. This page has NO children: the pages it builds are real
                children of `../make/`, which is where they are saved.
   5 PREVIEW    core's default card.

   ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────────
   The page BUILDER. It answers the owner's question — "how would I build this with
   a UI?" — by being the UI: the controls on the left, the page assembling live in the
   middle under the realm's own seven-word bar, and the `page.json` it writes underneath,
   changing with every click.

   ── HOW IT WORKS, IN THREE SENTENCES ──────────────────────────────────────────
   1. Everything you press edits ONE plain object — the node in the box on the right
      — and every edit returns a NEW object rather than patching the old one.
   2. The stage draws that object. It is not a preview image: the tabs really swap
      and the prose really goes through `md()`.
   3. Save hands the node to `../make/made.js`, the SAME store Make writes — one
      directory, one `page.json`, on disk in dev. There is no second store and there
      will not be one (`../doc/persistence.md`).

   ⚠ `$stage` IS PAGING'S, not mine. `Paging.stage()` assigns `this.$stage` on the page
     it is called on, so the builder's own boxes are `$controls`, `$screen`, `$json` and
     `$code`. A field of either name would be overwritten the first time the middle
     drew.                                                                          */

export default new Paging({
	meta: import.meta,
	title: "Build",
	description: "Seven controls, a live page, and the JSON it writes.",
	icon: "construction",


	// ⚠ SECOND OF THE TWO EDITORS. Make types a name and gets a page; Build fills
	//   that page in. Both say so, because "which one do I open?" was the newcomer's
	//   first question about them (paging-audit-2).
	takeaway: "**The second of the two editors: [Make](/imagine/paging/make/) creates a page, this one fills it in.** New page to finished page, with nothing but controls. Name it, fill it with blocks and pages on the left, and set its seven words in the bar over the middle — the middle is the page assembling as you click, and the file underneath is the `page.json` that gets written. Save puts it on disk beside every other page you have made.",

	// ── state ────────────────────────────────────────────────────────────────
	/* The node being built, and where it goes. Both are read back out of this page's
	   own store record on arrival, so a half-built page survives a reload — and the
	   mark at the top says so, because a page that remembers you silently is the one
	   thing this realm's persistence rule forbids (`../doc/persistence.md`). */
	initialize(){
		this.made = store_for(this);

		const kept = this.store().get({ node: null, saved_to: null });

		this.node = kept.node ?? NEW_PAGE();
		this.saved_to = kept.saved_to;
	},

	/* ── WHAT THE DRAWER ASKS THIS PAGE ───────────────────────────────────────
	   The bar over the stage brings the drawer with it, and every box in that drawer was
	   written for a page that IS SEVEN WORDS. This page is not one: it is a node with
	   blocks and children, and it prints its own file and its own `page.js` full-width
	   under the builder, with the one Save that writes them. So it answers the drawer's
	   two questions and the drawer stops printing a second, different answer
	   (paging-audit-7b, fixes 1 and 4). `named()` is what gives every child a directory
	   name, which is what the printed file and the printed code both need. */
	node_now(){ return this.named(this.node); },

	prints_own_file: true,

	// ⚠ `patch`, never `set`: this page's own mode record lives under the same key and
	//   a `set` would replace the whole record and drop it. Make's own note, same store.
	keep(){
		this.store().patch({ node: this.node, saved_to: this.saved_to });
		return this;
	},

	/* THE ONE WRITE SEAM. Every control calls this with the node it wants; nothing
	   anywhere else assigns `this.node`. `controls: false` is for the text fields,
	   which must not have the box they are being typed in rebuilt under the cursor.
	   Named `apply()` after Make's own write seam, which does the same job. */
	apply(node, options){
		this.node = node;
		this.keep();
		return this.redraw(options);
	},

	edit_node(change, options){ return this.apply(edit(this.node, change), options); },

	/* ⚠ NOT `mode()` and NOT `change()`. `Paging` keeps a `mode` FIELD (its opening
	   words) and a `change` field (what the last chip press did), and a method of
	   either name silently shadows one of them. The `code` skill's trap, met while
	   writing this file. */
	set_words(change, options){ return this.apply(set_mode(this.node, change), options); },

	/* ⚠ TWO THINGS A REDRAW MAY BE ASKED TO LEAVE ALONE, and both for the same reason:
	     you must not delete the element the reader is standing on. `controls: false` is
	     for the text fields, which are being typed in. `screen: false` is for the BAR
	     over the stage — a `<select>` fires `change` while it still has focus, and the
	     stage has already repainted itself by then, so rebuilding it would throw away
	     the dropdown mid-gesture and change nothing on screen. */
	redraw({ controls = true, screen = true } = {}){
		if (controls) this.$controls?.empty(() => { this.controls(); });
		if (screen) this.$screen?.empty(() => { this.screen(); });
		this.$json?.empty(() => { this.json_box(); });
		this.$code?.empty(() => { this.code_part(); });
		this.$baseline?.check();
		return this;
	},

	// ── the mark ─────────────────────────────────────────────────────────────
	// Overrides `Paging.lede()`: this page keeps a DRAFT, which is a thing you are
	// making rather than a demo you drifted off, so it earns the green "saved" mark
	// once it is on disk and the amber one before that.
	lede(text){
		baseline_for(this);
		return md(text ?? this.takeaway).ac("paging-lede");
	},

	// ── the page ─────────────────────────────────────────────────────────────
	/* ⚠ THE MARK STAYS ON TOP, THE PARAGRAPH DOES NOT. Every demo page in this realm
	     now opens on its demo with the sentence underneath (`paging.js` `lede()`), and
	     the builder is this page's demo. The one thing that must be visible BEFORE you
	     touch anything is the draft mark, because this page really does write to disk —
	     so `lede()` (which is the mark, above) stays first and the explanation moves
	     under the builder. */
	content(){
		this.lede();

		this.builder();

		md("Everything above writes into one small JSON file. **The left column names the page and fills it with blocks and pages; the middle is the page you are building, live, with the realm's own seven-word bar over it; the file underneath is what goes to disk.** Nothing here is a mock-up — press a tab in the middle and it really swaps, and the file below is really what gets written.");

		h2("Adding a tab, and configuring one");

		md("**A tab is a child page.** There is no separate tab to create: you add a page under this one, and the *Navigation* control decides whether the pages under it are drawn as **tabs** (a strip over one panel) or as **columns** (rows you click, which open to the right). Change that one word and the same children redraw the other way, with nothing else touched.");

		md("**Configuring a tab is the four things every child page has** — its **name**, its **order** among its siblings, whether it is the **default** (the one showing when you arrive), and its **icon**. They are the four controls on each row under *Pages* on the left, and each one writes one field of that child in the JSON on the right.");

		md("⚠ **Tabs do not change the url.** A tab strip is the `swap` mechanism, so the panel changes and the address bar does not — a tab cannot be linked to or reached with the Back button. If a child deserves an address, leave the navigation on **columns**. ([the four mechanisms](/imagine/paging/mechanisms/))");

		h2("What this can and cannot build");

		md("Every `page.js` on this site was read and sorted by what a UI would have to offer to build it — 890 files, 890 rows. **About a fifth are pure configuration already**, a further **two fifths need the page to NAME something js supplies** (the pattern `\"kids\": \"tabs\"` uses), and **the last third are code and should stay code**: a live control, content computed from data, something fetched. The counts, the method and the decision are in [doc/builder.md](/imagine/paging/doc/builder/).");

		md("That is why the last control is **Code**. When the builder cannot say a thing, it prints the `page.js` a hand would write for what you have built so far — with the line where your code goes already marked.");

		md("Where the pages go, what the mark at the top means, and why there is exactly one store: [Persistence](/imagine/paging/doc/persistence/). The CRUD list of everything you have made: [Make](/imagine/paging/make/).");
	},

	/* ── THE THREE-COLUMN CARD ────────────────────────────────────────────────
	   The owner's shape: "the center column is a card itself, a demo… on the left a
	   small title + intro and maybe some controls. on the right, some readouts,
	   metrics, feedback, config". Here that is literally controls · page · file. */
	builder(){
		/* ⚠ NO `cols` CLASS HERE. `.cols` is `display: flex` in `@layer util`, so it
		     beats this sheet's `display: grid` at any specificity and the card came out
		     as two 612px columns with the file column pushed off the bottom. The fix is
		     to drop the utility, never to fight it (`css` skill; measured 2026-09-05). */
		/* ⚠ THE TWO BOXES ARE UNDER THE CARD, NOT ROWS OF IT — and that is what lets the
		     middle column stick. In Chromium a `position: sticky` GRID ITEM is held inside
		     its grid CONTAINER, not inside its own grid area, so while the file and the
		     code were rows of the same grid the stage stayed pinned to the top of the
		     window the whole way down and painted over both of them (measured at 3440:
		     3 of 4 probe points along the file pane's own first line hit the stage —
		     paging-audit-7b, fix 5). As siblings, the card ends where the columns end,
		     and the stage lets go exactly there. */
		return div.c("build wide", () => {
			div.c("build-card", () => {
				this.$controls = div.c("build-controls flex v gap", () => { this.controls(); });
				this.$screen = div.c("build-centre", () => { this.screen(); });
			});

			/* ⚠ THE FILE TAKES THE WHOLE WIDTH, for step 7's reason. A `page.json` line is
			     60–80 characters and the column was 287px holding 455 — `"navigation":
			     "tabs"` and every other value off the right edge, in the box whose whole
			     job is to show you the file (paging-audit-6, item 6). */
			this.$json = div.c("build-file-row flex v gap", () => { this.json_box(); });

			/* ⚠ AND SO DOES STEP 7, which is the last control for that reason: it prints a
			     `page.js`, whose lines are 60–80 characters. In the 230px control column
			     that showed a QUARTER of each line — `navigation:`, `room:` and the other
			     five keys had their values off the right edge, on the step whose entire job
			     is to show you the seven words (paging-audit-5, item 1). */
			this.$code = div.c("build-code-row", () => { this.code_part(); });
		});
	},

	/* ════ THE CONTROLS, IN ORDER ══════════════════════════

	   ⚠ THE SEVEN WORDS ARE THE BAR'S, AND ONLY THE BAR'S. This column had its own
	     Navigation, Content colour and Arrangement controls beside the realm's own
	     seven-select bar over the stage — two controls for one word, on one screen, on
	     the realm whose whole rule is one name, one control (paging-audit-6b, fix 4).
	     They stayed in sync, so nothing was broken; it was the same word said twice.
	     What is left is the three things ONLY this column can say, and the code escape. */
	controls(){
		this.part(1, "Name", "What the page is called. It is the head, the crumb, the card and — if its parent draws tabs — the tab.", () => this.name_controls());

		this.part(2, "Blocks", "The content, as data. Three kinds, and every one is drawn by something that already exists — and they sit ABOVE whatever the content word says.", () => this.block_controls());

		this.part(3, "Pages", "The children. Under `tabs` each one is a tab; under `columns` each one is a row that opens to the right. Same pages either way.", () => this.child_controls());
	},

	/* ⚠ NOT `group()`. `group` is DATA core reads off a page — `previews()` groups a
	   wall by `page.group`, so a METHOD of that name is passed to `h4()` on the PARENT
	   page and renders as nothing anyone can explain. */
	part(n, title, line, build){
		return div.c("build-group", () => {
			h3.c("build-group-title", () => { span.c("build-n", String(n)); span(title); });
			p.c("muted build-group-line", line);
			build();
		});
	},

	// ── 1 · name ─────────────────────────────────────────────────────────────
	/* ⚠ THE CONTROLS ARE NOT REDRAWN WHILE YOU TYPE. `apply(…, { controls: false })`
	     repaints the stage and the JSON on every keystroke and leaves this box alone —
	     rebuilding it would destroy the input the cursor is in.
	   ⚠ NOT NAMED `naming()`. Core's `Page.naming()` derives the url, the name and the
	     title, and the CONSTRUCTOR calls it before `initialize()` has run — so an
	     override of that name ran against a page with no `node` yet, threw, and the
	     whole page 404'd with a message that named neither. Measured 2026-09-05. */
	name_controls(){
		this.field("Title", this.node.title, value => this.edit_node({ title: value }, { controls: false }));
		this.field("Description", this.node.description ?? "", value => this.edit_node({ description: value }, { controls: false }));

		return div.c("build-row-line", () => {
			span.c("muted", "icon");
			press(span.c("paging-chip").append(() => { icon(this.node.icon ?? "description"); span(this.node.icon ?? "description"); }),
				() => this.edit_node({ icon: next_in(ICONS, this.node.icon ?? ICONS[0]) }));
		});
	},

	field(label, value, run){
		return div.c("build-field", () => {
			span.c("muted build-label", label);
			const $input = input().attr("type", "text").ac("build-input");
			$input.el.value = value;
			$input.on("input", () => run($input.el.value));
		});
	},

	// ── 2 · blocks ────────────────────────
	block_controls(){
		const blocks = blocks_of(this.node);

		blocks.forEach((block, i) => this.block_row(block, i));

		if (!blocks.length) p.c("muted", "No blocks yet. The page is a title and nothing else — which is a real page, and 91 on this site are exactly that.");

		return div.c("build-adds", () => PIECES.forEach(kind => press(
			span.c("paging-chip on").attr("title", kind.means).append(() => { icon(kind.icon); span(kind.title); }),
			() => this.apply(add_block(this.node, kind.id)))));
	},

	block_row(block, i){
		return div.c("build-item", () => {
			div.c("build-item-head", () => {
				icon(PIECES.find(kind => kind.id === block.type)?.icon ?? "notes");
				span.c("build-item-title", PIECES.find(kind => kind.id === block.type)?.title ?? block.type);

				this.act("arrow_upward", "move this block up", () => this.apply(move_block(this.node, i, -1)));
				this.act("arrow_downward", "move this block down", () => this.apply(move_block(this.node, i, 1)));
				this.act("close", "remove this block", () => this.apply(remove_block(this.node, i)), "build-del");
			});

			if (block.type === "prose"){
				const $text = textarea.c("build-text").attr("rows", "3").attr("spellcheck", "false");
				$text.el.value = block.text ?? "";
				$text.on("input", () => this.apply(edit_block(this.node, i, { text: $text.el.value }), { controls: false }));
				return;
			}

			if (block.type === "cards"){
				div.c("build-row-line", () => {
					span.c("muted", "cards of");
					["children", "templates"].forEach(from => press(
						span.c("paging-chip").ac((block.from ?? "children") === from && "on").append(() => span(from)),
						() => this.apply(edit_block(this.node, i, { from }))));
				});
				return;
			}

			div.c("build-row-line", () => {
				span.c("muted", "family");
				press(span.c("paging-chip on").append(() => span(block.family ?? "magazine")), () => this.next_family(i, block));
			});
		});
	},

	/* ⚠ THE FAMILY LIST IS THE TEMPLATES REALM'S, fetched when it is first needed —
	     `families.js` imports the magazine, the blog manifest, the shells and two ux
	     modules, so a builder that never adds a template block never pays for them.
	     Filled in a CALLBACK: nothing may build DOM after the await. */
	next_family(i, block){
		import("../templates/families.js").then(({ FAMILIES }) => {
			const names = FAMILIES.map(it => it.name);
			this.apply(edit_block(this.node, i, { family: next_in(names, block.family ?? names[0]) }));
		});

		return this;
	},

	// ── 3 · pages, which is to say tabs ──────────────────────────────────────
	child_controls(){
		const kids = this.node.children ?? [];
		const tabs = config_of(this.node).navigation === "tabs";

		kids.forEach((kid, i) => this.child_row(kid, i, kids.length));

		if (!kids.length) p.c("muted", "No pages under this one. Add one and it appears in the stage immediately — as a tab or as a row, depending on the navigation above.");

		return div.c("build-adds", () => press(
			span.c("paging-chip on").append(() => { icon("add"); span(tabs ? "Add a tab" : "Add a page"); }),
			() => this.apply(add_child(this.node, tabs ? "New tab" : "New page", Page.slug))));
	},

	/* ONE CHILD ROW — and the four things you configure about a tab are these four
	   controls: its NAME, its ORDER (the arrows), whether it is the DEFAULT (the
	   star), and its ICON. There is no fifth thing, and no tab object anywhere. */
	child_row(kid, i, count){
		return div.c("build-item", () => {
			div.c("build-item-head", () => {
				press(span.c("build-act").attr("title", "change the icon").append(() => icon(kid.icon ?? "description")),
					() => this.apply(edit_child(this.node, i, { icon: next_in(ICONS, kid.icon ?? ICONS[0]) })));

				const $name = input().attr("type", "text").ac("build-input build-input-name");
				$name.el.value = kid.title;
				$name.on("input", () => this.apply(edit_child(this.node, i, { title: $name.el.value }), { controls: false }));

				this.act("arrow_upward", "move up — tabs appear in this order", () => this.apply(move_child(this.node, i, -1)), i === 0 && "build-off");
				this.act("arrow_downward", "move down", () => this.apply(move_child(this.node, i, 1)), i === count - 1 && "build-off");
				this.act(is_default(kid) ? "star" : "star_outline", "make this the one showing when you arrive", () => this.apply(set_default(this.node, i)), is_default(kid) && "build-on");
				this.act("close", "delete this page", () => this.apply(remove_child(this.node, i)), "build-del");
			});
		});
	},

	act(glyph, title, run, extra){
		return press(span.c("build-act").ac(extra).attr("title", title).append(() => icon(glyph)), run);
	},

	// ── 4 · the code escape, across the whole card ───────────────────────────
	code_part(){
		return this.part(4, "Code", "For everything the controls cannot say — and a third of this site is exactly that.", () => {
			md("A third of this site's pages need a `content()` that computes something, and no JSON will ever supply one. So here is the `page.js` this node would be if you wrote it by hand — copy it into a directory and the builder has handed the page over to you.");

			const text = code_for_node(this.node);
			const $box = pre.c("build-code", text);

			let $said;
			div.c("paging-said", () => {
				copy_chip(text, "Copy the code", () => select_text($box.el), said => $said.empty(said));
				$said = span.c("paging-said-ok");
			});
		});
	},

	/* ════ THE STAGE, AND THE REALM'S OWN BAR OVER IT ══════════════════════════
	   ⚠ THE BAR IS WHY BUILD CAN SAVE ALL SEVEN WORDS. Its own controls write three —
	     navigation, content colour, arrangement — and Make's rows write four, so
	     between the realm's two editors `room` and `type size` could be set by NOTHING
	     (paging-audit-5b, break 2). The bar over every other stage in the realm sets
	     all seven, so the builder wears it too: one line, and `doc/builder.md` had
	     already written that line down as the next thing to do here.
	   ⚠ IT REPAINTS THE STAGE AND NOT THIS COLUMN. `keep` is the stage's write hook;
	     the stage has already redrawn itself by the time it fires, so `screen: false`
	     leaves the `<select>` the reader is standing in exactly where it was. */
	screen(){
		p.c("muted build-caption", "The page, as it will be. Click a tab or a row — this rectangle is the only thing that changes.");

		// `size-small` — the same word the realm's own bar wears (`paging.js`): the
		// framework's `--size` knob takes every control in here to 0.75x.
		const $bar = div.c("paging-toolbar-slot size-small");

		const build = new BuildStage({ page: this, node: this.node, classes: "build-screen" });

		build.$stage.keep = (axis, value) => this.set_words({ [axis]: value }, { screen: false });

		/* THE EIGHTH WORD: the page inside this one. Its own hook because it is not one of
		   the seven and has no axis to name — the twin of `make/page.js`'s, on the page a
		   builder is building rather than one already saved. Without it the nest chips
		   changed the picture and wrote nothing (paging-audit-7b, break a). */
		build.$stage.keep_nest = id => this.set_words({ nest: id ?? undefined }, { screen: false });

		$bar.append(() => new Toolbar({ stage: build.$stage, page: this }));

		return p.c("muted build-caption", () => { md("A **picture that works**: the tabs really swap and the prose really goes through `md()`. Every word in the bar above is written straight into the file on the right. What it cannot do is route — the page has no url until you save it."); });
	},

	// ════ THE FILE ════════════════════════════════════════════════════════════
	json_box(){
		h3.c("build-group-title", () => { span.c("build-n", "→"); span("The file"); });
		p.c("muted build-group-line", "The node exactly as it goes to disk. It changes with every control you press.");

		const text = JSON.stringify(this.file(), null, "\t");
		const $box = pre.c("build-json-text", text);

		/* THE SAME COPY BUTTON AS THE CODE BOX BELOW IT. The file is a thing you take
		   away — into an editor, into a commit — and it was the one box in the realm
		   handing you text with no way to lift it (paging-audit-6, item 6). */
		let $said;
		div.c("paging-said", () => {
			copy_chip(text, "Copy the file", () => select_text($box.el), said => $said.empty(said));
			$said = span.c("paging-said-ok");
		});

		this.where();

		return div.c("build-adds", () => {
			press(span.c("paging-chip on").append(() => { icon("save"); span("Save"); }), () => this.save());
			press(span.c("paging-chip").append(() => { icon("refresh"); span("Start a new page"); }), () => this.start_over());
		});
	},

	// What the store will actually write. `children` becomes an array of directory
	// names — the one difference between the node in memory and the node on disk.
	file(){
		const node = this.named(this.node);

		return {
			title: node.title,
			icon: node.icon,
			description: node.description,
			mode: mode_of(node),
			children: (node.children ?? []).map(kid => kid.name),
		};
	},

	// Every node needs a directory name, and a node made from a typed title has none
	// until it is asked for. Derived here rather than on every keystroke.
	named(node, siblings = []){
		const name = node.name || name_for(node.title ?? "Page", siblings, Page.slug);
		const kids = [];

		(node.children ?? []).forEach(kid => kids.push(this.named(kid, kids)));

		return { ...node, name, children: kids };
	},

	where(){
		return this.$where = div.c("build-where", () => {
			if (this.saved_to) md("**Saved.** " + this.saved_to);
			else if (this.made instanceof LocalStore) md("Not saved yet. There is no dev server on this host, so **Save keeps it in this browser** — the same fallback [Make](/imagine/paging/make/) uses.");
			else md("Not saved yet. **Save writes `public" + DIR + "<name>/page.json`** — a real file, next to every other page you have made.");
		});
	},

	/* ── SAVING ───────────────────────────────────────────────────────────────
	   The tree is RE-READ first, not remembered. `../doc/persistence.md` names the
	   failure this avoids: a tab holding a tree it loaded ten minutes ago writes its
	   whole snapshot back and resurrects pages someone else deleted. Re-reading costs
	   one fetch and removes the class of bug.

	   ⚠ DOM AFTER AN AWAIT: none. Everything below the awaits paints through
	     `$where.empty(fn)` and `redraw()`, which re-establish the captor themselves. */
	async save(){
		const node = this.named(this.node);
		const was = await this.made.load();

		const tree = was.some(kid => kid.name === node.name)
			? was.map(kid => kid.name === node.name ? node : kid)
			: [...was, node];

		const ok = await this.made.save(tree, was);

		// The dev server went away mid-session: keep the edit, in the browser, and say so.
		if (!ok && this.made.failed){
			this.made = new LocalStore({ page: this });
			await this.made.save(tree, was);
		}

		this.saved_to = this.made instanceof LocalStore
			? "It is in this browser — there was no dev server to write to. [Make](/imagine/paging/make/) lists it all the same."
			: "`public" + DIR + node.name + "/page.json` — a real file. It is a real page too: [open it](/imagine/paging/make/" + node.name + "/).";

		return this.apply(edit(node, {}));
	},

	/* A NEW PAGE — and the draft that was there is gone.
	   ⚠ `store().clear()`, NOT `apply(NEW_PAGE())`. `apply()` keeps what it is given,
	     so resetting through it wrote a fresh draft straight back and the page still
	     had a record: the amber "Modified" mark never went away, on a page that was
	     back at its baseline. `baseline()`'s default question is "is anything saved
	     for this page", so the honest answer to Reset is to save nothing.
	     Measured 2026-09-05. */
	start_over(){
		this.saved_to = null;
		this.tab = 0;
		this.node = NEW_PAGE();
		this.store().clear();

		return this.redraw();
	},
});

/* THE MARK, with this page's own three states. Kept out of the object literal because
   it is the persistence CONTRACT rather than a control: amber while a draft is only
   in the browser, green once it is a file, and a way back to an empty page either way.
   `../doc/persistence.md` is the rule; `../baseline.js` is the shared piece. */
function baseline_for(page){
	return baseline(page, {
		what: "the page you are building",
		restorable: true,
		restore: () => page.start_over(),
		saved: () => page.saved_to ? "**Saved.** " + page.saved_to : null,
	});
}
