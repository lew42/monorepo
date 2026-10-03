import Store from "./Store.js";
import { Events } from "../Events/Events.js";

const is_data = value => !!value && typeof value === "object" && !Array.isArray(value);
const is_plain = value => !!value && typeof value === "object" && value.constructor === Object;
const skipped = key => key === "constructor" || key === "__proto__" || key.startsWith("_");

// A duck-typed "is this a List?" — NOT `instanceof List`, because this file must
// never import `../List/List.js` (2026-10-03, `List extends Item` now: List.js
// imports THIS file for `extends`, so the other direction would be a true cycle
// — `class List extends Item` needs Item fully defined, and importing it back
// from here would hand List.js the TDZ instead, mid-definition). Specific enough
// in practice: an ordered `items` array plus a by-id `find` is what a List IS.
const is_list = node => !!node && Array.isArray(node.items) && typeof node.find === "function";

/* An arbitrary THING: an id, an icon, a title, a data bag, one `set(delta)`, a
   place to save (`store`) and a place to be seen (`view`). No list methods at all —
   `Item` itself holds no children. Something that needs them gives ITSELF a named
   `List` property (`item.content = new List({ owner: this, name: "content" })`),
   the same way `page.pages` and `page.content` do (core/Page). This is
   composition, not inheritance, on purpose: Page already has about 70 methods of
   its own, several of which — `add`, `move`, `get`/`set` — would collide with the
   list API if Item inherited it instead of merely offering it as a property.
   (`List extends Item`, 2026-10-03 — a List IS an Item too, just never one Item
   HOLDS its lists by inheriting them.)

   `Item = Events(Object)`: `on` / `off` / `emit` come from the mixin (core/Events),
   not from here, so the exact same three methods work on a `List` too. */
export class Item extends Events(Object) {

	constructor(...args){
		super();
		this.assign(...args);
		// A null-prototype bag (2026-10-03, the owner: "ALL item values live in
		// `this.data`") — still plain enough for `JSON.stringify` (that only reads
		// own enumerable keys, never the prototype), but a data key named
		// `constructor` or `toString` can never shadow a real built-in by accident.
		// The instance's OWN namespace is reserved for built-ins instead: id,
		// parent, store, the named Lists, the methods — never a value.
		this.data = is_data(this.data) ? this.data : Object.create(null);
		this.id ??= this.constructor.new_id();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// The one-segment seam under `get(path)`/`put()` below — everything that
	// isn't a declared `fields` accessor (right below) ends up here, in `data`.
	get_one(key){ return this.data[key]; }
	put(key, value){ this.data[key] = value; }

	/* `static fields = ["title", "icon", "description"]` (2026-10-03, the owner):
	   one convenience, not a new storage rule — the value still lives in `data`,
	   exactly like any other key. Each name just gets a REAL accessor on the
	   prototype, so `item.title` keeps reading/writing exactly as before, but now
	   through `get_one`/`set` underneath, so `item.title = x` fires the same
	   `change`/`delta` events a jsonl `{"title": x}` line would. A name already
	   claimed by a real method or getter is left alone — the field list can be
	   generous without ever clobbering one. Called once per class, from
	   `register()` below (every registered class already goes through there). */
	static define_fields(){
		for (const name of this.fields ?? []){
			if (Object.getOwnPropertyDescriptor(this.prototype, name)) continue;
			Object.defineProperty(this.prototype, name, {
				get(){ return this.get_one(name); },
				// A plain DELTA OBJECT, never the two-arg `set(a, b)` sugar — Page
				// overrides `set(obj)` with a single-argument signature (every page
				// keeps its own jsonl housekeeping there), so `this.set(name, value)`
				// would hand it `value` as a second argument it has nowhere to put,
				// and `name` (a bare string) as `obj`, which breaks the very first
				// line inside: `"content" in obj` on a string throws. One shape every
				// override accepts instead.
				//
				// ⚠ `this.data` can be MISSING here: several classes (Layout, Section)
				// set their shared defaults with `Object.assign(Layout.prototype, {icon:
				// …})` — a plain value meant to live on the PROTOTYPE, read by every
				// instance that never sets its own. That assignment runs the setter
				// with `this` BEING THE PROTOTYPE, not a real constructed instance (no
				// `data` yet). Caught here and handled the way the caller meant it: a
				// plain OWN value, no event, no Store write — exactly what a bare `=`
				// used to do before this name became an accessor at all.
				set(value){
					if (!this.data){ Object.defineProperty(this, name, { value, writable: true, configurable: true, enumerable: true }); return; }
					this.set({ [name]: value });
				},
				configurable: true,
			});
		}
	}

	// `set("k", v)` is sugar for `set({k: v})` — told apart by whether the first
	// argument is already a plain delta (an object OR an array of them — see
	// `apply()` below).
	set(a, b){ return this.apply(Array.isArray(a) || is_plain(a) ? a : { [a]: b }); }

	// The one rule, key by key, IN KEY ORDER:
	//   1. skip `constructor`, `__proto__`, anything starting `_` (never trust a line
	//      to reach into the prototype chain).
	//   2. a key naming a METHOD on me — call it with the value.
	//   3. otherwise `get(key)` below resolves the ONE name — a property, then a
	//      child's id — and if what it finds has its own `set()` (and is not a
	//      Map), the value is a nested delta, handed to IT: `{"k2": {"answers":
	//      {"add": {...}}}}` walks one step per level, each level just this same
	//      rule again, never a path string.
	//   4. anything else is data: `put(key, value)`, and if it actually changed,
	//      `emit("change", …)` plus the one `emit("delta", …)` `Item.Store` listens for.
	// `delta` may be an ARRAY of these objects, applied in order — the way to call
	// the same method twice in one line.
	// (2026-10-03 — the owner: "drop the special `at` key"; a line used to read
	// `{"at": "k2/answers", "add": {...}}`, routing the REST of the delta to
	// whatever `at` named. The nesting itself is the path now. Old `at` lines
	// still replay for one release — see the compat branch below.)
	apply(delta){
		if (Array.isArray(delta)){ for (const one of delta) this.apply(one); return this; }
		if (!delta || typeof delta !== "object") return this;

		// ⚠ compat only, one release (2026-10-03 fold-away) — never WRITE this form
		// again, only read it: an old line routed the rest of its delta to whatever
		// `at` named (a `/`-separated path from `locate()` below).
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

		const target = this.get(key);
		if (target && typeof target.set === "function" && !(target instanceof Map)) return void target.set(value);

		const old = this.get(key);
		this.put(key, value);
		if (old !== value){
			this.emit("change", key, value, old);
			this.emit("delta", { set: { [key]: value } }, this);
		}
	}

	/* THE single resolver (2026-10-03): ONE name, not a path. The owner's order:
	   fields and data, then named Lists, then child ids.
	     1. a real OWN property (`Object.prototype.hasOwnProperty`) — a List
	        given to me directly, never through `data` (`item.content = new
	        List(...)`). NOT a `fields` accessor — those live on the PROTOTYPE,
	        one step below — and deliberately not ANY other prototype getter
	        either: a getter that itself called `get(sameName)` to read its own
	        backing value would recurse into itself forever (Task.js's own
	        `state` getter did, 2026-10-03, fixed by calling `get_one` instead).
	     2. `get_one(key)` — the data seam: a `fields` accessor's own backing
	        value, or anything else in `data` nobody gave its own accessor.
	     3. a child's id, searched across every List I own (`lists()` below) — so
	        `get("k2")` finds a sub-page or list member named "k2" without ever
	        naming WHICH list it lives in.
	   Used by `set_one()` above (so each level of a nested delta is just this
	   rule again), by the page tools, and by plain code (`app.get("k2")`). */
	get(key){
		if (Object.prototype.hasOwnProperty.call(this, key)) return this[key];

		const value = this.get_one(key);
		if (value !== undefined) return value;

		for (const list of Object.values(this.lists())){
			const hit = list.find(key);
			if (hit !== undefined) return hit;
		}
		return undefined;
	}

	/* ⚠ Compat only (2026-10-03) — the OLD `/`-separated multi-hop path `at` used
	   to name, read for one release so an old jsonl line still replays. Walks
	   `/`-separated segments of `path`, starting from ME: a segment matches a
	   property holding an Item or a List, or — when the CURRENT node is already a
	   List — a member of it by id. Never write a new line in this shape; a fresh
	   nested delta (`get()` above) does not need it at all. */
	locate(path){
		let node = this;
		for (const seg of String(path).split("/").filter(Boolean)){
			if (is_list(node)) node = node.find(seg);
			else if (node?.[seg] instanceof Item || is_list(node?.[seg])) node = node[seg];
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
		for (const key in this) if (is_list(this[key]) && this[key].owner === this) found[key] = this[key];
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
			if (!Item.makeList){ warn(`hydrate(): "${key}" is an array but List.js never loaded — kept as plain data`, "hydrate:nolist"); item.data[key] = lists[key]; continue; }

			const list = item[key] = Item.makeList({ owner: item, name: key });
			lists[key].forEach(kid => list.insert(Item.hydrate(kid, seen)));
		}

		return item;
	}

	// ⚠ `names` is an inverse index rather than a static on the class: a static is
	// INHERITED, so an unregistered subclass would silently wear its parent's wire name.
	static register(Class, name = Class.name){
		Item.types.set(name, Class);
		Item.names.set(Class, name);
		Class.define_fields();
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

// Filled in by List.js once it loads (`Item.makeList = opts => new List(opts)`)
// — `hydrate()` below calls this, never `new List(...)` directly, because this
// file must hold no reference to List at all (the header comment says why).
// `null` until then; by the time any REAL array-valued JSON needs hydrating,
// something in that same import graph has already pulled List.js in (ESM
// evaluates every dependency before any module's own body runs).
Item.makeList = null;

export default Item;

Item.register(Item);
