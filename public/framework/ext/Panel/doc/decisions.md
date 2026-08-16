# Decisions

The design record for `ext/Panel` — question, what was weighed, verdict. The
readme states each verdict in one line and links here for the reasoning.

## Should `divide` have a second "add a column" verb?

**Options.** (a) `divide(dir)` plus a separate `append(dir)`. (b) One verb that
reads its parent and decides.

**Verdict: (b).** `divide(dir)` asks whether my parent already runs that way —
if it does I get a sibling, if it doesn't I become the split. Clicking the
same icon twice gives three columns with no second concept, and drag-to-edge
reuses the identical call with `made` and `before` supplied. "Clicking a
second time adds another column" is not a feature; it is what one honest verb
already does.

## Where do the defaults live?

**Options.** (a) Stamp them into `data` in the constructor. (b) A static
`Panel.defaults`, read by an overridden `get()`.

**Verdict: (b).** (a) writes six keys into every node, so a five-panel
workspace serializes thirty values nobody chose, and a changed default later
cannot reach documents already on disk. The override is one line and keeps
`toJSON()` down to what a person actually picked. Cost: `get()` never returns
`undefined` for a known key, so "unset" is only visible as `item.data.x`.
Nothing needs that today.

## `"random"` — a template, or a verb?

**Verdict: a verb, and it commits.** `scatter()` rolls a `dir`, two or three
children and a concrete template per leaf, then **writes them to `data`** —
so a reload comes back to the same arrangement rather than a fresh roll.
Re-picking `random` from `T` re-rolls. Bounded at two levels and three ways
(nine leaves worst case).

⚠ **`Panel.defaults.template` is `"blank"`, not `"random"`** — against the
instinct, and measured. `divide()` hands its new sibling a fresh `Panel`, so a
default of `"random"` made every split roll a random sub-arrangement: one
click on split produced three nested columns. `"random"` is what *seeding*
and the `T` menu ask for, and both ask explicitly.

⚠ Rolling mutates the tree, and a mutation *during* a render rebuilds the DOM
under the live captor. So `mount()` (`workspace.js`) resolves any leaf still
carrying `template: "random"` — a hand-written document, now — in a pre-pass,
behind a re-entrancy flag, **before** `$root.empty()` runs.

**Open:** "intelligent" fill — reading a panel's real size and picking a
template that suits it — is deliberately not built. `scatter()` runs before
any element exists, so it has nothing to measure; a size-aware roll wants a
second pass after layout, and that is a design, not a tweak.

## A failed load looked exactly like an absent one

`Item.open(store)` used to resolve `null` (via `Saver.load()`) for both "the
file has never been saved" and "the read failed" — `workspace.js`'s
`fresh = !(loaded instanceof Panel)` read `true` either way, rolled a random
arrangement, and **saved it over the real `/data/panels.json`**. A dev-server
restart mid-fetch was enough to trigger it.

**Options.** (a) Retry inside `workspace()` before giving up. (b) Give
`Saver.load()` a return shape that distinguishes the two, and refuse to seed
on the failure case. (c) Never auto-seed; require an explicit "new workspace"
action.

**Verdict: (b).** `FileSaver.load()` now rejects on anything but a genuine
404 (`ext/Saver`'s `readme.md`, Decisions); `null` still means "absent," but
now for real. `workspace()` adds a `.catch()` alongside its existing `.then()`
— on rejection it renders an inline error and returns without seeding or
mounting anything, so nothing calls `root.save()` over a document it never
actually saw. (a) is still open work (see `ext/Saver`'s "Nothing retries"),
orthogonal to this fix. (c) was rejected — a workspace with no document is
already the normal first-run case, and making that a manual action would
change the tool's whole feel for one failure mode.

## Drop inside, and what it cost

`locate()` (`Draggable`/`Sortable`) resolves the innermost registered
container under the cursor. A leaf is not a container, so the *enclosing
split* answers every drop over a leaf — which means an edge zone tested after
`locate()` can never fire. **Edge is therefore tested first**
(`PanelDrag.edge()`), and only inside the outer fifth of a leaf's body; the
middle three fifths still fall through to reorder / move-across.

The preview is `Sortable`'s own placeholder, absolutely positioned into the
zone — `.panel-body` establishes containment, so the zone needs no element
and no colour of its own.

## Where the bar lives, and which one lights

**Options.** (a) A strip in the flow at the top of every panel. (b) An overlay
pinned over the top of the panel, revealed on hover.

**Verdict: (b).** A panel can be split down to a few ems, and a strip in the
flow is height the content never gets — worse, it changes the content's size
depending on whether the bar is showing. An absolutely positioned bar costs the
body nothing.

The cost is that a panel's bar lands exactly where its first child's bar goes,
and hovering a leaf hovers every ancestor of it — four bars lit in one corner.
So the reveal is `.panel:hover:not(:has(.panel:hover)) > .panel-bar`: an
ancestor stands down for the panel under the pointer, and is reached instead
through the divider it alone owns. `:focus-within` carries the same rule for the
keyboard, and `@media (hover: none)` stands only a leaf's bar up permanently —
a touch screen has no hover to reveal with and no way to point at an ancestor.

⚠ **`pointer-events` moves with the opacity.** A bar at `opacity: 0` still
hit-tests, and in a nest the invisible ancestor swallows the clicks meant for
the child.

## Popovers, not selects

**Verdict: a popover grid, with the column count as one token
(`--panel-cols`).** Template, tone and alignment are all "one of a set", and
opening one closes the others. A vocabulary that ships icons is browsed by
picture, six wide; `ext/editor`'s regions ship none, so those read as names, two
wide — same control, one number different. The bar's template trigger *is* the
current template's icon, so a panel says what it holds without a label.

A `<select>` was the alternative and is why the tone menu is unconditional (see
*Kept, with dissent*): repainting a bar from inside a `<select>`'s own change
handler destroys the element whose event is running.

## A panel narrower than its own bar

**Options.** (a) Let the row wrap to a second line. (b) Scroll the row sideways.
(c) Fold the whole run of verbs behind one button.

**Verdict: (c).** Below 19em of the bar's own em (~236px), `.panel-pop.panel-fold`
stops being `display: contents` and becomes the popover it already is, with one
`more_horiz` standing in for the run. Above that width `display: contents` gives
it no box at all, so its buttons are the bar's own flex items in the same source
order — a wide bar is the row it always was, to the pixel.

(a) is the thing being fixed: a panel splits down to a few ems, and a bar that
wraps is two rows of chrome over content that has none to spare. (b) is
disqualified outright — `overflow-x: auto` computes `overflow-y` to `auto` as
well, and every control in this bar opens an absolutely positioned popover, so a
scrolling row clips every picker out of existence. Before either, the tail simply
clipped: `close` sits after the `.panel-gap` spacer and was the first thing to go.

Only a **leaf** builds a fold — a split's three buttons fit at any width worth
pointing at. ⚠ The fold and an open popover are the same specificity
(`.panel-pop.panel-fold` against `.panel-pop.on`), so source order is the whole
reason the fold wins above the threshold. The `em` in the container query is the
*bar's* em, the scale the row is measured in, so the threshold tracks the row
rather than the document.

## ext/layout's bar is gone from the panel body

Until 2026-08-15 one line in the recursive view attached `layout.bar($body)` to
every leaf. It floated in the bottom-inline-end corner — which the templates
were using — and it brought two things nobody asked a panel for: `region()`
click-selection, and a `.flex`/`.grid` pair in the **util** layer that beat the
panel's own structural rules.

**Verdict: removed, and the dependency with it.** `ext/Panel` now imports
nothing from `ext/layout` — not even `btn()`; `toolbar.js` has its own one-line
`btn`. The drawer remains one-per-document and remains `ext/layout`'s
business. What a panel needs is a *properties* surface, not a selected-element
inspector: see [sidebar
strategy](/framework/ai/2026-08-15/panel-ui-overhaul/doc/sidebar-strategy.md).

## The gap between panels, and what grabs it

**Options.** (a) Keep a real gap (it was `0.35em`) with the divider living in
it. (b) Zero gap, and draw the seam some other way.

**Verdict: (b).** The gap was the last thing between a workspace and a real
editor shell: two panels wearing the same tone read as one only if nothing sits
between them. So `.panel-grip` is zero-width in flow and the seam is a
`box-shadow: 0 0 0 0.5px var(--line)` — a 0.5px spread around a zero-width box
*is* a 1px line, panels sit at a measured 0px, and one declaration draws both
the vertical and the horizontal divider with no axis to branch on.

A 0px target cannot be grabbed, so the grip carries a 1.25rem overlay strip
straddling the seam (`z-index: 2`, so it reaches over the next panel, which
paints later in DOM order) and a pill that rides the pointer along it. The pill
follows on plain `pointermove`, not only during a drag, because one
`setPointerCapture` routes the whole drag back to the same handler either way.

⚠ **The grip sits *under* the bar in z-order** (2 against 3), so a bar stays
clickable where the two cross. The cost is that a grip menu opened in the top
~2em of a seam sits behind the split's own bar.

## Hug and fill at a seam — a new control, or the same one?

**Options.** (a) Give the grip its own sizing model (a stored pixel or percent
split). (b) Reuse `mode`.

**Verdict: (b).** A click on the grip with under 4px of travel opens a menu with
one row per neighbour, marked `←`/`→` (or `↑`/`↓` when the split stacks), and
each button is the same `item.set("mode", …)` the panel's own bar toggles. One
mechanism, no second sizing channel, no override chain to reason about — and the
seam is simply a second place to reach it, which is where a person's hand
already is. Dragging still writes **grow fractions** to both neighbours rather
than pixels, so a resized split keeps its proportions when the window changes.

⚠ The menu is rendered *inside* the grip, so its buttons' `pointerdown` bubbles
to the grip's own handler — and the capture retargets the ensuing `click` to the
grip. Every button in it is silently dead without the explicit
`$pop.el.contains(e.target)` bail.

## Hug — measure the content, or declare an extent?

**Options.** (a) Let a hugging panel measure its content, which is what
shrink-to-fit promises. (b) Declare an extent on the axis the content cannot
answer for.

**Verdict: (b), one token.** `container-type` measures a box as if it were empty,
so a contained body in a shrink-to-fit context reports 0 — a hugged panel was 0px
wide for *every* template, not only the scenes (517.8 → 0, measured), and a hug in
a column failed the other way, `cqh` falling back to the small viewport and drawing
a 900px column. `.panel-workspace` now declares `--panel-hug: 16em` beside
`--panel-height`, and `panel.css` branches on what the body holds: a `cq` **scene**
(`.panel-t`) has no content size to hug at all, so it takes `--panel-hug` and keeps
the size containment a filling panel gets — a hugged scene is the same drawing,
smaller. A body holding **real content** — a section band, a `panel(fn)` drawing —
still measures its own block axis and only its inline axis is contained, so `hero`
hugged in a column is its own 288.7px, exactly as before.

⚠ **Hug stays a leaf's word.** A hugging *split* measures children that size
themselves from it and collapses with its own grips inside it. All three doors
withhold it now — the bar (the button sits inside `if ($body)`), the inspector
(`mode` is a leaf's row), and this menu (`mode !== "hug" || item.leaf()`), which
still offers `fill` on both sides and keeps hug's grid cell blank beside a split,
because dropping the cell slides the next row's mark up into the hole.

## Kept, with dissent

- **The tone menu is always on a leaf's bar**, not only when
  `templates[name].tone` is set. Making it conditional means repainting the
  bar from inside a `<select>`'s own change handler — destroying the element
  whose event is running. A tone no template reads is inert; a bar that
  deletes its own control mid-event is a bug waiting for a reader.
- **The 3×3 picker is `pick()` in a three-column popover**, showing the codes
  (`tl` … `br`) rather than nine dots. It is `ext/layout`'s control,
  unmodified, and the code is the data.
- **`coalesce()` is five lines lifted from `ext/demo/stage.js`, not
  imported.** A widget has no business depending on the demo chrome — the
  alternative was an import that drags `stage.css` and the whole stage module
  behind it. It is now duplicated a third time, deliberately *not* copied, in
  `dev/DevBar/grip.js` — see the audit's overlap section for what that adds
  up to.

## Open

- **Three live mounts on one document, not the two the readme once recorded.**
  `/framework/ext/Panel/`, its `/full/` route, and `ai/2026-08-13/panel/page.js`
  each `Item.open()` the same `/data/panels.json` — three, not two. `Page` caches
  views, so after visiting any two, the last writer wins. A shared-document
  registry is the fix if it ever bites; the cheap version already used elsewhere
  is a `MemorySaver` on the archive page.
- **A workspace narrower than 16em cannot honour `--panel-hug`** — measured at
  200px, a column hug is a 248.3px body inside a 200px panel, which the panel
  then clips. The toolbar half of this neighbourhood closed with the fold; this
  half did not. Below ~146px the 6-column template picker also stops fitting
  even capped at `100cqi`; auto-filling its columns would fix it and would
  destroy the alignment 3×3, which needs a way to tell the two pickers apart
  that is not `--panel-cols`.
- **The `hug` demo this module has owed since 2026-08-14 is still unwritten.**
  The collapse it was going to illustrate is fixed (*Hug — measure the content,
  or declare an extent?*), but the interesting case is still worth showing: a
  panel hugging a section band's natural height inside a filling row, beside a
  hugged scene taking its declared 16em.
- **`workspace.js` is back over 200 lines**, carrying four things: the two doors
  (`panel`, `workspace`), the recursive `view()`, `paint()`/`repaint()`, and
  focus. The 2026-08-15 passes took the bar out to `toolbar.js`, the divider to
  `grip.js` and the `random` verb to `random.js`, and focus refilled the room
  they made. No obvious next seam — `view()` and `mount()` are one job, and the
  three things already extracted were the ones that were not assembly.
- **The clock template's timer never stops if it is never connected.**
  `templates.js`'s `paint()` re-arms until the element has been connected
  *and then* detached — a body that is drawn but never mounted (unlikely in
  practice, since `paint()` runs inside `$body.empty()`, but not provably
  impossible from a future caller) re-arms forever.

Fuller review, with severities and file:line for every item above:
[Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/), 2026-08-14.
