Layout only for the chat panel — 25 lines, one `@layer theme` block, no
colours of its own. Every look (`--wash`, `--prim`, `--line`, `--surface`,
`--ink`) comes from `framework.css`'s tokens, so the panel is themed for free
in both light and dark.

## The layer statement

`@layer base, theme, site, util;` is restated in full at the top, per the
constraint every stylesheet in this framework carries — a short list here
would silently drop `site` and `util` to the end of the cascade everywhere
else on the site, not just this file.

## What's actually here

Flex columns and gaps for `.chat`/`.chat-list`/`.chat-body`; one
`background-color` distinction between `.chat-turn` (any role) and
`.chat-user` (a tinted mix of `--prim`); a `max-height` + `overflow-y` on the
scrolling history; disabled-state opacity on `.chat-send`. That's the whole
file — no animation, no media query, no dark-mode override, because nothing
here needed one.

## Improvements

Nothing ranked: 25 lines, entirely layout, every colour borrowed from the
framework's own tokens. The one thing worth watching is that a future variant
(a compact mode, a wider chat) stays inside this file rather than growing a
sibling stylesheet — see the readme's note that most files should stay under
100 lines, which this one already respects by a wide margin.
