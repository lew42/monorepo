import { Page, md, div, span, figure, figcaption, img, a, input, label } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* Layout, answered before the first factory call (the `layout` skill's five):
   1. Container — the app's main region under /notes/. A plain page grid; /notes/ is
      a ROOT realm, not the /imagine/ columns host, so `wide` is a real breakout here.
   2. Size — one reading column. The photo and the calculator take `wide`; the photo
      is capped by HEIGHT (notes.css, `min(58vh, 34em)`) so the page is one screen at
      400, 1280, 1920 and 3440 alike instead of 1600px of paper.
   3. Own layout — `.md` prose (`.flow`) for the words; the calculator is one
      `flex v gap` box on `.surface`.
   4. Regions — two: crumbs, then content. No nested children.
   5. Preview — the photo as the card thumb (`preview()` below).

   The note works out an arithmetic, so per the brief it gets a live calculator that
   shows the SAME numbers: type a frame and a target height, watch the third number
   solve. Seeded with the note's own 1920 x 1080 -> 1920, which prints 3413. */

const round = n => Math.round(n * 100) / 100;

// The note's one calculation, as a function: keep the aspect, set the height, solve
// the width. `x / h2 = w1 / h1`, so `x = w1 * h2 / h1` — with w1 = h2 = 1920 that is
// the note's own `1920^2 / 1080`.
const solve = (w1, h1, h2) => (w1 / h1) * h2;

const field = (name, value, on_change) => label.c("flex v", () => {
	span.c("muted", name).style("fontSize", "0.8em");
	input().attr("type", "number").attr("value", value).attr("min", "1")
		.style("width", "7em")
		.on("input", e => on_change(Number(e.target.value)));
});

// The calculator. State is three numbers; `draw()` re-prints the answer line on every
// keystroke. Nothing persists — a refresh is the note's own numbers again.
function calculator(){
	const state = { w1: 1920, h1: 1080, h2: 1920 };

	return div.c("notes-calc surface pad flex v gap wide", () => {
		div.c("flex gap wrap", () => {
			field("frame width", state.w1, v => { state.w1 = v; draw(); });
			field("frame height", state.h1, v => { state.h1 = v; draw(); });
			field("new height", state.h2, v => { state.h2 = v; draw(); });
		});

		const $answer = div.c("flex v gap");
		const draw = () => $answer.empty(() => {
			const x = solve(state.w1, state.h1, state.h2);

			div().style("fontSize", "2em").style("fontWeight", "900")
				.text(`${round(x)} x ${state.h2}`);
			span.c("muted").text(`${state.w1} / ${state.h1} x ${state.h2} = ${round(x)}`
				+ `  ·  aspect ${round(state.w1 / state.h1)}:1, kept`);
			span.c("muted").text(`A real 3440-wide monitor is ${round((3440 / x) * 100 - 100)}% wider than that.`);
		});

		draw();
	});
}

export default new Page({
	meta: import.meta,
	title: "1920 to 3413",
	label: "1920 → 3413",
	icon: "aspect_ratio",
	description: "16:9 stood up to 1920 tall is 3413 wide — the ultrawide, near enough.",

	// The photo as the card thumb, cropped to the card's 16/10 with the writing kept
	// (notes.css `.notes-thumb`). The thumb is inert, so no link goes inside it.
	preview(nav){
		return this.preview_card(nav, () => { img.c("notes-thumb").attr("src", here + "note.jpg")
			.attr("alt", "Notebook page: 1920 x 1080 scaled until its height is 1920"); });
	},

	content(){
		this.crumbs();

		figure.c("notes-shot flex v v-center gap wide", () => {
			// ⚠ Block body: a captured callback's RETURN VALUE is appended too, so an
			// expression body would append the img twice (code skill §7).
			a(() => { img().attr("src", here + "note.jpg")
				.attr("alt", "Notebook page: 1920 x 1080, an arrow, and the answer 3413"); })
				.href(here + "note.jpg").attr("target", "_blank");
			figcaption.c("muted", "Photographed 6/2026. Open it for the full-size scan.");
		});

		md(`Two boxes and one sum. The first box is a **1920 × 1080** screen — the shape
almost every screen is. The arrow asks: keep that exact shape, but stand it up so the
box is now **1920 tall**. How wide does it get?

The working on the page is the cross-multiply:

\`\`\`
  x       1920                1920²
────── = ──────    →    x = ───────  =  3413.33
 1920     1080                1080
\`\`\`

**3413.** Which is the number worth remembering: a 3440-wide monitor is not "a bit
wider than 1920" — it is a 1080p screen blown up until its *short* side is as long as
a 1080p screen's *long* side. Everything on it has 1.79× the width to fill.`);

		md(`## What it points at

- [Scale](/imagine/design/scale/) — the live type ladder that rides this site's real
  fluid root: 14px at 390, 16px at 1920, **18px at 3440**. The note's 1.79× in type.
- [Spacing](/imagine/design/spacing/) — the decision that made padding, gap and flow
  ramps instead of constants. Each one holds its 1280 floor and about doubles by 3440 —
  the note's 1.79×, applied to empty space instead of to pixels.
- [Ceilings](/imagine/design/spacing/ceilings/) — where that ramp is told to stop, shot
  at 3440. The note says how much room there is; this says how much of it to spend.
- [Approved layouts](/imagine/design/layout/approved/) — the closed set of five, each
  proven at 400 / 1000 / 2000 / 3440. The note is why 3440 is one of the four.`);

		md("## The same sum, live");

		calculator();

		md(`Change any of the three. The note's own row is the one it starts on —
1920 × 1080 stood up to 1920 gives 3413.33, and a real 3440 monitor is 0.8% wider
than that, which is why 3440 and "16:9 stood on its side" are the same design target.`);
	}
});
