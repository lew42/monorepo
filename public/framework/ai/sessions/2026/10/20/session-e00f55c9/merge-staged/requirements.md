# merge.mjs keeps refusing because of stray staged files: fix the loop (you are a mastermind, on Sonnet, high effort)

**Seen 3 times since 2026-11-02 04:00:**
- the read-aloud-b landing (152 staged files; the tab unstaged them by hand);
- item-phase1 merge 1, at about 13:30 (218 staged; the agent then committed its 6 paths by hand, bypassing the gate's commit);
- now 212 staged, of which 158 are `files.jsonl` folder listings, plus `sessions/**/index.json` and task-folder records.

`Servex/LogSweeper.js` uses `git commit --only`, so it never stages. **Suspect:** `Server/merge.mjs` itself.
- Its header says it stages new files "with `git add -A` on every landed path".
- If it refuses or fails after staging (or stages more than it commits), the staged files stay.
- Then the next merge sees "prior staged files" and leaves its own files uncommitted: a self-feeding loop.
- Each refusal pushes agents to commit by hand, which is how code reached `michael/dev` without the gate tonight.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; land with `node Server/merge.mjs`, by hand once if your own fix is what's blocked; say so)
1. **Prove where the staging comes from:** read `merge.mjs` (the `git add -A` path, the "prior staged" branch, exit 5) and reproduce in a scratch clone.
2. **Fix it** so a merge stages and commits exactly its landed paths:
   - `git commit --only -- <paths>` or `--pathspec-from-file`, like LogSweeper;
   - it never leaves anything staged on any exit path;
   - and other people's staged files don't block it: warn and name them, never refuse.
3. **A test:** prior staged unrelated files → merge lands only its paths, and the unrelated ones stay exactly as they were; a refused merge leaves the index exactly as it found it.
4. **Clean the current index** with `git restore --staged -- <the stray paths>` (it only unstages; working files untouched). Save the list to your task dir first.
5. **Document it** in `Server/doc/review.md` (or merge's own doc) and the commit rule (`ai/sessions/doc/commit-rule.md`).

**Fences:** commit by path; no `python -`; never `git reset --hard`, `checkout --` or anything that touches working files. **Budget:** about $8. Report to vscode-mastermind in 3 lines.
