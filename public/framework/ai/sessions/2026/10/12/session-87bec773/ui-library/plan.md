# UI library: plan

**What it is:** one page, `/framework/library/`, where you browse everything we built — `ui/`, `ux/`, the Figma rebuilds, later sections, layouts and templates — in three columns: the items of a category on the left, the chosen one at full size in the middle, its variants on the right. Click a variant and it becomes the chosen one. The library is drawn with the kit itself (`.card`, the toolbar, the rail).

Brief: [requirements.md](requirements.md). State: [STATE.md](STATE.md).

## Past work it reuses (scan 2026-10-12)

- **Variants already exist as child pages:** `demo.page(name, fn, {note})` (`ext/demo/exhibit.js`) — `ui/card` has four. The library walks `children`; it builds no second variant system.
- **Previews:** every `ui/*` page has `preview(nav)` drawing a live thumb (`core/Page/Previews.js`). The rails reuse it as the fallback.
- **The rail:** `Inbox.Rail` (`core/Page/ext/Inbox/Rail.js`) is the persistent preview stack the AI board uses; `ext/catalog` has `catalog()` (rail) and `browse()` (wall).
- **Widths:** `ext/demo/stage.js` `WIDTHS` (mobile 390 · tablet 810 · desktop 1440 · mega 3440) and its CSS-`zoom` rule (never `transform`).
- **Masonry:** `styles/layouts/masonry/` (`.masonry`, `.packed` + `pack()`); the 2026-09-30 masonry brief ([ui-system/masonry](/framework/ai/sessions/2026/09/30/ui-system/masonry/requirements.md)) was never built into `browse()`.

## Class architecture

```
class Library extends Page            // the system: the one page, its route, the three columns
  static Collection                   // a category: ui, ux, figma … ; lists its LibraryItems
  static Item                         // one thing to show: title, url, optimalWidth, padding, render(), variants()
  static Rail                         // a column of Item previews (left: siblings, right: variants + related)
  static Stage                        // the centre: the active Item at 100%, width chips, zoom-to-fit
PaddingContract                       // site-wide check: needs_parent_padding / no_parent_padding → red + console.error
```

- **Library** orchestrates: reads `?at=<collection>/<item>/<variant>` (every view has a URL), resolves the path through Collections → Items, and fills the three columns.
- **Item** wraps a `Page` (a component page or a `demo.page` child). It never copies the page; variants are the page's own `children`, so a change to the parent shows in every variant.
- **Item.render()**: the page's `specimen` (the bare render function) when it has one, else its `preview()` thumb with the zoom taken off.

## Decisions (each with the alternative)

1. **Where it lives:** `public/framework/library/`, a sibling of `ui/` and `ux/`, because it spans them. *Alternative:* `ui/library/` (reads as ui-only) or `ext/Library/` (buried).
2. **Routing:** one page, `?at=ui/card/media`. *Alternative:* dynamic routed children per item (`route()`, as `ext/Figma` does) — better URLs, more code; later.
3. **`specimen`:** a page names its bare render function `specimen`; `demo.page()` sets it for every variant in one line. *Alternative:* render the page's whole `content()` (drags in docs and chrome).
4. **`optimalWidth`** on every Item: `400` mobile · `1000` default · `1920` desktop · `3440` mega. Default 1000; ui components 400.
5. **Preview layout rule — span by width:** in a wall, a card's column span comes from `optimalWidth` (400→1, 1000→2, 1920→3, 3440→4) with `grid-auto-flow: dense`; in a rail (one column) heights simply stack. *Alternatives:* masonry `pack()` (keeps order, more measuring), grouping by size.
6. **Zoom rule (one rule):** a preview lays out at its `optimalWidth` and is scaled with CSS `zoom = card width ÷ optimalWidth`, never above 1.
7. **Padding contract:** an Item says `needs_parent_padding` (a card with a border or a different background) or `no_parent_padding` (full bleed). `PaddingContract.check(root)` finds `[data-needs-parent-padding]` whose parent has zero padding: it adds `.padding-misuse` (red shading) and `console.error("[padding] …")`, which `Server/smoke.mjs` already fails on. *Not yet:* the page assembler refusing before render.
8. **Tree and data:** a page holds child pages **or** items/content, rarely both; dragging an item onto a page keeps what it is (a page stays a page — a page is an Item plus routing). Recorded in [doc/tree.md](/framework/library/doc/tree.md) once the module exists; checked with @mastermind-page-templates.

## Steps

1. ✅ Past work.
2. ✅ This plan.
3. ⬜ The slice (Sonnet minion, worktree): `framework/library/` with `Library`, `Item`, `Collection`, `Rail`, `Stage`; collections `ui` and `figma`; `specimen` in `demo.page`; `optimalWidth`; span rule; `PaddingContract` + smoke. Shots at 400/1200/1920/3440.
4. ⬜ Widen: `ux/`, sections, layouts (with @mastermind-layout-catalog), templates (with @mastermind-page-templates), the right rail's related rule.
