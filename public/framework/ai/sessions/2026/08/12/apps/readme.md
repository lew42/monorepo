# App patterns — design record

Four application shapes as browsable demos: an editor (Figma), a pane system
(Blender), Miller columns, and the rail-vs-wall-vs-columns comparison. Everything
here is assembled from the five blocks — `Page`, the card, the `demo` stage, the
`ext/layout` bar, and the utility words. Nothing new previews, frames or arranges.

~15 lines of CSS across three stylesheets, all of it a layout relationship
(`min-height: 0` at every nesting level, a fixed track, a divider that takes no
space) plus one selection ring, for which no rung of the ladder had an answer.

## Decisions

**Should the properties panel be `ext/layout`'s drawer, or a region of the demo?**

| option | weighing |
|---|---|
| `layout.bar($canvas)` + `layout.context()` — the real right drawer | maximal reuse, zero new code. But the drawer is **one per document**, `position: fixed`, and it PUSHES the whole app over. A Figma demo whose properties panel is the browser's right edge is not showing the pattern it claims to |
| a panel of its own, with its own chips | a second vocabulary for the one thing this site has already decided — exactly what the brief warns against |
| **a region of the demo, drawn from `layout.words` and `controls.js`** | ✓ |

**Verdict: reuse at the control level, not at the panel level.** The editor's right
panel is `layout.words.mode / gap / column / pad` and `chips()` — ext/layout's own
registry, its own knobs, its own `.layout-btn` — drawn into a `flex` column inside
the box. So there is exactly one answer to *"what is a property here"*, and the only
thing copied is where the box sits.

The cost, stated plainly: **`pick`, `chips`, `knob`, `menu` and `btn` are not public.**
Only `layout.words` is. These pages import `ext/layout/controls.js` by url, which
works and is visible, but it reaches past the module's front door. The fix is one
line in `layout.js` — `layout.controls = { pick, menu, toggle, chips, knob, btn }` —
and it is a proposal, not something an example page gets to decide.

**How deep does the tree carry Miller columns?**

| option | weighing |
|---|---|
| a widget holding a `path` array, redrawing columns from `chain()` | shortest, and completely inert — no urls, no crumbs, no Back, and it would not be teaching the framework anything |
| every page in the tree sets `$pages` to the column on its right | ✓ |

**Verdict: `$pages` per page.** `container()` already walks up the parents for the
nearest `$pages`, so a page that hands its child a region *beside itself* gets
Miller columns and nothing else has to change: `demo.app` routes, `nav_for()` draws
the row, `mark()` lights the trail with `aria-current`, and depth becomes horizontal
distance. **Miller columns are `catalog()` applied at every level** — the rail is
`previews()` turned on its side beside one region; this is the same move, recursed.

It is written out rather than calling `catalog()` because the recursion is the
lesson, and because the trail wants rows rather than cards at 12em.

**Variants as child pages, or toggles?** The brief says both, and they resolve into
one rule: **a part that can be absent is a toggle; a capability that can be absent
is a page.** So the editor's two panels are titlebar toggles rather than an
`editor/no-layers/` sibling, and `panes/split/` is a child page — cutting and
closing panes at runtime is not "panes minus something". One child page, four
families, and the four families themselves are the simple-to-complex ordering.

**An interactive demo inside a stage fights the stage.** `demo.stage(fn, steer)`
hands the render to `layout.bar()`, which turns it into a **selectable region**: any
click inside opens the right drawer on whatever was clicked, and any hover dashes
it. That is exactly right for a layout lesson — every band and shape on this site
wants it — and exactly wrong for a widget with controls of its own. The editor's
first version opened *two* properties panels on one chip click.

| option | weighing |
|---|---|
| leave it | the site's designed behaviour, and `styles/sections`' tone chips already live with it. But those chips *change the lesson*; these controls **are** the lesson |
| suppress the container section when `layout.context()` is registered | the black magic the Layout record explicitly refuses — an unrelated call deleting controls |
| **the box stops its own pointer events** (`widget()`, `parts.js`) | ✓ two lines, at the call site, and the bar still steers the render as a whole |

Whether `widget()` belongs in `ext/demo` or `ext/layout` is open. It is two lines
here on purpose: a fourth caller is the signal, not a third.

**Where the lesson lives.** Three of the four pages are
`styles/layouts/detail.js` — the site's existing detail factory, which already
pairs a live card with `demo.exhibit()`. That fixes `def` to the config's `layout`
function and `file` to `page.js`, which is why each family's composition function
sits in its own `page.js` and only the *shared* pieces (`panes.js`, `columns.js`)
are separate modules. Columns is the exception: it is a live tree, so it is
`demo.tree()` with a four-line `content()` override, because `demo.tree` prints its
tree as the lesson and here the tree is filler.

**No child page.js imports its parent's.** `apps/page.js` imports `editor` and
`panes` for its own live demos — downward, which is the blessed direction — and
`navigation/` imports `columns/columns.js`, a plain module, rather than
`columns/page.js`. A child reaching up would break deep reloads only: the parent's
`children:` declaration dynamic-imports the child, and a static import back would
leave `load_all_children()` waiting on a module waiting on it.

## Traps found while building these

- **`flex-1` carries `min-width: 0` and not `min-height: 0`.** Every scrolling pane
  and panel here needed the pair restated at every level of the nesting; it is most
  of the CSS in `panes.css` and `editor.css`.
- **A `flex: 1 1 0` child of a box with no height collapses to nothing.** Both
  chrome components therefore declare their own `height: var(--apps-height, …)`,
  so `editor()` is correct when dropped on any page rather than only inside the
  `detail()` frame that used to set it.
- **The trail scroll has to wait a frame.** `demo.app.go()` appends the new column
  after an `await`, so the click handler's `scrollWidth` is one column short.
- **A hidden `.page-title` is still a sibling.** `.page-title + *` (framework.css)
  was handing every level of the columns trail 1.5 × `--flow`, so each column
  started 45px lower than the one before it. `catalog.css` pays the same bill and
  says so; the fix was copied from it.
- **`demo.tree()`'s card carries no label** — deliberate in a rail of nothing but
  trees, and it reads as a broken card in a wall of labelled ones. `columns/page.js`
  overrides `preview()` back to the standard card with the tree as an inert thumb.

## Open

- The pane dividers are 0.4em. Correct on a pointer, under every touch target
  guideline that exists — the stage's own handle shares the problem.
- `columns()` mutates the tree it is handed (`content`, `classes`, `$pages`). That
  is what an *arrangement* is on this site, and `catalog()` does the same thing to
  `content` and `children`. Worth naming as a pattern if a third one appears.
- The editor's canvas is a `flex`/`grid` arrangement, not a free-position canvas.
  That was deliberate — the properties are then the site's real vocabulary, and a
  free canvas would need `position: absolute` plus x/y/w/h tokens nothing else
  reads — but it does mean the demo is a *layout* editor, not a drawing one.
