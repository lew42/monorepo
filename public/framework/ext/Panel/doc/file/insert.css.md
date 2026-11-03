## insert.css

The `+` stub `insert.js` positions, drawn as a real object (a surface, a
border, a lifting shadow) rather than a bare icon — the one overlay in this
module that needs to read as clickable furniture rather than faint chrome,
because it sits in a gap with nothing else to give it a boundary.

## `.panel-items` gains `position: relative` from outside

```css insert.css
.panel-items { position: relative; }
```

⚠ **Nothing needed `.panel-items` to be a positioning context before this
bar arrived.** `grip.css` already reads its `.v` modifier the same way, from
outside — a second file claiming a property on a class it doesn't emit is the
established pattern here, not a one-off.

## A stub at the head of the seam, not a bar down its length

```css insert.css
.panel-insert {
	position: absolute;
	z-index: 5;
	--insert-run: 2.2rem;
	inset-block-start: 0.7rem;
	block-size: var(--insert-run);
	…
}
```

⚠ **This shape replaced a full-height bar, on the owner's direct complaint
(2026-08-16).** Full height, it covered the grip for the seam's *entire*
length — the resize handle could never appear underneath it — and its own
edges were invisible, so there was nothing to aim at. Now it claims only
`--insert-run` at the start of the seam and the grip keeps the rest; the
visible surface, border and shadow give it a boundary a bare icon never had.

`z-index: 5` — above the split ghost (4), a neighbour's bar (3) and a grip
(2) it may visually straddle at the same gap. Full budget:
[doc/overlays.md](../overlays.md).

⚠ **The `0.7rem` start is an inset, not `0`, since 2026-08-19.** A NESTED
split's own left/top edge sits exactly on its PARENT's grip strip (which
reaches `0.625rem` past its true centre, `grip.css`'s `::before`) — a stub
starting flush at `0` silently ate the outer seam's drag right where a
nested column meets its parent's grip (`panel-flow`'s finding). `0.7rem`
clears that strip with a hair to spare — the exact number `split.css`'s own
`--clear` already measured for the identical grip-vs-overlay conflict at a
panel's own edges. The stub's OWN split (its interior gaps, where winning
the click is the point) is untouched: the overlap there is the trigger, not
the bug — lowering `z-index` instead was measured and rejected, since the
stub's box sits almost entirely inside its own grip's strip there too, which
would have killed it at the gaps it exists for.
[doc/decisions.md](../decisions.md).

## The axis flips with `dir`, same box, other axis

```css insert.css
.panel-items.v > .panel-insert {
	inset-block-start: var(--insert-at, 50%);
	inset-inline-start: 0.7rem;
	block-size: 1.4rem;
	inline-size: var(--insert-run);
	translate: 0 -50%;
}
```

`dir: "col"` stacks rows, so `.panel-items` wears `.v` (`workspace.js`) and
the whole rule set mirrors: the stub becomes wide-and-short at the *start* of
a horizontal seam, using the exact same custom property (`--insert-at`) the
row case uses for the perpendicular axis.

## ⚠ Reveal is NOT the leaf idiom

```css insert.css
.panel-items:hover:not(:has(.panel-items:hover)) > .panel-insert.on {
	opacity: 1;
	pointer-events: auto;
}
```

A split **contains** panels by definition, so
`.panel:hover:not(:has(.panel:hover))` — the test every other overlay in this
module uses — is false for every split that has ever been hovered, and this
bar could never appear if it copied that idiom. The question here is
different: is this the **deepest split** under the pointer? So the test runs
on `.panel-items` against a nested `.panel-items` instead. `.on` is
`insert.js`'s own flag — a split of one child has no interior gap, and the
stub must not appear at all rather than sit uselessly in the middle.

## Improvements

Nothing ranked: the axis flip is one rule pair not two files, and the idiom
mismatch with the other overlays and the `0.7rem` inset are the two
genuinely subtle things here — recorded above and in
[doc/overlays.md](../overlays.md) rather than left to be rediscovered.
