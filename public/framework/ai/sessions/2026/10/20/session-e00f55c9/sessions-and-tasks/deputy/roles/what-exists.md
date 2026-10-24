# What exists today, and where a session's role is lost

- **`ROLES`** (`Servex/agents/roles.js`): 17 rows keyed by role word. Fields: readme, skill/skills, prefix, alias, retired, tier, model (derived from the tier), effort, permission_mode, compact_after, plus singleton and renew on `ai-system-mastermind`. Helpers: `canonical`, `defaults`, `opening`, `role_system`, `role_reminder`, `singleton_id`, `renew_of`. It imports node `fs`, so a page cannot import it.
- **Role readmes** (`Servex/agents/roles/`, index `readme.md`): the text a role is given; roles.js names one per row by `readme`.
- **A Servex agent's line 1** (`open_task()`, Agents.js): the `assign` line held session_id, agent id, brief, model, parent_task. **No role.** Lost here.
- **A VS Code tab's line 1** (`.claude/hooks/session-page.mjs`): `{session:{id,kind:"vscode-tab",cwd,at}}`. **No role.**
- **Sessions list** (`AISessionRows.role_label`): turns a role word into a label (`ROLE_LABELS`); the word comes from the registry row, else is guessed from the first prompt (Server/session-flags.mjs).
- **Registry** (`GET /agents`, `registry_list()`): each row has `role` (and `session_id`), but only while the agent is in the registry.

**Known today:** while an agent is live or still in the registry. **Lost:** once it leaves the registry, and always for a tab; the record never said.
