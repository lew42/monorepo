Where a page keeps something between visits. `this.prefs()` hands back a handle over
`localStorage`, keyed on the page's own **url** — `lew42:/imagine/game/`.

```js
initialize(){
	const saved = this.prefs().get({ found: [], carried: [] });   // defaults + whatever was saved
	this.found = new Set(saved.found);
},

save(){   this.prefs().set({ found: [...this.found] }); },       // the whole record
remember(part){ this.prefs().patch(part); },                     // one field, rest kept
reset(){  this.prefs().clear(); },                               // the key stops existing
```

Four calls and nothing to configure: **the page never types its own key.** `get(fallback)`
merges the saved object over your defaults, so a record written before you added a field
still loads; `patch()` is `get()` + `set()`, which is the call almost every page makes.

**Usage** — `/imagine/team/` (lanes, density, sort) and `/imagine/game/` (nine rooms
walked, what is in the pack, what was traded away). Both shipped against the local
prototype `imagine/store.js`, which this replaced on 2026-08-31; the key shape did not
change, so the runs saved under it kept working.

**Necessity** — production is static, so there is no server to hand out ids. A page
already has one thing that is unique, stable and human-readable — its address — and
`naming()` derives it, so it cannot drift out of step with the tree the way a hand-typed
`id: "team-board"` would. Every page wants storage and none of them wants to invent a key.

**Simplicity** — one method on `Page`, one part class (`Page.Prefs`) beside it. No
registry, no adapter tier, no options object.

⚠ **Storage, not state — nothing here notifies.** A page that wants a redraw after a write
calls its own watcher; that is three lines it already owns. A subscription API on `Page`
would make ~160 pages pay for a pattern four of them want, which is the verdict
[`roles.md`](/framework/core/Page/doc/roles/) reached about refs.

⚠ **`store_key` for a page that moved.** `move()` re-addresses a whole subtree, so an
adopted page changes url — and would silently lose everything saved under the old one.
Declare the address it was saved at and the key holds still:

```js
new Page({ title: "Board", store_key: "/imagine/team/board/" })
```

⚠ **`localStorage` throws WHOLE** — private mode, a full quota, a blocked third-party
frame. Every call is wrapped: writes fall back to an in-memory `Map` and warn **once** a
session, so the page keeps working and only the persistence is lost. A UI that loses its
buttons because a save failed is worse than one that forgets.

**`id` for a caller that is not a page at all.** `core/Sidebar`'s own resizable rail is
persistent chrome, not a per-page setting — every `Sidebar` on the site remembers one
width, so keying it on a page's url would forget it on every navigation. `new
Page.Prefs({ id: "sidebar" })` skips the page entirely and uses one fixed key,
`lew42:sidebar` — the same key that file always wrote (merged 2026-09-18,
`Sidebar.Store` deleted). `key()` tries `id` first, then falls back to the ordinary
`store_key ?? page.url` path above.

**`Page.Prefs.read_raw`/`write_raw`/`clear_raw`** (static) are the guarded
`localStorage` touch underneath `read`/`set`/`clear` — pulled out 2026-09-18 so
`ext/Saver`'s `LocalStorageSaver` could call the SAME guard for its own key instead of
carrying a second copy. `LocalStorageSaver` stays its own class: it needs `write()` to
report a real boolean (success or failure — `ext/Saver/doc/method/write.md`), which
`Page.Prefs`'s own always-degrade-silently contract does not give it.

The record, the three decisions and what was rejected:
[`doc/decisions.md`](/framework/core/Page/doc/decisions/).

## Comments moved out of Page.class.js (2026-10-12)

Wording kept as it was; the code keeps a one-line pointer here. Plan: [comment-plan.md](./comment-plan.md).

### PREFERENCES — the page's own url IS the id

*was Page.class.js line 1973*

════ PREFERENCES — the page's own url IS the id ═══════════════════════════
A handle over localStorage: `get` / `set` / `patch` / `clear`. Production is
static, so there is no server to hand out ids — and a page already has one
thing that is unique, stable and human-readable: its address, derived by
naming(), so it cannot drift out of step with the tree the way a hand-typed
`id: "team-board"` would. doc/method/prefs.md.
⚠ Storage, not STATE — nothing here notifies. A page that wants a redraw
  calls its own watcher after the write; a subscription API in core would
  make ~160 pages pay for a pattern four of them want (doc/roles.md).
⚠ Renamed from `store()` (was `Page.Store`) — `page.store` is now the LIVE
  jsonl Store (Item.Store, core/Item/Store.js, attached by `Page.jsonl()`),
  and the two must never share a name again.

### Item.Store, specialised for a page.jsonl file — one per URL (Reader.fo

*was Page.class.js line 2072*

`Item.Store`, specialised for a page.jsonl file — one per URL (`Reader.for`), so
`page.store` IS this once a jsonl page has loaded. Keeps every name this had
before the fold-in: `open`, `close`, `parse`, `read`, `attach`, `changed`, `reset`
— `page` is now an ALIAS for Item.Store's own `host`.

### Where a save goes when localStorage will not take it — private mode, a

*was Page.class.js line 2188*

Where a save goes when localStorage will not take it — private mode, a full
quota, a blocked third-party frame. It throws WHOLE, and a UI that loses its
buttons because a save failed is worse than one that forgets: the page keeps
working for the session and only the persistence is lost.

### THE GUARDED PAIR (plus clear_raw) — one JSON-able value under one

*was Page.class.js line 2221*

THE GUARDED PAIR (plus `clear_raw`) — one JSON-able value under one
literal key, never throwing, even when `localStorage` itself throws on
touch (private mode) or is not there at all (Node). The one place this
guard lives now: `ext/Saver`'s `LocalStorageSaver` calls these three
directly instead of its own copy (doc/decisions.md says why it still
needs a separate class).
