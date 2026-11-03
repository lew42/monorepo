# The single seat's only reply: `say`, `nothing`, `retract_say` (ask2a-say-tools, 2026-11-03)

Plain text from the single seat (`single_seat()`) is never a reply any more. `heard()` always writes it as a muted `skip` line
instead (`Sessions.js:1700`-`1708`), cue open or not — the `(pause)` cue still sends exactly as before, but its text no longer
becomes anything the owner hears or sees.

Three tools reach every agent (one shared tool list, no new MCP server — the same way the `item` tool does), but each handler
checks `ctx.caller` against the single seat's own minted agent id (`single-voice-assistant-<session id>`) and refuses any other
caller with `{ok: false, why}`, so they only ever DO anything for the one seat they are for:

- **`say({text, re?})`** (`Servex/agents/tools.js:215`, `Sessions.js:785` `queue_say`) — queues a reply. Returns `{id}` at once;
  writes nothing until the gate below releases it.
- **`nothing()`** (`tools.js:228`) — a pure no-op, same as ending the turn with no text at all.
- **`retract_say({id})`** (`tools.js:235`, `Sessions.js:794`) — takes a queued say back before it is released.

## The gate

A queued say is released by `release_say` (`Sessions.js:838`) once the floor has been "done" for `say_gate_ms` (`Sessions.js:803`):

| Band | Default | Env override | When |
|---|---|---|---|
| question | 600ms | `SERVEX_SESSION_SAY_GATE_QUESTION_MS` | the last owner sentence ends with `?` |
| long dictation | 3000ms | `SERVEX_SESSION_SAY_GATE_LONG_MS` | more than 5 owner sentences since the last release |
| default | 1500ms | `SERVEX_SESSION_SAY_GATE_MS` | everything else |

Boot-env only for now (`defaults()`, same pattern as `single_pause_ms`) — no per-session override exists; adding one would need a
`settings()` key and a place to read it per session, which nothing has asked for yet.

Newest queued say releases first; an older one waits its own gate. A new owner sentence (floor "speaking") cancels the pending
release timer — `set_floor` (`Sessions.js:1327`) — so the say stays queued, not released. A say past 10 deep or 10 minutes old is
dropped with a `skip` line (`why: "stale"`) instead of ever being spoken.

## Written the same way a dual-seat reply always was

`release_say` and `heard()` both build their reply line through one shared method, `reply_line()` (`Sessions.js:825`): a lone
emoji becomes a tap-back reaction, anything else a chat line, threaded when it answers a threaded owner line. A say with no `re`
of its own defaults to `s.smart_re` (the owner's latest sentence), the same fallback `heard()` always used for a dual-seat smart
reply — never a second, almost-the-same copy of that shape.

Tests: [`say-tools.test.mjs`](../say-tools.test.mjs) (the tools and the gate) · [`single-brief.test.mjs`](../single-brief.test.mjs)
(the brief itself — its own words, the real opening prompt a seat is spawned with, and a replayed real session driven through the
real `say`/`nothing`/`retract_say` handlers, with a narration attempt checked to be a muted skip, never a reply).
