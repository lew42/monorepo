The base class, and the only file in this module with any logic in it — 40
lines, all of them the write queue. Every backend extends this and only this;
none of them import each other.

## `save()` / `drain()` is the whole module

Two methods, described in full on their own pages:
[`save`](/framework/ext/Saver/api/save/) queues and returns a promise for *your*
write; [`drain`](/framework/ext/Saver/api/drain/) is the loop that turns any
number of overlapping `save()` calls into at most one write in flight and one
more queued behind it. `write()`, `load()`, `delete()` are stubs here — see
[backends](/framework/ext/Saver/docs/backends/) for what each subclass does
with them.

## Defaults on the prototype, not as class fields

`Saver.prototype.writing = null; Saver.prototype.pending = undefined;` — two
lines after the class body, not inside it. `constructor(...args){
this.assign(...args); }` runs `Object.assign` on `this` before any class field
would initialize, so a field here would silently overwrite a value the caller
just passed in. Same trap as `core/View`'s `classify()`; see
[`assign`](/framework/ext/Saver/api/assign/).

## Improvements

1. **`saving()` has no caller anywhere in `public/`.** Either a real "saving…"
   indicator is coming, or it is one method's worth of surface nobody asked
   for. Not urgent — it costs one line — but worth naming so it doesn't sit
   unnoticed for another six months. *(simple, useful.)*
2. **No way to know *why* a write failed**, only that it did (`false`). Every
   backend swallows its own error into a `console.warn` and a boolean. Adding a
   `this.last_error` (prototype default, matching the house style) would let a
   caller show *what* went wrong, not just that something did — genuinely
   useful for the read-only badges this module's readme says callers should
   build. *(medium, useful — no current caller has asked for it.)*
