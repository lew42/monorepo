Fetch my declared children — and theirs, until the budget runs out.

```js
load_all_children(levels = this.depth)   // returns `this`, so child() can chain it
```

**Usage** — three callers, all internal: `Page.load()` (a page module the moment it
is imported), `child()` (every hop of the Router's walk), and itself, once per
declared name. The promise it stores in `loading` is awaited by `Router.load()` and
by `ext/tabs`, which is what makes a menu draw **once**, with real titles and icons,
instead of drawing names and redrawing.

**`levels` is what the CALLER needs.** Nothing means my own `depth`, which is what
navigating to me asks for; a number is a parent's remaining budget, and each child
gets one less. A `leaf` child gets **zero** — it already means "I present myself,
not my children", so `walls()` and a sidebar both skip it and its subtree waits
until you open it.

**Idempotent.** `loaded` is how deep I already am, so a revisit costs nothing and a
deeper ask tops up. That is the whole of what makes navigation deepen a tree: the
Router walks `child()` down the chain, and each hop asks for its own `depth`.

**And the guard above is why a data source is awaited HERE.** A page whose children come
from a `children()` function has nothing in its Map when you land on it — there is no url
segment to walk, so `child()` never runs — and this is the one method that would notice.
Two pages used to write that wait as an override of this method, and both had to restate
the `levels <= this.loaded` guard inside it; both forgot, so the second call read back the
very promise being assigned on the next line and threw *"Chaining cycle detected for
promise"* out of the microtask queue with no file and no stack. The guard sits above the
await here instead. `./source_children.md`, `../data-children.md`.

**Nothing is fetched in the constructor**, and that is the design, not an omission.
A module page constructs *itself* at import — `export default new Page({ meta })` —
so a constructor that loaded its subtree hands the budget to nobody: **every** url
under `/framework/` cost 261 `page.js` modules and 1.08 MB whatever the destination,
78% of it drawing nothing (measured 2026-08-30). Bounded to the levels actually
drawn, the same screen costs 57 modules and 279 KB.

**Rejected: full recursion** — "import every descendant". An ancestor's one line
would override a descendant's deliberate shallowness three files away. `depth` is
the inverse: an ancestor spends a budget it declared, and `leaf` lets the child
refuse it.

The name is long. It earns it by saying *all*, which is the word that distinguishes
it from `child()`. The record is `../declaring.md`.
