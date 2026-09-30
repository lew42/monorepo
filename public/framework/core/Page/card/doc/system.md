# The card system — which card, when

## A card is a mini page — the owner's decision

**The owner's decision (2026-09-29, about 8:40 PM), settled, not provisional:** a card is a
tiny page and does not need a directory of its own. Its data is one line in the nearest
`page.jsonl` that already exists, and its url is a VIRTUAL route through that parent's own
`route()` method — a folder gets made only once a card outgrows a single line. `mini-pages/`
is the worked example: `MiniPages.js` adds one new page.jsonl verb, `card(data)`, and one
`route(name)` that answers any slug the lines named. Nothing on disk under `mini-pages/` is a
folder per card — see [`doc/inventory.md`](inventory.md)'s note on reuse, and the live page
itself.

One table: pick a ground, a nesting depth, a header pattern and a size. Every row reuses
a class or token `framework.css` already has; `card.css` only adds the handful nothing
else in the site had a word for yet.

## Grounds — which background

| Ground | Class | Token | Use it when |
|---|---|---|---|
| Default | `.card` | `var(--surface)` | almost always — the ground every other card in the inventory already uses |
| Light gray | `.card.card-gray` | `var(--darken-1)` | a quieter card beside a default one, or a default card nested inside a default card (done for you automatically — see Nesting grounds below) |
| Dark | `.card.card-dark` | `var(--bg)` | a card that wants to read as "console" or "raw data", regardless of the page's own light/dark mode |
| Strong hue | `.card.card-prim` | `var(--prim)` | one card that must be the loudest thing on the page — a call to action, a selected state's home card. Never more than one at a time; it stops meaning "important" the moment two exist |

`.card-gray` started as `var(--wash)`, but `--wash` is also this theme's own page
background — a `.card-gray` sitting straight on the page, not nested inside another
card, painted nothing (2026-09-30 review). `--darken-1` is framework.css's alpha-based
darken step (black at low opacity in light mode, white at low opacity in dark mode), so
it reads as a visible step darker than whatever is underneath it — the page, a white
card, or a card nested inside another card — instead of matching one specific ground.

**Nesting grounds, automatically.** A plain `.card` (no ground class of its own)
sitting directly inside another plain `.card` would be invisible — surface-on-surface.
`card.css` switches it for you: default-in-default becomes light-gray, light-gray-in-anything
becomes default. A card given `.card-dark` or `.card-prim` on purpose keeps it, because those
two already read against anything (see `grounds/page.js`'s live demo). This generalizes the
rule `ux/Content/content.css:181-183` already stated for icon cards: "a section with a
background is the white ground, its child cards switch to wash so nesting still reads."

**Contrast, both modes.** Nothing here is a fixed colour — `--surface`, `--darken-1`, `--bg` and
`--prim` all resolve relative to the page's own mode already, and `.card-dark`/`.card-prim` each
force a `color-scheme` (the same one-line "always-dark/light island" mechanism
`styles/sections/tone.js` uses), so `--ink` flips underneath them too, regardless of which mode
the page itself is in. `--bg` (a dark surface) forces `color-scheme: dark` so `--ink` resolves
light. `--prim` — `#FF6157` in framework.css, but this theme overrides it to `#FF8F60`, a
mid-bright orange, and that rendered colour is the one that counts — is the one ground where the
obvious answer is wrong: light ink on `--prim` measures about 2.5:1, below the 4.5:1 floor, so
`.card-prim` forces `color-scheme: light` instead — `--ink` resolves to its dark value there,
which measures 4.69:1 on `--prim` in both page modes (`getComputedStyle`, text rgb(63,63,63) on
background rgb(255,143,96), 2026-09-30 review-fix). That passes but not by much — anyone darkening
`--prim` later should re-measure this pair before shipping it.

## Nesting — how deep

| Level | Box? | How |
|---|---|---|
| 1 | Yes | `.card` |
| 2 | Yes | `.card` |
| 3 | Yes | `.card` — the last box |
| 4 | No | a plain heading, no wrapper class needed for the look, `.card-level-4` only for the small vertical gap above it |
| 5+ | No, quieter | `.card-level-5` dims the text with `color: var(--subtle)`; a real tree would keep adding levels the same way, capped in the demo at 5 because a reader's eye glazes past that many nested sections anyway |

**Depth is set in JS, not CSS.** `nesting/page.js`'s `level(n, …)` function decides
`boxed = n <= BOXED_LEVELS` itself and writes the class — `card-level-${n}` — onto the element
it draws. A pure CSS answer (something like `.card .card .card .card`, one more `.card` per
level) was considered and rejected: it cannot express "level 4 and DEEPER", only "exactly level
4", so a 6-level tree would need a hand-written selector for level 6 that nobody would remember
to add. `card/log/LogView.js` makes the identical call for a log group, from the same
`BOXED_LEVELS` constant (`card/depth.js`) — the two used to disagree (log boxed only 2 levels,
found and fixed 2026-09-30) and now can't drift apart again, because there is only one number to
change.

## Title, header and menu patterns

| Pattern | Markup | Use it when |
|---|---|---|
| None | `.card` alone | the content speaks for itself — a chip, a quiet stat |
| Heading | `.card` + `h3`/`h4` | most cards — a page preview, a Decision card |
| Icon + title | `.card-head` with an `icon()` and a `.card-head-title` span | the concept needs to be spotted at a glance (`ux/Content`'s icon cards, page previews) |
| Header bar + `⋯` menu | `.card-head` with an icon, a title, and a `.card-menu-btn` at the end | the card has actions beyond "click it" — AI 2's rail rows are this shape already |
| Clickable | `a.card` (the whole element is the link) | a list of cards that are really links — most of the site's cards already are |
| Expandable | `details.card > summary` | the card holds more than fits — the accordion rows in `ux/Content` already do this |

A card can combine these: `mini-pages/page.jsonl`'s list is icon-free, heading-led, and
clickable all at once — the header row is optional on every axis independently.

## Scale — what content fits

See [`scale/page.js`](../scale/) for the live table; the short version: small holds one line,
default holds a title and a short paragraph, large holds a title, a longer body, and room for
one more thing nested inside it. `.size-small` / `.size-regular` / `.size-large` are
framework.css's own classes — nothing card-specific was added.
