# Card Consolidation — Merge 1: ui-cards Before & After

Verification of Merge 1 (`ui-cards`) from [`public/framework/ux/Content/plan/plan.json`](file:///c:/Code/lew42/monorepo/public/framework/ux/Content/plan/plan.json).
Templates migrated from `.surface.pad` to `.card`:
- `public/framework/ui/alert/page.js`
- `public/framework/ui/stats/page.js`
- `public/framework/ui/toolbar/page.js`
- `public/framework/ux/Course/Course.js`

Measured live visual changes conform to plan specifications:
- **Stat tile**: First word offset adjusts to `--pad-card` rhythm (~17px → 19px left edge), height cleanly expands with self-contained rhythm without touching exterior layout.
- **Alert**: Left edge maintained at 19px, status border preserved via `.ui-alert` / `.card-edge`, height remains 63px.
- **Toolbar**: First word offset shifts slightly with `--pad-card` (31px → 33px), height remains 72px, wrap/scroll layouts unchanged.
- **Course**: Rail and side next-up cards adopt consistent `.card` padding and borders without altering core reading column width.

Zero console errors recorded across all tested pages.

---

## 1. Alerts (`/framework/ui/alert/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Alert Before 1920](before/framework-ui-alert-1920.png) | ![Alert After 1920](after/framework-ui-alert-1920.png) |

- **Measured Change:** Alert box padding updated to `--pad-card`. Left status border matches active tokens. No other change on page.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Alert Before 390](before/framework-ui-alert-390.png) | ![Alert After 390](after/framework-ui-alert-390.png) |

- **Measured Change:** Consistent padding on mobile; no overflow. No other change.

---

## 2. Stat Tiles (`/framework/ui/stats/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Stats Before 1920](before/framework-ui-stats-1920.png) | ![Stats After 1920](after/framework-ui-stats-1920.png) |

- **Measured Change:** Stat tiles adopt `.card` semantics and `--pad-card`. Grid column rhythm preserved. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Stats Before 390](before/framework-ui-stats-390.png) | ![Stats After 390](after/framework-ui-stats-390.png) |

- **Measured Change:** Mobile auto-grid reflows seamlessly. No other change.

---

## 3. Toolbar (`/framework/ui/toolbar/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Toolbar Before 1920](before/framework-ui-toolbar-1920.png) | ![Toolbar After 1920](after/framework-ui-toolbar-1920.png) |

- **Measured Change:** Toolbar framing wears `.card`. Flex alignment and button gap hierarchy intact. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Toolbar Before 390](before/framework-ui-toolbar-390.png) | ![Toolbar After 390](after/framework-ui-toolbar-390.png) |

- **Measured Change:** Wrapping and scrolling rows function identically on narrow viewport. No other change.

---

## 4. Course Viewer (`/framework/ux/Course/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Course Before 1920](before/framework-ux-Course-1920.png) | ![Course After 1920](after/framework-ux-Course-1920.png) |

- **Measured Change:** Left navigation rail and right next-up side panel wear `.card`. Central reading column retains `.measure` bounds. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Course Before 390](before/framework-ux-Course-390.png) | ![Course After 390](after/framework-ux-Course-390.png) |

- **Measured Change:** Rail and next-up stack cleanly; no horizontal spill. No other change.


---

# Card Consolidation — Merge 2: ui-pills Before & After

Verification of Merge 2 (`ui-pills`) from [`public/framework/ux/Content/plan/plan.json`](file:///c:/Code/lew42\monorepo\public\framework\ux\Content\plan\plan.json).
Chips & badges consolidated under `.ui-pill` (`padding: 0.15em 0.7em`):
- `public/framework/ui/badge/badge.js` (retired dead `.ui-badge.count` padding override)
- `public/framework/ui/badge/page.js` (updated variant list from 5 to 4: accent, dark, outline, dot)
- `public/framework/ux/Filter/FilterChips.js` (consolidated `ui-badge ui-pill` into `ui-pill`)

Measured live visual changes conform to plan specifications:
- **Badge / pill**: First word offset preserved (10px left, 2px top), height remains 22px, uniform padding across all pill forms.
- **Tag chip & Filter chip**: First word offset shifts by 1px (10px → 11px left edge) adhering to standard 0.7em pill padding, height remains 24px.
- Zero console errors recorded across all 6 tested pages.

---

## 5. API Documentation Layout (`/framework/styles/layouts/apidoc/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Apidoc Before 1920](before/framework-styles-layouts-apidoc-1920.png) | ![Apidoc After 1920](after/framework-styles-layouts-apidoc-1920.png) |

- **Measured Change:** Version pill (`v1.2.0`) retains crisp theme styling. No other change on page.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Apidoc Before 390](before/framework-styles-layouts-apidoc-390.png) | ![Apidoc After 390](after/framework-styles-layouts-apidoc-390.png) |

- **Measured Change:** Mobile header wraps cleanly. No other change.

---

## 6. UI Overview (`/framework/ui/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![UI Before 1920](before/framework-ui-1920.png) | ![UI After 1920](after/framework-ui-1920.png) |

- **Measured Change:** Component card badges and pills display consistent token rhythm. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![UI Before 390](before/framework-ui-390.png) | ![UI After 390](after/framework-ui-390.png) |

- **Measured Change:** Responsive grid and preview tiles intact. No other change.

---

## 7. Badges (`/framework/ui/badge/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Badge Before 1920](before/framework-ui-badge-1920.png) | ![Badge After 1920](after/framework-ui-badge-1920.png) |

- **Measured Change:** Dead `.count` padding rule removed; count badge uses pill's standard 0.7em padding. Four variant classes documented. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Badge Before 390](before/framework-ui-badge-390.png) | ![Badge After 390](after/framework-ui-badge-390.png) |

- **Measured Change:** Mobile row wrap behaves identically. No other change.

---

## 8. Tags Template (`/framework/ui/tags/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Tags Before 1920](before/framework-ui-tags-1920.png) | ![Tags After 1920](after/framework-ui-tags-1920.png) |

- **Measured Change:** Tag chip row and input opt-out unaffected; visual rhythm preserved. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Tags Before 390](before/framework-ui-tags-390.png) | ![Tags After 390](after/framework-ui-tags-390.png) |

- **Measured Change:** Mobile input wrap intact. No other change.

---

## 9. Filter Chips (`/framework/ux/Filter/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Filter Before 1920](before/framework-ux-Filter-1920.png) | ![Filter After 1920](after/framework-ux-Filter-1920.png) |

- **Measured Change:** Filter chips use `.ui-pill` directly without redundant `.ui-badge`. Dismiss × listener fully active. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Filter Before 390](before/framework-ux-Filter-390.png) | ![Filter After 390](after/framework-ux-Filter-390.png) |

- **Measured Change:** Mobile chip flow aligns properly. No other change.

---

## 10. Tags Component (`/framework/ux/Tags/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![UX Tags Before 1920](before/framework-ux-Tags-1920.png) | ![UX Tags After 1920](after/framework-ux-Tags-1920.png) |

- **Measured Change:** `Tags.Chip` aligns seamlessly with `ui/parts.js` `.ui-pill`. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![UX Tags Before 390](before/framework-ux-Tags-390.png) | ![UX Tags After 390](after/framework-ux-Tags-390.png) |

- **Measured Change:** Mobile tag input flows identically. No other change.


---

# Card Consolidation — Merge 3: link-tiles Before & After

Verification of Merge 3 (`link-tiles`) from [`public/framework/ux/Content/plan/plan.json`](file:///c:/Code/lew42\monorepo\public\framework\ux\Content\plan\plan.json).
Link tiles migrated from hard-coded lab padding/borders to `a.card`:
- `public/imagine/decks/deck.js`, `public/imagine/decks/decks.css` (retired dead padding and border on `.decks-card`)
- `public/imagine/blogx/Blog.js`, `public/imagine/blogx/blogx.css`, `public/imagine/blogx/finder/page.js` (retired dead padding, background, and box-shadow on `.blogx-card`)
- `public/layouts/labs/decks/deck.js`, `public/layouts/labs/decks/decks.css` (verbatim copy updated)
- `public/layouts/labs/blogx/Blog.js`, `public/layouts/labs/blogx/blogx.css`, `public/layouts/labs/blogx/finder/page.js` (verbatim copy updated)

Measured live visual changes conform to plan specifications:
- **Decks card**: First word offset expands to `--pad-card` (15px → 19px from left edge, 18px → 21px from top), height cleanly aligns from 101px to 116px.
- **Blog card**: First word offset expands to `--pad-card` (18px → 19px from left edge, 20px → 21px from top), height cleanly aligns from 109px to 116px; simulated box-shadow replaced by authentic `.card` hairline border and radius.
- Zero console errors recorded across all 6 tested pages.

---

## 11. Imagine Blogx Front (`/imagine/blogx/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Imagine Blogx Before 1920](before/imagine-blogx-1920.png) | ![Imagine Blogx After 1920](after/imagine-blogx-1920.png) |

- **Measured Change:** Blog tiles adopt uniform `.card` styling and `--pad-card` rhythm. Grid column auto-fill intact. No other change on page.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Imagine Blogx Before 390](before/imagine-blogx-390.png) | ![Imagine Blogx After 390](after/imagine-blogx-390.png) |

- **Measured Change:** Mobile article wall flows cleanly. No other change.

---

## 12. Imagine Blogx Finder (`/imagine/blogx/finder/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Imagine Blogx Finder Before 1920](before/imagine-blogx-finder-1920.png) | ![Imagine Blogx Finder After 1920](after/imagine-blogx-finder-1920.png) |

- **Measured Change:** Finder latest-posts wall wears `a.card`. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Imagine Blogx Finder Before 390](before/imagine-blogx-finder-390.png) | ![Imagine Blogx Finder After 390](after/imagine-blogx-finder-390.png) |

- **Measured Change:** Mobile finder navigation behaves identically. No other change.

---

## 13. Imagine Decks (`/imagine/decks/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Imagine Decks Before 1920](before/imagine-decks-1920.png) | ![Imagine Decks After 1920](after/imagine-decks-1920.png) |

- **Measured Change:** Deck presentation wall cards adopt `.card` padding and borders. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Imagine Decks Before 390](before/imagine-decks-390.png) | ![Imagine Decks After 390](after/imagine-decks-390.png) |

- **Measured Change:** Mobile cut stacks into scrolling bands properly. No other change.

---

## 14. Layouts Labs Blogx (`/layouts/labs/blogx/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Layouts Labs Blogx Before 1920](before/layouts-labs-blogx-1920.png) | ![Layouts Labs Blogx After 1920](after/layouts-labs-blogx-1920.png) |

- **Measured Change:** Lab copy matches imagine/blogx exactly. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Layouts Labs Blogx Before 390](before/layouts-labs-blogx-390.png) | ![Layouts Labs Blogx After 390](after/layouts-labs-blogx-390.png) |

- **Measured Change:** Mobile responsiveness identical. No other change.

---

## 15. Layouts Labs Blogx Finder (`/layouts/labs/blogx/finder/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Layouts Labs Blogx Finder Before 1920](before/layouts-labs-blogx-finder-1920.png) | ![Layouts Labs Blogx Finder After 1920](after/layouts-labs-blogx-finder-1920.png) |

- **Measured Change:** Lab finder wall matches imagine/blogx/finder. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Layouts Labs Blogx Finder Before 390](before/layouts-labs-blogx-finder-390.png) | ![Layouts Labs Blogx Finder After 390](after/layouts-labs-blogx-finder-390.png) |

- **Measured Change:** Mobile layout preserved. No other change.

---

## 16. Layouts Labs Decks (`/layouts/labs/decks/`)

### 1920px Viewport
| Before | After |
| :---: | :---: |
| ![Layouts Labs Decks Before 1920](before/layouts-labs-decks-1920.png) | ![Layouts Labs Decks After 1920](after/layouts-labs-decks-1920.png) |

- **Measured Change:** Lab decks wall cards match imagine/decks. No other change.

### 390px Viewport
| Before | After |
| :---: | :---: |
| ![Layouts Labs Decks Before 390](before/layouts-labs-decks-390.png) | ![Layouts Labs Decks After 390](after/layouts-labs-decks-390.png) |

- **Measured Change:** Mobile bands stack seamlessly. No other change.
