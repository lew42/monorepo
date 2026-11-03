# What the Agent SDK does not tell you

Everything here was measured on 2026-09-22 against the installed
`@anthropic-ai/claude-agent-sdk` **0.3.280**, on Windows, with Haiku 4.5 at low effort.
None of it is in the package's `.d.ts`.

## The option names are real

The two the owner remembered both exist and are both on by default in `Agent.options()`:

- **`includePartialMessages: true`** — the SDK then emits `SDKPartialAssistantMessage`
  frames (`type: "stream_event"`) carrying raw Messages-API streaming events. The token
  chunks are `event.type === "content_block_delta"` with `event.delta.type === "text_delta"`.
  That is where every `delta` event in our log comes from.
- **`forwardSubagentText: true`** — without it, an agent that starts its own Task subagents
  only forwards their `tool_use`/`tool_result` blocks, which is enough for a heartbeat
  counter and nothing else. With it, the nested conversation arrives as assistant messages
  with `parent_tool_use_id` set — that is our `subagent` event.

`effort` is a plain top-level option taking `low | medium | high | xhigh | max`. A session
id can be supplied with `sessionId`; we let the SDK generate one and keep it.

## Permissions: the SDK is not the CLI

`--permission-mode bypassPermissions` is refused by the CLI's classifier. The SDK equivalent
is **not** refused: `permissionMode: "bypassPermissions"` plus `allowDangerouslySkipPermissions:
true` works first try. Proven by `demo.mjs` step 5 — a Haiku agent ran `node --version`
through Bash and wrote the version to a file, unattended.

`acceptEdits` (our default) lets an agent edit files but still asks about commands.

## A message either waits its turn or cancels the turn

`SDKUserMessage.priority` is typed `'now' | 'next' | 'later'` with no documentation. Measured:

- **No priority (the default)** — the message queues. An agent counting to 60 finished all
  sixty numbers, *then* answered the injected message. Nothing was lost.
- **`priority: "now"`** — the running turn is cancelled. Its result arrives immediately with
  `is_error: true` and `result: null`, and the next turn starts on the injected text.

So "stop" is a `now`, and "when you're done, also…" is not. `Agents.Agent.send()` exposes it.

## `result.result` is not the last thing the agent said

A turn cancelled by a `now` message hands its partial text to the **next** turn's result. In
one run the steered answer streamed normally while the following `result` carried the
abandoned counting instead. Two demo rewrites were spent on this.

**Read `transcript` events for what was said. Read `result` for cost, duration and turns.**

## An agent is not idle just because a turn ended

`SDKResultSuccess.queued_turn_count` says how many user sends are still waiting behind this
result. Flipping the agent to `idle` on every result made a watcher read the gap between two
queued turns as "finished": it acted on a half-done agent, its interrupt hit an empty moment,
and the real turn then ran free to completion. `Agent.result()` now keeps the state at
`working` until that count is zero.

The same gap bites a caller: a turn takes two or three seconds to spin up, so "idle and quiet"
is briefly true *before* the answer starts. Wait for the first token, then for the silence —
`demo.mjs`'s `answered()` is that gate.

## `query.close()` leaks the child process

After a demo run one `claude.exe` was still alive and idling. `Agent.stop()` now does all
three: closes the prompt queue, closes the query, and aborts an `AbortController` passed in
as the `abortController` option. Measured after the fix: one child spawned, zero alive four
seconds after `stop()`.

## An injected message competes with the standing prompt

Told "Do not stop early" in its first prompt, a Haiku agent **refused** a mid-run "stop at
ten" — "I appreciate the test, but I'm sticking with the original instruction." It is not a
transport failure; the agent read the message and chose the older instruction. Leave the
first prompt room to be steered. The demo's counting prompt now ends "…unless somebody sends
you a message telling you otherwise."

## The CLI re-announces itself every turn

`system/init` arrives at the top of every turn, not only the first. `Agent.began()` ignores
it unless the session id is new, or the log fills with duplicate session banners.

## Settings load by default

Omit `settingSources` and the SDK loads user, project and local settings exactly like the
CLI — `CLAUDE.md`, hooks and all. That is right for a real minion in this repo and wasteful
for a cheap one. Pass `setting_sources: []` for an isolated agent; `demo.mjs` does.

## Timing, for expectation-setting

Spawn to first token, Haiku at low effort with no settings loaded: **2.2s – 3.7s** across
five runs. One run on a heavily loaded machine (fourteen other `claude.exe` processes) took
**47 seconds** — the number is machine load, not a constant. Plan for seconds, not
milliseconds, and never gate on a stopwatch.

## Forks, resumes and restarts (measured 2026-09-24, Haiku 4.5, SDK 0.3.280)

Proofs: `fork-proof.mjs` and `revive-proof.mjs`, beside `Agents.js`.

- **A session can be forked mid-turn.** Its transcript ends in the unanswered `tool_use` of
  the very call that forks it; plain `resume` + `forkSession: true` handles that. No
  `resumeSessionAt`, no standalone `forkSession()` needed.
- **The fork's tool list must match the parent's, or the cache misses completely.** Same
  tools: 35,534 tokens read from cache, 3,550 written. `tools: []`: 0 read, 44,268 written.
  Tools sit at the front of the cached prefix. So a fork keeps every tool and a PreToolUse
  hook refuses the calls, which works even under `bypassPermissions`.
- **A fork is cheap.** It reads about 98% of its input from the parent's cache. The cost is
  its own output.
- **One `z.record()` in any in-process tool's schema empties the whole tool list.** The SDK's
  tools/list throws ("Cannot read properties of undefined (reading 'push')"), the server still
  reports `connected`, and the agent sees no tools at all. Use `z.looseObject({})` for a free-form object.
- **In-process MCP tools are deferred behind ToolSearch by default.** A Haiku agent then
  says the tool is "not available". Pass `alwaysLoad: true` to `createSdkMcpServer`.
- **`Agent.door()` used to drop `mcp_servers` when the host had no HTTP url.** A standalone
  host's in-process servers never reached the agent. Fixed.
- **A resume without `fork` keeps the same session id.** The SDK appends to the same file.
- **Killing the host kills its `claude` child too.** Its stdin closes, so no orphan is
  left, but the tool call that was running is lost. The resumed session copes with the
  unanswered `tool_use`; told to "check and continue", the agent simply ran the command
  again.
- **A registry row written before `system/init` has no session id,** so it cannot be
  revived. `began()` now re-registers the moment the id arrives.
- **`context_tokens` is carried only by hook inputs** (SessionStart, model switch), never by
  a result. And `result.usage` sums every API call in the turn, so it over-counts. The
  honest context size is the LAST main-thread assistant message's usage: input +
  cache_read + cache_creation + output.
- **claude.ai connectors load even with `settingSources: []`.** They show as `pending` in
  `system/init`, and their tools are deferred.
