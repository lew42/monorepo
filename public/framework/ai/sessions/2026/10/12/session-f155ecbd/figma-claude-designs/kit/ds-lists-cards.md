# Report: DS · 2.2 Lists & rows, DS · 2.3 Cards & containers

Figma file `QYN0G2URSBHYH5I06MOjxU`, built with `use_figma`, shaped like the `DS · 2.1 Buttons` exemplar (nav, accent code, h1, gist, Specimen tiles, In action phones, dark Rules box).

## Pages built
- `DS · 2.2 Lists & rows` → page `159:17140`, root `159:17142`
- `DS · 2.3 Cards & containers` → page `159:17141`, root `160:17873`

## What is on them
- **2.2**: compact, two-line, meta, trailing-button, hover and selected rows; section header; tree rows nested with Indent and the Current state; edge-to-edge rows vs rows in a padded card, each with an accent guide line showing where the heading edge falls; all of it again on dark; a list in a card on white and on dark.
- **2.3**: padded card, card in card, zero-padding card with full-width sections and hairline dividers, full-bleed band with no radius, panel, dialog, bottom sheet (on a scrim), the same on dark, a dark-in-dark nesting row (step down, step up, down then up, up then down), then three phones: cards on gray, dialog on a dark scrim, sheet pinned to the screen edge.

## Components added or changed
None changed. Only existing kit instances (Row, Tree row, Section header, Button, Card, Panel, Dialog, Specimen) are used.

## Overrides on instances (not on the mains)
- Panel and Dialog mains have an unbound white fill, so on dark specimens their instance fills are rebound to `surface` (text was invisible otherwise). Binding the mains would turn them gray inside a `Light gray BG` container, so I left them: the kit owner may want a variant instead.
- Edge-to-edge rows: instance side padding rebound to `pad-x`, radius removed. Dark "step up" cards: instance fill set to a bare 10% white layer.

## Values no token gives
Hairline divider (black 10%, 1px), 50% scrim, 10% white overlay (all bare paints); the sheet's 16 top radius comes from the Dialog's Sheet variant.

## Still looks off
- The dark dialog phone has no own fill (a bound `surface` fill plus a 50% scrim rendered pure black there; the dark specimen's ground shows through instead).
- Full-bleed band on a white specimen: the 390 sample is white-on-white, so its edges are not visible.
