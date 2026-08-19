# Claim — a tab claimed by an agent: a ring around the viewport, a label, a 🟠 in the title. For Claude sessions sharing the owner's browser.

## Use

```
mcp__site__claim    tab: "3e83f2c0", note: "<task-slug>"   — ring the tab you drive
mcp__site__release  tab: "3e83f2c0"                        — when the task lands
```

Nothing imports it: the callers load it into the tab through an `eval` — `Tab.claim()` on the dev server, which the two MCP tools and [`ext/Ask`](/framework/ext/Ask/) both go through. A session never types the import. By hand, if you need it: `import("/framework/dev/Claim/claim.js").then(m => m.claim("claude", "<slug>"))`.

## Watch out

- A claim survives the reloads your own edits cause: `sessionStorage` + `reclaim()` on boot in `DevBar.js` — [doc/decisions.md](./doc/decisions.md).
- `claim.js` reads `View` from `core/View/View.js`, not `/app.js`: DevBar imports it, and the circle only fails on a deep reload — [doc/decisions.md](./doc/decisions.md).
- A ring on `body` paints nothing (`--prim` lives on `.app`), so it appends inside `.app` — [doc/decisions.md](./doc/decisions.md).
- Every route change rewrites `document.title`; a `MutationObserver` keeps the 🟠 — [doc/decisions.md](./doc/decisions.md).
- Nothing releases on its own; a dead session leaves a ring on a tab nobody drives — [doc/decisions.md](./doc/decisions.md). The exception is the dev rail's AI turn, which claims and releases around itself — and so overwrites a claim you made by hand on that tab.

## More

- [Overview](/framework/dev/Claim/) · [`doc/decisions.md`](./doc/decisions.md) — why a module, the reload finding, open items
- Files that matter: `claim.js` (claim/release/reclaim), `claim.css` (ring and label), `page.js` (live demo)
