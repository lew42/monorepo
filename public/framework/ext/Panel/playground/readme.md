# playground — one document, whole-window: its viewport set, and the drawer as the responsive handle

## What
`/framework/ext/Panel/playground/` — one line saying which document you are in and linking back to the list, the `Workspace` bar, the workspace, `ext/drawer` docked on the right. The url carries the document: `/playground/<name>/`, `default` with none.

## Use
Open a layout from the **Documents** group in [Make's tree](/imagine/paging/make/) — that is where the list and the `+` live since 2026-09-18. The bar's `1` / `all` / `twin` switch the viewport SET; `fit` / `100%` size each device frame — [`../Workspace/doc/viewports.md`](../Workspace/doc/viewports.md).

## Watch out
- **The document rail is gone** — it is a group in Make's tree, and this page is a thin wrapper round one document: [`doc/decisions.md`](./doc/decisions.md)
- **There is no floating bar on a panel any more** — split and close are rows in the rail, and selecting a panel opens it: [`../doc/decisions.md`](../doc/decisions.md)
- `.layout-full` reads the shared `--rail-push` token so the drawer's grip still narrows it: [`doc/decisions.md`](./doc/decisions.md)

## More
- [`doc/decisions.md`](./doc/decisions.md) — why the rail folded, why not a redirect, the `route(name)` shape
- Parent: [`ext/Panel`](../) · Viewport set: [`../Workspace/`](../Workspace/) · The list: [Make](/imagine/paging/make/)
