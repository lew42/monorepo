# The cloud voice session log: proposal

A proposal for [requirement 9](requirements.md). Nothing is built yet.

## Today

- **Nothing on disk is the cloud voice session itself.** The `voice-20261016/` folder belongs to the mastermind that the remote door spawns (`RemoteMCP.spawn()` in `Servex/ext/remote/RemoteMCP.js`).
- **The door records the owner's words for `ask_mastermind` only.** That call writes a `chat` line in the mastermind's `task.jsonl` and a line in `ai/log.jsonl`. Every other tool call (page_add, send_to_agent, ...) leaves no record of what the owner said.
- **The MCP server never sees the owner's message.** It sees only the tool arguments that the voice model writes. So no server-side hook can capture the owner's exact words by itself.
- **Today, one cloud session means one day.** The door mints an `Mcp-Session-Id` on `initialize`, but the Claude app does not send it back. So the session id falls back to `voice-<date>` (`RemoteMCP.js:116`), which is where the folder name `voice-20261016` comes from.

## Where it lives

```
sessions/2026/10/16/
  cloud-voice-20261016/          ← a ROOT session (the shape in shape.md)
    session.jsonl                ← line 1: {session:{id:"voice-2026-10-16", kind:"cloud", client:"claude-app", started}}
                                   then {owner:{at, text, cloud:true, via:"<tool>"}} and {call:{at, tool, ms}}
    subsessions/
      voice-20261016/            ← the voice mastermind (moved later by a script; for now, one link line)
```

## The smallest mechanism

- **One optional argument, `heard`, on every tool the door lists.** It holds the owner's last message, word for word. The door's instructions tell the voice model to include it on its first tool call of each turn.
- **The door takes it out and writes it.** Before the call runs, `RemoteMCP.post()` removes `heard` and appends one `owner` line (skipped when it repeats the previous one). It also appends a `call` line for every tool call. This is about 20 lines in `RemoteMCP.js`. Code writes the lines, and the server stamps the time.
- **Rejected: a separate `log_owner` tool.** It would be one more call the model can forget, while `heard` travels on calls the model already makes.
- **Noted for later (the owner, 2026-10-16):** every cloud "Claude session" gets its own session folder. Not built.
  - A per-prompt hook logs the owner's prompts through the MCP.
  - It is this proposal, widened from voice to every cloud session.
  - The log is its only record: a cloud session has no transcript on this PC ([R14](answers.md#r14)).
- **⚠️ The caveat:** "word for word" still depends on the voice model copying the owner's words. The true record is the claude.ai conversation, and this PC cannot read it.
