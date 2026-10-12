# Shots — the screenshot system (plan and architecture)

**Shots** takes a page's screenshots at the widths its template needs, keeps them in that page's own folder, compares each round with the one before it, and draws an overlay of what changed. Agents run it, read the pictures and judge; the owner gives the last word with one click in the dev bar's **Screenshots** tab.

## What already exists (past work, 2026-10-12)

| Thing | What it does | Used how |
|---|---|---|
| `Server/browser.mjs` | one shared headless Chromium per process | Shots launches through it |
| `ext/DesignTool/vision/` (the ScreenshotTool) | one Claude critique per shot, $0.07 each | left as is; Shots is the cheap layer under it |
| `site` MCP `shot` (`Server/plugins/Shot.js`) | one png in the temp dir | stays the quick look |
| `check_page` (`Server/browser-check.mjs`) | console and network errors | stays the smoke test |
| `Server/layout-check.mjs`, `padding-check.mjs` | numbers per width (empty space, overflow, ink at 0 px) | Shots links to them, does not repeat them |
| `merge.mjs` | a 1920 shot of each NEW page into `.merge-shots/` | gains a Shots reminder for UI changes |
| `public/imagine/lines/lines.js` (line filter, 2026-10-02) | line confidence per pixel, pure JS | the next step for the diff (below) |
| `Server/plugins/SocketServer/Append.js` | the browser appends a line to a `public/**.jsonl` | the owner's verdict click |

No PNG decoder exists in the repo; Shots hand-rolls one with node's built-in `zlib` (no new npm dependency).

## Classes (all in `public/framework/ext/Shots/`)

- `class Shots` (`Shots.mjs`, node) — the system: picks the widths, loads the page, writes the round, runs the diffs, appends the log. CLI: `node Server/shots.mjs`.
- `class PNG` (`PNG.mjs`, node) — `PNG.decode(buffer) → {width, height, data}` (RGBA), `PNG.encode(image) → buffer`.
- `class Diff` (`Diff.mjs`, node) — `Diff.compare(before, after, {cell}) → {changed, regions, overlay}`: cell by cell colour change, merged into regions, and an overlay image.
- `class ShotsView` (`ShotsView.js`, browser) — one page's rounds as a tree with before / after / overlay and the Better / Not better buttons. The same view renders in the dev bar's Screenshots tab and on `/framework/ext/Shots/`.

`Shots` composes `PNG` and `Diff`; `ShotsView` only reads the log and the images.

## Where the files go

- **Pictures:** `<page folder>/screenshots/<round id>/<width>.png` and `diff-<width>.png`. A `screenshots/` folder anywhere is gitignored. A page with no folder of its own (a child declared inside its parent's `page.js`) keeps its shots in the nearest ancestor folder that has a `page.js`: `<ancestor>/screenshots/<rest of the url>/<round id>/`.
- **The log:** one file, `public/framework/ext/Shots/runs.jsonl`, committed. Three kinds of line:
  - `{"run":{"id","url","dir","widths","parent","note","css","task","by","at","shots":{"400":{"file","height","cut"}}}}`
  - `{"diff":{"id","vs","width","changed","regions":[[x,y,w,h,amount]],"overlay","height":[before,after]}}`
  - `{"judge":{"id","vs","verdict":"better"|"worse"|"same","by","why","at"}}`
- **Round id:** `YYYY-MM-DD-HHMMSS`. `parent` is the round it was compared with, so rounds form a tree (a variant branches from the same parent).

## Widths (decided)

1. The template's own `resolutions` list wins.
2. Else, `optimalWidth` W (from [ui-library](../ui-library/requirements.md)): the standard widths below W, then W itself; nothing above W, since a capped layout shows nothing new past its cap. A mobile button (W ≤ 400) gets only 400.
3. Else the four standard widths: 400, 1200, 1920, 3440.

**Tall pages (the open question):** every width is shot full page, but cut at 4,000 px tall, and the log records `cut: true`. The first screen is just the top of that picture, so it needs no second shot. *Alternative not taken:* shoot only the first screen below the optimal width (cheaper, but it misses a broken footer or a long list at 400).

## The diff

- Both pictures are cut to the shorter height; a height change is reported on its own line (`height: [before, after]`).
- 16 px cells; a cell changed when its mean colour moved more than a small threshold. Neighbouring changed cells merge into regions, largest first, as `[x, y, w, h, amount]`.
- The overlay is the AFTER picture faded to 35 %, with changed cells tinted red by how much they changed, and each region boxed. An agent reads the overlay and the regions list instead of guessing the difference between two similar pictures.
- **Next (recorded, not built):** run the line filter on both pictures and report edges that moved ("this edge moved 24 px down"), which is the padding question the owner cares about.

## The loop, and who does what

shoot → read → judge → fix → re-shoot → compare.

- **node** (`Shots`): shoots, diffs, logs. Everything procedural.
- **The mastermind** (or the agent doing the UI work): reads the shots and the overlay, judges, and records it: `node Server/shots.mjs --judge <round> better "why"`.
- **Haiku** may be asked for fix suggestions from a round's pictures; it never judges.
- **The owner** has the last word: the Screenshots tab, one click. Only rounds that differ visibly (small padding vs large padding) are put to the owner, never a 2 px nudge.
- **Automatic:** the [step-runner](../step-runner/plan.md)'s `kind: "ui"` template adds these steps to any UI task; `merge.mjs` warns when a branch changes CSS or a page's JS and has no Shots run for that page. Changes only to `page.jsonl` content blocks (approved structured content) need no shots.
- **`--css "<rules>"`:** shoot the page with extra CSS injected, so a variant can be tried without editing a file.

## Later (recorded, not built)

- **Parallel refinement:** several agents each try a variant (a `--css` or a worktree), each a child round of the same parent; the best is picked by the judge and then the owner.
- **The design principle the shots check:** one default clamped padding token works in about 90 % of places: a container has padding or it doesn't. Compact and spacious remaps come later. Aim for 80/20: less CSS, nothing broken.

## The slice, in order

1. `PNG`, `Diff`, `Shots`, `Server/shots.mjs`, the gitignore line (Sonnet minion A, worktree).
2. `ShotsView`, the Screenshots tab, `/framework/ext/Shots/` page, readme and docs (Sonnet minion B, worktree, after A's log format is real).
3. Run it on the Figma pages with @mastermind-figma-colors-fix; measure whether the overlay helps (a Haiku reads two pictures with and without the overlay; does it find a known change?).
4. `merge.mjs` reminder; send the commands to the step-runner.
