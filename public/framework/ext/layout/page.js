import { Page, md, code, h2, div, p } from "/app.js";
import layout from "./layout.js";

const box = (title, body) => div.c("pad surface", () => {
	p.c("h3", title);
	p(body);
});

const boxes = () => {
	box("Alpha", "One of four.");
	box("Beta", "Ask for `--column`, take a share of what's left.");
	box("Gamma", "Wraps when four no longer fit.");
	box("Delta", "No breakpoint anywhere.");
};

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Flex or grid, decided by clicking — and a page you can re-shape live.",
	icon: "tune",
	content(){

		layout(boxes);

		md("**Point at the box.** A toolbar fades in above its top-right corner and is gone again when you leave — a widget that shouts is a widget you have to look past. `flex` and `grid` both read `--gap` and `--column`, so the switch is one class and the two knobs mean the same thing on either side of it: a basis in flex, a `minmax()` floor in grid.");

		code.js(`import layout from "/framework/ext/layout/layout.js";

layout(() => {
    box("Alpha");
    box("Beta");
});`);

		md("The box is `flex gap auto` or `grid gap auto` — [utility classes](/framework/styles/layers/util/), nothing invented. Whatever you settle on is a class string and two token values you can paste into a page.");

		h2("Steering a box you built yourself");

		md("`layout()` owns the container it makes, which is no use to a page whose builder makes its own. `layout.bar($box)` is the same toolbar with the container handed to it — put it inside a `.layout` and it becomes that box's floating chrome:");

		code.js(`div.c("layout", () => {
    const $wall = div.c("grid gap auto", cells);
    layout.bar($wall);
});`);

		md("[Flex](/framework/styles/layouts/flex/) and [Grid](/framework/styles/layouts/grid/) both carry one, which is what lets those pages end in a box you can actually push around.");

		h2("A live page");

		layout.page(this);

		md("Those are [Page](/framework/core/Page/)'s own shape words: **`sheet`** (the default reading measure), **`grid`**, **`pad`**, **`full`**, plus **`fill`** and **`flow`**. Pick one — *this* page re-arranges under you, because the bar writes to the page you are standing in.");

		code.js(`content(){ layout.page(this); }`);

		md("`fill` is the interesting one: the page stops sizing to its content and becomes the region's height instead. It carries `overflow: hidden`, so the bar pairs it with a scrollbar — without that, everything below the fold on a long page is clipped with no way down, including this toolbar.");

		md("`page.view` is only assigned once `content()` has returned, so the bar reads it on click rather than up front — the one thing to know if you extend this.");

		md("Next: [Layouts](/framework/styles/layouts/) — eight real pages built from the classes this widget writes.");

		md.details(import.meta, "readme.md", "Design record — one token for two modes, the container handoff, and the right panel that wasn't built");
	}
});
