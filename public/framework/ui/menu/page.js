import { Page, md, demo, div, details, summary, a, span, icon, code } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const menu = () => details.c("ui-menu", $menu => {
	summary.c("ui-menu-trigger btn flex v-center", () => {
		span("Actions");
		icon("arrow_drop_down");
	});

	div.c("ui-menu-list flex v", () => {
		a.c("ui-menu-item", "Rename").href("#").click(() => $menu.el.removeAttribute("open"));
		a.c("ui-menu-item", "Duplicate").href("#").click(() => $menu.el.removeAttribute("open"));
		a.c("ui-menu-item", "Delete").href("/delete/");
	});
});

const two = () => div.c("flex gap wrap v-center", () => { menu(); menu(); });

export default new Page({
	meta: import.meta,
	title: "Menu",
	description: "A <details> dropdown — the panel earns a selector, not a function.",
	icon: "arrow_drop_down_circle",

	content(){

		palette(
			["a dropdown", menu],
			["two of them", two],
		);

		md("## Copy it");

		copy(menu);

		md("**There is no `ui.menu()`.** Its one line of logic — close the panel after a pick — is a line you want *per item*, because a real menu's items run handlers, and the function's items could only be strings and urls: its own showcase rendered five dead links. It also collided by name with `ext/layout`'s `menu()`, live, in a codebase where the class name is the registry.");

		md("⚠ The panel is `position: absolute`, so an ancestor with `overflow: hidden` clips it — `.demo` is one, same as [Tooltip](/framework/ui/tooltip/).");

		md("## Why this one gets CSS");

		md("The same line Tooltip drew: the panel is positioned **against its summary** (a relationship between two elements) and appears **on open** (a state). A class list can say neither, so the panel needs a selector — and *only* the panel. The trigger is `.btn` plus `flex v-center`, which also happens to remove the UA's disclosure triangle, since a summary keeps its marker only while it is `display: list-item`.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "menu.js"));

		md("The shadow is `color-mix(in srgb, var(--ink) 14%, transparent)` rather than an `rgba` literal — the same derivation [Panel](/framework/ui/panel/) uses, so it stays right in dark mode.");

		md("## What it deliberately doesn't do");

		demo(two, "**Light dismiss.** A `<details>` stays open until something closes it; open both of these and both stay open. The native upgrade is the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — `popover` plus invoker buttons, which brings light-dismiss and top-layer stacking (and with it the clip cure) for free. `<details>` stays the template because it needs zero JS to *be* a disclosure.");

		md("Next: [Accordion](/framework/ui/accordion/) — the same element, and the attribute that makes a group exclusive.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", menu)); },
});
