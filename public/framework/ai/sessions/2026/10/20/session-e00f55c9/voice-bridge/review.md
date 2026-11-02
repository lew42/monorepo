verdict: fix
1. [fix] The brief asks to "check what hooks or `CLAUDE_CODE_MESSAGING_SOCKET` allow" for pushing into the VS Code tab, but nothing in the diff, plan.md or voice-agents.md mentions either one. voice-agents.md §4 covers only the inbox file + Monitor and the peer `SendMessage` (which never arrived). Add one row or line to §4 with what was found, or "not checked" plus a filed task.
2. [note] `.claude/skills/voice-mastermind/SKILL.md:19` still says "Answer inside the tool's one-minute window … Reply within the minute". `ask_mastermind` now waits 8 s and the new "Say first" bullet replaces this, so cut that sentence or reword it to match.
3. [note] `Servex/ext/remote/doc/cloud-voice-agent.md:88` and `:98` still describe the pre-bridge workflow ("`wait: false` returns a ticket at once", "Alternative workflow to try: never wait. Fire the ask (`wait: false`) …"). The new "Asking without waiting" section supersedes them. Mark them as history or point them at that section, so a voice agent doesn't follow the older advice.
4. [note] The bridge's speed has still only been measured in the test door: ack 4 ms, first words 317 ms, answer 1.9 s (`RemoteMCP.test.mjs` passes in the worktree at 419d9fa81). The live measurement is filed as a task on the session record ("measure it live after the next Servex restart"), so this is tracked, not missing.
5. [note] The test's fake agent shifts `queue.kinds` before it calls `watch` (RemoteMCP.test.mjs:422). The real `Agent.emit` calls `host.watch` first and shifts after (Agents.js:1771, 1781). `heard_event` never reads `kinds`, so nothing breaks today. But if a later change reads `ahead()` inside the listener, the test would hide an off-by-one. A one-line comment would cover it.

## Requirements
- 1 "`voice-agents.md` … linked from `ai/readme.md` and from `cloud-voice-agent.md`; two systems side by side; the ways the owner talks; which agent is which; extend the earlier system map" — yes. readme.md:26 and cloud-voice-agent.md:3 link it, §1–3 are the three tables, and its intro builds on system-map.md §3f and the dictation map.
- 2 "Measure today's path: `ask_mastermind` / `updates` / `send_to_agent` / `wait_for_agent`, and where the time goes" — yes. The voice-agents.md §4 table comes from measure.mjs and 75 past pairs, and "Where the time went" gives first tool call at 10 s, first words at 40 s, turn end at 51 s.
- 3 "Design and build the bridge in a worktree; ack under 1 s; first words by themselves; measure it; `review.mjs`; merge left to the owner; ask-first list" — yes, with caveats. Branch `worktree/voice-bridge` is unmerged. The ack is 4 ms and first words come through `voice_hear` and ride along on tool results. Measured in the test door only, with the live run filed (note 4). The ask-first list is in plan.md.
- 3b "check what hooks or `CLAUDE_CODE_MESSAGING_SOCKET` allow" — no (finding 1).
- 4 "Switch your voice: Kokoro for the web read-aloud; the app's voice can't be changed; say so in the doc" — yes, voice-agents.md §5.
- Class instances page — n/a. No new class: the ticket is a plain Map entry inside `RemoteMCP`.

## Is anything broken
- Tests: `node Servex/ext/remote/RemoteMCP.test.mjs` prints `ok 7 calls`, bridge `{"ack_ms":4,"first_ms":317,"answer_ms":1913}`.
- The seam is sound. `Agent.emit` calls `this.host?.watch(event, this)` at call time (Agents.js:1771), so the wrap in `RemoteMCP.listen()` works, as `Heartbeat.js:59` does the same. `state` is set to idle/working before the `result` event (Agents.js:2203), so the idle fallback's `agent.state` check reads the right value. Event fields (`delta.text`, `tool.name/input`, `result.stopped`, `nested`) match Agents.js:1724, 1847, 1861.

## Simpler way
- No clearly simpler shape. Long-poll plus piggyback is the only pull-friendly option, and plan.md records SSE progress as the untested alternative. The turn-counting attribution (`ahead`, idle fallback) is the complex part. The alternative of always asking for the reply file would be simpler but slower, and the tests cover the cases.

## Indexing and continuity
- New things are indexed. `voice_hear`, `remote.fallback` (with its location) and `REMOTE_MCP_WAIT_MS` are in Servex/ext/remote/readme.md and doc/remote-tools.md "The bridge". The task folder holds plan.md, measure.mjs, first-words.mjs, review rounds 1–4 and the filed follow-up, so a fresh agent can continue. Stale lines: notes 2 and 3.

## Words
- content 1 — yes. Docs open with what the thing is in plain sentences, e.g. remote-tools.md "The bridge".
- content (jargon) — note. "ahead", "ride along" and "attribution rule" are explained where they first appear (remote-tools.md "The bridge").
