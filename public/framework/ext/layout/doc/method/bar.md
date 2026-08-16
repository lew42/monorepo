`layout.bar(target, list)` is the toolbar alone — the same strip `layout(fn)`
places over its own box, usable over anything you built yourself. `target` is a
`View`, a bare `Element`, or a live `Page` (`view_of()` tells them apart by
`.el`/`.nodeType`/neither); `list` is a space-separated string of
[`layout.words`](/framework/ext/layout/api/words/) names, in the order you want
them. Leave `list` out and a `Page` gets its shape vocabulary
(`layout.words.PAGE`: `shape fill flow measure`), anything else gets the default
container vocabulary (`mode gap column`).

An `Element` or `View` target also becomes a clickable **region**
(`layout.js`'s `region()`): pointing inside it highlights what a click would
select, down to one level of nesting. A `Page` target does not — see
[Selection](/framework/ext/layout/doc/selection/) for why a whole docs page must
not become a hover target.

## Why it fills itself a tick late

`page.view` is assigned only *after* `content()` returns, so a bar built while a
page's own `content()` is still running has nothing to point at yet.
`layout.bar()` returns the strip immediately and fills it inside a
`queueMicrotask`, through `$bar.append(fn)` — which re-establishes the append
captor, so the code inside reads like ordinary synchronous page code even though
it runs a tick later. This is also why `layout.bar(this)`, called from inside a
page's own `content()`, works at all.

## Traps

- **⚠ Every rendered word runs before the caller sees a return value.** `layout.bar()`
  hands back an empty `.layout-bar` synchronously; nothing inside it exists until
  the next microtask. Reading `$bar.el.children` on the same line is always empty.
- Passing a target that never mounts (a `View` built but never appended) leaves
  the bar permanently empty — `view_of()` returns something, but `$el.el` never
  resolves to a connected node, and `region()` still runs against a detached tree.
