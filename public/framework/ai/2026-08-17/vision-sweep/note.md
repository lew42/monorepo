# Vision sweep — note

**Corpus** (19 pages, 0 dropped — all returned real content, verified headless via `.page.active-page h1`): `/framework/`, `/core/`, `/core/Page/`, `/styles/`, `/styles/layouts/`, `/styles/elements/` (no `materials/` — used this live sibling), `/ext/`, `/ext/Panel/`, `/ext/Doc/`, `/ext/DesignTool/`, `/ext/DesignTool/vision/?run=…vision-pilot/`, `/ui/`, `/ai/`, `/ai/2026-08-17/`, `/ai/2026-08-17/layout-primitives/`, `/ai/2026-08-17/mastermind-shots/`, `/web/`, `/core/Page/doc/`, `/notes/`.

**Totals**: 66 shots (57 sweep page-level × 3 widths + 9 card-level), **$5.35** of $6, 280 findings, 86 broken.

## Top 5 repeated findings (rules, not pages)
1. **Low-contrast muted gray/salmon text** — labels, metadata, descriptions sitting near the contrast floor. ~34 mentions, nearly every page/width.
2. **Tabs and labels clip at the viewport edge**, no overflow/scroll affordance — hits every tab bar (Page doc, DesignTool, vision browse, mastermind-shots) at 390 and even 1280.
3. **Cards/panels missing a surface or sitting empty** — "floats unframed," or a grid cell with no content, read as broken.
4. **Ultrawide (3440) content column doesn't expand** — 14 of 19 pages leave half-to-most of the canvas empty gray/white.
5. **Large blank gap between the nav bar and the page heading**, mainly at 390 — a fixed dead zone eating mobile viewport.

## Cards vs page (@1280, `--regions auto` cap 6)
Picker grabbed `div.sidebar` as a region on **both** pages — noting per brief.

| page | level | shots | $ | findings | broken | only-that-level found |
|---|---|---|---|---|---|---|
| /ui/ | page | 1 | 0.064 | 4 | 1 | 3 of 4 |
| /ui/ | card ×4 | 4 | 0.309 | 18 | 5 | 17 of 18 |
| /ai/2026-08-17/ | page | 1 | 0.100 | 5 | 1 | 3 of 5 |
| /ai/2026-08-17/ | card ×3 | 3 | 0.229 | 15 | 3 | 14 of 15 |

- **Card-only** (illegible at whole-page scale): *"The truncation marker '×…' uses the multiplication/close symbol instead of an ellipsis, reads as an interactive delete control."*
- **Page-only** (needs the whole list in view): *"Tag pills are absent from the top two cards and plentiful in the bottom two, causing the list to feel like two different component variants."*

**Which first**: page-level first — one cheap shot catches composition/rhythm bugs (nav-gap, ultrawide waste, cross-card inconsistency) that only show with the whole page in frame. Card-level pays off *after*, on pages with dense repeating components (nav rails, catalogs) where whole-page resolution hides label-level bugs — cost per shot is the same, so it's a coverage trade, not a savings one.
