# Brief: edit mode / production mode switch

Owner's words (2026-09-18, 15:20):

> on local development we have the socket server and file system operations; that needs to
> degrade gracefully for production. The whole page editing experience, the content
> management thing, would need the user authenticated or a development mode toggle — some
> simple way to switch the UI from edit mode, where we create and drag and drop, to
> production mode that hides all those buttons so they don't break or become confusing UI.
> And how that works with users and permissions and roles — I don't know how far our
> platform got; look into that.

## What exists

Every editor control today gates itself on the dev socket — `ext/Ask`'s `available()`
(`!Socket.singleton().disabled`), the browser's verdict buttons, the Decisions tab's
Approve/Improve, the rank grips, reply/mic, Make's writes — each with its own check. Find
them:

```
rg -n "available\(\)|disabled" public/framework/ext public/layouts/browse public/imagine/paging/make --glob "*.js"
```

The platform decided six roles (owner / admin / founder / moderator / member / anonymous)
and GitHub + Google sign-in, none wired (`/imagine/platform/decisions/identity.md`; the
scout report `ai/2026-09-18/memery-scout/report.md`). The dev rail
(`public/framework/dev/`) is where a dev-only toggle lives.

## Deliverables

1. **One switch**: `app.edit` (or the seam you choose on `core/App` — read
   `public/framework/core/App/` first; if App is the wrong home, `ext/Ask/edit.js` exporting
   `edit()` and `on_edit(fn)` is the alternative — decide, write the other in the doc) — true
   when the dev socket is live (today's behaviour), false otherwise, and toggleable from the
   dev rail ("Edit" on/off, remembered) so the owner can SEE production mode on localhost.
2. Every editor control reads the one switch instead of its own check: the list above, each
   converted, counted (N controls before, N after), the old checks deleted; a control hidden
   by the switch takes no space (no empty toolbar rows).
3. **Production**: with the switch off, every page that has editor controls renders without
   them and without console errors — prove on your private server
   (`PORT=8136 node server.js`, background, killed by its real Windows PID) by toggling off
   and crawling the run task page, `/layouts/browse/`, `/imagine/paging/make/`, a Decisions
   tab, at 1280: zero controls drawn, zero errors; toggle on: the counts return.
4. **The roles line**, in the doc and the landing: what the platform decided (six roles, two
   providers) and what it would take for the switch to read a signed-in role instead of the
   socket — one paragraph, with the owner item (OAuth apps, 15 min) it depends on.
5. Docs: the switch's readme line where it lives, `doc/decisions.md` there (the record, the
   alternative), one line in each converted module's readme Watch-out ("editor controls
   follow the edit switch").

## Fence

The switch's home (`core/App/**` or `ext/Ask/edit.js`), `public/framework/dev/**` (the
toggle), the converted files named by the `rg` above (the check lines only), this task dir.
Nothing else.

The owner's dev server on port 80 is running: never touch it; LiveReload pushes edits — one
write per file, verify within a minute. Another minion is in `ext/AITask/asks.js` right now
(conclusions-first): coordinate by touching only the gate lines there, and re-read the file
before each write. Never `git stash`, never `find /`, never drive the owner's tabs; an `rg`
pattern starting with `/` returns nothing here — drop the slash.

## Final message shape

One screen: the switch in one line, controls converted N → N, the production crawl verdict,
the roles paragraph, links.
