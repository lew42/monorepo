# background-layer — a swappable background layer: one div behind the content that can be a colour, a texture, scattered icons, shapes

Load the `minion` skill first. Then this brief. Model: Sonnet.

**Three laws.** Less is more (one small primitive; the variety is in what you put in it). Clear beats brief by far. Prioritize (the primitive and a wall of examples first; the rules of thumb last).

## The owner's words (2026-09-19)

> Launch a minion to design a background layer system. So we have a div, probably with a class of background, inset zero. It's basically a modular, swappable background. It could be a color, it could be an entire design. You could put an icon as texture — repeating icons — or a collection of icons that are just scattered. You could do all kinds of stuff with just vectors and shapes and CSS and positioning. But then, if you have a background layer, you could just have all the content on top of that. I think if you just absolutely position the background element, you might not need to wrap all the content, but it might not be a bad idea just out of habit, so that if you needed to do something with its z position, or add padding, for example, you know.

## Build

1. **The primitive** — a new `ui/` module, `public/framework/ui/background/` (`background.js` with its CSS in the module the way sibling `ui/` templates do it — read two of them first; `readme.md`, `page.js`, `doc/decisions.md`; declared in `ui/page.js`'s children):
   - `.background` — `position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;` and `aria-hidden`. Its host gets `position: relative; isolation: isolate` (a word such as `.has-background`, or `:has(> .background)` — choose and say why), so the layer can never escape its host or fight anything outside it.
   - **The content wrapper question the owner raised — decide it with a demo, both ways on the page:** (a) no wrapper: the host's other children simply paint above a `z-index: 0` first child because they come later… show exactly when that is true and when it is not (a positioned or transformed child, a negative z-index); (b) a `.content` wrapper with `position: relative; z-index: 1` that also takes the padding. Recommend one as the habit, in one sentence, and write the `decision` line with the other as the alternative.
   - A tiny function so a page can write it in one line: `background(kind, options)` inside any box — for example `background("dots")`, `background("icons", { icons: ["star", "bolt"], count: 24, seed: 7 })`, `background(() => { …any elements… })`.
2. **The kinds — each a few lines of CSS or a small function, no images, no dependency:** a flat colour or one of the design system's grounds (`--darken-1…3`, `--lighten-1…3`, `--wash`); a gradient; a CSS pattern (dots, grid lines, diagonal stripes — `background-image` gradients sized in `em`); **one icon repeated as texture** (the Material icon font the site already loads — find how `icon()` in `core/View/View.js` draws one; a tiled grid of glyphs at low opacity, rotated); **a scatter of several icons** (seeded random so it is the same on every load: position, size, rotation, opacity — and sparse enough that text over it stays readable); **shapes** (a few large blurred circles or blobs from plain divs; an SVG wave along one edge); a **spotlight** (a radial gradient that can follow a CSS variable). Eight to ten in all.
3. **The page is a wall** — `/framework/ui/background/`: one screen, a grid of cards, each card a small box WITH real content on top (a heading, a sentence, a button) so the owner judges readability, not wallpaper; the kind's one-line code under it; click a card to see it large behind a realistic section (a hero and a three-card row). A switcher at the top swaps the background of the WHOLE wall's header live — that is the "modular, swappable" point, shown.
4. **Readability is the rule of thumb** — measure the contrast of body text over the busiest part of each kind (a canvas sample or the computed colours); any kind under 4.5:1 gets its opacity lowered until it passes, or is labelled "headings only". Say the numbers on the page in small text.
5. **Dark mode and sizes:** every kind reads tokens (`--ink`, `--paper`, `--prim`, `light-dark()`), so it follows the theme; sizes are `em` or container units so a texture does not turn to dust at 3440. Shots at 400, 1280 and 3440.

## Prove

Private server `PORT=8137 node server.js` (background; kill by its real Windows PID at landing). Shots of the wall at 400, 1280, 3440, light and dark; the large view of two kinds; the wrapper demo. No console errors; no horizontal scrollbar; the layer never intercepts a click (assert a button over it is clickable). Then look at the shots as a stranger: would you ship a page with each of these behind it? Cut the ones you would not.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/background-layer/`); `code`, `css`, `new-css-class`, `new-page`, `layout` (its rules are suggestions; the shot is the verdict), `ui-test`, `documentation`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `public/framework/ui/background/**` (new), `public/framework/ui/page.js` (the children line only), `public/framework/styles/css-scopes.txt` (register your prefix; siblings are appending to it today — re-read right before your edit), your task dir. Not `framework.css`, not `core/**`.
- After every `.js` write the hook checks the file parses and will stop you if it does not — fix it at once; a module that does not parse blanks every page that imports it, live, for the owner. **Never put a backtick inside a comment inside a `css()` template.**
- **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123), never drive the owner's tabs.** Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing in this shell. Write files with the Write or Edit tool — a bash heredoc eats backslashes and fails on apostrophes in this harness. Do not write the owner's name anywhere.
- Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; block the socket with `page.routeWebSocket(/.*/, () => {})`. Scratch in the session scratchpad.
- Landing `outcome`: one screen — the primitive in three lines, the kinds kept and cut, the wrapper decision, the contrast numbers, the link.
