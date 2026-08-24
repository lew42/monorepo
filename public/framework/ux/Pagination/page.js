import { Doc, md, demo, div, p } from "/app.js";
import Pagination from "./Pagination.js";

const releases = ["Alpha release", "Beta release", "Release candidate", "1.0", "1.1", "Security patch", "1.2", "2.0-beta", "2.0", "2.1", "Hotfix", "2.2"];
const per_page = 3;
const page_labels = () => Array.from({ length: Math.ceil(releases.length / per_page) }, (_, i) => String(i + 1));

/* The card's own context — a real list above the row, since a pager alone floated
 * with nothing above it at zoom-50 (ui/pagination/page.js, wall-polish 2026-08-17).
 * `onChange` slices the SAME array the page shows — the wire drives real content. */
const pager = () => {
	let $list;

	const show = current => $list.empty(() =>
		releases.slice((current - 1) * per_page, current * per_page).forEach(name => p(name)));

	const $box = div.c("flex v gap", () => {
		$list = div.c("flex v gap", () => {}).style("--gap", "0.3em");
		new Pagination({ pages: page_labels(), current: 1, onChange: show });
	}).style("--gap", "0.6em");

	show(1);
	return $box;
};

/* The words proof: both tiers read the same tokens, so ONE class on the section
 * re-skins the ui/ template and the ux/ class in one pass. */
const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "default"); pager(); }).style("--gap", "0.5em");
	div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); pager().ac("ui-contrast ui-compact"); }).style("--gap", "0.5em");
});

export default new Doc({
	meta: import.meta,
	title: "Pagination",
	description: "ui/pagination's row, opened up — the current page remembered on the instance, and go(n) driving real content through one wire.",
	icon: "last_page",

	files: "Pagination.js page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("words", words, {
			note: "The same pager twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins the class and the template it composed in one pass." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(pager, steer).ac("bleed"),
			def: pager,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Click page 3 — the list above it changes.** `onChange(current)` hands out the page NUMBER, never a DOM reference; this page's own `show()` slices `releases` with it. `go()` toggles `.prim` on the previous and the new button rather than rebuilding the row — the same move `Filter.set()` makes.",
		});

		md("## What actually moved");

		md("`ui/pagination`'s own page named the reason there was no `ui.pagination()`: the removed function compared \"current\" by **string** and handed the callback `\"prev\"`/`\"next\"` alongside real numeric labels, so every caller decoded a string union the component invented. `class Pagination` fixes that by remembering the number itself — `go(n)` always takes a number, prev and next call the exact same method the buttons do.");

		md("**There was no CSS to keep.** `ui/pagination` shipped zero rules of its own — `.ui-pagination` was dropped in the 2026-08-09 review as a class styled nowhere ([`ui/doc/record.md`](/framework/ui/doc/record/), §11) — so this class reads nothing but `button`/`.prim`/`.btn` from `framework.css`, the same as the template did.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Pagination({ pages: ["1", "2", "3", "…", "8"], current: 2 }))); },
});
