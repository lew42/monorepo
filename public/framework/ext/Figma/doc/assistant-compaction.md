# Compaction for the Figma assistant (proposal, 2026-11-19; nothing shared changed)

## How it works today

- A role row in `Servex/agents/roles.js` can carry `compact_after: {tokens, sleep}`. `mastermind` uses `MASTERMIND_COMPACT = {tokens: 150000, sleep: 100000}`; minions never compact.
- **Nudge:** when an idle agent passes `tokens`, Servex sends one message with its context size and cache state, and the agent decides whether to call `compact_self` (`Agents.nudge()`, `Servex/agents/Agents.js:1739`). It repeats every 5% of the window.
- **Forced:** only past the 400k safety ceiling or 500 MB of memory (`oversized()`, `:1720`).
- **Before sleep:** an agent about to go dormant with more than `sleep` tokens compacts first (`sleep_compact()`, `:1762`).
- **What survives:** the role readme, and for a spawn with a `path`, that folder's readme chain plus its `mastermind.md`, are in the system prompt, so they are present after compaction (`path_parts()`, `roles.js:193`). The chain is capped at about 12,000 tokens, middle levels cut first; `mastermind.md` is not capped.
- **What does not:** the conversation. The summary replaces it.

## What I would change

1. **Nothing to the shared config yet.** Today a Figma assistant spawned at `public/framework/ext/Figma/` is a `mastermind`: it keeps its role (this folder's `mastermind.md`) through every compaction, but is only nudged at 150k, which is late for an agent whose context is mostly screenshots.
2. **My own habit, starting now:** after each finished request, if context is above about 50k tokens, call `compact_self` and end the turn. State lives in the task log, node ids in the reply, so the summary only needs the thread of the current job.
3. **If the owner agrees, one new row** `figma-assistant` in `roles.js`: same as `mastermind` but `compact_after: {tokens: 60000, sleep: 40000}`, so the nudge comes at 60k and a sleeping assistant wakes small. It would be spawned by role name instead of `mastermind` plus a path. (The row is shared agent config, so it waits for the owner's say.)
4. **Keep the system prompt small:** it is re-sent every turn. `mastermind.md` links detail instead of holding it, and the 469-line `readme.md` here (mostly v2 history) should be trimmed, since it is in the chain and eats the 12k cap.

## Risks

A compaction costs one summary turn, and a summary can drop a detail (an id). Mitigation: ids go in the reply and the task log first.
