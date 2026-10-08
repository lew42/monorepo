verdict: pass
1. [note] The task's own `shots/<page>/400-3440.png` never scroll to the rendered demo — all four widths show only the demo's source-code pane, so `layout.json`'s bands/wraps describe the page's nav/tab chrome above the demo, not the nine-grid this task built. Evidence for requirements 1-3 came instead from the task's own `demo-400.png`/`demo-1920.png` crops, not from the review shots. Worth telling whoever runs `layout-check.mjs` next time on a demo page: capture past the fold, or crop to `.demo`.
2. [note] `demo-400.png` is cropped to a fixed 448px tall, cutting the nested paper's body off after "First line of the nested paper's own" — can't confirm from this evidence whether lines 2-3 render or overflow at 400; it may just be the crop boundary, not a real defect.
3. [note] The diff touches `Shell.js`, `dev/DevShell/DevShell.css`, `ext/drawer/drawer.css` and both their `doc/decisions.md` files — outside this task's stated fence (`core/Shell/page.js`, `Shell.css`, this folder). `doc/decisions.md` attributes the Shell.js/DevShell part to a second pass landing the root fix, and the drawer part to a sibling brief (`shell-paper/requirements.md`, not `shell-paper-demo`) bundled in the same diff — explained, not a fix.

## Requirements
- 1 "Real content with real widths" — yes — `demo-1920.png`: left is a 4-item list (Overview/Members/Billing/Settings), right is a ~224px "chat" box, header reads "Page title · Tab · Tab", footer reads "Saved · 3 items".
- 2 "The well reads as solid gray" — yes — `demo-1920.png`: all four corners and the head/foot/rail bands read as one flat gray, clearly darker than the white paper, no checkerboard showing through.
- 3 "The nested paper is visibly one size smaller" — yes — `demo-1920.png`: the inner Shell has its own narrower left ("Draft"/"Final"), its own header ("Section · Details"), and three lines of body text, sized well inside the outer paper's `main`.
- 4 "Shell page background unchanged vs main site, undo if new" — yes (claimed, not independently re-verified) — `result.md` #4 says it was checked side by side against `monorepo.localhost/framework/core/Shell/` and found identical; no comparison screenshot was saved to check independently.
- 5 "The other demos stay unchanged" — yes (claimed, not independently re-verified) — `result.md` #7 says all 8 other demos (corrected from "7" in the brief) were re-checked at 400 and 1920 with zero console/page errors; no shots of the other demos are in this task folder to check against directly.
- Proof — yes — `demo-400.png`/`demo-1920.png` saved, `result.md` answers the three questions in one line each, commit `6b0eee5e` exists on `worktree/dev-shell` (verified: "Shell: fix left/right rail clamp at the root, not per-caller").

## Page structure
- 1 — yes — shots/1920.png: "Shell" + "Five regions, all optional: header, left, right, footer, main." says what it is in one line.
- 2 — n/a — this is a Doc module page (pre-existing shape, outside this task's fence); its first content block is prose, not concept tiles, same as every other `core/` Doc page.
- 3 — n/a — single long overview page, not a status/priority page.
- 4 — n/a — no open/done split on this page.
- 5 — yes — `Shell` already appears under `Core` in the left nav (shots/1920.png), unchanged by this diff.
- 6 — yes — OVERVIEW/API/DOCS/FILES tabs are routed (pre-existing); the new demo adds no new view.
- 7 — yes — the demo uses the existing `demo()` component (ext/demo), not page-specific CSS.
- 8 — yes — "chat", "Saved · 3 items", the list items are self-evident at a glance.
- 9 — yes — nothing in the new demo repeats a neighbour or sits alone on an empty row.
- 10 — yes — the nine-grid is shown as a live structure (the actual grid), not described in prose.
- 11 — yes — "`paper: true` — a real nine-grid" names the section clearly.
- 12 — n/a — no prior working version is being replaced; `paper` is additive and the other 8 demos are unchanged.

## Navigation
- 1 Identify — tabs (OVERVIEW/API/DOCS/FILES), a rail (the left "Framework" page tree), a drawer (the ☰ top right). None are part of this diff.
- 2 — yes — `layout.json` tab_rows: 1 at 400, 1200, 1920 and 3440.
- 3 — yes — pre-existing routed tabs, untouched by this diff.
- 4 — yes — 4 tabs, not stacked.
- 5 — yes — shots/1920.png and 3440.png: the left rail sits beside the content; at 400 it is not visible (folds behind the ☰).
- 6 — n/a — not tested in this pass (no interaction shots).
- 7 — n/a — no bottom rail on this page.
- 8 — n/a — no sheet or modal in the diff.
- 9 — n/a — no full-screen view in the diff.
- 10 — n/a — nothing on this page expands in place.

## Layout
- 1 — yes — shots/3440.png: nav rail + a wide content column, not one narrow column on an empty screen.
- 2 — yes — Docs three-region (rail, content, ToC), the pre-existing page shape; the demo itself is `core/Shell`'s own nine-grid, the subject of the page.
- 3 — yes — `demo-1920.png`/`demo-400.png`: left list, chat box and paper all read as real, deliberate widths, not bare words (the rail-width bug this diff fixes).
- 4 — yes — the well/paper split is exactly a region taking padding (`gap`) because it needs to show the well around the paper.
- 5 — yes — `demo-1920.png`: list items, "chat" and the body lines all keep clear room from their box edges.
- 6 — n/a — no multi-column prose on this page.
- 7 — not measured for the demo band — `layout.json`'s bands describe the page chrome above the fold (finding 1), not the nine-grid; from `demo-1920.png` the well/paper split reads as a deliberate, non-wasteful split.
- 8 — n/a — left/right columns intentionally differ in content (nav list vs. chat box), not meant to match.
- 9 — n/a — no leftover dead space visible in `demo-1920.png`.
- 10 — yes — content (list items, chat label, body lines) is sized to its box, nothing tiny alone in a huge band.
- 11 — n/a — no card wall.
- 12 — n/a — no flush-stacked rows in the new demo.

## Sizing
- 13 — yes — `demo-1920.png`: the outer shell is `height: 26rem` by design (a demo needs a bounded stage); the inner nested shell is auto height.
- 14 — n/a — no preview thumbnails in this demo.
- 15 — yes — the outer shell's fixed 26rem height is a deliberate demo-stage bound; `main`/left/right scroll (`overflow: auto`, pre-existing Shell.css).
- 16 — yes — only the intended rail/main scrollbars, no surprise ones visible.
- 17 — n/a — no band above a nav on this page.
- 18 — yes — `layout.json` `overflow_x: false` at all four widths.
- 19 — yes — the new CSS (`clamp(12rem, var(--core-shell-left-w, 18rem), 50%)`, `gap: var(--gap-25)`) uses rem floors and a spacing-clamp rung, not constants.

## Wrapping
- 20 — yes, with one caveat — the page's own tab bar stays one line at every width (`tab_rows: 1`); `layout.json` also lists `✦AI`/`⋯More` drawer-rail buttons and the `☰`/`brightness_auto` icon buttons as multi-line at every width, but those are pre-existing site chrome (icon-font measurement artifacts), not part of this diff.
- 21 — n/a — no wrap specific to under-1920 found in the new demo content.
- 22 — n/a — no control row added by this diff.
- 23 — yes — `demo-400.png`: left, nested-paper and chat regions stack into one column at 400 rather than crushing a track.
- 24 — n/a — no preview description shown at two widths.

## Spacing and padding
- 33 — yes — `layout.json` `left_stack` totals 28px at 400 (well under 3em).
- 34 — yes — no stacked padded-in-padded boxes added by this diff; the well's `gap` replaces borders rather than nesting another pad.
- 35 — yes — the well's `gap: var(--gap-25)` and the paper's `border`/`border-radius` are opt-in on `.core-shell-paper`/`.core-shell-main`, not blanket `.pad`.
- 36 — yes — `demo-1920.png`: list items, chat label and body text all sit clear of their box edges, not flush at 0.
- 37 — yes — `gap: var(--gap-25)` is the spacing-clamp rung named in the diff; no new constant.
- 38 — n/a — no new control (chip/button) added by this diff.
- 39 — yes — the paper (`--surface`) sits on the well (`--wash`), a different ground from its sibling.
- 40 — n/a — no bled container in this diff.
- 41 — yes — all new rules in the diff sit inside `@layer theme` (Shell.css) and the existing `@layer` blocks in `drawer.css`.
- 42 — yes — the diff reuses existing tokens (`--wash`, `--surface`, `--line`, `--radius`, `--gap-25`) and a `:has()` guard rather than new classes or inline styles.

## Colour and contrast
- 1 — not measured — no contrast ratio tool run this pass; `demo-1920.png` shows dark text on white paper and on the gray well, both visibly high-contrast.
- 2 — n/a — no accent-coloured text in the new demo.
- 3 — yes — `--well: var(--wash)`, `--surface`, `--line`, `--radius` are all tokens; no literal colours in the diff.
- 4 — yes — the paper (`--surface`, white) differs clearly from the well (`--wash`, gray) which differs from the page ground.
- 5 — yes — every token used (`--wash`, `--surface`, `--line`) is a `light-dark()` pair from framework.css; no second theme written.
- 6 — yes — the paper/well seam is deliberate and matches the brief's own ask (design-2.md's nine-grid).
- 7 — n/a — no repeated anchor/eyebrow in this demo.
- 8 — yes — `paper_chat()`'s "chat" label and the nested body lines use `p.c("muted", …)`, the `.muted` class, not a raw `--muted` colour.

## Flow
- 25 — yes — the demo runs top to bottom: title → "paper: true" heading → the live nine-grid, matching the page's existing order.
- 26 — yes — `layout.json` `overflow_x: false` at every width; nothing in `demo-1920.png` runs off-screen.
- 27 — n/a — not assessed; no prose wall inside the demo.
- 28 — n/a — no label/card pairing introduced by this diff.
- 29 — n/a — not a live-updating page.
- 30 — not measured for the demo band (see finding 1); the page's own prose stays within `widest_text` (868px at 1920, well under the measure) per `layout.json`.
- 31 — n/a — this diff is not the fixed-chrome (dev-shell/frame) change; `frame` behaviour is untouched.
- 32 — n/a — the new demo is not a tab/nested page itself.

## Words
- 1 — yes — the nine-grid is shown as a live widget, not described; `result.md` also shows it before telling.
- 2 — yes — the grid itself shows the head/left/main/right/foot structure; no sentence re-explains it.
- 3 — yes — every paragraph in `page.js`'s new copy (the demo caption, the doc comment) is well under 60 words.
- 4 — yes — the demo's own caption states the point ("The middle cell is a white paper… everything around it is a gray well…") in a few seconds.
- 5 — yes — "paper: true — a real nine-grid" says exactly what the section is.
- 6 — yes — the demo's caption is one block of plain sentences, not split across multiple captions per picture.
- 7 — yes — "paper", "well" and "nine-grid" are each named once and used consistently across `page.js`, `readme.md` and `doc/decisions.md`.
- 8 — yes — `readme.md` and `doc/decisions.md` cross-link each other and the brief (`ai/2026-09-30/dev-shell/shell-paper-demo/requirements.md`, `shell-paper/requirements.md`).
- 9 — yes — the `readme.md`/`doc/decisions.md` prose sits beside the live page and demo, not alone.
- 10 — yes — the page leads with "Five regions, all optional…" before any detail.
- 11 — yes — the new copy (page.js comments, readme.md, doc/decisions.md) is written in full plain sentences, consistent with the rest of the module.
