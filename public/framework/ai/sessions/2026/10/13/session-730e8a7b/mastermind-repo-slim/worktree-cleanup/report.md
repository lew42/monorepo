# Worktree cleanup, 2026-10-13: 33.3 GB down to 6.0 GB, nothing lost

**Before:** 33.3 GB in worktree folders ([size-before.txt](size-before.txt), robocopy byte totals at 16:14).
**After:** 6.0 GB ([size-after.txt](size-after.txt)). Every file removed was already in git, was ignored
by `.gitignore`, was a dev server's own log, or was first committed on its worktree's own branch.

The three decisions (where worktrees live, why the pool is not reused, why they pile up) are in
[doc/worktrees.md](doc/worktrees.md).

---

### ✅ Worktrees git knew about: 56 seen, 8 left

- **28 pruned.** Each was merged into `michael/dev` and had nothing changed but server logs
  ([prune-apply.txt](prune-apply.txt); dry run in [prune-dry.txt](prune-dry.txt)).
- **14 salvaged.** Each was merged but had other changes. Those changes were committed on the
  worktree's own branch as `salvage(<name>): working tree at prune, 2026-10-13`, then the worktree was
  removed. [manifest.json](manifest.json) lists each old path, its branch and its commit. To bring one back:
  `git worktree add <path> <branch>`.
- **4 recycled by the pool itself** (`qf-1` to `qf-4`), once its stuck loop was unblocked
  ([doc/worktrees.md](doc/worktrees.md), decision 2).
- **8 left on purpose:**
  - 4 live pool slots (`qf-2`, `qf-6`, `qf-7`, `qf-8`);
  - `qf-5`, locked;
  - 3 branches with commits that are not in `michael/dev` (listed in the next section).

### ⚠️ For the owner: 3 branches that are not merged (not touched, not merged)

```
worktree/orphans      bbad3c3f0 review report and file logs
                      41cfd91e6 page: opt-in children 'auto' from files.jsonl; Server/OrphanCheck.mjs as a merge warning; indexing answer
worktree/readmeaudit  19b63fffd review report and generated file logs for readme audit
                      150ee52b3 readmes: index ext/Figma in the root and ai readmes
worktree/refine-demo  3e770f35d task(refine-demo): landed
```

### `wt-task-folders` (detached)

Its HEAD was `a77fb7695` ("task-folders: day pages stay dashboards …"). That commit is already in
`michael/dev` and in `michael/task-folders-2`, so no salvage branch was needed, and it was pruned.

### `qf-5`

It is locked with the reason `initializing`. That means a `git worktree add` crashed on 2026-10-12 02:12.
It was left alone, as the brief says. The pool or the owner can clear it with
`git worktree unlock` followed by a prune.

---

### ✅ Half-removed folders: 29 found, 24 removed

When `git worktree remove` fails partway on Windows, git forgets the worktree but leaves its files.
[`Server/worktree-leftovers.mjs`](../../../../../../../../../../Server/worktree-leftovers.mjs) hashes every file
and removes a folder only when every file is already in git, ignored, or a server log
([leftovers-apply.txt](leftovers-apply.txt), [leftovers.json](leftovers.json)).

**Kept, with the reason:**

- `proposal-flow` holds 2 `task.jsonl` files git has never seen.
- `server-query-parity` holds 29 session `index.json` files git has never seen.
- `wt-refine-haiku-live` holds a local Miniflare store (`.wrangler/`, with D1, KV and R2 data) that git
  never had.
- `whisper-log` was removed only partly (EPERM). What is left is all in git.
- `screenshot-build-a` is an empty folder. Three hung `bash.exe` shells from an old session still have it as
  their working directory.

---

### Follow-ups for the Servex owner (outside this task's fence)

1. Run `worktree-prune.mjs --salvage --idle-hours 6` from the pool's 10-minute sweep. This is the one fix
   that stops the pile-up.
2. In `Pool.js`, `recycle_orphans()` should go on to the next slot after a failure instead of throwing,
   and should make the salvage branch only after `git add` succeeds.
3. There are 151 `salvage/qf-1-*` branches, 150 of them at the same commit, which is already merged.
   Deleting them would lose nothing, but `pool.md` says salvage branches are never deleted, so they stay
   until someone decides.

The [task log](task.jsonl) has the step-by-step detail.
