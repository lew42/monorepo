import { Page, div, p, a, button, table, thead, tbody, tr, th, td } from "/app.js";
import { code, section } from "../../ui.js";
import { child_label, crumbs, prev_next, demo } from "../chrome.js";

export default new Page({
	meta: import.meta,
	title: "Active state",
	classes: "chrome",

	content(){
		demo(() => {
			// three pieces of chrome, three shapes, ONE pass — none of them
			// compares a url, and none of them knows about the others
			div.c("chrome-box", () => {
				div.c("chrome-nav", () => this.parent.children.forEach((_, name) =>
					a.c("chrome-nav-link", child_label(this.parent, name))
						.href(this.parent.url + name + "/")));
			});

			div.c("chrome-box", () => crumbs(this));

			div.c("chrome-tiles", () => this.parent.children.forEach((_, name) =>
				a.c("chrome-tile", child_label(this.parent, name))
					.href(this.parent.url + name + "/")));
		}, "A sidebar link, a crumb and a tile. `Router.mark_links()` gave all three their `.active` and `.in-path`; CSS decides what each kind does with it.");

		code(`
mark_links(here = this.active?.url){
    this.root().querySelectorAll("a[href]").forEach(link => {
        link.classList.toggle("active",  link.pathname === here);
        link.classList.toggle("in-path", link.pathname !== here
            && link.pathname !== "/" && here.startsWith(link.pathname));
    });
}`, "Router.js — the entire mechanism");

		p("`here` is the active page's url, not `location.pathname`: `go()` pushes history only after the load succeeds, so mid-navigation the browser still shows the url you are leaving. No view may compare `window.location` itself — one pass, and the classes are the contract.").ac("note");

		section("What the DOM actually says");

		this.readout();

		section("The late-render gap");

		this.late();

		p("A link built after the pass has already run is a link the pass never saw. `tabs()` hits this — its bar is filled after an `await` — and the escape hatch is that `mark_links()` defaults its argument, so anything can re-run it with no argument.").ac("note");

		code(`
this.app?.router?.mark_links();   // Page.tabs(), end of the fill`);

		section("Two classes, three meanings");

		code(`
.active     this exact url          the page you are on
.in-path    a prefix of this url    an ancestor — a section you are inside
neither     everywhere else

nav-link    .active = you are here      .in-path = this section is open
crumb       .active = the last crumb    .in-path = every other crumb, always
tile        .active = a card for HERE   .in-path = a card for an ancestor`);

		p("A crumb is the interesting one: every crumb except the last is by definition an ancestor, so `.in-path` is always on and styling it would repaint the whole trail. Same pass, same classes, and the answer is different per component — which is exactly why the pass writes classes and nothing else.").ac("note");

		section("The one thing it will clear");

		code(`
this.root().querySelectorAll("a[href]")   // EVERY anchor in $app, every navigation`);

		p("The pass toggles, so it removes as well as adds. A widget that keeps its own link state under the same two class names gets silently wiped the next time you click anything — which is why `ChromeShell` in this section marks with `.chrome-active` instead. Anything with its own notion of `current` needs its own class name.").ac("note");

		prev_next(this);
	},

	/* Read the classes back off the DOM rather than asserting them.
	 *
	 * The read is in a timeout because mark() runs AFTER render() returns —
	 * Router.activate() renders the chain, then marks it. The callback names its
	 * target ($rows.empty), so the ambient captor being long gone is fine. */
	readout(){
		let $rows;

		div.c("chrome-scroll", () => table.c("chrome-readout", () => {
			thead(() => tr(() => { th("href"); th("anchors"); th("classes"); }));
			$rows = tbody();
		}));

		// Grouped by href, so three anchors for one url are one row — and if the
		// pass ever gave them different classes, the row would say so.
		const read = () => $rows.empty(() => {
			const rows = new Map();

			[...this.view.el.querySelectorAll("a[href]")]
				.filter(link => link.closest(".chrome-box, .chrome-tiles"))
				.forEach(link => {
					const href = link.getAttribute("href");
					const row = rows.get(href) ?? { anchors: 0, marks: new Set() };

					row.anchors++;
					row.marks.add([...link.classList].filter(c => c === "active" || c === "in-path").join(" ") || "—");
					rows.set(href, row);
				});

			rows.forEach((row, href) => tr(() => {
				const marks = [...row.marks].join("  /  ");
				td(href);
				td(row.anchors);
				td(marks).ac(marks === "—" ? "none" : "classes");
			}));
		});

		setTimeout(read, 0);

		return div.c("chrome-widths", () => button.c("chrome-btn", "re-read the DOM").click(read));
	},

	// a link that misses the pass, and the one call that catches it up
	late(){
		let $box;

		div.c("chrome-box", () => { $box = div.c("chrome-tiles"); });

		return div.c("chrome-widths", () => {
			// the capture form: $box is named, so the anchor is built where it
			// belongs instead of landing wherever the captor drifted to
			button.c("chrome-btn", "render a link late").click(() =>
				$box.append(() => a.c("chrome-tile", "a tile for THIS page").href(this.url)));

			button.c("chrome-btn", "app.router.mark_links()").click(() =>
				this.app.router.mark_links());
		});
	},
});
