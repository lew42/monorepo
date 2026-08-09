import { Page, md, demo, div, code } from "/app.js";
import { palette } from "../parts.js";
import { menu } from "./menu.js";

export default new Page({
	meta: import.meta,
	title: "Menu",
	description: "A <details> dropdown — the second component to earn a selector.",
	icon: "arrow_drop_down_circle",
	classes: "grid",

	content(){

		palette(
			["ui.menu(…)", () => menu("Actions", "Rename", "Duplicate", "Move to…", "Delete")],
			["items with urls", () => menu("Go", ["Core", "/framework/core/"], ["Styles", "/framework/styles/"])],
			["two of them", () => div.c("flex gap wrap v-center", () => {
				menu("Actions", "Rename", "Delete");
				menu("View", "Compact", "Comfortable");
			})],
		);

		md("## Calling it");

		demo(() => {
			menu("Actions", "Rename", "Duplicate", ["Delete", "/delete/"]);
		}, "A label, then the items — a bare string has no url, a `[text, url]` pair does. **Open/closed is the element's own `open` attribute**, so there is no state in JS; the one listener closes the panel after a pick.");

		md("⚠ The panel is `position: absolute`, so an ancestor with `overflow: hidden` clips it — `.demo` is one, same as [Tooltip](/framework/ui/tooltip/).");

		md("## Why this one gets CSS");

		md("The same line Tooltip drew: the panel is positioned **against its summary** (a relationship between two elements) and appears **on open** (a state). A class list can say neither, so the panel needs a selector — and *only* the panel. The trigger is `.btn` plus `flex v-center`, which also happens to remove the UA's disclosure triangle, since a summary keeps its marker only while it is `display: list-item`.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "menu.js"));

		md("The shadow is `color-mix(in srgb, var(--ink) 14%, transparent)` rather than an `rgba` literal — the same derivation [Panel](/framework/ui/panel/) uses, so it stays right in dark mode. That was a literal `rgba(0,0,0,0.12)` before the move to `ui/`.");

		md("## What it deliberately doesn't do");

		md("**Light dismiss.** A `<details>` stays open until something closes it; clicking elsewhere does nothing. The native upgrade is the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — `popover` plus invoker buttons, which brings light-dismiss and top-layer stacking for free. This component stays `<details>` because it needs zero JS to *be* a disclosure, and a nav dropdown rarely needs more.");

		md("Next: [Accordion](/framework/ui/accordion/) — the same element, and the attribute that makes a group exclusive.");
	},
});
