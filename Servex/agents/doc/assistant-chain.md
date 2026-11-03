# The assistant chain: from a spoken sentence to a mastermind

One screen. The owner talks; one fast assistant cleans each chunk on screen; a smart assistant refines
and hands the prompt to a mastermind once per batch. Ask 4 (`requirements-3.md`) and the role split of
17:05 (`requirements-5.md`) are the spec.

## The hops, as the code is today

| # | Hop | File · function | Model | Time |
|---|---|---|---|---|
| 1 | Dictate posts a chunk `{type:"prompt", via:"whisper", id}` (no page!) | `ux/Dictate` `post_prompt` → `/log/prompts` | none | ~2 ms (first POST after boot ~9 s, cold spawn) |
| 2 | Lobby hears it, holds 8 s for more | `Assistant.js` `heard` | Sonnet low | 8 s floor, by design |
| 3 | Lobby files it (`append_prompt_event`, `file_to_group`); `Dispatcher.js` spawns a task-mastermind from `task` lines | `Assistant.js`, `Dispatcher.js` | Sonnet | not measured (needs a live model run) |
| 4 | **Per page**: a card's own assistant + mastermind pair | `Layers.js` (1205 lines) | Sonnet ×2 per card | the design the owner now rejects |
| 5 | Voice sessions (✦): one session follows the owner by `nav` lines; fast and smart pair; `hold_thought` waits ~2.5 s | `Sessions.js` `say`, `refine` | Sonnet pair | fast reply waits 8 s for the smart one |

Per-page hops: 4 only. Hops 2 and 5 are global but are two parallel designs; Refine's JSON never reaches a
standing mastermind as a batch (the smart session spawns masterminds itself).

## The chain behind `SERVEX_CHAIN=on` (built, `Chain.js`)

| Hop | What | Measured (private Servex, `chain-proof.mjs`) |
|---|---|---|
| a | `prompts` log line → `Chain.heard` (page tag `[on /path]`, `(now on X)` on a move) | ~0 ms |
| b | ONE Haiku session `assistant-chain` cleans the chunk (`chain-fast.md`), result read off `agents.watch` | **1.0–1.6 s** per chunk (first chunk 6–7 s: cold spawn) |
| c | Boundary: "send it off", `SERVEX_CHAIN_BATCH_N` sentences, or `SERVEX_CHAIN_PAUSE_MS` quiet | at the third sentence |
| d | `Chain.refine`: ext/Refine `clean` + `structure` through `Echo.call` | 13.6 s for two sentences (Sonnet-class call; the slow hop) |
| e | `Chain.handoff`: one `REFINED PROMPT, batch N` message with the JSON, to the standing mastermind (`SERVEX_CHAIN_MASTERMIND`) | delivered; stub saw it |

Proof: `node Servex/agents/chain-proof.mjs chain` boots a private Servex (ports 8193-8195), posts three
sentences (two asks, then "Send it off."): three fast lines, **one** hand-off, timings in the `chain` log.
`baseline` runs the flag-off lobby (not run in this task; hop 2/3 times are read from the code).

## Decision (also in `task.jsonl`)

- **One global assistant pair per owner**: fast = Haiku cleaner (its own session, silent unless addressed by
  name), smart = Sonnet (answers in chat, checks, refines, asks with a timeout, hands off). Today the
  `Sessions.js` pair is closest; `Chain.js` is the flagged fast tier plus the batch hand-off.
- **`Layers.js` per-page pair becomes a page context** the one session carries: every message is tagged
  `[on /path]`, a move adds `(now on X)`. That tag is the one rule that keeps context across navigation.
- **Mastermind gets the refined prompt once per batch** (Refine JSON), never per sentence; queue if busy.
- **Names:** nothing renamed. `Chain` is the fast tier + batch seam; the smart tier is not built yet
  (next slice: wake it on the batch boundary, suggest only, no tools).
- **Gaps:** Dictate sends no page (read-only for this task); `Echo.call` refuses under a 2.5 GB RAM floor
  (the proof lowers it); the smart tier and the Steps.mjs/TaskLoop loop (ask 5) are not wired.
