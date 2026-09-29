# Decide: can the collapse be done without touching the active-class logic?

**Yes.** The narrow-width dropdown is a CSS-only, container-query addition in
[switcher.css](../switcher.css) that reacts to classes core/Router already sets; nothing in
switcher.js or switcher.css sets, reads differently, or overrides how those classes get decided.

## 1. Where "which one is current" actually lives today

Two classes mark pages, two mark links, and one CSS rule is the only place any of the four
change what's on screen:

- **`Router.mark()`** — [`core/Router/Router.js:128-135`](/framework/core/Router/Router.js) —
  un-marks the page chain it marked last time, then marks the new one: `.active-page` on the
  leaf, `.active-ancestor` on everything above it. Two `classList` calls; no other state.
- **`Router.mark_links()`** — [`core/Router/Router.js:139-153`](/framework/core/Router/Router.js)
  — walks every real `<a href>` under `$app` and toggles `.active` (exact url match) and
  `.in-path` (an ancestor's url) on each one. This is what lights up a tab or a nav link; it has
  no idea it's inside a tab bar, a file tree or a switcher.
- **The one display rule** — [`core/Page/Page.css:27-29`](/framework/core/Page/Page.css) — `.page
  :not(.active-page, .active-ancestor, .default) { display: none; }`. This is the *entire*
  show/hide mechanism for a page. It is in `@layer util`, so nothing in any component's own
  `@layer theme` — including switcher.css — can out-rank it, only build on top of it.

`ext/tabs` already proves the point once: `tabs.js` never sets `.active` itself — see the
comment at [`ext/tabs/tabs.js:54`](/framework/ext/tabs/tabs.js), "these links were built after
mark() ran, so they missed the pass" — it just re-runs Router's own `mark_links()`. Its CSS,
[`ext/tabs/tabs.css:260-302`](/framework/ext/tabs/tabs.css), already turns a vertical rail into a
horizontal row under a *media* query (`@media (max-width: 64em)`) by doing nothing but reading
`.tab.active` / `.tab.in-path` — proof, already shipped, that a layout can adapt around these
classes with zero new JavaScript.

## 2. What switcher.css adds, and why it's still zero new JS-for-state

The gap between what `ext/tabs` already does and what the owner asked for is real: a media-query
row of *all* the tabs, scrollable, is not "a one-row header showing only the active item, tap to
open the rest." Closing that gap needed exactly one more idea — **`<details>`**, whose open/closed
state is native, not something Router or any script has to track — plus a CSS rule that hides
every tab *except* the one already carrying `.active` or `.in-path` while it's closed:

```css
/* switcher.css:70-72 */
.switcher-drop:not([open]) ~ .tabs.vertical > .tab-bar > .tab:not(.active, .in-path) {
	display: none;
}
```

That's the whole trick. It's a `:not()` on classes Router already put there — this rule doesn't
know or care *how* `.active` got set, only that it's the one class not to hide. Tapping the
toggle flips the browser's own `[open]` attribute (no listener needed for that part either);
[switcher.js](../switcher.js)'s one small script only closes it again after a link is clicked,
reading `e.target.closest("a.tab")` — which link was clicked — never reading or writing `.active`.
Delete that listener and the pattern still works; the reader just has to tap the toggle a second
time to close it.

**Two real traps turned up building this, both instructive, neither about the active-class
question — they're both about `<details>` and containers, which is why they belong here:**

- **A native `<details>` will not reliably show CSS-nested content again, even when the CSS says
  it should.** The first version put `this.tabs(names)` *inside* the `<details>`, with
  `.switcher-drop { display: contents }` meant to make it inert at wide widths. `getComputedStyle`
  reported everything as expected — `display: flex`, `visibility: visible` — and yet the box
  painted at **zero height**, completely empty. `<details>` decides whether its non-summary
  content is even in the render tree at the browser level, and that decision is not the same
  thing as a `display` value; no CSS in any layer can force it back open once the element is
  closed and unstyled that way (MDN's own caution about `display: contents` on native
  form-associated widgets). The fix was structural, not a workaround: `.switcher-drop` (the
  `<details>`, holding nothing but its own `<summary>`) sits **beside** `.tabs.vertical` as a
  sibling, never wrapping it, and the CSS reads the toggle's `[open]` state off that sibling with
  the `~` combinator — [switcher.js](../switcher.js)'s own header comment tells this story too, so
  the next person who reaches for `<details>` around real content sees it before repeating it.
- **A `@container` rule can't restyle the box that declares the container — and this bit the fix
  for the first trap, too.** Once the toggle and the list were siblings, the OPEN dropdown needed
  `position: absolute` against their shared parent, `.switcher` — so `.switcher` needed
  `position: relative`. That rule was first written *inside* `@container switcher (width < 30em)`,
  targeting `.switcher` itself: exactly the self-referential case the css skill already names
  ("a box cannot restyle its own container"). It silently never applied — `getComputedStyle`
  confirmed `.switcher`'s `position` stayed `static`, and the dropdown positioned itself against
  `<body>` instead, landing near the top of the page. The fix: `position: relative` moved to
  `.switcher`'s own unconditional rule at [switcher.css:30](../switcher.css), outside the query —
  harmless at every width, since nothing uses it as a positioning anchor until the query's own
  rules need one.

The container query itself — `@container switcher (width < 30em)` at
[switcher.css:44](../switcher.css) — is declared on the box that opens the container
(`.switcher`, [switcher.css:30](../switcher.css)) and read on its descendants (`.switcher-drop`,
`.tabs.vertical`), never on `.switcher` itself for anything that needs the query to actually fire.

**Two more `<details>`/container quirks turned up fusing the toggle and the label into one row
(2026-09-29), same family as the two above — still nothing to do with the active-class answer:**

- **An absolutely positioned `<summary>` sized only by `inset: 0 0 auto 0` measured `width: 0` in
  Chromium**, even though `left` and `right` both computed to `0px` (verified with
  `getComputedStyle` — a plain CSS2.1 abs-pos box with both inline insets set should fill its
  containing block regardless of `display`). The fix was to stop relying on that: the toggle is
  now a small `width: 2.4em` chevron button pinned to the row's end (`right: 0`) with an explicit
  size, not a full-row overlay — simpler, and it sidesteps the bug rather than explaining it.
- **The row measured full width on an actual 400px BROWSER but shrink-wrapped to its own label
  (115px in a 332px switcher) on a 1920/3440 browser with the same ~400px demo FRAME.** The cause:
  `ext/tabs/tabs.css`'s own vertical-rail collapse sets `align-items: stretch` under
  `@media (max-width: 64em)` — a *viewport* query — which this module's `@container switcher
  (width < 30em)` had been quietly relying on. A container query can match on a wide viewport (an
  880px frame shrunk into a narrow card), where that media query never fires. Fix:
  `align-items: stretch` is now stated directly on `.switcher-drop ~ .tabs.vertical`, inside the
  container query itself, so the collapse no longer depends on the page's own width.

## 3. What this proves

The exact same `.active-page` / `.active-ancestor` / `.active` / `.in-path` marks that drive every
tab strip and every nav link on the site reshape into a collapsing mobile dropdown — a full-width
sticky header showing the current item's label and a real toggle icon, tap to open the rest — using
CSS alone (plus one optional, state-reading-only script that only ever reads which link was
clicked, never `.active`/`.in-path`). See the live demo on [the pattern page](../page.js), "Wide vs
narrow, side by side": the same `switcher()` call, unmodified, framed at ~880px and ~400px on one
page, no window resize needed. The label-and-chevron fusion once listed here as "not proven" is
done (2026-09-29) — the two quirks above are what it took.

## Converging with task-mastermind-file-system

Its brief (`public/framework/ai/2026-09-29/file-system/minion-b/requirements.md`, deliverable 4)
says only "at 400 the tree folds away behind a button" — no class named yet. This page names one:
once `ext/filesystem`/`ext/files` is on `michael/dev`, its mobile explorer should call
`this.switcher(names, { skin: "tree" })` (or add a fourth skin here if the file tree needs
something `.switcher-skin-tree` doesn't give it) instead of building a second collapse mechanism.
Its task dir: `public/framework/ai/2026-09-29/file-system/`.
