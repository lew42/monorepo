# Router — everything between "a url changed" and "the DOM reflects it"; for anyone building a page or a link

## Use
```html
<a href="/docs/intro/">Intro</a>
```
That is the whole API. Each url segment is one `page.child(name)`, a miss is an `import`, and a url the Router can't resolve is handed to the browser. It writes four classes — `.active-page`, `.active-ancestor`, `a.active`, `a.in-path` — and CSS does the rest.

## Watch out
- Anchors rendered *after* a navigation never get `.active`/`.in-path` on their own — call `app.router.mark_links()` bare, as `ext/tabs` and `ext/catalog` do: [doc/marking.md](./doc/marking.md)
- Removing the scroll reset in `activate()` looks safe (`scrollTop` clamps); it isn't: [doc/scroll-reset.md](./doc/scroll-reset.md)
- A cross-page `#fragment` lands at the top — the target does not exist yet when `activate()` scrolls: [doc/fragment.md](./doc/fragment.md)
- Styles and titles are awaited in `load()` so `activate()` stays synchronous for `startViewTransition()`: [doc/styles-loaded.md](./doc/styles-loaded.md)
- Constructing a Router starts it; a second one navigates every click twice, and two fast clicks race — known, unguarded: [doc/constructor.md](./doc/constructor.md)
- `redirect()` / `Router.enter()` were backed out — two live urls for one state: [doc/backed-out.md](./doc/backed-out.md)

## More
- [Overview](/framework/core/Router/) — the walk, the four classes, live anchors.
- [doc/decisions.md](./doc/decisions.md) — the record: why a Router, verdicts, proposals, open items.
- [doc/registry-gate.md](./doc/registry-gate.md) — optimistic interception: load first, push second.
- [doc/chain-diff.md](./doc/chain-diff.md) — a navigation touches only the difference between two chains.
- [doc/marking.md](./doc/marking.md) — the classes, scoped to `$app`; unmarks only what it marked.
- [doc/navigated.md](./doc/navigated.md) — `app.navigated?.(page, from)`; why no `page.entered`.
- [doc/measured.md](./doc/measured.md) — 0.2ms warm navigation; the serial walk's cost.
- Members: `doc/method/<name>.md`, `doc/property/<name>.md`, `doc/file/<path>.md` — rendered under the source by `Doc`.
- Files: `Router.js` (the class), `page.js` (the Doc index), `doc/` (one topic each).
