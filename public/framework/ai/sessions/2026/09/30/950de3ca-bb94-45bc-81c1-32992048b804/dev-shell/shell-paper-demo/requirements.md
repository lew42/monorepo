# Minion D: make the paper-shell demo show the nine-grid

Load the `minion` skill first, then `page`, `css`.

**Context:** `core/Shell` now has `paper: true` (commit `5f437959` in the worktree): a nine-grid with the white paper in the middle and a gray well around it. The design is `public/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/design-2.md`. The demo built for it does not show the idea. See `public/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/shell-paper/after-shell-1920.png`.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\dev-shell` (branch `worktree/dev-shell`). Its server: http://localhost:54678/. If it doesn't answer, start it by hand with `node Server/index.js` and `PORT=54678` from the worktree, with `windowsHide: true`. Commit by exact path. Headless Playwright only (global: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`).

**Fence:** `public/framework/core/Shell/page.js`, and `Shell.css` only if the well colour itself is wrong; plus this folder.

## Fix, in the first demo on /framework/core/Shell/

1. **Real content with real widths.** Left = a short 4-item section list. Right = a "chat" placeholder box about 14rem wide (a plain box labelled "chat"; NOT a real chat). Header = "Page title · Tab · Tab". Footer = one status line. Right now left and right are bare words with almost no width, so no side well and no corners are visible.
2. **The well reads as solid gray** against the demo stage. Right now the stage's checkerboard shows through. Use a solid well that is clearly darker than the stage, from the site's tokens (no named colours).
3. **The nested paper is visibly "one size smaller"**: its own small left, its own header, and three or four lines of body. Right now it is a single line.
4. **The Shell page's background:** compare `/framework/core/Shell/` against the main site (http://monorepo.localhost/framework/core/Shell/). If the gray page background is new from the paper change, undo it.
5. The other 7 demos stay unchanged.

**Proof:** the first demo at 400 and 1920, saved here as `demo-400.png` and `demo-1920.png`. Look at each and answer in `result.md`, in one line each: can you see the gray corners? Do the header text and the paper's left edge line up? Is the nested shell visibly smaller? Then commit and reply with the commit id.

