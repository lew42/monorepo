# UI — the template tier: twenty components in four bands, one page each. Three are functions, seventeen are copy-paste markup

## Index

Every component here, and what you would use it for. Only `table`, `kbd` and `timeline` are functions; the rest are markup you copy.

- [library](/framework/library/) — browse every component here at full size, with its variants beside it.
- [accordion](./accordion/) — panels where one is open at a time, no JavaScript.
- [alert](./alert/) — a callout box with a coloured left edge.
- [avatar](./avatar/) — a circle holding initials or a photo, and a stacked ring of them.
- [background](./background/) — a div behind your content: colour, pattern, tiled icons or a glow.
- [badge](./badge/) — a small pill label.
- [card](./card/) — the one card page: `.card`, its four grounds and nesting, live; links the other card pages ([card/readme.md](./card/readme.md)).
- [controls](./controls/) — buttons, selects, fields and tabs drawn as one matching box.
- [crumbs](./crumbs/) — the trail of links above a page.
- [datagrid](./datagrid/) — the markup for a data-grid table: a CSS-grid box, a header and a body, no JavaScript needed to render; the resize/sort/filter/windowing behaviour is [`ext/DataGrid`](/framework/ext/DataGrid/).
- [decision](./decision/) — a question, its options as cards, and the chosen one marked.
- [dialog](./dialog/) — a modal popup using the browser's own `<dialog>`.
- [field](./field/) — a label, an input and a hint (no readme yet).
- [kbd](./kbd/) — keyboard-shortcut chips like Ctrl + K.
- [menu](./menu/) — a dropdown menu; for close-on-pick use [`ux/Menu`](/framework/ux/Menu/).
- [pagination](./pagination/) — a row of page buttons (no readme yet).
- [panel](./panel/) — a titled box with a header and close button (no readme yet).
- [progress](./progress/) — progress and meter bars (no readme yet).
- [row](./row/) — one line in a list: padding, gap, a ground on hover (the card plan's `row`).
- [stats](./stats/) — a grid of label-and-number tiles (no readme yet).
- [table](./table/) — a head row and body built from arrays.
- [tags](./tags/) — chips with a remove mark and an input (no readme yet).
- [timeline](./timeline/) — a dated list of events (no readme yet).
- [toolbar](./toolbar/) — a row of buttons and a search box (no readme yet).
- [tooltip](./tooltip/) — a hover bubble, CSS only.
- [tree](./tree/) — icon-and-text rows indented by depth; the behaviour lives in [`ux/Tree`](/framework/ux/Tree/).
- [words](./words/) — `ui-contrast` and `ui-compact`, classes that re-skin a whole section.
- [doc](./doc/) — the tier's written record: [decisions.md](./doc/decisions.md), [record.md](./doc/record.md) (a docs folder, no readme).

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): detail.

## Use

```js
import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");
```

The other seventeen have nothing to import — open the component's page and copy the markup.

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): detail.

## Watch out

- `ui/` loads once via `app.js`, and a css-only component's `page.js` never imports its own
  `<name>.js` — a new one needs its line in `ui.js` or its page renders unstyled, silently.
  `words/words.js` is in that list too — [doc/decisions.md](./doc/decisions.md)
- A word can only **replace** a token, never scale one, so it may only touch a token nothing
  else declares — `--radius` belongs to the theme and was measured, then dropped —
  [`ux/doc/system.md`](/framework/ux/doc/system/)
- `ui.table()` puts a cell straight into a `td`: **no markdown pass**, so a backtick or a
  `**star**` in a cell renders as itself
- A tooltip bubble or a menu panel is out of flow, so any `overflow: hidden` ancestor (a
  `.demo` box, a stage screen) clips it — [doc/decisions.md](./doc/decisions.md)
- The bands are 5 · 6 · 5 · 5 on purpose: a band is its own `auto-fit` grid, and a band of
  three draws three thousand-pixel cards at 3440 — [doc/decisions.md](./doc/decisions.md)
- `ui.timeline()` is a static dated list; [`ext/Timeline`](/framework/ext/Timeline/) is the
  zoomable axis that shares only the English name — [doc/decisions.md](./doc/decisions.md)
- `parts.js` and every `<name>.js` import `core/View/View.js`, never `/app.js` — `app.js`
  exports `ui`, and that cycle breaks on deep reloads only — [doc/decisions.md](./doc/decisions.md)
- In `page.js`'s `content()`, `this` is the module's Doc, not the Overview section;
  `this.parent` is the framework landing and nothing throws — [doc/decisions.md](./doc/decisions.md)
- `.card` is the one framed box (padding, radius, shadow; a card inside a card steps darker) — the spacing rule is region → `.pad`, framed box → `.card`, control or row → its own `em`. The system: [styles/doc/architecture.md](/framework/styles/doc/architecture.md)

## More

- [Overview](/framework/ui/) · [`doc/decisions.md`](./doc/decisions.md) — the bands, the export
  bar, the 2026-08-12 unification, who uses it · [`doc/record.md`](./doc/record.md) — the long
  per-component ladder and nine findings · `doc/method/` (API tab) · `doc/file/` (Files tab)
- Surfaces — [card](/framework/ui/card/) · [toolbar](/framework/ui/toolbar/) · [panel](/framework/ui/panel/) · [stats](/framework/ui/stats/) · [accordion](/framework/ui/accordion/) · [decision](/framework/ui/decision/) — the options as cards, the chosen one marked; used by every task page's Decisions tab
- Data — [table](/framework/ui/table/) · [timeline](/framework/ui/timeline/) · [tree](/framework/ui/tree/) · [progress](/framework/ui/progress/) · [pagination](/framework/ui/pagination/) · [crumbs](/framework/ui/crumbs/)
- Forms — [field](/framework/ui/field/) · [dialog](/framework/ui/dialog/) · [tags](/framework/ui/tags/) · [menu](/framework/ui/menu/) · [tooltip](/framework/ui/tooltip/)
- Marks — [badge](/framework/ui/badge/) · [alert](/framework/ui/alert/) · [avatar](/framework/ui/avatar/) · [kbd](/framework/ui/kbd/) · [words](/framework/ui/words/)
- Files that matter: `ui.js` (three exports, eleven side-effect imports) · `parts.js` (`css()`, `component()`, `.ui-pill`) · `page.js` (`BANDS`, the wall) · `words/words.js` (the config words)
- [`skill-suggestions.md`](./skill-suggestions.md) — what a future ui-design skill should carry, from the 2026-08-21 build

## Also here (readme audit, 2026-10-13)
- [item](./item/) — item — one row: an optional icon, then a name
