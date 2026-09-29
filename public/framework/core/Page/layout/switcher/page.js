import { Page, div, h3, p, span, a, code, md } from "/app.js";
import "./switcher.js";

/**
 * The Switcher, live: a list on the left switches the content on the right. Show,
 * don't tell — the two demos below ARE the pattern; readme.md underneath is the
 * words. See core/Page/layout/page.js ("the hub") for where this sits, and
 * doc/decide.md for the one question this page exists to answer.
 */
export default new Page({
	meta: import.meta,
	title: "Switcher",
	description: "One routed list-switches-content pattern, in three skins, that collapses to a mobile dropdown with no change to how the active item is decided.",
	icon: "view_sidebar",

	// `leaf: true`: these 10 children are content-free filler that only exist to give
	// switcher() something real to route between (doc/decisions.md) — not pages of
	// their own the reader should ever browse to from the site rail. `leaf` hides a
	// page's OWN children from the nav tree while it still shows itself in its
	// parent's row (Page.class.js:1044, same pattern as audit/page.js) — so "Switcher"
	// still lists in core/Page/layout/'s hub exactly as before, and the rail no longer
	// shows "index.js" three times and "app.js" three times underneath it. Routing is
	// untouched: this.switcher() below still resolves every name from `this.children`.
	leaf: true,

	children: "cmp-w-index cmp-w-app narrow-index narrow-app wide-index wide-app tree-styles tree-router nav-home nav-settings",

	content(){
		p("Vertical tabs, a file tree beside its code, and a plain left nav are all the same thing: a list on the left routes to real, url'd content on the right. Below, the same switcher() call proves it two ways — first that shrinking it needs no new JavaScript, then that the same list wears three different skins.");

		h3("Wide vs narrow, side by side");
		p("Two live instances of the exact same pattern, framed at fixed widths so the collapse is visible without resizing the window. Tap the narrow one's header to open its list.");

		// `.ac("wide")`: two ~880px/~400px cards side by side need the page's WIDE
		// track, not the default `main` measure — squeezed into `main` at 1920/3440
		// they don't fit and `flex wrap` stacks the narrow one below the wide one
		// instead of beside it (layout skill: "two or more columns of content never
		// live in main").
		div.c("flex wrap gap", () => {
			div.c("card switcher-demo-frame-wide", () => {
				p.c("muted", "~880px");
				this.switcher("cmp-w-index cmp-w-app");
			});
			div.c("card switcher-demo-frame-narrow", () => {
				p.c("muted", "~400px");
				this.switcher("narrow-index narrow-app");
			});
		}).ac("wide");

		h3("Three skins, one mechanism");
		p("Same routing, same .active marks, only the CSS changes.");

		div.c("flex wrap gap", () => {
			div.c("card switcher-demo-frame-wide", () => {
				p.c("muted", 'Vertical tabs (the default)');
				this.switcher("wide-index wide-app");
			});
			div.c("card switcher-demo-frame-wide", () => {
				p.c("muted", 'File tree — skin: "tree"');
				this.switcher("tree-styles tree-router", { skin: "tree" });
			});
			div.c("card switcher-demo-frame-wide", () => {
				p.c("muted", 'Left nav — skin: "nav"');
				this.switcher("nav-home nav-settings", { skin: "nav" });
			});
		}).ac("wide");

		h3("The answer");
		p(() => {
			span("Can the collapse be done without touching the active-class logic? ");
			span.c("code", "Yes");
			span(" — switcher.js never sets or reads .active-page, .active-ancestor, .active or .in-path; switcher.css only reacts to them. The full proof, with files and lines, is ");
			code("doc/decide.md");
			span(".");
		});
		a("Read the proof →").href("doc/decide.md");

		h3("Converging with /fs");
		p(() => {
			span("task-mastermind-file-system is building the first real instance of this shape — the mobile file explorer at ");
			code("/fs");
			span(". Its work (task dir: ");
			code("public/framework/ai/2026-09-29/file-system/");
			span(") is not on michael/dev yet, so this page names the class instead of wiring to it: once its branch merges, reuse ");
			code('this.switcher(names, { skin: "tree" })');
			span(" there instead of a second collapse mechanism — see doc/decide.md's last section.");
		});

		div().append(md.file(import.meta, "readme.md", { h1: false }));
	},
});
