# Page — design record

## `.cols` — deleted

`Page.css` defined `.cols` — equal drill-down columns, the whole of what
`ColumnPager` used to do. This section previously said:

> Kept rather than deleted because it is four lines… **If it is still unclaimed
> next time someone reads this file, delete it** — an unused rule that survives
> two readings is a rule nobody is going to claim.

It was still unclaimed. Deleted, per its own instruction.

The reasoning that produced it is worth keeping, because the question recurs:
columns are **jumpy**. Adding one reflows every column already on screen, so the
thing you are reading slides sideways while you read it. Replace, plus an
adaptive sidebar, gives the same navigation with nothing shifting.

One detail to carry forward if a drill-down is ever rebuilt: use
`minmax(0, 1fr)`, never bare `1fr`. `1fr` means `minmax(AUTO, 1fr)`, and that
auto floor is the item's min-content — so one long `<pre>` refuses to shrink and
pushes the page past the viewport.

**A pre-committed deletion works.** Writing "delete this if it's still here"
turned a judgement call into a mechanical one, and it survived a rewrite that
invalidated most of the prose around it. Worth reusing on anything speculative.

## `paper` is opt-in, and so is `papers`

`paper` is a look — a white box, a measure, a centred column. The framework
does not decide that, so there is no default. Two ways to ask for it:

```js
classes: "paper"                      // this page
this.$pages = div.c("pages papers")   // every page in this region
```

The second is a class on the *container*, governing its children — the cheaper
shape whenever a whole region wants the same thing.

**Rejected: default to paper, opt out with `full`.** `full` already means
`position: fixed; inset: 0`. Making it also mean "no measure" gives one word two
independent meanings, so you could never ask for full-bleed-without-fixed — the
same one-property-one-winner problem that deleting `mode` removed. A site that
wants paper everywhere should say so in its own stylesheet.

## Overriding `render()`

A topic page that is a *layout* rather than a content page builds its own
wrapper. Three things an override owes, all of them silent when missed:

1. **Set `this.view`.** `activate()` appends `this.view`, not the return value.
2. **Carry `.page`.** The visibility contract only governs that class, so a
   wrapper without it stays on screen on every route.
3. **Never nest a second `.page` inside**, or the inner one is `display: none`.

The root page hit 1 and 2 together during the migration: its `.home` wrapper sat
pinned to the left of every url on the site.
