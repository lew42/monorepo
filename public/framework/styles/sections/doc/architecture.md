# Sections architecture — a band bleeds, the words don't

A section is a layout with real content in it: fifteen bands (hero, pricing, footer…) that compose into a whole page, for anyone assembling a page from parts. Each band is a function `tone => view` in its own file ([`hero.js`](./hero.js) is the canonical one); [`page.js`](./page.js) lists them as inline `children:`, and [`tone.js`](./tone.js) holds `band(tone)` and the tone chips.

## Two divs: the outer bleeds, the inner is the measure
**Decided:** every band is an outer `div.section-band` that takes the full width and the fill, around an inner `div.measure flex v gap` that holds the reading column.
**Why:** one div makes the fill stop at the measure (a strip, not a band); padding-based centring is unreadable and breaks below the measure.
**Instead:** a single div with `max-width`, or `calc((100% - 34em) / 2)` side padding.
**Detail:** [doc/decisions.md](./doc/decisions.md) §2

## The measure is a token set inline on the `.measure` div
**Decided:** a band that wants a card wall sets `--measure` (for example `62em`) inline on the `.measure` div itself.
**Why:** `.measure` declares `--measure`, and a declaration beats an inherited value at any specificity, so a value on the band around it loses.
**Instead:** a `wide_section()` twin (two names for one idea) or a `.wide` class (a stylesheet for one declaration).
**Detail:** [doc/decisions.md](./doc/decisions.md) §2

## No stylesheet, no colour named
**Decided:** `.section-band` is emitted and never styled; every look is the style object `band(tone)`, and nothing here names a colour.
**Why:** a fill, text colour and padding are a look, not layout; a hex value is wrong the moment the theme changes.
**Instead:** a `.css` file per band, which would pin the bands to one palette.
**Detail:** [doc/decisions.md](./doc/decisions.md) §3

## Four tones, the theme's own surfaces
**Decided:** `TONES` is `surface`, `wash`, `prim`, `dark`, mapped to the theme's `--surface`, `--wash`, `--prime` and `--bg`; no two neighbouring bands share a tone.
**Why:** a scale the theme already owns cannot drift from the site, and a theme swap retints every band; two tones repeat visibly, six would need invented tokens.
**Instead:** a bespoke palette per band, or a fifth tone.
**Detail:** [doc/decisions.md](./doc/decisions.md) §3–4

## A coloured band is an always-dark island
**Decided:** `prim` and `dark` bands set `color-scheme: dark` and repaint `color`, and hand `--eyebrow: currentColor` down so accents stay readable.
**Why:** `light-dark()` tokens flip at the element they are used on, so one line flips every token inside; `--prime` text on a `prim` band measures 1.06:1.
**Instead:** inheriting the page's scheme, which darkened buttons on the orange band (3.4:1).
**Detail:** [`tone.js`](./tone.js)
⚠ `decisions.md` §3 and the page text say the dark tone uses `--ink` and inverts in dark mode; the code uses `--bg`, which stays dark in both modes.

## Bands use `flex v gap`, not `flow`
**Decided:** the measure div and card-like parts own their spacing with `gap`.
**Why:** `flow` is page-prose rhythm; inside a band a hero `h1` once carried 96px of top margin.
**Instead:** `.flow` inside bands.
**Detail:** [doc/decisions.md](./doc/decisions.md) §7

## Bands are inline `children:`, with `section:` not `render:`
**Decided:** `page.js` spreads one shared `band` object (`classes`, `preview()`, `content()`) into fifteen inline children, each naming its `section`; `whole()` walks `children` in order.
**Why:** one list gives routing, nav order, titles, icons and a preview card free, with no second registry to disagree; `render()` is `Page`'s own, so a child overwriting it would blank itself.
**Instead:** a `catalogue.js` registry plus `route()`, which re-implemented three things `Page` already does.
**Detail:** [doc/decisions.md](./doc/decisions.md) §5

## No helpers: the band's source is the lesson
**Decided:** there is no `section()`, `eyebrow()` or `cta()`; each band writes the two divs out, and single-use parts (`feature`, `price`, `stat`) are local consts in the one band that calls them.
**Why:** the detail page prints the band's own function, so anything built in another file is a hole in the lesson.
**Instead:** shared helpers in `parts.js` (deleted), or moving them to `ui/`, which would host markup with no logic.
**Detail:** [doc/decisions.md](./doc/decisions.md) §11

## The detail page is `demo.exhibit()` on a bleed stage
**Decided:** a band opens on a draggable `bleed` stage, with the tone chips as panel content on the layout bar and the band's function as the source.
**Why:** the render must touch the window edge to be a band, and the drag handle proves each re-lays-out with no media query; one control surface, not a bar plus a chip row.
**Instead:** a hand-rolled band, bar and source, or source-first ordering that pushes the band below the fold.
**Detail:** [doc/decisions.md](./doc/decisions.md) §8, §11
