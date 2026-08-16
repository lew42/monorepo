# ext/Saver

`ext/Saver` is a 249-line write queue with three thin storage backends bolted
on — `save(item)` / `load()` / `delete()`, one write in flight and one pending,
inherited by `MemorySaver`, `LocalStorageSaver` and `FileSaver`. It earns its
place: three real, non-demo modules (`ext/editor`, `ext/Panel`, `dev/DevBar`)
depend on it today, the coalescing behaviour is exactly right (proven by a live
test suite on its own Overview page, not just claimed), and the file-count-to-
value ratio is about as good as this codebase gets. The single most important
thing to do to it: **fix the queue-wedges-on-a-rejecting-`write()` bug** —
`Saver.js:23` doesn't catch, so any future (or, via `LocalStorageSaver`'s
`setItem`, already-possible) thrown write silently stops that saver forever,
with no symptom a caller would notice.

## State

| | |
|---|---|
| files | 5 (`Saver.js`, `FileSaver.js`, `LocalStorageSaver.js`, `MemorySaver.js`, `page.js`) |
| lines of JS / CSS | 249 / 0 |
| callers | 5 — `ext/editor/page.js`, `ext/Panel/workspace.js`, `dev/DevBar/settings.js` (real, non-demo); `ai/2026-08-14/editor-panel-review/page.js`, `ai/2026-08-13/editor-panels/page.js` (task-log demos) |
| docs before | `readme.md` present and already good (Traps/Decisions/Open, written same day as the persistence stack); `page.js` a plain `Page` with a live demo but no `Doc`, no method/property/file docs at all |
| docs after | `page.js` → `Doc` (`subject: Saver`); 7 `doc/method/*.md`, 2 `doc/property/*.md`, 1 `doc/backends.md` note, 5 `doc/file/*.md`; readme gained a "Used by" section, a link to `doc/backends.md`, and one new Open entry for the bug found this pass |

## What I changed

- Rewrote `page.js` as `new Doc({ subject: Saver, properties: "writing pending", methods: "save load delete drain saving write assign", notes: "backends", files: … })`. Overview content kept (code sample, live `MemorySaver` test suite, four-backends summary) and trimmed to link out to the new `doc/backends.md` instead of repeating its detail.
- Wrote all 15 doc files the lists above require (`doc/method/`, `doc/property/`, `doc/file/`, `doc/backends.md`), each with a ranked Improvements list where relevant.
- Added "Used by" to `readme.md` (5 callers, table, one line each) — this module had zero callers documented before.
- Added a `doc/backends.md` note: the four-backend comparison table, why `FileSaver` is dev-only by design, and the `dev ? FileSaver : LocalStorageSaver` idiom all three real callers repeat verbatim.
- Recorded the `write()`-rejection bug in `readme.md`'s Open section and in three doc pages (`write.md`, `writing.md`, `Saver.js.md`, `LocalStorageSaver.js.md`) — no code changed, per the fences.
- No `classdoc` references found anywhere in this directory — nothing to migrate.

## Recommendations

1. **A rejecting `write()` wedges the save queue forever, silently.** `drain()` (`Saver.js:23`) doesn't catch; a thrown/rejected write skips `this.writing = null`, so every later `save()` returns that same dead promise from then on — no more writes, no error, no symptom besides a document that stopped saving. `LocalStorageSaver.write()`'s `setItem` can throw `QuotaExceededError` today; nothing guards it. Fix: `try/finally` in `drain()` so `this.writing = null` always runs, plus a `try/catch` in `LocalStorageSaver.write()`. **medium, important** — small diff, but it's the kind of bug that loses a user's work with no console line to find later.
2. **Three real callers hand-roll the same `dev ? new FileSaver(path) : new LocalStorageSaver(key)` line.** `ext/editor/page.js`, `ext/Panel/workspace.js` and `dev/DevBar/settings.js` all detect environment and pick a backend themselves. A one-line helper — `Saver.auto({ path, key })` or a module-level `store(path, key)` exported from this module — would remove three copies of the same hostname check and make "which backend runs where" answerable from one file instead of three. **simple, useful** — no behaviour change, pure de-duplication; I did not apply it (fenced from editing non-`page.js` files).
3. **`FileSaver.delete()` is fire-and-forget** (`rpc`, not `async_rpc`) so its `true` means *sent*, not *removed* — inconsistent with every other method in the module, which all resolve on real completion. One more awaited round trip fixes it. **simple, useful** — nothing calls `delete()` today, so this is latent, not urgent.
4. **Outside-the-box: let `Saver` diff instead of replace.** Every write today re-serializes and re-sends the *whole* document, which is fine at this module's current scale (`core/Item` documents) but won't be once a document gets large or edits get frequent. The base class already tracks `pending` — it could track the *previous* written value too and hand `write_ops(ops)` a diff instead of `write(item)` a snapshot, with a backend opting in by overriding `write_ops` instead of `write`. The readme already names this as deferred (`write_ops(ops)`) with no design pressure yet; I'm surfacing it because the queue mechanism (one-in-flight/one-pending) is *exactly* the right shape to carry a diff instead of a value, and doing it now — while there are only 3 real callers — is far cheaper than after there are 10. **large, speculative.**

## Where this module overlaps others

Not itself a duplicate of Editor/Panel/DevBar/demo — it's the one piece those four already *share* rather than reinvent, which is the good outcome. The overlap that *is* real: the environment-detection idiom (`dev ? FileSaver : LocalStorageSaver`), copy-pasted verbatim in `ext/editor`, `ext/Panel`, and `dev/DevBar`. That's a few lines each, not a module each, but it's still the same decision made three times with three chances to drift — see Recommendation 2. `core/Item`'s readme documents `Saver` as its intended persistence layer via `Item.open(saver)`, but `Item.js` itself imports no saver yet (a duck-typed gap, not a bug) — worth someone confirming that pairing is still the plan, or `readme.md`'s example is aspirational documentation for code that doesn't exist.

## Skill feedback

The skill is clear and mechanically checkable everywhere it discusses **one** class — it did not, however, say what to do when a module's `subject` isn't obviously singular. `ext/Saver` has four classes (`Saver` plus three backends that each override `load`/`write`/`delete`); I judged `subject: Saver` (the base, holding the actual methods worth documenting) and pushed the backends into `files:` + a `notes:` comparison, but the skill gives zero guidance on this shape and I could as easily have picked "no subject at all, everything through files" or invented per-backend sub-pages. A one-line rule — *"a module with a base class and subclasses documents the base as `subject` and the subclasses through `files:`/a comparison note"* — would have saved a judgment call that another agent auditing a similar module (anything base+backends-shaped) will make differently. Second, smaller: the skill's own "six artifacts" table lists `doc/<note>.md` before `doc/method`/`doc/property`, but nowhere says whether a note is *required* when a module has no cross-cutting topic — I had to infer from precedent (`Router`'s `notes:` list) rather than the skill text itself.
