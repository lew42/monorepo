## grip.css

The divider's paint. Zero-width in flow, so two panels genuinely touch; the
seam is a drawn hairline, the target is an overlay strip straddling it, and the
pill is a sign rather than a handle. Tokens only, so dark comes free.

## ⚠ The `box-shadow` **is** the seam

```css grip.css
.panel-grip { flex: 0 0 0; position: relative; z-index: 2; box-shadow: 0 0 0 0.5px var(--line); }
```

A 0.5px spread around a zero-width box is a 1px line, and the same declaration
draws the horizontal divider — no axis to branch on. A shadow costs no layout,
so panels sit at a measured 0px apart with no gap to explain.

⚠ **`z-index: 2` is what lets the strip reach over the next panel** — siblings
paint in DOM order, so without it half the grab target is buried. Under
`.panel-bar`'s 3 on purpose, so a bar stays clickable where the two cross.

## ⚠ The target is `rem`, never `em`

`.panel-grip::before { inset: -0.625rem }` — a 1.25rem strip is the only thing
here that hit-tests. A panel's own content sets its font size, so an `em` strip
would be a different grab target in every panel on the page. `(hover: none)`
widens it to 1rem, because a finger needs more strip than a pointer does.

## One rule positions the pill on both axes

`top: var(--grip-y, 50%); left: var(--grip-x, 50%)`. `grip.js` writes only the
property its own axis moves along; the other half falls back to the middle of a
zero-length side, which *is* the seam. The pill is `pointer-events: none` — the
strip is the target, this is only the sign — and it stands permanently under
`(hover: none)`, where there is no hover to reveal it with.

`touch-action: none` on the grip: ⚠ without it a touch drag scrolls the page
instead of moving the divider.

## The menu overrides only *where* it opens

`.panel-grip > .panel-pop` re-anchors `toolbar.css`'s popover to `--grip-x` /
`--grip-y` — so it lands under the pointer with no gap to cross, which matters
because leaving the grip closes it. Everything else about the block is
`toolbar.css`'s. The button rule below it is the same three-class theme reclaim,
for the same reason and with its own padding: a two-word menu, not a 1em icon.

## Improvements

1. **The axis is encoded twice** — `.panel-items.v > .panel-grip` here,
   `sideways()` reading `classList.contains("v")` in `grip.js`. Renaming the `v`
   utility breaks both, and neither would throw. *(medium, important)*
2. **The theme-button reclaim is copy-pasted from `toolbar.css`** with different
   padding. Two copies of a five-property block that exists only to out-specify
   `.theme-lew42 :is(button, .btn)`. *(simple, useful)*
3. **The pill is a fixed 2rem along the seam** regardless of how long the seam
   is, so a very short divider gets a pill overhanging both ends. Cosmetic, and
   only visible in a deeply split workspace. *(simple, speculative)*
