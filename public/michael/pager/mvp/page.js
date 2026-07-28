import { Page, Pager, p, pre, div, button, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "MVP",
	description: "new Pager() + show() — live.",
	content(){
		p("`show(page)` empties the container and renders a page into it. That's the whole class.");

		pre(`const pager = new Pager();
pager.show(pageA);   // renders pageA
pager.show(pageB);   // swaps to pageB`);

		h3("Live demo");
		p("Two throwaway pages, one Pager, two buttons:");

		// two whole Pages, created inline (no meta → dormant, unregistered)
		const a = new Page({ title: "Page A", content(){ p("I'm page A — a whole Page, swapped in live."); } });
		const b = new Page({ title: "Page B", content(){ p("And I'm page B. The Pager emptied itself and rendered me."); } });

		const demo = new Pager().ac("card"); // captures here
		demo.show(a);

		div.c("flex gap", () => {
			button.c("btn prim", "Show A").click(() => demo.show(a));
			button.c("btn", "Show B").click(() => demo.show(b));
		});

		p("The Pager is dumb on purpose: no title changes, no URL. Lifecycle and history belong to the Router — see the Router section.");
	}
});
