# Main Pages Layout Audit & Contact Sheets

Audit performed across top priority and high-traffic routes at four standard viewport widths (`400px`, `1200px`, `1920px`, `3440px`) using `Server/layout-check.mjs --bands --sheet`.

## Audited Main Pages

| URL | Layout | 400px (empty / widest) | 1200px (empty / widest) | 1920px (empty / widest) | 3440px (empty / widest) | Tabs Gap (3440) | Errors | Contact Sheet |
|---|---|---|---|---|---|---|---|---|
| `/framework/` | wall | 52% / 350px | 69% / 533px | 76% / 572px | 73% / 704px | N/A | 0 | [sheet.png](./localhost-80-framework/sheet.png) |
| `/framework/ai2/` | ai2 | 35% / 371px | 43% / 463px | 55% / 497px | 67% / 559px | 47px | 0 | [sheet.png](./localhost-80-framework-ai2/sheet.png) |
| `/framework/core/Page/` | doc | 53% / 819px | 65% / 873px | 78% / 936px | 82% / 1053px | 83px | 0 | [sheet.png](./localhost-80-framework-core-Page/sheet.png) |
| `/framework/ux/Tree/` | doc | 46% / 495px | 61% / 595px | 65% / 638px | 83% / 698px | 173px | 0 | [sheet.png](./localhost-80-framework-ux-Tree/sheet.png) |
| `/framework/ux/Dictate/` | doc | 34% / 344px | 54% / 567px | 70% / 609px | 81% / 685px | 83px | 0 | [sheet.png](./localhost-80-framework-ux-Dictate/sheet.png) |
| `/web/` | wall | 36% / 340px | 78% / 581px | 84% / 624px | 89% / 702px | N/A | 0 | [sheet.png](./localhost-80-web/sheet.png) |
| `/imagine/` | columns | 39% / 348px | 64% / 469px | 72% / 503px | 82% / 566px | N/A | 0 | [sheet.png](./localhost-80-imagine/sheet.png) |
| `/layouts/` | wall | 53% / 343px | 74% / 1091px | 82% / 1745px | 87% / 2389px | N/A | 0 | [sheet.png](./localhost-80-layouts/sheet.png) |

## Findings & Observations

1. **Zero Runtime / Syntax / Page Errors:** All 8 main routes cleanly rendered and passed layout checks with 0 console or page errors across all 4 widths.
2. **Defensive Fix Landed in `Page.class.js`:**
   - Addressed item data clobbering where children declared with `{ name: "...", data: true }` (such as in `/imagine/paging/`) passed boolean flags to `Item.assign(...)`, clobbering `this.data` and breaking `Page.naming()`.
   - `Page.class.js` constructor now protects `this.data` as an `Object.create(null)` dictionary.
3. **Doc Pages on Ultrawide (3440px):**
   - Doc-derived pages (`/framework/core/Page/`, `/framework/ux/Tree/`, `/framework/ux/Dictate/`) show high empty percentages (~81-83%) and large tab gaps (`83px` to `173px`).
   - The tabs well is pushed right because `.doc-well` padding and `--gutter-x` expand with `clamp(2em, 4%, 5em)`.
   - On ultrawide displays, the reading measure (`40em`) correctly anchors prose, leaving intentional gutters.
