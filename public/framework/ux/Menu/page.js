import { Doc, md, demo, div, span, icon } from "/app.js";
import Menu from "./Menu.js";

// Three inert-in-the-template actions, real here: onPick fires, then the panel closes.
const items = () => ([
	{ text: "Rename" },
	{ text: "Duplicate" },
	{ text: "Delete" },
]);

/* The card's own context — a menu beside the file it acts on, panel closed until
 * clicked. `$out` reports what fired, so a screenshot proves the wire without a
 * console open. */
const picker = () => {
	let $out;

	const $box = div.c("flex v gap", () => {
		div.c("pad flex v-center gap", () => {
			icon("description");
			span("README.md");
			new Menu({ items: items(), onPick: item => $out.text("picked: " + item.text) });
		}).style("--gap", "0.5em");

		$out = span.c("muted", "nothing picked yet");
	});

	return $box;
};

/* The words proof: both tiers read the same tokens, so ONE class on the section
 * re-skins the ui/ template and the ux/ class in one pass. */
const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "default"); picker(); }).style("--gap", "0.5em");
	div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); picker().ac("ui-contrast ui-compact"); }).style("--gap", "0.5em");
});

export default new Doc({
	meta: import.meta,
	title: "Menu",
	description: "ui/menu's <details> opened up — close-on-pick and click-outside as a class, instead of a handler you write per item.",
	icon: "arrow_drop_down_circle",

	files: "Menu.js page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("words", words, {
			note: "The same picker twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins the class and the template it composed in one pass." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(picker, steer).ac("bleed"),
			def: picker,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Open it, pick one, watch it close.** `onPick` is the one wire; `pick(item)` is the method a subclass overrides instead of rebuilding the panel. Click outside the open panel and it closes on its own — the template never did that.",
		});

		md("## What actually moved");

		md("`ui/menu` had exactly one line of real logic — close the panel after a pick — and its own page named the reason it stayed a template: that line is wanted *per item*, because a real menu's items run real handlers. `class Menu` is what owning that line looks like: `pick(item)` closes the `<details>` and calls `onPick`, so an item just says what it does, not how to close a menu.");

		md("**The CSS did not move.** Every `.ui-menu-*` rule still lives in [`ui/menu/menu.js`](/framework/ui/menu/), and this class wears those classes. `ext/layout`'s unrelated `menu()` function shares only the English name — checked, no shared class, no caller in common.");

		md("## Click-outside, added");

		md("`<details>` has no light dismiss — `ui/menu/page.js`'s `two` variant shows two menus staying open forever on purpose. The class adds it: one `toggle` listener (fires for a summary click **or** a script setting `.open`) attaches a `document` click listener while open and removes it on close, so nothing is ever left behind to fire on a page that has moved on. Reasoning and what was rejected: [`doc/decisions.md`](/framework/ux/Menu/doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Menu({ items: items() }).open())); },
});
