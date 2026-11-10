# Step 3: a layout check at merge, no screenshots

Budget: $4. Load the `minion` skill first, then `code`. Card (the owner's words): `public/framework/ai/sessions/2026/11/09/cards/ui-kit-one-small-set-of-parts-every-page/`. Plan: [/live/plan/ui-kit/](/live/plan/ui-kit/), card 3.

Work in a worktree (`take_worktree`). Commit by exact path after each working piece. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.

## What to build

`Server/LayoutCheck.mjs` (one class, `class LayoutCheck`, CLI at the bottom):

```
node Server/LayoutCheck.mjs <base url> <page url>... [--widths 400,1200] [--json]
  /live/plan/ui-kit/    400   BROKEN 1  OFF 3    text overflows its card (.live-card > p)
  /live/plan/ui-kit/   1200   GOOD
```

- Opens each page headless with `Server/Browser.mjs` (the same launcher `Server/smoke.mjs:34` uses), at each width, waits for the page to settle (DesignTool readme: `frame()` waits 350 ms; wait for `.page.active-page` or the LivePage root), then in the page runs `analyze(root)` from `/framework/ext/DesignTool/DesignTool.js` and `PaddingContract.check(root)` from `/framework/library/PaddingContract.js`, and returns counts by severity plus the top 3 findings (message + address).
- Recycle the browser context every ~40 navigations (DesignTool readme, "Watch out").
- A page that fails to load is a line saying so, never a throw.
- **Baseline:** `--baseline` writes `Server/layout-baseline.jsonl` (one line per url+width: counts and finding keys). Without it, each line also says `new BROKEN: N` against the baseline.

## Wire it into merge, report only

In `Server/merge.mjs`, right after the smoke run (around line 595, where `smokePages` is computed), run `LayoutCheck` on `smokePages` against the worktree's server, and print its table. Reuse what merge already has: the worktree base url it hands smoke and `NavCheck.mjs` (around lines 641–666), and the widths `widthsFor` picks (line ~309) for each page, never fewer than 400 and 1200. No second screenshot pipeline: `LayoutCheck` measures, it takes no screenshots. **It never fails the merge in this step** (exit code ignored; one line `layout check: N pages, M new BROKEN (report only)`). Skip it under `--skip-smoke` and `--quick`. Keep its time short: if it takes more than ~3 s a page, say so in your log.

## Prove it

- Run it on five real pages, at least `/live/`, `/live/plan/ui-kit/`, `/framework/library/?at=ui/card`, `/framework/ui/card/`, `/framework/`. Paste the table into your log.
- Make one deliberate break in a scratch page in your worktree (not committed), show the check reports it as BROKEN, then remove it.
- Two numbers that must agree: findings for `/framework/ui/card/` at 1200 from your script, and from `analyze()` run in a headless page by hand (`mcp__site__eval` on a fresh tab, or a Playwright one-off).
- A lean core test `Server/LayoutCheck.test.mjs` (one instance, a stubbed page result, under 1 s; see `public/framework/core/Test/readme.md`).

## Docs

One line in `Server/readme.md`, and a short "Merge check" section in `public/framework/ext/DesignTool/readme.md` saying merge now runs it (report only) and how to read a line. Same commit.

`node Server/smoke.mjs <worktree>` clean. Reply in one message: branch, commits, the five-page table, the deliberate-break line, the two agreeing numbers. Do not merge.
