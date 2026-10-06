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
