# `updates`: a cloud agent gets only what changed since its last call

Budget: $10. Sonnet, medium effort. Owner's design (2026-10-20 18:15, said to the cloud voice agent; relayed by the voice mastermind as question 38ce618f; the words are in `ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/session.jsonl`): a cloud agent cannot tail files, so (a) a server-side subscribe keeps a byte offset per subscriber, and (b) an update tool the agent calls on nearly every turn returns only the deltas.

## What exists (reuse, law 6)

- (a) is **`follow`** (`Servex/Follow.js`, doc `Servex/doc/follow.md`): per-subscriber offsets, and `agent` may be another id, so `follow({path, agent:"voice-app"})` lands each delta as a line in `logs/inbox/voice-app.jsonl`. Today (18:12) agents on different platforms talk through files: `Servex/agents/doc/messaging.md` "Across platforms".
- The requirement for (b) was written on 2026-10-16 as a design: `Servex/ext/remote/doc/catch-up.md` ("what changed since your last call, piggybacked on every tool result"). Read it first; it lists what is possible today.
- `read_file` on the inbox returns the whole file; that is the gap.

## Build

1. One tool, **`updates`** (name it that unless catch-up.md argues for another; never two), on the Servex registry and so on the remote door (`Servex/ext/remote/RemoteMCP.js` serves the whole registry): keeps a cursor per caller (`ctx.caller`, e.g. `voice-app`; stored beside the inbox, `logs/inbox/<id>.cursor` or one JSON), returns only the inbox lines after the cursor and advances it; an optional `peek: true` does not advance. Lines come in as they were written (follow deltas, send_to_agent messages, owner notes), newest last, capped (say 50, with `more: true`).
2. The remote server instructions (`RemoteMCP.INSTRUCTIONS`, the one place the voice-agent directives live) get one sentence: call `updates` at the start of nearly every turn; `follow({path, agent: "<your id>"})` to subscribe to a log.
3. Optional if small: catch-up.md's item 1 (piggyback a one-line "N new updates" hint on every remote tool result when the cursor is behind), so the agent knows to call `updates`. If it is not one small slice, leave it as the next step in catch-up.md.
4. Tests: `Servex/ext/remote/RemoteMCP.test.mjs` extended (cursor advances, peek does not, cap and more). Update catch-up.md from "design only" to what is built, and `Servex/doc/follow.md` with the pairing. Merge with `node Server/merge.mjs`; `restart_servex` only when `list_agents` shows nobody working, else say it is needed. Land with `finish-task`; one screen, check marks.
