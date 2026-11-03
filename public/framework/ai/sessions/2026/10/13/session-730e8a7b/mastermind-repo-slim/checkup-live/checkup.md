# Checkup: the /live page

/live is now a blank slate: three views (Now, Tasks, Archive), and the 12 old cards are kept at [/live/archive/](/live/archive/). Nothing was deleted.

| Task | State | Open | Decision | Next |
|---|---|---|---|---|
| [live-cards](/framework/ai/sessions/2026/10/16/voice-20261016/live-cards/) | landed (cards open at `/live/<id>/`, full-bleed code, `wrap` fence word) | nothing | closing line written | none |
| [live-pointers](/framework/ai/sessions/2026/10/16/voice-20261016/live-pointers/) | the pointer cards had landed (b9cf153f8); its last step was the archive move | nothing | closed, with the archive move as its finish | none |
| [live-feed](/framework/ai/sessions/2026/10/16/voice-20261016/live-feed/) | on dev, page shows it | nothing | already closed | none |
| [live-today](/framework/ai/sessions/2026/10/16/voice-20261016/live-today/) | on dev, page shows it | Today is folded into the Now view | already closed | none |
| [task-closeout](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) | on dev | nothing | already closed | none |
| The /live root ([page](/live/), [archive](/live/archive/), [Now](/live/now/)) | merged and applied | Now refreshes on a 30 s timer, not a stream | see below | a stream from the session writer (doc/notes.md) |

Per-card plan (agent-written text vs views): [public/live/doc/notes.md](/live/doc/notes.md), "Every card that was on /live".

## Decisions made for the owner

- **The archive is a byte-for-byte copy plus a clear, not a rewrite of the log.** Alternative: rewrite page.jsonl with only the new cards. That loses history and races the voice agent, which appends to the same file. `ArchiveMove.mjs --undo` re-adds the old cards.
- **Now is a view of data, not a card of text.** It reuses `LiveToday.load` for today and yesterday (UTC), and counts a session as in flight only if it was active in the last 30 minutes. Alternative: ask `list_agents`; only the server can call that, the page cannot.
- **The Now tile in the feed is just "Now"; the counts are on its page.** This follows your 2026-10-16 note that a tile is its title. The Tasks tile still shows counts: that is older work and I left it.
- **The archive draws the old Now/Tasks cards as the text they were**, not live data, so "kept as they were" is true.
- **live-pointers was not rebuilt.** The cards became pointers or views by the move itself; a second pointer system would be a second version of the same thing.
- **The merge ran from a worktree with `merge.mjs`; the page's data move ran on the main tree after the merge**, because the voice agent appends to page.jsonl at the same time.

## Needs the owner

Nothing. The worktree `live-archive` was left on disk with its test copies of the move (they are reproduced in the main tree); remove it with `git worktree remove` when convenient. No Servex restart needed.
