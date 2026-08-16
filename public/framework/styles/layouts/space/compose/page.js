import { Page, div, span, button, input, icon, md } from "/app.js";
import panel from "/framework/ext/Panel/workspace.js";
import { structure } from "/framework/ext/Panel/generate.js";

/* The same roll as the lab, as REAL panels. Nothing here is new machinery:
 * `structure(seed, depth)` already translated a spec into a `Panel` tree, `panel()`
 * already mounts one, and every bar already carries the `space_dashboard` roll — so a
 * section rerolls on its own by clicking its own bar, and this page is the seed, the
 * dials and a mount. Design record: ../readme.md.
 *
 * ⚠ THE SECOND ARGUMENT IS AN OPTIONS OBJECT, and that is the whole unification.
 *   `gen(seed, opts)` accepts a number OR `{ depth, chaos, fit }`, and `ext/Panel`'s
 *   `structure()` and `sow()` pass their second argument through untouched — so every
 *   `space_dashboard` button on every bar rerolls from the SAME model, with the same
 *   chaos and the same fit, and not one line of `ext/Panel` had to change for it.
 *   (That module is owned by another session; the compatibility promise is in gen.js.)
 *
 * ⚠ `panel()` and never `workspace()`: no saver, so a visitor can tear a roll apart
 *   freely and a reload comes back clean. A persisted one is a document the next
 *   visitor has to undo — the same call `styles/layouts/page.js` makes.
 */

/* css: .space-compose, .space-depth, .space-tag — all in ../space.css, which the parent
   Doc loads through ruler.js. This page is only ever reachable as its child tab, so it
   adds no second <link> (View.stylesheet does not dedupe). */

const MAX = 10;
const roll = () => Math.floor(Math.random() * 1e6);

export default new Page({
	meta: import.meta,
	title: "Compose",
	description: "The same generated layout as real panels — reroll any section on its own.",
	icon: "space_dashboard",

	/* ⚠ `full`, and deliberately NOT `fill`. A `fill` page is `min-height: 100%`, which
	     needs a parent with a definite height — and a Doc tab has none: `.doc-page` is a
	     wrapping flex box in a scrolling region, so `fill` here measured 0 and the
	     workspace rendered blank with fourteen panels in the DOM. The stage declares its
	     own height instead, the way `ext/demo`'s does. */
	classes: "full",

	seed: 7,

	/* ⚠ 1, where the lab defaults to 3. A panel holds a REAL band, not a picture of
	     one, and a band does not reflow — so a depth-3 tree at 3440 gives leaves ~80px
	     and `changelog`'s heading ladders one letter per line (measured: ~1.9
	     characters per line, `ext/LayoutTool` high). The slider still reaches 10; the
	     page just does not open on a broken one. */
	depth: 1,

	chaos: 0.2,   // the distance from model.js — ../draw.js

	/* ⚠ `screen`, and it is the reason this page rolls differently from the lab. A
	     panel is a FIXED area, so `gen()` doubles the weight of the row shapes: a
	     column of bands inside a box with a definite height is a stack of slivers,
	     where on a scrolling page it is what a document is made of. */
	fit: "screen",

	content(){

		// ⚠ `measure start`, not a bare `pad`: a `full` page has no reading column at
		//   all, so prose runs the whole 3440 — and `.measure` alone CENTRES, which
		//   would sit this block off the left edge everything below it shares.
		div.c("pad flow measure start", () => {
			md("**The lab's roll, as real panels.** Every block below is an `ext/Panel` — drag its seams, split it, retint it, or press its own `space_dashboard` button to reroll *just that section*. The bar appears on the panel under your pointer.");

			md("**Those buttons are the same generator, dials and all.** `gen(seed, opts)` takes an options object where it used to take a depth, and `ext/Panel` passes its second argument through untouched — so a per-section reroll draws from the same [`model.js`](../) at the same chaos, and nothing in `ext/Panel` had to know. Nothing persists here, on purpose: tear it apart freely. The picture version, the five-screen ruler and the score are on [Space](../); the search is on [Hunt](../hunt/).");

			md("⚠ **A panel holds a real band, and a band does not reflow.** Past depth 2 the leaves get narrower than the content in them and headings start laddering one letter per line — the translation is faithful at desktop widths and shallow depths only. That is the trade, not a bug to route around: the picture on [Space](../) is where a deep roll is worth looking at.");

			this.bar();
		}).style("--measure", "52em");

		this.stage();
	},

	bar(){
		return div.c("flex gap wrap v-center", () => {

			div.c("flex gap v-center", () => {
				button(() => icon("chevron_left")).click(() => this.open(this.seed - 1));
				this.$seed = span.c("space-tag muted");
				button(() => icon("chevron_right")).click(() => this.open(this.seed + 1));
				button(() => icon("casino")).attr("title", "Roll a layout").click(() => this.open(roll()));
			}).style("--gap", "0.4em");

			div.c("flex gap v-center", () => {
				span.c("space-tag muted", "depth");
				this.$depth = input.c("space-depth")
					.attr("type", "range").attr("min", "0").attr("max", String(MAX))
					.attr("value", String(this.depth))
					.on("change", () => this.open(this.seed, { depth: +this.$depth.el.value }));
				this.$note = span.c("space-tag muted");
			}).style("--gap", "0.5em");

			div.c("flex gap v-center", () => {
				span.c("space-tag muted", "chaos");
				this.$chaos = input.c("space-depth")
					.attr("type", "range").attr("min", "0").attr("max", "100")
					.attr("value", String(Math.round(this.chaos * 100)))
					.on("change", () => this.open(this.seed, { chaos: +this.$chaos.el.value / 100 }));
			}).style("--gap", "0.5em");

			// A fixed area or a long one — the question the reroll button on every bar
			// is really asking, so it is a control rather than an assumption.
			this.$fit = button(() => icon("crop_free"))
				.attr("title", "Fixed-size layouts, or long scrolling ones")
				.click(() => this.open(this.seed, { fit: this.fit === "screen" ? "page" : "screen" }));

		}).style("--gap", "1.2em");
	},

	/* ⚠ Held in a box of its own and refilled in a CALLBACK. `panel()` builds with bare
	     factories, so rebuilding it anywhere else appends to whatever the captor has
	     since become — the capture trap, met on the one page that rebuilds most. */
	stage(){
		this.$stage = div.c("space-compose");
		this.open(this.seed);
		return this.$stage;
	},

	// One door. A reroll here replaces the whole tree; a reroll from a panel's own bar
	// replaces only that panel, which is the point of the page.
	open(seed, moved = {}){
		Object.assign(this, { seed }, moved);

		const opts = { depth: this.depth, chaos: this.chaos, fit: this.fit };

		this.$seed.text("seed " + seed);
		this.$note.text(this.depth === 0 ? "flat" : "max " + this.depth);
		this.$depth.el.value = this.depth;
		this.$fit.empty(() => icon(this.fit === "screen" ? "crop_free" : "swap_vert"));

		this.$stage.empty(() => {
			const tree = structure(seed, opts);

			/* The whole option set rides the ROOT, so every per-section reroll from a
			   panel's own bar uses the dials this page is showing. `ext/Panel`'s `sow()`
			   defaults its second argument to `item.root().depth` and hands it straight
			   back to `gen()` — which is why an object works where a number used to be.
			   Instance state, never saved. */
			tree.depth = opts;

			/* ⚠ `auto`, never `100%`. `.panel-workspace` is `height: var(--panel-height,
			     34em)`, and a PERCENTAGE height resolves against the parent's computed
			     height — which is `auto` for a `flex-1` box, so the workspace measured
			     0 and the page rendered blank with fourteen panels in the DOM. `auto`
			     plus the `flex: 1 1 0` panel.css already gives it lets the flex parent
			     stretch it, which needs no definite height anywhere. */
			panel(tree).style("--panel-height", "auto");
		});
	},
});
