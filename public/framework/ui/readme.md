# UI — the template tier: twenty components in four bands, one page each. Three are functions, seventeen are copy-paste markup

No listeners, no state, no lifecycle — that is [`ux/`](/framework/ux/). A component here is
markup you copy, plus a small stylesheet where a rule was about a relationship or a state.

## Use

```js
import { ui } from "/app.js";

ui.table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
ui.keys("Ctrl", "K");
```

The other seventeen have nothing to import — open the component's page and copy the markup.

**Config words** re-skin a whole section without touching a component:

```js
div.c("flex v gap", section).ac("ui-contrast ui-compact");
```

`ui-contrast` remaps the colour tokens, `ui-compact` the space ones; `--density` is the knob
(`.style("--density", "0.7")` is the half step). A word sets custom properties and **nothing
else** — no element selectors, no component classes — which is what makes it cost every
component zero lines. Live, with the toggles: [words](/framework/ui/words/).

**When a component graduates:** something has to be remembered between renders — state, a
listener it installs, a lifecycle. Then it becomes a class in [`ux/`](/framework/ux/) and
usually *splits*, leaving its CSS here. `tree` graduated that way on 2026-08-21 — the class
is [`ux/Tree`](/framework/ux/Tree/), every `.ui-tree-*` rule stayed here, and `ui.tree()`
retired the same day once its last caller moved to the class.

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

## More

- [Overview](/framework/ui/) · [`doc/decisions.md`](./doc/decisions.md) — the bands, the export
  bar, the 2026-08-12 unification, who uses it · [`doc/record.md`](./doc/record.md) — the long
  per-component ladder and nine findings · `doc/method/` (API tab) · `doc/file/` (Files tab)
- Surfaces — [card](/framework/ui/card/) · [toolbar](/framework/ui/toolbar/) · [panel](/framework/ui/panel/) · [stats](/framework/ui/stats/) · [accordion](/framework/ui/accordion/)
- Data — [table](/framework/ui/table/) · [timeline](/framework/ui/timeline/) · [tree](/framework/ui/tree/) · [progress](/framework/ui/progress/) · [pagination](/framework/ui/pagination/) · [crumbs](/framework/ui/crumbs/)
- Forms — [field](/framework/ui/field/) · [dialog](/framework/ui/dialog/) · [tags](/framework/ui/tags/) · [menu](/framework/ui/menu/) · [tooltip](/framework/ui/tooltip/)
- Marks — [badge](/framework/ui/badge/) · [alert](/framework/ui/alert/) · [avatar](/framework/ui/avatar/) · [kbd](/framework/ui/kbd/) · [words](/framework/ui/words/)
- Files that matter: `ui.js` (three exports, eleven side-effect imports) · `parts.js` (`css()`, `component()`, `.ui-pill`) · `page.js` (`BANDS`, the wall) · `words/words.js` (the config words)
- [`skill-suggestions.md`](./skill-suggestions.md) — what a future ui-design skill should carry, from the 2026-08-21 build
