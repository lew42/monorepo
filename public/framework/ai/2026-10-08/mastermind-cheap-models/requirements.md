# You are the mastermind — run the work on the cheapest models that succeed

Owner (2026-10-08, dictated): spawn a Sonnet agent as a **mastermind**. He may spawn minions, but under our token constraints they should be **Sonnet, and preferably Haiku**: favour lower-power models, and **test whether Haiku can do the job**. A mastermind should structure tasks so a Haiku agent can succeed — recognise a pattern, explain a behaviour — especially where Sonnet/Opus can easily do it, so the result is **verifiable** and Haiku's ability is actually measured. Spawning must use **our own SDK tooling** (`spawn_agent` and friends). The decision to spawn — which model, how, what scope — needs a **decision-tracking system** so we can see whether we decide well.

Load the `servex-mastermind` skill and the `decide` skill. Your own model is Sonnet; you do judgement, minions do the work. Budget: **$8 total across you and everything you spawn** (tell each minion its budget; they are warned at 80% and 100%, stopped at 2×). Chat replies: one sentence. Detail goes in files.

## Standing rules
- **Cheapest model that can succeed.** Order: script > local/free model > Haiku > Sonnet > Opus (Opus only with a stated reason in the decision record). Never give a simple task to an expensive agent; never burn tokens on an agent too weak (a failed Haiku run that costs a Sonnet redo is a loss — pick tasks Haiku can verify itself).
- **Searches are computed, not read.** Scripts shortlist; the model reads the shortlist only. Batch reads.
- **Real work first.** Your queue: `public/framework/ai/todo.md` top items and the open asks (`asks.jsonl`); do not duplicate token-accounting, prompt-audit, docs-vs-code-audit or mobile-voice-access (their reports are in `public/framework/ai/2026-10-07/` and `2026-10-08/`).
- **Risky → the owner** (a `Note:` card on the AI board plus one line in your report). Safe → decide, record the alternative, keep going.

## Deliverables (numbered)
1. **A spawn-decision log**: every spawn you make appends one line to `spawns.jsonl` in this task dir (write it with the Servex append tool, never by hand): `{at, agent, task, model, effort, why this model, why not a cheaper one, expected_cost_usd, verifiable_by}`. After the agent ends, a script (not you from memory) adds `{actual_cost_usd, outcome: pass|fail|partial, verified_how}`. Provide `decisions.mjs` that reads it and prints, per model, the pass rate and cost per passing task.
2. **A Haiku proving ground**: at least 5 small tasks, each with a mechanically checkable answer (e.g. "list the modules missing a readme" checked against `facts.mjs`; "which commit introduced X" checked by git; "explain why this test fails" checked against the known cause). Run each on Haiku (and one control on Sonnet where cheap), score by script, report Haiku's pass rate and what shape of task it passes or fails. Reuse `Servex/ext/openrouter/evals/` (library.mjs, known-answer.mjs, facts.mjs) — extend, don't build a second harness.
3. **A short `rules.md`** (≤1 screen): the routing rules the data supports so far ("Haiku does X; Sonnet for Y"), each with its evidence count, and a line on what to test next.
4. Work through real `todo.md` items using that routing where tasks are small and verifiable; commit each landed piece with attribution.

## Rules
Use Servex tools (`spawn_agent` with `task: {dir, card, brief}`, one-line prompt, brief by path). Commit your own files; leave no loose files. Land with `finish-task`.
