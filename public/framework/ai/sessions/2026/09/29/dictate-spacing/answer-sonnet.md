# Dictate page spacing — sonnet's answer

Measured live at 400px with headless Chromium (`getComputedStyle` + `getBoundingClientRect`), not guessed from the screenshot.

## 1–2. The gaps, the rule, the fix

| Gap / problem | Element (selector) | File : line | Property | From (computed @400px) | To | Why |
|---|---|---|---|---|---|---|
| Empty band under the tabs | `.tab-panel` | `ext/tabs/tabs.css:111` | `padding-top` | `3em` → **42px** | keep, but see below — this is the single biggest number on the page | It's a fixed em, not a clamp, so it never shrinks for a narrow card. It's meant to clear the tab strip once, not stack with more padding below it. |
| Extra space before "Folder" | `.page.doc-section` (the Doc content page inside the tab panel) | `ext/Doc/Doc.css:74` | `--pad-y` | `1.5em` → **21px** | `0` when a `.tab-panel` already paid `padding-top` (it always has, `tabs.css:111`) | `--pad-y` and the tab-panel's `padding-top` are two paddings for the same "space under the tab strip." `Doc.css:74`'s comment already half-admits this never fires when `--page-pad:0`, but here nothing zeroes it, so both apply: 42px + 21px = 63px before any content. **Smallest fix:** add `.tab-panel > .page { --pad-y: 0; }` in `ext/tabs/tabs.css` next to the existing `--page-pad: 0` reset on line 111. |
| Side padding at 400px | same `.page.doc-section` | `ext/Doc/Doc.css:16` | `--gutter-x` | `clamp(2em, 4%, 5em)` → **28px** each side (56px of 400px = 14% of the screen) | `clamp(1.25em, 4%, 5em)` → 17.5px floor | The floor (`2em`) is what's actually binding at 400px, not the 4%. Lowering just the floor buys back ~21px total width for a mobile card with no effect above ~525px wide (where 4% overtakes the floor). |
| Tabs cut off ("PLAYGROUN…") | `.tab-bar` | `ext/tabs/tabs.css:53-57` | `overflow: auto; scrollbar-width: none` | 7 tabs measure **633px** total, forced into a 400px bar | Add back a visible cue — the edge-fade `--tab-fade` was deliberately removed 2026-08-18 ("misplaced on `.tab-bar`" — see `ext/tabs/doc/overflow.md`) but nothing replaced it. Cheapest fix that doesn't reopen that removal: `scrollbar-width: thin` only inside `@media (pointer: coarse)`, so touch users see a real (if faint) scrollbar instead of a silently truncated label. |

Smallest change first: the `--pad-y: 0` reset (one line, removes 21px, zero risk — it only fires where nothing currently zeroes it) → then the `--gutter-x` floor → the tab overflow cue is the only one that isn't a pure CSS-token change.

## 3. The `--pad` token question

**Does a percentage padding resolve against the parent, not the card's own width?** For an ordinary block element, no — CSS resolves a percentage padding against the width of the element's own **containing block**, and for a normal in-flow block that containing block's width equals the element's own parent's content-box width, which (for a plain single-column card) usually *is* the card's own width too, so `--pad`/`--pad-card`'s existing percentage form is correct there — matches `framework.css:270-279`'s own comment and `--pad-card`'s design.

**Where it actually misfires** is exactly the case the owner names — "more columns." Put that same card as a flex or grid **item** in a multi-column row, and its containing block for percentage purposes is the **flex/grid container's** content box (the whole row), not the item's own shrunk track width (CSS Flexbox spec §4, CSS Grid spec §10 — an item's percentage padding is resolved against its containing block, which is the *container*, before the item's own size is even known; this is intentional, to avoid a circular "padding depends on width depends on padding" loop). So a 3-column row and a 1-column row report the *same* percentage-padding value per card, even though each card is a different width — precisely what the owner suspected, just one level more specific than "percentages resolve against the parent" (they resolve against the *containing block*, and a flex/grid item's containing block is the whole container, not its own column).

**Can `cqi` resolve against the element itself?** No — by spec (CSS Containment Module Level 3), a container query unit resolves against the nearest **ancestor** established as a query container (`container-type: inline-size` or `size`); an element can never be its own query container, the same anti-circularity rule as above. So `cqi` on a card's own padding needs a wrapper **one level up** wearing `container-type: inline-size`; the card itself just reads `cqi`.

**Smallest correct design** for "a card's padding follows the card's own width, in any layout": give every card a **1px shell it already needs for other reasons** (a border, a background, a rounded corner — `.card`/`.surface` already have one) and put `container-type: inline-size` on *that* shell, then define the card's own padding in `cqi` on its inner content, e.g. `--pad-card: clamp(1rem, 2.6cqi, 2em)`. That one extra container wrapper is unavoidable — no unit resolves an element's own box against itself — but it costs nothing beyond a class already on every card.

---

Cost: this run used Playwright + targeted CSS greps only (no screenshot re-render, no full-file reads of `Page.css`/`framework.css` beyond the sections above); model: Sonnet 5, effort not separately metered here.
