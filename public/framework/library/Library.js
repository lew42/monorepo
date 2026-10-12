import { Page, View, div, a, p } from "/app.js";
import Collection from "./Collection.js";
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

	// ui: the children of /framework/ui/ (mobile first, 400). figma: the rebuilt Figma pages (1920).
	static collections(){
		return this._collections ??= [
			new Collection({
				name: "ui", label: "ui", optimalWidth: 400, needs_parent_padding: true,
				base: key => `/framework/ui/${key}/`,
				load: async () => {
					const { default: ui, BANDS } = await import("/framework/ui/page.js");
					this._collections[0].bands = BANDS;
					const keys = [...ui.children.keys()].filter(key => !ui.constructor.SECTIONS?.includes(key));
					return Promise.all(keys.map(async key => [key, await ui.child(key)]));
				},
			}),
			new Collection({
				name: "figma", label: "figma", optimalWidth: 1920, draws_content: true,
				base: key => `/framework/ext/Figma/${key}/`,
				load: async () => Promise.all(this.FIGMA.map(async key =>
					[key, (await import(`/framework/ext/Figma/${key}/page.js`)).default])),
			}),
		];
	}

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

	href_for(path){ return `${location.pathname}?at=${path}`; }

	read(){ return new URLSearchParams(location.search).get("at") || Library.DEFAULT; }

	content(){
		p.c("muted", this.description);
		div.c("library bleed wide", () => {
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

	go(path){
		history.pushState(null, "", this.href_for(path));
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
		const [siblings, variants, related] = await Promise.all([item.siblings(), item.variants(), collection.related(item)]);
		if (epoch !== this.epoch) return;   // a newer click overtook this one

		this.collection_row(collection);
		this.rail.draw(this.$left_list, [{ title: item.parent ? `${item.parent.title} — siblings` : collection.label, items: siblings }], item);
		new Library.Stage({ library: this, item }).draw(this.$mid);
		this.rail.draw(this.$right, [{ title: "Variants", items: variants }, { title: "Related", items: related }], item);
		document.title = `${item.title} — Library`;
	}

	// The collection filter on top of the left column; the list below it is drawn by the Rail.
	collection_row(active){
		if (!this.$left_list){
			this.$left.append(() => {
				this.$chips = div.c("library-collections");
				this.$left_list = div.c("library-list");
			});
		}

		this.$chips.empty(() => Library.collections().forEach(one => {
			const $chip = a.c("library-chip", one.label).href(this.href_for(one.name));
			if (one === active) $chip.ac("on");
			$chip.on("click", event => { event.preventDefault(); this.go(one.name); });
		}));
	}
}
