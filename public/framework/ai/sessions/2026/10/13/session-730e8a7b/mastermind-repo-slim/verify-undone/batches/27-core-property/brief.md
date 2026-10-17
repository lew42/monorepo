# Check 10 asks against the repo: core/Property

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/27-core-property/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `core/Property`, folder `public/framework/core/Property` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/core/readme.md`, `public/framework/core/Property/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/core/Property/readme.md`)

# Property — one live value you can bind to

`class Property extends Events(Object)`: `get()`, `set(v)` (emits `change(value, old)` only if it changed), `bind(fn)` (calls `fn` now and on every change, returns the unbind), `listeners()`. It never bubbles. Item stays as it is; Property is opt-in.

`Property.Map` is the DOM-free helper that gives a template its two fallthrough maps (`data` and `props`): clone, override, delete falls back, shared until written, a Property created lazily when something binds, `copy()` for a hard copy with no link back, `overrides(prefix)` to list what a clone overrides. Test: `node public/framework/core/Property/Property.test.mjs`.

`Property.of(item, name)` mirrors one key of an Item: reads follow it, `set` writes through `item.set`, and it listens to the Item only while it has listeners. First caller: the session detail's model/cost line (`ai/AISession/AISessionDetail.js`).

- Used by [Template](/framework/core/Page/Template/) · design: [core/Page/doc/templates.md](../Page/doc/templates.md) · binding, measured on 1,000 rows: [core/Page/doc/binding.md](../Page/doc/binding.md)
- Watch out: a clone that writes an inherited bound value gets its own new Property (`"rebind"`); it never sets the parent's.
- Watch out: never put a Property inside an Item's data; it takes over that key's writes, so the Item emits no `change` and nothing saves ([binding.md](../Page/doc/binding.md)).

## More

- [`doc/architecture.md`](./doc/architecture.md) — the decisions that hold today, and why


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/27-core-property/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 10 asks

1. `5ca1c41e81` (4 days old): Research a way to subscribe to property changes other than events
2. `73df0c7970` (4 days old): Catalogue data-binding property kinds and where binding helps without bogging the system down
3. `2c49aa3292` (4 days old): Do not make everything a property object; property objects stay optional, with no sub-object per property needed
4. `05e379240b` (4 days old): Weigh property objects, which ease upgrades but are more object-oriented at a performance cost, against binding to the parent's name change event
5. `0dbb5d529e` (4 days old): Make properties bindable so UI controls update them without manual wiring
6. `56ea5ae632` (4 days old): Bind one property to another with expression, condition or script callbacks in between
7. `ed7ff59c42` (4 days old): Make any object with properties bindable
8. `f0506cbf0e` (4 days old): Build rock solid data structures that give real-time updates and prevent stale data
9. `1dbdb6112f` (4 days old): Mark bindable by instanceof Property, or by item.bind with a property name; work out how to pass bind indications to a cloned page
10. `3a9ce98164` (4 days old): Keep a thousand-item data grid with tens of thousands of bindable elements from loading the page down
