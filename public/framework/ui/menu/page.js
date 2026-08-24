import { Page, md, demo, div, details, summary, a, span, icon, code } from "/app.js";

/* The template, verbatim — rendered on the stage AND printed as the source, so the
 * code on the page is the code that ran.
 * ⚠ The `pad` wrapper is part of it: the panel is out of flow and every stage,
 *   demo box and card crops, so a trigger on the very edge opens into nothing. */
const menu = () => div.c("pad", () => details.c("ui-menu", $menu => {
	summary.c("ui-menu-trigger btn flex v-center", () => {
		span("Actions");
		icon("arrow_drop_down");
	});

	div.c("ui-menu-list flex v", () => {
		a.c("ui-menu-item", "Rename").href("#").click(() => $menu.el.removeAttribute("open"));
		a.c("ui-menu-item", "Duplicate").href("#").click(() => $menu.el.removeAttribute("open"));
		a.c("ui-menu-item", "Delete").href("/delete/");
	});
}));

const two = () => div.c("pad flex gap wrap v-center", () => { menu(); menu(); });

/* The card's own context — the panel OPEN beside the file it belongs to, since a
   closed trigger alone read as an empty card at zoom-50 (wall-polish, 2026-08-17). */
const context = () => div.c("pad flex gap v-center", () => {
	icon("description");
	span("README.md");

	details.c("ui-menu", () => {
		summary.c("ui-menu-trigger btn flex v-center", () => {
			span("Actions");
			icon("arrow_drop_down");
		});

		div.c("ui-menu-list flex v", () => {
			a.c("ui-menu-item", "Rename").href("#");
			a.c("ui-menu-item", "Duplicate").href("#");
			a.c("ui-menu-item", "Delete").href("#");
		});
	}).attr("open", "");
}).style("--gap", "0.5em");

const sections = () => div.c("pad", () => details.c("ui-menu", $menu => {
	summary.c("ui-menu-trigger btn flex v-center", () => {
		span("Branch");
		icon("arrow_drop_down");
	});

	div.c("ui-menu-list flex v", () => {
		span.c("h4 muted ui-menu-item", "This branch");
		a.c("ui-menu-item", "Rename").href("#").click(() => $menu.el.removeAttribute("open"));
		a.c("ui-menu-item", "Duplicate").href("#").click(() => $menu.el.removeAttribute("open"));

		span.c("h4 muted ui-menu-item", "Danger");
		a.c("ui-menu-item", () => span.c("prim", "Delete branch")).href("/delete/");
	});
}));

export default new Page({
	meta: import.meta,
	title: "Menu",
	description: "A <details> dropdown — the panel earns a selector, not a function.",
	icon: "arrow_drop_down_circle",

	children: [
		demo.page("sections", sections, {
			note: "A real menu groups its items and puts the dangerous one last. **The group label is an item, not a heading** — `h4 muted` on a `span` wearing the same `.ui-menu-item` inset, so the labels and the links share one left edge with no rule written. A separator would be a third thing to style; a label already says where the group starts." }),

		demo.page("two", two, {
			note: "**Light dismiss is what it deliberately doesn't do.** A `<details>` stays open until something closes it; open both of these and both stay open. The native upgrade is the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — `popover` plus invoker buttons, which brings light-dismiss and top-layer stacking (and with it the clip cure) for free. `<details>` stays the template because it needs zero JS to *be* a disclosure." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(menu, steer).ac("bleed"),
			def: menu,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.menu()`.** Its one line of logic — close the panel after a pick — is a line you want *per item*, because a real menu's items run handlers, and the function's items could only be strings and urls: its own showcase rendered five dead links. It also collided by name with `ext/layout`'s `menu()`, live, in a codebase where the class name is the registry.",
		});

		md("## The behavior graduated");

		md("This is the **template**: `.ui-menu-*` above, and the disclosure it shapes. The one line of real logic was deliberately left at the call site — but a workflow that wants click-outside, or several menus sharing one close-on-pick rule, wants that line owned somewhere. On 2026-08-21 that half became [`class Menu`](/framework/ux/Menu/), which adds close-on-pick AND click-outside (the template never had either) as methods a subclass can override. **New code takes the class.**");

		md("**The CSS did not move.** Every `.ui-menu-*` rule is still here, and the class wears these same classes — [`ux/Menu/doc/decisions.md`](/framework/ux/Menu/doc/decisions/) has the split argued, and [`ux/`](/framework/ux/) has the rule it followed.");

		md("## Why this one gets CSS");

		md("The same line Tooltip drew: the panel is positioned **against its summary** (a relationship between two elements) and appears **on open** (a state). A class list can say neither, so the panel needs a selector — and *only* the panel. The trigger is `.btn` plus `flex v-center`, which also happens to remove the UA's disclosure triangle, since a summary keeps its marker only while it is `display: list-item`.");

		md("## The stylesheet, in full");

		div(code.file(import.meta, "menu.js"));

		md("The shadow is `color-mix(in srgb, var(--ink) 14%, transparent)` rather than an `rgba` literal — the same derivation [Panel](/framework/ui/panel/) uses, so it stays right in dark mode.");

		md("⚠ The panel is `position: absolute`, so an ancestor with `overflow: hidden` clips it — a stage's screen is one, same as [Tooltip](/framework/ui/tooltip/), which is why the template carries a `pad` wrapper.");

		md("Next: [Accordion](/framework/ui/accordion/) — the same element, and the attribute that makes a group exclusive.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", context)); },
});
