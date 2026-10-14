# drawer architecture — one rail that pushes the page, filled by whoever is talking

`ext/drawer` is the site's one right-hand rail, for context, tools and help beside the page. Its main entry is `drawer(fn)` in [`drawer.js`](../drawer.js), which fills two slots and gives back the rail. On phones the same tabs live in a bottom bar and voice sheet, [`rail.js`](../rail.js). Each tab is a class-free fill function in [`tabs/`](../tabs/), and the rail never decides what it shows.

## The rail pushes the page, it never covers it

**Decided:** the open rail reserves its width on `.app` with `--drawer` and `--rail-push`, so the page reflows beside it.
**Why:** a properties panel that covers the thing you are editing is the one failure this module exists to prevent.
**Instead:** a `position: fixed` overlay. It is simpler, but it sits on top of the content being edited.
**Detail:** [`drawer.css`](../drawer.css) (`.app { --rail-push: … }`).

## Two tokens: width and open/shut

**Decided:** `--drawer-w` holds the width and `--drawer` holds open/shut. `--drawer` reads `var(--drawer-w, 19rem)` while open.
**Why:** `close()` clears `--drawer` to release the strip. If width lived there too, a rail dragged wide would spring back to 19rem on every close.
**Instead:** one token for both, which loses the dragged width on close.
**Detail:** the width is restored from `localStorage` key `lew42-drawer-w` in `build()`, before first paint ([`drawer.js`](../drawer.js)).

## Drag clamps at 26rem, so the push and the rail stay one number

**Decided:** the rail's width is clamped to `innerWidth − 26rem` (minimum 200px), and `FLOOR` is read from the root font size once, at import.
**Why:** past that point `.app` stops widening its push, so the reserved strip and the rail would stop matching.
**Instead:** clamp to `innerWidth − MIN`, which lets the rail cover the reading column.
**Detail:** [`drawer.js`](../drawer.js) (`FLOOR`, `MIN`). The `26rem` in `drawer.css` is a copy by hand, because a custom property cannot drive a media query.

## Below 26rem the rail is the whole sheet

**Decided:** under `26rem` the rail takes the full width; it never leaves a sliver of page.
**Why:** a push of 0 on a 400px screen would leave a partial cover that reads as nothing.
**Instead:** a partial overlay, which is the sliver the owner rejected.
**Detail:** `@media (max-width: 26rem)` in [`drawer.css`](../drawer.css).

## The resize edge belongs to ext/grip

**Decided:** the drag handle is [`ext/grip`](/framework/ext/grip/). This module supplies only what a width means here: the clamp, `--drawer-w` and the storage key.
**Why:** the edge was welded to `dev/DevBar`'s settings, and a copy would have re-learned its offscreen bug.
**Instead:** a second copy of the edge inside this module.
**Detail:** [`ext/grip/doc/decisions.md`](/framework/ext/grip/doc/decisions.md).

## The rail is one surface: the last fill owns it

**Decided:** every `drawer(fn)` call replaces the contents. Callers `dock()` once and later only fill a rail that is already up.
**Why:** two rails at one edge would fight over the same push.
**Instead:** a stack of panels, each with its own push, which the layout has no room for.
**Detail:** [`doc/decisions.md`](./decisions.md#sharing-the-rail).

Callers redraw by re-announcing their subject (for example `panel-focus`), not by `drawer.refresh()`, which replays whatever fill ran last.

## Click-to-select needs the inspect switch

**Decided:** clicking page content selects an element only while the `inspect-mode` class is on `<html>`. The switch is a row in the drawer's Settings tab, off by default and kept across reloads.
**Why:** a plain click on a custom dropdown trigger was selecting content and destroying the page's own controls.
**Instead:** a longer list of controls to skip. A new control would reopen the bug.
**Detail:** [`select.js`](./select.js) (`active()`), [`doc/decisions.md`](./decisions.md) (2026-09-30).

## Deselecting does not close the rail

**Decided:** only the ✕ shuts the rail. Losing a selection clears the highlight and redraws the caller's "nothing selected" view.
**Why:** a click anywhere on the page used to close the rail and lose the reader's scroll place.
**Instead:** closing on deselect, which the owner rejected.
**Detail:** [`doc/decisions.md`](./decisions.md) (2026-08-16).

## The phone bottom rail is a flex child, not a fixed bar

**Decided:** below 52em, the ✦ and ⋯ bar is the last flex child of `.app` (`flex: 0 0 auto`). The page's own pane shrinks above it. The voice sheet is the one `position: fixed` piece.
**Why:** the page column already is a flex column, so the bar takes its own height with nothing to compute.
**Instead:** `position: fixed` with a manual bottom reservation, which needs the bar's height kept in sync by hand.
**Detail:** [`rail.css`](../rail.css) (line 1–12), [`doc/decisions.md`](./decisions.md#the-mobile-bottom-rail-2026-09-29).

## Below 52em the page's own sidebar owns the ☰

**Decided:** when a page has its own `.sidebar` (`core/Sidebar`), the drawer's ☰ hides below 52em.
**Why:** two native hamburgers fought for every tap.
**Instead:** both shown, which double-stacks the corner.
**Detail:** `@media (max-width: 52em)` in [`drawer.css`](../drawer.css).

## The AI tab's hidden panels must beat the layer order

**Decided:** `[hidden]` rules in the drawer's `@layer theme` carry `!important`.
**Why:** `.flex { display: flex }` lives in `@layer util` and beats `[hidden]` regardless of specificity. A closed 12-item list was rendering at about 940px and pushing the composer off the bottom.
**Instead:** a higher specificity selector, which the layer order still defeats.
**Detail:** [`drawer.css`](../drawer.css) (line 199–215), [`doc/decisions.md`](./decisions.md) (2026-10-03).

## What will bite you

- **⚠ Mount inside `.app`, never on `<body>`.** The colour scheme and `--drawer` are read there, so a body mount renders light and loses the push.
- **⚠ Use `rem`, not `em`,** for the rail and its push. An `em` reserves the wrong strip.
- **⚠ `position: fixed` opts out of the push.** A full-bleed page must read `--rail-push` itself (`.page.layout-full`, [`layouts.css`](/framework/styles/layouts/)).
- **⚠ `z-index: 40`.** It sits over `.demo.max` (30) and under the mode button (60), and docks beside DevBar via `--devbar`.

## Who uses this

| caller | for |
|---|---|
| [`ext/layout`](/framework/ext/layout/) | the selected element's words, tokens and its build line |
| [`ext/Panel`](/framework/ext/Panel/) | the focused panel's properties (`tools.js` → `properties.js`) |
| [`ext/drawer/tabs`](./tabs/) | the AI, Dictation, Settings, Sessions and Admin tabs |
