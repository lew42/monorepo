# Docs check — page Inbox

Read `ext/drawer/readme.md` + `doc/inbox.md`, and `Servex/readme.md` + `doc/inbox.md`.

**Makes sense, and is enough to do the job — with one real gap.**

- Owner path is clear: "Leave a note" button in the AI tab head row, type, Enter; Clear next to any row. No ambiguity.
- Agent path names the tools plainly — `drop(path, text)`, `clear(path, id)`, `inbox(path)` — and a page-form path (`POST /api/inbox/drop|clear`, `GET /api/inbox`).
- **Gap: neither readme links `doc/inbox.md`.** Both are reachable only because this brief named them; a reader going off the readme's own index/prose would never find the Inbox section. Worth one line + link added to each readme.
- **Untestable right now, and the docs say why**: `Servex/doc/inbox.md`'s last line — "New tools and routes go live only after a Servex restart" — and indeed `drop`/`clear`/`inbox` aren't in this session's live MCP tool list. So "leave a note and clear it" can't be proven end-to-end until a restart; that's a real trap, correctly documented, not a doc flaw.
- Minor: drawer's doc links `/Servex/doc/inbox.md` as if it were a site URL; Servex isn't served on the site, so that link 404s for a reader on the page. Small, cosmetic.

Verdict: docs are sufficient once discoverable and once Servex has restarted.
