# Shell paper + the ☰ drawer at site level — result

Two commits, both in the worktree `C:\Code\lew42\worktrees\dev-shell` (branch `worktree/dev-shell`):

1. `5f437959` — `core/Shell`: `paper: true`, a real nine-grid (white paper, gray well)
2. `0fd7f70e` — `ext/drawer`: the ☰ drawer reads as site level, not the page's

## Merge 1 — `paper: true` on core/Shell

One new option, one new demo (first on the page), the 7 existing demos unchanged (verified at
1920/400, 0 console errors on `/framework/core/Shell/`).

**`main`** is a white "paper" (border + small radius). **`header`/`left`/`right`/`footer`** and
the four empty corners are a gray "well" — reusing the exact gray `ai2.css` and `ext/Doc/Doc.css`
already use for their own header bands, not a new colour. `header`/`footer` sit only above/below
`main`, never the full width, so their text lines up with the paper's own left edge — the whole
point, per the brief.

[`after-shell-400.png`](./after-shell-400.png) — the new demo at 400: header / left / (a nested
`paper: true` Shell, one size smaller) / right / footer, stacked, paper still white, well still
gray. [`after-shell-1920.png`](./after-shell-1920.png) is the same demo at 1920, and
[`after-shell-debug-outline.png`](./after-shell-debug-outline.png) adds a red outline on every
region to make the true nine-grid unmistakable: empty corners top-left/top-right/bottom-left/
bottom-right, `head`/`foot` no wider than `main`.

## Merge 2 — the ☰ drawer reads as SITE level

| Before | After |
|---|---|
| [`1920-drawer.png`](./1920-drawer.png) — ☰ still floats inside AI 2's own gray band while open; drawer's tab row sits level with the page's own tab row | [`after-1920-drawer.png`](./after-1920-drawer.png) — ☰ is gone; drawer's head is now a gray band (`--darken-2`, the same token `core/Sidebar`'s own filter band uses), noticeably taller than the page's row |
| [`400-drawer.png`](./400-drawer.png) — same issue, full-screen sheet | [`after-400-drawer.png`](./after-400-drawer.png) — same fix, full-screen sheet |
| [`1920.png`](./1920.png) — ☰ closed | [`after-1920.png`](./after-1920.png) — ☰ closed, unchanged position |
| [`400.png`](./400.png) — ☰ closed (mobile) | [`after-400.png`](./after-400.png) — unchanged (the page's own `.sidebar` toggle shows here, as before; the drawer's ☰ was already hidden below 52em) |

**The four deliverables, each measured with headless Playwright, not assumed:**

1. **☰ hidden while open** — `body:has(.drawer.on) .drawer-menu { display: none; }`. Confirmed
   both ways a reader can open it: clicking the ☰, and a cold load of `?drawer=ai` (the second
   path hits `drawer.js`'s own documented `.app`-vs-`<body>` fallback and mounts the drawer on
   `<body>` directly — a plain `.app:has(...)` selector would have missed that case; caught it by
   testing both paths, not just one).
2. **Same height and gray band as the left nav.** `core/Sidebar`'s own head (brand row + filter
   band) measures **103px** at 1920. The drawer's new head measures **88px** at 1920, **56px** at
   400 — not pixel-identical (one is two stacked rows, the other is one row of tabs that wraps),
   but the same weight of chrome, in the same `--darken-2` gray the left nav's own filter band
   uses.
3. **Clear edge** — `border-inline-start: 1px solid var(--line)` on `.drawer` was already there
   and already correct; unchanged. What stopped the two bands reading as one toolbar was the
   height difference above, not the line (the line was never the problem).
4. **Closed ☰ vs. the page's tabs, measured:** at 1920, the ☰ sits at `x:1877–1912`; the last real
   tab ("Overview") ends at `x:782` — a **1095px** clear gap. At 400 the ☰ doesn't render at all
   (`display: none`) — an *existing* rule (`.app:has(.sidebar) .drawer-menu`) already hides it
   below 52em whenever a `core/Sidebar` exists anywhere in the page, which every `/framework/...`
   page does. Nothing needed to change here; the numbers are recorded above and in
   `doc/decisions.md`.

## Deviations

- **The worktree's own server wasn't running and `Server/worktree-up.mjs dev-shell` refused** —
  this worktree already existed on disk and as a real git worktree (`worktree/dev-shell`), but
  wasn't in that script's own separate `.worktrees.json` registry (likely left behind by an
  earlier session in this same task). Started it by hand instead: `PORT=54678 node server.js`
  from the worktree root, per the minion skill's own fallback instructions. Confirmed it's a
  private, worktree-only server (not the owner's), stopped when done.
- **`menu.js` wasn't touched**, though the fence allowed it — the ☰-hides-on-open and the gray
  head band were both reachable with CSS alone, and the smaller diff felt truer to "less is more"
  than adding JS for something CSS already does.
- **The 4 console errors on every `/framework/ai2/` shot are pre-existing and unrelated**: this
  worktree's checkout is missing `ai/usage.json` and today's `ai/2026-09-30/{files,page}.jsonl`
  (runtime data files, not part of this task's fence) — same 404s appear with or without this
  task's changes. `/framework/core/Shell/` (this task's other proof page) has zero errors.

