import { Page, View, div, p, h2, h3, span, icon, md, input, textarea, pre } from "/app.js";
import { Paging, press } from "../paging.js";
import { baseline } from "../baseline.js";
import { store_for, LocalStore, DIR } from "../make/made.js";
import BuildStage from "./stage.js";
import {
	NAVS, SURFACES, ARRANGES, BLOCKS, ICONS,
	NEW_PAGE, mode_of, blocks_of, nav_of, name_for, next_in, code_for,
	is_default, edit, set_mode, add_block, edit_block, remove_block, move_block,
	add_child, edit_child, remove_child, move_child, set_default,
} from "./words.js";

View.stylesheet(import.meta, "build.css");

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s columns row — no page grid, so `wide` means
                nothing here and only the prose is measure-capped. `width: "full"`:
                a builder is a TOOL, and three columns of controls do not fit in a
                shared row. Takeover gives it the whole row at every width, and the
                crumb strip is how you get back out.
   2 SIZE       the row: 1238px at 1280, ~3300px at 3440. The card is a three-track
                grid, each track with a floor and a ceiling; the side tracks cap at
                `min(24%, 26rem)` and `min(30%, 30rem)` so the STAGE takes everything
                3440 has spare (measured 297 / 542 / 371 at 1280). Under 64rem of
                CARD width - not window width - the three stack.
   3 OWN LAYOUT each column is a `flex v gap` stack of small titled groups. The stage
                is one drawn rectangle — the white card the swap happens on.
   4 REGIONS    one, core's. This page has NO children: the pages it builds are real
                children of `../make/`, which is where they are saved.
   5 PREVIEW    core's default card.

   ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────────
   The page BUILDER. It answers the owner's question — "how would I build this with
   a UI?" — by being the UI: seven controls on the left, the page assembling live in
   the middle, and the `page.json` it writes on the right, changing with every click.

   ── HOW IT WORKS, IN THREE SENTENCES ──────────────────────────────────────────
   1. Everything you press edits ONE plain object — the node in the box on the right
      — and every edit returns a NEW object rather than patching the old one.
   2. The stage draws that object. It is not a preview image: the tabs really swap
      and the prose really goes through `md()`.
   3. Save hands the node to `../make/made.js`, the SAME store Make writes — one
      directory, one `page.json`, on disk in dev. There is no second store and there
      will not be one (`../doc/persistence.md`).

   ⚠ `$stage`, `$frame` and `$note` ARE PAGING'S, not mine. `Paging.dress()` restamps
     toolbar classes onto `this.$stage` on every repaint, so the builder's own boxes
     are `$controls`, `$screen` and `$json`. A field of the same name would have been
     silently re-classed on the first chip press.                                  */

export default new Paging({
	meta: import.meta,
	title: "Build",
	description: "Seven controls, a live page, and the JSON it writes.",
	icon: "construction",
	width: "full",


	takeaway: "**This is “new page” to a finished page, with nothing but controls.** Pick how its children appear, what it looks like, how it is laid out, then add blocks and pages to it — the middle column is the page assembling as you click, and the right column is the `page.json` that gets written. Save puts it on disk beside every other page you have made.",

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
	apply(node, { controls = true } = {}){
		this.node = node;
		this.keep();
		return this.redraw({ controls });
	},

	edit_node(change, options){ return this.apply(edit(this.node, change), options); },

	/* ⚠ NOT `mode()` and NOT `change()`. `Paging` keeps a `mode` FIELD (its opening
	   words) and a `change` field (what the last chip press did), and a method of
	   either name silently shadows one of them. The `code` skill's trap, met while
	   writing this file. */
	set_words(change, options){ return this.apply(set_mode(this.node, change), options); },

	redraw({ controls = true } = {}){
		if (controls) this.$controls?.empty(() => { this.controls(); });
		this.$screen?.empty(() => { this.screen(); });
		this.$json?.empty(() => { this.json_box(); });
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
	content(){
		this.lede();

		md("Everything below writes into one small JSON file. **The left column is the controls, in the order you meet them; the middle is the page you are building, live; the right is the file.** Nothing here is a mock-up — press a tab in the middle and it really swaps, and the file on the right is really what goes to disk.");

		this.builder();

		h2("Adding a tab, and configuring one");

		md("**A tab is a child page.** There is no separate tab to create: you add a page under this one, and the *Navigation* control decides whether the pages under it are drawn as **tabs** (a strip over one panel) or as **columns** (rows you click, which open to the right). Change that one word and the same children redraw the other way, with nothing else touched.");

		md("**Configuring a tab is the four things every child page has** — its **name**, its **order** among its siblings, whether it is the **default** (the one showing when you arrive), and its **icon**. They are the four controls on each row under *Pages* on the left, and each one writes one field of that child in the JSON on the right.");

		md("⚠ **Tabs do not change the url.** A tab strip is the `swap` mechanism, so the panel changes and the address bar does not — a tab cannot be linked to or reached with the Back button. If a child deserves an address, leave the navigation on **columns**. ([the four mechanisms](/imagine/paging/mechanisms/))");

		h2("What this can and cannot build");

		md("Every `page.js` on this site was read and sorted by what a UI would have to offer to build it — 890 files, 890 rows. **About a fifth are pure configuration already**, a further **two fifths need the page to NAME something js supplies** (the pattern `\"kids\": \"tabs\"` uses), and **the last third are code and should stay code**: a live control, content computed from data, something fetched. The counts, the method and the decision are in [doc/builder.md](/imagine/paging/doc/builder.md).");

		md("That is why the last control is **Code**. When the builder cannot say a thing, it prints the `page.js` a hand would write for what you have built so far — with the line where your code goes already marked.");

		md("Where the pages go, what the mark at the top means, and why there is exactly one store: [doc/persistence.md](/imagine/paging/doc/persistence.md). The CRUD list of everything you have made: [Make](/imagine/paging/make/).");
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
		return div.c("build wide", () => div.c("build-card", () => {
			this.$controls = div.c("build-controls flex v gap", () => { this.controls(); });
			this.$screen = div.c("build-centre", () => { this.screen(); });
			this.$json = div.c("build-json flex v gap", () => { this.json_box(); });
		}));
	},

	// ════ THE CONTROLS, IN ORDER ══════════════════════════════════════════════
	controls(){
		this.part(1, "Name", "What the page is called. It is the head, the crumb, the card and — if its parent draws tabs — the tab.", () => this.name_controls());

		this.part(2, "Navigation", "How the pages UNDER this one appear. Top tabs, a left rail and column pages are the same question asked once, so they are one control.", () => this.picker(NAVS, nav_of(this.node).id, nav => this.set_words({ kids: nav.kids, mech: nav.mech })));

		this.part(3, "Surface", "What the page looks like while it does it. One word, five answers, independent of everything else.", () => this.word_chips(SURFACES, mode_of(this.node).style, it => this.set_words({ style: it.id })));

		this.part(4, "Layout", "How the blocks are arranged, numbered the way the layout system numbers them — 1.* is one column, 2.* is two.", () => this.word_chips(ARRANGES, mode_of(this.node).arrange, it => this.set_words({ arrange: it.id })));

		this.part(5, "Blocks", "The content, as data. Three kinds, and every one is drawn by something that already exists.", () => this.block_controls());

		this.part(6, "Pages", "The children. Under `tabs` each one is a tab; under `columns` each one is a row that opens to the right. Same pages either way.", () => this.child_controls());

		this.part(7, "Code", "For everything the controls cannot say — and a third of this site is exactly that.", () => this.code_control());
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

	// ── 2 · navigation: pictures, not words ──────────────────────────────────
	/* SIX PICTURES. A word alone cannot tell you what "swap" does to a page, and the
	   realm learned that the hard way (`../doc/decisions.md`): each option draws the
	   shape it makes, so the choice is made by looking rather than by reading. */
	picker(list, current, run){
		div.c("build-picker", () => list.forEach(it => press(
			div.c("build-option").ac(it.id === current && "on").append(() => {
				div.c("build-thumb build-thumb-" + it.id, () => { div.c("build-thumb-bar"); div.c("build-thumb-body"); });
				span.c("build-option-title", () => { icon(it.icon); span(it.title); });
			}),
			() => run(it))));

		return p.c("muted build-means", list.find(it => it.id === current)?.means ?? "");
	},

	/* ⚠ NOT `chips()`. `Paging.chips()` is the list of axes its toolbar shows, and
	   `dress()` calls it on EVERY column render — overriding it with a different
	   signature throws before this page draws a single word. */
	word_chips(list, current, run){
		div.c("build-chips", () => list.forEach(it => press(
			span.c("paging-chip").ac(it.id === current && "on").append(() => span(it.title ?? it.id)),
			() => run(it))));

		// A statement, not an expression: a captured callback's RETURN VALUE is appended
		// too, and the second append MOVES what the first one already placed.
		return p.c("muted build-means", () => { md(list.find(it => it.id === current)?.means ?? ""); });
	},

	// ── 5 · blocks ───────────────────────────────────────────────────────────
	block_controls(){
		const blocks = blocks_of(this.node);

		blocks.forEach((block, i) => this.block_row(block, i));

		if (!blocks.length) p.c("muted", "No blocks yet. The page is a title and nothing else — which is a real page, and 91 on this site are exactly that.");

		return div.c("build-adds", () => BLOCKS.forEach(kind => press(
			span.c("paging-chip on").attr("title", kind.means).append(() => { icon(kind.icon); span(kind.title); }),
			() => this.apply(add_block(this.node, kind.id)))));
	},

	block_row(block, i){
		return div.c("build-item", () => {
			div.c("build-item-head", () => {
				icon(BLOCKS.find(kind => kind.id === block.type)?.icon ?? "notes");
				span.c("build-item-title", BLOCKS.find(kind => kind.id === block.type)?.title ?? block.type);

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

	// ── 6 · pages, which is to say tabs ──────────────────────────────────────
	child_controls(){
		const kids = this.node.children ?? [];
		const tabs = nav_of(this.node).id === "tabs";

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

	// ── 7 · the code escape ──────────────────────────────────────────────────
	code_control(){
		md("A third of this site's pages need a `content()` that computes something, and no JSON will ever supply one. So here is the `page.js` this node would be if you wrote it by hand — copy it into a directory and the builder has handed the page over to you.");

		return pre.c("build-code", code_for(this.node));
	},

	// ════ THE STAGE ═══════════════════════════════════════════════════════════
	screen(){
		p.c("muted build-caption", "The page, as it will be. Click a tab or a row — this rectangle is the only thing that changes.");

		new BuildStage({ page: this, node: this.node, classes: "build-screen" });

		return p.c("muted build-caption", () => { md("A **picture that works**: the tabs really swap and the prose really goes through `md()`. What it cannot do is route — the page has no url until you save it."); });
	},

	// ════ THE FILE ════════════════════════════════════════════════════════════
	json_box(){
		h3.c("build-group-title", () => { span.c("build-n", "→"); span("The file"); });
		p.c("muted build-group-line", "The node exactly as it goes to disk. It changes with every control you press.");

		pre.c("build-json-text", JSON.stringify(this.file(), null, "\t"));

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
