import List from "../List/List.js";
import Store from "./Store.js";
import { Events } from "../Events/Events.js";

const is_data = value => !!value && typeof value === "object" && !Array.isArray(value);
const is_plain = value => !!value && typeof value === "object" && value.constructor === Object;
const skipped = key => key === "constructor" || key === "__proto__" || key.startsWith("_");

/* An arbitrary THING: an id, an icon, a title, a data bag, one `set(delta)`, a
   place to save (`store`) and a place to be seen (`view`). No list methods at all —
   `Item` itself holds no children. Something that needs them gives ITSELF a named
   `List` property (`item.content = new List({ owner: this, name: "content" })`),
   the same way `page.pages` and `page.content` will (core/Page, next). This is
   composition, not inheritance, on purpose: Page already has about 70 methods of
   its own, several of which — `add`, `move`, `get`/`set` — would collide with the
   list API if Item inherited it instead of merely offering it as a property.

   `Item = Events(Object)`: `on` / `off` / `emit` come from the mixin (core/Events),
   not from here, so the exact same three methods work on a `List` too. */
export class Item extends Events(Object) {

	constructor(...args){
		super();
		this.assign(...args);
		this.data = is_data(this.data) ? this.data : {};
		this.id ??= this.constructor.new_id();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// Seams over `data` — Page overrides both to read and write the instance
	// directly instead, which is the one thing that makes `page.title` real.
	get(key){ return this.data[key]; }
	put(key, value){ this.data[key] = value; }

	// `set("k", v)` is sugar for `set({k: v})` — told apart by whether the first
	// argument is already a plain delta object.
	set(a, b){ return this.apply(is_plain(a) ? a : { [a]: b }); }

	// The one rule, key by key, IN KEY ORDER:
	//   1. `at` first, if present — route the REST of the delta to whatever it names.
	//   2. skip `constructor`, `__proto__`, anything starting `_` (never trust a line
	//      to reach into the prototype chain).
	//   3. a key naming a METHOD on me — call it with the value.
	//   4. a key whose CURRENT value has its own `set()` (and is not a Map) — a
	//      nested delta, handed to that value's own `set`.
	//   5. anything else is data: `put(key, value)`, and if it actually changed,
	//      `emit("change", …)` plus the one `emit("delta", …)` `Item.Store` listens for.
	apply(delta){
		if (!delta || typeof delta !== "object") return this;

		if ("at" in delta){
			const { at, ...rest } = delta;
			const target = this.locate(at);
			if (!target){ warn(`set(): no "at" target for "${at}" — line ignored`, `at:${at}`); return this; }
			target.set(rest);
			return this;
		}

		for (const key in delta){
			if (skipped(key)) continue;
			this.set_one(key, delta[key]);
		}
		return this;
	}

	set_one(key, value){
		const here = this[key];

		if (typeof here === "function") return void here.call(this, value);
		if (here && typeof here.set === "function" && !(here instanceof Map)) return void here.set(value);

		const old = this.get(key);
		this.put(key, value);
		if (old !== value){
			this.emit("change", key, value, old);
			this.emit("delta", { set: { [key]: value } }, this);
		}
	}

	/* Walks `/`-separated segments of `path`, starting from ME: a segment matches a
	   property holding an Item or a List (`"content"`), or — when the CURRENT
	   node is already a List — a member of it by id (`"abc"`). So
	   `"content/abc"` reads as "my `content` list, the member whose id is abc". An
	   unknown segment warns once and returns `undefined` — the caller (`apply()`
	   above) ignores the whole line rather than throwing. */
	locate(path){
		let node = this;
		for (const seg of String(path).split("/").filter(Boolean)){
			if (node instanceof List) node = node.find(seg);
			else if (node?.[seg] instanceof Item || node?.[seg] instanceof List) node = node[seg];
			else node = undefined;

			if (node === undefined){ warn(`locate(): unknown path segment "${seg}" in "${path}"`, path); return undefined; }
		}
		return node;
	}

	// Me, out of whichever of my parent's lists holds me. The zero-argument form is
	// the only one Item needs — removing a CHILD is a call on that specific list
	// (`parent.items.remove(kid.id)`), never on the parent Item.
	remove(){
		if (!this.parent) return this;
		for (const list of Object.values(this.parent.lists?.() ?? {}))
			if (list.index_of(this) !== -1){ list.remove(this.id); break; }
		return this;
	}

	root(){ let item = this; while (item.parent) item = item.parent; return item; }

	// Every List property I own, by name — the one seam `find`, `walk` and
	// `toJSON` all read, and the one Page will override (its sub-pages also live in
	// a plain name→page Map, for lookup by path segment, kept in step by `adopted`/
	// `released`).
	// ⚠ Only lists I OWN. A member of an ownerless list has that list as its
	// `parent`; counting it here made toJSON() loop forever (found by the
	// List replay example, 2026-10-02).
	lists(){
		const found = {};
		for (const key in this) if (this[key] instanceof List && this[key].owner === this) found[key] = this[key];
		return found;
	}

	walk(fn){
		fn(this);
		for (const list of Object.values(this.lists())) for (const kid of list) kid.walk?.(fn);
		return this;
	}

	// A DEEP search — every descendant, across every list, at every depth.
	find(id){ let hit; this.walk(item => { hit ??= item.id === id ? item : undefined; }); return hit; }

	// Strict descendants — `contains(this)` is false, so a drop-check still needs
	// `target !== this` beside it.
	contains(item){ for (let up = item?.parent; up; up = up.parent) if (up === this) return true; return false; }

	// The icon item: a tiny view of `get("icon")` + `get("title")`, built lazily and
	// swappable — Page assigns its OWN `view` directly, which is why this is a
	// getter/setter pair and not a plain lazy field. `static View` is wired in by
	// `view.js` (see the note at the bottom of this file) ONLY in a browser: the
	// real `core/View/View.js` touches `Element` at module load, which does not
	// exist in plain node, so this file never imports it at the top.
	get view(){
		if (this._view) return this._view;
		if (!this.constructor.View) return undefined;   // no DOM here (node), or not wired yet
		return this._view = new this.constructor.View({ item: this });
	}
	set view(v){ this._view = v; }

	// A child asking to save persists its DOCUMENT — delegation up, never a partial write.
	save(){ return this.saver ? this.saver.save(this) : this.parent ? this.parent.save() : Promise.resolve(false); }
	delete(){ return this.saver ? this.saver.delete(this) : this.parent ? this.parent.delete() : Promise.resolve(false); }

	// Instance properties (`parent`, `saver`, `store`, `_view`, `_on`) are never
	// emitted — only `data` and each named List, which is what makes a backref
	// impossible by construction; hydrate restores `parent` by adoption.
	toJSON(){
		const json = { type: this.wire(), id: this.id, data: this.data };
		for (const [name, list] of Object.entries(this.lists())) if (list.length) json[name] = [...list];
		return json;
	}

	wire(){ return this.type ?? Item.names.get(this.constructor) ?? this.constructor.name; }

	static new_id(){ return crypto.randomUUID(); }

	/* Tolerant of every malformed input: warn, keep the node, never throw. Reads
	   BOTH shapes a caller ever hands it:
	     - the whole-document envelope `{type, id, data, <listname>: [...]}` (what
	       `toJSON()` writes, nested `data`);
	     - a flat list-verb delta `{id, type?, after?, ...data}` (what an `"add"`
	       line carries, and what `List.make()` calls this with — plain fields
	       ARE the data, no nested `data` key at all).
	   `after` is positional metadata for the LIST, never data, and is dropped here
	   either way. Any OTHER key whose value is an array is a child list — hydrated
	   into a `List` of that same name (`"items"`, `"content"`, `"replies"`, …),
	   quietly (`list.insert`, never `list.add`): loading a document is not a change. */
	static hydrate(json, seen = new Set()){
		const raw = json && typeof json === "object" ? json : {};
		if (raw !== json) warn(`expected an object, got ${typeof json}`);

		const Class = raw.type ? Item.types.get(raw.type) : Item;
		if (raw.type && !Class) warn(`unknown type "${raw.type}" — preserved as Item`, raw.type);

		let id = raw.id;
		if (id && seen.has(id)){ warn(`duplicate id "${id}" — assigned a fresh one`); id = undefined; }
		if (id) seen.add(id);

		const data = {};
		const lists = {};
		for (const key in raw){
			if (key === "type" || key === "id" || key === "after") continue;
			if (key === "data"){ if (is_data(raw.data)) Object.assign(data, raw.data); else if (raw.data !== undefined) warn(`data must be an object`); continue; }
			if (Array.isArray(raw[key])){ lists[key] = raw[key]; continue; }
			data[key] = raw[key];
		}

		const item = new (Class ?? Item)({ id, data, type: Class ? undefined : raw.type });

		for (const key in lists){
			const list = item[key] = new List({ owner: item, name: key });
			lists[key].forEach(kid => list.insert(Item.hydrate(kid, seen)));
		}

		return item;
	}

	// ⚠ `names` is an inverse index rather than a static on the class: a static is
	// INHERITED, so an unregistered subclass would silently wear its parent's wire name.
	static register(Class, name = Class.name){
		Item.types.set(name, Class);
		Item.names.set(Class, name);
		return Class;
	}

	// A string is a .jsonl url: one Store per file, opened, the host built from its
	// first line, attached. A Saver object keeps the existing whole-JSON path.
	static async open(src){
		if (typeof src !== "string"){
			const json = await src.load();
			return Item.hydrate(json ?? {}).assign({ saver: src });
		}

		const store = this.Store.for(src);
		await store.open();

		const [first, ...rest] = store.entries;
		const host = new this(first ?? {});
		store.entries = rest;
		store.attach(host);
		return host;
	}
}

const warn = (message, key = message) => {
	if (Item.warned.has(key)) return;
	Item.warned.add(key);
	console.warn(`Item — ${message}`);
};

Item.types = new Map();
Item.names = new Map();
Item.warned = new Set();
Item.Store = Store;

export default Item;

Item.register(Item);

// The default `of` for a bare `new List()` with no `of` of its own — set HERE,
// not inside List.js, so List never has to import Item back (which would be
// the exact import cycle this file avoids by never importing core/View/View.js).
List.prototype.of = Item;
