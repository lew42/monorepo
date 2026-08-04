import { Page, View, p, div, button } from "/app.js";
import { section, file, code } from "../ui.js";
import { wrap, unwrap, wrapped } from "./wrap.js";

View.stylesheet(import.meta, "view-transitions.css");

// two more pages carrying `motion-vt`, so a navigation exists where BOTH the old
// and the new state hold the name — which is when a View Transition stops being a
// cross-fade and starts being a morph
function sibling(page){
	div.c("motion-level", () => {
		page.parent.children.forEach(child => child !== page && child && child.link(child.title));
		page.parent.link("↑ " + page.parent.title);
	});
}

export default new Page({
	meta: import.meta,
	title: "View Transitions",
	classes: "motion motion-vt",

	initialize(){
		this.add("alpha", { title: "Alpha", classes: "motion motion-vt", content(){ sibling(this); p("Both this page and Beta are named `motion-page`, so the browser has an old AND a new snapshot to animate between."); } });
		this.add("beta", { title: "Beta", classes: "motion motion-vt", content(){ sibling(this); p("Toggle the wrap on the parent page first, then bounce between the two."); } });
	},

	content(){
		file(import.meta, "wrap.js");

		div.c("motion-controls", () => {
			this.$motion_toggle = button.c("motion-btn motion-toggle", "wrap Router.activate()")
				.attr("aria-pressed", "false")
				.click(() => this.toggle());
		});

		p("Press it, then click anything in the sidebar. The page lifts and fades while the sidebar's link highlight cross-fades underneath — one animation, produced by the browser, from a DOM swap that was written with no idea it was being watched.").ac("note");

		div.c("motion-level", () => {
			this.alpha.link("Alpha");
			this.beta.link("Beta");
			p("…these two both carry `motion-vt`, so the name exists on both sides.").ac("note");
		});

		file(import.meta, "view-transitions.css");

		section("The framework needs nothing");

		p("`document.startViewTransition(fn)` demands a synchronous `fn`. `Router.activate()` is synchronous, and the comment saying so is about a console group — the guarantee was made for an unrelated reason and happens to be exactly the one this API wants.").ac("note motion-verdict");

		section("How a site opts in — no patch, no subclass");

		code.fn(() => {
			// App does `new Router(this.router, { app: this })`, and Router's
			// constructor is Object.assign-based. So an own-property `activate`
			// on the config object shadows the prototype. Nothing is patched and
			// nothing is monkeyed; this is the assign constructor doing its job.
			new App({
				router: {
					activate(page){
						return document.startViewTransition
							? document.startViewTransition(() => Router.prototype.activate.call(this, page))
							: Router.prototype.activate.call(this, page);
					},
				},
			});
		});

		p("That is the whole first-class version, and it exists today. The one wart is `Router.prototype.activate.call(this, page)` — an override with no `super`.").ac("note");

		section("If the wart is worth one line");

		code.fn(() => {
			// App.load() — today
			this.router = new Router(this.router, { app: this });

			// App.load() — with a Router class as config, so a site can subclass
			// and write a real super call
			this.router = new (this.Router ?? Router)(this.router, { app: this });
		});

		code.fn(() => {
			class ViewTransitionRouter extends Router {
				activate(page){
					if (!document.startViewTransition) return super.activate(page);
					return document.startViewTransition(() => super.activate(page));
				}
			}

			new App({ Router: ViewTransitionRouter });
		});

		p("Cost: one property name, `Router`, capitalised because it holds a class. It buys `super`, which is the difference between an override and a patch. `render()` is already overridden this way by `site/app.js`, so the pattern is not new here — only the class-valued option is.").ac("note");

		section("What it does NOT need");

		code.css(`
transition(swap){ return swap(); }      /* an empty seam in Router — rejected */`);

		p("An explicit hook was the obvious answer and it is the wrong one: an empty method exists forever, and it buys nothing the assign constructor did not already give away for free. Record the trick, not the hook.").ac("note");

		section("The sharp edges, measured");

		code.css(`
1  a transform on any ancestor of a .full page turns its position: fixed into
   position-relative-to-that-ancestor. The ::view-transition pseudos do not touch
   .pages, so this is safe — but a translate on .pages would break /full/ silently.

2  the import is NOT inside the transition. Router.load() awaits load_segments()
   BEFORE activate(), so a cold child module downloads with no snapshot held.
   That ordering is already correct and must stay that way.

3  two fast clicks: the second startViewTransition() skips the first. No error,
   no stuck snapshot — but it is the same in-flight race the readme lists as
   open item 4, wearing a different hat.`);

		section("Next");

		p("`/motion/direction/` — the router knows whether you went deeper or came back, and currently throws it away.").ac("note");
	},

	toggle(){
		const router = this.app.router;

		wrapped(router) ? unwrap(router) : wrap(router);
		this.$motion_toggle.attr("aria-pressed", String(wrapped(router)));

		return this;
	},

	/* The release hook, doing exactly what it is for. deactivate() runs BEFORE the
	 * incoming page activates — inside the very transition this installed — so the
	 * navigation that carries you off this page is animated, and the next one is
	 * not. Nothing is left patched behind me. */
	deactivate(){
		unwrap(this.app.router);
		this.$motion_toggle?.attr("aria-pressed", "false");
		return this;
	},
});
