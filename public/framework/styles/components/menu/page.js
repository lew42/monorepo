import { Page, md, demo, code, div } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Menu",
	description: "A <details> dropdown — the second component to earn a stylesheet.",
	icon: "arrow_drop_down_circle",

	content(){

		demo(component, "A `<details>` whose summary wears `.btn`. Open/closed is the element's own `open` attribute, so there is no state in JS — the one listener closes the menu after a pick. The bubble is `position: absolute`, so `.demo`'s `overflow: hidden` would clip a menu at the box edge — same caveat as Tooltip.");

		md("## Why this one gets CSS");

		md("Same line Tooltip drew: the panel is positioned **against its summary** (a relationship between two elements) and appears **on open** (a state). Inline styles can say neither, so the panel needs a selector — and only the panel. The trigger is `.btn` plus `flex v-center`, which also happens to remove the UA's disclosure triangle, since a summary keeps its marker only while it is `display: list-item`.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "menu.css"));

		md("## What it deliberately doesn't do");

		md("**Light dismiss.** A `<details>` stays open until something closes it — clicking elsewhere does nothing. The native upgrade is the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) (`popover` + invoker buttons), which brings light-dismiss and top-layer stacking for free; this component stays `<details>` because it needs zero JS to *be* a disclosure, and a nav dropdown rarely needs more.");

		md("Back to [Components](/framework/styles/components/) — the gallery, and the findings.");
	}
});
