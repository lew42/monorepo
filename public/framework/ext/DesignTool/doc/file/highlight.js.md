A report says *what* is wrong. This is the only thing that says **where**.
`point($view, root, issue)` makes any view point at the box a finding is about:
hovering rings it on the page, a click keeps the ring and scrolls it into view, a
second click lets go. `report.js`, `live.js` and `dev/DevBar/layout.js` all wire
their findings through it, so a finding behaves the same in a 17rem rail as in a
full report.

```js
point($row, root, issue);                       // the door
aim($view, () => el, "what to call it");        // and the raw affordance under it
```

## `point()` decides WHETHER to offer a ring, and that is three decisions

Each surface used to spell its own version of "aim this, but only if the path is
non-empty" — three places to teach, and `live.js` kept a `keep()` helper that
existed solely to be the else branch. One function now, and it closes three ways a
ring can be worse than no ring:

- **a roll-up** attributes the finding to the container, because that is where the
  fix goes — but its `spot` carries the **exemplar**, `{ path, sel }`, so the ring
  lands on the box that actually broke *and* is captioned with it. Without it, 32
  of 47 rings covering ≥60% of the viewport were roll-ups pointing at boxes like
  390×25731, captioned `div.md.flow` while the detail line said "worst is `p`".
- **a page-level finding** (`dead-space`, `invisible`) issues against the analysis
  root, whose path is `""` — and an empty path *is* the root (`address.js`), so the
  ring came out over the entire viewport. It gets no ring and no affordance:
  `.dt-aim`'s pointer never appears, so nothing promises a location.
- **a path that no longer resolves** is the same answer, and it is the one case
  that used to fail silently — the row looked clickable and did nothing.

⚠ `const at = i.spot ?? i` is the whole implementation: a finding is its own
address when it has no exemplar, because `spot` is issue-shaped on purpose.

## A target outside the window is pinned to the edge it left by

The overlay is `position: fixed`, so a box below the fold was drawn at coordinates
outside the window and **hover produced no feedback whatsoever** — measured on 37
of 93 leading findings across 8 pages × 4 widths, and it is the gesture the row
invites. It becomes a 3px bar along the near edge, solid rather than washed, with
`↑`/`↓` in the tag; clicking still scrolls, and then the ring is an ordinary one.

## An overlay, never a style on the element

The page under a ring is the page being measured. An `outline` written onto the
offending element is one more thing the next analysis reads back — and one more
thing to remember to remove. The ring is a single `div.dt-spot` on `<body>`,
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
the same row again. The row that holds it wears `.dt-aimed`; every aimable row
wears `.dt-aim`, which is this module's class on views it did not build, which
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
   conditional — done for the pinned-up bar, not for an ordinary ring.
   *(simple, cosmetic.)*
4. **The edge bar is pinned to the WINDOW, not to the visible page.** Below 34em
   the dev rail is a bottom sheet over the lower 45%, so a `↓` bar lands behind
   it. A tap works (the click scrolls the target to `start` and rings it
   normally), so this only bites a mouse hover in a narrow window; the fix is a
   published `--dt-fold` the rail sets, which is more contract than the case has
   earned. *(simple, speculative.)*
3. **Only one element rings at a time.** A finding that stands for 300 elements
   (the roll-up's `count`) shows its exemplar and nothing else; ringing all of
   them would need the roll-up to carry every path, which is a change to
   `DesignTool.js` and a bigger `findings.json`. *(medium, speculative — worth
   it only if the exemplar proves misleading in practice.)*
