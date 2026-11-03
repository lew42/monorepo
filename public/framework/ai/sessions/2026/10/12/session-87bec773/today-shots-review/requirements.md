# Today's UI, checked before the owner finds it broken (brief)

**Why:** the owner said most of what lands "fails on first pass", and they end up chasing fixes. Today (2026-10-12) about 20 tasks landed UI. The new [Shots](/framework/ext/Shots/) system (`screenshot-system`) can now shoot and diff pages, so use it on today's work before the owner opens it.

## Pages to check (the UI that landed today)
- `/framework/ai/sessions/`: list and a session detail (sessions-grid, sessions-detail, data-grid, server-query, page-inbox)
- the [Figma](/framework/ext/Figma/) subpages (style-system, figma-colors-fix)
- [ext/DataGrid](/framework/ext/DataGrid/), the UI library page (ui-library), the layout catalog (layout-catalog)
- the AI inbox rail (inbox-scrollbar), one page's Inbox tab (page-inbox)
- [Refine](/framework/ext/Refine/) and one chat input (refine-haiku-live)
- the core/Page template demo (page-templates)

## Done when
- [ ] Shots at 400/1200/1920/3440 for each page, saved through Shots (in the page's `screenshots/`).
- [ ] Read each yourself and list concrete defects only, one line each with the shot: clipped or truncated text, crammed columns, overflow or horizontal scroll, broken padding (a `needs_parent_padding` item in an unpadded box), wrong colours (prime must be `--prime`), console errors (`Server/smoke.mjs`).
- [ ] Fix what is quick and clearly right (worktree, `hold.mjs`, re-shoot, commit each). Send what isn't quick to the owning task's mastermind (`send_to_agent` now works between peers) or add one line to `ai/todo.md`.
- [ ] `report.md`: a table of page | defects found | fixed | handed off, plus before/after thumbnails. Merge; land.

Sonnet 5.5. `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
