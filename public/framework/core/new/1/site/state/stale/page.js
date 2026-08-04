import { Page, p, div, a, button } from "/app.js";
import { code, section } from "../../ui.js";
import { live } from "../../async/lab.js";

export default new Page({
	meta: import.meta,
	title: "State that must not survive",

	/* The only hook that runs when you LEAVE. Router calls it deepest-first on
	 * the pages dropping out of the chain. */
	deactivate(){
		this.$guarded?.hide();
		return this;
	},

	content(){
		p("Everything on `accident` was state you were glad to keep. This is the other half: a banner that is now a lie, a token that has been spent, a result computed from data that has since changed.");

		section("The bug");

		live(() => {
			const $banner = div.c("banner state-banner", "").hide();

			button.c("async-btn", "submit (fails)").click(() =>
				$banner.show().text("Could not save — check the highlighted fields."));
		}, "raise the error, then navigate away and come back");

		p("The error is still there, about a submit you abandoned four navigations ago. Nothing is wrong with the code — `render()` cached the view, and the view contains a banner, so the banner is kept exactly like a scroll offset or a typed value. The DOM cannot tell the difference between state you wanted and state that expired.").ac("note");

		section("The fix");

		code(`
deactivate(){
    this.$guarded?.hide();
    return this;
}`, "stale/page.js — verbatim, and the only hook that can do this");

		live(() => {
			this.$guarded = div.c("guarded state-banner", "").hide();

			button.c("async-btn", "submit (fails, but clears on exit)").click(() =>
				this.$guarded.show().text("Could not save — check the highlighted fields."));
		}, "raise this one too, leave, and come back — it is gone");

		p("`deactivate()` is called by `Router.activate()` on every page leaving the chain, deepest first, before the entering pages are activated. It is the framework's one answer to \"this state has expired\", and it is enough — but only because a page knows what it owns.").ac("note");

		section("What belongs in deactivate()");

		code(`
yes   an error or success banner tied to one attempt
      a spent one-time token, a nonce, a CSRF field
      an open menu, a focused-and-half-typed search box
      a timer, a socket, an observer, a playing <video>
      an AbortController for a request nobody is waiting for now

no    anything the user typed and would be annoyed to lose
      scroll position — the browser handles it, see /state/scroll/
      cached data that is still true`);

		p("The test is whether the state is a claim about RIGHT NOW. A typed value is not — it is the user's. A banner saying \"could not save\" is, and it stops being true the moment you leave.").ac("note");

		section("The asymmetry, again");

		code(`
leaving   deactivate()      a real seam. Override it, done.
entering  activate()        ALSO placement, so overriding means calling
                            through the prototype by hand`);

		p("Three of this section's five pages have now needed an entry hook for three unrelated reasons — restarting a timer, repainting shared state, resetting a banner. That is the case for splitting `Page.mount()` out of `activate()`, and it is in the report as a question rather than a patch.").ac("note");

		section("What cannot be fixed this way");

		code(`
a page you have NEVER left     deactivate() has not run, so nothing cleared
two tabs of one browser        separate module registries, no shared state
a reload                       everything is gone anyway — this is the easy case`);

		p("The first is the honest limit: state expires on a schedule of its own, not on yours. If a banner must vanish after ten seconds it needs a timer, and that timer needs clearing in `deactivate()` — which is where this section started.").ac("note");

		a.c("page-link", "scroll →").href("/state/scroll/");
	}
});
