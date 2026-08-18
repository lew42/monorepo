## vocab.js

What a document was **opened with** — the `T` vocabulary its menus offer, and
which tool surfaces its panels draw. Both ride the **root panel** as instance
properties, written once by `workspace({ templates, tools })` and never
serialized, so two workspaces on one page disagree freely and neither leaks into
the other.

```js vocab.js
export const vocab = item => item.root().templates ?? templates;
export const standard = item => vocab(item) === templates;
```

Resolved on every read by walking up to the root, rather than copied onto every
node — which is why `ext/editor`'s five regions never reach another page's `T`
menu, and why nothing has to be re-stamped when a panel moves.

## `standard()` — the two things only the site's own vocabulary gets

`offer(item)` prepends `random` to the names the `T` menu lists, and `view()`
hands the bar a `sow` verb, only when the vocabulary is this module's own
`templates.js`. ⚠ Both would be wrong for a caller's: `random` would give an
editor a second canvas, and `sow` draws a layout out of section bands the
editor's regions are not.

## `tools(item)` — one key per surface, resolved not read

```js vocab.js
const DEFAULTS = { align: …, zoom: …, inspect: …, edges: …, insert: …, text: …, display: …, repeat: … };
export const tools = item => ({ ...DEFAULTS, ...item.root().tools });
```

Each surface module still exports its own flag (`TOOLS`, `SPLIT`, `TEXT`,
`INSERT`, `REPEAT`, `DISPLAY`) — but only as the default this spread reads. The
live answer comes from here, so a workspace naming **one** flag still gets the
module defaults for the other seven: `ext/editor` turns seven off and says
nothing about `repeat`, which stays on.

⚠ Every surface is gated at its **one** call site from this resolver — the four
body overlays in `overlays.js`, `edges`/`insert`/`zoom` in `view()`. A surface
that read its own module global instead would ignore the workspace it is in.

## Imports flow one way

This file reads `templates.js` and each surface module's flag; nothing in the
module reads it back except its four consumers (`workspace.js`, `focus.js`,
`overlays.js`, `paint.js`). It is the bottom of that graph, which is what keeps
the vocabulary reachable from a leaf without anyone importing `workspace.js`.
