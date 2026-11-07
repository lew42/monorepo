# Stale dictate button on the "Page Load Error" screen

Budget: $3. Load the `minion` skill first.

## The ask (the owner, relayed by voice-app, 2026-11-06)
On the "Page load error" screen, an old AI/dictate diamond button appears overlaid at the top right and launches an older
dictate. Find where that error screen and that button come from and remove the stale button. The site's current dictate
in the mobile rail is the only one.

## What is known
- The error screen is `App.error()` in `public/framework/core/App/App.js:82` (h1 "Page Load Error" in `$pages`).
- /live/ pages normally hide some chrome; on an error there is no `.live-page`, so something normally hidden may show.
- Reproduce: open a url that 404s, e.g. `http://monorepo.localhost/live/no-such-page-xyz/` and `/framework/no-such/`, headless at 400 and 1200 wide
  (Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; in Git Bash set `MSYS_NO_PATHCONV=1`).

## Do
1. Shoot the error screen; find the diamond button's element and the file that creates it (rg in `public/`, likely `ux/Dictate/` or `dev/`).
2. Say in your task log (`task.jsonl` in this folder, `log` lines) which file and line make it and why it shows there.
3. Fix it in a worktree (`node Server/worktree-up.mjs error-button`): remove the stale button (or stop it mounting) so the mobile
   rail's dictate is the only one. If the file belongs to a live system and removing it would break a page that still
   uses it, stop it showing on the error screen instead and say so. Update the readme of the module you touch in the same commit.
4. Smoke: `node Server/smoke.mjs` on the worktree must show no FAIL; shots before and after go into `shots/` here.
5. Do NOT merge: report back to mastermind-live-page with the branch, the commit and the two shots. I review and merge.

Never kill or restart the dev server or Servex, never drive the owner's tabs, never stash (diff, don't stash).
