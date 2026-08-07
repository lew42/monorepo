import { Page, p, div, a, button, span } from "/app.js";
import { code, section } from "../../ui.js";
import { live, where, wait, items } from "../lab.js";

export default new Page({
	meta: import.meta,
	title: "In flight",

	loose_ticks: 0,
	guarded_ticks: 0,
	deactivations: 0,

	/* The one lifecycle hook a page gets for leaving. Router calls it deepest-first
	 * on the pages that are dropping out of the chain, then removes their classes. */
	deactivate(){
		this.deactivations++;

		clearInterval(this.guarded_timer);
		this.guarded_timer = null;
		this.controller?.abort();

		this.$deactivations?.text(this.deactivations);
		this.$guarded_state?.text("stopped by deactivate()");

		return this;
	},

	/* There is no matching hook for coming BACK. Page.activate() is placement, so
	 * restarting what deactivate() stopped means shadowing it and calling through
	 * the prototype by hand — which is exactly this, and it is the ergonomic gap
	 * this page reports. */
	activate(){
		Page.prototype.activate.call(this);
		this.tick_guarded();
		this.show_race();
		return this;
	},

	/* Read on every activation, not in content(). render() caches this.view, so
	 * content() runs exactly once — anything that must be fresh when you come
	 * BACK to a page cannot live there. That is the same gap as the timer. */
	show_race(){
		const stash = sessionStorage.getItem("async-race");

		if (!stash || !this.$race) return;

		const { asked_last, url, active } = JSON.parse(stash);

		this.$race.rc("ok").ac(url === asked_last ? "ok" : "")
			.text(`asked last ${asked_last} · ended on ${url} · router.active ${active}`);

		sessionStorage.removeItem("async-race");
	},

	tick_guarded(){
		if (this.guarded_timer || !this.$tick_guarded) return;

		this.$guarded_state?.text("running");
		this.guarded_timer = setInterval(() => this.$tick_guarded.text(++this.guarded_ticks), 500);
	},

	content(){
		p("Start something slow, then leave before it lands. Three questions: does it land in the right place, does it leak, and is `deactivate()` the answer.");

		section("A fill that outlives your visit");

		p("This one takes five seconds. Click away to another section and come back before it lands — or after. Either way it reports where it went and whether this page was still the active one when it arrived.");

		div.c("async-render", () => {
			const $late = div.c("async-landed", "…5 second fill in flight");

			div.c("async-results", async $slot => {
				await wait(5000);

				const active = this.app?.router?.active === this;

				$slot.append(div.c("async-item", "arrived"));
				$late.ac(active ? "ok" : "").text(
					`arrived · page was ${active ? "STILL ACTIVE" : "NOT active"} · landed in → ${where($slot.el)}`);
			});
		});

		p("It lands correctly. `$slot` is a named view, and a Page's view is never removed from the DOM — `deactivate()` does nothing by default and `Router.mark()` only drops two classes. So a late arrival goes exactly where it was told, into a page that is merely hidden by CSS. Measured: 9 `.page` elements in the DOM after a tour of the site, none ever removed.").ac("note");

		section("So nothing leaks?");

		code(`
placement   correct — a named view is still a named view when it is hidden
DOM         nothing leaks: pages are built once and kept, by design
work        WASTED — the fetch completed, the JSON parsed, the DOM built
timers      NOT stopped. An interval outlives the page unless you clear it
sockets     same. A <video> keeps playing. That is what deactivate() is for`);

		section("Two timers — one guarded, one not");

		p("Both started when this page first rendered. Navigate away and come back, then compare them.");

		div.c("async-render", () => {
			div.c("row", () => {
				span("guarded (cleared by `deactivate()`, restarted by `activate()`): ");
				this.$tick_guarded = div.c("tick-guarded async-num", String(this.guarded_ticks));
				this.$guarded_state = div.c("guarded-state async-num", "running");
			});

			div.c("row", () => {
				span("loose (nothing clears it): ");
				this.$tick_loose = div.c("tick-loose async-num", String(this.loose_ticks));
			});

			div.c("row", () => {
				span("deactivate() calls: ");
				this.$deactivations = div.c("deactivations async-num", String(this.deactivations));
			});

			// Capped at 120 so a documentation page cannot leave something running
			// forever. A real leak has no such courtesy.
			this.loose_timer ??= setInterval(() => {
				if (++this.loose_ticks >= 120) return clearInterval(this.loose_timer);
				this.$tick_loose.text(this.loose_ticks);
			}, 500);

			this.tick_guarded();
		});

		code(`
deactivate(){
    clearInterval(this.guarded_timer);
    this.guarded_timer = null;
    this.controller?.abort();
    return this;
}

// there is no hook for coming back, so this is what it costs today
activate(){
    Page.prototype.activate.call(this);
    this.tick_guarded();
    return this;
}`, "inflight/page.js — verbatim");

		p("`deactivate()` has no counterpart. Restarting what it stopped means shadowing `Page.activate()` — placement — and calling through the prototype by hand. That is a real ergonomic gap and it is in the report.").ac("note");

		section("AbortController — and when it is worth it");

		live(() => {
			const $status = div.c("async-landed", "…fetching, abortable");

			div.c("async-results", async $slot => {
				const controller = new AbortController();

				try {
					const data = await items(1500, controller.signal);
					$slot.append(() => data.slice(0, 6).forEach(row => div.c("async-item", row.name)));
					$status.ac("ok").text("completed · " + data.length + " rows");
				} catch (error) {
					$status.text("aborted: " + error.message);
				}
			});
		}, "the signal threads through fetch AND the artificial delay");

		code(`
nothing            correct, and usually right. The work is wasted, the DOM is
                   fine, and the next visit finds it already filled

deactivate()       the answer for anything that keeps RUNNING — a timer, a
                   socket, a <video>, an observer. Not for a one-shot fetch

AbortController    worth it when the request is expensive, rate-limited, or
                   would be superseded by a newer one. It does NOT fix placement,
                   because placement was never broken`, "which tool, when");

		p("Reach for nothing first. `deactivate()` when something is still running. `AbortController` when the request itself costs someone money.").ac("note");

		section("Open #4 — the router's version of this bug");

		p("Two fast clicks on different unresolved urls. Both start an import; the SLOWER one lands last and wins, so your second click is undone by your first.");

		div.c("async-render", () => {
			this.$race = div.c("race async-landed", "not run yet");

			button.c("async-btn", "go deep, then go shallow — as fast as possible").click(async () => {
				const router = this.app.router;

				const first = router.go("/columns/child/grandchild/");    // 3 imports
				const second = router.go("/dynamic/42/");                 // 1 import

				await Promise.all([first, second]);
				await wait(300);

				sessionStorage.setItem("async-race", JSON.stringify({
					asked_last: "/dynamic/42/",
					url: location.pathname,
					active: router.active?.url,
				}));
			});
		});

		p("It navigates you away, so the result is stashed in `sessionStorage` and read back by `activate()` when you return. Measured: you end on `/columns/child/grandchild/` — the url you asked for FIRST, because it was the slower one to import.").ac("note");

		section("Is it the same bug?");

		code(`
mine       View.captor    a global you READ implicitly, after an await
                          → the value you assumed is gone
                          → fix: name the target. Stop reading the ambient

Open #4    router.active  a global you WRITE, after an await
                          → a newer intent already wrote it
                          → fix: a generation token. Do not write if superseded`);

		p("Same class — ambient global state crossing an await boundary — and exact duals: a read hazard and a write hazard. They are not the same bug and they do not share a fix. Naming your target cannot help the Router, and a generation token cannot help the captor.").ac("note");

		a.c("page-link", "marking →").href("/async/marking/");
	}
});
