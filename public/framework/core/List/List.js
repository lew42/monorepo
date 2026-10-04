// The ordered collection — EVERY List announces its own changes (Events built in;
// there is no separate "LiveList" any more, per the owner 2026-10-02: "scrap LiveList
// everywhere… List itself gets Events built in. 'A list' now means an evented list").
// Composed onto an Item as a named property (`item.content`, `page.pages`) — never
// inherited BY the Item that holds it (Item itself stays free of add/remove/move/
// order/find). Every verb is by ID, never an index, so a line survives the list
// changing shape around it.
//
// `List extends Item` (2026-10-03, the owner asked; vscode-mastermind decided): a
// List IS a named, evented, saved collection in its own right — it gets an id, an
// optional title/icon, a View, and saving through whichever Store its nearest
// Item-with-a-store owns, all for free. `list.set({"add": {...}})` now works under
// Item's own `apply()` rule with no special case AT ALL (a verb is just a method
// name) — this file used to carry its own `set()` to do exactly that; it's gone.
// `remove(id)` keeps ITS OWN meaning here — "remove a child" — distinct from
// Item's zero-arg `remove()` ("remove ME from whoever holds me"); Lists don't use
// that one.
//
// ⚠ The import below is one-way ON PURPOSE: List.js imports Item.js (needed for
// `extends Item`), so Item.js must NEVER import List.js back — `class List extends
// Item` needs the real Item class already fully defined, and a circular import
// would hand it the TDZ instead ("Cannot access 'Item' before initialization",
// the exact failure core/Page/settings/settings.js's own readme already names for
// a different cycle, 2026-09-29). Item.js checks "is this a List?" by duck type
// instead (`Array.isArray(node.items) && typeof node.find === "function"`), and
// creates one through `Item.makeList`, a hook THIS file fills in below.
import Item from "../Item/Item.js";

const is_plain = value => !!value && typeof value === "object" && value.constructor === Object;

// Would `node.get(id)` answer something OTHER than a list-scan — i.e. would an
// id of `id` be permanently unreachable by name? A real OWN property (a List
// given directly, `data`, an already-set field like `page.background`) counts;
// so does a real ACCESSOR anywhere up the prototype chain (`define_fields()`'s
// `title`/`icon`/`description`, Page's own `pages`/`children`/`view`…). An
// ordinary METHOD does not — `set_one()` (Item.js) already calls a method
// before it ever asks `get()` anything, for ANY key, so a method-named id was
// never going to be ambiguous in the first place. Without this distinction,
// EVERY child id that happened to spell one of Page's ~70-odd method names
// (`crumbs`, `words`, `root`, `on`, `save`…) got silently refused — found
// crawling the real site, 2026-10-03.
function shadows_name(node, id){
	if (node == null) return false;
	if (Object.prototype.hasOwnProperty.call(node, id)) return true;

	for (let proto = Object.getPrototypeOf(node); proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)){
		const desc = Object.getOwnPropertyDescriptor(proto, id);
		if (desc && (desc.get || desc.set)) return true;
	}
	return false;
}

export class List extends Item {

	constructor(...args){
		super(...args);
		this.items ??= [];
	}

	get length(){ return this.items.length; }
	[Symbol.iterator](){ return this.items[Symbol.iterator](); }

	forEach(fn){ this.items.forEach(fn); return this; }
	map(fn){ return this.items.map(fn); }
	at(i){ return this.items.at(i); }

	// Back-compat aliases for the pre-rename names — several callers outside this
	// task's fence still use them; renaming them too is out of fence here.
	each(fn){ return this.forEach(fn); }
	get children(){ return this.items; }

	// Events bubbles through `.parent` — a List's parent IS the Item that holds it.
	get parent(){ return this.owner; }

	// The owner is the Item that holds this list, so a child's parent is that Item and
	// never the list itself. A list with no owner parents to itself.
	adopt(child){
		child.parent = this.owner ?? this;
		return child;
	}

	append(child){
		this.adopt(child);
		this.items.push(child);
		return this;
	}

	// `ref` null, or absent from this list, appends — a position, never an index.
	insert_before(child, ref = null){
		this.adopt(child);
		const i = ref ? this.items.indexOf(ref) : -1;
		i === -1 ? this.items.push(child) : this.items.splice(i, 0, child);
		return this;
	}

	// The raw splice-out, no announcement — release()/move() build on this.
	take(child){
		const i = this.items.indexOf(child);
		if (i === -1) return this;
		this.items.splice(i, 1);
		if (child.parent === (this.owner ?? this)) delete child.parent;
		return this;
	}

	index_of(child){ return this.items.indexOf(child); }

	// Which value names a member. The default is an id; Page keys its sub-pages by
	// name instead — set as an instance option (`new List({ key: x => x.name })`).
	key(x){ return x?.id; }

	// By ID, never an index.
	find(id){ return this.items.find(x => this.key(x) === id); }

	// A plain object becomes a real member through `of` — the class this list holds.
	// Set on the prototype at the bottom of this file now that List can just say
	// `Item` directly (it already imports it for `extends`).
	make(x){ return is_plain(x) ? (this.of ? this.of.hydrate(x) : x) : x; }

	// Every insertion and removal goes through these two hooks. No-ops here — Page
	// overrides them to keep its own name index in step with the array.
	adopted(x){}
	released(x){}

	// The id this member now sits after — null when it is first.
	after_of(x){
		const i = this.index_of(x);
		return i <= 0 ? null : this.key(this.items[i - 1]);
	}

	// `after` names where to land — `insert_before` takes the node to land BEFORE, so
	// an id has to resolve to its CURRENT next sibling. `null` = first. Absent, or an
	// id this list does not have, = append.
	ref_for(after){
		if (after === null) return this.items[0] ?? null;
		if (after === undefined) return null;

		const anchor = this.find(after);
		if (!anchor) return null;
		return this.items[this.index_of(anchor) + 1] ?? null;
	}

	// Quiet insert — loading a member is not a change. `add()` below is this plus the
	// announcement. An id already present is a no-op.
	//
	// (2026-10-03, id rules) An id is unique only among its SIBLINGS in this one
	// list, generated (`k2`, `a1`) and never changed — so two different lists can
	// reuse the same id with no clash. It may NOT equal a real property name on
	// this list or on whoever holds it (`title`, `pages`…): `get(name)` (Item.js)
	// checks properties first, so an id that shadowed one would be unreachable by
	// name forever. Refused, once per id, rather than silently inserted-but-dead.
	insert(x, { after } = {}){
		const made = this.make(x);
		const id = this.key(made);
		if (id != null){
			const had = this.find(id);
			if (had) return had;

			if (shadows_name(this, id) || shadows_name(this.owner, id)){
				warn(`insert(): "${id}" is already a property name on the list or its owner — refused`, `insert:${id}`);
				return made;
			}
		}

		this.insert_before(made, this.ref_for(after));
		this.adopted(made);
		return made;
	}

	// Quiet swap — `old` leaves, `x` takes its exact slot. Never emits.
	replace(old, x){
		const made = this.make(x);
		const i = this.index_of(old);
		if (i === -1) return this.insert(made);

		this.items[i] = made;
		this.adopt(made);
		this.released(old);
		this.adopted(made);
		return made;
	}

	announce(verb, payload){
		const line = { [verb]: payload };
		this.emit(verb, line);
		this.emit("delta", line, this);
		return line;
	}

	// `after` can arrive two ways: the live two-argument form (`list.add(x, {after})`)
	// or, on replay, inside `x` itself. The options form wins when both are given.
	add(x, opts = {}){
		const after = "after" in opts ? opts.after : (is_plain(x) ? x.after : undefined);
		const before = this.length;
		const made = this.insert(x, { after });
		if (this.length === before) return made;   // already here — idempotent

		const type = made?.wire ? made.wire() : undefined;
		this.announce("add", {
			id: this.key(made),
			...(type && type !== "Item" ? { type } : {}),
			after: this.after_of(made),
			...(made?.data ?? {}),
		});
		return made;
	}

	// Quiet removal — the counterpart to insert()/replace(). `remove()` below is this
	// plus the announcement. Returns the removed member, or undefined.
	release(idOrX){
		const made = typeof idOrX === "object" && idOrX !== null ? idOrX : this.find(idOrX);
		if (!made || this.index_of(made) === -1) return undefined;

		this.take(made);
		this.released(made);
		return made;
	}

	remove(idOrX){
		const made = this.release(idOrX);
		if (!made) return this;

		this.announce("remove", this.key(made));
		return this;
	}

	/* Two forms, told apart by which option arrives. `before` (a member, or null) is
	   the node-relative drag form a Sortable calls; `after` (an id) is the line form
	   replay calls. `from` — the List the member is leaving, when it changes lists —
	   leaves it QUIETLY: the one event is this move, never a second remove. */
	move(idOrX, { after, before, from } = {}){
		if (is_plain(idOrX) && "after" in idOrX && !(from ?? this).items.includes(idOrX)){
			after = idOrX.after;
			if (typeof idOrX.from === "string"){
				let host = this.owner;
				while (host && !host.store && host.parent) host = host.parent;
				from = idOrX.from === "" ? host : host?.locate?.(idOrX.from);
			}
			idOrX = idOrX.id;
		}

		const source = from ?? this;
		const made = typeof idOrX === "object" && idOrX !== null ? idOrX : source.find(idOrX);
		if (!made) return this;

		if (source !== this){ source.take(made); source.released?.(made); }
		else this.take(made);

		this.insert_before(made, before !== undefined ? before : this.ref_for(after));
		this.adopted(made);

		this.announce("move", {
			id: this.key(made),
			after: this.after_of(made),
			...(source !== this ? { from: source } : {}),
		});
		return this;
	}

	/* One line for a whole reorder. `ids` wins for the members it names, in that
	   order; an id it never names keeps its place right after its OLD previous
	   neighbour (or first, if it had none). Unknown ids are dropped quietly. */
	order(ids){
		const key = x => this.key(x);
		const named = new Set(ids);
		const old = [...this.items];

		const result = ids.map(id => old.find(x => key(x) === id)).filter(Boolean);

		old.forEach((x, i) => {
			if (named.has(key(x))) return;
			const anchor = i > 0 ? key(old[i - 1]) : null;
			const at = anchor == null ? 0 : result.findIndex(y => key(y) === anchor) + 1;
			result.splice(at, 0, x);
		});

		this.items = result;
		this.announce("order", [...ids]);
		return this;
	}

	// No own `set()` any more (2026-10-03) — `List extends Item` now, and Item's
	// own `apply()` already does exactly this: a key naming a method (`add`,
	// `remove`, `move`, `order`) calls it; an array of such deltas applies in
	// order. One rule, not two.

	toJSON(){ return [...this.items]; }
}

const warn = (message, key = message) => {
	if (List.warned.has(key)) return;
	List.warned.add(key);
	console.warn(`List — ${message}`);
};
List.warned = new Set();

export default List;

// The default `of` for a bare `new List()` with no `of` of its own: a plain
// member becomes a real `Item`. And the hook `Item.hydrate()` calls to build a
// List for an array-valued key it finds in raw JSON — Item.js cannot reach this
// class directly (see the header comment), so it reaches through this instead.
List.prototype.of = Item;
Item.makeList = opts => new List(opts);
Item.register(List, "List");
