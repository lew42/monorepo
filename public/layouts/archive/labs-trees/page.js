import { Page, View, div, span, button, input, icon, md, demo } from "/app.js";
import "/framework/ext/demo/steps.js";     // the side effect IS the export — attaches demo.steps
import { gen, CAP } from "./gen.js";
import { family_tree, flow_chart, brainstorm } from "./draw.js";

View.stylesheet(import.meta, "trees.css");

/* Container: a plain top-level page under `/layouts/labs/` (not a columns host — the
   parent isn't one, `labs/page.js` says so of itself). Size: `full` — `mag/page.js` and
   `labs/page.js` itself already use this word off a columns host, so it is a proven,
   working pattern here, not a guess (`css` skill: verify a word by reading its rule and
   a computed style, never by inference — the page is shot at 400/1280/1920 in
   `doc/decisions.md`'s verification pass, which is where a wrong guess would show up).
   Own layout: one intro line, a controls row, `demo.steps()` as the first screen (its
   stage IS the family-tree canvas below, not a fourth copy of it), then the flow-chart
   and brainstorm canvases. Regions: none — a leaf lab, like every other `/layouts/labs/`
   child. Preview: the default card, from `/layouts/labs/page.js`'s wall.

   WHAT THIS PAGE IS FOR. The owner's own words: "a tree generator — a, a1, a1a, a1b —
   and display those family-tree style, flow-chart style, brainstorm style." `gen.js` is
   the generator (a 20-line seeded one — `core/Page/generator/gen.js` draws PAGE trees,
   never a label, so it didn't fit); `draw.js` is the three drawings, each plain
   flex/grid CSS with a border for every connector — no canvas, no SVG, no coordinate
   math anywhere. This file is the page around them: the controls, the pan/fullscreen
   chrome, and the fold/scroll/mobile behaviour the owner asked for. */

// One entry per drawing — the loop `content()` and `redraw()` both walk, so a fourth
// drawing is one line here and nothing else.
const DRAWINGS = [
	{ key: "family", title: "Family tree", build: family_tree },
	{ key: "flow", title: "Flow chart", build: flow_chart },
	{ key: "brainstorm", title: "Brainstorm", build: brainstorm },
];

// How many nodes a tree actually has — the readout under the controls, so a seed that
// hit `CAP` (gen.js) SAYS so instead of just looking mysteriously smaller than its
// neighbour.
function count(node){ return 1 + node.children.reduce((sum, child) => sum + count(child), 0); }

export default new Page({
	meta: import.meta,
	title: "Trees",
	description: "One seeded tree, drawn three ways in plain flex/grid CSS — a family tree, a flow chart, a brainstorm map. No canvas, no SVG, no coordinate math.",
	icon: "account_tree",
	width: "full",

	tree_seed: 7,
	tree_depth: 3,
	tree_breadth: 3,

	// ⚠ `depth` alone collides with core's OWN `Page.depth` (how many levels of
	//   CHILDREN `load_all_children()` preloads, Page.class.js:846) — harmless on a
	//   leaf page with no children, but a name a reader would misread as the same
	//   thing. Prefixed, per the `code` skill's own rule for this exact trap.
	initialize(){
		this.tree = gen(this.tree_seed, this.tree_depth, this.tree_breadth);
		this.folded = new Set();          // labels whose children are hidden
		this.panes = new Map();           // key -> { $canvas, $pan, $btn, build }

		// One listener for every canvas on the page — `document.fullscreenElement` says
		// which one (or none) is live, so the ⤢ icon and Escape both stay correct
		// however fullscreen was entered or left.
		document.addEventListener("fullscreenchange", () => this.panes.forEach(pane =>
			pane.$btn.empty(() => icon(document.fullscreenElement === pane.$canvas.el ? "close_fullscreen" : "open_in_full"))));
	},

	content(){
		md("**One tree, three ways to draw it.** Every line below — the boxes, the rows, the connectors — is plain flexbox, grid and a CSS border; nothing here is a `<canvas>`, an SVG, or a pixel this page calculated. Click any node to fold or unfold its branch. Each drawing has its own **⤢ full screen** button — inside it, swiping only pans the tree, because the page behind it is gone rather than scrolling underneath.");

		this.controls();

		// THE FIRST SCREEN. `demo.steps()`'s `stage` is called once and returns the
		// SAME family-tree canvas this page shows anyway — not a fourth, throwaway
		// copy — so reading the three steps and doing the two gestures leaves the
		// reader looking at the real thing, already folded once, ready to keep going.
		demo.steps({
			steps: [
				{ say: "Click a branch to fold it", when: "fold" },
				{ say: "Click it again to bring it back", when: "unfold" },
				{ say: "Press ⤢ — swipe pans, Escape leaves", when: "fullscreen" },
			],
			stage: () => this.canvas("family"),
		});

		DRAWINGS.filter(d => d.key !== "family").forEach(d => this.canvas(d.key));

		md("The [readme](/layouts/labs/trees/readme/) has why plain CSS instead of canvas or SVG, why full screen uses the real `requestFullscreen()` API, and the mobile-framing numbers.");
	},

	// ── THE GENERATOR CONTROL ──────────────────────────────────────────────────
	controls(){
		div.c("flex gap wrap v-center std-trees-controls wide", () => {
			this.field("Seed", "tree_seed", 0, 999999);
			button.c("std-trees-tool", () => icon("casino")).attr("title", "a random seed")
				.click(() => this.regenerate({ tree_seed: Math.floor(Math.random() * 1e6) }));
			this.field("Depth", "tree_depth", 2, 5);
			this.field("Breadth", "tree_breadth", 1, 4);
			this.$count = span.c("muted std-trees-count");
		});

		this.count();
	},

	// One labelled number field, bound straight to `regenerate()` — every control
	// writes the same one door, the way `core/Page/generator`'s dials all write `type()`.
	field(text, key, min, max){
		const page = this;
		let $input;

		return span.c("std-trees-field", () => {
			span.c("muted", text + " ");
			$input = input.c("std-trees-input").attr("type", "number").attr("min", min).attr("max", max)
				.attr("value", String(page[key]))
				.on("change", () => {
					const value = Math.max(min, Math.min(max, Math.trunc(+$input.el.value) || min));
					$input.el.value = value;
					page.regenerate({ [key]: value });
				});
		});
	},

	// A NEW TREE. Every control (the two dials, the dice, a typed number) goes through
	// here: regrow the tree, throw away the fold state (a fresh tree has no history to
	// keep — `ux/Tree`'s own `draw()` makes the same call, doc/decisions.md there), and
	// redraw everything that is on screen.
	regenerate(changes){
		Object.assign(this, changes);
		this.tree = gen(this.tree_seed, this.tree_depth, this.tree_breadth);
		this.folded = new Set();
		this.redraw();
	},

	count(){
		const n = count(this.tree);
		this.$count?.text(n + " node" + (n === 1 ? "" : "s") + (n >= CAP ? ` — capped at ${CAP}` : ""));
	},

	// ── ONE CANVAS: A BAR (title, home, full screen) + A PAN AREA ────────────────
	canvas(key){
		const info = DRAWINGS.find(d => d.key === key);
		const page = this;
		let $canvas, $pan, $btn;

		// `wide` — the page grid's own word for all the leftover room (Page.css:
		// `.page > .wide { grid-column: wide }`, the same door `ext/demo/steps.js`'s
		// own wrapper already uses for the family canvas above). A pannable tree wants
		// the room; on the family canvas nested inside `demo.steps()`'s own `.wide`
		// wrapper this is a harmless no-op (only a DIRECT child of `.page` claims the
		// track), so one line here is correct for whichever canvas it is.
		$canvas = div.c("std-trees-canvas wide", () => {
			div.c("std-trees-canvas-bar", () => {
				span.c("std-trees-canvas-title", info.title);
				button.c("std-trees-tool").attr("title", "back to the root")
					.append(() => icon("home")).click(() => page.home(key));
				$btn = button.c("std-trees-tool").attr("title", "full screen")
					.append(() => icon("open_in_full")).click(() => page.toggle_fullscreen(key));
			});
			$pan = div.c("std-trees-canvas-pan");
		});

		this.panes.set(key, { $canvas, $pan, $btn, build: info.build });
		this.draw(key);

		return $canvas;
	},

	// Throw this ONE pane's drawing away and rebuild it from the current tree + fold
	// state — same "never diff, just redraw" call `ux/Tree.draw()` makes, and for the
	// same reason: the tree is small, and keeping open-state in sync by hand across
	// three different drawings is real complexity this doesn't need.
	draw(key){
		const pane = this.panes.get(key);
		pane.$pan.empty(() => pane.build(this.tree, this.folded, node => this.toggle(node, key)));
	},

	redraw(){
		this.panes.forEach((pane, key) => this.draw(key));
		this.count();
	},

	// A node was clicked, IN WHICHEVER canvas — the fold state is shared (it is
	// genuinely the SAME tree, drawn three times), so every canvas redraws, and only
	// the one the reader is looking at gets scrolled.
	toggle(node, key){
		// The state BEFORE the toggle decides which way it just moved — was open, so
		// this click is the one that folds it (and the reverse). Naming this after the
		// state AFTER the toggle is the one-line bug that shipped first: it dispatched
		// "fold" for the click that had just OPENED the node.
		const was_open = !this.folded.has(node.label);
		was_open ? this.folded.add(node.label) : this.folded.delete(node.label);

		this.redraw();
		this.reveal(node.label, key);

		// `demo.steps()`'s own listeners sit on the family canvas only (`content()`);
		// firing here — always, whichever canvas was actually clicked — is what lets
		// folding the FLOW CHART still check off the family canvas's first step, since
		// both just changed together.
		this.panes.get("family")?.$canvas.el.dispatchEvent(new CustomEvent(was_open ? "fold" : "unfold", { bubbles: true }));
	},

	// Centre one node in one canvas's pan area — used after every fold/unfold, and by
	// `home()` for the root specifically.
	reveal(label, key){
		const pane = this.panes.get(key);
		const $node = pane?.$pan.el.querySelector(`[data-label="${CSS.escape(label)}"]`);
		$node?.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
	},

	home(key){ this.reveal(this.tree.label, key); },

	// FULL SCREEN, THE REAL API — not `ext/demo`'s own `filler()` (a CSS "fill the
	// window" toggle; the page behind it still scrolls). `requestFullscreen()` removes
	// the page from view entirely, which is the actual fix for the owner's "two
	// scrolls" problem: inside it there is nothing left to scroll BUT the pan area, so
	// a swipe can only ever be a pan. `fullscreenchange` (initialize()) keeps every
	// button's icon honest, however the reader leaves — the ⤢ button again, or Escape,
	// which the browser handles on its own; nothing here has to catch it.
	toggle_fullscreen(key){
		const pane = this.panes.get(key);
		if (!pane) return;

		if (document.fullscreenElement === pane.$canvas.el){
			document.exitFullscreen();
			return;
		}

		pane.$canvas.el.requestFullscreen?.()
			.then(() => pane.$canvas.el.dispatchEvent(new CustomEvent("fullscreen", { bubbles: true })))
			.catch(() => {});
	},
});
