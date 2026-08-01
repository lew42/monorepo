import { Page, p } from "/app.js";
import { code, section } from "../ui.js";
import deep from "./deep/page.js";

export default new Page({
	meta: import.meta,
	title: "Nesting",

	// an already-imported page. `children: "deep"` would do the same thing
	// without the import — see the note below.
	children: [deep],

	content(){
		p("Right now the chain is new/0 → Nesting. The root is still loaded and still in the chain — its content is just hidden.");

		section("Declaring children");

		code(`
children: "deep"        // a name. nothing is imported; loaded when asked for
children: [deep]        // an already-imported page, adopted immediately
children: [deep, "x"]   // both`);

		p("This page uses the second form, so `deep` is imported at module load. The first form is the one that matters at scale: a parent that names its children pulls in **nothing**, so walking through an ancestor doesn't drag its whole subtree along.").ac("note");

		section("Go one deeper");

		p("Scroll to the bottom of the next page, then come back here. This page is never rebuilt, so nothing jumps.");

		this.previews();

		section("What happens on that click");

		code(`
from   [Home, Nesting]
to     [Home, Nesting, Deep]
        └────────────┘  shared = 2

deactivate   nothing
activate     Deep
untouched    Home, Nesting`);

		section("…and on the way back");

		code(`
from   [Home, Nesting, Deep]
to     [Home, Nesting]
        └────────────┘  shared = 2

deactivate   Deep
activate     nothing
untouched    Home, Nesting`);

		p("Only the tail moves. Any **state inside an ancestor** survives — form values, open details, a running timer — because the DOM was never touched.").ac("note");

		p("Scroll included. Each page's `.page-content` is its own scroll container, so a page you return to is exactly where you left it and a page you have never seen opens at the top. There is still no scroll code anywhere — it falls out of every page owning its own scroller.").ac("note");

		section("The code");

		code(`
activate(page){
    const from   = this.chain();
    const to     = page.chain();
    const shared = this.shared_depth(from, to);

    from.slice(shared).reverse().forEach(leaving  => leaving.deactivate());
    to.slice(shared).forEach(entering => entering.activate());

    this.active = page;
    this.mark();
}

shared_depth(from, to){
    let i = 0;
    while (from[i] && from[i] === to[i]) i++;
    return i;
}`, "Router.js");
	}
});
