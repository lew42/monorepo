# Docs vs code audit — does the AI + SDK system do what the docs and the owner's asks say?

Owner (2026-10-07): "Study all the ai + sdk systems, read the documentation, study the code, and see if everything in the docs adds up with the code. I think there's possibility for omissions between the request and the product." Budget $6, Sonnet, medium effort. Batch reads (many files per turn); compute lists with scripts, read shortlists.

## Scope
`Servex/` (agents, Pool, Usage, Heartbeat, TaskLoop, MCP/tools, ext/openrouter, ext/local) and `public/framework/ai/` (readme chain, `doc/*.md`, asks.jsonl, todo.md). Read the readme chain root to leaf first (`/framework/ai/readmes/`).

## Method
1. List every concrete claim in the docs/readmes ("X does Y", "Z is wired to W", "limit is N", "tool T exists") — script-assisted.
2. Verify each against code (grep the symbol, read the function). Mark: TRUE / STALE (doc wrong) / MISSING (doc promises, code lacks) / UNDOCUMENTED (code does, doc silent).
3. Cross-check the owner's asks: `asks.jsonl` and `todo.md` entries marked done/landed — is the product actually there? An ask with no matching code is an OMISSION.
4. Do NOT duplicate: token-accounting (task-mastermind-token-accounting) owns session/cost data; prompt-audit (minion-prompt-audit) owns unbuilt asks from prompts. Link to their reports instead.

## Deliverables (numbered)
1. `claims.json` — the claim list with verdicts (script output, not typed by hand).
2. `report.md` — one screen: counts per verdict, the 10 most important mismatches, each with doc link + code link + one-line fix. Omissions between ask and product first.
3. Fix the obvious stale docs (small, safe) and commit each with attribution; anything bigger → a `doc/*.md` note linked from the module readme. A mismatch needing the owner goes on the board as a `Note:` card.

## Rules
Stay under the budget; one-sentence chat replies; no loose uncommitted files; land with `finish-task`.
