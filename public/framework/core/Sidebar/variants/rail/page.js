import { Page, Sidebar, View, div, button, h2, h3, p, blockquote, code } from "/app.js";
import Framework from "/framework/page.js";
import Core from "/framework/core/page.js";
import SidebarModule from "/framework/core/Sidebar/page.js";

View.stylesheet(import.meta, "../variants.css");

/* Both E and F pretend the reader is clicking between three real pages — Framework,
 * Core, and Sidebar itself — and each one gets its own header word and its own tree.
 * The three "pretend pages" are shared by both stages so the only difference between
 * E and F is WHERE the Sidebar instance lives, never what it shows. */
const PRETEND = [
	{ name: "Framework", root: Framework },
	{ name: "Core", root: Core },
	{ name: "Sidebar", root: SidebarModule },
];

function brand_header(root){
	return () => div.c("brand", () => {
		button(root.title).ac("brand-title").attr("type", "button");
	});
}

/* E — ONE Sidebar, owned by the stage (standing in for "the app"). A click on a
 * pretend-page button empties the ONE rail slot and builds a fresh Sidebar with
 * that page's header and tree inside it — the rail itself never moves, only what
 * is built inside it changes. This is the whole swap, nothing hidden elsewhere. */
function stage_e(app){
	let $rail;

	function show(entry){
		$rail.empty(() => new Sidebar({ app, header: brand_header(entry.root), root: entry.root }));
	}

	return div.c("variant-rail-stage", () => {
		h3("E — the app swaps the rail");
		div.c("variant-rail-tabs", () => PRETEND.forEach(entry =>
			button(entry.name).on("click", () => show(entry))));
		div.c("variant-rail-box", () => { $rail = div.c("variant-rail-slot"); });
		show(PRETEND[0]);
	});
}

/* F — THREE Sidebars, one per pretend page, all built up front. Only the `active`
 * page's own rail is visible; a click just moves the `active` class from one
 * `.variant-rail-page` to another — CSS (`variants.css`) does the showing and
 * hiding, nothing here empties or rebuilds anything. */
function stage_f(app){
	const $pages = [];

	function show(name){
		$pages.forEach($pg => $pg.tc("active", $pg.el.dataset.name === name));
	}

	return div.c("variant-rail-stage", () => {
		h3("F — each page owns its rail");
		div.c("variant-rail-tabs", () => PRETEND.forEach(entry =>
			button(entry.name).on("click", () => show(entry.name))));
		div.c("variant-rail-box", () => PRETEND.forEach(entry => {
			const $pg = div.c("variant-rail-page").attr("data-name", entry.name);
			$pages.push($pg);
			$pg.append(() => new Sidebar({ app, header: brand_header(entry.root), root: entry.root }).ac("variant-rail"));
		}));
		show(PRETEND[0].name);
	});
}

export const blurb = "One rail the app hands around (E), or one rail per page, hidden and shown (F) — same result, different owner.";

export default new Page({
	meta: import.meta,
	title: "Who owns the rail?",
	description: blurb,
	icon: "view_sidebar",

	render(){
		return this.view ??= div.c("page sidebar-variant-rail flow pad", () => {

			p("Two different ways to swap the left rail's header and tree when the reader moves between pages — E lets the app own one rail and hand it new content, F lets each page keep its own rail and hides the ones that aren't active. Click Framework / Core / Sidebar under each stage; both stages end up looking identical.");

			blockquote("“One way to handle the left and right sidebars is to have an app level sidebar that you swap things out of. Another option would be to have each page kind of render their own and maybe be able to hide a parent sidebar, but hiding the parent means that you then have to make sure you show it at the right time … maybe we do just add and remove the active classes.”");

			div.c("variant-rail-pair", () => {
				stage_e(this.app);
				stage_f(this.app);
			});

			h2("The code");

			p("E — the app keeps ONE rail slot and rebuilds what's inside it:");
			code.fn(() => {
				function show(entry){
					$rail.empty(() => new Sidebar({ app, header: brand_header(entry.root), root: entry.root }));
				}
			});

			p("F — each page keeps its own rail; a click only moves a class:");
			code.fn(() => {
				function show(name){
					$pages.forEach($pg => $pg.tc("active", $pg.el.dataset.name === name));
				}
			});

			p("The risk the owner named for F: the parent's rail is only hidden, not gone — it has to come back the moment its own page is active again, or the reader is left staring at someone else's tree.");

			h2("Resizing and selection");

			p("Drag its right edge — this is the real Sidebar component in both stages, so it resizes exactly like the site's own rail does everywhere else on the site.");

			p("Selection: the plan is to keep “which page is active” in localStorage, the same place the rest of the site's UI state already lives — it survives a reload, but it is not a file on disk. Trade-off, not solved here: a browser has two different saving modes, and it is easy to think something is saved when only the localStorage copy is — the file system copy you meant to also have never happened.");
		});
	},
});
