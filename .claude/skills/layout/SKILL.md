---
name: layout
description: Invoke before building or restyling anything with a size — a page, a container, a card, a grid, a dashboard — and again when a page looks cramped, squeezed, or wastes the screen. Reference; re-invoke when stale.
---

Read the readme chain at /framework/design/layout/ (root → design → layout), then its
doc/rules.md, doc/caveats.md and questions.md.

Overview: choose the layout first (C1–C5: room, content, outline, fill, which approved layout);
then five sizing questions (container, size at 400/1200/1920/3440, its own layout, how many
containers, its preview); spacing is one knob (`--pad` `--gap` `--flow`), never a constant; a
region takes `.pad`, a framed box `.card`, a control its own `em`; screenshot at four widths
before you merge.
