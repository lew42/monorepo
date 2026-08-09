How many leading pages two chains have in common.

## Usage

`Router.js:94` — `activate()`, the only caller.

## Necessity

**One-caller sugar, and it should stay.** The house rule it exists for: the method
body may be ugly; the *call site* must read as prose.

```js
const shared = this.shared_depth(from, to);   // 2 — root, a stay
```

Inlined, `activate()` grows a `while` loop with an index in the middle of its five
most important lines, and a reader has to run it to learn what it means.

## Simplicity

Right-sized. It touches no instance state, so it could be `static` — which would
say *"a function about two arrays"* out loud. Not worth renaming a method nothing
outside this class calls.
