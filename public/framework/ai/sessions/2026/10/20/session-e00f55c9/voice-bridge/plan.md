# Voice bridge: plan

**Goal:** the Claude app's voice agent hears an ack in under 1 s and the mastermind's first words within seconds, with no minute-long blind wait. Measured today: [voice-agents.md §4](/framework/ai/doc/voice-agents.md).

## Where the time goes today

- **The door is fast:** a call through `/mcp/remote` takes 3–110 ms locally, and `ask_mastermind wait:false` returns its ticket in 64–89 ms.
- **The mastermind is slow to speak:** in 59 past voice turns it made its first tool call at a median 10 s, said its first words at 40 s, and finished at 51 s. It works before it speaks.
- **The wait is blind:** `ask_mastermind` waits up to 60 s and says nothing meanwhile; a loud sound cancels it.
- **Spawns can stall forever:** a voice mastermind is spawned on an app connection's first ask, and the spawn gate holds it while free memory is under 2.5 GB (1.2 GB today).

## The bridge (all in `Servex/ext/remote/RemoteMCP.js`, one class, one file)

1. **Say first.** The message to the mastermind asks for ONE plain sentence before any tool call (the answer, or what it is doing and how long). Servex already streams every agent's text as `delta` events through `agents.watch`; RemoteMCP listens there, as `Sessions.listen()` does, and keeps a **ticket** per question: status, what it is doing (its latest tool), first words, answer, done.
2. **Short wait by default.** `ask_mastermind` waits at most 8 s (was 60 s). It returns the answer if it has one; otherwise the ticket, the honest status ("waiting for memory: 1.2 of 2.5 GB free", "working: reading X") and any first words, which the voice agent can say at once.
3. **`voice_hear({ticket})`:** a short long-poll (8 s by default, 20 s max). It returns the moment anything changes (first words, a new tool, the answer), else when the time is up. Cancel-safe: every reply carries the whole state so far, so a call cut off by noise loses nothing.
4. **Answers ride along.** Any tool result on the remote route (`cloud_voice_log`, which the agent calls every turn, included) carries new words from an open ticket. The voice agent hears the answer without asking for it.
5. **Never wait on a spawn.** `ask_mastermind({to})` sends to any agent (`vscode-mastermind`, a running mastermind). When the connection's own mastermind is queued at the gate, the ask goes to the fallback named in `remote.fallback` (or `REMOTE_MCP_FALLBACK`) and the status says so.
6. **Effort: unchanged.** A medium-effort spawn was planned for faster first words; measured, Opus said its first sentence at 8.6 s on medium and 8.7 s on high ([first-words.mjs](first-words.mjs)), so it was dropped.

## Decisions and alternatives

- **Long-poll + piggyback, not push.** The app can only pull. SSE `notifications/progress` would be a true push, but the connector is plain POST/JSON, and whether live mode shows progress is unknown. Worth one test later.
- **Not the peer `SendMessage`** into the VS Code tab: it never arrived in the test (voice-agents.md §4).
- **Fallback, not a gate bypass.** Letting voice masterminds skip the memory gate (as `mastermind-servex` does) is one line in `Global.admit`, but it is the gate's owner's call and memory really is short. Ask-first list, below.

## Ask-first (for the owner)

- Let voice masterminds skip the memory gate, like `mastermind-servex`.
- Who the default fallback is (`vscode-mastermind` today, which needs its Monitor armed).
- The 137 leftover `node` processes holding 6.7 GB (traced by `minion-proc-trace`).

## Proof

- `RemoteMCP.test.mjs`: ack under 1 s; first words through `voice_hear` before the answer; an answer riding on `cloud_voice_log`; a queued mastermind routed to the fallback.
- `measure.mjs --bridge` against a test door with a fake agent that streams on a real agent's timing; the live numbers after the owner restarts Servex.
