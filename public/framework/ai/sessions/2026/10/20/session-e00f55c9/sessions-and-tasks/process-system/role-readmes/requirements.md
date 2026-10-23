# Role readmes: a spawned mastermind reads mastermind.md; the system architect gets its own readme; one page for spawn templates

**For:** a Sonnet builder, spawned by mastermind-system-architect. **Parent task:** "Review the skills-to-role-readmes port" on [process-system](../). **Branch:** `task/role-readmes`, in a worktree. Never merge.

## The bug, in the owner's words (2026-10-22)

A spawned role "mastermind" (for example mastermind-figma-cards) got `Servex/agents/roles/servex-mastermind.md`, not `mastermind.md`, and never got the mastermind skill. The owner wants servex-mastermind retired into mastermind.md plus the Servex readme. Fewer moving parts, documented in one place.

## Where it comes from

- `Servex/agents/roles.js`, line 47: `mastermind: { readme: "servex-mastermind", … }`. Every agent spawned as role `mastermind` gets the readme of the Servex mastermind, which is today the **system architect** (the standing agent `mastermind-system-architect`). Its last section, "The system architect's primary objectives", was added on 2026-10-22 and must stay with the system architect.
- `Agents.spawn()` calls `roles.opening`, which calls `parts_of` (`role_readme` / `skill_text`). Read those first. Learn how a readme name becomes the opening text, and whether `readme` can be a list.
- `public/framework/core/Task/Process.js` `DEFINITIONS` use `role: "helper"`, but no role by that name exists in `ROLES`. Find out what an unknown role falls back to.
- The skill pointers: `.claude/skills/servex-mastermind/SKILL.md`, `.claude/skills/mastermind/SKILL.md`, `.claude/skills/system-architect/SKILL.md`. The role index is `Servex/agents/roles/readme.md`.

## What to build (commit after each step)

1. **The system architect's readme.** Use `git mv` to rename `servex-mastermind.md` to `system-architect.md`. Keep in it only what is the system architect's own: what it oversees, how it works, and the primary objectives. Each section that is a rule for every mastermind (land everything, minions default to Haiku, usage with one command, review the diff, never stop a mastermind whose children are working, taking over from a predecessor) moves to `mastermind.md`, unless mastermind.md already says it. If it already does, drop the duplicate and keep the clearer wording. Move each sentence once; never retype a rule in two places.
2. **The roles table.**
   - `mastermind` gets readme `mastermind`.
   - Add a `system-architect` role. Its opening holds `mastermind.md` first, then `system-architect.md`: a list, if `parts_of` supports one (add that if it is a few lines); otherwise system-architect.md starts with one line saying "read mastermind.md first", and the opening inlines both.
   - Keep `servex-mastermind` as an alias, so an old spawn or a resume still resolves.
   - Make sure the standing agent `mastermind-system-architect` still gets the system-architect readme. Find out how an agent id maps to a role (by prefix or by the registry), and test it.
3. **The `helper` role.** Process phases use `role: "helper"`. Pick the smaller fix and say why in the commit message: either change `DEFINITIONS` to `role: "minion"` (the phase already names its own model and effort), or add `helper` as an alias row.
4. **Tests** (extend the role test that exists, or add `Servex/agents/roles.test.mjs`):
   - the opening of a spawned `mastermind` contains mastermind.md's first heading, and not system-architect.md's;
   - the opening of `system-architect` contains both;
   - `servex-mastermind` still resolves;
   - every `role` used in `Process.DEFINITIONS` exists in `ROLES`.
5. **The skill pointers.** Point `.claude/skills/servex-mastermind/SKILL.md` and `system-architect/SKILL.md` at the new file. Update the role index `roles/readme.md`.
6. **One page for spawn templates: `Servex/agents/doc/spawn-templates.md`** (link it from `Servex/agents/roles/readme.md`). In plain sentences and short tables:
   - what a spawn names today, and where each part lives: the role (`ROLES`: readme, model, effort, permission), the task kind (`Task.TEMPLATES` in `core/Task/Task.js`: code, doc, scan), the process template (`Process.DEFINITIONS`), the extra readmes and skills, and the prompt;
   - the proposal: a **named spawn template** is one entry that names those parts, so a mastermind spawns `spawn_agent({template: "builder", task: …})` instead of hand-building a prompt. List three to five templates from real use (builder, reviewer, scout, task mastermind, system architect), each with its role, model and effort, kind, process and extra readmes.
   - Use the three words proposed in `public/framework/core/Task/doc/process-names.md` (role, kind, process template), and say that the names wait on the owner's approval.
   - This is a proposal page. Do not build the `template` argument.

## Rules

- No new npm dependencies. Do not edit `CLAUDE.md`. If its role list needs a change, say so in your outcome. Never write the owner's name.
- Work in a worktree: `take_worktree` if you have it, else `git worktree add -b task/role-readmes ../worktrees/role-readmes michael/dev`, then `npm ci` in the worktree root and in `Servex/`. Never link node_modules between trees.
- Commit after each working step, ending the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never merge.
- Finish with the item tool on your task: `{"complete": {"outcome": "<branch, commits, test output, what moved where, and anything you chose and why>"}}`.
