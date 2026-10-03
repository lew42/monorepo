# Icon items say how they open: a trailing icon for "takes over" vs "opens beside"

## The ask (owner, 2026-10-03, dictated)
> Icon items: an icon at the start says what the thing is; a little chevron on the far right says it's clickable, especially on hover, especially a link to another page. As part of the navigation system, an icon item could show its launch mode by the icon after it: up-and-to-the-right = launch / take over the whole space; a plain right arrow (or a two-column icon) = open it in a sidebar beside. Those are the two defaults. And if things open beside each other, be careful about sizing: how much space do the two have, how much do they need; don't render something that wants 3000px at 1500.
> UI design: how much space does a thing need: a whole mobile row, or less, leaving room for another button?

## Want (small)
1. Read the `navigation` skill and `ui/item` (icon items) first; add a `launch` property (`"takeover"` | `"beside"` | none) that draws a trailing icon (↗ `open_in_new`-style vs a two-column icon), visible on hover and always on touch.
2. Wire it where the two behaviours already exist: links away (takeover) and sub-cards opening in the next column (beside, ux/Card).
3. One line in the navigation skill: the two launch icons and what each promises.
4. A small demo on the ui/item page; screenshots at 400 and 1920.

Model: Sonnet. Budget $5. Queued (usage over pace).
