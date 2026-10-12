# Shots — architecture and decisions

Full plan and the owner's original brief: [`plan.md`](../../../ai/sessions/2026/10/12/session-87bec773/screenshot-system/plan.md), [`build-b.md`](../../../ai/sessions/2026/10/12/session-87bec773/screenshot-system/build-b.md) (this build).

## Widths (decided)
1. The template's own `resolutions` list wins.
2. Else `optimalWidth` W (ui-library): the standard widths below W, then W itself — nothing above W, since a capped layout shows nothing new past its cap. A mobile button (W ≤ 400) gets only 400.
3. Else the four standard widths: 400, 1200, 1920, 3440.

## Tall pages
Every width is shot full page, cut at 4,000px tall; the log records `cut: true`. The first screen is just the top of that picture, so it needs no second shot. *Rejected:* shooting only the first screen below the optimal width — cheaper, but misses a broken footer or a long list at 400.

## The log — `runs.jsonl`, one file, committed (pictures are gitignored)
```
{"run":   {"id","url","dir","widths","parent","note","css","task","by","at","shots":{"400":{"file","height","cut"}}}}
{"diff":  {"id","vs","width","changed","regions":[[x,y,w,h,amount]],"overlay","height":[before,after]}}
{"judge": {"id","vs","verdict":"better"|"worse"|"same","by","why","at"}}
```
`id` is `YYYY-MM-DD-HHMMSS`; `parent` is the round it was compared with, so rounds form a tree — a variant branches from the same parent. An image's real url is `"/" + dir.replace(/^public\//, "") + "/" + file`.

## The diff
16px cells; a cell changed when its mean colour moved more than a small threshold, neighbours merged into regions, largest first. The overlay is the AFTER picture faded to 35%, changed cells tinted red, each region boxed — an agent reads the overlay and the regions list instead of guessing the difference between two similar pictures. **Next, recorded not built:** run `imagine/lines/lines.js`'s line filter on both pictures and report edges that moved ("this edge moved 24px down") — the padding question the owner actually cares about.

## Who does what
- **node** (`Shots`, build A): shoots, diffs, logs — everything procedural.
- **This view** (`ShotsView`, build B): reads the log and the images; writes nothing except the owner's own judge click.
- **The mastermind / UI agent**: reads the shots and overlay, judges from the CLI (`node Server/shots.mjs --judge <round> better "why"`).
- **The owner**: the last word, one click in the Screenshots tab — only for rounds that differ visibly, never a 2px nudge.

## Why one `ShotsView`, not two
The dev bar's Screenshots tab (`dev/DevBar/shots.js`) and the module page (`page.js`) render the exact same class for the exact same reason the whole framework avoids a second copy of anything that shows the same thing (CLAUDE.md law 6): a fix to how a round reads lands in both places at once.

## The padding principle this whole system checks for
One default clamped padding token should work in about 90% of places: a container has padding or it doesn't. Compact and spacious remaps come later. Aim for 80/20 — less CSS, nothing broken. Shots exists so that claim can be checked with a picture, not an argument.

## Build B's own notes (2026-10-12)
- Built before build A landed `Shots.mjs`/the real log — tested against three hand-written fake lines in a scratch copy (`runs.scratch.jsonl`, never committed, never the real `runs.jsonl`), per the brief.
- `ShotsJSONL` lives inside `ShotsView.js` rather than its own file: it is a small reader with no behaviour the node side needs, and the `code` skill allows a small helper class in its parent's file.
- The tree renders every round open to one level of nesting via indentation (`.shots-nested`, CSS margin, no JS breakpoint) rather than a collapsible widget — "fastest working version first" (CLAUDE.md law 1); a fold-away control is a cheap follow-up once there are real rounds to see it fail against.

## First real run (2026-10-12, `/framework/ext/Figma/colors/`, the blue override vs the site tokens)

- **Most pages scroll an inner box, not the document**, so Playwright's `fullPage` gave one screen. `Shots` now finds the tallest scrolling box, scrolls it a screen at a time and stitches the rows (`full_picture()` in `Shots.mjs`). Known marks: a fixed button inside the box repeats once per screen, and the area below a short sidebar is black.
- **A solid red fill hid what a region became**; changed cells now stay at full brightness under a light red wash, and only unchanged cells fade.
- **Does the overlay help a model?** One trial, Haiku, same question: with the two pictures alone it found 6 of the changes and missed the recoloured "prime-bound" labels; with the overlay and the diff line added it found 7, including those labels (it placed them in the wrong card). A small gain for about 2k more tokens; repeat on a padding change before trusting it.
- **Small false "moved" regions** (a 16 × 44 px block of text "moved by −3, +68") appear on colour-only changes; ignore moved regions under two cells until the threshold is tuned.
- **Next:** run the line filter (`public/imagine/lines/lines.js`) on both pictures to report edges that moved, which is the padding question.

## Figma mode (build-c, 2026-10-12)

`Shots.figma(figmaRef, url, {width})` (CLI: `--figma`) compares a Figma frame's own screenshot
against the built page at the same width — figma-browser-loop.md's missing piece. Both pictures
are cropped to content with `PNG.trim` (walks uniform background in from every edge, by the
corner pixel's own colour) and the Figma one is scaled to the page's width with `PNG.scale`
(nearest-neighbour; Diff compares in 16px cells, so a box filter would buy nothing) when the two
widths differ after cropping. `Shots.mjs` is a plain node script with no MCP access, so the Figma
png must already exist at `ext/Figma/data/<fileKey>/shots/<nodeId, ":"→"-">.png` (`track.mjs`'s
own naming) before `--figma key:nodeId` is used — an agent session fetches it first with
`mcp__figma__get_screenshot` and saves it there.

There is no earlier `run` line to be the round's `parent` (a figma round isn't compared with a
previous page round), so the chosen shape is: `parent: null`, the Figma picture copied into the
round's own folder as `figma.png`, and the `diff` line's `vs` set to the pseudo id
`figma-<key>-<node>` purely as a label. `ShotsView.detail()` special-cases `run.kind === "figma"`
to show `figma.png` as the BEFORE pane instead of looking up a parent round that was never
written — simplest shape that keeps the log readable, at the cost of a reader not being able to
click through "vs" to another real round (there isn't one).

**First real pair (2026-10-12):** `QYN0G2URSBHYH5I06MOjxU` frame `131:1062` ("How Claude draws in
Figma", a design mock of the Figma guide's own content) vs `/framework/ext/Figma/guide/` at 3440 —
`node Server/shots.mjs --figma QYN0G2URSBHYH5I06MOjxU:131:1062 /framework/ext/Figma/guide/ 3440`.
Round `2026-10-12-171622`; overlay at
`public/framework/ext/Figma/guide/screenshots/2026-10-12-171622/diff-3440.png`. The diff reports a
height change (1236→1967) and most of the page as changed, which matches what the overlay shows
by eye: the Figma frame is a flat mock-up of the three content cards (white/prime/dark bases)
with no real site chrome, while the built guide page is the live framework site — a real sidebar
nav, a taller document (more guide sections below the fold), and dark-mode colours the mock never
drew. The few genuinely small, real differences (card corner radii, a couple of heading sizes) are
swamped by that structural gap, so this first pair mostly proves the plumbing works end to end,
not yet a useful "is this still on-spec" check — that wants a frame actually built to the guide
page's own chrome, which build-c didn't have time to pick and track.
