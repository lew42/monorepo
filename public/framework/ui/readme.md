# UI — nineteen components in four bands, one page each: three are functions, sixteen are copy-paste markup

## Use
```js
import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");
```
The other sixteen have nothing to import — open the component's page and copy the markup.

## Watch out
- `ui/` loads once via `app.js`, and a css-only component's `page.js` never imports its own `<name>.js` — a twentieth css-only component needs its line in `ui.js` or its page renders unstyled, silently — [doc/decisions.md](./doc/decisions.md)
- A tooltip bubble or a menu panel is out of flow, so any `overflow: hidden` ancestor (a `.demo` box, a stage screen) clips it — [doc/decisions.md](./doc/decisions.md)
- The bands are 5 · 5 · 5 · 4 on purpose: a band is its own `auto-fit` grid, and a band of three draws three thousand-pixel cards at 3440 — [doc/decisions.md](./doc/decisions.md)
- `ui.timeline()` is a static dated list; [`ext/Timeline`](/framework/ext/Timeline/) is the zoomable axis that shares only the English name — [doc/decisions.md](./doc/decisions.md)
- `parts.js` and every `<name>.js` import `core/View/View.js`, never `/app.js` — `app.js` exports `ui`, and that cycle breaks on deep reloads only — [doc/decisions.md](./doc/decisions.md)
- In `page.js`'s `content()`, `this` is the module's Doc, not the Overview section; `this.parent` is the framework landing and nothing throws — [doc/decisions.md](./doc/decisions.md)

## More
- [Overview](/framework/ui/) · [`doc/decisions.md`](./doc/decisions.md) — the bands, the export bar, the 2026-08-12 unification, who uses it, the packed-wall era · [`doc/record.md`](./doc/record.md) — the long per-component ladder and nine findings, from when these lived at `styles/components/` · `doc/method/` (API tab: `table` `timeline` `keys`) · `doc/file/` (Files tab, one per source file)
- Surfaces — [card](/framework/ui/card/) · [toolbar](/framework/ui/toolbar/) · [panel](/framework/ui/panel/) · [stats](/framework/ui/stats/) · [accordion](/framework/ui/accordion/)
- Data — [table](/framework/ui/table/) · [timeline](/framework/ui/timeline/) · [progress](/framework/ui/progress/) · [pagination](/framework/ui/pagination/) · [crumbs](/framework/ui/crumbs/)
- Forms — [field](/framework/ui/field/) · [dialog](/framework/ui/dialog/) · [tags](/framework/ui/tags/) · [menu](/framework/ui/menu/) · [tooltip](/framework/ui/tooltip/)
- Marks — [badge](/framework/ui/badge/) · [alert](/framework/ui/alert/) · [avatar](/framework/ui/avatar/) · [kbd](/framework/ui/kbd/)
- Files that matter: `ui.js` (three exports, nine side-effect imports) · `parts.js` (`css()`, `component()`, `.ui-pill`) · `page.js` (`BANDS`, the wall)
