# Check 3 asks against the repo: core/Events

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/34-core-events/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `core/Events`, folder `public/framework/core/Events` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/core/readme.md`, `public/framework/core/Events/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/core/Events/readme.md`)

# Events — `on` / `off` / `emit`, a mixin everything else builds on

A mixin, not a base class: `Events(Object)` is a plain emitter. `Item` (`core/Item/`) is
`Events(Object)` plus an id, a data bag and `set(delta)`; `List` (`core/List/`) extends
`Item` and adds the array and the four verbs. Nothing here is specific to either —
it is `on`, `off`, `emit`, and one more method, `bubbles()`, that says whether an event
keeps climbing.

## Architecture

```js
const Events = Base => class extends Base {   // ✅ the ONLY mixin in core — everything else is a class
  on(event, fn), off(event, fn)               // listeners live in this._on[event], made on first on()
  emit(event, ...args)                        // my listeners, then this.parent?.emit(...) while bubbles(event)
  bubbles(event)                              // true by default; a class overrides it to be a boundary
}
Item = Events(Object)                         // core/Item/Item.js
List extends Item                             // core/List/List.js — its parent is its owner Item
```

Because a List's `parent` is the Item that owns it, one listener on a root Item hears
every change anywhere below it. That is how `Item.Store` records a whole tree with one
`"delta"` listener.

## Use

```js
import { Events } from "/framework/core/Events/Events.js";

class Thing extends Events(Object) {}

const a = new Thing(), b = new Thing();
b.parent = a;

a.on("ping", msg => console.log("heard:", msg));
b.emit("ping", "hi");   // b has no listener of its own — this reaches a anyway
```

`emit(event, ...args)` calls every listener bound here, THEN — while
`this.bubbles(event)` is true — calls `this.parent?.emit(event, ...args)` with the
exact same arguments. `bubbles()` defaults to `true`; a class overrides it to become
a boundary (`core/Page` will, so a page's own events never leak into its parent's).

## Watch out

- Listeners are plain functions in `this._on[event]`, made lazily on the first
  `on()` call — nothing allocates until something actually listens.
- `emit` calls each listener with `fn.call(this, ...args)`, so `this` inside a
  listener is whatever object the event is bubbling THROUGH at that moment, not
  necessarily the one it started on.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`core/List/List.js`](../List/List.js) — the list that uses this to
  announce `add`/`remove`/`move`/`order`, plus one uniform `"delta"` event
  `Item.Store` listens for. One class — the event-less `List` and the announcing
  `LiveList` were merged into it 2026-10-02.
- [`core/Item/Item.js`](../Item/Item.js) — `Item = Events(Object)`.


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/34-core-events/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 3 asks

1. `66fde95e29` (4 days old): Unsubscribe from changes when objects are garbage collected, with no memory leaks, and say whether this is easy to do
2. `148f18f340` (4 days old): Do not create more events or subscriptions than necessary; keep the event system on demand
3. `78c3a470a6` (4 days old): Create the events property on demand behind a gate when it does not exist
