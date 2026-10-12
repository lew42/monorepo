# Proof: the node_modules guards, each run on a scratch copy

Every run below used a fake "main" folder in the session scratchpad (`<scratch>`), never the real tree.
Each is also logged as an `experiment` line in [task.jsonl](task.jsonl).

## 0. junction-check's first real find

The first run of `node Server/junction-check.mjs` against the real worktrees found **6 live
junctions** into the main tree, all `Servex/node_modules`: in assistant-layers, concurrency,
helper-fixes, servex-crash, servex-monitor and task-loop. The 15:20 cleanup had removed only the
root `node_modules` links. Removing any of those six worktrees would have emptied the main
`Servex/node_modules` again. The task mastermind removed all six (the link only), and the check
now reports 0.

```
INTO MAIN  C:\Code\lew42\worktrees\assistant-layers\Servex\node_modules  ->  C:\Code\lew42\monorepo\Servex\node_modules
INTO MAIN  C:\Code\lew42\worktrees\concurrency\Servex\node_modules  ->  C:\Code\lew42\monorepo\Servex\node_modules
INTO MAIN  C:\Code\lew42\worktrees\helper-fixes\Servex\node_modules  ->  C:\Code\lew42\monorepo\Servex\node_modules
INTO MAIN  C:\Code\lew42\worktrees\servex-crash\Servex\node_modules  ->  C:\Code\lew42\monorepo\Servex\node_modules
INTO MAIN  C:\Code\lew42\worktrees\servex-monitor\Servex\node_modules  ->  C:\Code\lew42\monorepo\Servex\node_modules
INTO MAIN  C:\Code\lew42\worktrees\task-loop\Servex\node_modules  ->  C:\Code\lew42\monorepo\Servex\node_modules
junction-check: 6 link(s) land in the main checkout. […] exit=1
```

## 1. Script guard: worktree-down refuses, fake main survives

A scratch git repo `fakemain` holds `node_modules/express`. Its worktree `fakewt` has
`node_modules` as a junction into it, and is registered in `.worktrees.json`. Then
`node Server/worktree-down.mjs fakewt` is run. As a control, the link alone is removed and it is run again.
Script: `proof1.sh` in the scratchpad.

```
lrwxrwxrwx 1 mike 197609 130 Sep 29 16:28 node_modules -> <scratch>/proof/fakemain/node_modules
=== junction-check (run from fake main) ===
junction-check: 1 link(s) under <scratch>\proof\worktrees; main checkout is <scratch>\proof\fakemain.
  INTO MAIN  <scratch>\proof\worktrees\fakewt\node_modules  ->  <scratch>\proof\fakemain\node_modules
junction-check: 1 link(s) land in the main checkout. Deleting their worktree, or running npm in it, would empty the main tree's files. Remove the link only: (Get-Item <path>).Delete()
exit=1
=== worktree-down fakewt (git worktree remove would delete through the junction) ===
junction-guard: refusing git worktree remove in <scratch>/proof/worktrees/fakewt: it holds 1 link(s) into the main checkout <scratch>\proof\fakemain.
    <scratch>\proof\worktrees\fakewt\node_modules  ->  <scratch>\proof\fakemain\node_modules
  Doing it would delete or overwrite the MAIN tree's files through the link. Remove only the link first
  (PowerShell: (Get-Item <link>).Delete()  ·  cmd: rmdir <link>) and retry. See Server/doc/worktrees.md.
worktree-down: server stopped; the worktree is left in place at <scratch>/proof/worktrees/fakewt.
exit=1
=== after: fake main's express still there? ===
package.json
<scratch>/proof/worktrees/fakewt
worktree left in place
=== control: remove the link only, then worktree-down succeeds ===
worktree-down: removed <scratch>/proof/worktrees/fakewt.
Deleted branch worktree/fakewt (was e7751b9).
worktree-down: done.
exit=0
package.json
worktree removed
```

## 2. Keeper: a missing package is reinstalled, at most once per 10 minutes

`ensure_deps()` (what `sustain.mjs` calls before every start) runs on a scratch `app/` that
depends on a local tarball `fakepkg`, so no network is needed.

```
1. missing before: true
  sustain: fakepkg is missing in <scratch>\g2\app — running npm install there before starting Servex
  sustain: npm install in <scratch>\g2\app done; fakepkg is back
   result: [ 'installed' ]
   present after: true   is a link? false
2. emptied again, second check at once:
  sustain: fakepkg is missing in <scratch>\g2\app, but npm install ran there 1s ago — not again yet
   result: [ 'skipped (ran 1s ago)' ]
3. eleven minutes later:
  sustain: fakepkg is missing in <scratch>\g2\app — running npm install there before starting Servex
  sustain: npm install in <scratch>\g2\app done; fakepkg is back
   result: [ 'installed' ]
4. nothing missing: [ 'ok' ]

```

(A deprecation warning from this first run was fixed after it; a rerun shows none.)

## 3. Hook: blocks hand-typed deletes and links into main

Fake hook JSON was piped into `.claude/hooks/junction-guard.mjs`, with a scratch main and worktree.
Each case shows one block and one allow.

```
=== remove case, no links: ALLOW
--- remove, clean
    command: git worktree remove --force <scratch>\proof3\worktrees\wt1
    exit=0 (54 ms incl. two node starts)
=== remove case, Servex/node_modules is a junction into main: BLOCK
--- remove, junction present
    command: git worktree remove --force <scratch>\proof3\worktrees\wt1
    exit=2 (60 ms incl. two node starts)
    junction-guard: blocked. This command deletes or reinstalls files, and 1 link(s) in a worktree land in the main checkout,
    so it could delete the main tree's files through them:
        <scratch>\proof3\worktrees\wt1\Servex\node_modules  ->  <scratch>\proof3\main\node_modules
    Remove the link only (never its contents), then retry: PowerShell (Get-Item <link>).Delete()  ·  cmd rmdir <link> (no /s).
    Full check: node Server/junction-check.mjs. See Server/doc/worktrees.md.
--- npm ci, junction present
    command: npm ci
    exit=2 (68 ms incl. two node starts)
    junction-guard: blocked. This command deletes or reinstalls files, and 1 link(s) in a worktree land in the main checkout,
    so it could delete the main tree's files through them:
        <scratch>\proof3\worktrees\wt1\Servex\node_modules  ->  <scratch>\proof3\main\node_modules
    Remove the link only (never its contents), then retry: PowerShell (Get-Item <link>).Delete()  ·  cmd rmdir <link> (no /s).
    Full check: node Server/junction-check.mjs. See Server/doc/worktrees.md.
--- harmless command, junction present
    command: git status
    exit=0 (57 ms incl. two node starts)
=== mklink case
--- mklink into main: BLOCK
    command: cmd /c mklink /J "<scratch>\proof3\worktrees\wt1\node_modules" "<scratch>\proof3\main\node_modules"
    exit=2 (57 ms incl. two node starts)
    junction-guard: blocked making a link into the main checkout (<scratch>\proof3\main\node_modules).
    A worktree must never share the main tree's files: deleting it, or running npm in it, deletes them through the link
    (that emptied the main node_modules on 2026-09-22 and 2026-09-29). Get a worktree with its own node_modules from
    node Server/worktree-up.mjs <name>, or the Servex take_worktree tool; both run npm ci. See Server/doc/worktrees.md.
--- New-Item junction into main: BLOCK
    command: New-Item -ItemType Junction -Path <scratch>\proof3\worktrees\wt1\node_modules -Target <scratch>\proof3\main\node_modules
    exit=2 (102 ms incl. two node starts)
    junction-guard: blocked making a link into the main checkout (<scratch>\proof3\main\node_modules).
    A worktree must never share the main tree's files: deleting it, or running npm in it, deletes them through the link
    (that emptied the main node_modules on 2026-09-22 and 2026-09-29). Get a worktree with its own node_modules from
    node Server/worktree-up.mjs <name>, or the Servex take_worktree tool; both run npm ci. See Server/doc/worktrees.md.
--- mklink elsewhere: ALLOW
    command: cmd /c mklink /J "<scratch>\proof3\worktrees\wt1\x" "<scratch>\proof3\worktrees\wt1\Servex"
    exit=0 (58 ms incl. two node starts)
=== fail open: garbage stdin
    exit=0
=== fake main still intact:
express
```

Against the real tree (links now all removed): `git worktree remove x` exit 0 in 104 ms; `git status` exit 0 in 59 ms.

## 4. Pool: slots held by stopped agents are reclaimed, dirty ones kept and named

A `Pool` was run with a scratch state file holding the 13:25 situation: three slots taken since 09-28.
The agent registry and git checks are stubs.

```
=== A: qf-2 held by stopped figma-sept-cards (clean), qf-3 by gone dictation-playground (DIRTY), qf-4 by working ai2-lead-2
take() -> {"id":"qf-2"}
log:
  pool: qf-2 returned and ready
  pool: qf-2 reclaimed from figma-sept-cards, which has stopped
  pool: qf-3 is held by stopped dictation-playground but kept — qf-3 has uncommitted changes — commit and merge them, or move them, first. Nothing was discarded.
  pool: qf-2 taken by new-agent
slots: qf-2:taken:new-agent  qf-3:taken:dictation-playground  qf-4:taken:ai2-lead-2

=== B: every dead holder's slot is dirty -> error names them and gives the worktree-up hint
error: All 3 worktrees are taken: qf-2 by figma-sept-cards since 2026-09-28T10:00:00; qf-3 by dictation-playground since 2026-09-28T10:00:00; qf-4 by ai2-lead-2 since 2026-09-28T10:00:00. Held by a stopped agent but NOT reclaimed, because they hold work (nothing is ever discarded): qf-2 (qf-2 has uncommitted changes — commit and merge them, or move them, first. Nothing was discarded.); qf-3 (qf-3 has uncommitted changes — commit and merge them, or move them, first. Nothing was discarded.). Ask a holder to return_worktree, or wait. Or make your own: node Server/worktree-up.mjs <slug> (it runs npm ci); never link node_modules.
log:
  pool: qf-2 is held by stopped figma-sept-cards but kept — qf-2 has uncommitted changes — commit and merge them, or move them, first. Nothing was discarded.
  pool: qf-3 is held by stopped dictation-playground but kept — qf-3 has uncommitted changes — commit and merge them, or move them, first. Nothing was discarded.
slots: qf-2:taken:figma-sept-cards  qf-3:taken:dictation-playground  qf-4:taken:ai2-lead-2
```

