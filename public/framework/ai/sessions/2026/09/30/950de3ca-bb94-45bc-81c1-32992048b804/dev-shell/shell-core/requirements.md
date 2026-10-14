# Minion A: the general Shell in core/Shell, with demos

Load the `minion` skill first, then `code`, `css`, `page`.

**The owner's words:** `public/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/owner-words.md` (read in full). Card dir: `public/framework/ai/2026/09/30/shell-header-sidebars-footer-the-dark-de/`. The agreed design (picture + table): `public/framework/ai/sessions/2026/09/30/950de3ca-bb94-45bc-81c1-32992048b804/dev-shell/design.md`. Follow it.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\dev-shell` (branch `worktree/dev-shell`, server http://localhost:54678/). Commit there after each finished piece, by exact path. Never touch the main tree.

## Deliverables

1. **`public/framework/core/Shell/Shell.js` + `Shell.css`**: `new Shell({ header, left, right, footer, main, frame, dark })` renders a CSS grid with named areas (`head` / `left main right` / `foot`). Every region optional; each is a function (rendered into the region, captor style) or a View. A missing region takes no space. `main` can hold another Shell (nesting must work, proven in a demo). Parts are methods (`header()`, `left()`, …) so a subclass overrides one. Left and right are resizable with `ext/grip` (`public/framework/ext/grip/`), width remembered per shell `name` in localStorage (wrap in try/catch). Header and footer are THIN: one line, about 2rem, for a path, properties, toolbar buttons.
   - `dark: true` (or per region, e.g. `dark: ["left","right"]`) = `color-scheme: dark` on those regions. That's the whole dark theme: the site's tokens are `light-dark()` pairs (see framework.css line ~54 and `dev/DevBar/devbar.css` top). Never name a colour.
   - `frame: true` = the shell is `position: fixed; inset: 0` around the window, its `main` cell is an empty, `pointer-events: none` hole, and it writes each region's size into four tokens on `<html>`: `--shell-top`, `--shell-left`, `--shell-right`, `--shell-bottom` (ResizeObserver). Minion B uses this for the dev shell; you only need it to work and be shown in one demo. Don't edit framework.css; B does the `.app` padding.
   - Below 34em: side regions stack or become toggled sheets; keep it simple and say which.
   - CSS: every rule in a layer (`theme`/`util`), class prefix `shell-` (run the `new-css-class` skill once for the prefix). Start from `/layouts/shell/Shell.js` + `shell.css` (rail/track, sticky, grip): reuse the ideas, don't import that lab.
2. **The page `/framework/core/Shell/`** (`page.js`, `readme.md`, `doc/`): level 1 SHOWS live shells: L, R, L+R, header+footer, L+R+header+footer, and nested (a shell in a shell's main), each small and labelled with its one-line code. Add `Shell` to `public/framework/core/page.js` `children:` and one line in `public/framework/core/readme.md`'s index. Use `create_page`/`new-page` skill mechanics.
3. Proof: `node Server/layout-check.mjs http://localhost:54678/framework/core/Shell/ --widths 400,1920,3440` (from the main repo root), look at the shots, zero console errors. Put the shots' paths in your log.

## Fence
Write only: `public/framework/core/Shell/**`, `public/framework/core/page.js` (children line), `public/framework/core/readme.md` (one index line), `public/framework/styles/css-scopes.txt` (the prefix line) — all in the worktree.

Every spawned process: `windowsHide: true`. Stop any server you start. Budget: about $4. When done, end your turn with a 3-line summary: files, the API, what's left.

