# server-fixes — three small, proven fixes under `Server/`

Minion: Sonnet, effort high. Session id `6cd1f3b4-02e8-459c-afba-893362dcca3d`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Private port **8096**
for boot tests; worktrees you make go to `C:/Code/lew42/worktrees/` and are removed before you land.

⚠ A save under `Server/` restarts every supervised dev server watching this tree, the owner's
included, after a boot test on a spare port (`Server/doc/watch.md`). So: hold on, write ALL
three fixes, `node --check` each, boot your own `PORT=8096 node server.js` and curl a 200 from
it, prove each fix, THEN hold off — one restart for the batch. Check `ls node_modules | wc -l`
is 68 before you start; if it is empty, run `npm ci` at the root first (it was emptied once
today by fix 1's bug).

## The three fixes — found today by `worktree-design` (its log names each exactly)

1. **`Server/worktree-up.mjs` junctions `node_modules` into the worktree, and `git worktree
   remove` follows the junction and empties the MAIN checkout's `node_modules`** (happened at
   ~15:05 today; 68 packages gone; the live site survived only because express was already in
   memory). Fix: no junction — run `npm ci` in the new worktree instead (measured 5 s for 68
   packages), or if you find a way to make a link that `git worktree remove` provably does not
   follow, prove it on a throwaway worktree with `ls node_modules | wc -l` on the main tree
   before and after removal. Say which in a `decision` line.
2. **`Server/worktree-down.mjs` can never remove what up.mjs made:** up.mjs writes
   `.worktree-server.log` INSIDE the worktree, down.mjs refuses because `git status --porcelain`
   is non-empty, deletes the registry entry anyway, and leaves 278 MB and a branch on disk. Fix:
   write the log outside the worktree (beside the registry, or `%LOCALAPPDATA%/lew42/worktrees/`)
   or exclude it via `.git/worktrees/<name>/info/exclude` — and make down.mjs remove the branch
   it made. Prove: `up` then `down` on a throwaway name leaves `git worktree list` at one entry,
   `git branch --list` without the branch, and the directory gone.
3. **`Server/Server.js:52` binds `0.0.0.0` by default.** Make it `process.env.HOST ||
   '0.0.0.0'` — the default stays as the owner has it (their LAN use is not yours to change),
   and Servex passes `HOST=127.0.0.1` to the servers it starts. One line, plus one line in
   `Server/README.md` naming `HOST`. Prove: `HOST=127.0.0.1 PORT=8096 node server.js` shows
   `127.0.0.1:8096` in `netstat`, not `0.0.0.0`.

Then `Servex/Process.js` (or wherever `servex-port` builds the child's env — read
`Servex/readme.md`) gets `HOST: "127.0.0.1"` added to the env it passes. That is your one write
under `Servex/`.

## Fence

`Server/worktree-up.mjs`, `Server/worktree-down.mjs`, `Server/Server.js` (line 52 only),
`Server/README.md` (one line), the one env line in `Servex/`, your task dir. Append-only to
`.jsonl`. Never `git stash`/`reset`/`checkout --`; never touch the owner's :80 or the
mastermind's :8123.

## Length

No page — this is plumbing; the landing report is six sentences with the three proofs.
