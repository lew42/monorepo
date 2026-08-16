# panel-swiss-army

> "this should be the swiss army knife of web design" — Mike, 2026-08-16

## The ask, verbatim

> remove the background from the hover title bar, and make the icons very
> transparent, so they're less visible.
>
> we need a 9 grid of alignment buttons, arrows pointing at each corner and edge,
> and a dot in the center. oh, i see them now, in an "alignment" mode (you have to
> click the first button). let's turn them on by default (they appear when you hover
> the panel), we'll probably hide them away later, so leave the plumbing. I want to
> see all the core tools for now, to get a better sense of how this is going to feel.
> to clarify: each alignment button should be properly aligned to that edge (obey
> padding).
>
> let's remove the button strips: when you click an edge, it launches a dual-sided
> "split row/column" mode. if you click a left/right edge, you get a new column
> preview that follows your mouse (switching from one side to the other). if you click
> on a top/bottom edge, you get a new row preview that similarly follows your mouse.
> left click to accept, right click or escape to cancel. there might need to be some
> adjustment if the child's edge is the same as the parent's edge?
>
> there's a scrub zoom on one of the demo()s, add one of those to each panel.
>
> can a panel be "selected"? if selected, it appears in the properties panel?
>
> let's put a quick "split" button top center for adding an even column. how do we
> visualize flex vs grid columns, adding adjusting, etc?
>
> work autonomously, plan this out. this should be the swiss army knife of web design.
> if it doesn't fit on the overlay, put it in the properties panel.
>
> figure out a way to select text layers, and configure them.
>
> figure out a way to have a master + live duplicates? maybe alt + drag keeps them
> sync'd by default?
>
> add a smart insert button: it shouldn't make anything jump, but maybe it is position
> absolute, inserted into the flow, so it can fill the space? the idea here, is that it
> should follow your mouse, so you see a + button that fills the natural content area
> from left to right, at your mouse position.
>
> if there are columns, maybe the + becomes a tall narrow vertical button, similarly
> filling the vertical space, indicating where the item will be inserted? grids/lists
> that have repeating items could also get a + button somewhere.
>
> think through the fastest, easiest way to do these common tasks. work autonomously,
> spawn minions to work faster, keep an eye on usage.

## Standing instruction

**Everything visible by default for now.** Mike wants to feel the whole tool before
anything is hidden — so each surface ships behind a named flag that currently
defaults to on, and the plumbing to hide it stays.

## Waves

1. **Chrome** — the bar loses its background, the icons go faint. The 3×3 becomes a
   persistent overlay on the body (arrows at the eight placements, a dot at the
   centre, each button *at* the edge it names and inside the padding), not a popover
   behind a trigger. A quick `split` button, top centre.
2. **Edge split** — clicking an edge enters a dual-sided preview: a new column (left/
   right) or row (top/bottom) that follows the pointer and flips sides across the
   midline. Left click commits, right click or Escape cancels.
3. **Selection** — a selected panel draws its words in `ext/drawer`, which is what
   the drawer was extracted for. Overflow from the overlay lands there.
4. **Scrub zoom** per panel, reusing `ext/demo`'s.
5. **Insert** — a `+` that tracks the pointer and fills the natural content area:
   a wide bar between rows, a tall bar between columns.
6. **Deeper** — flex vs grid visualisation, text layers, master + live duplicates.

## Fences

This task owns `public/framework/ext/Panel/**`. It does **not** own
`public/framework/ext/files/**` (the concurrent `files-panels` task) or
`public/framework/ext/drawer/**` beyond calling it.
