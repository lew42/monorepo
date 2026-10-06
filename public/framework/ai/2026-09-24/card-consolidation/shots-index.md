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
