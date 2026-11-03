# Forensics — sections/full: A100 (21:15) vs F/D (22:00)

**Verdict: (c) measurement-method difference — a `frame()` boot-timing race, not
rules.js drift and not a real page regression. Trust the meter's F/D.**

## Timeline

| time | event |
|---|---|
| 17:10:53 | `rules.js` working-tree mtime (uncommitted, +80/-14) — **before session start** |
| 13:45:18 | `rules.js` last commit (`git log -1`), same "yea" commit as the whole dir |
| 20:31 | tonight's session start |
| ~21:15 | judge (direction.md): sections/full 400→A100 clean, 3440→A99 |
| 21:45 | P1 log: "Verified live … Playwright (global install)" for the 5 width-tier pages only |
| ~22:00 | P2 meter (widths/): sections/full → F/D all widths, `high cramped` on blockquote + div.section-band |
| 22:05 | this forensic pass dispatched |

`rules.js` was already in its current (uncommitted) state **4+ hours before
either measurement**. Both the judge and the meter ran against the identical
analyzer. The "uncommitted rules.js" theory in `widths/readme.md` doesn't hold
on timing alone.

## What the +80 lines actually do

- Two genuinely new rules (`unreachable` for unreachable overflow, `empty` for
  near-blank pages) and dedup/exclusion refinements (`distinct()` for repeated
  controls, `TABLE`/`CELL` exclusions for the padding check, `in_cell` for the
  text-ladder check, `boxed()` guard on zero-size) — all additive or narrowing.
- The rule that fires on tonight's findings — `cramped` (`rules.js:81`,
  "Text butts against its own frame") — only gained a `!TABLE.has(n.tag)`
  filter and a cells-only-at-`high` carve-out. Neither `blockquote` nor
  `div.section-band` is a `TABLE`/`CELL` tag, so this rule scans them
  byte-for-byte identically under `HEAD`'s version and the working copy.
- Conclusion: the diff cannot explain the new findings — they fire under
  `HEAD`'s committed `rules.js` too. Not analyzer drift.

## Rerun — judge's exact `frame(url, 400, { root: ".layout-full" })`

- **Fresh headless Playwright** (`chromium.launch()`, clean profile, global
  install), run 2x from two different starting pages, with and without the
  live tab's `localStorage` seeded: **F/56, 22 findings**, `high cramped` on
  `blockquote` (×3) and `div.section-band` — matches the meter exactly, every
  time.
- **The persistent, already-connected browser tab** (same kind of session the
  judge likely used): **A100**, but `metrics.nodes:1, depth:0, text:302` — a
  vacuous pass. Direct DOM check: at `frame()`'s 350ms `settle`, `.layout-full`
  **was not yet in the iframe's DOM** (only the dev-bar chrome had rendered).
  `frame()`'s own fallback — `doc.querySelector(root) ?? doc.body` — silently
  measured `doc.body` instead and reported clean. Confirmed by hand: waiting
  2.5s instead of 350ms, `.layout-full` appears with 6978 characters of real
  content. `styles/sections/` itself hasn't changed since 2026-08-12 (git log),
  so the page didn't regress — the analyzer just measured too early, once.

## Verdict

Believe the meter's **F/D**, not the judge's **A100** — the A100 is a false
clean from `frame()`'s root selector silently falling back to `doc.body` on a
slow app-boot in one particular browser session; every fresh, reproducible
Playwright run returns the same real F with the same two `cramped` findings.
