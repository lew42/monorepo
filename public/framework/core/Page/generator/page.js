import { Page, View, div, span, a, textarea, input, button, icon, md } from "/app.js";
import { gen, MODEL } from "./gen.js";
import { edit } from "./spec.js";
import { tree, items } from "./tree.js";
import { globals, SIZES } from "./controls.js";
import { wall } from "./rolls.js";

View.stylesheet(import.meta, "generator.css");

/**
 * Pages without the filesystem. A seed draws a spec string, the spec builds a REAL page
 * tree under this url, and everything a real tree gets comes for free — the Router's
 * walk, the `active-page` / `active-ancestor` contract, `page.columns()`, the crumb
 * strip, the width words.
 *
 * The mechanism is one line of `grow()`: `children:` already takes nested plain
 * objects, and `add()` turns each into a `Page`. Nothing here plays app.
 */
export default new Page({
	meta: import.meta,
	title: "Generator",
	label: "Generator",
	description: "A seed is a page tree. Five block words, three width words, no filesystem.",
	icon: "casino",

	seed: 7,

	// The header's two globals, as they start: core's default column track, and the
	// gap every wall and inbox in the tree runs at. View state — see `size()`.
	sized: "default",
	gapped: "snug",

	/* ⚠ Runs INSIDE the constructor, before load_all_children() — which is exactly
	   where a child has to arrive to be settled like a declared one. `location.hash`
	   is already readable here, so a deep url reloads onto the tree it was addressed
	   against rather than onto the default one. */
	initialize(){
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

		this.add("rolls", wall(this));
		tree(this.spec, this.hash()).forEach(config => this.add(config.name, config));

		return this.spec;
	},

	/* THE ADDRESS. `#7` is a seed; `#s=<encoded>` is a spec typed by hand, carried whole —
	   a typed tree is not a number, so its text IS its address. Every url in this module
	   asks here, so there is one answer. */
	hash(){ return "#" + (this.typed ? "s=" + encodeURIComponent(this.spec) : this.seed); },

	// ⚠ The crumb strip draws `link()`; a crumb without the hash reloads a different tree.
	link(text){ return a.c("page-link", text ?? this.title).href(this.url + this.hash()); },

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
				.on("change", () => this.type(this.$spec.el.value));

			div.c("page-gen-note", () => {
				md("Every line is a **page**; indentation is nesting. The first word says **where a child appears when you pick it**, and `small large full` picks the column's width. **Type in the box above** and the tree is rebuilt from your text.");
				md("**Every control writes that text.** The two menus on a column's head are its own two words; a wall's chips are `cols=` and `gap=` on the same line, drawn by framework.css's `.grid.auto` / `.flex.auto` and the `--column` / `--gap` they read. So a switched tree is a link, a reload lands on it, and the seed is never touched.");
				md("`wall` `list` `prose` open a **new column** to the right — a wall of cards, an inbox of previews, a leaf. `tabs` `vtabs` switch **in place**: the child lands in this column's panel and the row never grows.");
				md("Those are real urls, walked by the real Router. The address rides in the hash — a seed as `#7`, a typed spec as its own text — so any tree here is a link.");
				// ⚠ No href written here: this note is drawn ONCE and the hash changes on
				// every roll. The live link is the **Permutation wall** row above, which
				// `draw()` rewrites with the current address every time.
				md("**Permutation wall**, the first row above: twenty-four rolls at once, each a picture of its tree, with the pairing rules they were drawn under printed underneath.");
				// ⚠ The pretty url, not `readme.md`: `Page.file()` renders a `.md` beside a
				// page AS a page, so the readme opens as one more column. Verified — the
				// `doc/<name>/` form does NOT work here (that one is ext/Doc's).
				md("**Four words were cut** — `grid` `flush` `crumbs` `rail` changed how the links *looked*, never where a child went, and a shape with no behaviour is a pattern, not a word. Each is four lines of `new Page()`: [readme](/framework/core/Page/generator/readme/).");
			});
		});

		this.draw();

		// ⚠ A frame, not now: `router.active` is written after this render returns.
		requestAnimationFrame(() => this.first());

		return $body;
	},

	/* SHOW SOMETHING. A columns host with nothing open is one 22em column and a screen of
	   grey — most of the viewport at 3440 (ux recon 2026-08-27, #3). The first root opens
	   itself.
	   ⚠ ONCE per load, and the flag is the whole point: a page that re-opened every time
	     it became active would make Back unusable — Back to `/generator/` would move you
	     forward again on the same frame.
	   ⚠ Only when the generator itself is what landed. A deep url has its own column open
	     already, and nothing here may steal it. */
	first(){
		const root = [...this.children.values()].find(kid => kid?.at);
		const router = this.app?.router;

		if (this.opened || !root || router?.active !== this) return;

		this.opened = true;
		return router.go(root.url + this.hash());
	},

	/* THE LAW, on the page rather than in a test: a seeded generator has to prove
	   bit-identical output on unchanged inputs, so the spec is drawn a SECOND time and
	   the two strings compared, every time this repaints. A TYPED spec has no seed to
	   redraw from — its own text is the proof, and the line says so rather than lying. */
	draw(){
		const same = gen(this.seed) === this.spec;
		const size = `${this.spec.split("\n").length} pages, ${this.spec.length} chars`;

		this.$seed.el.value = this.seed;
		this.$spec.el.value = this.spec;
		this.$nav.empty(() => items(this, this.hash()));

		this.$proof
			.rc("page-gen-ok page-gen-bad")
			.ac(this.typed || same ? "page-gen-ok" : "page-gen-bad")
			// ⚠ The MODEL number rides along, because a seed is only an address against one:
			//   `#7` under v1 and `#7` under v2 are different trees, and the line has to say
			//   which one you are looking at (doc/decisions.md).
			.text(this.typed
				? `typed spec — ${size}, addressed by its own text`
				: `seed ${this.seed}, model v${MODEL} — ${size}, ` + (same ? "identical on a second run" : "NOT REPRODUCIBLE"));
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

	/* THE THIRD DOOR, and the one every control uses: change ONE line of the spec.
	   A switch is a typed spec from then on — it is no longer what `gen(seed)` draws, and
	   the proof line says so rather than claiming a seed it does not have. The seed is
	   never touched, so `#7` still means one tree and the reproducibility law holds. */
	swap(at, change){ return this.type(edit(this.spec, at, change)); },

	/* Rebuild, repaint, and move the url to the new address — landing back on the column
	   you were reading, which is the difference between a control and a reset button.
	   ⚠ `place()` runs BEFORE `grow()`: the regrow throws every generated page away, so
	     the Router is left pointing at one that no longer exists. */
	show(){
		const at = this.place();

		this.grow();
		this.draw();

		const url = this.resolve(at) + this.hash();
		const router = this.app?.router;

		if (router?.active && router.active !== this) router.go(url);
		else history.replaceState({}, "", url);
	},

	/* WHERE THE READER IS, as indices into the tree. Indices and not the url, because a
	   generated page is named after its block word: switching a `list` to `tabs` renames
	   it and everything under it, so the url you were on 404s while the column you were
	   reading is still there, one word different. A position never moves.
	   ⚠ `kid?.at` is the filter: the permutation wall is a stable child with no place in
	     the spec, so it is not in the count — and standing on it gives `[]`, the host. */
	place(){
		const at = [];

		for (let page = this.app?.router?.active; page && page !== this; page = page.parent){
			const kids = [...page.parent?.children.values() ?? []].filter(kid => kid?.at);
			const i = kids.indexOf(page);

			if (i < 0) return [];
			at.unshift(i);
		}

		return at;
	},

	// The same indices, back to a url, in the tree that just replaced the old one.
	resolve(at){
		let page = this;

		for (const i of at){
			page = [...page.children.values()].filter(kid => kid?.at)[i];
			if (!page) return this.url;
		}

		return page.url;
	},

	/* THE HEADER'S GLOBALS — tokens on the columns host, inherited by every column that
	   names no width of its own. A token needs no specificity to win, which is the same
	   move `.page-column-small` makes one level up (controls.js).
	   ⚠ Deliberately NOT in the address: `#7` has to keep meaning one TREE, and how wide
	     you like your columns is not the tree. doc/decisions.md. */
	/* ⚠ `fill` needs a CLASS as well as its tokens. A width word declares its ceiling on
	     its OWN element (`.page-column-large { --page-column-max: 64em }`), and no token
	     inherited from the host can reach past that — measured at 3440: a `large` column
	     stayed 1152px with 1256px of the row empty beside it. */
	size(word){
		this.sized = word;
		this.view.tc("page-gen-uncapped", word === "fill");

		return this.view.style(SIZES[word]);
	},
	gap(value, word){ this.gapped = word; return this.view.style("--gen-gap", value); },

	/* The url decides what this page is, before anything renders: `#7` a seed, `#s=…` a
	   spec typed by hand and sent to someone. Neither, and it is the default seed.
	   ⚠ It sets the state and stops — NOT `open()` / `type()`: this runs inside the
	     constructor, where there are no controls to repaint and no Router to move. */
	land(){
		const hash = decodeURIComponent(location.hash.slice(1));

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
