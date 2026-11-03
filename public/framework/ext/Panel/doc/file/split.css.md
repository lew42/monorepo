## split.css

The four edge targets `split.js`'s `edges()` builds, and the ghost preview
that follows the pointer. Structure and placement only — the ghost's tint is
the one deliberate exception, because a preview has to *look like* the arrival
it stands for.

## The edge bands, and why they aren't the whole edge

```css split.css
.panel-edge { position: absolute; z-index: 1; --edge: 0.9rem; --clear: 0.7rem; cursor: crosshair; }
.panel-edge-t { inset-block-start: var(--panel-bar-h); inset-inline: var(--clear); block-size: var(--edge); }
```

⚠ **`--clear` resolves a collision that is spatial, not z-order.** A shared
edge already belongs to the grip, whose target straddles the seam by
`0.625rem` either way (`grip.css`) — measured, the grip won three of four
edges and the bar's own centred split button won the fourth, so a click here
used to reach nothing at all. Dragging a seam to resize and clicking an edge
to split are both worth keeping, so they get **bands**: the outer `0.7rem`
(`--clear`) stays the grip's, the split strip (`--edge`, `0.9rem`) starts
right after it, and the top strip additionally starts below the bar so no
icon ever sits on it. The full budget across every overlay in the module,
including the z-order half of this same question:
[doc/overlays.md](../overlays.md).

⚠ **Under the 3×3 in z-order (`z-index: 1` against `2`), on purpose.** The
corner arrows visually overlap these strips; an arrow is a discrete target
and the rest of the edge is the split zone, so the arrow has to win the
pixels it occupies.

## The ghost — half the panel, at the size the split will actually be

```css split.css
.panel-ghost-row { inset-block: 0; inline-size: 50%; }
.panel-ghost-row.before { inset-inline-start: 0; }
.panel-ghost-row.after  { inset-inline-end: 0; }
```

Exactly 50%, because `divide()` gives the arrival an even share — the preview
is not an approximation of what will happen, it is a picture of it. `z-index:
4`, above everything else the body can show, because it has to read as "about
to happen," not as content.

## Reveal

```css split.css
.panel:hover:not(:has(.panel:hover)) > .panel-edge { pointer-events: auto; }
```

The same innermost-wins idiom the bar and the 3×3 use — otherwise every
ancestor's edge strips would stack over the leaf actually being pointed at,
same reasoning as only one bar lighting at a time.

## Improvements

Nothing ranked: 45 lines, four positioned strips and one ghost. The one real
decision (the band split with the grip) is recorded in full above and in
[doc/overlays.md](../overlays.md); nothing here duplicates another file's
job.
