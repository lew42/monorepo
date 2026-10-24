# AI system mastermind: the role reshaped

Source: the owner's prompt via vscode-mastermind, 2026-10-23 (session-e00f55c9 `prompts.jsonl`). Branch `worktree/ai-system-mastermind`.

## The asks, and what was built

1. **Rename it the "AI system mastermind", with its docs in `public/framework/ai/`.** ✅ `move.mjs` (dry run, then `--apply`; `manifest.jsonl`) moved `Servex/agents/roles/servex-mastermind.md` to `ai-system-mastermind.md` and left a pointer at the old path. The readme names `public/framework/ai/` as its docs home. The old role word `servex-mastermind` is an alias.
   - Decision: the readme stays in `Servex/agents/roles/`, the one folder `roles.js` reads every role from. Alternative not taken: moving it under `public/framework/ai/`, which would make it the only role outside that folder.
2. **Exactly one live session, renewed after a day or at a context limit, never kept alive when unused, with no slug collisions.** ✅
   - `singleton: true` on the roles.js row makes the id the role word itself, `ai-system-mastermind`. A second spawn while it is live sends it the prompt instead (`Agents.spawn`). There is never a `-2`; the session uuid is the only thing that changes.
   - `renew: {hours: 24, tokens: 300000}` makes the next wake after a day, or past 300k tokens, a fresh session under the same id (`Agent.renew_due`/`renew`, `Agents.wake`). It runs only when a message arrives. Its first words point at the readmes, so no handover file is needed.
   - `Respawn.AGENTS`, which respawned the system architect daily whether or not it was used, is now empty.
3. **It owns sessions and tasks.** ✅ The readme top rules, `roles/readme.md`, `ai/readme.md`, and `roles/mastermind.md` (which also says "send it system questions").
4. **A feedback inbox that counts repeats.** ✅ Reused `module_inbox` on module `ai`, adding `fix`, `repeat_of` and `obvious` to it. Node wakes the mastermind on the third repeat, or at once when a line is obvious. There was no existing "architect-requests" inbox; that was a branch name.
5. **Spend per week and month.** ✅ `node Server/role-spend.mjs ai-system-mastermind` reads `turn_cost` from Servex's own logs, for the role's sessions under all its old ids plus the agents they spawned. The first run: October $340.01 ($269.80 own, $70.22 spawned).
6. **How it picks work: big, simple fixes; always available for questions on roles, readmes, docs, review and planning.** ✅ The readme top rules.

The generic `mastermind` row loaded this readme before; it now loads `roles/mastermind.md`.

Tests: `node Servex/agents/singleton.test.mjs` (23 checks). roles 35, role-system 28, compact-before-sleep 23, compact-nudge 24, awaken-race 12, respawn 9, layers 55, ModuleInbox and policy all pass.
