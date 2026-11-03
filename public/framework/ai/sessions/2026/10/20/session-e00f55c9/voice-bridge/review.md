verdict: pass
1. [note] The live speed is still unmeasured: the 4 ms ack, 317 ms first words and 1.9 s answer come from the fake agent in `RemoteMCP.test.mjs` (re-run on `worktree/voice-bridge` at 20cc49221, it passes), and the 8.7 s comes from `first-words.mjs`. The follow-up is filed (`voice-bridge/session.jsonl:18`, "measure it live after the next Servex restart"), and `voice-agents.md` §4 marks the row "live after the next Servex restart", so it is tracked.
2. [note] The parent record marks this task "dropped" (`session-e00f55c9/session.jsonl:1157`, "owner mastermind-voice-bridge is stopped"), not "ready to merge". The only place that says the branch `worktree/voice-bridge` (20cc49221) is ready is a heartbeat line in `voice-bridge/session.jsonl`. A fresh agent scanning the session for open work could take it for abandoned. One `log` line on the task, "ready to merge, awaits the owner", would fix that.
3. [note] When there is no reply file, the answer is `t.words`: everything the agent said in the turn, including the narration between tool calls (`RemoteMCP.js` diff line 224). The SDK's own `result` text, `event.text` (Agents.js:2231), is only the final block. That would be a tighter answer for the voice agent to read.
4. [note] When an IDLE agent is stopped, it emits a `result` with `stopped: true, mid_turn: false`, and no turn ran: `Agent.emit` skips the `kinds` shift for that case (Agents.js:1781). `heard_event` still counts one turn off every waiting ask (diff line 335). This is a rare edge, but it is the same off-by-one that tests 13–14 guard against.
5. [note] `.claude/skills/voice-mastermind/SKILL.md` now has two bullets that overlap: "Announce before anything slow" (line 10) and "Say first" (line 15). Both say to speak one sentence before any tool call, so they could be one bullet.

## Requirements
- 1 "voice-agents.md … linked from ai/readme.md and from cloud-voice-agent.md" — yes — it landed earlier (ddf0970aa). It is linked at `public/framework/ai/readme.md:26` and `cloud-voice-agent.md:3`. It has the two systems side by side (§1), the three ways the owner talks (§2) and which agent is which (§3), and it builds on system-map §3f rather than writing a second map.
- 2 "Measure today's path" — yes — `voice-agents.md` §4 has a table of every path, measured by `measure.mjs`, plus where the time went across 59 past turns (first tool call at 10 s, first words at 40 s).
- 3 "Design and build the bridge in a worktree… ack under 1 s, first words by themselves… measure it… review.mjs… ask-first list" — yes, live numbers pending — `worktree/voice-bridge` adds an 8 s wait, `voice_hear`, answers that ride along on other tool results, `to`, and a fallback. The tests pass. There were five review.mjs rounds, all answered. The ask-first list is in `plan.md`. The merge is left to the owner. The live measurement is filed (finding 1).
- 3a "check what hooks or CLAUDE_CODE_MESSAGING_SOCKET allow" — yes — `voice-agents.md` §4, "Pushing into the VS Code tab".
- 4 "switch your voice … say so in the doc" — yes — `voice-agents.md` §5.
- Fences: no `restart_servex`, no python, commits by path — yes — nothing in the diff or the log breaks them.
- New class, live-instances page — n/a (no new class; `RemoteMCP` gains methods only).

## Words
- Plain, full sentences — yes — the readme, `remote-tools.md` "The bridge" and `voice-agents.md` §4 explain the bridge before giving the detail.
- Stale text — yes, current — the one-minute and `wait:false` advice is updated in the readme, `remote-tools.md`, `cloud-voice-agent.md`, the skill and `INSTRUCTIONS`. The old workflow is marked as superseded, not deleted.
- Indexed — yes — the readme names `voice_hear`, `to`, `remote.fallback` (with where it lives) and the doc section. `remote-tools.md` lists test cases 6–14. `plan.md` is linked from `remote-tools.md` and `RemoteMCP.js`.
