// One thing to show: wraps a Page (a component page or a demo.page child) and never copies it.
// Variants are the page's own `children`. Docs: doc/decisions.md.
export default class LibraryItem {

	static CHROME = ["overview", "api", "doc", "files"];

	constructor({ collection, key, page, parent = null, base }){
		Object.assign(this, { collection, key, page, parent, base });
		this.path = (parent ? parent.path : collection.name) + "/" + key;
		this.cache = null;
	}

	get title(){ return this.page.title || this.key; }
	get icon(){ return this.page.icon; }
	get description(){ return this.page.description; }
	get href(){ return this.base; }   // the page's own url on the site
	get root(){ return this.parent ? this.parent.root : this; }
	get optimalWidth(){ return this.page.optimalWidth ?? this.page.data?.optimalWidth ?? this.collection.optimalWidth; }
	get needs_parent_padding(){ return this.page.needs_parent_padding ?? this.collection.needs_parent_padding; }
	get no_parent_padding(){ return this.page.no_parent_padding ?? this.collection.no_parent_padding; }
	get specimen(){ return this.page.specimen ?? this.page.data?.specimen ?? this.collection.specimen?.(this); }

	// The page's children as Items; lazy children resolve through page.child().
	async variants(){
		if (this.cache) return this.cache;

		const names = [...this.page.children.keys()].filter(name => !this.constructor.CHROME.includes(name));
		const pages = await Promise.all(names.map(name => this.page.child(name)));

		return this.cache = names
			.map((name, i) => pages[i] && new this.constructor({ collection: this.collection, key: name, page: pages[i], parent: this, base: this.base + name + "/" }))
			.filter(Boolean);
	}

	async siblings(){ return this.parent ? this.parent.variants() : this.collection.items(); }

	async find(segments){
		if (!segments.length) return this;
		const next = (await this.variants()).find(item => item.key === segments[0]);
		return next?.find(segments.slice(1));
	}

	// Draws the item into the current capture: its `specimen`, else the page's own content function (Figma), else its preview thumb at 100%.
	render(){
		const { specimen, page } = this;
		if (specimen) return specimen();

		const content = page.content?.value;
		if (this.collection.draws_content && typeof content === "function") return content.call(page);

		return this.thumb();
	}

	// The page's preview() thumb with its `zoom-*` class taken off, so it lays out at full size.
	thumb(){
		const nav = { url: this.href, label: this.title, icon: this.icon, description: this.description };
		const $card = this.page.preview(nav);
		const inner = $card.el.querySelector(".page-preview-thumb");
		const kids = inner ? [...inner.childNodes] : [$card.el];

		kids.forEach(node => node.nodeType === 1 && [node, ...node.querySelectorAll("[class*='zoom-']")]
			.forEach(el => [...el.classList].filter(c => /^zoom-\d+$/.test(c)).forEach(c => el.classList.remove(c))));

		if (inner) $card.el.replaceWith(...kids);
		return $card;
	}
}
