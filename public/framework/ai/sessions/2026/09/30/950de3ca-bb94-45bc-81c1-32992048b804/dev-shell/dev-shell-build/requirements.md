# Minion B: the dark dev shell on Ctrl + \

Load the `minion` skill first, then `code`, `css`, `page`.

**The owner's words:** `public/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/owner-words.md` (read in full; re-read, more may be appended). Card dir: `public/framework/ai/2026/09/30/shell-header-sidebars-footer-the-dark-de/`. Agreed design: `public/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/design.md`. The general Shell was just built by minion A at `public/framework/core/Shell/` (read its readme and Shell.js first; use its `frame: true` + `dark` options, don't build a second shell).

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\dev-shell` (branch `worktree/dev-shell`, server http://localhost:54678/). Commit after each finished piece, by exact path.

## Deliverables

1. **`public/framework/dev/DevShell/`** (`DevShell.js`, `DevShell.css` if needed, `page.js`, `readme.md`, `doc/`): Ctrl + \ toggles a DARK shell around the whole site, obviously different from the site. It is `new Shell({ frame: true, dark: true, … })`:
   - **left**: the page tree / route and the `structure` section (from `dev/DevBar/tools.js`, `structure.js`).
   - **right**: the dev bar's tabs (chat/page/layout/ai), reusing `dev/DevBar`'s section functions by import. Don't copy them.
   - **header** (thin, one line): the path bar (`pathbar.js`), edit toggle, hold/block, width presets (`width.js`), a close ✕, and a **"v1"** button that switches to the old dev bar.
   - **footer** (thin, optional, on by default is fine): socket state, viewport width.
   - Lean on the site's CSS and tokens: `color-scheme: dark` does the dark theme. Scrap most of devbar.css for the shell's own look; don't restyle what framework.css already styles.
2. **The page underneath is never moved, only pushed:** in `public/framework/framework.css` `.app`, add padding from `--shell-top/left/right/bottom` (0 when off), next to the existing `--devbar` line, same floor logic. Turning the shell off must return the page exactly as before (compare a screenshot off → on → off).
3. **Hook-up:** `public/app.js` (and DevBar.js's key handler) so Ctrl + \ opens the dev SHELL by default; the "v1" button (and a remembered setting) opens the old `dev/DevBar` rail instead, which must keep working untouched. Only one opens at a time.
4. **Readme + a page** at `/framework/dev/DevShell/` showing a screenshot of the dev shell on a real page, linked from `public/framework/dev/page.js` `children:` (check it exists) and a line in `dev/DevBar/readme.md` pointing to it as v2.
5. **Proof:** headless (Playwright, never the owner's tabs): load `http://localhost:54678/framework/core/Page/`, press Ctrl+\, screenshot at 400, 1920, 3440; press again, screenshot; zero console errors. Save the shots under `public/framework/dev/DevShell/shots/` and show them on the page.

## Fence
Write only: `public/framework/dev/DevShell/**`, `public/framework/dev/DevBar/DevBar.js` (key handler + v1 switch only), `public/framework/dev/DevBar/readme.md` (one line), `public/framework/dev/page.js` (children), `public/app.js` (the hook), `public/framework/framework.css` (the `.app` padding only), `public/framework/styles/css-scopes.txt` (prefix). If Shell.js needs a fix, make the smallest one and say so in your log.

Every spawned process: `windowsHide: true`. Stop any server or browser you start. Budget: about $5. End your turn with a 3-line summary: files, how to use it, what's left.

