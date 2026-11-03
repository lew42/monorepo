import View, { div, span, details, summary, button, icon } from "../../../core/View/View.js";
import { Page } from "../../../core/Page/Page.class.js";
import { view } from "./DefaultView.js";

/**
 * class InstanceTree extends View — the live instance hierarchy of the running site.
 * Root = the `App`; each node = class icon + class name + `title`; children = `page.children`;
 * the page you are on is highlighted; the `view` button opens that instance's DefaultView.
 * It redraws (next frame) when a child mounts, a shown page's field changes, or the router
 * navigates. No store: it reads the pages themselves. Doc: doc/instance-tree.md
 *
 *   new InstanceTree({ app })        // app defaults to window.app
 */
export default class InstanceTree extends View {

	static icon = "account_tree";

	static installed = false;

	// Child pages mount and routes change quietly (no event), so announce both once here, for every tree.
	// Once per app: wrapping `navigated` per tree stacked a new wrapper on every dev-bar redraw.
	static install(app){
		if (app && !app.instance_tree_hooked){
			app.instance_tree_hooked = true;
			const navigated = app.navigated;
			app.navigated = function(...args){ const r = navigated?.apply(this, args); window.dispatchEvent(new CustomEvent("instance-tree-change")); return r; };
		}
		if (InstanceTree.installed) return;
		InstanceTree.installed = true;
		const add = Page.prototype.add;
		Page.prototype.add = function(...args){
			const page = add.apply(this, args);
			window.dispatchEvent(new CustomEvent("instance-tree-change"));
			return page;
		};
	}

	// ⚠ State is set in render(), not as class fields: View's constructor calls render() before fields initialise.
	render(){
		this.open = new Set();    // pages whose children are shown
		this.shown = new Set();   // pages whose properties are shown
		this.watched = new Map(); // page -> its "change" listener
		this.redraws = 0;
		this.app ??= window.app;
		InstanceTree.install(this.app);
		const again = () => this.refresh();

		window.addEventListener("instance-tree-change", again);

		// A tree that left the document (the dev rail re-renders its tabs) stops listening.
		this.gone = () => !this.$box.el.isConnected;
		this.stop = () => {
			window.removeEventListener("instance-tree-change", again);
			this.watched.forEach((fn, page) => page.off("change", fn));
		};

		this.$box = div.c("instance-tree");
		this.draw();
	}

	// Redraw once per frame however many changes arrive together.
	refresh(){
		if (this.queued) return;
		this.queued = true;
		requestAnimationFrame(() => { this.queued = false; this.gone() ? this.stop() : this.draw(); });
	}

	draw(){
		this.redraws++;
		const active = this.app.router?.active;
		this.watched.forEach((fn, page) => page.off("change", fn));
		this.watched.clear();

		this.$box.empty(() => {
			div.c("instance-tree-head muted", `${this.constructor.name} · redrawn ${this.redraws}×`);
			this.node(this.app, active, 0);
		});
	}

	watch(page){
		if (this.watched.has(page) || !page.on) return;
		const fn = () => this.refresh();
		page.on("change", fn);
		this.watched.set(page, fn);
	}

	pages(of){
		if (of === this.app) return of.root ? [of.root] : [];
		return [...(of.children?.values() ?? [])].filter(Boolean);
	}

	node(subject, active, depth){
		const isApp = subject === this.app;
		const kids = this.pages(subject);
		if (!isApp) this.watch(subject);

		const mark = active && subject === active ? " is-active" : "";
		const open = depth < 1 || this.open.has(subject) || this.on_path(subject, active);

		details.c("instance-node" + mark, $d => {
			if (open) $d.attr("open", true);
			// Closed nodes draw no children (the site has ~1400 pages); opening one redraws.
			$d.el.addEventListener("toggle", () => {
				if ($d.el.open === open) return;
				$d.el.open ? this.open.add(subject) : this.open.delete(subject);
				this.refresh();
			});

			summary.c("instance-row", () => {
				icon(subject.constructor.icon ?? subject.icon ?? "data_object");
				span.c("instance-class", subject.constructor.name);
				if (!isApp) span.c("instance-title", String(subject.title ?? subject.name ?? ""));
				if (kids.length) span.c("muted", `(${kids.length})`);
				button.c("instance-view", "view").click(e => {
					e.preventDefault();
					this.shown.has(subject) ? this.shown.delete(subject) : this.shown.add(subject);
					this.refresh();
				});
			});

			if (this.shown.has(subject)) div.c("instance-props", () => view(subject, { open: 1 }));
			if (open) div.c("instance-kids", () => kids.forEach(kid => this.node(kid, active, depth + 1)));
		});
	}

	on_path(page, active){
		for (let p = active; p; p = p.parent) if (p === page) return true;
		return false;
	}
}

View.stylesheet(import.meta, "InstanceTree.css");
