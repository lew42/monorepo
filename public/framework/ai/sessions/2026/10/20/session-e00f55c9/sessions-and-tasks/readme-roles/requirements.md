# Readmes every agent can trust: framework rules out of CLAUDE.md, one readme per role

Budget: $12. Opus, medium effort. Parent: `vscode-mastermind`: log with the `log` tool. Work in a **worktree on its own branch; do not merge**: the owner approves the merge. Land at ready-to-merge with a one-screen summary of what changed.

## The owner (2026-10-22, tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

The plan is [ai/doc/readme-system.md](../../../../../../doc/readme-system.md) ("Proposal"); the owner said build it. Rules get lost because nobody knows which files each agent reads. Readmes are read whole now (the readme chain stopped cutting them on 2026-10-22), so they must stay short: about 100 lines / 800–1,500 words at most, the index first.

1. **CLAUDE.md slims down.** It keeps the laws, safety, cost rules and "read `public/framework/readme.md`, then your role's readme". Framework-specific rules (presentation, readmes and docs, classes, pages, traps, the live site) move into `public/framework/readme.md` or a doc it links. Nothing is lost: map every sentence old → new in `moves.md` here (the 2026-10-12 consolidation did the same: `ai/doc/claude-md-archive.md`). Target under 1,500 words.
2. **The framework readme becomes mandatory reading**, stays an index (every major system named, one line, a link) and stays under its own budget.
3. **One readme per role** (`Servex/agents/roles/<role>.md`, or beside the role's existing file if that reads better: decide and say why). The role is one switch in `Servex/agents/roles.js`; the agent reads its role readme. Move each skill's text there and leave the skill as a one-line pointer (skills keep working in VS Code tabs). Start with mastermind, servex-mastermind, sub-mastermind/task-mastermind, minion, reviewer, clarity; list the rest as ⬜. A short index of roles: what each does, its model, when to use it (data in `ai/doc/readme-system.md`).
4. **The ai readme** (about 1,500 words, opens with a records table): index first, the records table moved to a `doc/` file, `priority.md` linked at the top.

## Rules

- Moves by script, not by retyping (CLAUDE.md "Moves and renames are scripted").
- Search for old references to everything moved and fix them.
- Every new file linked from its parent readme.
- Don't break `roles.js` loading: boot-test Servex's role loading (its tests, or a private-port boot), no live restart.

## Done when

- [ ] The branch has the slim CLAUDE.md, the framework readme as the rules' home, role readmes, the trimmed ai readme, `moves.md`; word counts before → after.
- [ ] Tests pass; summary (what changed, how to check it, the merge command) in the landing outcome. Not merged.
