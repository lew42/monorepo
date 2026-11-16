# Card vs Section: one switch (experiment, 2026-11-16)

**The question:** can one frame switch between *Card mode* (white cards with gap and radius on a ground) and *Section mode* (flush, full-height columns) without a rebuild?

**Answer: yes, with one variable mode.** Page [Card vs Section](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=100-9441) in Lew42 v2, right after Columns, shows a 2-column and a 3-column layout in both modes and a nested one (a Section screen whose main column sets Card on itself).

## How it works

A new collection, `Lew42 v2 · Surface (experiment)`, modes **Card** (default) and **Section**. Each variable aliases an existing token in Card mode:

| Variable | Bound to | Card | Section |
|---|---|---|---|
| `surface-gap` | the layout's gap | Scale `gap` | 1 (a hairline) |
| `surface-inset` | the layout's padding | Scale `gap` | 0 |
| `surface-radius` | each card's corners | Scale `radius` | 0 |
| `surface-ground` | the layout's fill | Colors `light` | black 12% (static) |

The card's fill stays Scheme `surface` and its padding stays Scale `pad-x`/`pad-y` in both modes, so no fill variable was needed. Set the Surface mode on the layout (a region); cards stay on Auto and follow, like Scale. The nearest mode wins, so a Section page can hold a Card-mode region.

## Decisions and alternatives

- **Section gap is 1, not 0.** With 0 the white columns merge into one slab. The alternative is 0 with each column told apart by its own Scheme (White sidebar, Light gray main); that needs no hairline, but then Card mode needs the cards' Scheme flipped back.
- **The demo rebinds radius on each Card instance** (the Card master `34:478` still binds Scale `radius`), so nothing else in the file changes. Adopting it means binding the master's radius to `surface-radius`; Card is the default mode, so every existing card looks the same.

- **Name proposal, not applied:** rename `surface-inset` to `layout-padding`. "Padding" is the word Figma uses, and "layout" says whose padding it is (the layout's, not the card's). `surface-padding` keeps the family prefix but reads like the card's own padding. The owner decides.

The page opens by naming the collection, its modes and where to set the mode. Its "The system" section has a token table (variable, what it controls, Card, Section, why), where every value is a live shape bound to the variable, plus two rows for the collections that stay the same in both modes (Scale `pad-x`/`pad-y`, Scheme `surface`; documented on the Scale page and in the AI page's Tokens frame).

## What a mode cannot switch

Layout direction, Hug vs Fill sizing, and the column count can't bind to variables. So both modes use Fill-height columns, and stacking at mobile width is still a separate frame.
