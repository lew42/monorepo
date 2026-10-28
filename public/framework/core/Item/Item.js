import Store from "./Store.js";
import { Events } from "../Events/Events.js";

const is_data = value => !!value && typeof value === "object" && !Array.isArray(value);
const is_plain = value => !!value && typeof value === "object" && value.constructor === Object;

// Walk prototype chain for collision detection: doc/item-notes.md
const find_descriptor = (proto, name) => {
	for (; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)){
		const descriptor = Object.getOwnPropertyDescriptor(proto, name);
		if (descriptor) return { proto, descriptor };
	}
	return null;
};
const skipped = key => key === "constructor" || key === "__proto__" || key.startsWith("_");

// Duck-typed list check: items array + find(): doc/item-notes.md
const is_list = node => !!node && Array.isArray(node.items) && typeof node.find === "function";

const building = new WeakSet();

// Can a key's value take the rest of a delta? (an Item or List; a Map has a set() too, but it is data)
const routes = node => !!node && typeof node.set === "function" && !(node instanceof Map);
// The saved shape of one Item (`toJSON()`): a registered type, an id, a data object, and nothing but lists beside them.
const is_envelope = value => is_plain(value) && typeof value.type === "string" && "id" in value && is_data(value.data) && !!Item.types.get(value.type)
	&& Object.keys(value).every(k => k === "type" || k === "id" || k === "data" || Array.isArray(value[k]));
// A cache kept on an instance: not enumerable, so lists(), toJSON() and Object.keys never see it.
const hide = (item, name, value) => Object.defineProperty(item, name, { value, writable: true, configurable: true, enumerable: false });   // Items inside their own constructor (see constructor())

// Architecture: composition not inheritance; doc/item-notes.md
export class Item extends Events(Object) {

	constructor(...args){
		super();
		// A field passed to the constructor goes straight into data: not an own property that would shadow its
		// accessor (a live rename never reached page.title, Stream.test.mjs), and not through set(), which would
		// record a line and emit an event for an object that is still being built (Page.set, Template.set).
		const bag = this.data = Object.create(null);
		this.build_assign(...args);
		if (this.data !== bag && is_data(this.data)) for (const k in bag) if (!(k in this.data)) this.data[k] = bag[k];   // {title, data} together: keep both
		// Null-prototype data bag: no collision with built-in names
		this.data = is_data(this.data) ? this.data : Object.create(null);
		this.id ??= this.constructor.new_id();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// assign() for an object still being built: its fields go straight into data, never through set(). A subclass that
	// assigns again after its own class fields exist (Page's constructor) calls this, not assign().
	build_assign(...args){ building.add(this); try { return this.assign(...args); } finally { building.delete(this); } }

	get_one(key){ return this.data[key]; }
	put(key, value){ this.data[key] = value; }

	// Static fields as accessors: doc/item-notes.md. ⚠ Collision detection at register time
	static define_fields(){
		for (const name of this.fields ?? []){
			const prior = find_descriptor(this.prototype, name);
			if (prior?.descriptor.get?.is_field_accessor) continue; // our own, from an earlier register() — idempotent
			if (prior){
				const owner = prior.proto.constructor?.name ?? "?";
				const kind = typeof prior.descriptor.value === "function" ? "method"
					: (prior.descriptor.get || prior.descriptor.set) ? "accessor"
					: "property";
				throw new Error(`Item.define_fields(): field "${name}" on ${this.name} collides with ${kind} ${owner}.${name} — a field may not shadow anything already on the prototype chain`);
			}
			const get = function(){ return this.get_one(name); };
			get.is_field_accessor = true;
			Object.defineProperty(this.prototype, name, {
				get,
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
					if (building.has(this)){ this.data[name] = value; return; }   // inside the constructor: data only, no set()
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

	// A button's verb (browser): run `this[verb](args)` now so the page redraws at once, but record the VERB —
	// `{start:{}}` — not the `set` lines it made, so the item tool's writer (Store.flush) saves it like an agent's call.
	// A verb that refused (warned, changed nothing) records nothing. `Store.muted` is what keeps the `set` lines out.
	act(verb, args){
		let changed = 0;
		const count = () => changed++;
		this.on("delta", count);
		Store.muted++;
		try { this[verb](args); } finally { Store.muted--; this.off("delta", count); }
		if (changed) this.emit("delta", { [verb]: args ?? {} }, this);
		return this;
	}

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
		// A dotted key is a path: `{"tasks.ui.tasks.c3": v}` is `{"tasks": {"ui.tasks.c3": v}}`, and the next level's own
		// set() takes the rest (ids-and-paths.md, DECIDED). A key that already names something here as it is wins.
		const dot = key.indexOf(".");
		if (dot > 0 && dot < key.length - 1 && !(key in this) && this.get_one(key) === undefined)
			return void this.set_one(key.slice(0, dot), { [key.slice(dot + 1)]: value });

		const here = this[key];
		if (typeof here === "function") return void here.call(this, value);

		const target = this.get(key);
		if (routes(target)) return void target.set(value);

		// An old line named a list member by its id alone (`{"c3":{…}}`, what Store.hops wrote before every hop named its
		// list): still replayed, from the first list that has it, as get() used to; new lines name the list.
		if (target === undefined){
			const kid = this.member(key);
			if (routes(kid)){ warn(`a line named the member "${key}" by its id alone (an old line): it now names its list, e.g. {"tasks":{"${key}":…}}`, "member-hop"); return void kid.set(value); }
		}

		const old = target;
		value = this.adopt_slot(key, value, old);
		this.put(key, value);
		if (old !== value){
			this.emit("change", key, value, old);
			this.emit("delta", { set: { [key]: value } }, this);
		}
	}

	/* An Item put in a property is ADOPTED: its parent is me and its slot is the property's name, so its own changes bubble
	   here and Store.hops writes them under that name ({"child":{"set":{…}}}), and a replay walks back into it. The line
	   that puts it is the saved shape (`{type, id, data}`), so on replay that shape is made an Item again (seat a, E7/E9).
	   A List is not adopted this way (its owner is fixed when it is made). */
	adopt_slot(key, value, old){
		if (old !== value && old instanceof Item && old.parent === this && old._slot === key){ delete old.parent; delete old._slot; }
		if (is_envelope(value)) value = Item.hydrate(value);
		if (value instanceof Item && !is_list(value) && value !== this){ value.parent = this; value._slot = key; }
		return value;
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

		// A dotted path: my get takes the first name, and what it finds takes the rest with its OWN get (a List looks
		// up its member; a subclass may look up its own way). ids-and-paths.md, DECIDED.
		const dot = typeof key === "string" ? key.indexOf(".") : -1;
		if (dot > 0){
			const next = this.get(key.slice(0, dot));
			return routes(next) && typeof next.get === "function" ? next.get(key.slice(dot + 1)) : undefined;
		}
		return undefined;
	}

	// A member of one of my lists, by id: the first list that has it. Only an old line's id-only hop needs this
	// (set_one above, the item tool's check); every new hop names its list, so get() no longer searches.
	member(id){
		for (const list of Object.values(this.lists())){
			const hit = list.find(id);
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
	// Cached: kept while I have the same own keys and each cached list is still mine under its name. A List made with me
	// as its owner clears it (List's `owner` setter). Returned as a fresh object each call, as before.
	lists(){
		const keys = Object.keys(this).length, had = this._lists;
		if (had && had.keys === keys && had.names.every(([k, list]) => this[k] === list && list.owner === this)) return Object.fromEntries(had.names);
		const found = {};
		for (const key in this) if (is_list(this[key]) && this[key].owner === this) found[key] = this[key];
		hide(this, "_lists", { keys, names: Object.entries(found) });
		return found;
	}

	walk(fn){
		fn(this);
		for (const list of Object.values(this.lists())) for (const kid of list) kid.walk?.(fn);
		return this;
	}

	// A DEEP search — every descendant, across every list, at every depth: the first one in walk order, me included.
	// Indexed once per change to any list (Item.generation), so a line that names no child costs a Map lookup, not a walk.
	find(id){
		let ix = this._deep;
		if (!ix || ix.gen !== Item.generation){
			ix = { gen: Item.generation, map: new Map() };
			this.walk(item => { if (!ix.map.has(item.id)) ix.map.set(item.id, item); });
			hide(this, "_deep", ix);
		}
		const hit = ix.map.get(id);
		if (hit === undefined || hit.id === id) return hit;
		this._deep = null;   // an id changed in place since: walk again
		return this.find(id);
	}

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

	// The methods and getters of this class that only READ. The item tool answers a delta whose keys are all queries (`{"cost":{}}`) and writes no line. A subclass lists its own.
	static queries = [];

	// What a caller may put in a delta for this class: {class, fields, methods:[{name, doc}], queries}; doc is "" here (the item tool fills it from source).
	static describe(){
		const methods = new Map(), fields = new Set(this.fields ?? []);
		for (let proto = this.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto))
			for (const name of Object.getOwnPropertyNames(proto)){
				if (name === "constructor" || name.startsWith("_") || methods.has(name)) continue;
				const d = Object.getOwnPropertyDescriptor(proto, name);
				if (d.get || d.set){ if (!d.get?.is_field_accessor) fields.add(name); continue; }
				if (typeof d.value === "function") methods.set(name, { name, doc: "" });
			}
		return { class: this.name, fields: [...fields], methods: [...methods.values()], queries: [...(this.queries ?? [])] };
	}

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

		const Class = raw.type ? Item.types.get(raw.type) : this;   // `this`: a list of Tasks (`of = Task`) makes an untyped member a Task
		if (raw.type && !Class) warn(`unknown type "${raw.type}" — preserved as Item`, raw.type);

		let id = raw.id;
		if (id && seen.has(id)){ warn(`duplicate id "${id}" — assigned a fresh one`); id = undefined; }
		if (id) seen.add(id);

		const data = {};
		const lists = {};
		for (const key in raw){
			if (key === "type" || key === "id" || key === "after") continue;
			if (key === "data"){ if (is_data(raw.data)) Object.assign(data, raw.data); else if (raw.data !== undefined) warn(`data must be an object`); continue; }
			if (Array.isArray(raw[key])){ if (Class?.plain_lists?.includes(key)) data[key] = raw[key]; else lists[key] = raw[key]; continue; }   // plain_lists: arrays of text or records that are data, not child Items (Prompt.raw)
			data[key] = raw[key];
		}

		const item = new (Class ?? Item)({ id, data, type: Class ? undefined : raw.type });

		for (const key in lists){
			if (!Item.makeList){ warn(`hydrate(): "${key}" is an array but List.js never loaded — kept as plain data`, "hydrate:nolist"); item.data[key] = lists[key]; continue; }

			item[key] = Item.makeList({ owner: item, name: key });
			const list = item[key];   // read back: a class with its own `paragraphs` setter keeps its own List subclass
			lists[key].forEach(kid => list.insert((list.of ?? Item).hydrate(kid, seen)));   // the list's own member class (Prompt.paragraphs holds Paragraphs)
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

	// Replay: ONE path for every Item, in node (`replay(lines)`) and in the browser (Store.read calls
	// `replay_line` per entry). A subclass overrides `replay_new` (what line 1 builds), `replay_line`
	// (its legacy line shapes) and `replay_end` (anything inferred once all lines are in).
	static replay_new(lines){ return new this(); }
	static replay(lines){
		const item = this.replay_new(lines);
		for (const line of lines) if (line && typeof line === "object") item.replay_line(line);
		item.replay_end?.();
		return item;
	}
	// `by` and `ts` are the writer's stamp on the line, not data: stripped here, the line's time held in `Item.clock` while
	// it applies (a Task stamps its verbs with it), for every Item. Before, a plain Item kept them as fields (seat a).
	replay_line(line){
		if (!is_plain(line) || !("by" in line || "ts" in line)) return this.set(line);
		const { by, ts, ...rest } = line, was = Item.clock;
		if (typeof ts === "string") Item.clock = ts;
		try { return this.set(rest); } finally { Item.clock = was; }
	}

	// The time of the line being replayed (null outside a replay). One clock for every Item: `Task.clock` reads and
	// writes this same value.
	static get clock(){ return Item._clock; }

	// A line's dotted keys, one level opened: `{"tasks.c3.tasks.d1": v}` -> `{"tasks": {"c3.tasks.d1": v}}` (each level's set()
	// opens the next). For a replay_line that reads its top-level keys itself (Task, Session) before any set() runs.
	static dots(line){
		if (!is_plain(line)) return line;
		let out = null;
		for (const key in line){
			const dot = key.indexOf(".");
			if (dot <= 0 || dot === key.length - 1) continue;
			out ??= { ...line };
			delete out[key];
			const head = key.slice(0, dot), rest = { [key.slice(dot + 1)]: line[key] };
			out[head] = is_plain(out[head]) ? { ...out[head], ...rest } : rest;
		}
		return out ?? line;
	}
	static set clock(at){ Item._clock = at; }

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
Item._clock = null;
Item.generation = 0;   // bumped by every List change: find()'s index is rebuilt only after one
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
