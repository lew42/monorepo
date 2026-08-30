import { Page, md, h2, div, p, a, demo } from "/app.js";

const FILES = ["stage.js", "stage.css", "readme.md"];

// six cards that answer to the width of their own box and nothing else
const wall = () => {
	div.c("grid gap auto", () => {
		["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"].forEach(name =>
			div.c("surface pad", () => {
				p.c("h3", name);
				p("A card that goes wherever it fits.");
			}));
	}).style("--column", "18em");
};

export default new Page({
	meta: import.meta,
	title: "Stage",
	description: "The stage simulates 390 to 3440 with a computed zoom, and the two-up drag went from 200 re-simulations to one.",
	icon: "aspect_ratio",

	content(){

		md("**2026-08-12.** The stage could only ever get *narrower* — the handle shrinks it and nothing widened it, so on a laptop every desktop and ultrawide layout was out of reach. It simulates a width now, from its own strip. Nothing below is a screenshot: **press `desktop`, then drag the magnifier.**");

		demo.stage(wall);

		md("`[ · | mobile tablet desktop mega | 🔍 zoom ⤢ ]` — **the strip is the stage's own**, so `demo()`, `demo.stage()`, `demo.exhibit()` and `demo.tree()` are identical and none of them wires anything up. A **width** lays the render out at 390 / 810 / 1440 / 3440 and draws it at `zoom = room ÷ width`, capped at 1 — `mobile` renders 1:1, never magnified, because a phone at 3× is a magnifying glass. The readout keeps the truth: `3440px · 25%`.");

		md("**Zoom sits on top of a width, not instead of it** — scrubbing into a 1440 layout to read it is the point, so the render just scrolls when the product is bigger than the room. The magnifier multiplies (`× 2 ** (dx / 240)`, the way zoom is actually felt), a click on it shows the thing whole again, and a container resize never stomps a zoom you chose.");

		md("Three deletions paid for it: `demo()`'s bar lost its zoom and its fill-the-window toggle (**one fullscreen now, on the stage**), and `demo.tree()`'s titlebar lost the pair it was given when a bare stage had nowhere to put them — they pointed at the page region, so the readout could not report what a width had simulated. The bar controls the box; the strip controls the render.");

		h2("Two-up: 200 re-simulations became one");

		md("⚠ **The two-up was deleted on 2026-08-30** (`demo.stage.two()`, `two.js`) — a second width mechanism beside the stage's own presets, saying the same thing. The measurement below is kept because the rAF coalescing it bought lives on in `stage.js`'s `drag()`, which the handle and the magnifier both use.");

		md(`| 200 \`pointermove\`s in one turn of the loop | main thread | re-simulations |
|---|---:|---:|
| before | 781–807 ms | 200 |
| after | 0.4–2 ms | 1 |`);

		md("Three fixes, each removing work rather than deferring it: **rAF coalescing** — `drag(el, move)`, now shared with the stage's own handle, which was forcing a document layout on every move; **unchanged widths do nothing**, which is every frame the pointer spends past the ¼ clamp; and **read both rooms, then write both panes**, one forced layout per pass instead of two. A trailing debounce was the third candidate and is not needed — it would make the panes lag their own divider.");

		h2("The files");

		div.c("flex gap wrap", () => FILES.forEach(name =>
			a.c("demo-file", name).href("/framework/ext/demo/" + name).attr("target", "_blank")));

		md("`simulate()`, `watch()` and `drag()` live in `stage.js`, so the `zoom`-never-`transform: scale()` arithmetic has one copy — and the magnifier scrubs on the same rAF helper as the handle. The design record — the widths, the cap, the strip, the release table, the numbers — is [demo §17, §18 and §20](/framework/ext/demo/).");

		h2("Open");

		md(`- **A simulated width is still not a viewport.** \`@media\` reads the real window; everything intrinsic responds. An iframe is the only honest answer to that, which is why the button's title says \`390px of layout — a width, not a device\` and the readout prints the number.
- **The strip shows on every stage**, including a card preview nobody will touch. Cheap and inert, but it is chrome on a thumbnail.
- **\`demo()\` now has two strips** — its bar (label, \`<>\`) and the stage's. Justified by what each controls; still a lot of bar for two things.
- **Nothing keys Escape out of fullscreen.** The button is always on screen, but a keyboard user has no second way out.
- ~~**The two-up is a stage mode now**~~ — deleted 2026-08-30 with \`two.js\`; the width presets are the comparison.`);
	},
});
