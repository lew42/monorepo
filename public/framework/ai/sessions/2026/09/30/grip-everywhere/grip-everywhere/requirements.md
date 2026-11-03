# grip-everywhere — the owner's words, verbatim (2026-09-29)

> One resize handle, everywhere: ext/grip today does column and rail width on desktop (a thin
> strip, a pill that rides the pointer, shown on hover). Make it work for BOTH axes (columns AND
> vertical sections: the mobile ✦ sheet in ext/drawer/rail.css, which now caps at 50dvh by
> default, and the planned vertical split).
>
> Responsive: on desktop keep it slim and subtle (it appears on hover and follows the mouse, as
> now). On touch or mobile, show a visible handle (a small bar on the sheet's top edge) that's a
> bit thicker, with a LARGER invisible hit area, so a thumb that misses by a bit still grabs it.
> Touch drag must work (pointer events, and touch-action: none on the handle).
>
> The ✦ sheet's first use: drag its top handle to resize, starting at 50% (or its content
> height, if smaller). Remember the size per device (localStorage, in try/catch).
>
> One API (`grip({axis: "x"|"y", …})`), keeping ext/grip's current callers working unchanged
> (the drawer, DevBar, core/Sidebar, /layouts/shell, core/Page columns if they use it).
>
> Test at 400 px with touch emulation and at 1920 with a mouse, with screenshots. Use a pool
> worktree, the smoke test with links followed, merge.mjs, and ONE fresh reviewer. Post on card
> 2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom.

## Read first

- `public/framework/ext/grip/grip.js`, `grip.css`, `readme.md`, `doc/decisions.md` — the current
  API and every past bug it fixed (mirror, the pill's y-frame, the 4–5px offset). Do not
  reopen any of these.
- `public/framework/ext/drawer/rail.js`, `rail.css` — the mobile ✦ sheet (`.drawer-rail-sheet`,
  `max-block-size: 50dvh`), built 2026-09-29 (mobile-nav task).
- Current callers of `grip(...)` (must keep working, unchanged call sites):
  `ext/drawer/drawer.js`, `dev/DevBar/DevBar.js`, `core/Sidebar/Sidebar.js`,
  `/layouts/shell/Shell.js`, `ai2/card.js`, `ai2/page.js`, `ext/files/explorer.js`,
  `ext/files/files.js`, `styles/system/studies/size/page.js`. (`ai/v/3/page.js` and
  `ext/Panel/grip.js` are a different, older `grip()` — not this module, leave alone.)
  `core/Page` does not call `grip()` today — nothing to preserve there, just don't break the
  search.

## Numbered deliverables

1. **`axis: "x" | "y"` on `grip()`, default `"x"`.** Every existing call (no `axis` passed)
   behaves byte-identical to today — same pointer math, same CSS classes, same screenshots.
2. **`axis: "y"` drags a block-size (height), not an inline-size (width).** Reuse the exact
   design already proven for x: `from` still names which edge of the parent is pinned
   (`"end"` default = the sheet's own bottom, fixed to the screen), the strip sits on the
   box's own MOVING edge (top, for a bottom sheet) — same relationship `from`/`mirror` already
   have on the x axis, just block instead of inline. The pill rides the cross-axis (x, for a
   y-axis grip) the same way it already rides y for an x-axis grip.
3. **Wire it into `ext/drawer/rail.css`'s `.drawer-rail-sheet`:** a grip mounted at the sheet's
   own top edge (`rail.js`), dragging its `max-block-size` (or a `--sheet-h` custom property the
   CSS reads). Starting size: 50% of the viewport height, or the sheet's actual content height
   if that is smaller (measure it — don't just assume 50dvh is always taller than the content).
   Remember the chosen height in `localStorage` (wrap read AND write in try/catch — the owner's
   words), keyed so it doesn't collide with the drawer's own width key, and read it back on the
   next open on that device.
4. **Responsive handle, both axes:** desktop (fine pointer / hover-capable) keeps today's look —
   slim strip, invisible until hover, pill rides the pointer. Touch or coarse-pointer
   (`@media (pointer: coarse)`, or `hover: none`) gets a **visible** handle at rest — a small bar,
   not just a hairline — a bit **thicker** than the desktop strip, and a **larger invisible hit
   area** around it (padding beyond the visible bar), so a thumb that lands a few px off still
   grabs it. `touch-action: none` on every grip strip (already true for the x-axis one — carry
   it to `y` too) so a touch drag never scrolls the page instead.
5. **Touch drag actually works** — pointer events already handle mouse and touch identically
   (the module uses `pointerdown`/`pointermove`/`pointerup` throughout); prove it rather than
   assume it, at 400px with touch emulation.
6. **Don't touch:** `ai/v/3/page.js`'s own `grip()` call or `ext/Panel/grip.js` (a different,
   older, unrelated function of the same name) — out of this fence entirely.

## Fence

- `public/framework/ext/grip/` (grip.js, grip.css, readme.md, doc/decisions.md)
- `public/framework/ext/drawer/rail.js`, `rail.css` (the sheet's own handle + remembered size)
- Nothing else. If a caller needs a change to keep working, that's a sign axis defaulting broke
  something — fix `grip.js` instead of the caller.

## Prove it

- Screenshots: 1920×1080 with a mouse (desktop grip, slim/hover) — the drawer or dev rail's
  x-axis grip, AND the ✦ sheet's y-axis handle. 400×800-ish with touch emulation (Playwright
  `hasTouch: true`, or `isMobile: true`) — the sheet's visible, thicker handle, dragged to a new
  height, and the height surviving a reload (localStorage).
- `node Server/merge.mjs <worktree> [pages touched]` — zero console/page/request errors.
- One fresh reviewer (`review.mjs` after the docs-check step — see the sub-mastermind skill's
  build order).

## Report

Post the landed outcome as a reply on card `2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom`
(`card_reply` or `card_ask`/append per the servex tools) — the owner reads that card, not chat.
