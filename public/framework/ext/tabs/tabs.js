import { View, div, a } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";

/* css: .tabs, .tab-bar, .tab, .tab-panel — all emitted below. */
View.stylesheet(import.meta, "tabs.css");

/**
 * tabs — a bar of links, and the panel those children mount into.
 *
 *     import "/framework/ext/tabs/tabs.js";   // once, anywhere in your app
 *
 *     content(){ this.tabs("guide api"); }
 *     this.tabs("guide api").ac("vertical")   // the same set, as a left rail
 *
 * Design record: framework/ext/tabs/readme.md.
 */
Page.prototype.tabs = function(names){
	const list = names ? names.trim().split(/\s+/) : [...this.children.keys()];

	// A `{"tab": {"name": "x", "active": true}}` line (core/Page/Log.js) names the
	// tab that should show when a reader lands on MY bare url, instead of always
	// the first-declared one -- 2026-09-29 fix round, finding 6. First match in
	// `list` order wins if more than one ever claims it; nobody using this line at
	// all falls straight back to `list[0]`, today's only behaviour.
	const active = list.find(name => this.tab_state(name).active === true);
	const owns_url = !this.default_tab && (this.default_tab = active ?? list[0]);
	let $bar, $panel;

	// placed NOW, while the captor is still ours; filled once the first tab lands
	const $tabs = div.c("tabs", () => {
		$bar = div.c("tab-bar");
		$panel = div.c("tab-panel");
	});

	this.regions ??= new Map();
	list.forEach(name => this.regions.set(name, $panel));

	// ⚠ A label must not depend on which tab you happened to arrive at, or the bar
	// reads differently per entry point. `this.loading` is the guarantee that every
	// title is real; the `name === this.default_tab` fallback covers a page built
	// without a url (its one, preloaded child -- see `filling` below).
	const label = name => {
		const page = this.children.get(name);
		const text = page?.label ?? page?.title;
		return (this.loading || name === this.default_tab) && text ? text : name;
	};

	// A `tab` line (core/Page/Log.js) can hide a name from the STRIP (`nav: false` —
	// still a real page at its own url, only missing here), grey it out (`disabled` —
	// shown, unclickable) and reorder it (`order`). `list` itself stays whole — the
	// regions Map above and `owns_url`/`default_tab` above still read every name — only
	// what gets DRAWN below is filtered/sorted, through the same two Log.js reads
	// Doc.bar() uses, so the two can never disagree.
	//
	// Pulled into its own function, and kept in `_tab_redraws`, so it can run again
	// later with no reload: core/Page/Log.js's Reader.changed() calls
	// `page.nav_redraw()` the moment a live `tab` or `file` line changes what
	// `tab_visible()`/`tab_order()` answer (2026-09-29 fix round, finding 5) — this
	// is the thing that actually redraws.
	const draw_bar = () => {
		const shown = list.filter(name => this.tab_visible(name)).sort((a, b) => this.tab_order(a) - this.tab_order(b));

		// ⚠ `tab-default` marks the one whose href is MY url: every sibling url
		// starts with it, so mark_links() would give it `.in-path` on every tab.
		$bar.empty(() => shown.forEach(name => {
			const disabled = !!this.tab_state(name).disabled;
			const is_default = owns_url && name === this.default_tab;

			a.c("tab", label(name))
				.ac(is_default && "tab-default")
				.ac(disabled && "tab-disabled")
				.style(disabled ? { opacity: "0.5", pointerEvents: "none" } : {})
				.href(disabled ? undefined : is_default ? this.url : this.url + name + "/");
		}));

		// ⚠ these links were built after mark() ran, so they missed the pass
		this.app?.router?.mark_links();
	};

	(this._tab_redraws ??= new Set()).add(draw_bar);

	const filling = Promise.resolve(this.loading ?? this.child(this.default_tab)).then(() => {
		draw_bar();

		// EVERY set renders its default, so no panel is ever blank. ⚠ `app` is handed
		// down here exactly as `Page.child()` does it — a default child is never
		// routed to, and a nested set with no `app` cannot mark its own links.
		const first = this.children.get(this.default_tab)?.assign({ app: this.app });
		if (first) $panel.append(first.render().ac("default"));

		// ⚠ after inject(): on a cold load every view here is still detached, and a
		// detached element measures zero.
		Promise.resolve(this.app?.ready).then(() => reveal($bar));
	})
		// ⚠ loaders is read once, at boot; after that nothing ever awaits `filling`
		// again, so an uncaught rejection here would be silent on every later nav.
		.catch(error => console.error(`${this.log_label()}.tabs() failed to fill:`, error));

	// so a cold load waits for the bar instead of painting an empty one. ⚠ `loaders?.`
	// too: a stand-in app (ext/demo's DemoApp) has no first-paint queue to wait on.
	this.app?.loaders?.push(filling);

	return $tabs;
};

// core/Page/Log.js's Reader.changed() calls this after a live `tab`/`file` line on
// MY OWN log, and my PARENT's own reader calls it on THEM after a live `settings`
// line on MINE (their strip may show me). Every tab-bar I have open redraws in
// place, then this bubbles to my own parent too — its strip might show me, and
// that is also how the sidebar's rail hears about it: core/Sidebar/Sidebar.js
// registers its own redraw the same way, on the site's ROOT page, which is the
// only page every bubble eventually reaches. 2026-09-29 fix round, finding 5.
Page.prototype.nav_redraw = function(){
	this._tab_redraws?.forEach(fn => fn());
	this.parent?.nav_redraw?.();
};

// The strip hides its own scrollbar, so a deep link landing on the fortieth member
// would show a bar with nothing marked. ⚠ `scrollBy` on the bar, never
// `scrollIntoView` — that one walks up and scrolls the region too.
function reveal($bar){
	// the same "selected" the stylesheet marks: mine, or the one the url runs through
	const tab = $bar.el.querySelector(".tab.active, .tab.in-path:not(.tab-default)");
	if (!tab) return;

	const to = tab.getBoundingClientRect(), from = $bar.el.getBoundingClientRect();
	$bar.el.scrollBy({ left: to.left - from.left - from.width / 3, top: to.top - from.top - from.height / 3 });
}

export default Page.prototype.tabs;
