Budget: $2. One agent does this itself.

# Merge: a landing is committed, or it doesn't say "landed"

**What happened** (vscode-mastermind, 2026-10-03; checked by mastermind-servex-10 from git): `worktree/sessions-tab-polish` and `worktree/data-grid` both wrote `landed_at` with "merge passed", but neither branch is in michael/dev (12 commits each). The files did reach the main tree, **uncommitted**: `git status` shows `public/framework/ext/DataGrid/` and `public/framework/ui/datagrid/` as untracked.

**The cause:** `Server/merge.mjs`'s three-way path (about lines 412 to 430, used when the main tree has uncommitted edits to a file the branch changes) writes each file into the working tree, records the branch in `.merge-landed.json`, prints "applied over uncommitted edits, not committed: the owner commits", and exits 0. The agent reads exit 0 as landed. Nobody commits, because the owner doesn't, and since 2026-09-24 agents merge without asking. Until it's committed, that work can be lost to any stash or reset.

## 1. Commit what's already waiting (first, before any change)

- Read `.merge-landed.json`. For each entry not yet in a commit on michael/dev, list its files and check each one's current content still equals the branch head's version (`git show <head>:<file>`).
- Commit the files that match, **by exact path**, one commit per branch: "land <branch> (three-way, <head>)". If a file has since been edited by someone else in main, leave that file out and name it on the card.
- Post the list on the card: the branches, their file counts, and what was left out.

## 2. Fix the three-way path

- After `writeAll(plan)`, commit exactly the files in `changed` that the plan wrote, by exact path (`git add -- <files>` then `git commit`), never `git add -A`. A file the main tree had uncommitted edits to before the merge (the `overlap`) stays uncommitted, because those edits belong to someone else. Print them, and exit with a distinct non-zero code (for example 5, "landed except N overlapping files"), so no agent writes `landed_at` over a partial landing.
- Update the comment at the top of `merge.mjs` (line 30: "the owner commits").
- **Tests:** a three-way landing with no overlap ends in one commit holding the branch's files; one with an overlapping file commits the rest and exits 5; a dry run commits nothing.

## Land

`node --check`, the tests, commit by exact path. `merge.mjs` is a command-line script: no Servex restart.

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Never delete a branch. Don't wait on the owner.
