import { Page, View, div, a, span, icon, md } from "/app.js";

View.stylesheet(import.meta, "Shell.css");

/**
 * Shell — one app layout, at its own url, wearing its own chrome.
 *
 *     export default new Shell({
 *         meta: import.meta,
 *         title: "Left rail",
 *         left(){ return this.rail("left"); },
 *         finding: "the one line this shell is for",
 *     });
 *
 * Declare the parts you have — `head()` `left()` `right()` `foot()` — and the one
 * grid in Shell.css drops each into its named area. A part you don't declare costs
 * an `auto` track of 0px, so all six outer permutations are the same template.
 *
 * The chrome IS the nav: `nav_links()` lists every other shell in the lab at its
 * real url, so switching chrome is one click and every page cold-loads.
 *
 * Design record: /imagine/shells/readme.md.
 */
export class Shell extends Page {

	// ── MY OWN SCREEN, not a column ───────────────────────────────────────────
	// /imagine/ is a columns host, and `column_host()` finds the SHALLOWEST
	// columnar ancestor — so by default every page under it is a column of that
	// one row. A shell is not a column; it is the whole app. Mounting beside the
	// row's host is the arrangement contract's own sibling rule (Page.css): the
	// ancestor stands down, and the shell has the region to itself.
	container(){ return this.mounts_in(this.app.$pages, "app.$pages — a shell is its own screen"); }

	// ⚠ Overriding render() is ALSO what skips core's `render_column()` — a page in
	//   a columns tree renders as a column unless it draws itself.
	// `hides-nav` (/styles.css) takes the site's own strip away, so the only chrome
	// on screen is the chrome this page drew.
	render(){
		return this.view ??= div.c("page shell hides-nav", () => {
			this.head?.();
			this.left?.();
			this.main();
			this.right?.();
			this.foot?.();
		}).ac(this.classes);
	}

	// The content region — the one part every shell has. A canvas or a columns row
	// overrides this; everything else gets the same document.
	main(){
		return div.c("shell-main", () => div.c("shell-doc flow", () => {
			this.content();
			this.verdict();
		}));
	}

	// THE SAME DOCUMENT IN EVERY PERMUTATION, so the chrome is the only variable.
	content(){
		md(`## Release 4.2

Ship notes for the build every shell in this lab is wrapped around. This document does not change from page to page — the chrome around it does.`);

		div.c("flex gap wrap", () => [["Sessions", "12,480"], ["Errors", "3"], ["p95", "184ms"]]
			.forEach(([label, value]) => div.c("surface pad", () => {
				div.c("h4", label);
				div.c("shell-stat", value);
			})));

		md(`Every link in the chrome goes to another shell at its own url, so the way you browse this lab is the thing the lab is about.`);
	}

	// The one line this shell is for, read where its layout is on screen.
	verdict(){ return this.finding ? div.c("shell-verdict", () => md(`**Verdict:** ${this.finding}`)) : null; }

	// ── the chrome, and the chrome is the nav ────────────────────────────────
	// Every shell lists every other one: the lab browses itself from inside the
	// thing being shown, and each url is real and cold-loadable.
	shells(){ return [...this.parent.children.keys()].map(name => this.parent.nav_for(name)); }

	nav_links(){
		a.c("shell-home").href(this.parent.url).append(() => { icon("dashboard"); span("Shells"); });

		this.shells().forEach(nav => a.c("shell-link").href(nav.url).append(() => {
			if (nav.icon) icon(nav.icon);
			span.c("shell-label", nav.label);
		}));
	}

	// A chrome rail. `area` is the grid area it claims; `fill` replaces the nav.
	// ⚠ `fill.call(this)`, never `.append(fill)` — `.append(fn)` hands the callback
	//   the View as its first argument, which silently feeds a parameterised
	//   function the wrong thing.
	rail(area, fill){
		return div.c(`shell-rail shell-${area}`, () => { fill ? fill.call(this) : this.nav_links(); });
	}

	// A chrome bar — a header or a footer. Same two arguments.
	// ⚠ Block bodies on every captured callback: a concise body RETURNS its value
	//   and a captured callback's return value is APPENDED (core/Page/doc/panels.md).
	bar(area, fill){
		return div.c(`shell-bar shell-${area}`, () => { fill ? fill.call(this) : this.nav_links(); });
	}
}

export default Shell;
