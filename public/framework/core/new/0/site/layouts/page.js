import { Page, p } from "/app.js";
import { code, section, api, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Four layouts",
	children: "replace column tabs takeover",

	content(){
		code(`
new Page({ … })                                    // 1. replace  (the default)

new Page({ classes: "columns" })                   // 2. columns

new Page({ classes: "tabs",                        // 3. tabs
           content(){ this.$pages = div.c("tab-panel") } })

new Page({ activate(){ this.app.takeover(this) } })  // 4. takeover`,
			"every layout on this site, in full");

		p("Four arrangements, **zero changes to App, Page or Router.** No Pager class, no mode switch in a base class — three of the four are data.");

		section("The two knobs");

		api([
			["$pages", "the view my children mount into. a property — put it anywhere", "child.activate()"],
			["classes", "extra classes on my .page. CSS does the rest", "my render()"],
		]);

		p("And one escape hatch: override `activate()` and don't ask your parent at all. That's takeover.").ac("note");

		section("Every page classes itself");

		code(`
.page.page-column.active-ancestor { display: grid; }   /* just THIS page */
.page.columns.active-ancestor     { display: grid; }   /* any page that opts in */`);

		p("`render()` puts `page-{name}` on every page automatically, so the site can style one page without the page knowing. `classes` is for the reusable case — a look you want to give several pages. Neither is a framework concept: both are just class names your stylesheet defines.").ac("note");

		section("Why there is no show(child)");

		code(`
// before — one action, two names, and show/hide collided with View's own
child.activate()  →  parent.show(child)  →  $content.hide(); view.append(…)

// now — the child places itself in the slot the parent offers
child.activate()  →  parent.$pages.append(this.render())`);

		p("A page puts **itself** on screen. What the parent supplies is a place, not a procedure — which is why a takeover page can simply answer differently, and why `App` needs no `show()`/`hide()` at all.").ac("note");

		section("Pick one");

		this.previews();

		section("…and the honest catch");

		p("`layout` is a class on **my** `.page`. It reaches my slot and no further — my grandchild is placed by *its* parent, using *its* class. The Columns page shows that happening for real, and what it costs to fix. It's the one unresolved thing in this design.");

		watch(
			"Open each of the four with the console open.",
			"Every one logs the same router.activate diff — only the DOM shape differs."
		);
	}
});
