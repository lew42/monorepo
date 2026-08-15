# ext/Panel

Chrome for arranging. A **panel** divides, moves, fills, hugs, nests and hosts —
one `Item` subclass, one recursive view, and the persistence, drag and control
stacks that already existed.

```js
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Anything"); p("…in one managed panel."); });   // no saver
panel("clock");                                 // …or any name in the T vocabulary
workspace();                                    // the persisted document
workspace({ saver, templates, seed });          // yours: own file, own T vocabulary
```

## Section vs panel

A **section** is a full-width band of a real page — content, with its own
internal measure and tone. A **panel** is chrome for arranging and exploring: it
can host any section (or experience), frame it, align it, retint it, split
beside it. **Sections are what you ship; panels are how you wireframe.** The `T`
menu is the seam: every section band is available *inside* a panel, and nothing
about the band knows it is in one.

## The shape

- `Panel.js` — `class Panel extends Item`. Items → a split (`data.dir`);
  no items → a leaf that renders `data.template`. Two verbs, `divide()` and
  `close()`; structure changes no other way.
- `workspace.js` — the doors: `panel(seed)` (default export — a draw function, or a
  `T` name, which is the only shape whose bar tells the truth about what it shows),
  `workspace(options)`
  (`saver`, `templates`, `seed` — the registry rides the root Panel, never
  serialized), the recursive view, the bar, `scatter()`.
- `PanelDrag.js` — `PanelDrag extends Sortable`, the grip, `coalesce()`.
- `panel.css` — structure only. **`templates.css` is the sanctioned exception**:
  a template's look *is* its payload, so it ships one.
- `templates.js` — `name → { icon, tone?, draw($body, panel) }`. `draw` runs with
  the captor already on `$body`.

`data` keys: `dir`, `template`, `align`, `tone`, `mode`, `grow`. Nothing else is
persisted — instance state (`parent`, `saver`, `draw`) never serializes.

## Three things that will bite you

- **`Panel.js` and `panel.js` can't coexist on Windows in the same directory** —
  case-insensitive NTFS folds the two into one file, and the 2026-08-14 rename
  proved it live (the old `panel.js` widget file was destroyed mid-rename). The
  split into `workspace.js` + `PanelDrag.js` below is the permanent fix.
- **The drag handle is the grip, never the bar.** A bar-wide handle makes
  `pointerdown` on every button start a drag, and `grab()`'s `preventDefault`
  eats the click that was meant for it.
- **`container-type: size` needs a box its content does not decide.** On a
  `hug` panel — sized by its own content — it collapses the body to nothing, so
  hugging panels get `inline-size` instead.

---

## Record

### Should `divide` have a second "add a column" verb?

**Options.** (a) `divide(dir)` plus `append(dir)`. (b) One verb that reads its
parent.

**Verdict: (b).** `divide(dir)` asks whether my parent already runs that way — if
it does I get a sibling, if it doesn't I become the split. Clicking the same icon
twice therefore gives three columns with no second concept, and drag-to-edge
reuses the identical call with `made` and `before` supplied. Mike's "clicking a
second time adds another column" is not a feature; it is what one honest verb
already does.

### Where do the defaults live?

**Options.** (a) Stamp them into `data` in the constructor, the way
`blocks.js` does with `words`. (b) A static `Panel.defaults` read by an
overridden `get()`.

**Verdict: (b).** (a) writes six keys into every node of the envelope, so a
five-panel workspace serializes thirty values nobody chose, and changing a
default later cannot reach documents already on disk. The override is one line
and keeps `toJSON()` down to what a person actually picked. Cost: `get()` never
returns `undefined` for a known key, so "unset" is only visible as
`item.data.x`. Nothing needs that today.

### `"random"` — a template, or a verb?

**Verdict: a verb, and it commits.** `scatter()` rolls a `dir`, two or three
children and a concrete template per leaf, then **writes them to `data`** — so a
reload comes back to the same arrangement rather than a fresh roll. Re-picking
`random` from `T` re-rolls. Bounded at two levels and three ways (nine leaves
worst case).

⚠ **`Panel.defaults.template` is `"blank"`, not `"random"`** — against the
ruling, and measured. `divide()` hands its new sibling a fresh `Panel`, so a
default of `"random"` made every split roll a random sub-arrangement: one click
on split-V produced three nested columns. `"random"` is what *seeding* and the
`T` menu ask for, and both ask explicitly.

⚠ Rolling mutates the tree, and a mutation *during* a render rebuilds the DOM
under the live captor. So `mount()` resolves any leaf still carrying
`template: "random"` — a hand-written document, now — in a pre-pass, behind a
re-entrancy flag, **before** `$root.empty()` runs.

**Open:** "intelligent" fill — reading the panel's real size and picking a
template that suits it — is deliberately not built. `scatter()` runs before any
element exists, so it has nothing to measure; a size-aware roll wants a second
pass after layout, and that is a design, not a tweak.

### Drop inside, and what it cost

`locate()` resolves the innermost registered container under the cursor. A leaf
is not a container, so the *enclosing split* answers every drop over a leaf —
which means an edge zone tested after `locate()` can never fire. **Edge is
therefore tested first**, and only inside the outer fifth of a leaf's body; the
middle three fifths still fall through to reorder / move-across. That inverts the
brief's stated priority and preserves its intent.

The preview is Sortable's own placeholder, absolutely positioned into the zone —
`.panel-body` establishes containment, so the zone needs no element and no
colour of its own.

### Why the layout bar sits in the corner and not in the flow

`layout.bar($body)` is attached per panel body (Mike's UX test). It is floated
into the panel's bottom-inline-end corner rather than given a row, because a
panel can be split down to a few ems and a strip in the flow is height the
content does not get. The drawer it opens is still **one per document** and still
pushes the whole app — the 2026-08-12 verdict against panel-level reuse stands;
what is reused here is the bar, and the controls (`pick`, `menu`, `btn`) directly.

### Kept, with dissent

- **The tone menu is always on a leaf's bar**, not only when
  `templates[name].tone` is set. Making it conditional means repainting the bar
  from inside a `<select>`'s own change handler — destroying the element whose
  event is running. A tone that no template reads is inert; a bar that deletes
  its own control mid-event is a bug waiting for a reader.
- **The 3×3 picker is `pick()` in a three-column popover**, showing the codes
  (`tl` … `br`) rather than nine dots. It is `ext/layout`'s control, unmodified,
  and the code is the data.
- **`coalesce()` is five lines lifted from `ext/demo/stage.js`, not imported.**
  A widget has no business depending on the demo chrome; the alternative was an
  import that drags `stage.css` and the whole stage module behind it.

### Open for Mike

- **Two live workspaces on one file.** `/framework/ext/Panel/` and its `/full/`
  route each `Item.open()` the same path, and `Page` caches views — so after
  visiting both, two documents are mounted and the last writer wins. The editor
  has the same property. A shared-document registry is the fix if it ever bites.
- **`mode: "hug"`** is in `data` and on the bar, but nothing yet *needs* it: the
  interesting case is a panel that hugs a section band's natural height inside a
  filling row. Worth a demo before it earns its keep.
- **Resolved 2026-08-14:** `panel.js` was over the 100-line rule (205 lines, six
  responsibilities: the door, the workspace, the view, the bar, drag/drop and
  the grip). Split into `workspace.js` (the doors, the view, the bar) and
  `PanelDrag.js` (`PanelDrag`, the grip, `coalesce()`) — the same wave that
  capitalized this directory.

### Templates — the T vocabulary

Two families in one object: **fifteen section adapters**, each lazy-importing
`/framework/styles/sections/<name>.js` and rendering `default(tone)`, and
**eight experiences** (`blank word wall clock haze aurora drift depth`) written
for the 3440 story. Icons for the sections are the ones `styles/sections/page.js`
already gives each band, so the T menu and the sections wall read the same.

A lazy import appends **a promise resolving to a function**, never to a view:

```js
$body.append(import(url).then(m => () => m.default(tone)));
```

A section module builds with bare `div.c(...)`, so resolving to the view would
append it to whatever captor the microtask landed on. The function form routes
through `append_fn`, which re-establishes `$body` — which is why there is no
`await` anywhere in the file.

**Three sizing rules, and one of them is a trap this module already hit:**

- **`min-block-size: 100cqh`, not `100%`.** `.panel-body` is a grid of
  `min-content` rows, so a percentage height resolves against the template's own
  content — every scene with no text (`blank`, `aurora`, `drift`, `depth`)
  measured 0px and was invisible in a real panel while passing a standalone
  harness. Corollary: on a `hug` panel `cqh` has no block container and falls
  back to the viewport, so a scene inside a hugging panel is window-height. Hug
  is the opt-out from a fill idea; that is left alone.
- **Every scale is `clamp(floor, cq-expression, ceiling)`**, so a panel body that
  collapses to zero height degrades to a legible floor instead of vanishing.
- **Every radius is `max(N cqmin, M cqw)`.** `cqmin` alone leaves an ultra-wide
  panel with one lit corner and a lot of nothing.

**No `cq` unit appears inside a `@keyframes`** — animations move in `%`,
`opacity` or `perspective-origin`.

`aurora`, `drift` and `depth` paint literal deep colours and are **identical in
light and dark on purpose**: a night sky that inverts with the OS theme is not a
night sky. Their accents still come from `--prim`. Everything else is tokens
only, so it reads in both schemes for free. `tone: true` marks the sixteen
entries that read `panel.get("tone")` — `haze` and the fifteen sections.

Notes, dissents and the open questions: `framework/ai/2026-08-13/panel/templates.md`.
