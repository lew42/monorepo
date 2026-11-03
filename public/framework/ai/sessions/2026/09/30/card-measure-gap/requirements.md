# Card page: layout and click-select bugs

Relayed by `@servex-mastermind-opus` once `/framework/ext/grip/`'s two zones landed (same
drawer-resize geometry). The owner's own words are `owner-words.md` beside this file (also
quoted in full below) — that transcript is the acceptance test, not this summary.

## Where

An AI 2 card page — for example `/framework/ai2/2026/09/30/now/` — which has Overview and
Activity tabs.

## The owner's words, verbatim (2026-09-30)

> All right, so the cards template that says it has overview and activity tabs, um, at the
> resolution I'm looking at it at, it's, it's got a measure to it, but it's just kind of like a
> It, the the layout the internal layout doesn't match the container layout right like there's
> no border at the right side of this measure and so it just looks like it's stopped randomly
> and the once the drawer is opened it can kind of fill the space a little better although it's
> for some reason it's reserving a massive amount of space when I resize the right drawer to
> make it bigger it there's like a five hundred pixel void in between the right sidebar and this
> this card's actions dropdown uh, also when I click the actions drop down it highlights the
> element there's there's this like selection uh thing that's going on I think we want to maybe
> use a inspect mode to to toggle that on we don't want to automatically select things just by
> clicking on them like then it kind of destroys all the UX

## Deliverables, numbered against the words above

1. **The measure has no visible right edge.** Its inner layout should match its container: give
   it a visible edge (a border, a background change — whatever the design system already uses
   for a bounded measure), or let it fill instead of stopping with nothing to show why.
2. **Widening the right drawer opens a ~500px empty gap** between the drawer and the card's
   Actions dropdown. The page reserves space it isn't using; the card's content should fill the
   space the drawer leaves, at whatever width the drawer is.
3. **Clicking the Actions dropdown selects/highlights the element underneath it**, as if a
   click-anywhere selection tool is always on. The owner wants that OFF by default — selection
   only when an explicit "inspect mode" is toggled on. A plain click (opening a dropdown, etc.)
   should never select anything.

## Proof

Screenshots at 1920 and 3440, with the drawer closed, open, and widened — for deliverables 1 and
2. For deliverable 3, before/after: click Actions with inspect mode off (nothing selected) and
with it on (selection still works).

## Rules

Quick-fix pool: `take_worktree`, then `merge.mjs` (smoke test), then the review skill. Check
`/framework/ai2/` and `/framework/core/Page/` first — this is `core/Page`'s card template plus
whatever owns the click-to-select behavior (likely `ext/Panel` or a page-inspector module; find
it before assuming).

