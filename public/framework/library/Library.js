import { Page, View, div, a, p, img, button } from "/app.js";
import Collection from "./Collection.js";
import Entry from "./Entry.js";
import Item from "./Item.js";
import Rail from "./Rail.js";
import Stage from "./Stage.js";

View.stylesheet(import.meta, "library.css");

// The UI library: three columns (siblings · the chosen item at full size · its variants and related), one URL per view: ?at=ui/card/media.
// Docs: readme.md, doc/decisions.md, doc/tree.md.
export default class Library extends Page {

	static Collection = Collection;
	static Item = Item;
	static Rail = Rail;
	static Stage = Stage;

	static DEFAULT = "ui/card";
	static FIGMA = ["palette", "colors", "autolayout"];
	static TEMPLATES = [["BigCard", "/framework/core/Page/Template/BigCard/BigCard.js"]];
	static ORDER = ["ui", "ux", "sections", "layouts", "templates", "figma"];

	// ui · ux · sections · layouts · templates · figma. Each loader lists [key, page]; Entry stands in where the thing is not a Page.
	static collections(){
		return this._collections ??= this.ORDER.map(name => this.COLLECTIONS[name].call(this));
	}

	static COLLECTIONS = {
		ui(){
			const collection = new Collection({
				name: "ui", optimalWidth: 400, needs_parent_padding: true,
				base: key => `/framework/ui/${key}/`,
				load: async () => {
					const { default: ui, BANDS } = await import("/framework/ui/page.js");
					collection.bands = BANDS;
					const keys = [...ui.children.keys()].filter(key => !ui.constructor.SECTIONS?.includes(key));
					return Promise.all(keys.map(async key => [key, await ui.child(key)]));
				},
			});
			return collection;
		},

		ux(){
			return new Collection({
				name: "ux", optimalWidth: 1000,
				base: key => `/framework/ux/${key}/`,
				load: async () => {
					const { default: ux } = await import("/framework/ux/page.js");
					return Promise.all([...ux.children.keys()].map(async key => [key, await ux.child(key)]));
				},
			});
		},

		sections(){
			return new Collection({
				name: "sections", optimalWidth: 1920,
				base: key => `/framework/styles/sections/${key}/`,
				specimen: item => item.page.section && (() => item.page.section(item.page.tone)),
				no_parent_padding: true,
				load: async () => {
					const { default: sections } = await import("/framework/styles/sections/page.js");
					return Promise.all([...sections.children.keys()].map(async key => [key, await sections.child(key)]));
				},
			});
		},

		layouts(){
			return new Collection({
				name: "layouts", optimalWidth: 1920,
				base: key => `/framework/styles/layouts/catalog/#${key}`,
				load: async () => {
					const { default: LayoutCatalog } = await import("/framework/styles/layouts/catalog/LayoutCatalog.js");
					const shots = new URL("/framework/styles/layouts/catalog/shots/", location.href);
					return LayoutCatalog.entries.map(entry => [entry.name, new Entry({
						title: entry.title, icon: "view_quilt", description: entry.why, optimalWidth: 1920,
						specimen: () => div.c("flow", () => {
							img().attr("src", new URL(`${entry.name}.jpg`, shots).href).attr("alt", entry.title).style({ width: "100%", display: "block" });
							a.c("page-link", "Open the demo →").href(entry.demo);
						}),
					})]);
				},
			});
		},

		templates(){
			return new Collection({
				name: "templates", optimalWidth: 1000,
				base: () => "/framework/core/Page/Template/",
				load: async () => Promise.all(Library.TEMPLATES.map(async ([name, url]) => {
					const Template = (await import(url))[name];
					return [name, new Entry({ title: name, icon: "dashboard_customize", description: `A ${name} Template, one live instance.`,
						optimalWidth: 1000, specimen: () => div.c("card bleed", () => new Template().render()) })];
				})),
			});
		},

		figma(){
			return new Collection({
				name: "figma", optimalWidth: 1920, draws_content: true,
				base: key => `/framework/ext/Figma/${key}/`,
				load: async () => Promise.all(Library.FIGMA.map(async key =>
					[key, (await import(`/framework/ext/Figma/${key}/page.js`)).default])),
			});
		},
	};

	constructor(...args){
		super({
			title: "Library",
			icon: "collections_bookmark",
			description: "Everything we built, browsable: pick one on the left, see it at full size in the middle, its variants on the right.",
			width: "full",
		}, ...args);
		this.epoch = 0;
		this.rail = new Library.Rail({ library: this });
	}

	// view "" = browse (three columns), "wall" = the whole collection in one grid; default: keep the current one.
	href_for(path, view = this.view){ return `${location.pathname}?at=${path}${view ? "&view=" + view : ""}`; }

	get view(){ return new URLSearchParams(location.search).get("view") === "wall" ? "wall" : ""; }

	read(){ return new URLSearchParams(location.search).get("at") || Library.DEFAULT; }

	content(){
		p.c("muted", this.description);
		this.$top = div.c("library-top");
		this.$grid = div.c("library bleed wide", () => {
			this.$left = div.c("library-col library-left");
			this.$mid = div.c("library-col library-mid");
			this.$right = div.c("library-col library-right");
		});

		this.listen();
		this.show(this.read());
	}

	// One popstate listener for the page's life; it reads the url, so back and forward land where they were.
	listen(){
		if (this.listening) return;
		this.listening = true;
		addEventListener("popstate", () => this.$mid?.el.isConnected && this.show(this.read()));
	}

	go(path, view = this.view){
		history.pushState(null, "", this.href_for(path, view));
		this.show(path);
	}

	// "ui" → first item of ui; "ui/card/media" → that variant.
	async resolve(path){
		const [name, ...rest] = path.split("/").filter(Boolean);
		const collection = Library.collections().find(one => one.name === name) ?? Library.collections()[0];
		const items = await collection.items();
		const item = rest.length ? await collection.find(rest) : items[0];
		return { collection, item: item ?? items[0] };
	}

	async show(path){
		const epoch = ++this.epoch;
		const { collection, item } = await this.resolve(path);
		const wall = this.view === "wall";
		if (wall){
			const items = await collection.items();
			if (epoch !== this.epoch) return;
			this.collection_row(collection);
			this.$grid.el.classList.add("is-wall");
			this.rail.wall(this.$mid, items);
			document.title = `${collection.label} wall — Library`;
			return;
		}

		const [siblings, variants, related] = await Promise.all([item.siblings(), item.variants(), collection.related(item)]);
		if (epoch !== this.epoch) return;   // a newer click overtook this one

		this.$grid.el.classList.remove("is-wall");
		this.collection_row(collection);
		this.rail.draw(this.$left_list, [{ title: item.parent ? `${item.parent.title} — siblings` : collection.label, items: siblings }], item);
		new Library.Stage({ library: this, item }).draw(this.$mid);
		this.rail.draw(this.$right, [{ title: "Variants", items: variants }, { title: "Related", items: related }], item);
		document.title = `${item.title} — Library`;
	}

	// The collection filter and the wall / browse toggle, above the grid; the left list below is drawn by the Rail.
	collection_row(active){
		if (!this.$left_list) this.$left.append(() => { this.$left_list = div.c("library-list"); });

		this.$top.empty(() => {
			div.c("library-collections", () => Library.collections().forEach(one => {
				const $chip = a.c("library-chip", one.label).href(this.href_for(one.name));
				if (one === active) $chip.ac("on");
				$chip.on("click", event => { event.preventDefault(); this.go(one.name); });
			}));

			div.c("library-collections library-toggle", () => [["browse", ""], ["wall", "wall"]].forEach(([label, view]) => {
				const $chip = a.c("library-chip", label).href(this.href_for(active.name, view));
				if (view === this.view) $chip.ac("on");
				$chip.on("click", event => { event.preventDefault(); this.go(active.name, view); });
			}));
		});
	}
}
