# List gets events; remove LiveList

Owner's design (`public/framework/ai/2026-09-30/proposal-flow/page-item-design.md`, "LATEST
… fifth pass"): **scrap `LiveList` everywhere.** `List` itself gets events built in — no
separate class. "A list" now means "an evented list."

Today `core/List/List.js` is a plain array (no events) and `core/List/LiveList.js` is
`class LiveList extends Events(List)` with the four verbs (`add remove move order`) plus
the quiet primitives (`insert replace release`). This task merges them into ONE class,
`List`, in `List.js`, and deletes `LiveList.js`. Every caller that imported `LiveList`
imports `List` instead.

**Why this is safe:** `audit/overview/priorities/page.js:59` already flagged
`List.find(fn)` (predicate, one-level) as having "no real callers — free to rename
today." The plain, event-less `List` has no production callers either (`Item` composes
a named `LiveList` property per instance; it never builds a bare `List`). So the merge
loses nothing — it only deletes a distinction nothing uses.

## Step 1 — the merge itself (minion A)

**Read only:** `core/List/List.js`, `core/List/LiveList.js`, `core/Events/Events.js`.

Replace the full contents of `core/List/List.js` with the file below, then **delete**
`core/List/LiveList.js` (the content is now folded into `List.js`; nothing else should
still import the old path after step 2).

```js
// The ordered collection — EVERY List announces its own changes (Events built in;
// there is no separate "LiveList" any more, per the owner 2026-10-02: "scrap LiveList
// everywhere… List itself gets Events built in. 'A list' now means an evented list").
// Composed onto an Item as a named property (`item.content`, `page.pages`) — never
// inherited. Every verb is by ID, never an index, so a line survives the list changing
// shape around it.
import { Events } from "../Events/Events.js";

const is_plain = value => !!value && typeof value === "object" && value.constructor === Object;
const skipped = key => key === "constructor" || key === "__proto__" || key.startsWith("_");

export class List extends Events(Object) {

	constructor(...args){
		super();
		this.assign(...args);
		this.items ??= [];
	}

	assign(...args){ return Object.assign(this, ...args); }

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
	// Nothing HERE imports Item (that would be a cycle): Item.js sets
	// `List.prototype.of = Item` once it exists.
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

	// A line whose key names one of my own verbs routes here.
	set(delta){
		for (const verb in delta){
			if (skipped(verb)) continue;
			if (typeof this[verb] === "function") this[verb](delta[verb]);
		}
		return this;
	}

	toJSON(){ return [...this.items]; }
}

export default List;
```

**Check:** `core/List/LiveList.js` no longer exists; `core/List/List.js` exports the class
above verbatim (don't paraphrase it — paste it exactly). Do not touch any other file in
this step.

## Step 2 — rename the examples file (minion A, same turn)

**Read only:** `core/List/LiveList.examples.js`.

1. Create `core/List/List.examples.js` with the SAME content as the current
   `core/List/LiveList.examples.js`, except:
   - line 2: `import LiveList from "./LiveList.js";` → `import List from "./List.js";`
   - every other occurrence of the word `LiveList` in the file → `List` (identifier
     uses only — e.g. `new LiveList(` → `new List(`). Leave English prose like
     "LiveList, taught by six examples" → change to "List, taught by six examples" too
     (it's describing the class, which is now named List).
2. Delete `core/List/LiveList.examples.js`.

**Check:** `core/List/List.examples.js` exists, `core/List/LiveList.examples.js` does
not, and the file has no remaining occurrence of the string `LiveList`.

## Step 3 — the core callers (minion B, separate step, after A's check passes)

**Read only:** `core/Item/Item.js`, `core/Item/Store.js`, `core/Page/Page.class.js`,
`core/Page/Log.js`, `core/List/page.js`.

In EACH of these 5 files, do a plain find-and-replace:
- `"../List/LiveList.js"` → `"../List/List.js"` (keep the same relative-path style the
  line already uses — `core/List/page.js` imports from `"./LiveList.js"`, so there it
  becomes `"./List.js"`)
- the bare word `LiveList` → `List` EVERYWHERE it appears as a JS identifier (import
  name, `new LiveList(`, `instanceof LiveList`, `LiveList.prototype`, comments). Do
  this for every occurrence in all 5 files — don't skip comments, they explain the
  code to the next reader.

One exception: `core/Item/Item.js` already has no import named `List` (plain), so there
is no name collision — `import LiveList from "../List/LiveList.js";` simply becomes
`import List from "../List/List.js";` and the file reads on from there.

**Check:** `grep -rn "LiveList" core/Item/Item.js core/Item/Store.js core/Page/Page.class.js core/Page/Log.js core/List/page.js` (from `public/framework/`) returns nothing.

## Step 4 — the ext/ callers + one AI doc line (minion C, separate step)

**Read only:** `ext/editor/page.js`, `ext/editor/blocks.js`, `ext/Panel/Panel.js`,
`ext/Panel/flow.js`, `ext/Draggable/page.js`, `ext/Draggable/Sortable.js`,
`ai/overview.js`.

Same mechanical rule as step 3: every `LiveList` → `List` (import path
`/framework/core/List/LiveList.js` → `/framework/core/List/List.js`, `new LiveList(` →
`new List(`, comments too). `ai/overview.js` line 488 just has the word `LiveList` in a
sentence — change it to `List` there too.

**Check:** `grep -rln "LiveList" ext/editor ext/Panel ext/Draggable ai/overview.js`
(from `public/framework/`) returns nothing.

## Step 5 — docs (done by the mastermind, not a minion)

`core/List/readme.md`, `core/Item/readme.md`, `core/Page/readme.md`,
`core/Events/readme.md`, `core/Page/doc/decisions.md` all describe the old
List-vs-LiveList split and need a rewrite, not a mechanical rename (law 2: clear beats
brief — these explain a concept, a find-replace would read wrong). The mastermind does
this pass itself after steps 1–4 land.

## Landing

Smoke test after step 4: load `/framework/core/List/`, `/framework/core/Item/`,
`/framework/core/Item/live/`, `/framework/core/Page/overview/page/` in the site and
confirm no console error (`mcp__site__shot` or `mcp__site__eval`, headless only — never
the owner's own tab). Then one small merge for this whole task.
