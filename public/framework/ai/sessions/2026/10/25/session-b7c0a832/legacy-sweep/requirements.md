Budget: $8

# Legacy sweep: one provider default, one mastermind role

Owner's words: [agent-base item 15](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-base/requirements.md)

Work in a worktree (`take_worktree`), commit by pathspec, review with `node Server/review.mjs <taskdir> <worktree>`, then report. The mastermind merges.

- [ ] **1. Claude is the default, OpenRouter only on request.** Delete every "use only OpenRouter" directive (role readmes, `session-smart.md`, `VOICE_MODELS` in `Servex/agents/roles.js`, `session-backend.txt`, skills, `OR_ONLY` in `Servex/agents/tiers.js`). Steering text goes; the provider code stays, and a `/` model or `provider: "openrouter"` still works.
- [ ] **2. One `mastermind` role.** Fold `task-mastermind` and `sub-mastermind` into `roles/mastermind.md` as a short "own one task end to end, land it" section (a mastermind is spawned at a `path`; see its "Spawned at a path"). Keep both names as alias words so old callers and registry rows still resolve. Update `roles.test.mjs`; run every `Servex/agents/*.test.mjs`.
- [ ] **3. `findings.md`** beside this brief. One line per other legacy role or switch: what, where, keep or retire, why. Retire only the obvious.

Done = tests pass, readmes match the code, branch ready to merge.
