# Claim — a tab claimed by an agent: a ring around the viewport, a label, a 🟠 in the title. For Claude sessions sharing the owner's browser.

## Use

```js
import("/framework/dev/Claim/claim.js").then(m => m.claim("claude", "<slug>"));
```

`release()` when the task lands. Nothing imports it — `mcp__site__eval` loads it into the tab you drive (the how-to lives in `.claude/skills/layout/caveats.md`).

## Watch out

- A claim survives the reloads your own edits cause: `sessionStorage` + `reclaim()` on boot in `DevBar.js` — [doc/decisions.md](./doc/decisions.md).
- `claim.js` reads `View` from `core/View/View.js`, not `/app.js`: DevBar imports it, and the circle only fails on a deep reload — [doc/decisions.md](./doc/decisions.md).
- A ring on `body` paints nothing (`--prim` lives on `.app`), so it appends inside `.app` — [doc/decisions.md](./doc/decisions.md).
- Every route change rewrites `document.title`; a `MutationObserver` keeps the 🟠 — [doc/decisions.md](./doc/decisions.md).
- Nothing releases on its own; a dead session leaves a ring on a tab nobody drives — [doc/decisions.md](./doc/decisions.md).

## More

- [Overview](/framework/dev/Claim/) · [`doc/decisions.md`](./doc/decisions.md) — why a module, the reload finding, open items
- Files that matter: `claim.js` (claim/release/reclaim), `claim.css` (ring and label), `page.js` (live demo)
