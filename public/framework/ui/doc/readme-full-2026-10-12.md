# ui — detail (moved from the readme)

<!-- moved verbatim from readme.md lines 56-71, 2026-10-12 readme audit -->
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

<!-- moved verbatim from readme.md lines 35-43, 2026-10-12 readme audit -->
No listeners, no state, no lifecycle — that is [`ux/`](/framework/ux/). A component here is
markup you copy, plus a small stylesheet where a rule was about a relationship or a state.

**The rule, in one line (the owner, 2026-10-03):** if it's pure HTML and CSS — even when a
function renders that markup, like `table` or `datagrid` here — it's UI, and it doesn't need a
class to exist. The moment something needs JavaScript (a listener, state, a lifecycle), it's
`ux/`. An [`ext/`](/framework/ext/) may bundle several UI and UX pieces into one package —
[`ext/DataGrid`](/framework/ext/DataGrid/) is `datagrid()`'s markup plus the resize/sort/filter
behaviour on top of it, in exactly that shape.
