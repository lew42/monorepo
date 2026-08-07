import { Page, View, p, div, a, button } from "/app.js";
import { section, file, code } from "../ui.js";
import { install, remove, installed } from "./head-start.js";

View.stylesheet(import.meta, "head-start.css");

export default new Page({
	meta: import.meta,
	title: "A head start on the import",
	classes: "motion",

	children: "slow",
	latency: 0,

	content(){
		code.js(`
async load(url){
    this.app.$pages.ac("navigating");          // + the click has happened
    const page = await this.load_segments(url);
    this.app.$pages.rc("navigating");          // + the module has arrived

    if (page) this.activate(page);
    …
}`);

		p("Two lines. Everything between them is time the app currently spends perfectly still, while a module downloads, after the reader has already committed.").ac("note motion-verdict");

		div.c("motion-controls", () => {
			this.$motion_toggle = button.c("motion-btn motion-toggle", "install the head start")
				.attr("aria-pressed", "false")
				.click(() => this.toggle());

			this.$motion_latency = button.c("motion-btn motion-toggle", "simulate 600ms")
				.attr("aria-pressed", "false")
				.click(() => this.simulate());
		});

		div.c("motion-level", () => {
			// `slow` is a LAZY child — a name, not a Page — so there is no
			// this.slow to ask for a link(). Its url is the one thing a name
			// already tells us, which is the same trick previews() uses.
			a.c("page-link", "↓ a module that really does take 700ms").href(this.url + "slow/");
			p("…or just click anything in the sidebar.").ac("note");
		});

		file(import.meta, "head-start.css");

		section("It costs nothing when it is not needed");

		p("When the walk resolves in microtasks — a page already imported, which is most navigations — the class is added and removed inside a single task and the browser never paints it. The effect appears only when there is a wait to cover, and it appears for exactly the length of that wait. No timer, no duration to tune, no minimum.").ac("note motion-verdict");

		section("Why here and not in click()");

		code.js(`
click(e)   only mouse navigations   — popstate would be dead time again
go(url)    only pushed navigations  — popstate calls load() directly
load(url)  every navigation there is`);

		p("`load()` is the one gate both `go()` and `popstate` pass through, and it is also the method that owns the await. The class belongs where the waiting is.").ac("note");

		section("The honest costs");

		code.css(`
1  one class name, .navigating, written in two places in one method.

2  a rejected walk leaks the class. load_segments() can only reject if child()
   throws — Page.load() catches import failures — so this is narrow, and a
   try/finally closes it at the price of a less readable method.

3  it makes the app admit it is waiting. Some designers will hate that; the
   alternative is an app that pretends nothing is happening and then jumps.

4  it is a THIRD thing this tier writes to the DOM. Router.mark() writes two
   classes and a link pass, and that restraint is the design. This adds one.`);

		section("Why I believe in it anyway");

		p("Every other page in this section makes navigation prettier. This one makes it *faster* — not in milliseconds, in the only measure that matters, which is how long the reader waits without evidence that anything is happening. Lazy loading is the headline feature of `new/1`, and its cost is paid at exactly this moment. The framework should spend that moment rather than stand in it.").ac("note motion-verdict");

		section("The alternative I rejected");

		code.js(`
// start the exit at the click and swap when the load lands — a real transition
// running concurrently with the import, not a state
click(e){ this.exit_animation = …; }`);

		p("It sounds better and it is worse. If the import beats the animation you have *added* latency to make it look busy, and every fast navigation pays for one slow one. The class approach has no duration of its own, so it cannot ever be the slow part.").ac("note");

		section("Back to the start");

		this.parent.link("↑ Motion");
	},

	toggle(){
		const router = this.app.router;

		installed(router)
			? remove(router, this.app.$pages)
			: install(router, this.app.$pages, () => this.latency);

		this.$motion_toggle.attr("aria-pressed", String(installed(router)));

		return this;
	},

	simulate(){
		this.latency = this.latency ? 0 : 600;
		this.$motion_latency.attr("aria-pressed", String(!!this.latency));

		return this;
	},

	deactivate(){
		remove(this.app.router, this.app.$pages);
		this.$motion_toggle?.attr("aria-pressed", "false");

		return Page.prototype.deactivate.call(this);
	},
});
