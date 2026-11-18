# Lew42 v3: the Scale collection (2026-11-18)

[Lew42 v3](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3) (`JYGQX0WaBO4HcGMZTkL2rx`), collection `Lew42 v3 - Scale`, modes `500 Mobile`, `1000 Default` (the default), `1920 Desktop`. The owner delegated these numbers on 2026-11-18 (voice: a near pixel-perfect Figma-to-browser system, simpler is better, `size/1` = 16 at Default as 1em, a gentle scale instead of doubling).

## The idea in one line

`size/1` is 1em. Every other size is a multiple of it, rounded to a whole pixel, and padding, gaps and text sizes point at those steps. One mode switch changes all of them together.

## The numbers

Base (`size/1`): **14 on Mobile, 16 on Default, 20 on Desktop.** Each step is `round(base × step)` (half rounds up).

| Token | Rule | Mobile 500 | Default 1000 | Desktop 1920 |
|---|---|---|---|---|
| size/0-5 | 0.5 × size/1 | 7 | 8 | 10 |
| size/0-75 *(new)* | 0.75 × size/1 | 11 | 12 | 15 |
| size/1 | 1em | 14 | 16 | 20 |
| size/1-5 | 1.5 × size/1 | 21 | 24 | 30 |
| size/2 | 2 × size/1 | 28 | 32 | 40 |
| size/3 | 3 × size/1 | 42 | 48 | 60 |
| size/4 *(new)* | 4 × size/1 | 56 | 64 | 80 |
| pad | = size/2 | 28 | 32 | 40 |
| gap | = size/2 | 28 | 32 | 40 |
| text-gap | = size/1 | 14 | 16 | 20 |
| h1 | = size/3 | 42 | 48 | 60 |
| h2 | = size/2 | 28 | 32 | 40 |
| h3 | = size/1-5 | 21 | 24 | 30 |
| h4 | = size/0-75 *(newly bound)* | 11 | 12 | 15 |
| body | = size/1 | 14 | 16 | 20 |
| label | = size/1 *(newly bound)* | 14 | 16 | 20 |
| small | = size/0-75 *(newly bound)* | 11 | 12 | 15 |
| code | fixed, not scaled | 14 | 14 | 14 |
| width | per mode | 500 | 1000 | 1920 |
| column-min-width | per mode | 250 | 500 | 1000 |

**Why these:** 14 / 16 / 20 is gentle (−12.5% / +25%) and leans larger on desktop because 1920 is much further from 1000 than 500 is. Default is a clean 4 px rhythm (8, 12, 16, 24, 32, 48, 64); desktop is mostly on it (20, 40, 60, 80). The aliases the owner had already set (pad, gap, text-gap, h1, h2, h3, body) were kept as they were; only the step values changed. **Alternatives:** Desktop 18 (9, 14, 18, 27, 36, 54, 72) if 20 reads too big; h4 at `size/1` (16) if 12 px kickers feel small; `code` bound to `size/0-75` if it should scale. Each is a one-value change.

**Owner's edits after this (2026-11-18, by hand):** pad = size/3 / size/4 / size/4 (Mobile / Default / Desktop: 42 / 64 / 80), gap on Desktop = size/3 (60), text-gap on Desktop = size/1-5 (30). The table above is the delegated first pass; these aliases are his and now win. He also added `lighten` and `darken` to Color Mode.

## How to use it

1. Set the Scale mode on the frame that decides the size: a page column, a section, or a single card.
2. Everything inside inherits it (padding, gaps, text sizes, the Button inside the card). Unset means inherit from the parent; set means locked for everything inside.
3. Masters set no Scale mode, so an instance takes the mode of wherever it is dropped. Setting the mode on one card is fine: that card and its contents adapt, the cards around it do not.

## What is in the file (Scale page `1:6`)

The owner's Card (`2:110`) and Button (`2:130`), with his Wrappers at 500 (`2:104`), 1000 (`12:199`) and 1920 (`11:169`), in Light and Dark. A frame `Scale · How it works` (`8:13`: the table and a sample card at three modes) was built on 2026-11-18, and the owner removed it the same day while reworking the page; this doc keeps the table.

## Before (read 2026-11-18, before any change)

Scale was doubling per mode:

| Token | Mobile | Default | Desktop |
|---|---|---|---|
| size/0-5 | 8 | 16 | 32 |
| size/1 | 16 | 32 | 64 |
| size/1-5 | 24 | 48 | 96 |
| size/2 | 32 | 64 | 128 |
| size/3 | 48 | 96 | 192 |
| pad, gap | = size/2 | = size/2 | = size/2 |
| text-gap | = size/1 | = size/1 | = size/1 |
| width | 500 | 1000 | 1920 |
| column-min-width | 250 | 500 | 1000 |

Text styles before: h1 Montserrat Black = size/3 (96 at Default), h2 Bold = size/2 (64), h3 SemiBold = size/1-5 (48), body Medium = size/1 (32); unbound: h4 Bold 14 (caps, 7% tracking), label Bold 16 (line height 24 px), small SemiBold 12, code JetBrains Mono 14. Line heights and tracking were not changed.

Other collections, unchanged: `Lew42 v3 - Colors` (one mode: prime, light, dark, error, ok, warn, master, tint), `Lew42 v3 - Color Mode` (Light / Dark: text, muted, fill, accent, on-accent), `Lew42 v3 - Constants` (squeeze 1600). **Note on `muted`:** the brief said `muted` currently equals `text`. Read on 2026-11-18 it does not: Light `text` is black 80%, `muted` black 55%; Dark `text` white 100%, `muted` white 70%. They may look alike on screen at those opacities; worth a check by eye.

Effect on the owner's own nodes: his `Card` (`2:110`) and `Button` (`2:130`) bind pad, gap and text sizes, so they shrank by half with the new values (Card padding 64 → 32 at Default). Nothing was moved or deleted.
