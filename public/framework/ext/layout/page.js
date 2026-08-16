import { Doc, md, code, h2, div, p } from "/app.js";
import layout from "./layout.js";
import { toggle, knob } from "./controls.js";

const box = (title, body) => div.c("pad surface", () => {
	p.c("h3", title);
	p(body);
});

const boxes = () => {
	box("Alpha", "Asks for `--column`, takes an equal share of what is left.");
	box("Beta", "Wraps when the row runs out of room.");
	box("Gamma", "No breakpoint anywhere — it reads the box, not the window.");
	box("Delta", "One class flips the whole row between `flex` and `grid`.");
	box("Epsilon", "Both modes read the same two tokens.");
	box("Zeta", "Whatever you settle on is a class string you can paste.");
};

export default new Doc({
	meta: import.meta,
	title: "Layout",
	description: "A toolbar over anything, and a drawer that pushes the page over to make room.",
	icon: "tune",

	subject:    layout,
	methods:    "bar context",
	properties: "words",
	notes:      "vocabulary drawer selection controls",
	files:      "layout.js panel.js body.js words.js controls.js layout.css page.js readme.md",

	content(){

		// The widget IS the first screen: a page about arranging things, demonstrated
		// in a sixth of the window, was arguing against itself.
		layout(boxes).ac("bleed");

		md("**Point at the boxes.** A toolbar fades in above the top-right corner and is gone again when you leave — a widget that shouts is a widget you have to look past. `flex` and `grid` both read `--gap` and `--column`, so the switch is one class and the two knobs mean the same thing on either side of it: a basis in flex, a `minmax()` floor in grid.");

		code.js(`import layout from "/framework/ext/layout/layout.js";

layout(() => {
    box("Alpha");
    box("Beta");
});`);

		md("The box is `flex gap auto` or `grid gap auto` — [utility classes](/framework/styles/layers/util/), nothing invented. Whatever you settle on is a class string and two token values you paste into a page.");

		h2("Select and edit");

		div.c("layout bleed", () => {
			const $wall = div.c("grid gap auto", boxes);

			layout.bar($wall);
			layout.context($wall, $sel => toggle($sel, "checkered"));
		});

		code.js(`import { toggle } from "/framework/ext/layout/controls.js";

div.c("layout", () => {
    const $wall = div.c("grid gap auto", cells);

    layout.bar($wall);
    layout.context($wall, $sel => toggle($sel, "checkered"));
});`);

		md("**Click the wall, or a box inside it** — or hit the sliders chip at the end of any toolbar, which selects the thing that toolbar steers. A drawer opens on the right with what that element *is*: its mode, the utility words it wears, its tokens, and the class string to paste back into code. `Escape`, a click outside, or the ✕ puts it away.");

		md("**The drawer pushes.** The shell yields a rail at its inline end (`--drawer`, read by `.app` in `framework.css`), so the nav and the page both narrow and nothing you were reading ends up underneath it. On a narrow window the reservation collapses to nothing and the drawer covers instead — a 19rem push on a phone would leave no page.");

		md("`layout.context(el, fn)` is the extension point: `fn` draws while `el` — **or anything inside it** — is the selection, which is how this wall offers a `checkered` chip that `ext/layout` knows nothing about. Register once on the region and every click inside it finds you, re-renders included. The panel interprets no markers.");

		h2("One bar, three targets");

		md("`layout.bar()` takes a **`View`**, a bare **`Element`**, or a **`Page`** — `view_of()` is the whole difference between them. Hand it this page and the same toolbar steers the page's own shape words: **`standard`** (what a page renders as by default), **`sheet`**, **`full`**, plus **`fill`**, **`flow`** and a `--measure` knob. Pick one — *this* page re-arranges under you.");

		layout.bar(this);

		code.js(`content(){ layout.bar(this); }`);

		md("`fill` is the interesting one: the page stops sizing to its content and becomes the region's height instead. It carries `overflow: hidden`, so the bar pairs it with a scrollbar — without that, everything below the fold on a long page is clipped with no way down, including this toolbar. `page.view` is only assigned once `content()` has returned, so the bar fills itself in a microtask rather than up front, which is why handing it a page that has not rendered yet still works.");

		h2("Your own controls");

		code.js(`layout.words.radius = $el => knob($el, "--radius", 0.25, 2, 0.05);

layout.bar($strip, "mode gap column radius");`);

		div.c("layout bleed", () => {
			const $strip = div.c("flex gap auto", boxes);

			layout.words.radius = $el => knob($el, "--radius", 0.25, 2, 0.05);
			layout.bar($strip, "mode gap column radius");
		});

		md("`layout.words` is the whole control vocabulary — one word, one control over the target. Assign a word and every bar and panel group that names it can draw it. The second argument to `layout.bar()` is the list, in the order you want them; leave it out and a page gets its shape words, anything else gets `mode gap column`. Misspell a word in that list and the bar just draws one control short — an unregistered word is skipped, never thrown.");

		md("[Flex](/framework/styles/layouts/flex/) and [Grid](/framework/styles/layouts/grid/) both carry a bar, which is what lets those pages end in a box you can actually push around. **API**, above, has `layout.bar`, `layout.context` and `layout.words` each at their own url; **Docs** has the vocabulary registry, the push drawer, what's selectable, and `controls.js`'s four primitives in full.");

		md("Next: [Layouts](/framework/styles/layouts/) — eight real pages built from the classes this widget writes.");

		md.details(import.meta, "readme.md", "Design record — one toolbar for three targets, the push drawer, and what counts as selectable");
	}
});
