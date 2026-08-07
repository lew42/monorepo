import { Page, p, a, div, button } from "/app.js";
import { section } from "../../ui.js";
import { probe, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Open #3 — full covers, it does not remove",

	// position: fixed; inset: 0. Nothing on .app is set, synced, or unset —
	// which is the good half of the trade. This page is the other half.
	classes: "full",

	children: "sealed",

	// the toggle below can leave the chrome inert. Leaving the site keyboard-dead
	// because you visited a demo page is not a defect I get to demonstrate.
	deactivate(){
		this.app.$sidebar?.el.removeAttribute("inert");
		return this;
	},

	content(){
		probe("what is still reachable underneath this page", (log) => {
			const covered = [...document.querySelectorAll(".sidebar a[href], .sidebar button")];
			const reachable = covered.filter(el => !el.closest("[inert]") && el.tabIndex >= 0);

			log("focusable elements in the covered chrome:", covered.length);
			log("still reachable by keyboard             :", reachable.length);
			log("still exposed to a screen reader        :", covered.filter(el => !el.closest("[aria-hidden='true'], [inert]")).length);
			log("");
			covered.forEach(el => log("  ", el.getBoundingClientRect().top.toFixed(0) + "px", el.textContent.trim()));
			log("");
			log("They are all at their normal coordinates. They are simply behind");
			log("z-index: 10 — which the keyboard and the accessibility tree ignore.");
		});

		p("`display: none` did not have this problem. `position: fixed` buys composability — a full page can still make a region and class it `cols` — and pays for it in the two places CSS stacking has no authority over: focus order and the accessibility tree.").ac("note");

		section("Feel it");

		p("Press Tab. Measured at 1400×800: the first twenty stops are all sidebar links you cannot see — a keyboard user never reaches this page at all. Press Enter on any of them and you navigate somewhere you could not read.");

		div.c("row", () => {
			button.c("page-link", "seal the chrome (inert)").click(() => {
				app.$sidebar.attr("inert", "");
				app.$sidebar.el.style.outline = "";
			});
			button.c("page-link", "unseal").click(() => app.$sidebar.el.removeAttribute("inert"));
			a.c("page-link", "a page that seals itself →").href("/deep/chrome/sealed/");
		});

		p("The buttons prove `inert` is the right primitive: one attribute removes the chrome from focus order and from the accessibility tree, without touching layout or the framework.").ac("note");

		section("And a second one, found while measuring the first");

		probe("two full pages, stacked — go to /deep/chrome/sealed/ and run this", (log) => {
			[...document.querySelectorAll(".page")].forEach(el => {
				const box = el.getBoundingClientRect();
				log(getComputedStyle(el).display.padEnd(6),
					(box.width.toFixed(0) + "×" + box.height.toFixed(0)).padEnd(10),
					el.className);
			});
			log("");
			log("`sealed` is my child, but it mounts in app.$pages because I claim no");
			log("region — so I do not contain it. Every other ancestor in this list is");
			log("display:none for exactly that reason. I am not, and I am full size.");
		});

		p("The general ancestor rule asks the real question — `.page.active-ancestor:has(.page.active-page)` — and the readme is rightly proud of it. The `full` rule does not ask it.").ac("note");

		p("`.page.full.active-page, .page.full.active-ancestor` is unconditional, so a `full` page stays fixed at `inset: 0` whether or not the leaf is inside it. Measured on `/deep/chrome/sealed/`: this page is `display: flex`, 1400×800, underneath a second full page — invisible, and every control in it still in the tab order. `inert` on the sidebar cannot help, because the thing leaking focus is another page.");

		p("The fix is to make the `full` rule ask what the general rule already asks. Verified by injecting it: this page collapses to `display: none` and the tab order starts inside the leaf.").ac("note");

		section("…and a third, in the same three lines of CSS");

		probe("measure every direct child against the height it needs", (log) => {
			const page_el = document.querySelector(".active-page");

			log("display:", getComputedStyle(page_el).display, "· flex-direction:", getComputedStyle(page_el).flexDirection);
			log("");
			log("child                       box    needs");

			[...page_el.children].forEach(el => {
				const box = Math.round(el.getBoundingClientRect().height);
				log("  " + (el.tagName + "." + (el.className.split(" ")[0] || "—")).padEnd(24),
					String(box).padStart(5), String(el.scrollHeight).padStart(8),
					el.scrollHeight > box + 2 ? "  ← CRUSHED" : "");
			});

			log("");
			log("This page carries a scoped `flex: 0 0 auto` in deep.css, so the rows");
			log("above agree. Remove it and the .code boxes measure 2px against ~300.");
		});

		p("`.page.full` sets `display: flex; flex-direction: column`, which makes every direct child a flex item with the default `flex-shrink: 1`. The rule was written for a page whose only real child is a `.pages` region — that one gets `flex: 1 1 auto` and works. Ordinary content gets crushed instead, and because `.code` clips its own overflow, a 300px code block becomes a 2px line with an unreachable button inside it.").ac("note");

		p("It is silent, it only appears once the content exceeds the viewport, and `overflow-y: auto` never rescues it — flex shrinking removes the overflow before the scrollbar could. Fix, verified by injection: `.page.full > * { flex: 0 0 auto; }` alongside the existing region rule. `/full/left/`'s columns are unaffected.");

		section("So is the readme right about inert?");

		p("Half right. `inert` is the fix, and it is site policy — no argument. But the site has nothing to hang it on: `Router` never tells anyone a navigation happened, and `.full` is a class the framework deliberately does not know. So the only place left to put it is the page itself, which then has to name `app.$sidebar` — a property of this site's `App` subclass, from inside a page that is otherwise portable.");

		probe("what the site would need in order to own this", (log) => {
			log("Router.mark() already knows the leaf and already walks the DOM.");
			log("One duck-typed line at the end of it — this.app.navigated?.(this.active) —");
			log("would let site/app.js write the policy ONCE:");
			log("");
			log("  navigated(page){ this.$sidebar.toggle_attr('inert', page.classes?.includes('full')); }");
			log("");
			log("Cost: one call, one optional method, zero framework knowledge of 'full'.");
			log("It is the same seam mark_links() already is, and /deep/nav/ wants it too.");
		});

		whole(import.meta);
	}
});
