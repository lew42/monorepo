# Study: open a worktree's dev server from the owner's phone

**The owner (ask 45):** "we should be able to have a dev server for each worktree… figure out how to get the worktree's server running on my phone so that I can click through to it."

**What happens today:** each worktree's server answers at `<name>.localhost` through Servex's port-80 proxy, which only this PC can reach. And a build's worktree folder (with its server) was closed by Servex soon after the build landed: see the "worktree-close" log lines in `../backbone/session.jsonl` and `../class-docs/session.jsonl`.

## Answer, as a study (no build, no config change)

1. **Reachable:** how does the phone reach the main site today, off this PC? Find the existing tunnel or remote setup in the repo: `Servex/`, `Server/`, the root `readme.md`, `Servex/ext/remote/`. **Never print a token, key or secret,** not even in part; name the file a secret lives in, nothing more.
2. **What it would take** for `<worktree>.localhost` to be reachable from the phone the same way: a subdomain per worktree, a path prefix on the existing tunnel, or Servex proxying by a `?tree=` choice. Weigh each option for safety (worktree code is unreviewed) and effort.
3. **Kept alive:** why did Servex close each build's worktree folder after landing? Name the code (`Servex/Worktrees.js`, `Servex/Pool.js`, …) and the rule. What would keep a worktree up while it waits for the owner's review, and close it after the merge?
4. Recommend one option, and list its steps.

## Write

- **`study.md` in this folder:** one screen; file:line for each claim.
- **Fences:** write only here; no code or config edits; never print secrets. Commit by path. Budget about $8. Finish by about 19:30.
