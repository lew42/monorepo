A report says *what* is wrong. This is the only thing that says **where**.
`aim($view, find, label)` makes any view point at an element: hovering rings it
on the page, a click keeps the ring and scrolls it into view, a second click
lets go. `report.js`, `live.js` and `dev/DevBar/layout.js` all wire their
findings through it, so a finding behaves the same in a 17rem rail as in a full
report.

```js
aim($row, () => locate(root, issue.path), issue.sel);
```

## An overlay, never a style on the element

The page under a ring is the page being measured. An `outline` written onto the
offending element is one more thing the next analysis reads back — and one more
thing to remember to remove. The ring is a single `div.lt-spot` on `<body>`,
`position: fixed`, `pointer-events: none`, marked `data-layout-ignore`, moved to
wherever the current element is.

Mounted on `<body>` rather than in `.app` for the same reason the dev rail is:
inside the analysis root it would be measured by the analysis it is reporting
on. Every token it uses is a `:root` one, so it still themes correctly out
there.

## Tracked per frame, so nothing has to tell it anything

While a ring is showing, one `requestAnimationFrame` loop re-reads the element's
rect. That is what makes it follow a smooth scroll, a rail drag, a panel resize
and a reflow with **no** scroll listener, resize listener or observer of its
own — and it is how the ring lets go by itself: the first frame that finds the
element out of the document clears everything. Nothing runs while nothing is
ringed.

## One held, one hovered

`held` (a click) outranks `over` (a hover), so pointing at a second finding
while one is locked does not steal the lock — the lock is released by clicking
the same row again. The row that holds it wears `.lt-aimed`; every aimable row
wears `.lt-aim`, which is this module's class on views it did not build, which
is why it ships the stylesheet that styles them.

## It needs a live root

A path is exact relative to the root it was walked from. The dev rail and
`live.js` hold that element; the audit page holds a url and a report about a
frame that is long gone, so its findings are not aimable and reach their element
through `mirror.js` instead — a reload in a hidden iframe. `report.js` decides
by whether a `root` was passed.

## Improvements

1. **A ringed element that is off screen scrolls into view; a ringed element
   under the dev rail does not move.** The overlay sits under the rail's
   `z-index` deliberately, but a finding on the right edge of a squeezed page can
   be entirely behind it. Scrolling cannot fix that one — insetting the scroll
   target by `--devbar` could. *(simple, useful.)*
2. **The tag renders above the box, and a box at the top of the viewport puts it
   off screen.** Flipping it below when `box.top` is under ~2em is one
   conditional. *(simple, cosmetic.)*
3. **Only one element rings at a time.** A finding that stands for 300 elements
   (the roll-up's `count`) shows its exemplar and nothing else; ringing all of
   them would need the roll-up to carry every path, which is a change to
   `LayoutTool.js` and a bigger `findings.json`. *(medium, speculative — worth
   it only if the exemplar proves misleading in practice.)*
