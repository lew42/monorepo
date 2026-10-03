import List from "./List.js";
import { Events } from "../Events/Events.js";

const is_plain = value => !!value && typeof value === "object" && value.constructor === Object;
const skipped = key => key === "constructor" || key === "__proto__" || key.startsWith("_");

/* The ordered collection that ANNOUNCES every change. Composed onto an Item as a
   named property (`item.content`, `page.pages`) — never inherited, so the name you
   reach it by is always the name of what it holds. Every verb is by ID, never an
   index, so a line survives the list changing shape around it.

   Each change emits TWO things: its own verb (`"add"`, `"remove"`, `"move"`,
   `"order"`) with the line that change would save, and one uniform `"delta"` event
   — `emit("delta", line, this)` — that `Item.Store` is the one listener for. */
export class LiveList extends Events(List) {

	// Events bubbles through `.parent` — a LiveList's parent IS the Item that holds
	// it, so a change here is heard by that Item first and then by whatever holds it.
	get parent(){ return this.owner; }

	// Which value names a member. The default is an id; Page will key its sub-pages
	// by name instead — set as an instance option (`new LiveList({ key: x => x.name })`),
	// never by editing this method.
	key(x){ return x?.id; }

	// A plain object becomes a real member through `of` — the class this list holds.
	// Nothing HERE imports Item (that would be a cycle): Item.js sets
	// `LiveList.prototype.of = Item` once it exists, so a bare `new LiveList()` still
	// hydrates plain deltas with no import between the two files.
	make(x){ return is_plain(x) ? (this.of ? this.of.hydrate(x) : x) : x; }

	// Every insertion and removal goes through these two hooks. No-ops here — Page
	// overrides them to keep its own name index in step with the array.
	adopted(x){}
	released(x){}

	// The id this member now sits after — null when it is first. Always the REAL
	// neighbour, so a recorded `after` is exact even when the caller asked for a
	// position that has since moved.
	after_of(x){
		const i = this.index_of(x);
		return i <= 0 ? null : this.key(this.items[i - 1]);
	}

	// By ID, never an index — this is the one thing that makes `insert_before`'s
	// `ref` argument findable from a delta line. Shadows `List.prototype.find`,
	// which takes a predicate: that signature is still reachable as `this.items.find(fn)`
	// for the rare caller that wants it (none in this codebase do).
	find(id){ return this.items.find(x => this.key(x) === id); }

	// `after` names where to land — but `insert_before` takes the node to land
	// BEFORE, so an id has to resolve to its CURRENT next sibling, not to itself.
	// `null` = put it first (land before whatever is first today). Absent, or an id
	// this list does not have, = append (land before nothing — `insert_before`'s
	// own `null` convention).
	ref_for(after){
		if (after === null) return this.items[0] ?? null;
		if (after === undefined) return null;

		const anchor = this.find(after);
		if (!anchor) return null;
		return this.items[this.index_of(anchor) + 1] ?? null;
	}

	// Quiet insert — loading a member is not a change, so this never emits. `add()`
	// below is this plus the announcement. An id already present is a no-op: the
	// same `add` line replayed twice does nothing the second time.
	insert(x, { after } = {}){
		const made = this.make(x);
		const id = this.key(made);
		if (id != null){
			const had = this.find(id);
			if (had) return had;
		}

		this.insert_before(made, this.ref_for(after));
		this.adopted(made);
		return made;
	}

	// Quiet swap — `old` leaves, `x` takes its exact slot. Never emits: a replaced
	// stub (an unloaded sub-page becoming loaded) is not a structural change.
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
	// or, when replay dispatches a whole `{"add": {id, type?, after, ...data}}` line
	// in one call (`LiveList.set()`, below), inside `x` itself. The options form wins
	// when both are somehow given.
	add(x, opts = {}){
		const after = "after" in opts ? opts.after : (is_plain(x) ? x.after : undefined);
		const before = this.length;
		const made = this.insert(x, { after });
		if (this.length === before) return made;   // already here — idempotent, nothing to announce

		const type = made?.wire ? made.wire() : undefined;
		this.announce("add", {
			id: this.key(made),
			...(type && type !== "Item" ? { type } : {}),
			after: this.after_of(made),
			...(made?.data ?? {}),
		});
		return made;
	}

	// Quiet removal — the counterpart to insert()/replace(): unlinking a member that
	// was never a structural CHANGE worth a line (Page's `children` shim uses this
	// for `delete()`, since a plain Map never announced either). `remove()` below is
	// this plus the announcement. Returns the removed member, or undefined.
	release(idOrX){
		const made = typeof idOrX === "object" && idOrX !== null ? idOrX : this.find(idOrX);
		if (!made || this.index_of(made) === -1) return undefined;

		List.prototype.remove.call(this, made);
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
	   replay calls. `from` — the LiveList the member is leaving, when it changes
	   lists — leaves it QUIETLY: the one event is this move, never a second remove.
	   `from` is recorded as a live object here; `Item.Store` turns it into a path
	   when it writes the line, the same way it turns `this` into the `at` path. */
	move(idOrX, { after, before, from } = {}){
		// The line form: replay (`set()`, below) hands the whole saved payload
		// `{id, after, from?}` as one argument. Its `from` is a path from the Store's
		// host (core/Item/Store.js `line_for`), resolved back to the live list here.
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

		if (source !== this){ List.prototype.remove.call(source, made); source.released?.(made); }
		else List.prototype.remove.call(this, made);

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
	   neighbour (or first, if it had none) — so an item someone else added at the
	   same moment is never lost, even though this line never mentions it. Unknown
	   ids (named here but not actually in the list) are dropped quietly. */
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

	// A line whose key names one of my own verbs routes here — the nested-delta rule
	// in Item.set_one() reaches this for `{"content": {"add": {...}}}`.
	set(delta){
		for (const verb in delta){
			if (skipped(verb)) continue;
			if (typeof this[verb] === "function") this[verb](delta[verb]);
		}
		return this;
	}

	toJSON(){ return [...this.items]; }
}

export default LiveList;
