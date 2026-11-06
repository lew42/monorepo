import Item from "/framework/core/Item/Item.js";

/* page.ui — one door onto widget modules a page imports (idea 1: modules hold the code; idea 2: `page.ui`
 * reaches them and saves their state through the page's log). A widget module registers itself with
 * `PageUI.add(name, Class)` as it is imported: nothing is offered that nobody imported.
 *
 * `page.ui.get(name)` makes the ONE instance the first time it is touched, wired to the page that owns
 * `ui`, and emits "made" so the page can draw it. A name nobody registered answers undefined, as Item does.
 *
 * Must be an OWN property of the page (`this.ui = new PageUI({ page: this })`): `Item.get` only walks own
 * properties and data, never a prototype getter (core/Page/doc/namespaces.md; core/Item/Item.js:449), so a
 * delta `{"ui":{"tabs":{...}}}` walks page → ui → tabs, one `get()` per level. */
export default class PageUI extends Item {
	static types = new Map();   // widget name -> its class, filled by each module's own PageUI.add() as it imports

	static add(name, Class){ PageUI.types.set(name, Class); }

	constructor({ page, ...rest } = {}){
		super(rest);
		this.page = page;   // not data (never saved): the page a made widget is wired to
	}

	// The widget named `name`: made the first time (new Class({ id: name, page: this.page })), else the one already made.
	get(name){
		if (Object.prototype.hasOwnProperty.call(this, name)) return this[name];
		const Class = this.constructor.types.get(name);
		if (!Class) return super.get(name);
		const widget = new Class({ id: name, page: this.page });
		this[name] = widget;
		widget.parent = this;   // bubbles its deltas up through me to the page's own log (Item.js hops())
		this.emit("made", name, widget);
		return widget;
	}

	// Every widget actually made so far (not just registered) — what a page draws.
	made(){ return [...this.constructor.types.keys()].filter(name => Object.prototype.hasOwnProperty.call(this, name)).map(name => this[name]); }

	// `{"ui":{"tabs":{...}}}` routes straight to the named widget (making it if needed); an unregistered name is
	// ignored — ui holds no `data` of its own, so there is nowhere for Item's usual "store it anyway" fallback to
	// put it, and nothing is ever saved for a name nobody registered.
	apply(delta){
		if (Array.isArray(delta)){ for (const one of delta) this.apply(one); return this; }
		if (!delta || typeof delta !== "object") return this;
		for (const key in delta){
			if (key === "constructor" || key === "__proto__" || key.startsWith("_")) continue;
			this.get(key)?.set(delta[key]);
		}
		return this;
	}
}
