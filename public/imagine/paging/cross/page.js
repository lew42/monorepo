import { div, span, a, select, option, md } from "/app.js";
import { Paging, Stage } from "../paging.js";
import { CONTROLS, DEFAULT, title_of } from "../blocks.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the app's middle. One region, like every page in the realm.
   2 SIZE       the grid takes the whole middle; the prose keeps the 40em measure.
   3 OWN LAYOUT one sentence, two dropdowns, one grid of live pages, one line out.
   4 REGIONS    one. Nothing here navigates.
   5 PREVIEW    core's card, in the rail's Cross section.

   ── WHY THIS PAGE EXISTS ──────────────────────────────────────────────────────
   Every other page in the realm shows ONE stage. So comparing two arrangements
   meant clicking one, remembering it, and clicking the other — the comparison
   happened in your head, which is the one place it cannot be checked
   (paging-audit-2b, Q2: "comparing two arrangements is an act of memory").

   ── YOU PICK THE TWO WORDS ────────────────────────────────────────────────────
   It used to be a hard-coded three-by-three: three navigation words across, three
   arrangement words down, out of the seven-by-seven the vocabulary allows and with
   no control to change either (paging-audit-4). Now the two dropdowns choose which
   word crosses which — any of the seven against any other — and the wall redraws
   with every value of each. `/templates/theming/` is the same idea with the colour
   and type words fixed, and the two of them are the realm's Cross section.       */

// The one pair that cannot be drawn: a word crossed with itself is one row of one.
const OTHER = (axis, want) => (want !== axis ? want : CONTROLS.find(c => c.axis !== axis).axis);

export default new Paging({
	meta: import.meta,
	title: "Cross",
	icon: "compare_arrows",
	description: "Two words at once: pick which crosses which, and every pair is a real page.",

	// The pair the page opens on — the two words a reader meets first in the bar.
	across: "navigation",
	down: "arrangement",

	content(){
		this.lede("**Pick two of the seven words.** Every cell below is a real page running that pair, and every cell is a link that opens it full size.");

		this.pickers();

		this.$wall = div.c("paging-cross-wall wide", () => { this.wall(); });

		md("The other crossing is colour by type: [the theming wall](/imagine/paging/templates/theming/) puts fifteen of those on one screen. "
			+ "One cell on its own, full size and configurable, is any page in [the library](/imagine/paging/library/).");
	},

	/* TWO DROPDOWNS, in the bar's own shape — the same `.paging-group` a labelled
	   control wears over every stage in the realm, so a reader who has used one has
	   used this. ⚠ Only the WALL is redrawn on a change: rebuilding this row from
	   inside a `<select>`'s own change handler would delete the element the reader is
	   standing on (the toolbar's own note, `../toolbar.js`). */
	pickers(){
		return div.c("paging-cross-picks", () => {
			this.picker("across", "across the top");
			this.picker("down", "down the side");
		});
	},

	picker(which, label){
		return div.c("paging-group").append(() => {
			span.c("paging-pick-label", label);

			div.c("paging-pick", () => {
				const $select = select(() => CONTROLS.forEach(control =>
					option(control.label).attr("value", control.axis)))
					.attr("title", label)
					.attr("aria-label", label)
					.on("change", event => this.cross(which, event.target.value));

				$select.el.value = this[which];
			});
		});
	},

	// One seam for both dropdowns: keep the two words different, then redraw the wall.
	cross(which, axis){
		this[which] = axis;
		this[which === "across" ? "down" : "across"] = OTHER(axis, this[which === "across" ? "down" : "across"]);

		this.$wall?.empty(() => { this.wall(); });
		this.pickers_sync();
		return this;
	},

	// The other dropdown may have been moved out of the way; write its value back.
	pickers_sync(){
		this.view?.el?.querySelectorAll(".paging-cross-picks select")
			.forEach((el, i) => { el.value = i === 0 ? this.across : this.down; });
		return this;
	},

	/* THE WALL. Every value of the down word against every value of the across word
	   — up to eight by seven, all of them live. */
	wall(){
		const across = values_of(this.across);
		const down = values_of(this.down);

		return div.c("paging-cross").style("--paging-cross-n", String(across.length)).append(() => {
			span.c("paging-cross-corner");
			across.forEach(value => span.c("paging-cross-head", value.title));

			down.forEach(row => {
				span.c("paging-cross-side", row.title);
				across.forEach(col => this.cell(col.id, row.id));
			});
		});
	},

	/* ── ONE CELL, AND IT IS A LINK ───────────────────────────────────────────
	   A configuration IS an address (`../url.js`), so a cell of this wall can be one:
	   the anchor carries the two words the cell is crossing, and the hub opens on
	   exactly the page you were looking at, full size, with the bar over it.

	   ⚠ THE MINIATURE CANNOT SWALLOW THE CLICK. `paging.css` puts `pointer-events:
	     none` on a stage inside a `.paging-shot-frame` for exactly this reason: the
	     CARD is the link, and the live tabs inside it must not take the press.
	   ⚠ `inner: true` on every one. A nested stage draws no caption, cannot take the
	     screen, and never touches the address bar — many stages writing one url would
	     fight over it. */
	cell(across_id, down_id){
		const config = { ...DEFAULT, content: "article", room: "wide", [this.across]: across_id, [this.down]: down_id };

		return a.c("paging-shot")
			.attr("title", title_of(this.across, across_id) + " + " + title_of(this.down, down_id) + " - open it full size")
			.href("/imagine/paging/?" + key_of(this.across) + "=" + across_id + "&" + key_of(this.down) + "=" + down_id + "&content=article")
			.append(() => div.c("paging-shot-frame", () => { new Stage({ config, inner: true }); }));
	},
});

const control_of = axis => CONTROLS.find(control => control.axis === axis);

const values_of = axis => control_of(axis).values;

// The address says the word the reader sees — `?content-colour=tint` (`../blocks.js`).
const key_of = axis => control_of(axis).key;
