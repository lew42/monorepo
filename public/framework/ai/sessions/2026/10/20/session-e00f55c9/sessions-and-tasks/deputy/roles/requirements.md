# Roles: a Role class, each session records its role, and pages show it

Budget: $10. Model: Sonnet, medium effort. Parent: `mastermind-deputy`, who reviews and merges. You don't merge or restart Servex.

**This brief is the first slice only:** the class sketch and the look. Stop when the look is shot; no more UI until the owner approves it.

## The owner's words

`../../../prompts.jsonl`, the `"stage":"raw"` line at 2026-10-24T00:33:33Z, the part about roles. In short: Servex roles are rows in `Servex/agents/roles.js` today. Make a Role class, have each session record its role (in its session record), and have the session page show the role's properties. The rule behind it is in [rules.md, "Show the class, and its live instances"](/framework/doc/rules.md): a page lists the real instances and their properties as the program runs.

## Wait for this first

`mastermind-system-architect-3` is changing `roles.js` on `worktree/ai-system-mastermind`: it adds a new `ai-system-mastermind` row and the fields `singleton` and `renew`. Start only after that branch has merged (`git log michael/dev --oneline -- Servex/agents/roles.js` shows it). The Role class carries those two fields.

## 1. Find what exists (`what-exists.md` here, one screen)

Read each of these, and nothing more:
- `ROLES` and its helpers in `Servex/agents/roles.js`
- the role readmes in `Servex/agents/roles/` (their index is `readme.md`)
- line 1 of a Servex agent's record, written by `open_task()` in `Servex/agents/Agents.js` (the `assign` line, which has no `role` today)
- a VS Code tab's line 1, written by `.claude/hooks/session-page.mjs`
- the role shown on the sessions list (`AISessionRows.role_label` in `public/framework/ai/AISession/AISessionRows.js`)
- the Servex registry rows (`GET /agents` has `role`)

Say where a session's role is known today, and where it is lost.

## 2. The class sketch (`plan.md` here)

Use the `make` and `code` skills. Settle the name and home first. The class must load in node (Servex spawns with it) and in the browser (the pages draw it), so it lives under `public/framework/`, as `core/Session` does. Keep one source for the role rows: either `roles.js` builds `Role` instances, or `Role` reads the rows. Never make two copies.

Its properties are every field a row has today: readme, prefix, tier, model, effort, permission mode, compact_after, skills, alias and retired, plus `singleton` and `renew`. For each role, its live instances are the registry's agents in that role.

**Recording the role:** `open_task()` writes `role` into the `assign` line, and the VS Code tab's line 1 gets its role too. Every new session then records its role, and older ones fall back to the registry.

## 3. The look (stop here)

Work in your own worktree (`take_worktree`). Build the smallest slice, read-only, from real records:

1. **A roles page** at `/framework/servex/roles/`, linked from the Servex page's navigation. It lists one row per role: its properties, and its live instances now (agent id, state, cost).
2. **The role on a session's page:** a small panel on `/framework/ai/sessions/<id>/` (in the head, or in the "Models and tokens" tab) showing this session's role and its properties, linked to the roles page. `minion-review-page` is adding a "Work" tab to that page on `worktree/qf-3`. Touch only the head or the Models tab, and say in `plan.md` which lines you changed.
3. **Shots:** shoot headless at 400, 1200 and 1920 (`mcp__site__shot` against your worktree's server). Commit.
4. **Log, then stop:** `{"log":{"at":"NOW","msg":"show: <shot paths> — roles as objects, for the owner's approval"}}`, link the shots from `plan.md`, and stop. Don't run review.mjs yet.
