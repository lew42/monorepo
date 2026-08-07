import { Page, View, p, div, button } from "/app.js";
import { section, file, code } from "../ui.js";
import { Ticker } from "./ticker.js";

View.stylesheet(import.meta, "release.css");

/* Identical on both pages. The only difference between them is one method, and
 * that is the entire argument of this page. */
function instruments(page){
	page.ticker = new Ticker();

	div.c("motion-controls", () => {
		page.ticker.$motion_spinner = div.c("motion-spinner");
		button.c("motion-btn", "read").click(() => page.$motion_readout.text(page.ticker.read()));
		page.parent.leaky.link("no deactivate()");
		page.parent.tidy.link("with deactivate()");
		page.parent.link("↑ back");
	});

	page.$motion_readout = div.c("motion-readout", "press read");
}

export default new Page({
	meta: import.meta,
	title: "deactivate()",
	classes: "motion",

	initialize(){
		this.add("leaky", {
			title: "No deactivate()",
			classes: "motion",
			content(){ instruments(this); },
			activate(){ Page.prototype.activate.call(this); this.ticker.start(); return this; },
		});

		this.add("tidy", {
			title: "deactivate() releases",
			classes: "motion",
			content(){ instruments(this); },
			activate(){ Page.prototype.activate.call(this); this.ticker.start(); return this; },
			deactivate(){ this.ticker.stop(); return Page.prototype.deactivate.call(this); },
		});
	},

	content(){
		code.js(`
deactivate(){ return this; }   // Page.class.js — it does nothing, on purpose`);

		p("Visit one page, note the numbers, leave, come back and press read. The two pages below are byte-identical except for one method.").ac("note");

		div.c("motion-controls", () => {
			this.leaky.link("no deactivate()");
			this.tidy.link("with deactivate()");
		});

		file(import.meta, "ticker.js");

		section("Why the default is right");

		p("`Page.render()` memoizes into `this.view`, so a page you have visited is never torn down — `Router` takes its classes off and CSS hides it. That is what makes Back instant and what keeps a half-typed `<input>` half-typed. Tearing down by default would be a worse framework.").ac("note motion-verdict");

		p("So the leak is not a bug in `Page`. It is the price of the memoization, and `deactivate()` is where you pay it.").ac("note");

		section("What actually keeps running");

		code.css(`
setInterval             keeps firing        you must clearInterval
requestAnimationFrame   keeps firing        you must cancelAnimationFrame
a fetch/EventSource     keeps streaming     you must abort
<video>                 keeps playing       you must pause
a CSS animation         STOPS BY ITSELF     display: none is not rendered`);

		p("The last line is the one worth knowing. A CSS animation on a hidden element does not advance, so the spinner above needs no hook at all — which is one more reason to prefer CSS motion over a JS loop in this framework specifically.").ac("note");

		section("The ordering that makes it safe");

		code.js(`
// Router.activate()
from.slice(shared).reverse().forEach(p => p.deactivate());   // deepest first
to.slice(shared).forEach(p => p.activate());                 // shallowest first`);

		p("`deactivate()` runs BEFORE anything new activates, deepest first. So a page releasing a resource cannot collide with a page acquiring the same one, and a subtree unwinds from the leaf up — the order you would release locks in.").ac("note");

		section("The one gap");

		p("Nothing calls `deactivate()` on unload. Close the tab and the browser cleans up anyway; but a page holding a server-side session has no hook for `beforeunload`, and adding one would put a window listener in `Router` for a case that belongs to the site. Left alone deliberately.").ac("note motion-warn");

		section("Next");

		p("`/motion/reduced/` — a demo site about motion that ignores `prefers-reduced-motion` is an argument against itself.").ac("note");
	},
});
