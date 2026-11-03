# The four backends

Each implements only `load()` / `write()` / `delete()`; the queue in `Saver` is
never touched.

| | where it lives | works off localhost | typical caller |
|---|---|---|---|
| `Saver` | nowhere — every hook resolves and no-ops | n/a | never used directly |
| `MemorySaver` | a plain object on `this.json` | yes (no browser API involved) | tests, demos, this page's own checks |
| `LocalStorageSaver` | one `localStorage` key | yes | the deployed editor, panel workspace, the dev rail |
| `FileSaver` | a real `.json` file, over [`dev/Socket`](/framework/dev/Socket/) | **no** | the same three, while developing on localhost |

## `FileSaver` is a dev-only backend, on purpose

`write()` and `delete()` both go through `Socket.singleton().rpc(...)`, and that
socket **only connects on localhost** (`CLAUDE.md`, static-compatibility). Off
localhost `write()` warns once — never per-call, so a save loop cannot flood the
console — and resolves `false` without throwing. `load()` still works everywhere,
because a `.json` file is a static asset: a deployed page can *read* the
document it cannot write. A 404 there resolves `null`, exactly like an empty
`LocalStorageSaver` key — "not saved yet" is one state, not two. A read that
fails for any other reason (bad status, dropped connection) REJECTS instead,
so "not saved yet" and "couldn't check" stay two states, not one.

## The idiom every real caller repeats

```js
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const saver = dev ? new FileSaver({ path: "/data/doc.json" }) : new LocalStorageSaver({ key: "doc" });
```

`ext/editor/page.js`, `ext/Panel/workspace.js` and `dev/DevBar/settings.js` each
write a version of this line themselves — see
[Where this module overlaps others](/framework/audit/modules/ext-Saver/) in the
audit for whether that duplication is worth collapsing into the module.

## Why there is no `ListSaver`

A list is an `Item` with empty `data` and populated `items`, so the collection
case is already the document case — one more backend would document a
distinction the data model doesn't have. Full reasoning in `readme.md`'s
Decisions.
