# Drop the special `at` key — the path is the nesting

The owner's ask (dictated mid-task to `mastermind-page-3`, two passes — the second corrects the first):

> Design change from the owner (vscode-mastermind); it's the new TOP section of
> page-item-design.md. DROP the special `at` key. `set(obj)` keeps the owner's
> original rule: a method key calls the method; otherwise the key is a PATH
> resolved by `this.get(key)`: a property, then a child's id, split on "."
> (`k2.answers`), like `app.get("a.b.c")`. If what it finds has a `set`, the
> value is handed to it; otherwise it's data. So `{"k2.answers": {"add": {...}}}`
> replaces `{"at": "k2/answers", "add": {...}}`. Make `get(path)` the single
> resolver, used by replay, the page tools and code. If Store or the page tools
> already write `at` lines, read both forms for one release and write only the
> new one. Fold it into your List/PageLog step. Don't wait on the owner.

**Correction, sent moments later** (supersedes the dotted-path part above — see
`page-item-design.md`'s own "LATEST … second pass" section, which already has
this in writing):

> NO dotted keys. The path is the NESTING: `{"k2": {"answers": {"add": {...}}}}`.
> `get(key)` resolves ONE name (a property, then a child's id) and hands the
> value to it if it has `set`, so each level walks one step. A line may hold
> several keys (applied in order) and may be an ARRAY of delta objects (applied
> in order), for repeating the same method. Still read old `at` lines for one
> release.

## What changed

- `Item.apply()` (`core/Item/Item.js`) drops the `"at" in delta` special case
  from the WRITE path; it is now a one-release COMPAT read only.
- `Item.get(key)` is the single resolver — one name, not a path: a property
  first (`get_one()`, the seam Page/Panel override), then a child's id scanned
  across every List the item owns. No `.` splitting at all (the correction).
- `Item.set()`/`apply()` take an array of deltas, applied in order (the "same
  method twice" case: `[{"add": {...}}, {"add": {...}}]`).
- `List.set()` gets the same array support, since a nested delta can land
  directly on a List (`k2.answers.set([...])`).
- `Item.Store.line_for()` (`core/Item/Store.js`) writes the live wire line as
  NESTING (`hops()`/`wrap()`) instead of a flat `at` path string. The OLD
  `address()` function stays, but only for a cross-list move's `from` value
  (data inside the `move` verb, never routing — untouched by this change).
- `Item.locate()` stays, renamed in intent to COMPAT-ONLY: it is what the old
  `"at"` read-branch still uses to replay a pre-existing line for one release.
- `Page.class.js`'s own `get(key)` override is renamed `get_one(key)` (the
  one-segment seam), and its `set(obj)` gains array support plus keeps the
  old `obj.at`-starts-with-"content" `ensure_content()` guard, compat-only.
- `Panel.js`'s own `get(key)` override is renamed `get_one(key)` for the same
  reason (Item's `get()` now does the resolving; Panel still owns the
  one-segment lookup — defaults, the shared/master mirror rule).

## Scope fence

Only `core/Item/Item.js`, `core/Item/Store.js`, `core/List/List.js`,
`core/Page/Page.class.js`, `ext/Panel/Panel.js` change. No other `get(key)`
override exists sitewide (checked by census — grep for `get(key){` across
`public/framework`). Docs: `page-item-design.md` already carries the owner's
own new top section verbatim; no further doc edit needed there. `core/Item/doc/`
and `core/Page/doc/` get a short note each pointing at the new rule.

## Three more owner passes, folded in the same task (all via vscode-mastermind, same afternoon)

1. **`List extends Item`** — a List is a named, evented, saved collection now (id, title/icon, View, a Store). Item stays free of add/remove/move/order/find; `remove(id)` is List's own meaning. Required breaking `Item.js`'s/`Store.js`'s `instanceof List` checks into duck typing (`Array.isArray(node.items) && typeof node.find === "function"`) and a `Item.makeList` hook, since `List.js` now imports `Item.js` (for `extends`) and the reverse import would be the exact TDZ cycle `core/Page/settings/settings.js` already names for a different pair.
2. **Id rules** — an id is unique only among its own list's siblings; a List reached as a property uses its property name; `get(name)` tries properties first, then child ids; `add` refuses an id that shadows a real property/accessor (but NOT an ordinary method — found live, crawling the site: Page's ~70 methods made almost every folder name collide under the naive `in`-operator check).
3. **Data decision** — all values live in `data`; `static fields = [...]` is sugar for a real accessor per name. Page's `get_one`/`put` override (which wrote onto the instance) is gone.

## Two real regressions found and fixed via live headless smoke-testing

- **Field setter used `set(a, b)` sugar; Page's own `set(obj)` only takes one argument** — crashed every page load (`"content" in obj` on a bare string). Fixed: the field setter always calls `this.set({[name]: value})`, a plain delta object every override accepts.
- **`Object.assign(Layout.prototype, {icon: …})` (a shared per-class DEFAULT, pre-dating this task) ran the new `icon` accessor's setter with `this` BEING THE PROTOTYPE**, not a real instance (no `data` yet) — crashed `/framework/`. Fixed: the setter detects a missing `data` and falls back to a plain own-property write, same as the old bare `=` did there.
- **`Task.js`'s own `get state(){ return this.get("state") ?? "idle"; }` recursed forever** once `get(key)`'s first step started checking `this[key]` for ANY real property, including a getter calling itself. Fixed two ways: `Task.js` now calls `get_one("state")` directly, and `get(key)`'s own first step was narrowed from `this[key] !== undefined` to `Object.prototype.hasOwnProperty.call(this, key)` — a real own property (a List) still resolves in one step; a same-named getter that calls `get()` on itself no longer can.

## Why build directly, no worktree

Same reasoning as the PageLog fold-in just before it: a small, mechanical
continuation of already-approved Item/Page work (2026-10-02), not new design —
the owner wrote the design themselves, twice, correcting their own first pass
within minutes. Smoke test before landing: a page.jsonl page that actually
exercises a nested `set()` (core/Item/live/ or core/Task/live/), plus
`/framework/`, `/framework/ai/` same as the PageLog task.
