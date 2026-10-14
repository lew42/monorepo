import { Page, View, div } from "/app.js";

View.stylesheet(import.meta, "CatalogPage.css");

// The catalog: every page with a UI as a live preview card, then the class cards.
// Data is catalog.jsonl, computed by build.mjs from the page tree (doc/readme.md); nothing here is hand-listed.
export default class CatalogPage extends Page {
	static FEATURED = ["Refine", "Dictate", "System"];
	static GROUPS = { core: "Core", ext: "Ext", ux: "UX", ui: "UI", code: "Code", lab: "Lab", library: "Library", design: "Design", styles: "Styles" };

	constructor(...args){
		super({
			title: "Catalog",
			description: "Everything built with a UI, previewed. Click a card for its full demo page.",
			icon: "grid_view",
			width: "wide",   // a wall of cards: every pixel the middle has (at 1920 the default measure left 70% of the screen empty)
		}, ...args);
	}

	// node("h2", "text", "class", [children]) — plain DOM, built synchronously
	node(tag, text, cls, kids = []){
		const e = document.createElement(tag);
		if (text) e.textContent = text;
		if (cls) e.className = cls;
		e.append(...kids);
		return e;
	}

	anchor(href, cls, kids){
		const a = this.node("a", "", cls, kids);
		a.href = href;
		return a;
	}

	glyph(name){ return this.node("span", name || "data_object", "material-icons cat-icon"); }

	async content(){
		const $root = div.c("cat wide"), root = $root.el;   // captured before the await
		const text = await fetch(new URL("catalog.jsonl", import.meta.url)).then(r => r.text());
		const rows = text.split("\n").filter(Boolean).map(l => JSON.parse(l));
		const pages = rows.filter(r => r.kind === "page"), classes = rows.filter(r => r.kind === "class");
		const fresh = pages.filter(p => p.isNew).length;

		root.append(
			this.node("p", `${pages.length} pages with a demo, ${fresh} landed since 2026-10-01 (marked NEW, probably not seen yet). A card's preview is the live page; click it to open the full demo.`, "cat-lede"),
			this.new_section(pages), this.instance_tree(), this.class_section(classes, pages), ...this.page_sections(pages),
		);
		this.watch_previews(root);
	}

	// What the owner has probably not seen goes first, so the first screen is previews (they appear again in their group below).
	new_section(pages){
		const list = pages.filter(p => p.isNew).sort((a, b) => a.title.localeCompare(b.title));
		return this.node("section", "", "cat-section", [
			this.node("h2", `New since 2026-10-01 (${list.length})`),
			this.node("div", "", "cat-grid", list.map(p => this.page_card(p))),
		]);
	}

	// The live instance hierarchy the owner asked for: it exists.
	instance_tree(){
		return this.node("section", "", "cat-section", [
			this.node("h2", "Live instance hierarchy"),
			this.node("p", "This is it: the running App and its pages drawn as a live tree (class, title, children, the page you are on). Add a page and it appears, no reload. The same tree is a toggle in the dev bar's page tab.", "cat-note"),
			this.node("p", "", "cat-links", [
				this.anchor("/framework/ux/Content/Object/instance-tree/", "cat-pill", [this.glyph("account_tree"), "InstanceTree, the live tree"]),
				this.anchor("/framework/ux/Content/Object/page/", "cat-pill", [this.glyph("account_tree"), "The Page object, live"]),
				this.anchor("/framework/ux/Content/Object/app/", "cat-pill", [this.glyph("account_tree"), "The App object, live"]),
				this.anchor("/framework/ux/Content/Object/", "cat-pill", [this.glyph("data_object"), "How it works (object, view, inspect)"]),
			]),
		]);
	}

	class_section(classes, pages){
		const featured = this.constructor.FEATURED.map(n => classes.find(c => c.name === n) || this.page_as_class(pages.find(p => p.name === n))).filter(Boolean);
		const rest = classes.filter(c => !featured.includes(c)).sort((a, b) => (b.api - a.api) || a.name.localeCompare(b.name));
		const grid = (list, f) => this.node("div", "", "cat-grid cat-classes", list.map(c => this.class_card(c, f)));
		const documented = rest.filter(c => c.api), others = rest.filter(c => !c.api);
		return this.node("section", "", "cat-section", [
			this.node("h2", `Class cards (${featured.length + rest.length})`),
			this.node("p", "Icon, name, what it extends and its first methods. A gold edge marks a class that documents its own API (static api); the first three are the ones asked for.", "cat-note"),
			grid(featured, true), grid(documented),
			this.node("details", "", "cat-more", [this.node("summary", `${others.length} more classes`), grid(others)]),
		]);
	}

	page_as_class(p){ return p && { name: p.name, url: p.url, icon: p.icon, extends: "", methods: [], api: false }; }

	class_card(c, featured){
		return this.anchor(c.url, `cat-class${c.api ? " has-api" : ""}${featured ? " featured" : ""}`, [
			this.glyph(c.icon),
			this.node("strong", c.name),
			this.node("small", c.extends ? `extends ${c.extends}` : c.group || "", "cat-ext"),
			this.node("code", c.methods?.join(" · ") || "", "cat-methods"),
		]);
	}

	page_sections(pages){
		return Object.entries(this.constructor.GROUPS).map(([g, label]) => {
			const list = pages.filter(p => p.group === g).sort((a, b) => (b.isNew - a.isNew) || a.title.localeCompare(b.title));
			if (!list.length) return null;
			return this.node("section", "", "cat-section", [
				this.node("h2", `${label} (${list.length})`),
				this.node("div", "", "cat-grid", list.map(p => this.page_card(p))),
			]);
		}).filter(Boolean);
	}

	page_card(p){
		const frame = this.node("div", "", "cat-frame");
		if (this.constructor.NO_PREVIEW.includes(p.url)) frame.append(this.node("span", "runs a benchmark: open it to see", "cat-nopreview"));
		else frame.dataset.src = p.url;
		return this.anchor(p.url, `cat-card${p.isNew ? " is-new" : ""}`, [
			frame,
			this.node("div", "", "cat-label", [
				this.glyph(p.icon),
				this.node("strong", p.title),
				p.isNew ? this.node("span", "NEW", "cat-badge") : "",
			]),
			this.node("small", p.desc, "cat-desc"),
		]);
	}

	// An iframe is made only when its card scrolls near the screen, so 200+ cards cost nothing until seen.
	// Each preview boots the whole app, so at most LOADING load at once, in screen order (doc/next.md has the numbers).
	static LOADING = 4;
	// Pages that hold the main thread on load (a benchmark). Same-origin previews share this tab's thread, so one froze the whole catalog.
	static NO_PREVIEW = ["/framework/code/performance/bench/"];

	watch_previews(root){
		if (window.top !== window) return;   // inside a preview: no previews of previews (the catalog is a card in itself; nesting crashed the tab)
		const queue = [];
		let busy = 0;
		const next = () => {
			while (busy < this.constructor.LOADING && queue.length){
				const frame = queue.shift();
				if (!frame.isConnected) continue;
				busy++;
				const f = document.createElement("iframe");
				let done = false;
				const free = () => { if (done) return; done = true; busy--; next(); };
				f.addEventListener("load", free);
				setTimeout(free, 4000);   // a slow page never holds the queue
				f.src = frame.dataset.src;
				f.style.scale = String(frame.clientWidth / 1200);
				f.tabIndex = -1;
				f.setAttribute("aria-hidden", "true");
				frame.append(f);
			}
		};
		const io = new IntersectionObserver(entries => {
			entries.filter(e => e.isIntersecting)
				.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
				.forEach(e => { io.unobserve(e.target); queue.push(e.target); });
			next();
		}, { rootMargin: "200px" });
		root.querySelectorAll(".cat-frame[data-src]").forEach(el => io.observe(el));
	}
}
