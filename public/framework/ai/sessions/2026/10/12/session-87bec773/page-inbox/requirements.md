# Every page gets an inbox tab: unread first, archive to zero (brief)

**Owner (2026-10-12, dictated):** "Every core thing, every module should have an inbox; that was sort of the objective. Let's put the inbox system on the page class."
- **Not the default view:** a secondary tab the owner clicks to see recent and unseen things about that page.
- **Read it, then archive or clear it:** inbox zero on every core module, as a way to hand tasks around, keep track and stay notified.
- **What goes in:** live interaction about that thing (agent notes, landings, questions waiting). Maybe a reminder of a question the owner asked, but that could get excessive: small answered questions don't need a record. Decide, and record the alternative.

## Done when (tick each with proof)
- [ ] Past work (`past-work` skill): the page inbox (CLAUDE.md "a note left on a page reaches the agent that owns it"), `ext/Inbox` and the AI inbox rail, `page_note`, `owner-inbox`, `inbox-asks` (chips), `owner_note`. Use what exists (law 6): one inbox component.
- [ ] **An Inbox tab on Page** (opt-out, not per page by hand), with its own route (`…/#inbox` or `…/inbox/`) and an unread count on the tab.
- [ ] **Items are appended deltas** in the page's own data (`page.jsonl` or `inbox.jsonl` beside it), streamed live. Archive or clear is a delta too: never delete.
- [ ] Agents post via the existing tool (`page_note`), so nothing new to learn; show the agent and a link to its session.
- [ ] Live on 3 core modules (Page, DataGrid, Sessions), screenshots at 400/1200/1920/3440.
- [ ] Smoke clean; `hold.mjs`; commit each step; merge.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
