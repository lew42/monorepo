# Page layout inventory — what actually decides a page's box

Measured 2026-08-19, read-only. Paths are the post-move ones (`core/Page/old/…`); the stamp is `page--<name>`.

## 1 — Every container that holds pages

`container()` ([Page.class.js:162-170](/framework/core/Page/Page.class.js)) picks one of three: a `regions` entry my parent set for me → the nearest ancestor's `$pages` → `app.$pages`.

| region | selector | rule | written by | inset · measure · height |
|---|---|---|---|---|
| the app | `.pages` | Page.css:17-22 | App.js:44 · `/framework/page.js`:32 · old/nav/page.js:36 | no padding · `--measure: 40em` · `flex:1 1 auto; min-height:0; overflow-y: scroll` |
| …its empty state | `.pages > .default` | Page.css:42-45 | — | `padding: 3em clamp(0px,6%,5em)` · `max-width: var(--measure)` · `min-height:100%` |
| a tab panel | `.tab-panel` | tabs.css:68 | tabs.js:25 + 28-29 — **every** tab name maps to the SAME `$panel` | `padding-top: 3em` · `--measure: none; --page-pad: 0` · no height |
| …vertical rail form | `.tabs.vertical > .tab-panel` | tabs.css:153 | same | `flex:1 1 0; padding-top:0` |
| a catalog | `.page-catalog-pages` | catalog.css:94, 119-123 | catalog.js:52 | `flex:1 1 0; min-width:0` · nothing · `min-height:0; overflow-y:auto` **only** when the routed page sits under a `.pages > .page` ancestor |
| a demo app | `.demo-app-pages` | app.css:55-59 (+ :70) | ext/demo/app.js:42, 48 (sets `app` AND `$pages` on the root) | `--page-pad: 1.2em` · `--measure: none` · `overflow: auto` |
| Miller columns | `.page-column-pages` | old/overview/columns/columns.css:48 | old/overview/columns/page.js:85 | `display: contents` — **no box at all**; children become peers of the row |
| ad-hoc | `.flex-1` | none | old/overview/catalog/page.js:23 · old/overview/labels/page.js:46 | nothing; inherits whatever is above |
| a Panel workspace | `.panel-playground-main` | playground.css | ext/Panel/playground/page.js:69-72 | **holds no pages.** `Workspace` holds `Panel`s; `container()` never looks here |

Two consequences: the tab panel is one box for N tabs (a tab is never a second region), and a page mounted in a `display: contents` region has no region box to inherit from.

## 2 — Every way a page sets its own box

**The default is the grid, unconditionally.** `Page.class.js:216` ends `render()` with `.ac(this.classes ?? "standard")`, and `.standard` has **no CSS rule anywhere** (Page.css:239 says so). The grid comes from a bare `.page {}` (Page.css:78-97) with **no guard selector** — so *every* page is a three-track grid, class or no class. `classes:` replaces the word `standard`, it does not opt out of anything.

| word | rule | what it does | in-scope call sites |
|---|---|---|---|
| `standard` | — none — | nothing. The grid is already on `.page` | 2 (`styles/sections/page.js:26`, `styles/layouts/word.js:25`) — both redundant |
| `full` | Page.css:240 | `--gutter-x: 0; --pad-y: 0` — still the grid, tracks collapsed | 1 `classes:` (`styles/layouts/space/compose/page.js:41`) + ~35 hand-typed `div.c("page full fill flex v")` in `styles/layouts/**` |
| `fill` | Page.css:241 | `align-self:stretch; overflow:auto; min-height:100%` | as above; never alone |
| `solo` | Page.css:112 | identical to `fill` + a 10-line comment | **0. Dead class** — the only occurrence site-wide is its own rule |
| `wide` / `bleed` | Page.css:100-101 | child-level track claims, not page shells | many, correct |
| `layout-full` | layouts.css:18-28 | `position: fixed; inset: 0; z-index: 20` + `--measure:none; --page-pad:1.5em` | `styles/layouts/full.js:24`, `ext/Panel/playground/page.js:62` |
| `doc-page` / `doc-section` | Doc.css:11-16, 65 | `--page-pad: 0`, own `--gutter-x`, `--pad-y` | ext/Doc/Doc.js ×3 |
| `dt-page` | DesignTool.css:77 | `--measure:none; --page-pad: 2.5em …` — full width **with** a gutter | 4 |

**The two counts.** `grep -rn "render()" --include=page.js` → **25 files** in scope; `grep -rn "this.view ??=" --include=page.js` → **8**. The gap is entirely prose: 17 of the 25 mention `render()` only inside `md()`/`code.js()` strings on doc pages (core/App, core/Page/old/*, core/View, ext/demo, ext/tabs, ext/toc, dev/DevBar, styles/layouts/*). Real overrides, all 8:

| file:line | what it does |
|---|---|
| `page.js:19` | `/framework/` root — builds the site sidebar + its own `$pages`; page is `page page-framework topic flex fill` |
| `styles/layouts/page.js:37` | drops the `h1` + `.flow` wrapper so `browse()` claims `wide` itself |
| `ui/page.js:46` | calls `Doc.prototype.render`, then **re-points every child's region** at the Overview panel |
| `ext/Panel/Workspace/page.js:54` · `ext/Panel/demo/page.js:107` | `page doc-section` + `.tabs.vertical` — a Doc inside a Doc, no second title band |
| `ext/Panel/playground/page.js:83, 98` | `page layout-full` — the whole-window workspace |
| `styles/layouts/{apidoc:253, spec:379, toc-studio:24}` | inline `— full` child pages returning `layout()`; **not a `.page` at all** |

## 3 — The four tokens

| token | declared on a REGION | declared on a PAGE | read by | verdict |
|---|---|---|---|---|
| `--measure` | `.pages` 40em (Page.css:21) · `.tab-panel` none (tabs.css:68) · `.demo-app-pages` none (app.css:58) | `.page` 40em (Page.css:79) · `.dt-page` none · `.layout-full` none · `.doc-page` (Doc.css:11) | the main track (Page.css:90) · `.pages > .default` (:44) · demo.css:81 · Research.css ×7 · framework.css:430 `.measure` | **all three region declarations are dead for pages** |
| `--page-pad` | tabs.css:68 `0` · app.css:58 `1.2em` · Doc.css:15 `0` · layouts.css:19 · DesignTool.css:77 · playground.css:9 | never — `.page` only READS it | Page.css:95, and nothing else | **live — the only region→page channel that works** |
| `--gutter-x` | never | `.page` clamp (Page.css:80) · `.page.full` 0 (:240) · Doc.css:16 · app.css:70 | the two gutter tracks (Page.css:89, 92) · Page.css:279 · catalog.css:179 · exhibit.css:18-19, 71 · stage.css:25 | live |
| `--pad-y` | `.doc-section` 1.5em (Doc.css:65) | `.page` clamp (:85) · `.page.full` 0 (:240) · app.css:70 | Page.css:95, **only as the `var(--page-pad, …)` fallback** | live on plain pages; dead wherever `--page-pad` is set |

**Why the asymmetry:** `.page` re-declares `--measure` (Page.css:79) because `min(none, …)` is invalid at computed-value time and silently drops the whole template. A declared value beats an inherited one — so a region's `--measure` reaches every *non-page* reader inside it and never reaches the page's own grid.

### The probe

`page-layout-audit-probe.mjs`, headless chromium, 1440×900, `/framework/ext/tabs/`:

```
.tab-panel            --measure: none   --page-pad: 0   width 1208
.page.doc-section     --measure: 40em   --page-pad: 0   width 1208
  tracks: [bleed-start] 48.30px [wide-start main-start] 611.19px [main-end] 499.97px [wide-end] 48.30px
  padding: 0px
```

Both halves on one element. `tabs.css:68 --measure: none` asked for 1208px of reading column and got **611.19px** — dead. `--page-pad: 0` on the same line reached the page (`padding: 0px`) — live. And that inherited `0` is why **`Doc.css:65 .doc-section { --pad-y: 1.5em }` never fires**: the `var()` fallback only runs when `--page-pad` is unset.

## 4 — "full", region by region

| region you want to fill | mechanism today | what nav it loses | Back? |
|---|---|---|---|
| the **viewport** | `.page.layout-full` — `position: fixed; inset: 0; z-index: 20`, pushed by `--rail-push` (layouts.css:18-28) | everything: site sidebar, framework rail, tabs. `.layout-close` (an `<a>` to the parent url) is the only way out | ✅ it is a ROUTE |
| **`app.$pages`** (right of the site sidebar) | mount at the top level and wear `full fill`; or just `fill` — `--gutter-x: 0` only collapses the tracks | the framework left rail (that rail lives in `/framework/page.js`'s own `$pages`, so a top-level page is beside it, not inside it) | ✅ |
| a **Doc's tab panel** | `.tab-panel` is `padding-top: 3em` and no height — a page in it can be wide but cannot be tall | nothing | ✅ |
| a **catalog's `$pages`** | catalog.css:119-123 gives it a scrollport only when an ancestor has a definite height; otherwise the rail stays | the rail (by design) | ✅ |
| a **Panel workspace** | `ext/Panel/playground/page.js:62` — `page layout-full` + `--page-pad: 0` (playground.css:9), with its own `PlaygroundRail` redrawn as a sidebar | the real site sidebar, replaced by a hand-built copy | ✅ |
| `.page.full` | Page.css:240 — `--gutter-x: 0; --pad-y: 0` | nothing. **It is not fullscreen**; it is "no inset" | ✅ |
| `.page.solo` | Page.css:112 | — | dead code |

**Fullscreen for a workspace, without removing the site sidebar** — `ext/Panel/Workspace/page.js:54` renders `page doc-section` inside a tab panel (a bounded, indefinite-height box: `Workspace` has to be told `--panel-height: 16em` by hand, page.js:31-32). `ext/Panel/demo/page.js:107` is the same shape.
The workspace needs exactly one thing the tab panel cannot give it: **a definite height** to fill. `position: fixed` (playground's answer) buys that by leaving the document, which is why it must rebuild the sidebar. The non-fixed answer is a chain of definite heights from `.pages` down — `.page.solo`'s three declarations are already it (`align-self: stretch; overflow: auto; min-height: 100%`), applied to the page *and* to the tab panel between them. That is a height problem, not a `position` one, and no nav is lost.
