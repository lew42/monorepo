# Omnibox — a keyboard-first search field, always on screen, that ranks the current topic first and the whole site second

## Use
```js
import { Omnibox } from "/framework/ext/Omnibox/Omnibox.js";

new Omnibox({ app: this.app, page: this });   // a View — built and mounted on construction
```
`page` is whatever hosts it — `this.page.topic()` (Page's own `nearest("topic")`) decides what counts as "local"; no topic means the page's own subtree. `app` is what navigates (`app.router.go(url)`).

Open from **anywhere**: `/` when nothing editable already has focus, or Ctrl/Cmd+K always. **Esc** closes. Arrows move, **Enter** navigates, **Tab** completes the top match. A **Space** on an empty box switches search → command.

## Watch out
- **The index is one fetch of `/directory.json`**, built once and logged (`index built — N urls in Xms`) — no crawl, no server, and it does not know about a page's `route()`-only urls (nothing on disk to read). [`doc/decisions.md`](./doc/decisions.md)
- **The highlighted result's preview is the page's own `preview()`**, borrowed the way [`core/Page/doc/previews.md`](/framework/core/Page/doc/previews.md) blesses — a real import for a `page.js` row, the same fetch `Page.file()` makes for an `.md` row. Arrowing fast fires more than one; a token guard keeps only the last paint.
- **Command mode is a prototype, not a palette** — three hardcoded links, to prove the branch exists. [`doc/decisions.md`](./doc/decisions.md) has the one way the Space trigger is honestly wrong.
- **The global keydown listener is never removed** — this is meant to be reachable for the page's whole lifetime, the same as the shell it sits in.
- Not now: users, content search inside a page, chat.

## More
- [/framework/ext/Omnibox/](/framework/ext/Omnibox/) — the page: type, arrow, go
- [`doc/decisions.md`](./doc/decisions.md) — the interaction-model verdicts: why a visible field and not only a modal, what "strong" means for ranking, the Space verdict
- Demo over the real site index: [/imagine/platform/omnibox/](/imagine/platform/omnibox/)
- Read first: [`ux/Filter`](/framework/ux/Filter/) (segment + search → predicate), [`ext/Dropdown`](/framework/ext/Dropdown/) (the top-layer popover this borrows), [`core/Page` roles](/framework/core/Page/doc/roles/) (`is: "topic"`, `nearest()`)
- Files: `Omnibox.js` (the class + `Omnibox.Index`, the index/ranking part), `Omnibox.css` (`omnibox-` prefix), `page.js` (this page)
