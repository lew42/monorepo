# Spawn policy: a mastermind may spawn a mastermind

- ✅ `Servex/agents/policy.js` `spawn()`: any mastermind (`mastermind-*`, `task-mastermind-*`) may now spawn role `mastermind`. Other workers still spawn only minion/helper; assistants stay denied. `rules()` updated.
- ✅ Test: `Servex/agents/policy.test.mjs`, 61 checks pass (new case added, old "no mastermind" loop adjusted).
- ✅ The owner's reasoning is quoted in [Servex agents architecture](/Servex/agents/doc/architecture.md), linking [the brief](../ask-00dc4855.md).
- ✅ Merged into `michael/dev` (review run, all findings answered; smoke skipped as allowed).
- ⚠️ **Goes live on the next Servex restart.** Servex was not restarted because the voice tunnel runs through it. Until then, the page and AI masterminds must be spawned by the owner or mastermind-servex.
