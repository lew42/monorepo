import { View, Page, div, span, a, button, code } from "/app.js";
import demo from "/framework/ext/demo/demo.js";

// history and reasons: doc/chrome-notes.md
import "/framework/ext/highlight/highlight.js";

View.stylesheet(import.meta, "chrome.css");

export { demo, code };

export function show_source(fn){ return code.js(String(fn)); }

export function child_label(parent, name){
	return parent.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
}

export function nav(root, here){
	const section = here.chain()[1];

	return div.c("chrome-nav", () => {
		a.c("chrome-brand", root.title).href(root.url);

		root.children.forEach((child, name) => {
			a.c("chrome-nav-link", child_label(root, name)).href(root.url + name + "/");

			if (child && child === section)
				child.children.forEach((_, sub) =>
					a.c("chrome-nav-link chrome-nav-sub", child_label(child, sub))
						.href(child.url + sub + "/"));
		});
	});
}

export function crumbs(page, max = 0){
	const chain = page.chain();
	const shown = max && chain.length > max ? [chain[0], null, ...chain.slice(-2)] : chain;

	return div.c("chrome-crumbs", () => shown.forEach(pg =>
		pg ? a.c("chrome-crumb", pg.title).href(pg.url) : span.c("chrome-crumb-gap", "…")));
}

export function topbar(page){
	const parent = page.parent;

	return div.c("chrome-topbar", () => {
		span.c("chrome-topbar-title", page.title);

		if (parent)
			div.c("chrome-topbar-sibs", () => parent.children.forEach((_, name) =>
				a.c("chrome-tab", child_label(parent, name)).href(parent.url + name + "/")));
	});
}

export function prev_next(page){
	const parent = page.parent;
	if (!parent) return div.c("chrome-steps");

	const names = [...parent.children.keys()];
	const at = names.indexOf(page.name);

	const step = (i, dir) => names[i] &&
		a.c("chrome-step " + dir, child_label(parent, names[i])).href(parent.url + names[i] + "/");

	return div.c("chrome-steps", () => {
		div.c("chrome-steps-prev", () => { step(at - 1, "prev") || up(parent); });
		div.c("chrome-steps-next", () => { step(at + 1, "next"); });
	});
}

export function up(parent){
	return a.c("chrome-step up", "↑ " + parent.title).href(parent.url);
}

export function jump_list(root){
	const list = [];

	const walk = page => page.children.forEach((child, name) => {
		list.push({ url: page.url + name + "/", label: child_label(page, name), loaded: !!child });
		if (child) walk(child);
	});

	walk(root);
	return list;
}

export function widths($stage, sizes = "1400px 900px 500px auto"){
	const $row = div.c("chrome-widths");

	$row.append(() => sizes.trim().split(/\s+/).forEach(w => {
		const $btn = button.c("chrome-btn", w).ac(w === "auto" && "on");

		$btn.click(() => {
			$stage.style("max-width", w === "auto" ? "" : w);
			$row.el.querySelectorAll(".chrome-btn").forEach(b => b.classList.toggle("on", b === $btn.el));
		});
	}));

	return $row;
}

export class ChromeShell extends View {

	render(){
		this.builds = (this.builds ?? 0) + 1;
		this.navigations = 0;

		this.chrome?.(this);

		this.$pages = div.c("chrome-shell-pages");
		if (this.$region) this.$region.append(this.$pages);

		this.go(this.start ?? this.root.url);
	}

	initialize(){
		super.initialize();

		this.click(e => {
			const link = e.target.closest?.("a[href]");
			if (!link || !this.el.contains(link)) return;
			e.preventDefault();
			this.go(new URL(link.href).pathname);
		});
	}

	async go(url){
		let page = this.root;

		for (const name of url.split("/").filter(Boolean))
			page = await page.child(name);

		if (page) this.show(page);
	}

	show(page){
		this.page = page;
		this.navigations++;

		this.$pages.empty(() => {
			div.c("chrome-shell-url", page.url);
			div.c("chrome-shell-title", page.title);
			if (typeof page.content === "string") div.c("chrome-shell-body", page.content);

			if (page.children.size)
				div.c("chrome-shell-kids", () => page.children.forEach((_, name) =>
					a.c("chrome-step", child_label(page, name)).href(page.url + name + "/")));
		});

		this.mark();
		this.navigated?.(this);
		return this;
	}

	mark(){
		const here = this.page.url;

		this.el.querySelectorAll("a[href]").forEach(link => {
			link.classList.toggle("chrome-active", link.pathname === here);
			link.classList.toggle("chrome-in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		});
	}
}

export function sample(){
	const root = new Page({
		url: "/", title: "Home", content: "The sample tree's root.",
		labels: { api: "API" },
	});

	const guide = root.add("guide", { title: "Guide", content: "Three pages, then a long tail." });
	guide.add("install", { title: "Install", content: "Sibling one." });
	const config = guide.add("config", { title: "Config", content: "Sibling two." });
	guide.add("deploy", { title: "Deploy", content: "Sibling three." });

	config.add("env", { title: "Environment" })
		.add("secrets", { title: "Secrets" })
		.add("rotation", { title: "Rotation", content: "Depth 6: /guide/config/env/secrets/rotation/" });

	const api = root.add("api", { title: "API", content: "A second section, three siblings." });
	api.add("view", { title: "View", content: "…" });
	api.add("page", { title: "Page", content: "…" });
	api.add("router", { title: "Router", content: "…" });

	root.add("changelog", { title: "Changelog", content: "A leaf at the top level." });

	return root;
}
