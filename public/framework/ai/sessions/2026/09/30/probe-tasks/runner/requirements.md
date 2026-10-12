Budget: $6

# probe runner — `probes.mjs` runs one probe on one model and scores it

The design is `../probes.md` and `../probes.json` (read both first; they are the spec, don't redesign them). The owner's words: `public/framework/ai/2026-09-30/openrouter-harness/owner-words.md`, last section.

## Fence
`Servex/ext/openrouter/evals/probes.mjs` (new), `Servex/ext/openrouter/evals/results.jsonl` (the log it appends), a short "Probe tasks" section in `Servex/ext/openrouter/readme.md`, and your own task dir. Nothing else. A sibling minion is writing `evals/rules.mjs` in the same folder — don't touch it; if it exists when you start, share its spawn helper instead of writing a second one.

## Build
`node Servex/ext/openrouter/evals/probes.mjs --models a,b --probes page-blog,log-line [--effort low] [--topic owls] [--dry-run]`

1. **A scratch place per run.** `take_worktree` from Servex (or `node Server/worktree-up.mjs probe-<n>`), then `public/framework/sandbox/probe/<run>/` inside it with a one-line `readme.md` and a parent `page.js` that declares no children yet. The agent gets `cwd` = that directory.
2. **Spawn one real Servex agent per run** the way `Server/review.mjs` does (`mcp("spawn_agent", …)` over the loopback MCP, then wait) — copy that pattern, don't invent another. Role `minion`, the probe's prompt verbatim with `{topic}` filled, `permission_mode: bypassPermissions`, the model given. A model id with a `/` runs through OpenRouter already (`Servex/ext/openrouter/provider.js`).
3. **Score the six checks** exactly as `probes.md`'s table says — each one a command, no judgment. Checks the probe doesn't list are `null`. Record the run's cost from the agent card (OpenRouter's real cost when the provider gives it).
4. **Label failures** a/b/c per `probes.md` once the control model has run the same probe: (c) if the run never reached the work, (a) if every model fails that cell, (b) otherwise. Print the matrix (rows model × probe, six columns, labels in the failing cells).
5. **One line per run** into `evals/results.jsonl`, the `{"probe":{…}}` shape from `probes.md`, appended through `.claude/hooks/append.mjs`.
6. **Throw the worktree away** after scoring (`return_worktree`, or `worktree-down`), every time, even on error.

## Proof (on the card)
- `--dry-run` prints what it would spawn and score, spawning nothing.
- One real run of `page-blog` and one of `log-line` on `claude-haiku-4-5-20251001` only (the control; do NOT run OpenRouter models — task-mastermind-openrouter does that when its spend guard is in): the two results lines and the printed matrix.
- A deliberately broken page in a scratch dir scores 0 on checks 1 and 2 (prove the checks can fail).

## How you work
- Load the `minion` skill first, then the `code` skill. Read the readme chain for `Servex/` and `Servex/ext/openrouter/`.
- Work in the worktree `C:/Code/lew42/worktrees/proposal-flow` (branch `worktree/proposal-flow`, server `http://localhost:62566/`). Never edit the main tree. Commit by exact path; do not merge — say "ready to merge" on the card.
- Every look is headless. Log only through `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`.
- Report on the card `2026/09/30/proposal-flow-main-is-production-then-pr` (card_reply): two sentences at start, "ready to merge" with the proof, or if blocked. Nothing else to the mastermind.
