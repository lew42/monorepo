import { Doc, div, p, h2, span, code, md, table, thead, tbody, tr, th, td } from "/app.js";
import { RANGES } from "./ranges.js";
import { rate } from "./taste.js";

export default new Doc({
	meta: import.meta,
	title: "Taste",
	description: "Eleven ranges a good layout lands inside — GOOD, not BROKEN or OFF, and enough to rank two clean layouts against each other.",
	icon: "tune",
	children: "corpus",
	files: "ranges.js read.js taste.js corpus.js page.js readme.md",

	content(){
		code.js(`import { rate } from "/framework/ext/LayoutTool/taste/taste.js";

rate(document.querySelector(".page.active-page"));
// → { score: 84, grade: "B", bands, weakest, covered: 91, read: 10, of: 11 }`);

		md("`rules.js` finds what's BROKEN and `polish.js` finds what's OFF — neither can "
			+ "tell two CLEAN layouts apart, since both are free to score 100. This tier "
			+ "can: every band pays partial credit, tapering from `ideal` out to the edge "
			+ "of `ok`, so two pages with no findings still land at different numbers.");

		h2("The eleven ranges");
		this.ranges_table();

		h2("This page, rated");
		this.$rate = div.c("flex v gap");
		this.$rate.append(() => p("Rating…").ac("muted"));
		this.settle();

		md("**[Corpus](corpus/) is where this can be wrong.** Thirty pairs — a layout, and the same layout with one named thing broken — asserting that the rulebook rates the original higher *on the band the case is about*. Two cases are expected to fail, and they are the ones that say where this tier stops seeing.");

		md.details(import.meta, "readme.md", "Design record — why a rating and not a rule, the refit, and what's still open");
	},

	// Straight off `RANGES` — a hand-typed copy would drift the day a band is retuned.
	ranges_table(){
		table(() => {
			thead(() => tr(() => { th("range"); th("what it measures"); th("ideal · ok"); th("weight"); }));
			tbody(() => RANGES.forEach(r => {
				tr(() => {
					td(code(r.id));
					td(r.what);
					td(() => this.band(r));
					td(String(r.weight));
				});
				tr(() => td(() => span(r.why).ac("muted")).attr("colspan", "4"));
			}));
		});
	},

	// `.surface` for the track, a plain div offset and widthed inside it for `ideal` —
	// no stylesheet earns its keep for one bar.
	band(r){
		const [o0, o1] = r.ok, [i0, i1] = r.ideal;
		const extent = o1 - o0 || 1;
		const left = (i0 - o0) / extent * 100, width = (i1 - i0) / extent * 100;

		return div.c("flex v gap").append(() => {
			div.c("surface").style({ position: "relative", height: "0.6em", borderRadius: "999px", overflow: "hidden" })
				.append(() => div().style({ position: "absolute", inset: "0", left: `${left}%`, width: `${width}%`, background: "var(--prim)" }));
			span(`${fmt(o0)} … ${fmt(i0)}–${fmt(i1)} … ${fmt(o1)}`).ac("muted");
		});
	},

	// `content()` returns before the page is attached (capturing is synchronous), so
	// `.page.active-page` may not exist — or be marked — yet. ⚠ Not `requestAnimationFrame`:
	// a backgrounded tab never fires one, and `look()` would sit at "Rating…" forever —
	// the same reason `LayoutTool/page.js`'s own self-rating waits on a plain timer.
	settle(){
		setTimeout(() => this.look(document.querySelector(".page.active-page")), 600);
	},

	look(el){
		if (!el) return void this.$rate.empty(() => p("No active page found.").ac("muted"));

		const data = rate(el);

		this.$rate.empty(() => {
			div.c("flex gap v-center").append(() => {
				span(data.grade).ac("h2");
				span(String(data.score)).ac("muted");
				span(`${data.covered}% of the book measured — ${data.read}/${data.of} ranges`).ac("muted");
			});
			div.c("flex v gap").append(() => data.weakest.forEach(b =>
				span(`${b.id} — ${fmt(b.value)}, ${Math.round((b.credit ?? 0) * 100)}% credit`).ac("muted")));
		});
	},
});

const fmt = n => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000));
