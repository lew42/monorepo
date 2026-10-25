Budget: $8

# Legacy sweep (agent-base item 15)

The owner's words: `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-base/requirements.md`, item 15. Work in a worktree (`take_worktree`), commit by pathspec, review with `node Server/review.mjs <taskdir> <worktree>`, then report; the mastermind merges.

1. **Remove every "use only OpenRouter" directive** that steers an agent: role readmes, `session-smart.md`, `Servex/agents/roles.js` `VOICE_MODELS`, `session-backend.txt`, skills, and any env or default that forces `provider: openrouter`. Claude is the default; OpenRouter is used only when asked (a `model` with a `/`, or `provider: "openrouter"`, still works, unchanged). Grep widely (`OpenRouter`, `openrouter`, `OR_ONLY` in `Servex/agents/tiers.js`) and decide per hit: steering text = remove; the OpenRouter provider code itself = keep.
2. **Fold `task-mastermind` and `sub-mastermind` into the one `mastermind` role.** The singleton and renewal are already gone: `mastermind` is spawned at a `path` (see `Servex/agents/roles/mastermind.md`, "Spawned at a path"). Keep the useful rules (own one task end to end, land it) as a short section of `roles/mastermind.md`. Keep `task-mastermind` and `sub-mastermind` as ALIAS words so existing callers and registry rows still resolve; remove the separate row, readme and prefix only where nothing breaks. Update `roles.test.mjs` and any test that names them; run all `Servex/agents/*.test.mjs`.
3. **List other legacy roles or switches** you find, with a keep or retire verdict each, in `findings.md` beside this brief (one line each: what, where, verdict, why). Retire only the obvious; list the rest.

Done = tests pass, readmes updated to match the code (CLAUDE.md law 9), branch ready to merge, `findings.md` written. No Servex restart needed from you.
