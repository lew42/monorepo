# playground — the whole-window Workspace: a document, its viewport set, the drawer as the responsive handle

## What
`/framework/ext/Panel/playground/` — a left rail (Framework's own logo/brand as the way out, the document list, `+`), the `Workspace` bar in the middle, `ext/drawer` docked on the right. The url carries the document: `/playground/<name>/`, `default` with none.

## Use
Pick a document in the rail, or `+` to mint one. The bar's `1` / `all` / `twin` switch the viewport SET; `fit` / `100%` size each device frame — [`../Workspace/doc/viewports.md`](../Workspace/doc/viewports.md).

## Watch out
- No ✕ — the rail's own "Framework" link is the way out: [`doc/decisions.md`](./doc/decisions.md)
- `.layout-full` now reads the shared `--rail-push` token so the drawer's grip still narrows it: [`doc/decisions.md`](./doc/decisions.md)

## More
- [`doc/decisions.md`](./doc/decisions.md) — why `PlaygroundRail extends Sidebar`, the `route(name)` shape
- Parent: [`ext/Panel`](../) · Viewport set: [`../Workspace/`](../Workspace/)
