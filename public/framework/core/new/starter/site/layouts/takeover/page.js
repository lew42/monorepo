import { Page, p } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "4 · Takeover",
	children: "full",

	content(){
		code(`
// layouts/takeover/full/page.js
export default new Page({
    meta: import.meta,
    title: "Full window",
    activate(){ this.app.takeover(this); },
    deactivate(){ this.app.restore(this); },
});`, "the whole opt-in");

		p("The first three layouts change where a child goes **inside** its parent. This one leaves the parent entirely.");

		this.previews();

		section("The escape hatch");

		code(`
activate(){ this.container().$pages.append(this.render()); }   // the default
activate(){ this.app.takeover(this); }                          // …or don't ask at all`);

		p("The other three layouts change **where** the parent's slot is. This one declines to use a slot. Since a page places itself, that needs no permission from anything — `activate()` is the page's own method.");

		section("Why takeover lives in site/app.js, not in Page");

		code(`
takeover(page){ this.$app.ac("takeover").append(page.render().ac("takeover-page")); }
restore(page){  this.$app.rc("takeover"); page.view.remove(); }`, "site/app.js");

		p("The sidebar belongs to the site, so the site is what puts it away. `Page` gains no flag, `App` gains no mode — in fact `App` has no `show()`/`hide()` at all any more, only `$pages`. `this.app.takeover(this)` is the entire mechanism, visible at the call site.").ac("note");

		section("The ancestors are still there");

		p("Taking the window over doesn't unmount anything. `Home › Four layouts › 4 · Takeover` are all still in `$pages`, which is merely hidden by a CSS class — so coming back is one class removal, not a rebuild.");

		watch(
			"Open 'Full window'. Sidebar and content both vanish; the console shows app.takeover.",
			"Leave via the link inside it — app.restore, and everything is exactly as you left it.",
			"Press Back instead: same thing, because deactivate() runs either way."
		);
	}
});
