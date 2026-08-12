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
	const owns_url = !this.default_tab && (this.default_tab = list[0]);
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
	// title is real; the `i === 0` fallback covers a page built without a url.
	const label = (name, i) => {
		const page = this.children.get(name);
		const text = page?.label ?? page?.title;
		return (this.loading || i === 0) && text ? text : name;
	};

	const filling = Promise.resolve(this.loading ?? this.child(list[0])).then(() => {
		// ⚠ `tab-default` marks the one whose href is MY url: every sibling url
		// starts with it, so mark_links() would give it `.in-path` on every tab.
		$bar.append(() => list.forEach((name, i) =>
			a.c("tab", label(name, i))
				.ac(owns_url && !i && "tab-default")
				.href(owns_url && !i ? this.url : this.url + name + "/")));

		// EVERY set renders its default, so no panel is ever blank. ⚠ `app` is handed
		// down here exactly as `Page.child()` does it — a default child is never
		// routed to, and a nested set with no `app` cannot mark its own links.
		const first = this.children.get(list[0])?.assign({ app: this.app });
		if (first) $panel.append(first.render().ac("default"));

		// ⚠ these links were built after mark() ran, so they missed the pass
		this.app?.router?.mark_links();

		// ⚠ after inject(): on a cold load every view here is still detached, and a
		// detached element measures zero.
		Promise.resolve(this.app?.ready).then(() => reveal($bar));
	});

	// so a cold load waits for the bar instead of painting an empty one. ⚠ `loaders?.`
	// too: a stand-in app (ext/demo's DemoApp) has no first-paint queue to wait on.
	this.app?.loaders?.push(filling);

	return $tabs;
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
