# Catch-up: the voice agent hears what changed (built 2026-10-20: the `updates` tool)

**The problem.** The voice agent (`voice-app`, a claude.ai session using this remote MCP) only exists when an owner prompt arrives or a tool result comes back. Nothing reaches it in between, so it misses agent replies, `/live` changes and its children's progress.

**The ask (the owner, via voice-app, 2026-10-16):**
1. Every tool result carries "what changed since your last call" for this voice session, or nothing when nothing changed.
2. Ideally, a hook runs the same catch-up on every owner prompt.

Logged in [core/Page/task.jsonl](../../../../public/framework/core/Page/task.jsonl).

## What is possible today

- **No per-prompt hook exists for claude.ai connectors.** Hooks such as `UserPromptSubmit` are a Claude Code feature and run on the user's own machine. A claude.ai chat runs in Anthropic's cloud, and its model decides when to call a tool.
- **No push either.** Claude's MCP client "doesn't yet support resource subscriptions" or sampling ([Build an MCP server for Claude](https://claude.com/docs/connectors/building)).
- **The only channel is the tool result.** In practice that already covers every prompt, because `RemoteMCP.INSTRUCTIONS` tells the voice agent to call `ask_mastermind` before it says anything.


## What is built

- **`updates`** (`External.updates()`, registered by `External.tool()`, so it is on the whole registry and the remote door): returns everything that arrived for THIS caller/conversation since its own cursor, oldest first, at most 50, and moves the cursor. `peek: true` reads without moving it.
- **One place per conversation (2026-11-09, the owner).** The cursor key is `conversation` (pass your claude.ai conversation id) or, with none given, the caller's own voice session id that `RemoteMCP` already resolved for this call (`ctx.session.id` — the dated `cloud-voice-<name>` record), or finally the bare caller — today's original behaviour. Every key's place is one entry in `logs/inbox/<caller>.cursors.json` (`{key: {offset, at, follows}}`); the old single `<caller>.cursor` file is still read as the caller-key's own entry, so an upgrade never jumps anyone's place. **A BRAND NEW key starts at "now"** (the inbox's current end), not the backlog — so a second mastermind that only just started talking to a voice session is never handed a wall of lines meant for someone else's conversation. Its first answer carries `missed`: a digest (below) of what happened between the shared cursor and now, capped to the last 24h.
- **Digest by default.** `updates` returns `{count, more, updates, digest}`: `count` is every raw event read (so paging with `more` stays exact), `digest` is one row per sender — `{from, count, latest}` — and (unless `raw: true`) `updates` itself holds only the newest line per sender, so a caller reading `updates[].text` the old way still works, just compacted. `raw: true` returns every line, as before 2026-11-09.
- **Follows are read here, not pushed to the inbox (step 2).** `follow({path, agent: "voice-app"})` ([follow.md](../../../doc/follow.md)) still records the subscription, but for an external caller `Follow.flush` no longer delivers a `.jsonl` file's lines as an inbox message (a non-jsonl change still gets today's one-line note — there is no line for `updates` to read instead). Instead, `updates` reads each followed file itself, from THIS key's own byte offset (`External.followed_lines`, independent of `Follow`'s own change-detection offsets), and returns each line as `{agent, session, path, line}`. Like the inbox itself, a key's first read of a followed file starts at that file's current end, not its backlog.
- **The hint (item 1):** `RemoteMCP.hint()` adds one text item, "N new updates for you: call updates.", to every other remote tool result while THIS call's own key is behind (resolved the same way `updates` resolves it, so the hint never disagrees with what a later `updates` call finds), and nothing otherwise.
- **No duplicate "done" at the sender (step 4).** `Agents.wake_parent`, when the parent is a registered external agent, compares a "done" report against the same child's last one to that parent after stripping timestamps and ids (`Servex/agents/mark-strip.js`'s `strip_marks`) — hundreds of "Idle and blocked, no change since …" lines, differing only by the clock, used to be the single biggest source of inbox noise (measured below). An identical report is skipped and counted on the host (`this._dup_done_skips`), never logged per occurrence.
- **Rotation (step 5).** Every `deliver()` first calls `External.rotate()`: when the inbox's first line is from an earlier calendar month than now, the part every cursor (the legacy one and every conversation key) has already read moves to `logs/inbox/archive/<caller>-<YYYY-MM>.jsonl` (appended, never overwritten), the live file keeps only what some cursor has not read yet, and every cursor is rebased to the shorter file. A line no cursor has read yet is never archived.
- **The directive:** one sentence in `RemoteMCP.INSTRUCTIONS`: call `updates` at the start of nearly every turn.
- Tests: `node Servex/ext/remote/RemoteMCP.test.mjs`, `node Servex/agents/mark-strip.test.mjs`. Live after a Servex restart.

## Not built

- `/live/` and the children's logs still arrive only if an agent calls `follow` on them; nothing subscribes automatically.
- `missed`'s digest covers only the caller's shared inbox backlog, not a brand-new key's followed files (those simply start at "now" too, with nothing to report missing — there was never a subscription for them before).
- The noise this was built to fix (measured 2026-11-09): `voice-app.jsonl` held 668 lines since October, about 261 unread; 369 began "done:" (finished agents re-reporting "nothing running") and 188 were raw `follow` deltas. Steps 2–4 above are the fix; not yet re-measured after a live restart.
