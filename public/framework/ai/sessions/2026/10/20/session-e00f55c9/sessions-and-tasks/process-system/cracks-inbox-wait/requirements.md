Budget: $6

# Close two cracks: unread inboxes, and waiting on anyone but the owner

Rows 1 and 5 of `public/framework/core/Task/doc/cracks.md`. Extend the existing `Servex/TaskLoop.js` tick (and `Heartbeat.drain()` for inboxes); no second loop. Read `Servex/doc/task-loop.md` first.

1. **Every inbox gets read.** 454 lines in 69 of 89 `inbox.jsonl` files were never read; today only `Heartbeat.drain()` reads one, when it revives the parent. On the tick, for each inbox with unread lines (find how "read" is marked today; if nothing marks it, add a read cursor line or a sibling `inbox.read` offset, whichever matches the store's pattern):
   - its agent is live → deliver the unread lines to it as one message (the same path drain uses), mark them read;
   - its agent is stopped or gone → leave them, but list the inbox on the board once (one card per inbox, not per tick) so the owner or a mastermind sees it;
   - a backlog older than 7 days is marked read with a note, never delivered (it would flood an agent).
2. **Waiting on anything gets reminded.** The `waiting` branch of `tick()` reminds only `waiting_on: "owner"`. A task waiting on an agent id or on a task path: after the same interval, message that agent (or the agent of that task) once: "<task> is waiting on you for <waiting_what>". After 3 reminders with no change, flag it the way the chase flags (reuse that code from `TaskLoop-chase`).
3. Docs: update rows 1 and 5 of cracks.md (what now closes it), and `Servex/doc/task-loop.md`.

Done means: tests with a temp store (`Servex/agents/test-store.mjs` sets LEDGER_ROOT) and a fake clock: a live agent gets its unread lines once and they are marked read; a stopped agent's inbox makes one card; a task waiting on an agent gets one reminder per interval, a flag after 3. Existing TaskLoop tests pass. Commit in your worktree, do not merge. Final reply: commits, pass counts, how "read" is marked.
