# Old branches: land the real code, set the rest aside, show a table

Budget $10, Sonnet. Load the `sub-mastermind`, `code` and `review` skills first. Log to this dir's `task.jsonl`.

**Why:** the [landing check](../landing-check/audit-table.md) found 54 of 91 branches with files missing from `michael/dev`. Most are old record files, scratch or `files.jsonl` indexes and need nothing. A handful carry real code or skills.

## Deliverable

- [ ] **1. Classify the 54** with a node script (`Server/LandingCheck.mjs` lists the missing files per branch). Sort each missing file into one kind:
  - `records`: anything under `ai/`, a `files.jsonl`, a `.png`, a scratch dir
  - `docs`: `.md` outside `ai/`
  - `code`: `.js`, `.mjs`, `.css`, skills

  A branch with records only is "nothing to land": say so in the table, don't touch it.
- [ ] **2. Decide each branch with code or docs missing.** Read its diff against `michael/dev`. Likely: `check-consensus`, `ui-system-clean-land`, `ui-system-land2`, `ui-system-land3`, `mobile-nav-live`, `figma-guide`, `orphans`, `waiting-on-you`, `ai2-static`, `fix-label`, `dictate-onewidget`, `michael/bags-misc`. One verdict each:
  - **land**: dev lacks it or has an older version, and the branch's is self-contained and loads (`node --check`, page opens headless). Land through `Server/merge.mjs` in a worktree, with a one-line reason.
  - **superseded**: dev has a newer answer. Name it.
  - **salvage**: worth keeping, not landing. Leave the branch and name it.
- [ ] **3. The `ui-system-land*` branches** touch `app.js` and `core/System`. First read what the owner said (`git log --grep="ui-system"`, the task dir under `ai/sessions/2026/10/`). If unsure, salvage and say why.
- [ ] **4. The table:** `review.md` here, plus a five-line summary section in `ai/doc/follow-up.md`. Columns: branch, missing files (counts by kind), verdict, reason, commit if landed.
- [ ] **5. Card report** titled "Old branches: N landed, M superseded, K set aside, nothing lost". Check the landing line with `tail -1`.

## Fence

- Allowed: worktrees of the branches you land, one section of `ai/doc/follow-up.md`, this task dir.
- Never force, rewrite or delete a branch. Never `git merge` in the main tree (the guard refuses it); use `merge.mjs` only.
