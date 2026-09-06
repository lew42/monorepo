import { Page, View, md, div, p, span, b, button, img } from "/app.js";
import grip from "/framework/ext/grip/grip.js";

View.stylesheet(import.meta, "size.css");

const here = new URL(".", import.meta.url).pathname;

/* THE FIVE QUESTIONS (layout skill)
   1. Container — a plain column of /imagine/'s row, like every `design` sibling, so
      content lands in `.page-column-prose`. No page grid; `wide` would mean nothing.
   2. Size — 400 to 3440, one column. The demo band is a bare `div`, which
      `.page-column-prose`'s measure cap does not touch (it caps p/headings/lists/.md
      only), so the box you drag gets the whole column: ~1000px of travel at 1280 and
      ~3000px at 3440. That range is the point — `--pad`'s fluid branch only takes over
      above ~1170px of container, so a demo box narrower than that would sit on its
      floor and teach nothing (the 2026-08-19 `--measure` card, which built two panes
      that were identical).
   3. Own layout — `md()` prose in the column's flow; one full-width demo band holding
      a resizable box; a `flex wrap gap` chip row; one table (`.ac("wide")`, or the
      measure squeezes its columns).
   4. Regions — none, no children. Two `<details>` carry the detail one click down.
   5. Preview — a real screenshot of the demo, like every `design` sibling. */

/* Measured with `scratchpad/size-standard/size-probe.mjs` against a private server on
   :8099 — the candidate injected as an unlayered stylesheet over the 20 pages the
   2026-09-05 spacing audit used, at four widths. framework.css was never touched.
   Every cell is `pad / gap / flow`, the median over those 20 pages in px. */
const MEDIANS = [
	["**Today**", "5.1 / 6.7 / 25.2", "5.4 / 7.9 / 28.8", "5.8 / 12.2 / 38.4", "6.5 / 22.1 / 48.6"],
	["**The candidate** — one knob, three ramps", "5.1 / 6.7 / 25.2", "5.4 / 7.9 / 28.8", "5.6 / 11.8 / 38.4", "6.5 / 20.8 / 48.6"],
	["One ramp, fixed multipliers — *refuted*", "5.1 / 4.6 / 10.1", "5.4 / 6.0 / 13.5", "5.8 / 10.6 / 25.2", "6.5 / 20.7 / 49.3"],
	["Reading text, all three", "14px", "15.0px", "16px", "18px"],
];

const CANDIDATE = [
	":root { --size: 1 }",
	"",
	":where(*) {",
	"    --pad:  calc(clamp(1em, 2.6% - 1.1em,   4em)   * var(--size));",
	"    --gap:  calc(clamp(1em, 1.5cqi - 0.3em, 2.6em) * var(--size));",
	"    --flow: calc(clamp(2em, 1.4cqi + 0.8em, 3em)   * var(--size));",
	"}",
	"",
	".size-small { --size: 0.75 }  .size-regular { --size: 1 }  .size-large { --size: 1.5 }",
].join("\n");

const LEVELS = ["small", "regular", "large"];
const CLASSES = LEVELS.map(n => "size-" + n);

export default new Page({
	meta: import.meta,
	title: "Size",
	description: "One knob for pad, gap and flow — tested.",
	icon: "tune",
	width: "full",

	/* A real screenshot instead of the icon+title card, matching every `design` sibling
	   (the wall is a wall of pictures). `.design-shot` is the parent's own rule
	   (/imagine/design/design.css) — it fills and crops the card's thumb slot, which a
	   bare `<img>` does not. */
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/size.jpg").attr("alt", nav.label));
	},

	content(){
		md("**Landed 2026-09-06.** Four separate systems used to decide how much room is around things: three width ramps, three level classes, the columns host's own pads, and the body type clamp. A reader had to hold all four at once. `framework.css` now has one replacement — a single knob called `--size` — and every `--pad-ramp` / `--gap-ramp` / `--flow-ramp` / `--spacing` name in the codebase (945 call sites) is gone. `.size-small` / `.size-large` are also the control grammar's own size words, at 0.75 / 1 / **1.5** (the owner's ladder — wider than this study's own 1.25, so `.size-large` reads as a real step next to regular).\n\n**Drag the box below by its right edge.** Padding, gap and rhythm follow the box's own width. The reading text never changes size, at any box width; only the big display line does, and that is the one deliberate exception.");

		this.lab();
		p.c("muted", "Below about a 1,000px box, every ramp sits on its floor and nothing moves — that is the 2026-09-05 spacing decision working, where each ramp holds its 1280 value to the pixel and only then grows. Drag past that and all three take off together; at 3440 this box has about 3,300px of travel. The level chips move it at any width. (The drag edge hides under 34em of screen, where a rail stops being a rail — use the chips there.)");

		md("### The whole standard, eight lines\n\n```css\n" + CANDIDATE + "\n```").ac("wide");
		md("`--size` is a plain number — never a length, and never a function of width. That is what lets it scale a whole clamp: floor, fluid middle and cap together. Padding is a **percentage**, which every box already resolves against its own container with nothing declared. Gap and rhythm are **`cqi`**, which reads the nearest container and falls back to the viewport when there is none — so they are exactly today's numbers on a plain page, and follow the box inside a column, a rail or a frame. **Type is absent on purpose:** the body font-size clamp is the one thing on this site that ramps type with width, and it stays where it is.");

		md("### The verdict\n\n**One knob: yes. One ramp: no.** `--size` replaced the three level classes and the six spacing token names for free — the 20 audit pages measure identically at 400 and 1280 and within 6% at 3440 — but padding, gap and rhythm keep their own three clamps, because one ramp with fixed multipliers cuts the paragraph rhythm at 1280 from 28.8px to 13.5px. That is what's in `framework.css` now.");

		md("| medians over 20 pages | 400 | 1280 | 1920 | 3440 |\n|---|---|---|---|---|\n" +
			MEDIANS.map(r => "| " + r.join(" | ") + " |").join("\n")).ac("wide");
		p.c("muted", "Every cell is `pad / gap / flow` in px — the median box on each of the 20 pages the 2026-09-05 spacing audit measured, then the median of those 20. The candidate's only real movement is at 3440, where writing the gap ramp in `cqi` instead of `vw` sizes a box inside a column or a rail to its own container rather than to the window: 22.1px → 20.8px.");

		md.details(import.meta, "alternatives.md", "What was tried and refuted — the one-ramp collapse, `--size` written as an em, and the compound test");
		md.details(import.meta, "landing.md", "What landed — the exact block, the 945 renames, and the two calls the owner made");
	},

	/* The live box. Built synchronously, then measured from a ResizeObserver — the
	   first layout has not happened when `content()` runs, so a one-shot read here
	   would report the box's pre-layout size. */
	lab(){
		let box, stage, row, para, nested, nestedPara;
		const readouts = {};
		const chips = {};

		const band = div.c("size-band").append(() => {
			box = div.c("size-lab size-regular").append(() => {
				stage = div.c("size-stage").append(() => {
					div.c("size-display", "Aa");
					para = p("Reading text holds its size at every box width. That is the rule: exactly one thing ramps type with width, and it is the root font size.");
					row = div.c("size-row").append(() => { div(); div(); div(); });
					nested = div.c("size-stage size-nested").append(() => {
						nestedPara = p("One container deeper. Same font size, smaller padding.");
					});
				});

				grip({
					from: "start",
					write: px => {
						const max = band.el.getBoundingClientRect().width;
						const w = Math.max(240, Math.min(px, max));
						box.style("width", w + "px");
						read();
						return w;
					},
					done: () => {},
				});
			});
		});

		div.c("size-chips").append(() => {
			span.c("muted", "level:").style({ fontSize: "0.85em" });
			LEVELS.forEach((name, i) => {
				chips[name] = button.c("size-chip", name).attr("aria-pressed", String(name === "regular"))
					.on("click", () => {
						box.el.classList.remove(...CLASSES);
						box.el.classList.add("size-" + name);
						LEVELS.forEach(n => chips[n].attr("aria-pressed", String(n === name)));
						read();
					});
			});
		});

		const out = div.c("size-readout").append(() => {
			["box", "pad", "gap", "flow", "text", "nested pad", "nested text"].forEach(k => {
				span(() => { span(k + " "); readouts[k] = b("—"); });
			});
		});

		const px = v => Math.round(parseFloat(v) * 10) / 10 + "px";
		const read = () => {
			if (!box || !box.el.isConnected) return;
			const st = getComputedStyle(stage.el), pa = getComputedStyle(para.el);
			readouts["box"].el.textContent = Math.round(box.el.getBoundingClientRect().width) + "px";
			readouts["pad"].el.textContent = px(st.paddingTop);
			readouts["gap"].el.textContent = px(getComputedStyle(row.el).columnGap);
			readouts["flow"].el.textContent = px(pa.marginTop);
			readouts["text"].el.textContent = px(pa.fontSize);
			readouts["nested pad"].el.textContent = px(getComputedStyle(nested.el).paddingTop);
			readouts["nested text"].el.textContent = px(getComputedStyle(nestedPara.el).fontSize);
		};

		new ResizeObserver(read).observe(box.el);
		return out;
	},
});
