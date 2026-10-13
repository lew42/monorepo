# Report: Lists · Sidebars, TOC & trees

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-lists.md](brief-lists.md).

## Pages built
- `Lists · Sidebars, TOC & trees` → page `212:1424`, root `213:1062` (1440), Placements frame `215:2418` (beside it, x=1600).
- Linked from the Overview design-system card (`DS · 2.8 …`, text `215:27141`) and from `DS · 2.2`'s header (see-also line `215:27142`).

## What is on it
- Notes box with the Verdict `215:27127`; dark Rules box `215:27134`.
- Tree item states and parts, hover actions and count, "same markup, fewer elements" (outline beside its TOC).
- 12 labelled TOC styles on light, again on dark.
- Mobile (390) `214:28806`: dropdown and menu sheet, closed and open, clickable prototype with ▶ PROTOTYPE badges.
- Placements: right TOC at 1200 and 1920, left site nav, collapsed icon rail, and 3440 with global + inner sidebar, article, right TOC (on dark: global steps down 50% black, inner 10% black).

## Verdict (also in the Notes box)
Keep: 3 Rail, 8 Minimal muted, 5 Icon section titles, 6 Collapsible groups, 12 Drill-in. One left site nav + one right Rail TOC; icon rail under 1440; inner sidebar only at 3440; mobile uses a dropdown (TOC) and a sheet (nav).

## Components added
- `List / Tree item` set `212:1497` (Level 1/2/3 × State, 12 variants; Show chevron/icon/count/actions + Label/Icon/Chevron/Count text props).
- `TOC / Mobile dropdown` `214:27201` and `TOC / Mobile sheet` `214:27305` (Open true/false, with prototype reactions).

## Values no token gives
Bare 10% black/white hairline and insets, 50% black step-down, 50% scrim; fixed widths named by role (sidebar 280/320, rail 72, TOC 260/300, article measure 720/820/960).

## Not done / still off
- The 12 text styles in use are the existing h3/h4/body; no new text style. The `code` style (Consolas) is not installed here, so kickers use h4.
- Placement mocks are fixed-width screens (1200, 1920, 3440); not checked at 400.
- Nothing waits on the owner; the For you card is unchanged.
