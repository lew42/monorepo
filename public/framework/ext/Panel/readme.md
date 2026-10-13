# Panel — chrome for arranging: divide, drag, align, fill and persist regions

Designed for wireframing layouts and composition. Every panel is a plain `Item` (`items` a `List`), inheriting undo and persistence for free.

## Index

- [`Workspace`](./Workspace/) — Holds a Panel root with documents as files and controls above it.
- [`playground`](./playground/) — Displays one document full-window, with the drawer as a responsive handle.

## Use

```js
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Title"); p("Content in managed panel"); });
workspace({ mode: "document" });                // scrolling stack of sections
item.set("display", "grid").set("cols", 3);     // layout properties in rail
```

## Core concepts

- **Rail-first controls**: All property words and verbs live in the right rail; floating bars are eliminated · [`doc/decisions.md`](./doc/decisions.md).
- **Single selection**: One panel or item selected per page, ringed with `.panel-ring` (`focus.js`) · [`doc/focus.md`](./doc/focus.md).
- **Flow replay**: Every gesture is a step that can be scrubbed and replayed (`flow.js`) · [`doc/flow.md`](./doc/flow.md).
- **Sizing math**: Panels resolve via `--panel-tracks`, hug, or fixed grow ratios (`size.js`) · [`doc/sizing.md`](./doc/sizing.md).

## Files that matter

- `Panel.js`: Verbs, restyling, and defaults.
- `workspace.js`: Document lifecycle, redraw, and recursive `view()`.
- `properties.js`: Right-rail property pickers and verbs.
- `templates.js`: Template vocabulary (`T` definitions).
- `focus.js`: Single-selection tracking and hover preview.

## Doc topics

- [`doc/decisions.md`](./doc/decisions.md) — Architecture history, bar deletion, and operational traps.
- [`doc/focus.md`](./doc/focus.md) — Selection contract, hover previews, and multi-edit design.
- [`doc/words.md`](./doc/words.md) — The `WORDS` table, tracks, and layout tokens.
- [`doc/sizing.md`](./doc/sizing.md) — Fill, hug, and fixed sizing rules.
- [`doc/flow.md`](./doc/flow.md) — Snapshot history, scrubber, and step cost.
- [`doc/generator.md`](./doc/generator.md) — Generative layouts from seeds.
- [`doc/overlays.md`](./doc/overlays.md) — Surface z-indexes and event disposers.

- Notes: [doc/glyphs-notes.md](doc/glyphs-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/text-notes.md](doc/text-notes.md) — history and lessons moved out of the code comments.
