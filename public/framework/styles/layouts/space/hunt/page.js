import { Page, div, span, button, input, icon, md, h2 } from "/app.js";
import { SHAPES } from "../model.js";
import { render } from "../spec.js";
import { gen } from "../gen.js";
import { sweep, credit, proposal, WIDTHS } from "../search.js";

/* The generator, searched rather than sampled — and the page where the model gets
 * BETTER. It rolls N seeds, rates each one at three widths with `ext/LayoutTool`'s
 * taste tier, ranks them by their WORST width, and then reports which draws the good
 * ones had in common. That second table is the point: it is `model.js`'s weights,
 * measured. Design record: ../readme.md, "The loop".
 *
 * ⚠ Never started from inside `content()`. A sweep renders forty-eight throwaway
 *   layouts with bare factories, and inside a capture callback every one of them
 *   lands on this page — `search.js` blanks the captor for exactly that reason, and a
 *   click handler is outside the capture anyway. */

/* css: .space-tag, .space-seed, .space-grade, .space-mark — ../space.css, loaded by
   the parent Doc through ruler.js. This page is only reachable as its child. */

export default new Page({
	meta: import.meta,
	title: "Hunt",
	description: "Roll a hundred layouts, rate each at three widths, and read back which draws the good ones had in common.",
	icon: "search_insights",

	count: 60,
	depth: 2,
	chaos: 0.25,
	rows: null,

	content(){

		div.c("pad flow measure start", () => {
			md("**A generator with a score is a search.** Every roll below is rated by [`ext/LayoutTool`'s taste tier](/framework/ext/LayoutTool/taste/) at 390, 1280 and 3440, and ranked by its **worst** width — a layout that is an A at 1280 and an F on a phone is not a B layout.");

			md("The second table is the one that matters. It groups every *draw* the generator made — which shape, which masthead, screen or page — by the mean fitness of the layouts that drew it. Those numbers are what [`model.js`](/framework/styles/layouts/space/)'s weights are a claim about, and where a weight and its column disagree, the column is the evidence.");

			this.bar();
			this.$note = div.c("space-tag muted", "not run yet");
		}).style("--measure", "52em");

		this.$out = div.c("bleed flex v gap").style("--gap", "2em");
	},

	bar(){
		return div.c("flex gap wrap v-center", () => {
			button(() => { icon("play_arrow"); span("Run the hunt"); }).click(() => this.run());
			this.dial("seeds", "count", 12, 240, 12);
			this.dial("depth", "depth", 0, 6, 1);
			this.dial("chaos", "chaos", 0, 100, 5, 100);
		}).style("--gap", "1.4em");
	},

	// One knob, three times. `scale` is what divides the slider to reach the property.
	dial(label, prop, min, max, step, scale = 1){
		return div.c("flex gap v-center", () => {
			span.c("space-tag muted", label);
			const $tag = span.c("space-tag", String(this[prop] * scale));

			input.c("space-depth").attr("type", "range")
				.attr("min", String(min)).attr("max", String(max)).attr("step", String(step))
				.attr("value", String(this[prop] * scale))
				.on("input", function(){ $tag.text(this.el.value); });

			this["$" + prop] = $tag;
		}).style("--gap", "0.5em");
	},

	read(prop, scale = 1){ return (+this["$" + prop].el.textContent || 0) / scale; },

	async run(){
		const count = this.read("count"), depth = this.read("depth"), chaos = this.read("chaos", 100);

		this.$note.text("rolling…");
		this.$out.empty();

		const rows = this.rows = await sweep({
			count, opts: { depth, chaos },
			step: (at, of) => this.$note.text(`rating ${at} of ${of} — three widths each`),
		});

		this.$note.text(`${rows.length} layouts · best ${rows[0].worst} · median `
			+ rows[rows.length >> 1].worst + ` · worst ${rows.at(-1).worst}`);

		// ⚠ Everything below is built in a CALLBACK. `run()` is async, so the captor is
		//   long gone by the time the sweep resolves — the one trap this repo ships most.
		this.$out.empty(() => {
			this.podium(rows.slice(0, 12));
			this.table(rows);
		});
	},

	podium(best){
		h2("The twelve that survived their worst width");

		return div.c("grid gap auto").style("--column", "17em").attr("data-layout-ignore", "")
			.append(() => best.forEach(row =>
				div.c("space-seed surface", () => {
					div.c("zoom-25", () => render(row.text).style("height", "44em"));
				})
					.attr("title", `seed ${row.seed} · ${row.choices.shape} · ${row.marks.map((m, i) => WIDTHS[i] + " " + m.grade + m.score).join(" · ")}`)
					.click(() => open(`/framework/styles/layouts/space/#${encodeURIComponent(row.text)}`, "_blank"))));
	},

	table(rows){
		h2("What the good ones had in common");

		const groups = credit(rows);

		div.c("grid gap auto").style("--column", "22em").append(() => {
			[...new Set(groups.map(g => g.key))].forEach(key => {
				div.c("surface pad flex v gap", () => {
					span.c("h4", key);
					groups.filter(g => g.key === key).forEach(g =>
						div.c("flex gap v-center split", () => {
							span(String(g.value));
							span.c("space-tag muted", `n ${g.n}`);
							span.c("space-grade", Math.round(g.mean));
						}));
				}).style("--gap", "0.35em");
			});
		});

		h2("The weights this run would write");

		md("`model.js` carries a hand-set weight per shape. This is that column, rescaled by how each shape actually scored — cubed, so a 10% lift is worth a third more weight rather than a tenth. A row with fewer than three samples keeps what it had.");

		div.c("grid gap auto").style("--column", "14em").append(() =>
			proposal(rows, SHAPES).forEach(p =>
				div.c("surface pad flex gap v-center split", () => {
					span(p.name);
					span.c("space-tag muted", p.mean == null ? "—" : `${p.mean} · n${p.n}`);
					span.c("space-grade", `${p.was} → ${p.now}`);
				})));
	},
});
