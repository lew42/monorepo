import { Page, View, div, span, a, textarea, input, button, icon, md } from "/app.js";
import { gen, MODEL } from "./gen.js";
import { edit } from "./spec.js";
import { tree, items } from "./tree.js";
import { globals, SIZES, GAPS, unknown } from "./controls.js";
import { wall } from "./rolls.js";
import { gallery } from "./specs.js";
import { control, run, report, content_line, width_line } from "./export.js";

View.stylesheet(import.meta, "generator.css");

// History and design: doc/notes.md
export default new Page({
	meta: import.meta,
	title: "Generator",
	label: "Generator",
	description: "A seed is a page tree. Five block words, three width words, no filesystem.",
	icon: "casino",

	seed: 7,

	// The header's three globals, as they start: core's default column track, the gap
	// every wall and inbox in the tree runs at, and the costume it wears. View state —
	// see `size()`, and `land()` for where a returning visitor's values come from.
	sized: "default",
	gapped: "snug",
	looked: "finder",

	/* ⚠ Declared, not derived. `prefs()` keys on the page's own url, and `store_key` is
	     the seam for a page that could MOVE — this one is deep enough in the tree that a
	     rename anywhere above it would silently orphan everything saved (doc/method/prefs.md). */
	store_key: "/framework/core/Page/generator/",

	/* ⚠ Runs INSIDE the constructor, before load_all_children() — which is exactly
	   where a child has to arrive to be settled like a declared one. `location.hash`
	   is already readable here, so a deep url reloads onto the tree it was addressed
	   against rather than onto the default one. */
	initialize(){
		// THE CODE TAB'S OWN LOG — one entry per position (`page.at`, JSON-stringified),
		// so it survives every regrow (`grow()` throws the whole tree away and rebuilds
		// it from the spec text — doc/decisions.md). `log_call()` appends, `route("code")`
		// (tree.js) reads. Never cleared: it is a transcript of the session, not a cache.
		this.calls = new Map();

		this.land();
		this.grow();
		this.columns();   // core's opt-in: my whole subtree lays out as columns
	},

	/* The spec → the children. The one place the tree is replaced; `open()` and `type()`
	   set `spec` first, and nothing else may.
	   ⚠ The wall goes in FIRST and on every regrow, because `children` is replaced
	     wholesale — it is a stable page, not a generated one. */
	grow(){
		this.children.forEach(child => child?.view?.el.remove());
		this.children = new Map();
		// Spec → children: the one place the tree is replaced; see doc/notes.md

		this.add("rolls", wall(this));
		this.add("specs", gallery(this));
		tree(this.spec, this.hash(), this).forEach(config => this.add(config.name, config));

		return this.spec;
	},

	/* THE ADDRESS. `#7` is a seed; `#s=<encoded>` is a spec typed by hand, carried whole —
	   a typed tree is not a number, so its text IS its address. Every url in this module
	   asks here, so there is one answer. */
	hash(){ return "#" + (this.typed ? "s=" + encodeURIComponent(this.spec) : this.seed); },

	// ⚠ The crumb strip draws `link()`; a crumb without the hash reloads a different tree.
	link(text){ return a.c("page-link", text ?? this.title).href(this.url + this.hash()); },

	/* COPY THE ADDRESS. The tree IS this module's whole artifact and there was no
	   control that would hand it to you — `hash()` already builds the one string
	   every link in this module carries; this is the one button that takes it.
	   ⚠ `navigator.clipboard.writeText` needs a permission a headless run has to be
	     GRANTED first — the same trap ext/Panel's `Item.copy()` measured. The string
	     is kept on the instance too (`this.copied`), so a prover with no permission
	     can still read what the button WOULD have copied. */
	copy(){
		const address = location.origin + this.url + this.hash();

		this.copied = address;
		navigator.clipboard?.writeText(address)?.catch(() => {});

		// A beat of visual confirmation — the icon, not a class, because a colour
		// change alone reads as decoration; a checkmark reads as done.
		this.$copy.empty(() => icon("check"));
		clearTimeout(this._copy_timer);
		this._copy_timer = setTimeout(() => this.$copy.empty(() => icon("content_copy")), 1200);

		return address;
	},

	/* The host's own column — the controls, first in the row. `render_column()` wraps it
	   and builds `this.$pages`, so there is nothing to arrange here. */
	column(host){
		const $body = div.c("page-gen page-column-body page-gen-controls", () => {

			div.c("page-column-head", () => span.c("page-column-title", "Generator"));

			div.c("page-gen-dials", () => {
				button(() => icon("chevron_left")).click(() => this.open(this.seed - 1));

				this.$seed = input.c("page-gen-seed").attr("type", "number").attr("value", String(this.seed))
					.on("change", () => this.open(Math.trunc(+this.$seed.el.value) || 0));

				button(() => icon("chevron_right")).click(() => this.open(this.seed + 1));
				button(() => icon("casino")).click(() => this.open(Math.floor(Math.random() * 1e6)));

				// THE ADDRESS, taken. The tree is the module's whole artifact and there was
				// no control that would hand you its url — see copy().
				this.$copy = button.c("page-gen-copy", () => icon("content_copy"))
					.attr("title", "copy the address").click(() => this.copy());
			});

			// The two globals — the tree's default column track, and how dense every wall
			// in it is. Neither touches the spec; both are the header.
			globals(this);

			this.$proof = div.c("page-gen-proof");

			/* The way IN. A page's view is built when it activates, so without these
			   links the generated tree exists and nothing on screen can reach it.
			   ⚠ The label and the rules above/below are not decoration: three links
			     floating between the proof line and the spec box did not read as a nav
			     at all (ux recon 2026-08-27, #12). */
			span.c("page-gen-tag", "pages");
			this.$nav = div.c("page-gen-nav");

			/* THE SPEC IS THE INPUT, not a readout — the parser has always taken a
			   string, so the box you read it in is the box you write it in. On `change`
			   (blur or Enter out of the field), the typed text becomes the tree.
			   ⚠ A textarea's value is not its textContent: `.text()` writes the DEFAULT
			     value and is ignored once a human has typed. `el.value`, always. */
			this.$spec = textarea.c("page-gen-spec").attr("rows", "10").attr("spellcheck", "false")
				.on("input", () => this.hint(this.$spec.el.value))
				.on("change", () => this.type(this.$spec.el.value));

			/* A word `read()` (spec.js) does not know silently becomes `prose` — the
			   right call for the draw path, the wrong one for a reader who cannot see
			   why their `widget` line rendered a blank leaf. This line is the only
			   thing that says so; nothing it reads may change what gets drawn. */
			this.$hint = div.c("page-gen-hint");

			/* THE WAY OUT — the tree you are reading, written to disk as real
			   `page.js` files under `/imagine/generated/`. Here and not in the
			   gallery because this is where the tree is: the box above is the
			   spec, and this is the button that turns it into a module. */
			control(this);

			div.c("page-gen-note", () => {
				md("Every line is a **page**; indentation is nesting. The first word says **where a child appears when you pick it**, and `small large full` picks the column's width. **Type in the box above** and the tree is rebuilt from your text.");
				md("**Every control writes that text.** The two menus on a column's head are its own two words; a wall's chips are `cols=` and `gap=` on the same line, drawn by framework.css's `.grid.auto` / `.flex.auto` and the `--column` / `--gap` they read. So a switched tree is a link, a reload lands on it, and the seed is never touched.");
				md("`wall` `list` `prose` open a **new column** to the right — a wall of cards, an inbox of previews, a leaf. `tabs` `vtabs` switch **in place**: the child lands in this column's panel and the row never grows.");
				md("Those are real urls, walked by the real Router. The address rides in the hash — a seed as `#7`, a typed spec as its own text — so any tree here is a link.");
				// ⚠ No href written here: this note is drawn ONCE and the hash changes on
				// every roll. The live link is the **Permutation wall** row above, which
				// `draw()` rewrites with the current address every time.
				md("**Permutation wall**, the first row above: twenty-four rolls at once, each a picture of its tree, with the pairing rules they were drawn under printed underneath.");
				md("**Spec gallery**, the row under it: eight page shapes worth keeping — a docs site, an inbox, a settings rail — kept as their **text**, because a seed is only an address against one model. Pick one and it becomes the tree.");
				// ⚠ Prose, not a link to the button: the control is four lines up in the
				// same column, and a link to something already on screen reads as a
				// second, different thing.
				md("**Export writes the tree to disk** — one directory per page, an ordinary `page.js` in each, under [`/imagine/generated/`](/imagine/generated/). Nothing there imports anything from here; it is a module you edit like any other. Dev only, and a name that already exists is refused rather than overwritten.");
				md("**`size` `gap` `look` are not the tree.** They are how you like it dressed, so they stay out of the address and ride in `prefs()` instead — a reload, or a bare visit tomorrow, arrives back where you left. The three looks are [`/imagine/vary/colstyles/`](/imagine/vary/colstyles/)'s, worn by a tree that was never built.");
				// ⚠ The pretty url, not `readme.md`: `Page.file()` renders a `.md` beside a
				// page AS a page, so the readme opens as one more column. Verified — the
				// `doc/<name>/` form does NOT work here (that one is ext/Doc's).
				md("**Four words were cut** — `grid` `flush` `crumbs` `rail` changed how the links *looked*, never where a child went, and a shape with no behaviour is a pattern, not a word. Each is four lines of `new Page()`: [readme](/framework/core/Page/generator/readme/).");
			});
		});

		// ⚠ HERE not initialize(): each writes to this.view, created one line before this call
		this.size(this.sized);
		this.gap(GAPS[this.gapped] ?? "", this.gapped);
		this.look(this.looked);

		this.draw();

		// ⚠ Frame not now: router.active written after this render returns
		requestAnimationFrame(() => this.first());

		return $body;
	},

	first(){
		// ⚠ ONCE per load (flag); re-opening every time would break Back
		// ⚠ Only when generator itself landed, not on deep url with open column
		const root = [...this.children.values()].find(kid => kid?.at);
		const router = this.app?.router;

		if (this.opened || !root || router?.active !== this) return;

		this.opened = true;
		return router.go(root.url + this.hash());
	},

	draw(){
		// THE LAW: seeded must prove bit-identical on rerun; typed proves itself: see doc/notes.md
		const same = gen(this.seed) === this.spec;
		const size = `${this.spec.split("\n").length} pages, ${this.spec.length} chars`;

		this.$seed.el.value = this.seed;
		this.$spec.el.value = this.spec;
		this.hint(this.spec);
		this.$nav.empty(() => items(this, this.hash()));

		this.$proof
			.rc("page-gen-ok page-gen-bad")
			.ac(this.typed || same ? "page-gen-ok" : "page-gen-bad")
			// ⚠ MODEL number rides along (seed only valid against one version)
			.text(this.typed
				? `typed spec — ${size}, addressed by its own text`
				: `seed ${this.seed}, model v${MODEL} — ${size}, ` + (same ? "identical on a second run" : "NOT REPRODUCIBLE"));
	},

	hint(text){
		// The spec box own feedback: inline hint, never alert; see doc/notes.md
		const words = unknown(text);
		this.$hint.text(words.length ? `not recognised, becomes prose: ${words.join(", ")}` : "");
	},

	// One door for the stepper, the dice, a typed seed and every tile on the wall.
	open(seed){
		this.seed = seed;
		this.typed = false;
		this.spec = gen(seed);

		return this.show();
	},

	// The other door: a spec written by hand. Blank is not a tree — fall back to the seed.
	type(text){
		this.spec = text.trim() || gen(this.seed);
		this.typed = !!text.trim();

		return this.show();
	},

	pick(text){
		// GALLERY spec: arrives whole, opens its first root (type() alone leaves you on host)
		this.type(text);

		const root = [...this.children.values()].find(kid => kid?.at);
		return root && this.app?.router?.go(root.url + this.hash());
	},

	swap(at, change){
		// ⚠ Logged AFTER type() so log_call() reads FRESH page with the change reflected
		const result = this.type(edit(this.spec, at, change));
		this.log_call(at, change);
		return result;
	},

	log_call(at, change){
		// Code tab transcript: one line per control fire (same functions export.js uses)
		const page = this.page_at(at);
		if (!page) return;

		const line = "width" in change ? width_line(page) : content_line(page);
		if (!line) return;

		const key = JSON.stringify(at);
		this.calls.set(key, [...(this.calls.get(key) ?? []), line]);
	},

	show(){
		// ⚠ place() runs BEFORE grow() (regrow throws pages away before Router updates)
		const at = this.place();

		this.grow();
		this.draw();

		const url = this.resolve(at) + this.hash();
		const router = this.app?.router;

		if (router?.active && router.active !== this) router.go(url);
		else history.replaceState({}, "", url);

		return this.remember();
	},

	place(){
		// ⚠ kid?.at filter: wall is stable child with no place in spec, stands on [] = host
		const at = [];

		for (let page = this.app?.router?.active; page && page !== this; page = page.parent){
			const kids = [...page.parent?.children.values() ?? []].filter(kid => kid?.at);
			const i = kids.indexOf(page);

			if (i < 0) return [];
			at.unshift(i);
		}

		return at;
	},

	page_at(at){
		// Same indices resolved to PAGE (resolve + log_call both use this)
		let page = this;

		for (const i of at){
			page = [...page.children.values()].filter(kid => kid?.at)[i];
			if (!page) return null;
		}

		return page;
	},

	resolve(at){ return this.page_at(at)?.url ?? this.url; },

	size(word){
		// ⚠ NOT in address: #7 stays one TREE; column width is preference, see doc/notes.md
		// ⚠ fill needs CLASS too; token inherited from host can't reach past ceiling
		this.sized = word;
		this.view.tc("page-gen-uncapped", word === "fill");
		this.view.style(SIZES[word]);

		return this.remember();
	},
	gap(value, word){ this.gapped = word; this.view.style("--gen-gap", value); return this.remember(); },

	look(word){
		// ⚠ finder is absence of class not class; default that writes rules stays in step
		this.looked = word;
		this.view.rc("page-gen-look-cards page-gen-look-ink");
		if (word !== "finder") this.view.ac("page-gen-look-" + word);

		return this.remember();
	},

	remember(){
		// ⚠ patch() not set() (second writer in same key; set() would erase saved specs)
		return this.prefs().patch({ sized: this.sized, gapped: this.gapped, looked: this.looked, hash: this.hash() });
	},

	async export(){
		// ⚠ Page.slug() decides directory name not the field (.. is not a tree name)
		const name = Page.slug(this.$export_name.el.value);

		this.$export_msg.text("exporting…");

		return report(this, await run(this, name));
	},

	land(){
		// ⚠ Sets state and stops (not open/type, runs in constructor before controls exist)
		const saved = this.prefs().get({ sized: this.sized, gapped: this.gapped, looked: this.looked });

		Object.assign(this, { sized: saved.sized, gapped: saved.gapped, looked: saved.looked });

		// ⚠ THE URL WINS: read saved tree only when address names none (bare /generator/)
		const hash = decodeURIComponent(location.hash.slice(1)) || decodeURIComponent((saved.hash ?? "").slice(1));

		if (hash.startsWith("s=")){
			this.typed = true;
			return this.spec = hash.slice(2);
		}

		const n = Number(hash);

		this.typed = false;
		this.seed = hash && Number.isFinite(n) ? Math.trunc(n) : this.seed;

		return this.spec = gen(this.seed);
	},
});
