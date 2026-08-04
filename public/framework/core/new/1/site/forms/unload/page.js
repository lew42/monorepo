import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../field.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "beforeunload",
	classes: "forms",

	armed: null,

	// Same discipline as /forms/guard/: the page that armed it disarms it.
	deactivate(){
		this.disarm();
		return this;
	},

	disarm(){
		if (this.armed) window.removeEventListener("beforeunload", this.armed);
		this.armed = null;
		this.$armed?.text("not armed");
	},

	content(){
		demo(() => {
			this.$memo = field("Type here, arm, then press reload or close the tab", {
				name: "memo", rows: 3 });

			this.$armed = p.c("forms-status", "not armed");

			button("arm").click(() => {
				this.disarm();
				this.armed = e => { if (this.$memo.el.value) e.preventDefault(); };
				window.addEventListener("beforeunload", this.armed);
				this.$armed.text("armed — reload, close, or follow an external link");
			});

			button("disarm").click(() => this.disarm());
			button("reload").click(() => location.reload());
		}, "The browser writes the message, not you — a custom string has been ignored since 2016. `e.preventDefault()` is the whole API, and it only fires at all if the reader has interacted with the page, which typing counts as.");

		section("What each mechanism can actually see");

		code(`
                        router guard    beforeunload
in-app link click            YES             no
Back / Forward               no †            no
reload                       no             YES
close the tab                no             YES
an external link             no             YES
location.assign() fallback   YES ‡           YES

 †  only by undoing a render that already happened — see /forms/guard/
 ‡  go() calls it, so a guard in go() runs first`, "neither mechanism is sufficient alone");

		code(`
armed with a dirty input, then:

in-app router.go("/columns/")   dialogs: []              never fired
location.reload()               handler ran: "fired"     confirmed via sessionStorage
close the tab                   dialogs: ["beforeunload"]`,
			"measured — Playwright auto-accepts the reload dialog, so that row asks the handler instead");

		md("The two columns barely overlap, and that is the finding. A router guard covers exactly one row that `beforeunload` misses — an in-app click — and that is the one row where **nothing is lost anyway**, because the page's view is memoized. `beforeunload` covers every row that actually destroys data.").ac("note");

		section("The case a router guard cannot reach");

		code(`
async go(url){
    if (await this.load(url)) history.pushState({}, "", url);
    else location.assign(url);          // <- leaves the SPA entirely
}`, "Router.go(), the failure branch");

		md("When a url does not resolve, `go()` hands it to the browser. That is a **hard** navigation out of the app: the heap goes, memoization goes, every unsaved input goes. A `can_leave()` check at the top of `go()` would catch it — but so does `beforeunload`, and `beforeunload` also catches the four rows above it. One mechanism, more coverage.").ac("note");

		section("The cost of arming it, and why autosave beats it");

		code(`
armed and clean     a spurious "leave site?" dialog on every reload
armed and stale     the page that armed it is gone; the listener is not
disarm forgotten    the whole tab prompts forever, with no visible cause`,
			"a listener outlives the page that added it");

		p("This is the same containment problem the rejected event-shaped guard had, and the same answer applies: whoever arms it disarms it, and `deactivate()` is where that goes. It is also the argument for not arming it at all — if the draft is already saved, there is nothing to prompt about.").ac("note");

		a.c("page-link", "next: a wizard whose steps are urls →").href("/forms/wizard/");

		this_file(import.meta);
	},
});
