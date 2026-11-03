# Mastermind: route work to the cheapest model that succeeds

Owner (2026-10-08, dictated). Load the `servex-mastermind` skill and the `decide` skill. Your own model is Sonnet: you judge, minions work. Budget **$8 total** (you + everyone you spawn); tell each minion its budget — warned at 80%, stopped at 2×. Chat replies: one sentence; detail goes in files.

## Asks
1. **Favour Haiku and Sonnet over Opus.** Spawn minions on Sonnet, and Haiku where the task fits. Structure tasks so Haiku can succeed — recognise a pattern, explain a behaviour — especially where Sonnet or Opus could do it easily, so Haiku's ability is actually measured.
2. **Spawn only through Servex's own tools** (`spawn_agent` and friends) — never a different spawn path.
3. **Track every spawn decision.** Build a decision log so we can see, after the fact, whether we decided well: which model, why, and whether it worked.

## Standing rules
- **Cheapest model that can succeed.** Order: script > local/free model > Haiku > Sonnet > Opus (Opus only with a stated reason in the decision record). Never give a simple task to an expensive agent; never burn tokens on an agent too weak (a failed Haiku run that costs a Sonnet redo is a loss — pick tasks Haiku can verify itself).
- **Searches are computed, not read.** Scripts shortlist; the model reads the shortlist only. Batch reads.
- **Real work first.** Your queue: `public/framework/ai/todo.md` top items and the open asks (`asks.jsonl`); do not duplicate token-accounting, prompt-audit, docs-vs-code-audit or mobile-voice-access (their reports are in `public/framework/ai/2026-10-07/` and `2026-10-08/`).
- **Risky → the owner** (a `Note:` card on the AI board plus one line in your report). Safe → decide, record the alternative, keep going.

## Deliverables
1. **A spawn-decision log** (`spawns.jsonl` in this task dir, written with the Servex append tool, never by hand). Each spawn: `{at, agent, task, model, effort, why this model, why not cheaper, expected_cost_usd, verifiable_by}`. After the agent ends, a script — not you from memory — adds `{actual_cost_usd, outcome: pass|fail|partial, verified_how}`. `decisions.mjs` reads the log and prints, per model, pass rate and cost per passing task.
2. **A Haiku proving ground**: 5+ small tasks, each with a mechanically checkable answer (example: "which modules lack a readme" checked against `facts.mjs`; "which commit introduced X" checked by git). Run each on Haiku, and a Sonnet control where cheap. Score by script; report Haiku's pass rate and what shape of task it passes or fails. Reuse `Servex/ext/openrouter/evals/` (library.mjs, known-answer.mjs, facts.mjs) — extend it, don't build a second harness.
3. **`rules.md`** (≤1 screen): the routing rules the data supports so far ("Haiku does X; Sonnet for Y"), each with its evidence count, and what to test next.
4. **Real `todo.md` items**, routed by the rule above where small and verifiable. Commit each landed piece with attribution.

## Land
Use Servex tools (`spawn_agent` with `task: {dir, card, brief}`, one-line prompt, brief by path). Commit your own files, leave nothing loose. Land with `finish-task`.
