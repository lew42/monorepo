# prompt-lifecycle — your words become names, cards and a proposal while you are still talking

Minion: Opus, effort high. Session id `c5dd9287-4fc2-427c-b865-f318152bade4`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then sections **D**
(the prompt lifecycle and naming paragraphs) and **F** of
[`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md), then
[`../log-model/events.md`](../log-model/events.md) (`prompt refined proposal name card ask
answer approve dispute`) and [`../log-model/lifecycle/`](../log-model/lifecycle/) — the worked
thread. Load `code`, `layout`, `css`. Private port **8098**. You own `/framework/ai/v/3/`
(board-from-events landed 16:47 — read its `agents.js` and task log first) and
`Servex/agents/` (free).

## What exists

Servex RUNNING (`node Servex/sustain.mjs --status`). `ux/Dictate` posts every finished sentence
as a `prompt` line to `POST /log/prompts` (CORS on; `whisper-servex`). `Log.append` enforces the
naming checks (`naming-checks`: first name stands, non-owner rename of a seen name → dispute,
only the owner approves, locked refuses rename). `Servex/agents/`: `spawn` with `role` (skill
loaded first), `send` with `{from, reply_to}`, the registry, `wake_parent`, `roles.js`.
`/api/stream` pushes every agent event; the board's `agents.js` consumes it. The fast
assistant's posture is `.claude/skills/every-prompt/SKILL.md` (written for a sidebar tab —
read it for the voice and the card rules; do not edit it).

## Deliverables

1. **A Servex-hosted fast assistant.** `Servex/agents/Assistant.js`: on Servex boot (and on
   demand via `GET /api/assistant/start`), one agent `assistant-fast` (role `assistant`:
   Sonnet, effort low, no file tools — read `roles.js`; its system brief lives in
   `Servex/agents/assistant.md`, ~30 lines, taken from `every-prompt`'s voice) is spawned and
   kept alive. Every `prompt` line appended to `prompts` (hook the appender's emit, the same
   seam `Stream.js` uses) is `send`-ed to it with `{from: "owner", reply_to: "log prompts"}`.
   It answers ONLY by appending events through `POST /log/prompts` (give it one MCP tool
   `append_prompt_event` that takes `{type, …}` and stamps `by: "assistant-fast"`, `re` to the
   prompt): a `name` for each thing the owner named, a `card` for the idea (title ≤ 5 words,
   `text` two sentences, `icon`), and a `refined` line citing sentence indexes — within
   seconds of each utterance. It never filters, never builds. Measure: utterance appended →
   first assistant event, over five utterances; log the median.
2. **The thread on the board.** On `/framework/ai/v/3/`, a **Prompts** view (fifth view, not
   the default): newest prompt first, each as one row — the verbatim sentences (never tidied),
   the `refined` reading beside it with its cited sentences highlighted on hover, and the
   names it produced as chips. Live over `/api/stream` (prompts log events must reach the
   stream — if only agent events do today, add the `prompts` log to what `Stream.js`
   broadcasts, ~10 lines in `Servex/`). Every card the assistant appends also appears on the
   normal timeline/grid, folded from the `prompts` log the way `board-from-events` folds
   agent cards — decide whether that fold moves into one shared `fold` helper for both and
   write the `decision`.
3. **Optional ✓/✗ per item, never mandatory.** Hovering a name chip or a card shows ✓ and ✗:
   ✓ appends `approve` (`by: "owner"`) through `POST /log/prompts`, ✗ appends `dispute` with a
   one-line `why` prompt (a small inline input, not `window.prompt`), and "not this, what
   else?" appends an `ask` with `re` → the name that the assistant answers with two
   alternative `name` lines. The appender's checks are the authority — the UI just shows the
   answer (200/409) and the fold shows the alternatives beside the visible name. Nothing on
   the board ever waits for a ✓.
4. **Proposal, the first step.** When the owner's card gets a ✓, the assistant (same agent,
   sent a `{from: "board", …}` message) appends one `proposal` with `stage: "pre"`: title,
   three shape bullets, no classes yet. It shows under the prompt row. `stage: "full"` and
   `build` are phase 3 — say so on the page in one line.
5. **Proof, end to end, headless:** with Servex up and the assistant alive, POST five prompt
   lines (real sentences, the owner's voice — take five from `ai/board.jsonl` owner cards) to
   `/log/prompts` one every 8 s; load the Prompts view on 8098 and screenshot it with names
   and refined text present (`shots/`); click ✓ on one name and show the `approve` line landed
   and the chip locked; click ✗ with a why and show the `dispute` beside it; measure the five
   latencies. Then the Servex-down path: the board loads with zero console errors.
6. **The page — `ai/2026-09-22/prompt-lifecycle/page.js`** (iceberg: the screenshot, the
   five stages named with which are live today, the median latency, then links) and a line in
   `ai/2026-09-22/page.js` `children:`.

## Fence

`Servex/agents/**`, `Servex/Stream.js`, `Servex/Servex.js` (Edit only), `public/framework/ai/v/3/**`
(not `board.jsonl`), your task dir. Append-only to `.jsonl`. Restart Servex after editing:
`node Servex/sustain.mjs --stop`, then the hidden launch (`powershell -NoProfile -Command
"Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs' -WorkingDirectory
'C:\Code\lew42\monorepo' -WindowStyle Hidden"`), confirm 8090, log the PIDs; never `cmd /c
start`. Take the reload hold for the v/3 batch. Not `ux/Dictate`, not `.claude/`, not `Server/`.

## Length

`Assistant.js` under 150 lines, the Prompts view under 200. Landing report: ten sentences with
the median latency and the two screenshots. Stop and land what is proven at $20.
