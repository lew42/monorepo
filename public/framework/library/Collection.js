import Item from "./Item.js";

// A category (ui, figma …): a name, a default width, and a loader that lists its top-level pages. Docs: doc/decisions.md.
export default class LibraryCollection {

	static MAX_RELATED = 6;

	constructor({ name, label = name, optimalWidth = 1000, needs_parent_padding = false, no_parent_padding = false, draws_content = false, bands = null, specimen = null, load, base }){
		Object.assign(this, { name, label, optimalWidth, needs_parent_padding, no_parent_padding, draws_content, bands, specimen, load, base });
		this._items = null;
	}

	// [[key, page]] from the loader, as Items. Cached: pages are modules and never change under us.
	async items(){
		this._items ??= (async () => (await this.load()).map(([key, page]) =>
			new Item({ collection: this, key, page, base: this.base(key) })))();
		return this._items;
	}

	// ["card", "media"] → the last link of the Item chain, or undefined.
	async find(segments){
		const first = (await this.items()).find(item => item.key === segments[0]);
		return first?.find(segments.slice(1));
	}

	// ui: same band as the item's top-level ancestor (ui/page.js BANDS), that ancestor left out. Every other collection: its siblings minus the item, at most MAX_RELATED.
	async related(item){
		if (!this.bands){
			const siblings = await item.siblings();
			return siblings.filter(one => one.path !== item.path).slice(0, this.constructor.MAX_RELATED);
		}
		const root = item.root, band = Object.values(this.bands).find(names => names.split(" ").includes(root.key));
		if (!band) return [];
		const keys = band.split(" ").filter(key => key !== root.key);
		return (await this.items()).filter(one => keys.includes(one.key));
	}
}
