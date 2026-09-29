# The worktree pool — landed on `worktree/quickfix-worktrees`

**Servex now keeps one quick-fix worktree warm.** Any agent calls `take_worktree`
and gets `{id, path, branch, url}` back in about 50 ms: a worktree already on
`michael/dev`, with its own server answering and a page watcher on. Taking one
makes Servex prepare the next one, which is ready about 6 seconds later.
`return_worktree` hands a clean, merged worktree back. Anything uncommitted or
unmerged is refused with the list, and nothing is thrown away. There are at most
3; a ready one idle for more than 6 hours is removed.

**Proven on a private Servex (port 8190), never the live one:** 14 checks passed,
0 failed — [proof.txt](./proof.txt), made by [proof.mjs](./proof.mjs). The run
covered: one ready at boot, a take in 58 ms, the next ready in 6.1 s, an unused
return (with the extra removed), a dirty return refused, the cap of 3 naming each
holder, no visible windows, the same slot adopted after a Servex restart, and
every `qfp-*` worktree and branch gone at the end.

**Read more:** [Servex/doc/pool.md](/Servex/doc/pool.md) (what, why, the two tools,
K and N, the state file) · the code, `Servex/Pool.js`, wired in `Servex/Servex.js`.

**Two things found along the way:**

- **Every fresh worktree starts dirty.** Its own dev server appends the
  `page.jsonl` lines `michael/dev` has not committed yet. The pool keeps those
  files and their contents as the slot's baseline, so an unused slot can still
  be returned. Committing those lines to `michael/dev` would make new worktrees
  start clean.
- **`.worktree-pool.json` needs one `.gitignore` line**, like `.worktrees.json`.
  That file is outside this minion's fence, so it is left to the task mastermind.
