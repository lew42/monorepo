The resize edge's look: a 12px hover strip inside the rail's inline start, a
line that lights on hover, and a pill that rides the pointer's Y. No permanent
handle — everything here is `opacity: 0` until a hover or drag class says
otherwise.

## Wholly inside the rail, because the page's scrollbar owns the other side

```css
.dev-grip { inset-inline-start: 0; width: 0.75rem; }   /* no transform */
```

`.pages` is `overflow-y: scroll` (`Page.css`) — the region *always* reserves a
scroll gutter, and that gutter sits flush against `.app`'s content edge, which
is exactly where the rail begins. There is no room on the page side at all: any
overhang lands on the scrollbar, and `grip.js` calls `setPointerCapture` on
`pointerdown`, so it does not merely sit there — it swallows the whole scroll
drag.

It did, from the day the grip shipped until 2026-08-16. The strip was
`--dev-grip: 2rem` centred on the edge with `translateX(-50%)`, and on a 2706
window with a 760 rail it measured 1931→1963 against a gutter of 1931→1946:
`elementFromPoint` returned `dev-grip` for **every pixel of the scrollbar**.
Nothing threw, and `opacity: 0` meant there was nothing to see — the scrollbar
was simply dead, and reported as such.

`0.75rem` is the dead strip the rail already has: a 1px `border-inline-start`
plus the `0.9em` (11.52px) `padding-inline-start` that `.dev-head`,
`.dev-tabs` and `.dev-body` all carry. So the target covers no content of its
own and no rule elsewhere had to move. The trade, recorded: a 12px target
where the straddle offered 32.

Two things fall out of not straddling. `devbar.css` hides the rail with a plain
`translateX(100%)` again — the `+ var(--dev-grip)` term existed only to clear
the overhanging half, and the token itself is gone, so the two files can no
longer disagree about a number they no longer share. And the lit line moved
from the strip's centre to `inset-inline-start: 0`, so it draws on the rail's
own border rather than floating 6px inside it.

## Why a hue, not `--subtle`

```css
.dev-grip-pill { background: var(--prim); }
```

Historically because the pill straddled the boundary and `--subtle`
(translucent white) was invisible on its page-side half. That half is gone —
the pill now sits entirely on the rail's dark surface, where `--subtle` would
read — but `--prim` stays, because it is the rail's one affordance colour:
the same hue as the lit line beside it, `.dev-tab.on` and `.dev-size.on`.

## `rem`, never `em` — sized against the wrong ancestor once

The comment at the top of the file names the bug directly: the rail's text is
`0.8rem`, so a pill sized in `em` measured `3.2 × 12.8` instead of the
intended `4 × 16`. Every dimension in this file is `rem` for that reason.

## `--rail-ease` rather than naming `.app`

```css
html.dev-sizing { --rail-ease: 0s; }
```

`.app`'s push transition (`framework.css`) reads this token. A drag writes
the rail's width every pointer-move frame; if the push stayed eased, the page
would visibly trail the pointer by the transition's `0.18s`. The token is the
seam — this file never names `.app` directly, and `framework.css` never
names `.dev-grip`.

## Improvements

*None found.* Twenty lines doing one job, each rule a direct answer to a
named bug (see the file's own comments). Nothing here is speculative.
