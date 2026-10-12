# The Inbox tab: every page has one, unread first, archive to zero

Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it." Brief: `ai/sessions/2026/10/12/session-87bec773/page-inbox/requirements.md`.

- **Class:** `PageInbox` (`core/Page/PageInbox.js`, `Page.Inbox`). One component for every surface; the older drawer box and rail (`ext/Inbox`) read the same notes.
- **Where it shows:** a Doc page gets an `Inbox` tab (`Doc.inbox_section()`, label `Inbox · N` for unread). Any other page answers `inbox/` as a built-in route (like `md/` and `fs/`) and shows a small `Inbox · N` link at its end, only when notes are open. Opt out with `no_inbox: true`.
- **Data:** the notes already in the page's own `page.jsonl` (`page_note` writes `{"note":…}`; `drop` writes `{"inbox":…}`), streamed with `JSONL.live`, so reading works with Servex down.
- **Read and archive are deltas:** Servex `POST /api/inbox/mark {path, ids, state}` appends `{"note_state":{id,state,by,at}}` (state `read` or `archived`; last line wins). Nothing is deleted. Opening the tab marks new notes read; this visit still shows them as new.
- **Decision (what goes in):** agent notes and landings only. A reminder of every question the owner asked would flood it, so answered questions get no record. Alternative: log owner questions as notes; not done.
- **Needs a Servex restart** to get the new route; until then marking shows "Not saved".
