# Build brief — a dark card for a mastermind or minion session

**Load the `minion` skill first.** Then read `CLAUDE.md` (the laws) and this page to the end.

## The owner's words (verbatim, 2026-09-22)

> Let's try a dark themed card for a minion or a mastermind session — big tasks, a worktree spawned — help me see what's going on.

## What to build

One page that shows **one dark card** for the session in [`fixture.json`](fixture.json) (beside this
brief — a real mastermind with a worktree and ~100 minions, trimmed). The owner should glance at it
and know: what this session is working on, how far along it is, what it has spawned (worktree,
minions), what it costs, what it is doing right now, and whether it is waiting on them.

- The page: `public/framework/ai/2026-09-24/recipe-lab/build/page.js` (+ one `.css` beside it if needed).
  It is already declared by its parent (`recipe-lab/page.js` names `build` in `children:`). Use the
  `new-page` skill's shape. Import the fixture with `fetch(new URL("../fixture.json", import.meta.url))`
  — and remember: **no DOM after an `await`**; capture the box synchronously, fill it in a callback.
- The card is the page's one takeaway. Dark ground, light text, readable at 1920 without zooming.
  A short heading line above it is fine; no long prose.
- Plain framework code: `import { Page, div, ... } from "/app.js"`. Every CSS rule inside a layer
  (`@layer site { … }`). No new npm dependency, no build step.
- Invent nothing that is not in the fixture. You choose what to show big and what to show small.

## Fence

You may write ONLY inside `public/framework/ai/2026-09-24/recipe-lab/build/`. Nothing else in
the repo — not the parent page, not `fixture.json`, not framework CSS.

## Done means

1. The page loads on YOUR worktree server (the port is in your prompt) with **zero console errors**:
   check it headless (Playwright, a script in your scratchpad) and take one screenshot at
   1920×1080 into `build/shot-1920.png`.
2. Commit your files on your worktree's branch (only files inside your fence). Never merge, never push.
3. Reply with one short paragraph: what the card shows, and anything you were unsure of.

Budget: aim to finish in about 15 minutes. Don't over-polish.
