import { Page, View, div, span, a, textarea, input, button, icon, md } from "/app.js";
import { gen } from "./gen.js";
import { tree, items } from "./tree.js";
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
	description: "A seed is a page tree. Nine block words, three width words, no filesystem.",
	icon: "casino",

	seed: 7,

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

			this.$proof = div.c("page-gen-proof");

			// The way IN. A page's view is built when it activates, so without these
			// links the generated tree exists and nothing on screen can reach it.
			this.$nav = div.c("page-gen-nav");

			/* THE SPEC IS THE INPUT, not a readout — the parser has always taken a
			   string, so the box you read it in is the box you write it in. On `change`
			   (blur or Enter out of the field), the typed text becomes the tree.
			   ⚠ A textarea's value is not its textContent: `.text()` writes the DEFAULT
			     value and is ignored once a human has typed. `el.value`, always. */
			this.$spec = textarea.c("page-gen-spec").attr("rows", "10").attr("spellcheck", "false")
				.on("change", () => this.type(this.$spec.el.value));

			div.c("page-gen-note", () => {
				md("Every line is a **page**; indentation is nesting. The first word says how a page presents its children — `tabs vtabs rail wall grid flush list prose crumbs` — and `small large full` picks its column. **Type in the box above** and the tree is rebuilt from your text.");
				md("Those are real urls, walked by the real Router. The address rides in the hash — a seed as `#7`, a typed spec as its own text — so any tree here is a link.");
				// ⚠ No href written here: this note is drawn ONCE and the hash changes on
				// every roll. The live link is the **Permutation wall** row above, which
				// `draw()` rewrites with the current address every time.
				md("**Permutation wall**, the first row above: twenty-four rolls at once, each a picture of its tree, with the pairing rules they were drawn under printed underneath.");
				// ⚠ The pretty url, not `readme.md`: `Page.file()` renders a `.md` beside a
				// page AS a page, so the readme opens as one more column. Verified — the
				// `doc/<name>/` form does NOT work here (that one is ext/Doc's).
				md("How it works, and what it cut: [readme](/framework/core/Page/generator/readme/).");
			});
		});

		this.draw();

		return $body;
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
			.text(this.typed
				? `typed spec — ${size}, addressed by its own text`
				: `seed ${this.seed} — ${size}, ` + (same ? "identical on a second run" : "NOT REPRODUCIBLE"));
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

	/* Rebuild, repaint, and move the url to the new address.
	   ⚠ Regrowing while deep in the OLD tree leaves the Router pointing at a page that no
	     longer exists — so go home, and the address rides the hash there. */
	show(){
		this.grow();
		this.draw();

		const router = this.app?.router;

		if (router?.active && router.active !== this) router.go(this.url + this.hash());
		else history.replaceState({}, "", this.url + this.hash());
	},

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
