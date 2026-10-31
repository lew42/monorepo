import Store from "./Store.js";
import Snapshot from "./Snapshot.js";
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

// Why a value cannot be written to a .jsonl line (a function, a DOM node, a cycle), found inside plain objects and arrays; null when it can.
// An Item or List carries its own saved shape (toJSON) and is not looked into. `path` is where in the value the problem is.
const unsavable = (value, path = "", seen = new Set()) => {
	if (typeof value === "function") return `a function${path}`;
	if (!value || typeof value !== "object") return null;
	if (typeof Node !== "undefined" && value instanceof Node || (typeof value.nodeType === "number" && typeof value.nodeName === "string")) return `a DOM node${path}`;
	if (!Array.isArray(value) && !is_plain(value) && value.constructor !== undefined) return null;   // Item, List, Date, Map...: their own shape
	if (seen.has(value)) return `a cycle (it contains itself)${path}`;
	seen.add(value);
	try {
		for (const key of Object.keys(value)){ const why = unsavable(value[key], `${path} at "${key}"`, seen); if (why) return why; }
	} finally { seen.delete(value); }
	return null;
};

const building = new WeakSet();   // Items inside their own constructor (see constructor())

// Can a key's value take the rest of a delta? (an Item or List; a Map has a set() too, but it is data)
const routes = node => !!node && typeof node.set === "function" && !(node instanceof Map);
// The saved shape of one Item (`toJSON()`): a registered type, an id, a data object, and nothing but lists beside them.
const is_envelope = value => is_plain(value) && typeof value.type === "string" && "id" in value && is_data(value.data) && !!Item.types.get(value.type)
	&& Object.keys(value).every(k => k === "type" || k === "id" || k === "data" || Array.isArray(value[k]));
// A cache kept on an instance: not enumerable, so lists(), toJSON() and Object.keys never see it.
const hide = (item, name, value) => Object.defineProperty(item, name, { value, writable: true, configurable: true, enumerable: false });

/* D17, property hooks: a method named `set_<key>` is the hook for the data key `<key>`. It is wrapped once per class (the first
   time an instance is made) so that calling it by hand and set() calling it do the same thing: run the hook, and if the hook put a
   different value in data, announce the change (delta, then change). `set_one` is Item's own method, never a hook. */
const hooked = new WeakSet();
const wrap_hooks = Class => {
	if (hooked.has(Class)) return;
	hooked.add(Class);
	for (let proto = Class.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)){
		if (hooked.has(proto)) continue;
		hooked.add(proto);
		for (const name of Object.getOwnPropertyNames(proto)){
			if (!name.startsWith("set_") || name.length <= 4 || name === "set_one") continue;
			const d = Object.getOwnPropertyDescriptor(proto, name), raw = d.value, key = name.slice(4);
			if (typeof raw !== "function" || raw.is_hook) continue;
			const hook = function(value){ return this.run_hook(key, raw, value); };
			hook.is_hook = true;
			Object.defineProperty(proto, name, { ...d, value: hook });
		}
	}
};

// Architecture: composition not inheritance; doc/item-notes.md
export class Item extends Events(Object) {

	constructor(...args){
		super();
		wrap_hooks(this.constructor);
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
	// A verb that refused (warned, changed nothing) records nothing. `Store.mute(this)` is what keeps the `set` lines out:
	// for this item, what sits under it, and the ancestors' own derived changes (an unrelated item's write during the verb is still saved).
	act(verb, args){
		let changed = 0;
		const count = () => changed++;
		this.on("delta", count);
		const above = Store.mute(this);
		try { this[verb](args); } finally { Store.unmute(this, above); this.off("delta", count); }
		if (changed) this.emit("delta", { [verb + (Store.marked_lines ? "()" : "")]: args ?? {} }, this);
		return this;
	}

	/* D14, a method saved as ONE call. The method wraps its body, so a caller never has to remember act():
	       sort_by(key){ return this.as_call("sort_by", [key], () => { …the work… }); }
	   While the body runs, saving is muted for this item and what sits under it (Store.mute); when it is done ONE line is saved,
	   `{"sort_by()": "title"}`: the call, with its argument as the line's value (any other argument list is wrapped, see call_value).
	   Only the OUTERMOST call saves: a call made inside the body (or inside any muted tree) just runs. While a line is replayed
	   nothing is saved either: the body runs and its changes come back by themselves. No change, no line. A body that throws
	   saves no line and the error goes on to the caller. act() keeps working beside it. Doc: core/Item/doc/call.md. */
	as_call(name, args, body){
		if (Store.muted_at(this) || Store.replay_depth > 0) return body();
		let changed = 0;
		const count = () => changed++;
		this.on("delta", count);
		const above = Store.mute(this);
		let result;
		try { result = body(); } finally { Store.unmute(this, above); this.off("delta", count); }
		if (changed) this.emit("delta", { [name + "()"]: Item.call_value(args) }, this);
		return result;
	}

	/* HOW AN ARGUMENT LIST IS SAVED IN A LINE, and read back (doc/call.md). Exactly one plain argument is the line's value as it is
	   (`{"sort_by()": "title"}`). Any other list goes in a small wrapper, so the method gets the same arguments on replay:
	       none           {"$args": []}
	       two            {"$args": [1, 2]}
	       a hole         {"$args": ["a", null, "c"], "$undefined": [1]}      (JSON has no undefined; the listed places are put back)
	   Trailing undefined arguments are dropped (a method sees "no argument" and "undefined" alike). One argument that is itself an
	   object with an `$args` key is wrapped too, so it is never mistaken for the wrapper. */
	static call_value(args){
		const list = [...args];
		while (list.length && list.at(-1) === undefined) list.pop();
		if (list.length === 1 && !(is_plain(list[0]) && "$args" in list[0])) return list[0];
		const holes = list.flatMap((arg, i) => arg === undefined ? [i] : []);
		return { $args: list.map(arg => arg === undefined ? null : arg), ...(holes.length ? { $undefined: holes } : {}) };
	}

	// The reverse: a line's value -> the list of arguments to call the method with. A value that is not the wrapper is the one argument.
	static call_args(value){
		if (!is_plain(value) || !Array.isArray(value.$args) || !Object.keys(value).every(key => key === "$args" || key === "$undefined")) return [value];
		const args = [...value.$args];
		for (const i of Array.isArray(value.$undefined) ? value.$undefined : []) if (i in args) args[i] = undefined;
		return args;
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
		// DEPRECATED (2026-10-28): use a nested delta (`get()` per level). Guide: /framework/core/Item/doc/item-notes.md. Remove when: the ~1,810 history `{"at":…}` lines are migrated by script, then delete this branch and `locate()`.
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
		// D13, the spelling says what a key does: `name()` calls the method, `#id` names a list item, a plain `name` is data (or a
		// step into a child). Never stored as data, whatever they name: a call with no method and a hop with no item are refused.
		if (key.length > 2 && key.endsWith("()")) return void this.call_marked(key, value);
		if (key.charCodeAt(0) === 35) return void this.hop_marked(key, value);

		// A dotted key is a path: `{"tasks.ui.tasks.c3": v}` is `{"tasks": {"ui.tasks.c3": v}}`, and the next level's own
		// set() takes the rest (ids-and-paths.md, DECIDED). A key that already names something here as it is wins.
		const dot = key.indexOf(".");
		if (dot > 0 && dot < key.length - 1 && !(key in this) && this.get_one(key) === undefined)
			return void this.set_one(key.slice(0, dot), { [key.slice(dot + 1)]: value });

		// An OLD line named a method bare (`{"start":{}}`): still called, until the old logs are migrated (Item.bare_calls = false
		// reads a bare name as data, the D13 rule, and lets a field be named like a method).
		const here = this[key];
		if (typeof here === "function" && Item.bare_calls) return void here.apply(this, Item.call_args(value));

		const target = this.get(key);
		if (routes(target)) return void target.set(value);

		// D17: the class's own hook for this key stores the value (put) and does whatever else it wants.
		const hook = this.hook_for(key);
		if (hook) return void hook.call(this, value);

		// An old line named a list member by its id alone (`{"c3":{…}}`, what Store.hops wrote before every hop named its
		// list): still replayed, from the first list that has it, as get() used to; new lines name the list. It warns only
		// when the list could have been named (a Page's `pages` cannot be yet, so the page tool's `{"<tab>":{…}}` is current).
		if (target === undefined){
			const [name, list] = Object.entries(this.lists()).find(([, l]) => l.find(key) !== undefined) ?? [];
			const kid = list?.find(key);
			if (routes(kid)){
				const named = [list.name, name].find(n => n && !skipped(n) && this.get(n) === list);
				// Counted always (Item.old_hops: "<list>.<id>" -> lines); warned in node only, where the item tool and the tests
				// run. In a browser it would be noise on every page: the page tool still documents `{"<card id>":{…}}` today.
				if (named && is_plain(value)){
					Item.old_hops.set(`${named}.${key}`, (Item.old_hops.get(`${named}.${key}`) ?? 0) + 1);
					if (typeof document === "undefined") warn(`a line named the member "${key}" by its id alone (an old line): it now names its list, {"${named}":{"${key}":…}}`, "member-hop");
				}
				return void kid.set(value);
			}
		}

		const refused = unsavable(value);
		if (refused){ warn(`set("${key}") refused: the value is ${refused}, which a saved line cannot hold`, `unsavable:${this.constructor.name}.${key}`); return; }

		const old = target;
		value = this.adopt_slot(key, value, old);
		this.put(key, value);
		if (old !== value){
			// The save comes first and does not wait for any view: a listener that throws (a view that broke) is reported and
			// skipped, so it can never stop the line from being written (item-core.test.mjs, 1a).
			this.emit("delta", { set: { [key]: value } }, this);
			this.emit_safely("change", key, value, old);
		}
	}

	// The hook (D17) for a data key: the wrapped `set_<key>` method, or null.
	hook_for(key){
		const hook = typeof key === "string" && key !== "one" ? this["set_" + key] : null;
		return typeof hook === "function" && hook.is_hook ? hook : null;
	}

	/* Runs a hook: `raw` is the class's own `set_<key>(value, old)`. It stores with this.put(key, value) (or keeps the value
	   elsewhere). When the stored value is different afterwards, the change is announced exactly as set() announces it: the
	   save (delta) first, then the view event (change). A hook that sets its own key again would loop for ever: warned, and the
	   value is simply stored. */
	run_hook(key, raw, value){
		if (!this._hooking) hide(this, "_hooking", new Set());
		const running = this._hooking;
		if (running.has(key)){
			warn(`set_${key}() set "${key}" again from inside itself — stored as it is, no second hook run`, `hook-loop:${this.constructor.name}.${key}`);
			this.put(key, value);
			return;
		}
		const old = this.get_one(key);
		running.add(key);
		let result;
		try { result = raw.call(this, value, old); } finally { running.delete(key); }
		const now = this.get_one(key);
		if (now !== old){
			this.emit("delta", { set: { [key]: now } }, this);
			this.emit_safely("change", key, now, old);
		}
		return result;
	}

	// A line's value for `key` when it is replayed (a Task or Session reads its own line shapes and stores fields itself): the
	// class's hook if it has one, else put(). Nothing is saved by a replay (Store.replay_depth), so only the hook's own work shows.
	take(key, value){
		const hook = this.hook_for(key);
		if (hook) hook.call(this, value);
		else this.put(key, value);
	}

	// `name()` in a line: call the method `name` with the value as its one argument, or with the list the `$args` wrapper holds (Item.call_value).
	call_marked(key, value){
		const name = key.slice(0, -2);
		if (skipped(name) || typeof this[name] !== "function"){
			warn(`a line called ${key}, but ${this.constructor.name} has no method ${name}() — that part of the line is ignored (a "()" name is never stored as data)`, `call:${this.constructor.name}.${name}`);
			return;
		}
		this[name](...Item.call_args(value));
	}

	// `#id` in a line: the list item with that id (one of my lists, or my own members when I am a List); the value goes to it.
	hop_marked(key, value){
		const kid = this.member(key.slice(1));
		if (!routes(kid)){
			warn(`a line named the list item ${key}, but ${this.constructor.name} "${this.id}" has no such item — that part of the line is ignored (a "#" name is never stored as data)`, `hop:${this.id}.${key}`);
			return;
		}
		kid.set(value);
	}

	// emit(), but a throwing listener is reported on console (naming the event and this item) instead of reaching the caller.
	emit_safely(event, ...args){
		try { this.emit(event, ...args); }
		catch (error){ console.error(`Item — a "${event}" listener threw on ${this.constructor.name} "${this.id}": ${error?.message ?? error}`, error); }
		return this;
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

		// A List made with me as its owner and `key` as its name, even one I keep behind a getter (List.named()).
		const list = this._named?.get(key);
		if (list && list.owner === this) return list;

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

	// DEPRECATED (2026-10-28): use a nested delta (`get()` per level). Guide: /framework/core/Item/doc/item-notes.md. Remove when: the ~1,810 history `{"at":…}` lines are migrated by script, then delete `locate()` and its List.move caller.
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

	/* THE one move (cross-review finding 5). `dest` a List: I move there, inside my file, and every Ref that named my old path
	   takes the new one (List.move, through Item.moving in Ref.js). `dest` {url, path}: another file. The file mover carries my
	   lines there (node: move_item in Servex/agents/page_tools.js, the handoff), and I stay here as a forward,
	   {moved_to: {url, path}}, which a Ref to my old place follows (Ref.settle) instead of showing "gone".
	   Answers the forward line it set ({moved_to}), or null for a move inside the file. */
	move_to(dest, opts = {}){
		if (is_list(dest)){
			const from = Object.values(this.parent?.lists?.() ?? {}).find(l => l.index_of(this) !== -1);
			dest.move(this, { ...opts, ...(from && from !== dest ? { from } : {}) });
			return null;
		}
		if (typeof dest?.url !== "string") throw new Error("move_to: give a List, or {url, path} for another file");
		const forward = { moved_to: { url: dest.url, path: dest.path ?? "" } };
		this.set(forward);
		return forward;
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

	// Every live view drawing me (ask 33): one item can show in two places at once, and a change reaches each.
	// The default view (ux/Content/Object/DefaultView.js) adds itself here and drops out once off the page.
	get views(){ return this._views ??= []; }
	set views(v){ this._views = v; }

	// A child asking to save persists its DOCUMENT — delegation up, never a partial write.
	// DEPRECATED (2026-10-28): use `item.store` (`Item.Store.for(url)`) for a delta log; whole-document storage is undecided, so `save()` stays the Saver-only door until then. Guide: /framework/ext/Saver/readme.md. Remove when: the 24 importing files of ext/Saver are moved to `item.store` or the Saver is renamed as the whole-document store.
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

	// One id maker (cross-review finding 3): every new Item gets a short id, whether a string add, an object add or a new Ref. Page keeps its own (a folder name).
	static new_id(){ return this.short_id(); }
	// The id a person or an agent makes (a click, an item-tool add): 8 random letters and digits, never a dot, and never
	// all digits (a number-like key would jump to the front of its object). Code-made structure keeps a fixed name instead.
	// core/Session/tasks/data-shapes/ids-and-paths.md §5.
	static short_id(n = 8){
		const abc = "abcdefghijklmnopqrstuvwxyz0123456789", bytes = crypto.getRandomValues(new Uint8Array(n));
		let id = abc[bytes[0] % 26];
		for (let i = 1; i < n; i++) id += abc[bytes[i] % 36];
		return id;
	}

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
	// The root is built the way Item.open builds it (root_from below): a plain Item IS its line 1 (id and fields), the other
	// lines replay onto it; a class with its own replay_new (Task, Session) builds from all the lines and replays them all.
	// `snapshot` (an optional second argument: a Snapshot, or {state, memory}) starts the item from that saved state, and `lines` are
	// then only the lines after it (the node twin of Item.open's snapshot load; Server/Snapshots.mjs verifies a snapshot with it).
	static replay(lines, snapshot){
		const { host, rest } = snapshot ? { host: this.from_snapshot(snapshot), rest: lines } : this.root_from(lines);
		Store.replay_depth++;   // a replay saves nothing, here as when a Store reads (as_call, Store.js)
		try {
			for (const line of rest) if (line && typeof line === "object") host.replay_line(line);
			host.replay_end?.();
		} finally { Store.replay_depth--; }
		return host;
	}
	// null when a snapshot of this item can be continued by replaying later lines; else the reason it cannot (Server/Snapshots.mjs refuses it).
	snapshot_unsafe(){ return null; }

	// An empty item of this class, restored from a snapshot (nothing is saved while it is built).
	static from_snapshot({ state, memory }){
		const host = new this();
		Store.replay_depth++;
		try { host.restore(state, memory); } finally { Store.replay_depth--; }
		return host;
	}

	/* Start this (empty) item from a snapshot's saved shape (doc/snapshots.md): its data, its lists of children, and the in-memory
	   fields toJSON leaves out (`memory`). Each `set_<key>` hook then runs ONCE for the key's saved value (D17), on this item and on
	   every item under it, which is what a replay of the lines would have ended up with. Nothing here is saved: callers hold
	   Store.replay_depth. A subclass with state of its own overrides this and calls super. */
	restore(state, memory = []){
		const built = this.constructor.hydrate(state, Snapshot.any_id);   // a twin built the ordinary way (a saved tree already has its ids; a Prompt's paragraphs are "a", "b" in every prompt); its parts are moved here
		this.id = built.id;
		Object.assign(this.data, built.data);
		for (const [name, list] of Object.entries(built.lists())){
			const mine = this.get(name) ?? (this[name] = Item.makeList({ owner: this, name }));
			for (const kid of [...list]) mine.insert(kid);
		}
		// A saved slot Item is `{type, id, data}` in the state; a full replay made it an Item held in that slot (adopt_slot), so do the same on every item.
		this.walk(item => { for (const key of Object.keys(item.data)) item.data[key] = item.adopt_slot(key, item.data[key]); });
		Snapshot.apply_memory(this, memory);
		this.walk(item => { for (const key of Object.keys(item.data)) if (item.hook_for(key)) item.take(key, item.data[key]); });
		return this;
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
	static set clock(at){ Item._clock = at; }

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

	// A line's top-level marks undone, for a replay_line that reads its keys by their bare names (Task, Session): `{"start()":{}}`
	// reads as `{"start":{}}` and `{"#c3":{…}}` as `{"c3":{…}}`. Both shapes of a line therefore read the same there.
	static unmark(line){
		if (!is_plain(line)) return line;
		let out = null;
		for (const key of Object.keys(line)){
			const bare = key.length > 2 && key.endsWith("()") ? key.slice(0, -2) : key.length > 1 && key.charCodeAt(0) === 35 ? key.slice(1) : null;
			if (bare === null) continue;
			out ??= { ...line };
			delete out[key];
			if (!(bare in out)) out[bare] = line[key];
		}
		return out ?? line;
	}

	// A string is a .jsonl url: one Store per file, opened, the host built from its
	// first line, attached. A Saver object keeps the existing whole-JSON path.
	static async open(src){
		// DEPRECATED (2026-10-28): use `Item.open(url)` (a .jsonl url, one Store per file); an object Saver is the whole-JSON path. Guide: /framework/ext/Saver/readme.md. Remove when: the 24 importing files of ext/Saver are moved to `item.store` or the Saver is renamed as the whole-document store.
		if (typeof src !== "string"){
			const json = await src.load();
			return Item.hydrate(json ?? {}).assign({ saver: src });
		}

		// One root per url: a second open() (from anywhere: a Ref, a task page) gets the same live object.
		const store = this.Store.for(src);
		if (store.host) return store.host;
		if (store.rooting) return store.rooting;
		// A snapshot (a state to start from, and where in the log it ends) is used only when nobody has opened this store yet: another
		// reader of the same Store expects every line (Store.use_snapshot).
		const rooting = store.rooting = (this.Store.snapshots ? store.use_snapshot() : Promise.resolve()).then(() => store.open()).then(() => {
			if (store.host) return store.host;   // attached by another reader while this one waited (Task.open_ref)
			const Class = this !== Item ? this : store.snapshot ? Item.types.get(store.snapshot.state.type) ?? Item : Item.class_for(store.entries);
			const { host, rest } = store.snapshot ? { host: new Class(), rest: store.entries } : Class.root_from(store.entries);
			store.entries = rest;
			store.attach(host);   // restores the snapshot first, when there is one, then replays the lines held
			host.replay_end?.();
			return host;
		});
		rooting.catch(() => { if (store.rooting === rooting) store.rooting = null; });   // a failed open is not cached: the next Item.open tries again
		return rooting;
	}

	// The class a file's root is, from its own lines (Item.open on a url nothing else names): line 1's registered `type` or
	// `class`; a session's record ({"session":…} line 1, or a spawn's {"assign":{session_id, agent}}) is a Session, any other
	// {"assign"} record a Task; else a plain Item.
	static class_for(entries){
		const first = entries[0] ?? {}, a = entries.find(e => e?.assign)?.assign;
		const named = Item.types.get(first.type ?? first.class);
		if (named) return named;
		if (first.session || (a && a.session_id && a.agent)) return Item.types.get("Session") ?? Item.types.get("Task") ?? Item;
		if (a) return Item.types.get("Task") ?? Item;
		return Item;
	}

	// The root a file's lines open as, and the lines still to replay onto it. An Item is line 1 itself (its fields), the
	// rest replayed; a class with its own replay_new (Task, Session) builds its root from all the lines and replays them all.
	static root_from(entries){
		if (this.replay_new !== Item.replay_new) return { host: this.replay_new(entries), rest: entries };
		const first = entries[0];
		// Line 1 is the item's own fields only when it carries the item's id (`{"id":"layer","x":24}`). A first line that is a change
		// (`{"cards":{"add":…}}`, a Dated index row) has no id: the item starts empty and every line replays, as Item.replay does.
		if (!(is_plain(first) && typeof first.id === "string")) return { host: new this(), rest: entries };
		const host = new this(first);
		for (const key of Object.keys(first)) if (key !== "id" && host.hook_for(key)) host.take(key, host.get_one(key));   // line 1's fields are a replayed line: their hooks run (the constructor cannot: the subclass is not built yet)
		return { host, rest: entries.slice(1) };
	}
}

const warn = (message, key = message) => {
	if (Item.warned.has(key)) return;
	Item.warned.add(key);
	console.warn(`Item — ${message}`);
};

Item.types = new Map();
Item._clock = null;
Item.bare_calls = true;   // D13: a bare key that names a method still calls it (old lines). false = a bare key is always data.
Item.old_hops = new Map();   // old id-only hops replayed, "<list>.<id>" -> count (set_one); the item tool can report them
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
