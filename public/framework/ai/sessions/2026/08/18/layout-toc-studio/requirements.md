# Toc studio — Minion D, Figma wave 2

Verbatim brief: `public/framework/ai/2026-08-18/figma/minion.md` +
`public/framework/ai/2026-08-18/figma/wave-2.md` (Minion D section) +
`public/framework/ai/2026-08-18/figma/requirements.md` (owner's standing rules).

Design given: https://www.figma.com/design/0rZv3Z6Hnqkxa2UQJ5xOOG/July-2026?node-id=163-615,
children named `tabbed-toc-3440` / `-1920` / `-400` — one responsive screen, three widths as
its acceptance test.

**Finding before building anything:** node `163-615` is actually named `miller-columns-*`
(a drill-down browser, unrelated). The real `tabbed-toc-*` frames live at node `163-616` —
confirmed by metadata (matches the brief's own description exactly: top category tabs, a
right-hand "On This Page" / "Sections" rail with a current marker, footer prev/next). `163-614`
is `sidebar-preview-*` (Minion C's actual node, brief said `163-613`). Both minions' node-ids
are off by one from the live file. Built against `163-616`.

Task: `ext/tabs/` and `ext/toc/` both already exist and are real, documented modules. Read
them first. If this design is mostly things we already have, the deliverable is a
demonstration that composes them, plus whatever the Figma genuinely adds — not a
reimplementation. State which parts already existed.
