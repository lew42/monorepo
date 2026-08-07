import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { code as js } from "/framework/ext/highlight/highlight.js";   // js.fn(fn) — shown, never run
import { field } from "../field.js";
import { ask_before_leaving, ask_before_back } from "../leave.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "A guard, from outside",
	classes: "forms",

	release: null,
	back_release: null,
	warned: false,

	/* Refuse ONCE, then always allow. A demo that can trap its reader on the page
	 * is a bug, not a demonstration — so the escape is built into the predicate
	 * itself, not bolted on: click the same link twice and you are gone. */
	may_leave(url){
		if (!this.$draft.el.value) return true;
		if (this.warned) return true;

		this.warned = true;
		this.$notice.ac("forms-warn");
		this.$notice.text(`Refused: "${url}". Click any link again and it goes through.`);
		return false;
	},

	// The one leave hook that exists cannot refuse a navigation — but it is
	// exactly the right place to release the thing that can.
	deactivate(){
		this.release?.();
		this.back_release?.();
		this.assign({ release: null, back_release: null, warned: false });
		this.$armed?.text("disarmed by deactivate()");
		return this;
	},

	content(){
		demo(() => {
			this.$draft = field("Type here, then arm the guard and click a sidebar link", {
				name: "draft", rows: 3 });

			this.$armed = p.c("forms-status", "not armed");
			this.$notice = p.c("forms-status", "");

			button("arm").click(() => {
				this.release?.();
				this.release = ask_before_leaving(this.app.router, url => this.may_leave(url));
				this.$armed.text("armed — the next in-app link click is checked");
			});

			button("disarm").click(() => {
				this.release?.();
				this.release = null;
				this.$armed.text("disarmed by hand");
			});
		}, "Three escape hatches, on purpose: it refuses at most once, `disarm` is always on screen, and `deactivate()` releases it the moment you do leave. Nothing here can strand you.");

		section("Eight lines, and no framework change");

		code(`
export function ask_before_leaving(router, ask){
    const listener = e => {
        const link = router.link_clicked(e);   // the Router's OWN five rules
        if (!link || ask(link.pathname)) return;

        e.preventDefault();                    // …which link_clicked() checks first
    };

    document.addEventListener("click", listener, true);
    return () => document.removeEventListener("click", listener, true);
}`, "site/forms/leave.js — the whole file");

		md("`Router.listen()` registers a **bubble**-phase click listener on `document`. This is a **capture**-phase listener on the same node, so it runs first. And `link_clicked()`'s very first rule is `if (e.defaultPrevented || e.button) return null` — so calling `preventDefault()` is not a trick played on the Router, it is the Router's own way of being told *this click is not yours*.").ac("note");

		section("Prove the ordering, don't assume it");

		demo(() => {
			const $out = p.c("forms-status", "not run yet");
			const $probe = a.c("page-link", "a real in-app link, used as the probe").href("/columns/");

			button("run the ordering probe").click(() => {
				const order = [];
				const capture = e => {
					order.push("capture (mine)");
					e.preventDefault();
					order.push("router.link_clicked(e) → " + this.app.router.link_clicked(e));
				};
				const bubble = () => order.push("bubble (where Router listens)");

				document.addEventListener("click", capture, true);
				document.addEventListener("click", bubble, false);
				$probe.el.click();
				document.removeEventListener("click", capture, true);
				document.removeEventListener("click", bubble, false);

				$out.text(order.join("   ·   "));
			});
		}, "It clicks a real `/columns/` link and you stay here — which is the proof. Capture runs first, `link_clicked` returns `null` once the default is prevented, and the Router declines the navigation itself.");

		code(`
ordering probe   capture (mine) · router.link_clicked(e) → null · bubble (Router)
still at         /forms/guard/          the real link click went nowhere

armed + dirty    click sidebar Columns  ->  /forms/guard/     REFUSED
                 click sidebar Columns  ->  /columns/         allowed (escape hatch)
                 guard.release === null                       deactivate() released it
armed + clean    click sidebar Tabs     ->  /tabs/            never refused`,
			"measured, four exit attempts");

		section("Three shapes, weighed");

		code(`
A  Page.can_leave(url)     a predicate the Router asks
   +  visible in the file that wants it — no listener, no registry
   +  scoped: only pages in the LEAVING slice are asked
   -  new API surface on Page, forever
   -  cannot cover Back, reload, close, or an external link

B  a cancelable Router event
   +  zero coupling; anything may listen, including code outside the framework
   -  THE black-magic shape: a listener in one file changes what every link on
      the site does, and the page it protects never mentions it
   -  a listener that outlives its page blocks navigation with no visible cause

C  the site handles it; the framework stays out
   +  works TODAY, in eight lines, with no framework change at all
   +  link_clicked() is already a public predicate — no rules are duplicated
   -  every site re-implements it
   -  still cannot cover Back, reload, close, or an external link`,
			"and the losing rows are the same in all three");

		md("**C wins**, and it wins on a fact rather than a preference: the eight lines above already exist and already work, so A buys nothing that is not already available — it only moves the same eight lines inside the framework and charges a permanent method on `Page` for the move. B is disqualified by this codebase's own standard.").ac("note");

		section("If A were adopted anyway, this is the exact shape");

		js.fn(() => {
			// Page.class.js — the default, beside deactivate()
			class Page {
				// May I be left for `url`? Synchronous, and false means "no".
				// A page wanting a custom modal returns false, shows its own, and
				// calls router.go() itself when the reader agrees.
				can_leave(url){ return true; }
			}

			// Router.js — in go(), BEFORE the await. Not in load(): load() is also
			// what popstate calls, where refusing is already too late.
			class Router {
				async go(url){
					if (!this.chain().every(page => page.can_leave(url))) return;

					if (await this.load(url)) history.pushState({}, "", url);
					else location.assign(url);
				}
			}
		});

		p("`every()` over the current chain, not just the leaf, because a wizard three levels down is the page that knows whether its subtree is dirty. Passing `url` is what lets it allow movement *within* itself: `can_leave(url){ return url.startsWith(this.url) }`.").ac("note");

		section("Should deactivate() become the veto? No.");

		code(`
deactivate(){ clearInterval(this.timer); }     // returns undefined -> refuses forever`,
			"the one-line change, and why it must not be made");

		p("`deactivate()`'s return value is ignored today, and it is one line from being a veto — which is exactly why it must not be. It would conflate *I am leaving, clean up* with *may I leave*, and every existing override returns whatever its last statement returned. Silent, permanent, undebuggable. Two questions want two methods.").ac("note");

		section("Back cannot be refused, only undone");

		demo(() => {
			const $out = p.c("forms-status", "not armed");

			button("arm the Back guard — fires once").click(() => {
				this.back_release?.();
				this.back_release = ask_before_back(this.app.router, () => this.may_leave("(back)"));
				$out.text("armed — press the browser Back button now");
			});
		}, "It works, and you should still not ship it. `popstate` fires *after* the browser has moved, and `Router` registered its own popstate listener first — so the page you were refusing has already rendered. Undoing it costs a `pushState` **and** a second `load()`, and the url visibly flickers.");

		code(`
armed at /forms/guard/ with a dirty input, moved to /columns/, pressed Back:

popstate fires        Router.load() has ALREADY run and rendered /columns/
"refusing" means      history.pushState(old url) + router.load(old url)
landed back at        /forms/guard/        — it works
what the user saw     the page change, then change back
history afterwards    one extra entry, pointing where you already were`,
			"measured — the undo succeeds, and costs two renders and a flicker");

		p("A guard that stops link clicks but not Back is a guard users learn not to trust after the first time it fails them. That asymmetry is the strongest argument in this whole section against putting one in `Router` at all.").ac("note");

		a.c("page-link", "next: beforeunload →").href("/forms/unload/");

		this_file(import.meta);
	},
});
