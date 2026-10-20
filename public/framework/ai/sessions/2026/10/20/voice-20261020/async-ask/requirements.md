# ask_mastermind: never lose an answer (async ask)

Budget: $3, Sonnet. Owner: vscode-mastermind (it owns the remote door and built `updates`). Asked by the owner by voice (question 11a1f06f, [voice-20261020](/framework/ai/sessions/2026/10/20/voice-20261020/)).

## The problem

`RemoteMCP.ask()` (`Servex/ext/remote/RemoteMCP.js`) blocks the voice agent for up to a minute while it polls the reply file. If the owner speaks, the Claude app cancels the call and the answer is lost. Even without a cancel, an answer written after the 60 s timeout is never delivered and never gets its `chat` line.

## Build: what is already there, and the one change

The pieces already exist:
- the inbox (`logs/inbox/voice-app.jsonl`)
- `follow` offsets
- `updates`, which has a per-caller cursor (landed in ea69cfdb2)
- `start_job` and `job_result`

The change: when `ask()` stops waiting (it got the answer, it timed out, or the call was cancelled), keep watching the reply file in the background. When the answer appears, put it in `voice-app`'s inbox (in the same form `send_to_agent` uses) and write its `chat` line to the task log, so `updates` delivers it on the voice agent's next turn.

Add `wait: false` to `ask_mastermind`. It returns at once with `{ticket: qid}` and the line "the answer will arrive through updates".

## Done when

- A test in `RemoteMCP.test.mjs` covers both cases: an answer written after the timeout, and an answer to a `wait: false` ask. Each one lands in the inbox, and `updates` returns it.
- The cloud-voice-agent.md section "Options" (option D) and remote-tools.md say it.
