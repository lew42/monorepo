# Voice: one logged mastermind per session

A voice session's first question spawns its own mastermind. Every later question in that session goes to it, and it logs everything.

Budget: $10. Load the `sub-mastermind` and `code` skills first. Read `Servex/ext/remote/RemoteMCP.js` (the gateway: one tool `ask_mastermind`; `mastermind()` picks the first live `task-mastermind-*`/`mastermind-*` agent, which fails with "no live mastermind" after a Servex restart or when the only mastermind is a VS Code tab) and `Servex/doc/module-inbox.md` ("how work passes between agents today"). The owner's words (2026-10-15, after the first voice call reached the tool and got "no live mastermind"): "how is it determining which mastermind to use? … does the voice session get tracked via the MCP? … we could simply do 1:1 (spawn a new mastermind for each voice session, to always start fresh). The masterminds should, as always, log their work, so future sessions can see progress/updates per module." Your log is this dir's `task.jsonl`.

## Deliverable

1. **The gateway tracks MCP sessions**: on `initialize` it mints an id and returns it as the `Mcp-Session-Id` header (Streamable HTTP); every later request carries it; a request without one falls back to the day's session (`voice-YYYY-MM-DD`). `RemoteMCP.sessions` is a map session → `{agent, dir, started, last}` persisted beside `remote.token` (`remote.sessions.json`) so a Servex restart does not lose it.
2. **1:1**: the first `ask_mastermind` in a session spawns one Servex agent. `REMOTE_MCP_TARGET` still overrides.
   - **Agent**: role `mastermind`, Sonnet, name `voice-<short id>`, `dormant_after: 600`.
   - **Task dir**: `ai/sessions/YYYY/MM/DD/voice-<short id>/` (the TaskDirs convention), with a card from `create_card` titled "Voice session <date time>".
   - **First prompt**: you are this voice session's mastermind; answer from `ai/handover.md`, the readme chain and the pages, never from memory.
   - **Logging**: every question and answer is a `chat` line in your task.jsonl (`from: "owner (voice)"` / `from: "voice-mastermind"`).
   - **Real asks** (build this, fix that) go through `module_inbox` or `spawn_agent`; say what you did. A plain question gets two or three sentences.
   - **Later questions** in the session go to that agent (`send_to_agent`, revive if dormant), waiting up to 60 s. A new session gets a fresh agent.
3. **The reply when nothing answers in 60 s** names the session's task dir link, as today. One log line per call in `ai/log.jsonl` (`remote_mcp`) now includes the session id and the agent id.
4. Tests on a private Servex port with curl: `initialize` returns a session id; two asks in one session reach one agent (its task.jsonl has both `chat` pairs); an ask in a second session spawns a second agent; a request without a session id uses the day agent; after a simulated restart (reload `remote.sessions.json`) the same session still routes to the same agent.
5. `ux/Dictate/doc/voice-bridge.md` gets a section "One mastermind per voice session" (five lines: how it is chosen, where it logs, how to find a session's log on the Sessions page); card report (title "Voice: each voice session gets its own mastermind, logged"); landing line checked with `tail -1`; `merge.mjs`; the live Servex is restarted by the parent mastermind (the tunnel process stays up; the gateway comes back with Servex).

Fence: `Servex/ext/remote/**`, the one doc section, this task dir. Never print or commit the token or the tunnel address. Sonnet.
