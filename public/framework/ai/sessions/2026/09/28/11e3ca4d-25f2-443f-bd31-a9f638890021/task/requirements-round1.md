# Round 1 — harness research scouts

Load the `minion` skill, then the `research` skill, first. The owner's words, verbatim, are in
`public/framework/ai/2026-09-28/harness-research/owner-words.md` — read them; they are the brief.

**The topic:** `harness` (`public/framework/research/harness/research.jsonl`). Read it ONLY with
`node public/framework/ext/Research/research.mjs outline harness`. Write ONLY with `research.mjs say`
(never hand-write JSON; single-quote every `--text` and `--why`).

## Your fence — the sub-area questions you own

- **opus scout:** `qnjkd` (OpenRouter vs direct: parity of tools, streaming, caching, thinking, cost), `qgyhm` (OpenRouter's agent package vs our own), `q6h59` (multi-model fleets with cross-review).
- **sonnet scout:** `q2iwg` (the harness parts), `q267z` (permissions + sandboxing), `qqtqi` (replacing the Claude Agent SDK in `Servex/agents/`), `qg9ju` (model switcher in the chat/dictation widget).

Write only under your own questions (`--parent <id>`).

## Deliverables

1. **5–8 `claim` nodes per question** you own, each `--parent <question id>`, text ≤ 240 chars, one thought.
2. Every claim has `--refs` (a URL for anything external, `file:line` for anything in this repo) and `--why` starting with **`credence: established|contested|fringe|unknown —`** then the reasoning (the topic schema has no credence field; this prefix is how we record it).
3. `--importance 1-5` honestly: how much it changes what we build.
4. Where nobody knows, a `question` node instead of a guessed claim.
5. Last claim under each question: the recommendation for that sub-area, `--kind alternative` if it proposes a build choice.
6. `research.mjs agent harness --name <your id> --doing '…'` when you start, and `--done '<n> claims'` when you finish.

## Rules

- Dig yourself with WebSearch / WebFetch — no sub-agents. Current facts: today is 2026-09-28; verify prices and APIs from the providers' own docs, not memory.
- Keep spend down: opus about $4, sonnet about $2. Stop at the deliverable, don't polish.
- Do not edit any other file. No processes with windows (`windowsHide: true` on anything you spawn).
- When done, end your turn with one line: how many claims, and the single most surprising finding.
