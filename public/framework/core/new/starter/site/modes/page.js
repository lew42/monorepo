import { Page, p, div, button } from "/app.js";
import { code, section, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Modes",
	children: "flat bare link",

	content(){
		code(`
new Page({ })                                        // replace  — the default
new Page({ classes: "columns" })                     // columns  — nested grids
new Page({ classes: "flat" })                        // columns  — ONE grid, N equal
new Page({ activate(){ this.app.hide_chrome() } })   // bare     — no chrome`,
			"every mode, in full");

		p("A mode is **a class, not a structure.** The DOM is identical in all four — `page > pages > page`, mirroring the url. CSS decides whether that reads as a stack, a row of equal columns, or a bare window.");

		section("Because the wrappers can dissolve");

		code(`
.page.flat.active-ancestor { display: grid; grid-auto-flow: column; }

.page.flat.active-ancestor .pages,
.page.flat.active-ancestor .page.active-ancestor { display: contents; }`,
			"site/styles.css — the whole of flat");

		p("`display: contents` removes a box and keeps its children. Every wrapper between the grid and a page's content disappears, so a **nested** DOM lays out as **one** grid — and a page four levels down becomes a track of the top grid without knowing anything about it.");

		code(`
main 988px

nested   column 494 | opt-in 246 | deep 245      ← each level halves the remainder
flat     column 329 | a      329 | deep 329      ← one grid, equal tracks`, "measured, three deep");

		p("This is the open problem from **2 · Columns** — *\"a real column UI flattens the chain instead of nesting it\"* — and it turns out to need no JS at all. Descendants stay plain `page.js` files; nothing propagates down and nothing searches up.").ac("note");

		section("Nesting composes, too");

		code(`
.page.flat.active-ancestor .page.active-ancestor   (0,5,0)   contents   ← wins
.page.flat.active-ancestor                         (0,3,0)   grid`);

		p("A `flat` page **inside** another `flat` page matches the dissolve rule at higher specificity, so it stops being a grid and joins the outer one. Two arrangers do not make two grids.").ac("note");

		section("Try every permutation, live");

		p("Mode is one class on one element, so it can be swapped with no re-render and nothing reloaded. These buttons do exactly that — navigate first, then toggle.");

		this.toggles();

		section("Pick a permutation");

		this.previews();

		watch(
			"Open Flat › a › Deep, then press “home → flat”: four equal columns, home first.",
			"Press it again from Bare: nothing visible changes — the chrome is what's gone.",
			"Nothing re-renders. The console stays silent, because no navigation happened."
		);
	},

	// The whole point of the page: every mode is reachable by adding or removing
	// one class, from outside the page that owns it.
	toggles(){
		return div.c("toggles", () => {
			button("home → flat").click(() => this.app.root.view.ac("flat"));
			button("home → replace").click(() => this.app.root.view.rc("flat"));
			button("hide chrome").click(() => this.app.hide_chrome());
			button("show chrome").click(() => this.app.show_chrome());
		});
	}
});
