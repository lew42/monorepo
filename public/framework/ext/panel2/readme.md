# Panel2 — standard shipping UI container: header toolbar, main, footer, and side drawers

A production layout container for shipping interfaces (unlike `ext/Panel` which is for wireframing). Header acts as a toolbar, main holds content, and side panels adapt to sliding drawers on narrow viewports.

## Use

```js
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { button } from "/app.js";

const panel = new Panel2({ title: "Files", start: true, footer: true });
panel.header.append(button("Refresh"));   // toolbar controls
panel.main.append(() => { /* content */ });
panel.start.append(() => { /* sidebar content */ });

// Simple two-way resizable split:
Panel2.split(panelA, panelB, { axis: "x" });
```

## Core concepts

- **Structural slots**: Built with `.Header`, `.Main`, `.Footer`, and `.Side` parts.
- **Adaptive drawers**: Under 34em, side rails automatically become overlay drawers toggled from header buttons · [`doc/decisions.md`](./doc/decisions.md).
- **Two-way splits**: `Panel2.split(a, b)` uses `ext/grip` drag handles for fluid resizes.
- **Preview levels**: Supports inline, card, and detail display scales · [`doc/preview-levels.md`](./doc/preview-levels.md).
- **Multi-panel grid**: Reusable `.panel2-grid` for responsive dashboard walls.

## Files that matter

- `Panel2.js`: Class definition, slot composition, and `split()` helper.
- `panel2.css`: Flex and grid layout rules, breakpoint adaptations, and drawer styling.
- `page.js`: Interactive demo.

## Doc topics

- [`doc/decisions.md`](./doc/decisions.md) — Design trade-offs, split mechanics, and drawer architecture.
- [`doc/preview-levels.md`](./doc/preview-levels.md) — Inline, card, and detail standard.
