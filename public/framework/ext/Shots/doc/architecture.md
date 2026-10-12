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
