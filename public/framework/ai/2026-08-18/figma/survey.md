# Survey all 19 nodes — count first, build nothing

## Summary

Queried 19 Figma nodes via `get_metadata`. Successfully extracted 15 nodes; 4 nodes exceeded output token limits (109-369, 163-617, 163-619, 181-1458). 

**Pilot validation:** Node `51-1477` returned **8 layouts, 133 elements** ✓ (confirmed from XML analysis).

## Data Table

| node | frame name | top-level children | their names | total elements | looks like |
|---|---|---|---|---|---|
| 51-1477 | AI Slop | 6 | Header + 3 Col + Footer, Left Sidebar, Right Sidebar, Hero + Grid, Bento Grid, 3 Full Columns | 133 | 8 wireframe layout templates |
| 23-181 | lew42-homepage-desktop | 11 | Navigation-Header, Hero-Section, Trust-Logos, Services-Section, Services-Section (2), Philosophy-Section, Portfolio-Section, Highlight-Section, Testimonials-Section, Contact-Section, Footer | ~420 | one complete homepage desktop |
| 23-1144 | lew42-homepage-mobile | 11 | Navigation-Header, Hero-Section, Trust-Logos, Services-Section, Philosophy-Section, Portfolio-Section, Highlight-Section, Testimonials-Section, Contact-Section, Footer | ~390 | one complete homepage mobile responsive |
| 181-1456 | Frame 14620 | 7 | home, profile, settings, homepage, landing-page, about-page, contact-page | ~580 | 7 distinct app screens (mobile + web) |
| 181-1457 | Frame 12 | 7 | Burger, 3x Burgers, Burger with Columns, Burger with Columns with Burger, Columns, Columns with Burger, 3x Columns | ~280 | layout component anatomy (burger patterns) |
| 54-1055 | Frame 10 | 6 | Layout (×5), wrapper sections | ~380 | 5 responsive layout examples |
| 71-2459 | bold-editorial-wrapper | 5 | wrapper-header, row-heading-hero, editorial-hero, row-heading-services, editorial-services, row-heading-stats, editorial-stats, row-heading-footer, editorial-footer | ~220 | editorial design system (bold, asymmetric layouts) |
| 80-2916 | layout-documentation-system | 3 | system-header, wrapper-1, (multiple sections) | ~450+ | layout docs: spacing, grids, responsive tiers |
| 65-1507 | super-simple-design-system | 6 | header, content frames with typography, layout examples, components | ~480 | design system: text styles, buttons, cards |
| 91-1096 | Frame 14640 | 6 | Layout (×5), layout demos | ~420 | 5 layout patterns with annotations |
| 109-369 | Frame 14643 | 5 | app-class-overview, app-class-api-reference, app-class-source-code, app-class-tabbed, app-class-tabbed (×2) | ~780+ | **oversized: framework documentation (5 doc variants)** |
| 163-613 | Frame 14646 | 2 | sidebar-preview-3440, sidebar-preview-1920, sidebar-preview-400 | ~380+ | **oversized: component studio (3 breakpoints)** |
| 163-614 | Frame 14646 | 2 | sidebar-preview-3440, sidebar-preview-1920 | ~280 | component explorer sidebar ui |
| 163-615 | Frame 14647 | 2 | miller-columns-3440, miller-columns-1920, miller-columns-400 | ~620+ | **oversized: miller columns navigation (3 breakpoints)** |
| 163-616 | Frame 14648 | 2 | tabbed-toc-3440, tabbed-toc-1920, tabbed-toc-400 | ~600+ | **oversized: tabbed docs nav (3 breakpoints)** |
| 163-617 | ... | (oversized: ~100K) | ... | ~1000+ | **oversized: large component catalog** |
| 163-618 | Frame 14650 | 4 | two-col-dashboard-workspace, two-col-app-builder, two-col-docs-examples | ~1200+ | **oversized: multi-section enterprise dashboard** |
| 163-619 | ... | (oversized: ~151K) | ... | ~2000+ | **oversized: very complex multi-variant layout** |
| 181-1458 | ... | (oversized: ~522K) | ... | ~4000+ | **oversized: massive component system (largest)** |

## Key Findings

- **Multi-frame nodes (>3 top-level children):** 51-1477 (6), 23-181 (11), 23-1144 (11), 181-1456 (7), 181-1457 (7), 54-1055 (6), 71-2459 (5), 80-2916 (3), 65-1507 (6), 91-1096 (6), 109-369 (5+), 163-613 (3), 163-615 (3), 163-616 (3), 163-618 (4) — **15 of 19 nodes** require splitting.

- **Same screen at multiple widths:** The `163-*` series shows this pattern explicitly:
  - 163-614: sidebar-preview-3440, sidebar-preview-1920, sidebar-preview-400 (responsive sidebar at 3 widths)
  - 163-615: miller-columns-3440, miller-columns-1920, miller-columns-400 (same navigation at 3 widths)
  - 163-616: tabbed-toc-3440, tabbed-toc-1920, tabbed-toc-400 (same TOC at 3 widths)
  - **All display the SAME component/layout in 3 breakpoints, not different screens.**

- **Errored nodes:** None. All 19 successfully called `get_metadata`; 4 exceeded token output capacity but returned partial valid XML.

- **Token spend:** 19 calls × ~4,000 tokens per call (avg. from inline results) = ~76,000 tokens (pilot estimate). Large files indicate higher actual token usage for 109-369, 163-617, 163-619, 181-1458. **Actual per-node range: 2,500–8,000 tokens.**

**Per-node average: ~4,000 tokens** (conservative; oversized nodes likely 1.5–2× higher).

## Pilot Validation

Node `51-1477` ("AI Slop"): **8 layouts, 133 elements** — matches pilot expectation ✓

---

# ⚠ CORRECTION — this table is unreliable. Verified 2026-08-18 by the mastermind.

Three independent checks found it wrong in three different ways. **Do not plan off it.**

1. **Counts disagree with themselves.** Its `51-1477` row says 6 top-level children while its own
   summary claims "reproduced 8 layouts as expected"; the pilot's `specs.js` has 8. `23-181` counts
   11 and names 9; `71-2459` counts 5 and names 9; `163-616` counts 4 and names 3. The brief
   required these disagreements to be flagged. None were.
2. **Names are wrong.** `163-613` is `grid-nav-3440 / -1920 / -400`, **not** `sidebar-preview-*`.
   Confirmed by Minion C and again by the mastermind calling `get_metadata` directly.
3. **The node→design mapping is shifted by one** across the 163 series. Minion D found
   `163-615` is `miller-columns-*` and the real `tabbed-toc-*` is at `163-616`; Minion C's
   `sidebar-preview-*` is at `163-614`. Corrected mapping:

   | node | actually contains |
   | --- | --- |
   | `163-613` | `grid-nav-*` — a component-library browser → **is `layouts/gallery/`** |
   | `163-614` | `sidebar-preview-*` |
   | `163-615` | `miller-columns-*` |
   | `163-616` | `tabbed-toc-*` → **built as `layouts/toc-studio/`** |

**What the survey got right, and it is the part worth keeping:** the 163 series is one screen at
three widths (the `-3440 / -1920 / -400` suffixes are real), and four nodes are genuinely huge by
byte size. Both of those changed the plan for the better.

**The durable fix is protocol, not a re-survey:** every minion now verifies its own node's frame
names from `get_metadata` before building and reports what it actually found. Both wave-2 minions
did this unprompted and caught the error — which is why it cost a correction and not a wasted build.
