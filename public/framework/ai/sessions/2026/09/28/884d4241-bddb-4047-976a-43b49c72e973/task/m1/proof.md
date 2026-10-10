# Minion 1 — proof

Every page now has a ☰ in its top right. It opens the drawer on five tabs, and the open tab is in the url. All shots are headless Playwright against this worktree's server (http://localhost:62178/). The key ones, one per deliverable, are committed in [`../proof/`](../proof/); every shot taken is on disk in the worktree's `../shots/`, which the repo ignores.

| # | Deliverable | Done | Shot |
|---|---|---|---|
| 1 | ☰ top right on every page; a click opens, a second click (or ✕) shuts; it covers neither the page head nor the dev bar | yes | [menu-3440-devbar.png](../proof/menu-3440-devbar.png) (dev bar open, ☰ beside it) |
| 2 | Five tabs, routed: `?drawer=sessions` opens Sessions, a click rewrites the url with `replaceState`, a reload lands on the same tab | yes | [reload-sessions.png](../proof/reload-sessions.png) |
| 3 | AI tab: the site's chat composer, imported (`ext/Chat/Composer.js`, with the tab's own `deliver(entry)`; before 2026-09-28 15:10 it was `ai2/compose.js`); a model picker that only stores; on a card it sends where the card sends; on a page `send()` tries `/api/page-ai`, then falls back to Ask | yes | [plain-ai-1920.png](../proof/plain-ai-1920.png) · [card-ai-1920.png](../proof/card-ai-1920.png) |
| 4 | Sessions: this page's Ask threads; a click reopens one in the AI tab and the next send resumes it; a card's sub-cards listed too | yes | [thread-resumed-1280.png](../proof/thread-resumed-1280.png) (an old thread answers "we'd been tracing how devbar → socket → claude CLI → task.jsonl drives the live reload") · [card-sessions-1280.png](../proof/card-sessions-1280.png) |
| 5 | Dictation embeds the playground; Settings and Admin reuse the dev bar's own controls | yes | [tab-dictation-1280.png](../proof/tab-dictation-1280.png) · [tab-settings-1280.png](../proof/tab-settings-1280.png) · [tab-admin-1280.png](../proof/tab-admin-1280.png) |
| 6 | Docs: `ext/drawer/doc/tabs.md` (screenshot first), a readme line, a live demo on the drawer page | yes | [/framework/ext/drawer/doc/tabs/](/framework/ext/drawer/doc/tabs/) |
| + | `drawer.page(path)` (mastermind's addition): every tab reads it; a change redraws the open tab | yes | doc/tabs.md |

## Things to know

- **The Dictation tab needs the playground merged.** `ux/Dictate/playground/` is still uncommitted in the main tree, so it is not in this worktree. For the shot it was copied in and removed afterwards. Without it, the tab says so in one line (and the browser logs one 404 for the missing module).
- **An old thread's session can be gone.** `test-thread`'s saved session no longer exists on disk, so `--resume` answered nothing. `send()` now starts a fresh session in the same thread and hands it the thread's last turns; the shot shows it remembering the conversation.
- **One edit outside the fence:** `ext/layout/panel.js`, two lines. Its page-wide click listener redrew the shared drawer with its own "nothing selected" view on every click, which replaced the tabs and stopped the ☰ from ever shutting its own drawer. It now redraws only a drawer it filled itself. Its own panel still opens and works (checked on `/framework/ext/layout/`).
- **Seams added:** `drawer.js` gained `drawer.filled_by()`, `drawer.page()` and a `drawer-close` event.
- **Not mine, still broken:** `styles/layouts/space/page.js` rewrites its own url and drops every query (so `?drawer=` too); `/docs/syntax/` linked from the Space page 404s; AI 2 asks for a missing `ai/usage.json`.
- Smoke: `node Server/smoke.mjs` over the drawer, layout, Space and card pages: no errors on these pages; the two failures are the old links above.
- **The composer moved to `ext/Chat`** (someone else's rewrite in the main tree). This branch no longer touches `ai2/compose.js`: it shows zero diff against `michael/dev`. The AI tab imports `ext/Chat/Composer.js` and brings its own `deliver(entry)`. On a card, that is a copy of AI 2's card post (Servex's prompt log plus the card's own copy); on a page, it is `send()`. [plain-ai-1920.png](../proof/plain-ai-1920.png) · [card-ai-1920.png](../proof/card-ai-1920.png) were re-shot with the new composer.
