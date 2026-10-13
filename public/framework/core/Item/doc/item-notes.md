# Item.js — design and architecture notes

## Prototype chain walking

Walks a prototype chain (stopping at Object.prototype) looking for an OWN descriptor named `name` — used by `define_fields()` to find a real collision (a method, accessor or plain property already sitting on some class in the chain) versus its own prior accessor from an earlier `register()` call.

## List type detection

A duck-typed "is this a List?" — NOT `instanceof List`, because this file must never import List.js (List extends Item now: List.js imports THIS file for `extends`, so the other direction would be a true cycle). Specific enough in practice: an ordered `items` array plus a by-id `find` is what a List IS.

## Item architecture and composition

An arbitrary THING: an id, a data bag, one `set(delta)`, a place to save (`store`) and a place to be seen (`view`). No list methods at all — Item itself holds no children. Something that needs them gives ITSELF a named `List` property, the same way `page.pages` and `page.content` do. This is composition, not inheritance, on purpose: Page already has about 70 methods of its own, several of which — `add`, `move`, `get`/`set` — would collide with the list API if Item inherited it instead of merely offering it as a property. List extends Item, so a List IS an Item too, just never one Item HOLDS its lists by inheriting them.

## Constructor-time data isolation

A null-prototype bag — still plain enough for `JSON.stringify`, but a data key named `constructor` or `toString` can never shadow a real built-in by accident. The instance's OWN namespace is reserved for built-ins instead: id, parent, store, the named Lists, the methods — never a value.

## Fields as accessors

`static fields = ["title", "icon", "description"]`: one convenience, not a new storage rule — the value still lives in `data`, exactly like any other key. Each name just gets a REAL accessor on the prototype, so `item.title` keeps reading/writing exactly as before, but now through `get_one`/`set` underneath, so `item.title = x` fires the same `change`/`delta` events a jsonl `{"title": x}` line would. Called once per class, from `register()`.

REFINEMENT: `fields` is declared in CODE ONLY — nothing at runtime (a page tool, a line, an agent) may add an accessor; this method is the one and only place one is ever created. A name that collides with a real method, getter or property ANYWHERE up the prototype chain is no longer silently skipped — that hid a real bug (a field quietly losing to an existing method). It now THROWS a clear error naming the class and the kind of thing it collided with, at `register()` time — load-time, not first-use — so a bad field list breaks loudly, once. Re-registering the same class twice is still safe: the guard recognizes ITS OWN prior accessor and skips past it rather than treating it as a collision.

## Set delta application

The one rule, key by key, IN KEY ORDER:
1. skip `constructor`, `__proto__`, anything starting `_` (never trust a line to reach into the prototype chain).
2. a key naming a METHOD on me — call it with the value.
3. otherwise `get(key)` resolves the ONE name — a property, then a child's id — and if what it finds has its own `set()` (and is not a Map), the value is a nested delta, handed to IT.
4. anything else is data: `put(key, value)`, and if it actually changed, `emit("change", …)` plus the one `emit("delta", …)` Item.Store listens for.

Delta may be an ARRAY of these objects, applied in order.

The old `at` key — a `/`-separated path — is compat only, one release.

## Get resolver

THE single resolver: ONE name, not a path. The owner's order: fields and data, then named Lists, then child ids.
1. a real OWN property (`Object.prototype.hasOwnProperty`) — a List given to me directly, never through `data`. NOT a `fields` accessor — those live on the PROTOTYPE, one step below.
2. `get_one(key)` — the data seam: a `fields` accessor's own backing value, or anything else in `data` nobody gave its own accessor.
3. a child's id, searched across every List I own — so `get("k2")` finds a sub-page or list member named "k2" without ever naming WHICH list it lives in.

Used by `set_one()` (so each level of a nested delta is just this rule again), by the page tools, and by plain code.

## Hydrate versus toJSON

Tolerant of every malformed input: warn, keep the node, never throw. Reads BOTH shapes:
- the whole-document envelope `{type, id, data, <listname>: [...]}` (what `toJSON()` writes);
- a flat list-verb delta `{id, type?, after?, ...data}` (what an `"add"` line carries).

`after` is positional metadata for the LIST, never data, and is dropped either way.
