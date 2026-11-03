---
name: color
description: Colour and contrast: tokens, ratios, light and dark. Invoke before choosing or setting any colour, background or contrast pair.
---

Read the readme chain at /framework/design/color/ (root → design → color), then its
doc/rules.md and questions.md.

Overview: colour is a token (`--surface`, `--wash`, `--ink`, lighten/darken steps), never a
literal; ratios are 4.5:1 for body text, 3:1 for large text and UI shapes; `--wash` is the page's
own ground, so a card painted with it is invisible; muted text is the `.muted` class, never
`var(--muted)`; dark mode is `light-dark()` on one theme, never a second stylesheet.
