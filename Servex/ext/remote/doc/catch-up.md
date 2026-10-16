# Catch-up: the voice agent hears what changed (requirement, design only)

**The problem.** The voice agent (`voice-app`, a claude.ai session using this remote MCP) only exists when an owner prompt arrives or a tool result comes back. Nothing reaches it in between, so it misses agent replies, `/live` changes and its children's progress.

**The ask (the owner, via voice-app, 2026-10-16):**
1. Every tool result carries "what changed since your last call" for this voice session, or nothing when nothing changed.
2. Ideally, a hook runs the same catch-up on every owner prompt.

Logged in [core/Page/task.jsonl](../../../../public/framework/core/Page/task.jsonl).

## What is possible today

- **No per-prompt hook exists for claude.ai connectors.** Hooks such as `UserPromptSubmit` are a Claude Code feature and run on the user's own machine. A claude.ai chat runs in Anthropic's cloud, and its model decides when to call a tool.
- **No push either.** Claude's MCP client "doesn't yet support resource subscriptions" or sampling ([Build an MCP server for Claude](https://claude.com/docs/connectors/building)).
- **The only channel is the tool result.** In practice that already covers every prompt, because `RemoteMCP.INSTRUCTIONS` tells the voice agent to call `ask_mastermind` before it says anything.

## The Servex change (not built)

- **Where:** `RemoteMCP.js`, in the `tools/call` handler. After any tool's result is ready, add one more text item: the new lines since this session's last call. Add nothing when there are none.
- **Cursor:** keep one byte offset per file per MCP session in `this.sessions[sid].offsets`, saved where the sessions already are. The first call starts at the end of each file, so no history floods in.
- **Files to tail:**
  - the replies addressed to `voice-app` (which file holds them is still to confirm)
  - `/live/page.jsonl`
  - the `session.jsonl` or `task.jsonl` of every agent whose parent is this session's agent
- **Reuse, don't rebuild:** `Servex/Follow.js` already watches files and keeps offsets for agents. The catch-up is one more Follow subscriber whose mailbox is drained by the next tool result, not a second tailer.
- **Size:** one short line per change, capped at about 2,000 characters, with "+N more" when the cap is hit (claude.ai allows about 150,000 characters per result).
