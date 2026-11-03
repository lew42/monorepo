# doodles — the notebook doodles become SVGs: icons, decorations, a texture, one animated (Opus)

Three laws: less is more (ASAP) — a stroke, not a trace; clear beats brief; prioritize — the ones that recur first. Length budget: the library page is one screen of pictures; the report is 8 lines.

Read first: the repo's `CLAUDE.md` (Presentation); `../../2026-09-04/mastermind-platform/minion-rules.md`; the owner's sentence: *"try to convert doodles to SVGs and use them as decorations, icons, bg, texture, animated?"*; `public/notes/page.js` (the realm; another minion is writing the note pages there right now — you do not touch them). Skills: `new-task` (this dir, group `notes`), `code`, `css`, `new-css-class`, `new-page`, `finish-task`.

## The job

`public/notes/inbox/` holds nine photographed notebook spreads. Read each with the Read tool and **catalogue the doodles** — the drawn marks that are not words: the four-point stars, the nested diamonds and squares, the zigzag / lightning strokes, the little camera, the fan-out arrows, the flow boxes with arrows, the storyboard frames, the anchor-quadrant arrows, whatever else recurs. Log the catalogue as one table: name · which image · how many times it appears.

For each doodle that appears at least twice, and for any single one that is clearly a drawing (the camera):

1. **A reference crop** — the doodle cut out of the photo at its native pixels, upright, saved as `ref/<name>.png` in the library dir. Crop with a headless Chromium canvas through Playwright, no new dependency.
2. **An SVG, authored by hand in the doodle's own hand** — stroke-based (`stroke: currentColor`, `fill: none`, `stroke-linecap: round`, `stroke-linejoin: round`, a slightly uneven path so it still looks drawn), `viewBox="0 0 24 24"` for the ones that work as icons, a larger box for the decorations. Small: a doodle is under 1 KB. Not a raster trace.
3. **Four uses, shown**: as an **icon** at 1em beside text; as a **decoration** at 4–8em in a corner of a card, in the muted colour; as a **tiled background texture** (a `<pattern>` of the small stars, at 6–10% opacity, on one band); and **one animated** — the drawn-on stroke (`stroke-dasharray` / `stroke-dashoffset` transitioned over ~1.2 s on hover or on enter), reduced-motion respected.

**The library** — `public/notes/doodles/doodles.js` exporting one factory per doodle (a function returning the `svg` view, taking an optional size) and a `texture(name)` helper for the pattern; `doodles.css` (in `@layer site`; classes prefixed `doodle-`, register the prefix in `styles/css-scopes.txt`); `page.js` — one screen: the wall of doodles, each beside its reference crop, then the four uses on one card; `readme.md` (what · Use · Watch out · More, as short as it can be). **Do not register it in `public/notes/page.js`** — the notes minion adds the name when it next edits that file.

## Prove it

The library page at 400 / 1280 / 1920 / 3440 on the shared server `http://localhost:8123/` (start none, kill none): zero console errors; every SVG renders in dark and light (`currentColor`); screenshots at 1280 and 3440 in your task dir; the animated one captured mid-draw. Two numbers that must agree: rows in the catalogue with count ≥ 2 = SVGs in `doodles.js` (plus the named singles). Sizes: no SVG over 1 KB; the largest named.

## Fences and budget

Write `public/notes/doodles/**`, `styles/css-scopes.txt` (one line), this task dir. Never any other file under `public/notes/`. Never `find /`; never spawn agents; never `git stash`/commit; never port 80; never the owner's tabs. Budget ~250k tokens. Report in ≤ 8 plain lines: how many doodles, the four uses with the page link, the largest file, what you could not make look drawn.
