---
name: ui
description: Buttons, toolbars, dropdowns, icons — states and targets. Invoke before building or placing any control the reader presses.
---

Read the readme chain at /framework/design/ui/ (root → design → ui), then its doc/rules.md and
questions.md.

Overview: the glyph is always `icon("name")`, fixed-width, 1em square; frame one only for a
click target, centring or a grid of equal slots; toggle state is `aria-pressed`, never a class;
a widget keeps its core row on one line at every width, with extras on a line underneath; a mode
button shows its mode on its own face.
