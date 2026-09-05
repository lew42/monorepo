import { Page, View, div, a, span, icon, img, p, md } from "/app.js";

View.stylesheet(import.meta, "Shell.css");

// KEYBOARD CHROME TOGGLES — one key per outer part. A hidden rail is a CLASS,
// never a second page: the new-page-per-state anti-pattern this whole lab
// exists to argue against. `rail()`/`bar()` below stamp the matching key onto
// each part's own tooltip, so the map lives once and the two can never disagree.
const CHROME_KEYS = { "[": "left", "]": "right", h: "head", f: "foot" };
const KEY_FOR = Object.fromEntries(Object.entries(CHROME_KEYS).map(([key, part]) => [part, key]));

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
	//
	// ⚠ The keyboard listener attaches HERE, once, rather than in activated() /
	//   deactivated(): `Object.assign` in the constructor makes an instance's OWN
	//   `activated()` (canvas's ResizeObserver, the one shell that declares one)
	//   shadow a prototype method outright, so a hook every shell gets for free
	//   has to live somewhere no leaf ever redeclares — nothing under shells/
	//   overrides render(). It is never removed: a classList check per keystroke
	//   is cheap, and ten shells visited in a session is ten harmless no-ops, not
	//   a listener leak worth chasing.
	render(){
		const first = !this.view;

		this.view ??= div.c("page shell hides-nav", () => {
			this.head?.();
			this.left?.();
			this.main();
			this.right?.();
			this.foot?.();
		}).ac(this.classes);

		if (first) addEventListener("keydown", event => this.toggle_chrome(event));
		return this.view;
	}

	// ⚠ The focused-input guard runs FIRST — the same rule /imagine/game/'s
	//   keyboard travel (round 4) uses, kept even though no shell has an editable
	//   region today: a shell that gains one only gets safer for having it.
	// Scoped to the shell currently ON screen (`.active-page`, Router.mark()) —
	// unscoped, every shell you ever visited this session would answer the same
	// keystroke at once.
	toggle_chrome(event){
		if (!this.view.el.classList.contains("active-page")) return;
		if (event.altKey || event.ctrlKey || event.metaKey) return;

		const focused = event.target;
		if (focused?.tagName === "INPUT" || focused?.tagName === "TEXTAREA" || focused?.isContentEditable) return;

		const part = CHROME_KEYS[event.key];
		if (!part || !this[part]) return;

		this.view.el.classList.toggle("hide-" + part);
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

	// The card on the lab's own index is a REAL STILL of this shell — a screenshot,
	// never a live render (the layout skill's rule: a preview is a picture). Ten
	// icons that all read "app layout" told a stranger nothing to choose between;
	// a still of the actual rails and bars does the choosing for them. The slug is
	// read off the child's own url rather than typed twice, so a renamed shell
	// can't point at a stale file.
	// Regenerate a still: headless screenshot, viewport 960x600, of
	// `http://localhost:8110/imagine/shells/<slug>/`, saved to `shots/<slug>.jpg`.
	preview(nav){
		const slug = nav.url.replace(/\/$/, "").split("/").pop();

		return this.preview_card(nav, () => img().attr("src", `/imagine/shells/shots/${slug}.jpg`).attr("alt", `The ${this.title} shell`).attr("loading", "lazy")
			.style({ width: "100%", height: "100%", objectFit: "cover" }))
			.append(() => { if (nav.description) p.c("page-preview-desc", nav.description); });
	}

	// A chrome rail. `area` is the grid area it claims; `fill` replaces the nav.
	// ⚠ `fill.call(this)`, never `.append(fill)` — `.append(fn)` hands the callback
	//   the View as its first argument, which silently feeds a parameterised
	//   function the wrong thing.
	// The `title` is the toggle's only on-screen affordance — `KEY_FOR` reads off
	// the same map the keydown handler does, so the hint and the key never drift.
	rail(area, fill){
		return div.c(`shell-rail shell-${area}`, () => { fill ? fill.call(this) : this.nav_links(); })
			.attr("title", `press "${KEY_FOR[area]}" to show/hide`);
	}

	// A chrome bar — a header or a footer. Same two arguments.
	// ⚠ Block bodies on every captured callback: a concise body RETURNS its value
	//   and a captured callback's return value is APPENDED (core/Page/doc/panels.md).
	bar(area, fill){
		return div.c(`shell-bar shell-${area}`, () => { fill ? fill.call(this) : this.nav_links(); })
			.attr("title", `press "${KEY_FOR[area]}" to show/hide`);
	}
}

export default Shell;
