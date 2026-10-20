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

- **`updates`** (`External.updates()`, registered by `External.tool()`, so it is on the whole registry and the remote door): returns the lines of the caller's inbox (`logs/inbox/<caller>` file under Servex's home) that arrived after its cursor, oldest first, at most 50 (`more: true` = call again), and moves the cursor. `peek: true` reads without moving it. The cursor is a byte offset in a `.cursor` file beside the inbox; the first call returns the backlog (capped); an unfinished last line waits for its newline.
- **Subscribing:** `follow({path, agent: "voice-app"})` ([follow.md](../../../doc/follow.md)) lands each delta in that inbox. `updates` (and `RemoteMCP.hint()` on any remote call) makes the caller an external agent, so `follow` and `send_to_agent` can address `voice-app`.
- **The hint (item 1):** `RemoteMCP.hint()` adds one text item, "N new updates for you: call updates.", to every other remote tool result while the cursor is behind, and nothing otherwise.
- **The directive:** one sentence in `RemoteMCP.INSTRUCTIONS`: call `updates` at the start of nearly every turn.
- Tests: `node Servex/ext/remote/RemoteMCP.test.mjs`. Live after a Servex restart.

## Not built

- The inbox holds only what is sent to `voice-app` or followed for it. `/live/` and the children's logs arrive only if the agent calls `follow` on them; nothing subscribes automatically.
- The first-call backlog is not trimmed to "from now"; the cap bounds it.
