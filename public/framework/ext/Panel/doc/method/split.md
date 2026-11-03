`split(dir, made = new Panel(), before = false)` **always** turns `this` into
a container, regardless of what its parent runs — `divide()`'s else-branch,
named. My existing content and children move down onto a new child (`mine`),
`this` becomes the split, and `made` joins `mine` inside it.

⚠ **`draw` moves by hand.** It's an instance property (`panel(fn)`'s content),
not part of `data`, so the `{ ...this.data, grow: 1 }` copy in `mine`'s
constructor does not carry it — the line right after does that explicitly, the
same trap `divide()`'s own doc names.

## Why this exists beside `divide()`

`divide(dir)` reads whether its parent already runs `dir` and only becomes a
split when it doesn't — which is right for "add a sibling," and wrong for
"put this **inside** me." Dropping a panel in the middle of another one must
always nest, whatever the parent happens to be running; before `split()` had
its own name, that case had no verb to call. `PanelDrag.release()`'s centre
test (dropping in the inner three-fifths of a **leaf**'s body) is the one
caller that reaches this directly rather than through `divide()`.

⚠ **A split is never a `centre()` target.** `PanelDrag.centre()` only offers
the middle of a **leaf** — a split already is a container, and dropping into
the middle of one means its row, not a second nesting nobody asked for.

⚠ **`this.bequeath(mine)` runs LAST**, after `made` is already in the tree
(`made.move(this, ...)` above it), because `this.data` is wiped to `{ dir,
grow }` a few lines earlier — `this` no longer holds the shared keys, so any
copy still pointing its `mirror` at `this.id` must be re-pointed at `mine`,
the child that now holds them. `made` can itself be exactly such a copy: the
bar's copy button drops a live duplicate by mirroring the panel it split
beside, so splitting a root leaf that already has that duplicate makes `made`
one of `this.copies()` — and the walk `bequeath()` runs needs `made` already
attached to find it. Calling `bequeath()` before `made.move()` would miss
that case.
