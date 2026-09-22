Where a page keeps something between visits. `this.store()` hands back a handle over
`localStorage`, keyed on the page's own **url** — `lew42:/imagine/game/`.

```js
initialize(){
	const saved = this.store().get({ found: [], carried: [] });   // defaults + whatever was saved
	this.found = new Set(saved.found);
},

save(){   this.store().set({ found: [...this.found] }); },       // the whole record
remember(part){ this.store().patch(part); },                     // one field, rest kept
reset(){  this.store().clear(); },                               // the key stops existing
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

**Simplicity** — one method on `Page`, one part class (`Page.Store`) beside it. No
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
Page.Store({ id: "sidebar" })` skips the page entirely and uses one fixed key,
`lew42:sidebar` — the same key that file always wrote (merged 2026-09-18,
`Sidebar.Store` deleted). `key()` tries `id` first, then falls back to the ordinary
`store_key ?? page.url` path above.

**`Page.Store.read_raw`/`write_raw`/`clear_raw`** (static) are the guarded
`localStorage` touch underneath `read`/`set`/`clear` — pulled out 2026-09-18 so
`ext/Saver`'s `LocalStorageSaver` could call the SAME guard for its own key instead of
carrying a second copy. `LocalStorageSaver` stays its own class: it needs `write()` to
report a real boolean (success or failure — `ext/Saver/doc/method/write.md`), which
`Page.Store`'s own always-degrade-silently contract does not give it.

The record, the three decisions and what was rejected:
[`doc/decisions.md`](/framework/core/Page/doc/decisions/).
