# Panel — decisions and record

*Moved from readme.md 2026-08-17; conclusive, not current guidance.*

The design record for `ext/Panel` — question, what was weighed, verdict. The
readme states each verdict in one line and links here for the reasoning.

## The bar sweep — the rail is the UI (2026-08-19)

**Question.** The owner: *"there are too many little icons. there's no way anyone
remembers all these… having 15 icons with any number of sub icons (that you have
to hover, wait, read to see what they are), isn't great. this is why the panel
selection and right sidebar can work."*

**Measured, before.** A hovered leaf's bar carried **15 controls** — 4 on the
strip (drag handle, `more_horiz`, an even-split `splitscreen`, close) and **11
behind the fold**, most of which opened a popover of their own: template (29
entries), tone, display, the flex or grid words, two size pickers, a live
duplicate. And **365 of those popovers were cut off at 1280, 343 at 400** on
`/framework/ext/Panel/` — clipped by the `overflow: hidden` of a panel, its
workspace or the rail (probe: every pop opened by clicking its trigger, its rect
compared against the intersection of every clipping ancestor; below-the-fold does
not count as clipped, a scrollable ancestor can be scrolled to).

**Verdict — the bar keeps what a HAND does.** Six controls, and not one of them
opens anything:

| drag handle | split into columns | split into rows | `tune` | the magnifier | close |

Every WORD — template, tone, display, align, the flex and grid words, pad, gap,
size, mode, group — lives in the rail (`properties.js`). **After: 6 controls, 0
clipped popovers at 1280 and at 400.** `glyphs.js`'s `WORDS` lost its `bar:` flag
entirely; `toolbar.js` lost `pop()`, `pick()`, the fold, `panel-quick`,
`panel-browse` and 160 lines with them.

**Why `tune` is on a bar that is otherwise gestures.** The rail is not open on
every page — `dock()` runs on the module page and the playground only — so a
panel in `ext/editor`, or any one-off `panel()`, would have had no door to its own
vocabulary at all. `tune` opens the rail on whatever is focused (`root.focus`,
read back, so the ring and the rail cannot disagree) and imports `tools.js`
lazily, because `tools.js` reads `toolbar.js` and a static import would close the
ring.

**Kept, decided against removing.** The two split icons: the edge click *is* a
split now, but the icons are the only path that does not require knowing the
gesture, and `vertical_split`/`horizontal_split` are literally pictures of the
result. The magnifier: the owner likes it, and it is a drag, not a word.

**Removed, deliberately.** The live duplicate (`content_copy`) — alt-drop makes
the same panel and the page documents it; the layout dice (`space_dashboard`) —
the rail's `sow` row offers the dice *and* nine named presets, which is strictly
more; the even-split `splitscreen`, which was a third button for what two already
did; the root's `mode` and a split's `group`, both of which the rail draws.

**Three bugs the sweep uncovered, all pre-existing, all in the RAIL** — see
[focus.md](/framework/ext/Panel/doc/focus/), which is where they belong.

## `ext/Dropdown` — a picker in the top layer (2026-08-19)

**Question.** The owner: *"the template switcher — should be a dropdown (we might
need an ext/Dropdown, which handles the ui, show/select/hide, etc) with icons and
a label."*

**Verdict.** [`ext/Dropdown`](/framework/ext/Dropdown/) — 100 lines, a class with
a `dropdown()` door. Its list is a `[popover]`, so an open list is promoted to the
browser's **top layer**: outside every `overflow: hidden` ancestor, no z-index
war, and outside-click and Escape for free. That is the clipping fix, and it is
one attribute. A promoted box has no containing block, so `place()` measures the
trigger and writes `position: fixed` `left`/`top` itself — below the trigger, or
above when there is no room, clamped either way.

**Two callers, and only two.** `template` (a vocabulary is 29 entries wide — as a
shelf of pictures it was a wall of icons you had to hover to read) and `display`
(the word that decides which OTHER words are live, so naming it names the state
the rest of the rail is in). Everything else stays a row of two to nine pictures:
positional, and faster to read than a list you have to open. The flag is `drop:
true` in `WORDS`.

**A native `<select>` was offered and rejected** (the owner: *"or could be a
native select element, i don't really care"*): an `<option>` cannot hold a
picture, and this vocabulary is pictorial — a template ships an icon, a tone ships
a colour swatch. Showing the icon *and* the name was the whole ask.

**Escape is not left to the browser.** `focus.js` drops the panel selection on
Escape, so a list dismissed by the popover's own close watcher took the selection —
and the rail the list was drawn in — with it. `Dropdown.keys()` closes and stops
it. Likewise the lit option is focused with `preventScroll` and then
`scrollIntoView({ block: "nearest" })`: a bare `focus()` on an option low in a
long list pushed the first rows above the box.

## `wrap` is one button (2026-08-19)

The owner: *"don't have a Wrap > Wrap/NoWrap drill down, when a single Wrap with
active state would suffice."* `WORDS` gains `toggle: true`: a word with exactly
two names, one of which means OFF, draws ONE button that lights, and `names[1]` is
the ON state by the table's own order. `wrap` (`nowrap | wrap`), `dense` (`off |
on`) and a split's `group` all read that way now. The two names stay in the table
because they are the CSS values `paint.js` writes.

Not toggles, for the same reason: `mode` (fill | document), `dir` (row | col) and
`position` (static | absolute) are two *named states* with two distinct pictures,
not a thing that is on or off.

## Rows are one line (2026-08-19)

The owner: *"the 4 tone tiles are currently a 2x2 grid, they should be 1x4 to
utilize space better."* A row of six or fewer pictures is one LINE — `tone` went
`cols: 2 → 4`, and `width`/`height` went from a 3-wide grid to `SIZES.length`.
The one set that keeps a narrow `cols` is `align` (and `self`): a 3×3 IS the
picture, and it stops being one the moment its columns reflow.

## Split vs add — two verbs, two gestures (2026-08-19)

**Question.** Edge click and the Workspace bar's `+` both called
`item.divide(dir, new Panel(), at)` — one gesture wearing two triggers, and
neither carried the struck panel's own look. Design (`ai/2026-08-19/
workspace-design/design.md` §5): an edge click should keep the panel's
tone/words and start empty (a *twin*, 50% by construction — `divide()`
already gives an even share); the bar's `+` should start from scratch —
already what `divide()` did — beside the focused panel, or a fresh section
at the end of a document root when nothing is.

**Verdict.** `Panel.restyle(from)` (`Panel.js`): copies `Panel.shared` minus
`template seed text`, plus `from`'s own `grow` — one method. `split.js:57`'s
`commit` becomes `item.divide(dir, new Panel().restyle(item), at)`.
`Workspace.add()` is the bar's `+`: `focused(root) ?? root`, then
`target.divide(target.parent?.get("dir") ?? "row", new Panel(), false)`.

⚠ **Not `root.divide(dir, new Panel(), false)` on an already-split root.**
`divide()`'s sibling branch needs `this.parent`, which a root never has, so
`divide()` on a root *always* calls `split()` — wrapping every EXISTING
child into one new one instead of adding a flat sibling. Fine the first time
(a leaf root converting), wrong every time after (a document with two
sections would gain a nested wrapper, not a third flat one — failing "count
+1, last" the instant it is checked). `new Panel().move(root)` is
`workspace.js`'s own `sown()` for the identical shape (design §5, "one roll
= one section") — reused here for a leafless root too, so `fill` mode needs
no separate branch: `add()` checks `root.leaf()`, nothing else. The template
picker does not auto-open — reaching `focus.js`'s imperative setter or
`workspace.js`'s `views` map is a different task's fences; the new panel
takes the default template and the rail lights it the instant it is clicked.

**`insert.js`'s seam `+` was eating a nested seam drag**
(`ai/2026-08-18/panel-flow/`'s finding) — not at its OWN split's interior
gaps (the stub's whole box sits inside that grip's ±0.625rem strip there, an
accepted tradeoff since 2026-08-16: "the grip keeps all but `--insert-run`
of every seam"), but at a NESTED split's own edge, which coincides with a
DIFFERENT (outer) grip's strip by pure geometry — the stub's own `panel-body`
never asked to sit there, it just always starts exactly at 0. Measured both
fixes the brief offered: lowering the stub's `z-index` below the grip's
kills it almost entirely at ITS OWN gaps too (its box is ~100% inside that
grip's strip there, so the grip would win nearly everywhere the stub is
*meant* to win — the opposite of "keeps both usable"). Insetting the stub's
*start* 0.7rem clears the neighbour's strip without touching the own-split
case at all — the same number `split.css`'s own `--clear` already measured
for the identical grip-vs-overlay conflict at a panel's edges (`insert.css`,
both axes — one declaration each). Proven headless: a nested column's outer
seam drags 100px with the insert `+` genuinely `.on` (hovered) throughout,
child counts unchanged before/after.

**The group toggle is now also on the bar.** `properties.js`'s
`group_words()` was rail-only because `live_words()` is a leaf-only door and
`group` never earned a `WORDS` row. `toolbar.js`'s `word_pops()` draws it
beside the root's own word, for any split (root or not, matching
`group_words()`'s own reach) — `sizing(item, $panel)` by hand after `set()`,
the same pattern `size_pop` uses, because a plain `set()` raises `change`,
which never redraws a bar.

Proven headless (`ai/2026-08-19/workspace-d-verbs/`): edge-click on a
toned/grid leaf → the twin shares `tone`/`display`/`cols`, an empty
template, `grow` 1/1; the bar's `+` beside a leaf and on a document root
both add one (2→3), the root's last child fresh and blank; the nested seam
drags 100px with the insert `+` present; the bar's group toggle flips
`.panel-group`. Zero console errors on `/framework/ext/Panel/`,
`/Workspace/`, `/playground/`.

## The `Workspace` class and the retirement of `/full/` (2026-08-19)

**Question.** `workspace()` mounted a root directly into one box, and a second
whole-window view of the same document (`/full/`) was a second, independent
`workspace()` call — its own `Item.open()`, its own root, racing the first on
every save. Design (`ai/2026-08-19/workspace-design/design.md`) asked for a
class that HOLDS a root instead, so N viewports could be N views of ONE root.

**Verdict.** `ext/Panel/Workspace/` — a `Workspace` class, never `extends
Panel` (the accepted proposal's "never a fourth Panel subclass" stands).
`workspace()` becomes `new Workspace(options).$view`, unchanged for every
caller. `mount(root, $root)` (`workspace.js`) now keys a `WeakMap` by the root
object and grows a `Set` of boxes per root — a second `mount()` call for a
tracked root joins the set and draws once, rather than reloading. The `/full/`
route (`route(name)` + its `full` import + the two prose links) is retired:
until the playground (task C) lands, this page's own inline `workspace({
mode: "document" })` is the only whole-document view. Full record, including
the two owner-requested additions (a `flow` option and a bounded-space
option) and what is still open: [`Workspace/doc/decisions.md`](../Workspace/doc/decisions.md).

## Should `ext/Panel` use container queries at all? (2026-08-19)

**Question.** Every `.panel-body` was `container-type: size`, and *a size
container may not be sized by its contents* — which is why `hug` could not
measure and had to declare `--panel-hug: 16em` instead. The owner: *"I'd
probably avoid containers for now."*

**Verdict: none, anywhere in the module.** Deleting the containment makes `hug`
mean `flex: 0 0 auto` with an auto basis, and the box measures what it holds.
Every other `cq` line **converted** rather than died, and the decorative scenes,
`zoom_scrub`, the align overlay and `insert.js` all stayed (the owner's
amendment: *"if it's not hurting anything leave it for now"*).

**61 lines to 0 live** — the ten that remain are comments saying what went:

| file | before | live now | what happened |
|---|---|---|---|
| `panel.css` | 10 | 0 (3 comments) | 3 `container-type` deleted · the hug floor dropped · `.panel-body:has(> .panel-t)` states `grid-template-rows: 100%` instead |
| `size.css` | 2 | 0 | both `min(--panel-hug, 100cq…)` floors dropped; the cap is `.panel`'s own `max-inline-size: 100%` |
| `templates.css` | 39 | 0 (4 comments) | paint → `%`, type → `em`, `wall` is 2 columns, `.panel-t-screen` is `100%` + `1em` |
| `toolbar.css` | 6 | 0 (2 comments) | the bar folds unconditionally; `100cqi` → `100%` |
| `tools.css` | 4 | 0 (1 comment) | the align overlay's container and its two size guards |
| **total** | **61** | **0** | |

**Five things it cost, all recorded rather than hidden.**

1. **`--panel-hug` is `--panel-section`, and only that** — the floor under a
   section of a `mode: document` workspace. It stopped being a width. Where
   `fixed` was written with no length, the fallback is a plain `16em`.
2. **A type size is now a constant `em`.** `clamp(1.5em, min(21cqw, 55cqh), 32em)`
   became `4em`: with the middle term in `em` every term is in `em` and the clamp
   can never move, so the clamp went too. Scaling a drawing to fit its box is
   `zoom` on a viewport (task C), done once for everything.
   ⚠ The visible cost: page **furniture** in a narrow generated rail no longer
   shrinks to fit and clips instead. `.panel` is `overflow: hidden`, so it clips
   rather than spills.
3. **`blur()` and `perspective` may not take a percentage**, and a `circle`
   gradient's radius may not either — those three converted to `em`/px, not `%`.
4. **`.panel-workspace` and `.panel-items` now state `position: relative`.**
   `container-type: size` was the containing block a *floating* panel landed in,
   by accident; without it an abspos panel escapes to the page. `insert.css` says
   the same thing for `.panel-items` today and is on the delete list, so
   `panel.css` states it itself.
5. **`.hug` is deleted.** It was `mode: hug` translated to whichever axis was
   main, and `size.css` states that per axis and per slot — including the CROSS
   axis and a split's `.panel-items`, neither of which `.hug` ever covered. Its
   name stays in `size.js`'s clear-list so a stale one cannot survive a redraw.

## The two rules the design said would not be needed (2026-08-19)

Design §2 said *"Deleting the containment fixes it with no new rule"*. Measured,
it did not — twice — and both misses were the same fact.

**A `flex: 1 1 0` child of a box that is measuring itself contributes ZERO.**

1. **A cross-axis `hug` read 0px.** A root panel with `h: hug` and twelve lines
   of text measured **0**, because `.panel` is a flex COLUMN and its body kept a
   `0` basis. One rule fixes every case at once —
   `.panel.panel-h-hug > :is(.panel-body, .panel-items) { flex-basis: auto }` —
   main axis or cross, in flow or out, leaf or split. Now: one line 52px, twelve
   lines 656px, a scene at its own 16em floor.
2. **A document section still could not grow.** With containment gone every
   section still sat at 241px and its content scrolled inside it, for the same
   reason one level up. `panel.css`'s last rule gives every stacked panel and
   every panel's payload `flex-basis: auto` **inside a document only**; the
   inline axis is untouched, so a row of columns still divides its width.
   Measured with fixed seeds, three rolled sections: **241/241/241 with 55 boxes
   scrolling their own content → 13012/1832/5062 with 0**, and the 55 leaf widths
   identical to the pixel. A plain document of bands: 3 scrollers → 0.

**The scrollbar rule now holds:** the workspace scrolls, and a box scrolls only
where a height was genuinely chosen (`h: fixed`, or `fill` mode, where the screen
is finite).

## A roll on the root of a document sows into ONE fresh section (2026-08-19)

`sow()` replaces a panel's data and children in place, which is right for the
panel you struck. On the root of a document it was wrong: the layout's top-level
rows became sections, which is the twelve-mini-panels report. A layout is a
*page* and a document is a stack of pages' worth of band, so **one roll = one
section** — `workspace.js`'s `sown()`, one `item.document()` test. On a section,
and in `fill`, nothing changed.

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
- ~~**`workspace.js` is back over 200 lines**~~ — **closed 2026-08-17 at 365
  lines.** The claim that there was "no obvious next seam" was wrong: four
  responsibilities came out by name, and none of them was assembly. `vocab.js`
  (what a document was opened with — `vocab`/`offer`/`tools`/`standard`),
  `focus.js` (the selection and the three ways it is lost), `overlays.js` (the
  four surfaces on a leaf's body, and the disposer registry), `paint.js`
  (`paint`/`repaint`/`show`/`views`, and the mirror walk). 365 → 198, with the
  module total unchanged at ~2,630 and every import still flowing one way.
  ⚠ **`roll()` and the `drawing` flag stayed together** — a flag with two users
  cannot be split without an import in one direction or the other.
- **The clock template's timer never stops if it is never connected.**
  `templates.js`'s `paint()` re-arms until the element has been connected
  *and then* detached — a body that is drawn but never mounted (unlikely in
  practice, since `paint()` runs inside `$body.empty()`, but not provably
  impossible from a future caller) re-arms forever. **Narrowed 2026-08-28:**
  `paint()` now writes only while the element is *visible* (`offsetParent`),
  because a hidden-but-mounted page kept `/framework/`'s clock connected and
  its unseen writes made Chrome DevTools redraw its Styles pane sitewide once
  a second. The never-connected timer still re-arms, but silently — a no-op
  timeout per second, no DOM writes.

- **The nine on-panel alignment arrows are hidden by default (2026-08-18).** The
  owner: *"they look bad, and they don't do anything without explicit height to
  actually align within."* `tools.js` `TOOLS.align` is now `false`; the code,
  the CSS and the toolbar's Alignment pop all stay, and `workspace({ tools:
  { align: true } })` restores the overlay for one document. Something like it
  may return once a panel has a height to align inside; the shape is not decided.

Fuller review, with severities and file:line for every item above:
[Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/), 2026-08-14.

---

*The readme as it stood before the 2026-08-17 retreat, verbatim, from here down.*

Chrome for arranging. A **panel** divides, moves, fills, hugs, nests and
hosts — one `Item` subclass, one recursive view, and the persistence, drag
and control stacks that already existed.

## Section vs panel

A **section** is a full-width band of a real page — content, with its own
internal measure and tone. A **panel** is chrome for arranging and
exploring: it can host any section (or experience), frame it, align it,
retint it, split beside it. **Sections are what you ship; panels are how you
wireframe.** The `T` menu is the seam: every section band is available
*inside* a panel, and nothing about the band knows it is in one.

## The shape

- `Panel.js` — `class Panel extends Item`. Items → a split (`data.dir`); no
  items → a leaf that renders `data.template`. Two verbs, `divide()` and
  `close()`; structure changes no other way.
- `workspace.js` — the doors: `panel(seed)` (default export), `workspace(options)`
  (`saver`, `templates`, `seed` — the vocabulary rides the root `Panel`,
  never serialized), the redraw, and the recursive view.
- `vocab.js` — what a document was opened with: `vocab`/`offer`/`standard` (its `T`
  vocabulary) and `tools` (its surface flags, module defaults spread under the
  root's own). `focus.js` — the selection. `overlays.js` — the four surfaces on a
  leaf's body, and the `WeakMap<root, dispose[]>` `draw()` drains. `paint.js` —
  one panel's own DOM: `paint`/`repaint`/`show`/`views`, and the mirror walk.
  All four are read by `workspace.js` and read nothing of it back.
- `random.js` — what `random` means: `scatter()` rolls an arrangement into a panel
  and **commits** it; `resolve()` sweeps a document for leaves that still say so.
  The vocabulary to draw from is an argument, so it imports nothing of
  `workspace.js` and the two never circle.
- `glyphs.js` — what a panel's **words look like**: the compass of eight arrows and a
  dot that draws the 3×3, `close_fullscreen`/`open_in_full` (inward for hug, outward
  for fill), the `dir` pair, and the tone→token map the swatches and `templates.js`
  both read. Imports View and nothing else, so all three control surfaces may read it
  and none of them circle.
- `toolbar.js` — the bar that floats over a panel: `toolbar(item, $panel, $body, T)`,
  where `T` is `{ names, entries, roll, repaint, sow }` prepared by the call site.
  Every verb sits in one contiguous run that folds behind `more_horiz` when the
  panel is narrower than the row. Also `handle()` (the drag grip) and `place()`.
  Reads `glyphs.js` (View only) and `size.js`'s `sizing()` (also View only) — still
  one-directional, so nothing circles even though it is no longer true that
  `toolbar.js` reads nothing of ext/Panel.
- `size.js` — per-axis sizing: `w`/`h`, each `fill | hug | fixed`, replacing the
  one-word `mode` for both axes independently. `sizing(item, $panel)` is the sole
  writer of the `panel-w-*`/`panel-h-*` classes `size.css` reads (plus the legacy
  `.hug` class `panel.css`'s scene switch still keys off), called on every draw and
  again by hand after every picker click. Imports View and nothing else. **The
  finding that shipped it**: `mode: "hug"` was never "hug both axes" —
  `flex-grow`/`shrink`/`basis` only ever touch the flex MAIN axis, and `panel.css`
  never set `align-self`, so the cross axis always filled; a saved `hug` panel
  already only hugged the axis its split ran along, and `sizing()`'s fallback (no
  `w`/`h` in the data) reproduces exactly that, so no saved document changed
  meaning.
- `grip.js` — the divider between two panels. Zero-width in flow, so the panels
  touch; the seam is a `box-shadow`, the target is a 1.25rem overlay strip, and
  a pill rides the pointer along it. Drag resizes (grow fractions,
  rAF-coalesced); a click under 4px of travel opens `seam.js`'s menu. Also
  `coalesce()`, the rAF pointer-move throttle — nothing to do with dividers, and
  the file's one remaining excess.
- `seam.js` — what a seam offers when a click on it never became a drag: hug or
  fill, one row per neighbour, marked with the way it lies. Built empty and
  filled on the way **open**, so a reopened menu shows the mode the inspector or
  the panel's own bar just wrote. Hug is withheld where that side is a split —
  its grid cell stays blank, so the rows still line up. The two neighbours
  arrive as arguments, so it reads nothing of `grip.js` or `workspace.js` and
  the three never circle.
- `tools.js` — the surfaces that sit ON a panel rather than in its bar: the alignment
  3×3 drawn at the nine places it names, the scrub zoom, and the listener that puts a
  selected panel's words in `ext/drawer`. `TOOLS` is the flag object — every surface is
  on while the vocabulary is being felt out, and hiding one is a word.
- `split.js` — click an edge, get a split preview: half the panel on the side the
  pointer is on, flipping across the midline; left click commits, right click or Escape
  cancels. The edge you pointed at supplies both arguments `divide()` already takes.
- `insert.js` — the `+` a split offers at the interior gap nearest the pointer: a stub
  riding the head of the seam (the grip keeps the rest), sized and oriented from
  `item.get("dir")`, never guessed from the DOM. Its own rAF throttle — `coalesce()`
  unbinds on the first `pointerup`, which is wrong for hover tracking that outlives
  clicks.
- `repeat.js` — the *other* `+`: one at the end of any **repeating run** a template drew
  (a grid of cards, a list of rows), which clones the last item. A run is ≥3 contiguous
  siblings sharing a tag and a full class signature **and carrying at least one class** —
  that last clause is what stops three plain paragraphs reading as a run, and it measured
  17 tiles with zero false positives across the demo page. ⚠ Unlike `insert.js` it sits in
  **normal flow** and does not track the pointer: appending has exactly one valid target,
  so it costs the overlay z-index budget nothing and a grid sizes it like any other item.
  Appended items ride `panel.data.text` under a `repeat` key, so a live duplicate shows
  them too. `repeat_apply()` is `paint()`'s synchronous hook for this, the same shape as
  `persist.js`'s `text_apply()` and called right after it — a saved clone is in the FIRST
  painted frame on a synchronously-drawn template instead of waiting for the observer's
  own tick; a lazy template still lands it through the observer, since the hook finds
  nothing in a still-empty body and the observer takes over once the content lands.
- `text.js` — a leaf body's prose, made selectable, stylable and typed on directly: one
  delegated listener marks and selects a run (`p`, `h1`–`h6`, `li`, `blockquote`),
  announces `panel-text` the same shape `panel-focus` already is, and draws a fixed
  in-place gauge (`h2 · 58ch × 3`). Every edit — typed text, a style, a `wrap()` —
  is handed to `persist.js`. Imports one way: this file calls into `persist.js`, never
  the reverse.
- `persist.js` — the **persistence** underneath `text.js`: `panel.data.text`, keyed by
  the run's position in the drawing plus the template it belongs to, replayed onto the
  next redraw by a `MutationObserver` (`text_observe()`, since a lazy template lands its
  DOM a tick after `paint()` runs) and applied by `text_apply()`. `text_commit()` flushes
  an in-progress edit before a redraw can discard it. `Panel.shared` makes `text` follow
  a live duplicate exactly as `template` does. Imports `View` and nothing of `text.js`.
- `display.js` — `display` as a panel word (`block`/`flex`/`grid`, written by
  `paint.js`'s `show()`) plus an overlay that draws what the mode is doing: the
  flex axis and each child's grow, or the grid's real resolved track widths. Also
  exports `live_axes(mode, dir)`, the truth table `size.js` reads to decide whether a
  panel may place *itself* on an axis.
- `PanelDrag.js` — `PanelDrag extends Sortable`: drag, drop, and the edge zones. **Alt at
  drop** lands a live duplicate instead of moving the original.
- `panel.css` / `toolbar.css` / `size.css` / `grip.css` / `tools.css` / `split.css` /
  `insert.css` / `text.css` / `display.css` — structure only. **`templates.css` is the
  sanctioned exception**: a template's look *is* its payload, so it ships one.

  The five surfaces drawn *on* a panel's body — align, edge, ghost, insert and
  display — share one z-index budget and two different "innermost wins" idioms:
  [overlays.md](./overlays.md).
- `templates.js` — `name → { icon, tone?, draw($body, panel) }`. `draw` runs
  with the captor already on `$body`. `generate.js` is the one entry big enough
  to have earned its own file — and the only one that also runs the other way,
  translating a seed into real panels.
- `properties.js` — the inspector: one panel drawing the **focused** panel's
  words as live controls. A `T` entry's payload, like `generate.js`, and the
  second one big enough to earn a file. [focus.md](./focus.md).

`data` keys: `dir`, `template`, `align`, `self`, `position`, `tone`, `mode`, `w`, `h`,
`grow`, `seed`, `display`, `mirror`, `text`. **`align` is my content; `self` is me** —
where the panel sits in the slot its split hands it; **`position`** is whether I'm in
that slot at all, or floating over it (`static | absolute`, `glyphs.js`'s `POSITION`).
Nothing else is persisted — instance state (`parent`, `saver`, `draw`, `templates`,
**`focus`** and **`depth`**) never serializes. `depth` is the layout roll's max
nesting, read off the root by `sow()`: a roll *parameter*, not a property of any
panel, and the tree it makes is its own address the moment it exists. `w` and `h`
(each `fill | hug | fixed`, with `w_at`/`h_at` holding a fixed length) are written
by the bar's two size pickers and read by `size.js`; `mode` survives only as their
fallback, so a document saved before 2026-08-16 still sizes exactly as it did.

## Templates — the T vocabulary

Twenty-eight entries: eight scenes sized in container-query units from a phone
sliver to 3440, one adapter per section band in `styles/sections/` (lazily
imported, tinted by the panel's tone), three pieces of page furniture (`rail`,
`toc`, `brand`) that exist because the translator needed them, and `space`,
which **generates** a layout
instead of showing one — `gen(seed)` from `styles/layouts/space/gen.js` writes a
whole page as spec text, and a seed is an address, so it is the only thing kept
(`panel.data.seed`): [generator.md](./generator.md). The sizing rules
(and the trap that already cost a real bug — a scene measuring 0px in a real
panel) are worth reading before adding a twenty-ninth:
[templates.md](./templates.md).

The twenty-eighth is `properties`, which reads the workspace rather than drawing
one: the **focused** panel's template, tone, alignment and sizing as live
controls, every chip the same `item.set()` the bar makes. Two of them side by
side track the same panel, because an inspector is a panel —
[focus.md](./focus.md).

## Decisions

- **`divide(dir)` is one verb, not two** — it reads whether its parent already runs that
  way, so a second click on the same icon gives you a third column with no separate "add a
  column" concept. **`split(dir)` is the else-branch, named** (2026-08-16): always become a
  container, whatever the parent runs. The two were one verb only for as long as nothing
  could ask for the *inside* — dropping a panel in the MIDDLE of another one is exactly
  that, and it must not become a sibling just because the parent happened to run that way.
- **The middle of a leaf is a drop target now.** Edge → beside it (`divide`), middle →
  inside it (`split`), and the two previews must never read alike: the edge shows a half,
  the middle shows an inset frame. ⚠ A **leaf** only — a split already is a container, and
  the middle of one means its row.
- **`T` types on whatever you are pointing at, and grows a line if there is none.** A scene
  or a clock matches no prose, and a shortcut that does nothing three times out of four is
  broken rather than scoped. `contenteditable="plaintext-only"`, or a paste brings its own
  markup into a layout you are arranging.
- **A text edit is written down, keyed by where it sits in the drawing — not by DOM identity.**
  `data.text[scope + "/" + path]` survives the `paint()` that throws the DOM itself away on
  every tone, template or mirror change; `scope` is the template's name (plus its seed, so a
  re-rolled `space` doesn't hand old copy to whatever now sits at that path) and `path` is the
  run's child-index chain from the body down. ⚠ **Written down on *blur*, not on every
  keystroke** — `paint()` must flush an in-progress edit first (`text_commit()`, called before
  `$body.empty()`) or a redraw mid-type discards what was never saved.
- **The insert `+` offers INTERIOR gaps only, as a stub at the head of the seam.** Full
  height, it covered the grip for the seam's whole length and the resize handle could never
  appear; at the two outer gaps it sat exactly where the edge-click split lives and hid a
  better gesture behind a worse one. Now the grip keeps all but `--insert-run` of every
  seam, and an edge means one thing.
- **Defaults live on `Panel.defaults`, read through `get()`** — not copied
  into every node's `data` — so a saved document only ever holds what
  somebody actually chose, and a changed default can still reach documents
  already on disk.
- **`"random"` is a verb that commits**, not a template: picking it from `T`
  rolls and *writes* a sub-arrangement, so a reload comes back to the same
  roll rather than a fresh one.
- **Drop-near-an-edge is tested before the normal drop target**, because the
  normal resolver always finds the *enclosing split* over a leaf and an edge
  zone checked after it could never fire.
- **A failed load never seeds.** `workspace()` only rolls and saves a fresh
  document when `Saver.load()` resolves `null` — a genuinely absent file. A
  failed read (`Saver.load()` rejects) renders an inline error instead, so a
  dev-server hiccup can never seed over, then save over, a real layout.
- **The bar is an overlay, and only the innermost one lights.** It is absolutely
  positioned over the top of the panel, so content is the same size bar or no
  bar — and `.panel:hover:not(:has(.panel:hover))` stands an ancestor down for
  the panel under the pointer, which is then reached through the divider it
  alone owns.
- **Every control is a transparent icon square, and one rule draws all of them**
  (2026-08-16). No border, no background until hovered, a `--prim` tint for the value
  the panel wears — so an idle bar is icons on the content and nothing else. The box is
  `toolbar.css`'s `.panel-workspace .panel .panel-btn`; `grip.css` and `templates.css`
  each carried a near-identical copy before, which is three places for one look to
  drift, and `.panel-props-btn` is gone as a class. **A button reads its own content**
  for its shape — `:has(> .icon, > .panel-swatch)` squares it, so ext/editor's region
  *names*, the one vocabulary here that ships no pictures, stay word-shaped with no
  flag and no second class. A tone's picture is the colour itself.
- **A trigger that shows a value has to be able to restate it.** `pop()` built its
  label once, and `change` deliberately never redraws a bar — so the template trigger
  disagreed with what the panel held from the first pick until a reload (measured:
  `history` where the body drew `clock`). `$pop.says(label)` is the one-line seam, and
  the size trigger, which shows hug-or-fill the same way, uses it too.
- **The chrome is faint, and the bar's own box does not hit-test** (2026-08-16). No
  background, no blur, no rule under it: a tinted strip across the top of every panel reads
  as part of the design rather than as a tool. What replaces it is restraint — the icons sit
  at `opacity: 0.3` and come up under the pointer. ⚠ Only what is *drawn* in the bar
  hit-tests, because an invisible full-width strip was eating the clicks meant for the edge
  target beneath it. The original trap still holds and is why that lives on the reveal rule
  rather than a blanket `*`: a bar at `opacity: 0` still hit-tests, and in a nest the
  invisible ancestor sits over the panel you are pointing at.
- **The 3×3 is an overlay on the body, not a popover behind a trigger.** A grid cell **is**
  its placement: each button's alignment inside its own cell is the code it carries, so
  nothing computes a position and the grid's padding is what holds a corner arrow off the
  corner. The container never hit-tests; only the nine buttons do.
- **A shared edge is divided by BAND, not by z-order.** The grip's target straddles a seam
  by `0.625rem` either way, and measured, it won three of four edges while the bar's own
  centred button won the fourth — a click on an edge reached nothing at all. Dragging a seam
  to resize and clicking an edge to split are both worth keeping, so the outer `0.7rem`
  stays the grip's, the split strip starts after it, and the top strip starts below the bar.
- **A live duplicate is an id, and only content is shared.** `data.mirror` holds the
  master's id — a plain string, so it round-trips through the saver untouched — and
  `Panel.get`/`set` delegate for `Panel.shared` (`template`, `tone`, `align`, `display`,
  `seed`, `text`). `grow`, `mode` and `dir` stay local, because those answer questions
  about a *slot*: a copy dropped in a narrow column is still that column's width. A literal
  shared `Item` is impossible and was never a candidate — `parent` is a single scalar and
  `views` is one entry per item, so one panel cannot have two mounts. Sharing the `data`
  object instead dies at `toJSON`, which writes it inline per item, so a reload would
  silently produce two independent copies. ⚠ `text` only works *because* `template` is
  shared beside it — `text.js` keys every edit by the drawing it belongs to, so a master
  and its mirrors share one key space precisely when they are guaranteed to share the
  drawing those keys are addresses into.
- **Mastership is inherited, never destroyed.** `split()` and `close()` both stop a master
  holding what its copies read — `split()` moves the content down into a new child and
  reassigns `data` to `{ dir, grow }`, `close()` takes the whole panel out of the tree — and
  measured, a copy reading `template: "hero"` read `"blank"` afterwards, tone back to
  `surface`, text back to `null`. Three ways out were weighed. *Refuse the verb* while copies
  exist is the safest and wrong for a layout tool: a structure verb that sometimes says no is
  a tool you stop trusting. *Adopt on widowing* — copy the shared keys into each copy as the
  master leaves — makes the old `?? this` comment true but severs liveness: close one of three
  copies and the other two silently stop tracking each other. *Hand the mastership down* wins,
  and generalises to both verbs: `bequeath(heir)` gives the heir the shared keys it lacks,
  drops the heir's own `mirror`, and re-points the rest at it. `split()`'s heir is the child
  the content just moved into (the copy follows the content, which is what the user watched
  happen); `close()`'s heir is the first surviving copy, promoted to original, so the others
  keep reading it. It reads right from the user's side — they alt-dropped a copy, split the
  original, and the copy still shows what it copied. ⚠ `close()` walks the whole leaving
  subtree, because closing a split takes its children with it. ⚠ `bequeath()` returns early
  when there are no copies, and that early return is what stops splitting a *mirror* from
  deleting the link the new child is carrying down.
- **Popovers, not selects.** Template, tone and alignment each open a grid whose
  column count is one token (the browse grid alone reflows below 12em — see the
  pickers decision); a vocabulary that ships icons is browsed by picture
  and six wide, one of names two wide. The template trigger *is* the current
  template's icon, so a panel says what it holds.
- **The row folds; it never wraps and never scrolls.** Below the width the row
  needs (19em of the bar's own em, ~236px), the whole contiguous run of verbs
  becomes one `more_horiz` popover — `display: contents` above that width, so a
  wide bar is the row it always was, measured x for x. Scrolling was the other
  candidate and is disqualified outright: `overflow-x: auto` computes `overflow-y`
  to `auto` as well, which clips every picker out of existence. Only a **leaf**
  builds a fold; a split's three buttons fit at any width worth pointing at.
- **A control surface says so, and the body reserves the bar.** The bar is an
  overlay that lights on *hover* — which for a template whose top edge holds
  controls is exactly when its first row is in use. `.panel-controls` on the drawn
  payload; `panel.css` pads the body by `--panel-bar-h`, the same token the bar is
  *sized* by, so the reserve cannot drift from the thing it clears. The inspector's
  private `2.4em` is gone. The fork: the bar could instead stand down over such a
  payload and reveal only near the top strip — rejected, because that needs JS
  pointer tracking and makes an already-invisible overlay harder to find, where the
  reserve is one class and one token.
- **A split holds its axis at every width.** `dir` is the user's answer, not the
  viewport's — a workspace is a document somebody arranged and saved. Every
  responsive-split mechanism either makes the DOM the truth about axis instead
  of the data (breaking every axis reader), grows a second sizing currency, or
  buys breakpoints with permanent API surface. An embedded workspace that must
  fit a phone is scaled by `ext/demo`'s stage; per-width fidelity, if ever
  wanted, is `structure(seed, width)` chosen at roll time. Reasoning and the
  rejected candidates:
  [reflow proposal](/framework/ai/2026-08-15/reflow-proposal/doc/reflow.md).
- **A declared extent is capped by the slot, never by the panel.** `--panel-hug` is
  a promise a 200px workspace cannot keep, so both uses read
  `min(var(--panel-hug), 100cq…)` where the `cq` is `.panel-workspace` or
  `.panel-items` — the two boxes sized from above. Reading `.panel` instead is the
  self-measuring loop the token exists to escape. Nearest container wins, so a hug
  in a split caps against its own row and a root leaf against the workspace.
- **The pickers are told apart by kind, not by a column count.** Six pictures stop
  fitting around 148px and the fix is fewer columns — but `--panel-cols` also draws
  the alignment picker, and a 3×3 that auto-fills is no longer a picture of nine
  placements. `toolbar.js` marks the browse-by-picture grid `panel-browse` — a
  shelf, reflowable — and `toolbar.css` auto-fits only that one, nested inside the
  fold because `auto-fit` counts columns against the fold's `100cqi` cap. Zero new
  API on templates: the mark is a reading of the vocabulary, like the six-or-two
  beside it.
- **ext/Panel depends on ext/layout for nothing at all** — not even `btn()`. One
  line used to wire ext/layout's bar into every leaf; it floated in a corner the
  templates were using and brought `region()` click-selection and a
  `.flex`/`.grid` util-layer landmine with it.
- **The seam is a shadow, not a box.** A 0.5px spread around a zero-width flex
  item is a 1px line — so panels sit at a measured 0px, and one declaration
  draws both the vertical and the horizontal divider with no axis to branch on.
- **The grip's menu flips `mode`, and nothing else** — the same
  `item.set("mode", …)` the panel's own bar toggles, one row per neighbour. No
  second sizing channel, no override chain.
- **Hug declares an extent; it does not measure one.** A `cq` scene has no
  content size to give, so a hugging panel takes `--panel-hug` (16em) on the
  axis its split runs and keeps the size containment a filling panel gets —
  a hugged scene is the same drawing, smaller. A hugging panel holding real
  content (a band, a `panel(fn)` drawing) still measures its own block axis,
  so `hero` hugged in a column is its own 288.7px, exactly as before.
- **A generated layout arrives two ways, and only one keeps its seed.** `space`
  draws a *picture* and stores `data.seed`, because the seed is its whole state.
  `structure(seed)` translates the same spec into real panels and stores
  nothing — once a layout is a tree, the tree is the address, and a stored seed
  would be a lie the moment you drag a band out of it.
- **One share is 8em.** A spec sizes a track two ways (`flex-1`, `--basis:15em`)
  and `Panel` has one currency (`grow`), so both convert against a single
  constant: fluid claims eight shares, fixed claims its own measure, unclaimed
  takes one. That last is what makes a topbar a band rather than a hairline.
- **The layout roll is a third structure verb, on every bar.** It sits beside
  `divide`, outside the `if ($body)` leaf test, so a split is no longer a bar
  with two buttons on it. It is handed in through `T` like `roll` and `repaint`,
  so `toolbar.js` still imports nothing of ext/Panel, and withheld from a
  workspace running its own vocabulary — the predicate that withholds `random`.
- **A panel's properties live in a panel.** `properties` is a `T` entry, not a
  docked rail: a workspace already gives layering, resizing, dragging and
  persistence, which are the four things a rail would have to grow API for. The
  `ext/layout` drawer stays exactly what it is — the *selected element's* words
  on an ordinary page. Candidates A–D:
  [sidebar strategy](/framework/ai/2026-08-15/panel-ui-overhaul/doc/sidebar-strategy.md).
- **Focus is a selection, so it is an id on the root and never saved.** It rides
  the root panel beside `templates`, clears when its panel leaves the tree, and
  is taken by a click on a panel's own bar or body — never by a grip, because
  pointer capture retargets the click at the end of a resize and a drag is not a
  selection. **Escape drops it**, and so does a `panel-unfocus` event on the
  document; a click on the focused panel does not, because the same test answers
  to a click anywhere in its body and using a panel would be how you deselected
  it.
- **A selection is announced on the document** (`panel-focus`, detail = the
  panel or `null`), because an `Item` event only reaches something holding the
  root. `dev/DevBar`'s layout tab listens and measures the focused panel instead
  of the page. Two event names and the `.panel.focus` class are the whole
  contract — no import in either direction, and nothing here knows who listens.
  [focus.md](./focus.md).
- **An entry that reads focus never takes it.** `focus: true` is one flag on a
  `T` entry, the same shape as `tone: true`; an inspector that focused itself
  would be holding controls that edit the surface you are clicking. Its own
  words stay on its own bar. The ring is drawn only in a workspace that holds an
  inspector (`:has(.panel-props)`), so nothing else on the site gained a mark.
- **`display` reads `item.get("display")`, and never the class it produces.** The class
  (`.panel-d-block`/`flex`/`grid`) has one writer, `paint.js`'s `show()`; the overlay
  that draws what the mode is *doing* is a second, independent reader of the same data,
  so the two can never disagree about which is the source of truth.
- **A text selection is announced on the document, exactly like a panel selection** —
  `panel-text`, the same shape `panel-focus` already is, filling the same rail. Descent
  into prose (`p`, `h1`–`h6`, `li`, `blockquote`) happens only *inside* a panel body:
  `ext/layout`'s own `pointed()` still stops at a flex/grid child everywhere else on the
  site, and this does not reopen that.
- **Properties.js arrives lazily inside `tools.js`, on the `panel-focus` listener.** A
  static import would close a ring — `workspace.js` → `tools.js` → `properties.js` →
  `workspace.js` — of exactly the kind that only breaks on a deep reload. `text.js`'s own
  lazy import of nothing (it reads only `glyphs.js`) is why its listener needed no such
  care.
- **A selection FILLS the rail; it no longer OPENS it (2026-08-18, reversed).** `panel-focus`
  / `panel-text` bail unless `drawer.showing()` first — the rail's own `ext/layout` cousin
  already worked this way. `/framework/ext/Panel/` and `/full/` call `tools.js`'s `dock()`
  once at load instead, so the 19rem push happens before the reader starts, never mid-click.
- **The stale panel name after deselect was `drawer.refresh()`, called on a `null` detail.**
  `refresh()` replays the *last* fill function untouched — right for "the same panel changed
  under me", wrong for "nothing is selected any more". Reproduced headless on `panel-unfocus`
  (Escape is masked on pages that also load `ext/layout`, whose own global Escape listener
  happens to clobber the rail right after). Fix: a `null` detail now renders the neutral
  `fields(null)` state directly — one place, `tools.js`.

Full reasoning, alternatives considered, and what's still open:
[decisions.md](./decisions.md).

## What will bite you

- **⚠ Anything `view()` binds must hand back a disposer.** `view()` rebuilds the whole
  tree on every structural verb, so an observer or an `item.on()` bound per panel outlives
  the DOM it was built for — and an `item.on("change")` closure on a surviving `Item` does
  not merely linger, it **still fires**. `overlays.js` keeps a `WeakMap<root, dispose[]>`;
  `register()` collects, and `workspace.js`'s `draw()` **drains the previous generation
  immediately before `$root.empty()`**, while everything is still reachable.
  ⚠ **A teardown that detects its own death is not a teardown.** `display.js` used to call
  `stop()` when it saw `!$body.el.isConnected` — which needs a `ResizeObserver` to fire
  *after* detach, and that never happens for a body that was 0×0 or never laid out.
  Measured over 20 redraws before the fix: listeners **1,696 → 17,775**, nodes
  **9,807 → 65,247**, **+953** MutationObservers, **+253** ResizeObservers. After: both
  observer counts **flat at +0**, at 20 redraws and again at 60.
  ⚠ And when you measure this yourself, **give Blink time**: two back-to-back
  `collectGarbage()` calls are not enough after a `ResizeObserver` disconnects from a
  still-attached node, and the fixed code reads as a 4,600-listener leak at ~300ms that is
  gone by ~1.5s. Live DOM counts are the tiebreak — they were identical throughout.
- **`Panel.js` and `panel.js` can't coexist on Windows in the same
  directory** — case-insensitive NTFS folds the two into one file, and the
  2026-08-14 rename proved it live (the old `panel.js` widget file was
  destroyed mid-rename). The split into `workspace.js` + `PanelDrag.js` is
  the permanent fix — never reintroduce a file called `panel.js` here.
- **The drag handle is the grip, never the bar.** A bar-wide handle makes
  `pointerdown` on every button start a drag, and the drag's own
  `preventDefault` eats the click meant for it. The grip's own
  `setPointerCapture` then retargets the ensuing `click` to the grip, so
  anything interactive *inside* the grip — its hug/fill menu — must be excluded
  from `pointerdown` by hand, or every button in it is silently dead.
- **Material Icons is a ligature font, and intrinsic sizing sees the word.** A
  name the font does not carry (`deployed_code` was one; `position_top_right`
  measures **432px**) renders as literal text and sizes every column of the popover
  grid. `.panel-workspace .icon` is clamped to `1em` — the whole workspace, not the bar
  alone, because the inspector and a seam's menu draw the same vocabulary and blow out
  the same way. **Measure a name against the loaded font before adding it to
  `glyphs.js`**: a glyph is 24px at 24px, a miss is the width of the word.
- **A headless probe that clicks a picker rewrites `/data/panels.json`** — the real
  document, which is gitignored, so there is nothing to `git checkout`. Worse,
  `FileSaver` saves over the **dev socket** (`socket.async_rpc("write", …)`), not over
  HTTP, so Playwright's `page.route()` cannot see the write and a probe that looks
  blocked is not. `await page.routeWebSocket(/.*/, () => {})` is the block that works.
- **`.panel-props-set` uses `auto` tracks, never `1fr`.** The buttons are a fixed
  square now, and a fixed item in a `1fr` track leaves the rest of the track as gap —
  the align 3×3 spread itself across a 40em inspector with 1000px between its corners
  and stopped being a picture of nine placements.
- **A theme styles every `button`.** `.theme-lew42 :is(button, .btn)` is 0-2-0
  and pads to `0.7em/1.4em` — right for READ GUIDE, four times too wide for a
  1em icon. `.panel > .panel-bar .panel-btn` is three classes on purpose and
  reclaims the box only; the small-caps voice stays the theme's.
- **`container-type` measures the box as if it were EMPTY.** That is what
  collapsed hug: in a shrink-to-fit context a contained body reports 0, so a
  hugged panel was 0px wide for *every* template (517.8 → 0, measured), and
  `cqh` in an inline-size container fell back to the viewport and drew a
  900px column hug. The extent has to be declared, never measured —
  `--panel-hug`, on `.panel-workspace` beside `--panel-height`.
  The boxes that can safely be query containers are the ones sized from ABOVE: the
  **bar** (`inset-inline: 0` sizes it from the panel), and the **workspace** and a
  split's **items** box (a declared height, then `flex: 1 1 0` down) — those two are
  what the cap measures against. `.panel` can never be one — hugging makes it
  `flex: 0 0 auto`, and it would measure 0.
- **Three guards hold up live duplicates, and each is a real failure mode.** `bequeath()`
  hands the mastership down *before* a `split()` or a `close()` can empty a master —
  ⚠ `get()`'s `?? this` cannot cover that case and never could, because a split master is
  not *dangling*, it is alive and empty, and a copy falling back to its own data holds none
  of the shared keys and reads **blank**. `?? this` guards only an id that genuinely no
  longer resolves. `mirror()` collapses a mirror-of-a-mirror to the original **at creation**,
  so the cycle that would hang `get()` cannot be built. And the root's `change` listener only
  ever calls `repaint()`, which redraws DOM and never calls `set()` — the moment it did,
  every write would echo.
- **⚠ `change` does not carry the item that raised it.** `Item.emit` passes
  `key, value, old` and nothing else, so a root listener cannot tell *which* panel changed.
  That is why the mirror listener repaints every mirror on any change: with tens of panels
  that is far cheaper than growing an event signature four other listeners already read.
- **`paint()` blanks silently on an unknown template name**, and there are now
  two writers of those names: the `T` menu and `generate.js`'s `PANELS` map. A
  furniture template must land in the same commit-unit as the translator that
  emits it.
- **`hug` on a split collapses it to 0px.** A hugging parent measures children
  that size themselves from it, and the result is a panel with no box left to
  point at — measured, with 0-height grips. All three doors withhold it now: the
  bar (the button sits inside `if ($body)`), the inspector (`mode` is a leaf's
  row), and `seam.js`'s menu, which keeps hug's grid cell blank beside a
  split and still offers `fill` on both sides.
- **A panel body centres what it is handed, and centred overflow spills out of
  *both* ends** — the near end is not in the scrollable region at all, so no
  scrolling reaches it (measured: a control surface's first row 124.8px above its
  own panel). `.panel-body` reads the picker's tokens `safe`
  (`align-content: safe var(--panel-y, center)`, same on `justify-items`), which
  degrades to `start` on exactly the axis that stopped fitting; take that keyword
  off and every overflowing template loses its first rows again. `templates.css`'s
  local `align-content: start` for `.panel-props` went with it — one mechanism,
  not two.
- **`coalesce()` is a drag throttle, not a hover throttle — it unbinds itself on the
  first `pointerup`.** `insert.js` tried it first: one click anywhere in a split
  retired the `+` bar's pointer tracking for good, because the throttle it was
  riding had just torn itself down. It now keeps its own persistent rAF frame
  instead.
- **A split *contains* panels by definition, so the leaf idiom
  (`.panel:hover:not(:has(.panel:hover))`) can never match one.** `insert.css`
  reveals on `.panel-items:hover:not(:has(.panel-items:hover))` instead — the
  question for a `+` bar is whether this is the *deepest* split under the pointer,
  not whether it is a leaf.
- **`split.js` binds its document listeners inside a `setTimeout`, not synchronously.**
  The click that opens an edge preview has not finished bubbling yet; bind `commit`
  on `click` right away and that same click fires it before the ghost has even
  appeared.
- **The `T`-key listener has to check `typing()` and the real focus first, or it
  eats itself.** Bound once at module scope, it starts a session on the first `t` —
  and without the guard, the very next keystroke (which is inevitably another
  letter, or `t` again mid-word) would restart it; without the focus check, typing
  a `t` into the properties rail jumps to a panel instead of landing in the field.
- **A text run's 45–75ch measure only means something once it wraps.** Judged on
  every run, the gauge would flag every short label and heading on the page —
  `SHIPPED` is 11ch and correct — and a warning that fires on correct work is one
  you learn to ignore. `text.css`'s `.wide`/`.narrow` classes only ever apply
  past one line.
- **The gauge is one `fixed` element for the whole document, appended to `body` and
  reused** — never inside the panel it is measuring. A badge appended *inside* the
  body would change the width it is reporting, and `paint()`'s next `empty()` would
  discard it along with everything else the template drew.
- **`grid-template-columns` only resolves to real pixels when it is READ.**
  `display.js`'s track lines are `getComputedStyle(body).gridTemplateColumns`
  *after* layout — `auto-fit`'s own resolved count, not the `minmax()` that
  produced it — so a track no child ever claimed still draws, labelled with the
  browser's own number.

## Who uses this

- **[`ext/editor`](/framework/ext/editor/)** imports `workspace` and `Panel`
  directly and builds its five-region shell from them — the *same* class,
  tree, drag and persistence stack, with its own regions as the `T`
  vocabulary instead of the site's section bands. Not a parallel
  mechanism: `workspace({ saver, templates: REGIONS, seed })`, three keys,
  one call.
- **[`/framework/`](/framework/)**, the framework landing page, imports the
  default `panel(seed)` door to embed a single live `"clock"` leaf as a demo
  band on the homepage.
- **[`styles/layouts/space/compose/`](/framework/styles/layouts/space/compose/)**
  mounts `panel(structure(seed, depth))` and sets `root.depth`, so every bar's
  layout roll rerolls one section at the depth that page is showing. It is the
  only consumer of `structure()`, and the reason `sow()` takes a depth at all.
- Declared as a routable page: `ext/page.js`'s `children:` list includes
  `Panel`, which is what puts this module at `/framework/ext/Panel/`.

## Open

- **Three of the five phase-2 items shipped in the 2026-08-16 wave: `display` on a
  body (`display.js`), cursor-tracking edge strips (`split.js`) and `split()` beside
  `divide()` (`Panel.js`), and **per-axis sizing** landed the same day (`size.js`,
  with the bar writing `w`/`h`), and **self-alignment against the parent** closed the
  set the same evening.** A panel may place *itself* on an axis only where it does
  **not fill** — a filling panel already occupies its slot, so there is nothing left to
  align — **and** where `live_axes(mode, dir)` says the slot lets a child control that
  axis at all. ⚠ The double condition is enforced by the CSS's *shape*, not by a branch:
  `sizing()` writes `--panel-self-x`/`-y` unconditionally, and only rules already gated
  on a non-filling axis ever read them, so "nothing left to align" is true because no
  rule exists to read it. `justify-self` being inert in flex does the other half. A
  control failing either test greys in place and says which.
- **`position` is two words, and both rejections were measured** (2026-08-16). `static`
  and `absolute` — a floating panel's containing block is its parent split's
  `.panel-items` or, for a root leaf, `.panel-workspace`; bounded either way, so **it can
  never leave the workspace** and `panel.css` needed no change. **`fixed` resolves against
  the VIEWPORT** from both of those places and lands over the site chrome. **`sticky` would
  stick to the SITE's page scroller**, five levels up, because nothing between a panel and
  there ever scrolls — its behaviour would be a property of whatever page the workspace was
  embedded in, which is not a panel word. It becomes one the day `.panel-items` scrolls.
  ⚠ Out of flow, `flex-basis` and the floor-on-a-child are both inert and an abspos box
  with no declared extent measures **0×0** — the same containment trap, so every extent is
  restated and capped with `min(x, 100%)`, this time with no `cq` detour because `%` on an
  abspos box resolves against the containing block. `self` needed nothing at all: the two
  custom properties already place it, on the same non-filling rules — and there the gate
  has *teeth*, since an alignment other than `stretch` makes an abspos box shrink-to-fit,
  so writing one on a filling axis **is** the collapse. `grip.css` hides a seam beside a
  floating panel, which separates nothing. Record: `file/size.js.md`.
- The flex-vs-grid decision underneath a symmetric 3×3:
  [panel chrome phase 2](/framework/ai/2026-08-16/panel-icon-buttons/).

**How this module got here.** The 2026-08-16 wave that turned it from chrome into a
direct-manipulation tool — twelve gestures, text persistence, per-axis sizing,
self-alignment, `position`, live duplicates — is recorded with its measurements, its five
adversarially-found bugs and every decision that was weighed and rejected:
[panel swiss army](/framework/ai/2026-08-16/panel-swiss-army/).
- **Three live mounts share one document, not the two originally recorded**
  (`/framework/ext/Panel/`, its `/full/` route, and the 2026-08-13 task
  page) — `Page` caches views, so visiting any two leaves the last writer
  winning. A shared-document registry is the fix if it bites.
- **A slot narrower than 16em still cannot give two hugs 16em each.** The single
  case closed: both extents read `min(--panel-hug, 100cq…)` against the nearest
  slot box (`.panel-workspace` or a split's `.panel-items`), so a 200px workspace
  holds a 200px hug with nothing past the edge and roomy widths are unmoved to the
  pixel. But each panel caps at the *whole* slot rather than its share, so two hugs
  in a 200px row are 200px each and the row scrolls to 400 (it was 496.6). Sharing
  needs a shrink factor on `.panel.hug` **and** a cap of slot ÷ hugs, which is a
  second sizing currency beside `grow` — for an arrangement nobody has asked for.
- **Where a panel's properties live is answered** — a `properties` region in the
  `T` vocabulary ([focus.md](./focus.md)) — but `ext/editor` has not
  adopted it: its own properties region is still hand-rolled from `ext/layout`'s
  word registry, inspecting the selected *block*, which is a different subject
  to a panel. Nothing here touches it; its five regions carry no `focus: true`,
  so no panel in it takes focus and no ring is drawn.
  Its **collision** with the bar is answered: `.panel-controls` is one class on
  whatever a template draws, and the three editor regions whose top edge holds
  controls — palette, layers, properties — now wear it (overlap measured 0),
  while the canvas abstains because it is the document and the status strip
  because a badge is read with the pointer somewhere else.
- **The inspector offers no `grow`.** Sizing is still the grip's alone, which
  keeps one sizing channel — worth reopening only if seams prove hard to hit.
- ~~**Selecting anything pushes the properties rail open, and the push moves the
  target.**~~ **Closed 2026-08-18** — the owner: "too jumpy… I think, if we're
  going to have one, it should remain?" `panel-focus`/`panel-text` now only
  *fill* a rail that is already open (`ext/Panel/tools.js`); `/framework/ext/Panel/`
  and `/full/` open it once at load instead (`dock()`), so the 19rem push happens
  before you start, never mid-gesture, and Alt-drop's freshly-read coordinate can no
  longer land on the previous element.

Full ledger with severities and file:line: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/).


## The flex and grid words — one table, or two hosts? (2026-08-18)

**The finding.** The north star is *"explore flex and grid responsive layouts
quickly and easily"*, and until today flex was `flex-direction: row; gap: 0.5em`
and grid was `repeat(auto-fit, minmax(8em, 1fr))` — two hardcoded lines in
`display.css`. No `gap`, `wrap`, `justify-content`, `align-items`, track count or
`dense` existed as a panel word, in the bar, in the rail, or in `data`.

**Options.** (a) Add each word to `toolbar.js` and again to `properties.js` — the
shape both files already had, six word-sets written twice. (b) One `WORDS` table
in `glyphs.js`, and make both hosts readers of it.

**Verdict: (b).** Ten words are now one entry each; adding an eleventh is one
entry, not two edits, and the two surfaces cannot drift because they iterate the
same object in the same order. What is deliberately **not** in the table, each for
a reason one row cannot express: `template` (a per-document vocabulary, plus
`random`, which is a verb), `w`/`h` (one pick writes TWO keys), `self` (a 3×3
whose buttons go live per axis). Detail: [`words.md`](./words.md).

**How a word lands: a custom property, written by `show()`.** `paint.js`'s
`show()` was already the single writer of the display class; it now writes the
words beside it, so `display.css` reads a body's whole arrangement from one
source. Every fallback in those rules is exactly what they hardcoded before, and
every `Panel.defaults` entry matches — measured, a body with no words chosen
still computes `gap: 7.52px` (0.5em) in flex and `repeat(auto-fit, minmax(8em, 1fr))`
in grid, as it always did.

**⚠ `--panel-tracks`, not `--panel-cols`.** `--panel-cols` is already the picker
grid's own column count (18 readers across `toolbar.css`, `templates.css`,
`toolbar.js`, `properties.js`), and a custom property written on a body
**inherits** into every control surface drawn inside it — the properties rail is
a `T` entry living in a body. One name, two meanings, would have re-columned the
inspector from the panel it is inspecting.

**⚠ `justify-content` and `align-items` were free to take.** The base
`.panel-body` picker writes `--panel-x`/`--panel-y` into `justify-items` and
`align-content`. Flex reads neither: `justify-items` is inert in a flex
container, and `align-content` needs more than one line. So `align` keeps
working under `block` and `grid` exactly as before, and the two new flex
properties collide with nothing.

**`dir` is one key with two readings.** On a split it is the axis of a row of
panels; on a leaf it is `flex-direction` on its body. A panel is one or the
other and never both, so one word says "which way things run" in both — and it
was already in `Panel.defaults`. It is the one new word **not** added to
`Panel.shared`: a live duplicate shares what it holds and how it looks, and a
split's axis is an answer about a slot. The other six (`gap wrap justify items
cols dense`) are shared, because they modify `display`, which was already shared.

**⚠ Picking `display` rebuilds the bar.** `display` is the one word that changes
which *other* words exist, and by decision a `change` never rebuilds a bar. So
the display pick refills the fold in place (`pops` emptied, `verbs()` re-run):
measured, picking `flex` from the bar puts Dir · Gap · Wrap · Justify · Items on
it before the pointer leaves. Nothing else on the bar gained a rebuild.

## Every template draws into one wrapper — so what do the words arrange? (2026-08-18)

**The finding** (`ai/2026-08-18/panel-grid/`): all 28 `T` entries wrap their
drawing in a single `div`, so a leaf's `display: flex|grid` never sees more than
one child on any shipped template. The words were about to be inert on the very
content they arrange.

**Options.** (a) Drop the wrappers from the section adapters and the local
scenes. (b) Add one template whose N pieces are direct children.

**Verdict: (b) — `cells`.** (a) reaches into `styles/sections/` (outside this
module) and deletes the layout container each local scene's CSS is built on,
regressing every existing panel to fix a demo. `cells` is twelve numbered boxes
appended straight to the body, ~4 lines, and nothing shipped loses its wrapper.
Measured: `body > .panel-t-cell` = 12, `body > .panel-t` = 0. **Still open:** the
15 section adapters remain one-child bodies, so the words are real only on
`cells` and on a call site's own drawing.

## The preset door — `structure(seed | text)` (2026-08-18)

`styles/layouts/space/presets.js` has held nine named spec strings
(`document docs shell split mail dashboard landing gallery masonry`) since it was
written, and `structure()` already turned spec text into a Panel tree — it just
had no way in except a seed. It takes a string now: a preset's name, or the spec
itself. Three lines.

**The spec's layout words become panel words, on LEAVES only.** A node with
children is a split, whose arrangement is `dir` plus the grips between its
panels — `wrap` and `gap` have no reader there, and writing them would be data
that draws nothing.

**⚠ Why 0 of 8 sown seeds ever became a grid:** `gen()` emits no `grid` word at
all. Its claims are `flow measure fluid full --basis: --measure:`, and `wall` is
a *role*, not a class it writes. That is the grammar's gap, not the translator's;
`presets.masonry` is the one shipped spec that says `masonry`, and it now
arrives as `display: grid` on its `notes` leaf (measured). Adding a `grid` word
to `spec.js`'s vocabulary is a proposal for the layout space, not for here.

**⚠ The bar's dice still cannot offer a preset.** Its `sow` hook is built in
`workspace.js` (`sow: () => import(…).then(m => repaint(m.sow(item)))`) and takes
no argument, and `workspace.js` was another task's file this round. The nine
presets are one row in the **properties rail** instead, which calls `sow()`
itself. One line in `workspace.js` — `preset => … m.sow(item, preset)` — puts
them on the bar too.

**A nested split inside a leaf is structurally impossible** (a leaf holds no
items), noted while working here and not changed: `panel-grid`'s test-drive hit
it, and it is a `Panel.js` question about the leaf/split distinction, not a
question about words.

## Panel-flow — snapshots, not an inverse-operation table (2026-08-18)

**Question.** A flow is a recorded progression of panel steps, replayable and
steppable. What is a step, and where does the recorder hook in?

**Options.** (a) Hook the six verbs (`divide split close absorb sow move`) and
store the operation plus its inverse. (b) Hook the root Item's `change`/`add`/
`remove` — the three `mount()` already binds — and store the whole tree.

**Verdict: (b), both halves.** A PanelDrag goes through none of the verbs and a
toolbar chip is a bare `set()`, so hooking verbs would miss most of what a person
does; hooking the events catches every path, present and future. And Panel already
serializes losslessly — a snapshot is exactly what the saver writes — so replay is
`Item.hydrate(snapshot)` plus one redraw, with no inverse to get wrong. Stepping
back costs what stepping forward costs, which is the whole reason a scrubber can
exist. Measured: 6 gestures on `/full/` → 6 steps, a 15-panel tree snapshots to
1,513 bytes, and stepping back to 1 then forward to 6 leaves
`JSON.stringify(root.toJSON())` **byte-identical** to the recorded step-6 snapshot
(sha256 `4c87985879a8968f`, both 1,513 chars).

**⚠ `root.toJSON()` is not a snapshot.** It returns the live `data` object and the
live child Items — it is built to be handed to `JSON.stringify`, not to be kept —
so a step taken from it rewrites itself on the next `set()` and every frame reads
as the newest. `capture()` deep-copies. This is the trap that would have made the
whole feature look like it worked while recording nothing.

**One gesture, one step: a trailing 150ms debounce.** One `divide()` fires three
events, a seam drag commits two `set()`s at once, a keystroke fires per character.
Keying on each verb's end instead would be exact and would mean six call sites
announcing a boundary the clock already finds.

**A replay is a real mutation.** The workspace saves what it shows, so scrubbing
back writes that older tree through the saver; stepping forward puts the newest
one back. A flow is a recording of the document, not a preview beside it.

**The strip is the PAGE's.** It mounts beside a workspace (`scrubber($ws)` on `/`
and on `/full/`), never inside a panel's hover bar — a flow belongs to the
document, and in the bar every panel in the tree would carry a copy of the same
control. `Flow.mounted` (pruned to connected roots) is how a headless driver finds
the one it means: the Doc page holds a workspace **plus five demo panels**, and an
SPA keeps the page you came from mounted.

**⚠ Found while driving it: `insert.js`'s `+` eats a seam drag.** It is
`z-index: 5` over `grip.js`'s `2`. A row split's bar covers the top 2.2rem of its
seam; a **nested column split's** bar covers 2.2rem of its own left edge, which is
the middle of the outer seam. Pressing there resizes nothing and opens nothing —
one more measurement under the standing proposal that `insert.js` should go
(`ai/2026-08-18/panel-complexity/`). Not changed here: that file was another
task's.

**The stage stays a composition.** `demo.stage(() => panel(seed))` is the whole
responsive half — the stage owns the viewport and the width presets, `panel()`
owns the arrangement — so it landed as one demo block on `page.js` and no
`panel.stage()` helper, no `Stage` class. Every `demo()` on the page already builds
a stage, so the caption is the feature.

## A full-screen workspace that scrolls — `fill` vs `document`

*"How do we get a full-screen Panel? How do I add sections to it? It seems when
I add a row, it splits the thing, and doesn't make the area grow. WE sort of
need a... workspace? that goes full screen, and is scrollable?"* (the owner,
2026-08-18)

**Options.** (a) A second door beside `workspace()` — `document()` — with its
own class and its own CSS. (b) A **word on the root panel**, `mode: fill |
document`, in the `WORDS` table both control surfaces already read.

**Verdict: (b), one word.** A second door would fork the module in two for one
declaration: two savers to keep in step, two things `sow`, `flow` and every
demo have to know about, and a workspace that could never *become* a document
without being rebuilt. A word is picked and unpicked while you look at it, it
persists like every other word, the recorder replays it as one step, and it
costs the table one row. `mode` was already the key (`fill`, plus a legacy
`hug`), so it did not even cost a name.

**What it means is four CSS rules and nothing else.** The workspace scrolls and
stops stretching its root; the root is as tall as its rows with the screen as a
floor; the root's column and its sections state a real flex basis. Everything
nested inside a section behaves exactly as it does in `fill` — the rules never
reach past the root's own column.

**Nothing is written into the tree, deliberately.** The first build gave every
new row `h: fixed` at 16em in `divide()`, which is what a section *looks* like —
but that height is data, and it outlived the mode: switching back to `fill` read
1 / 241 / 241 / 241 px instead of four even rows. The CSS floor
(`min-block-size: var(--panel-hug)` on the root's children) produces the same
16em section, writes nothing, and leaves `divide()` untouched. **The mode is a
lens, not a mutation** — measured, `fill` after four sections is 181 × 4 = 723,
exactly what it was before the word existed.

**⚠ The trap that cost the most: `.panel-items` is a size query container.** A
size container may not be sized by its own contents, so the root's column
measured **0px while holding 963px of sections**, clipped away by `.panel`'s own
`overflow: hidden`, with nothing thrown and nothing to see. Only the block half
is given up (`container-type: inline-size`): the inline axis is still a slot the
width decides, and `100cqb` inside a section falls through to the workspace,
which is the number it read before.

**Open — three, none of them this task's file.**

- **`sow()` drops the word.** It is the fifth verb that replaces `data`
  wholesale (`item.data = { ...made.data, grow }`), so rolling a preset onto a
  document root reverts it to `fill`. `split()` hands `mode` back to the panel
  becoming the split; `sow()` wants the same line, in `generate.js`.
- **A grip cannot resize a section.** `grip.js` writes `grow` fractions, and
  `flex-grow` is inert in a column sized by its content. A section's height is
  its `h` word — pick `8em` / `16em` / `24em` from the bar.
- **All nine `space` presets open `full fill`,** so none of them reads as a
  document *root*; sown into a section, `document` behaves like any nested split
  and scrolls inside its 16em (measured: the section stayed 241px and gained
  three leaves). A preset is a screen, and a screen is a section.

## Groups — Figma-style drill-down, as a rule (2026-08-19)

*"we might want to drag and drop whole sections, like in Figma... instead of
hovering sub-section panels directly, you have to first select the Group"*
(the owner). The accepted strategy already said never a fourth `Panel`
subclass, so a group is one word on a split (`grouped()`, size.js), on by
default for a document root's own sections, off everywhere else. Full design,
the click/Escape walk and the CSS gate: [doc/focus.md](./doc/focus.md), "Groups".

**Why `properties.js`, not a `WORDS` row.** `glyphs.js`'s `live_words()` only
ever runs from the LEAF branch of `properties.js`'s `fields()` — the split
branch never calls it. A `root`-only flag exists for "the whole workspace's
word"; nothing expresses "splits only". Rather than teach `live_words()` a
second axis for one word, `group` is a line beside `dir`, reading `grouped()`'s
computed default directly (there is no static default to put in
`Panel.defaults` — it depends on *where* a split sits).

**Verified working as shipped: whole-section drag needed no `PanelDrag.js`
change.** `workspace.js`'s `view()` already gives every panel WITH a parent a
bar handle, leaf or split — a section is exactly as draggable as a leaf today.
Headless: a 2-child section moved by its own handle, subtree and count intact.

## Centre-drop onto a leaf: content vs. empty (2026-08-19)

Two reports from the owner about `PanelDrag`'s centre zone (the inset
indicator): *"i tried to split and then drag the new panel inside the old
one... doesn't seem to work"*, then, more precisely, *"when dragging one
section into another empty panel... what I would expect... is that the
dragged panel goes inside the transparent bg empty panel, just as it would
indicate, with padding added."*

**The mechanism itself was never broken.** Headless, two sibling leaves,
dragged one onto the other's centre by its own bar handle: `PanelDrag.release()`
already called `into.item.split(dir, arrival)` and the drop landed correctly.

**The actual bug: `split()` always relocates the target's CONTENT to a fresh
child, even when there is none to relocate.** Centre-dropping onto an EMPTY
leaf (nothing chosen — the transparent box the indicator promises to fill)
produced a split holding TWO children: a spurious blank duplicate of "nothing"
*plus* the dragged panel — which reads exactly like the report, a nest that
"doesn't work" because it never becomes the sole occupant the preview implied.

**Fix, in `PanelDrag.js` alone** (`Panel.js`'s `split()` is another task's
file, and changing it for every caller was the wrong size fix for one
caller). `nest(into, arrival, dir)`: a target already carrying `data.template`
keeps `split()`'s existing behaviour, unchanged. An empty target skips it —
`arrival` becomes its ONLY child, and the target keeps its own data (tone,
words) as the container rather than `split()`'s usual full wipe, composed from
`Item`'s own `move()` rather than a new `Panel` verb.

**`--panel-pad: 1em`**, set on the fresh container's `.panel-items` the moment
it nests into an empty leaf — the inset the preview showed, made real. This is
`panel-pad-gap`'s word (not landed yet); the property name is chosen to be the
one that task adopts, so nothing here gets redone once it does.

Proved headless, both branches: an empty target ends up with exactly one
child (the dragged panel) and `--panel-pad: 1em`; a target with content ends
up with two (its own content, relocated, beside the dragged panel) — same as
`split()` always produced. Screenshots: `drop-1-hover.png` (indicator showing,
mid-drag), `drop-2-mid.png`, `drop-3-after.png`, in `ai/2026-08-19/panel-groups/`.

**Storage, for the record.** Every panel is a plain `Item` — `items` a `List`,
events, a `Saver` reachable through `save()`/`delete()`'s delegation up. A flow
(`flow.js`) is `Item` snapshots. None of this is a `Panel` feature: history,
undo and persistence belong to `Item`/`List`, and every panel gets them for
free by being one.

## `pad`, `gap`'s knob, and staying out of `ext/layout`

**The ask:** a body has no way to add its own padding, and `gap`'s four
presets can't reach a free value — both raised by the owner, 2026-08-19.

**`pad`** is a new `WORDS` row (`glyphs.js`), rail-only, no `modes`: unlike
`gap`, which means nothing until children are laid out, padding insets a
body's content under any `display`. It carries **no `Panel.defaults` entry**
— on purpose. `PanelDrag`'s centre-drop nest already writes `--panel-pad:
1em` straight onto a fresh container's `.panel-items` (the entry above), and
`.panel-body`'s rule (`panel.css`) is `padding: var(--panel-pad, 0)` with no
value stamped by `Panel.defaults`, so an untouched body **inherits** that
container inset rather than a default shadowing it. A template keeps its own
inner padding on its own inner element (`templates.css`) — this is the
BODY's, one layer out; the two never fight because they land on different
boxes.

**The knob.** `pad` and `gap` both take `knob: true`. `ext/layout/
controls.js` already has a `knob()` — the 10-line slider idiom — but
2026-08-15's verdict severed every import from `ext/Panel` into `ext/layout`,
not even `btn()` (above, "ext/layout's bar is gone from the panel body").
**Verdict: copied, not imported** — `properties.js` grew its own `knob()`,
same shape, writing through `item.set()`/`repaint()` (persists, repaints)
where the original writes straight to an element's inline style (neither
persists through `Saver` nor survives the next `paint()`). One edge not
reopened for one control. The bar's pop stays presets-only — a pop is a grid
of buttons, a knob wants room a rail has and a pop doesn't — so `toolbar.js`
needed no change at all.

Reading tolerates a knobbed value with no code change: `word_vars()` and
`live_words()` already read `item.get(key)` as a plain **value**, never an
index into `names` — a `WORDS` row was never keyed by position, so `"1.25em"`
paints exactly like `"1em"` would. The preset row's `on` class already
compares by equality (`target.get(key) === name`), so a free value simply
lights nothing — no special-case needed there either.

**⚠ Commit on `change`, not `input`.** The first draft called `item.set()` on
every `input` tick — and `set()` raises `change`, which `properties()`'s own
listener reads as "rebuild the whole rail". Rebuilding the row a range input
lives in *while its own drag is still in progress* drops the browser's
pointer capture on the thumb the mid-gesture just replaced — the same class
of bug a React app hits swapping a controlled input's DOM node on every
keystroke. `input` now only updates the number beside the slider; `change`
(fires once, on release) commits and triggers the one rebuild that matters.

**⚠ `properties()` called directly needs a `.panel-workspace` ancestor, not
just a mounted item.** Proving this headless by calling `properties(root)`
outside the normal drawer/T-vocabulary path (`inspects()`, above) surfaced a
real trap in existing code: `hear()`'s dead-closure guard —
`$props.el.closest(".panel-workspace") ? render() : stop()` — reads "am I
still attached anywhere" as "am I inside a `.panel-workspace` box", and
unsubscribes on the very first `change` if not. Appending the rail as a
sibling of the workspace box (not a descendant) silently froze it after one
update. Not a `properties.js` change — a note for the next direct caller.

Proved headless: `pad` preset → computed padding; knob to a free value →
computed follows, no preset lit; `gap`'s knob under `flex` → computed `gap`
follows; a reload (`Item.open()` on the same `MemorySaver`) restores both.
`ai/2026-08-19/panel-pad-gap/`, `pad-gap-rail.png`.

## 2026-08-19 — a panel is a `div` in flow; the edge strip grew two more gestures

**The ask** (the owner): "panels should probably default to default `div` behavior —
auto-height, fill width… you could give a panel a min-height to prevent it from collapsing…
but the edges should still have resize handles. maybe for a default situation, the top and
left resize handles aren't useful (they wouldn't work properly anyway), but right and bottom?
also, right click should reset the resize handle's effect. that way, for any panel in 'flow',
adding a panel or section or content within should automatically grow the panel(s) themselves,
not just crop/scroll."

### `Panel.defaults.h` is `hug`, and a saved document moves with it

`extents()` answered `fill` for any panel that never wrote `h`; it answers `hug` now. **That
is a real change to `/data/panels.json` and it is the right one** — nothing in that file wrote
`h`, so every panel in it was filling by accident of a default rather than by a choice
somebody made, and the owner's sentence above is the choice. `fill` is still one click away on
the bar and in the rail, and the moment a panel writes it the word is in the file and immune.
Nothing rewrote the file: the words are read at draw time.

Verified unmoved, headless at 1280×900, root heights before and after the flip:
`ext/editor` 662 → 662, `Workspace/` 241 → 241, `playground/` 862 → 862 (root 2481, scrolling),
`ext/files` 451 → 451. Zero console errors on all five pages.

### Three rules carry it, not a new mechanism

1. `.panel-workspace { height: var(--panel-height, auto) }` — a workspace nobody gave a height
   to follows its root. Every caller that wants a screen already sets the token.
2. `align-self: var(--panel-self-y, stretch)` on the hugging cross axis, with `size.js` writing
   `--panel-self-*` **only when the panel chose a `self`**. `Panel.defaults.self` answers `tl`,
   so `item.get()` wrote `start` on every panel ever built and no rule could have a different
   default. One word now covers both halves of the truth: a root stretches to a workspace that
   has a height, and measures its content when the workspace is `auto`.
3. `flex-basis: auto` (keeping `--panel-grow`) for a hugging HEIGHT on the main axis — the pair
   `mode: document` has run on since earlier the same day. A hugging WIDTH keeps `flex: 0 0 auto`.

**Cost, stated:** picking `hug` for a HEIGHT no longer visibly shrink-wraps a panel in a row —
it stretches, like a div, unless a `self` is also chosen. That is the same trade as making the
default right, and `fixed` is the word for "exactly this tall".

### A split now matches its own preview

The owner: three columns came back 33/33/33 where the ghost drew 25/25/50. `restyle()` copies
the struck panel's whole `grow`, which is right for a NEST (both children of the fresh
container start level) and wrong the instant `divide()` takes its same-direction branch and
drops the twin into the row — two full shares where there was one. `split.js`'s commit states
the share itself: **beside → half the struck panel's own grow to each side; nested → 1 and 1.**

**Flat halving beats the owner's nesting alternative** (the parent's 50:50 pair moving into one
side). No tree depth is added, so seams stay peers and a reader can still drag any of them
against any other; the grows survive the chrome as `flex: n` on a plain section, which a nested
wrapper would not; and `close()`/`absorb()` have nothing extra to unwind. Nesting would give the
same picture at a cost paid on every later gesture.

Measured in a 600px workspace: split right → 300/300; split the left one's right edge →
**150/150/300** (grows 0.25/0.25/0.5); again on the middle → 150/75/75/300. The ghost's box
before the commit and the arriving panel's box after it are the same rect, `{x:150, w:150,
h:469}`. `add` (the Workspace bar's `+`) never comes through that line and still reads
200/200/200.

### Two traps that cost a measurement each

- **`min(var(--panel-h-at), 100%)` resolves to ZERO against an auto-height workspace.** A
  bottom-edge drag committed `h: fixed, h_at: 39.25em` and the root measured 0px. A percentage
  *max* against an indefinite parent is `none`; a percentage *size* is 0. The block-axis caps
  are `block-size: <length>` + `max-block-size: 100%` now, and the main-axis one is a bare
  basis (flex-shrink already caps it). The inline axis is untouched — a workspace always has a
  definite width.
- **Two floors tied on specificity and the loser was decided by load order.** `size.css`'s new
  `--panel-min` rule and `panel.css`'s `--panel-section` rule both said `min-block-size` on the
  same element at (0,3,0); the playground's document sections dropped 241px → 75px. `panel.css`
  carries `.panel-workspace` on the front of that rule now.

### Left deliberately

- **A root that is already a SPLIT still has no edge strips.** `workspace.js` builds them only
  for a leaf, and they cannot simply be extended: a split's strips lie over its children, which
  own the hover (`.panel:hover:not(:has(.panel:hover))`), so the `.panel-group` reveal pattern
  would have to travel with them. Every leaf, and every leaf root — which is most Demo panes —
  has all three gestures today.
- **The ghost is a side, not a height, for a vertical split of a hugging panel.** It draws 50%;
  the section that arrives measures itself, so a 469px panel split downward becomes 469 + 241.
  That IS the flow behaviour the ask names ("adding… should automatically grow the panel"), and
  predicting the arrival's height before it exists is not possible. Horizontal splits match
  exactly, and so do vertical ones on a `fixed` height.

## Item selection — an element with words, not a Panel (2026-08-19)

**Question.** The owner: *"even though each item isn't a panel itself, they
could easily act like it… they should at least be selectable, so the sidebar
can display flex/grid properties per item."*

**Verdict — no subclass.** A cell inside a flex/grid leaf's body is
selectable and carries its own rail rows (`grow`/`basis`/`order`/`self` under
flex, `span`/`row_span`/`self` under grid), but it stays a plain element, not
a `Panel`. A `Panel` per cell buys a bar, drag handles, a saved tree node and
a whole `view()` recursion for every one of twelve boxes; none of that was
asked for, and the words transfer verbatim the day the chrome around them is
removed — an element that GAINS chrome later is a smaller change than a
`Panel` that has to SHED it.

**The shape is `text.js`'s run selection, one level up** — a direct child of
the body, the same already-focused-panel gate, the same module-scope state.
Reused rather than duplicated: a click that reaches a bare cell has already
failed the run `SELECTOR`, so the two selections can never both be showing.
Full account: [doc/focus.md](./focus.md#item-selection-a-cell-one-level-up-from-a-run-2026-08-19).

**Persistence rides `data.items`, keyed by `data-cell` (`cells`' own stamp) or
the child's index** — the same read-modify-write `persist.js`'s `record()`
already does for text, minus the path-walking a run needs (the caller already
holds the cell). ⚠ **The key collides on purpose with `item.items`** (the
List of child panels, an instance property, never in `data`) — same word,
two different things, because the brief asked for `data.items` by name and a
Panel's `items` List was never a candidate for confusion at the DATA level
(`toJSON()` emits `data` and `items` as sibling keys already). Noted here so
the next reader is not the one who finds it by surprise.

**No `apply()`/`repaint()` for an item word write.** Every leaf word goes
through `apply()`, which repaints the body — correct for a leaf's own word,
fatal for an item's, since a repaint throws away the very DOM node the click
just selected. An item word instead writes its custom property straight onto
the live cell and persists through `set_item()`; `panel-item` (`tools.js`,
mirroring `panel-focus`) redraws just the rail.

**Files touched, none outside the fence:** `glyphs.js` (`ITEM_WORDS`,
`item_vars`, `live_item_words`), `persist.js` (`item_of`, `set_item`,
`items_apply` — 30 lines, under the 40-line budget that would have earned a
new `items.js`), `templates.js` (`cells` stamps `data-cell`), `text.js` (the
selection — focus.js was reassigned to a concurrent task mid-run, coordinator
message 2026-08-19), `properties.js` (`item_words()`, inline under the
leaf's own rows), `tools.js` (one `panel-item` listener), `display.css` (the
`--item-*` landing rule plus `.panel-item-on`, negative-offset unlike
`.panel-text-on` since a cell shares an edge with its neighbours).

**What is NOT built.** Item drag-reorder — next, and probably `PanelDrag`'s
own idiom rather than a new one. Multi-select across cells — the same open
question `focus.md` already names for panels themselves (`focus` is a single
id today), unbuilt for the same reason.

**A cosmetic collision, left as found:** the rail can show two rows both
tagged **"self"** at once — the leaf's own placement (a 3×3 of seats) and the
selected item's (`auto · start · center · end · stretch`), drawn last.
Different pictures and values, same tag text; not fixed here since renaming
either is a word-table decision, not a selection one.

**Proven headless** (`ai/2026-08-19/panel-items/`, `item-selected.png`):
click cell 3 twice → item rows appear; `grow 2` → `flexGrow` `"2"` on cell 3
only, cell 1 stays `"0"`; `self center` → `alignSelf` `"center"`; grid
`span 2` → `gridColumnStart` `"span 2"`; a forced `repaint()` (paint.js,
untouched) replays both from `data.items`; `toJSON` → `Panel.hydrate()`
round-trips `data.items` exactly; Escape once clears the item and keeps the
leaf focused, Escape again drops the leaf (focus.js's own, unmodified); zero
console errors on `/framework/ext/Panel/` and `/framework/ext/Panel/demo/`.

## One selection per PAGE, and hover says what a click takes (2026-08-19)

*"i'm still getting selection state issues.. we really need to lock this down…
right sidebar: 'nothing selected', but an orange border on the last selected panel
that doesn't disappear (and clicking off doesn't help)"* (the owner)

**Measured first, on the page the owner was looking at** —
`/framework/ext/Panel/` draws **sixteen** `.panel-workspace` boxes, seven of
which are views of ONE root (the viewport set). Five separate causes, each
reproduced headless before anything was changed:

1. **`land()` cleared rings inside the TARGET's own workspace only.** The
   previous selection's ring — in another box, or another root — survived every
   time. Two rings after two clicks.
2. **`views` (paint.js) holds ONE entry per item**, the last box drawn. A click
   that drilled onto a group painted its ring into a **hidden** twin pane while
   the visible box showed nothing and the rail said `split`.
3. **`selection()` bound its listeners once per BOX.** Seven boxes, seven Escape
   handlers: the first stepped out to the group, the rest read the new state and
   returned early with their own rings still on screen.
4. **Nothing was page-wide.** Clicking a panel in a second root gave **three**
   rings at once, and the end state was the owner's report exactly: rail
   *"nothing selected"*, two permanent rings, further Escapes doing nothing.
5. **`land()` returned early when the id was unchanged.** `ext/layout` redraws
   the SHARED rail from its own capture-phase document click, so a click that
   announced nothing left the rail showing somebody else's content under our ring.

**The invariant, in one file.** `focus.js` is now the only writer of
`.panel.focus`: `rings()` clears **every** ring on the document, then paints
**every live view** of the selected panel. One selected panel per page; a root
drawn into seven boxes wears seven rings of the same panel, so whichever box is
on screen is right and a viewport switch can never show a stale one. Roots release
each other with **no registry** — each listens for `panel-focus` and lets go when
the detail's `root()` is not itself.

**Deleted, not guarded:** the `$target` argument and its null check, the
per-workspace `closest(".panel-workspace")` clear, the `views` import (focus.js
no longer reads paint.js), and the unchanged-id early return. `focus(item,
$panel)` still takes the clicked view because `workspace.js` still passes it —
that argument can go when the same fence opens.

**How a DOM element and a panel find each other, with no ids.** `pair(root)`
walks the tree and the box together — the same walk `view()` made — and hands
back both directions. That is what lets one `drill()` serve the click **and** the
hover, and what makes "every live view" reachable at all.

**Clicking off now deselects.** A click on anything that is not a workspace and
not a surface that acts on the selection (the rail, the workspace bar, the flow
strip, the dev rail, the top layer) drops it. ⚠ **Capture phase** — the same trap
`ext/layout` records: the Workspace's viewport buttons call `draw_bar()`, so the
clicked button is detached by the time a bubbling listener runs and `closest()`
on a detached node reads as a click outside. Measured: every viewport switch
silently dropped the selection until this moved to capture.

**Hover is a JS class, not CSS.** What a click selects depends on `root.focus`
(inside an unopened group the GROUP is the target), which CSS cannot express —
`.panel-hover` is set from the **same `drill()`** the click runs, so the two can
never disagree, and `mark()` re-runs after every landing because drilling changes
the answer with the pointer standing still. An inspector is marked never: a click
on one takes no selection.

**The `+` on a repeating run rides that class** (`repeat.css`) — `opacity: 0`
until its panel is the hovered target or the selection, so it inherits the group
gate for free. ⚠ Opacity, never `display`/`visibility` on a grid item: it has to
keep its slot. Measured — twelve tile rects, zero moved.

**Proven headless** (`ai/2026-08-19/panel-selection/`): two panes / two roots →
one ring, rail agrees, Escape → zero, click the page background → zero; the
document workspace → 7 rings, all one panel, one shown, through group → leaf →
Escape; a click on an inspector leaves the selection untouched and marks nothing;
the playground's `fill → all → 1 → twin` keeps the ring on the shown box every
time; a rail control never deselects; the `+` hidden cold, shown on hover, no
layout shift; zero console errors on `/framework/ext/Panel/`, `/demo/`,
`/playground/`, `/Workspace/`, `/framework/ext/editor/`, `/framework/ext/layout/`.

**Still not ours to fix:** `ext/layout`'s `refresh()` has no ownership test, so it
still redraws the shared rail on every click — announcing every landing is the
compensation, not the cure. And the `.panel.focus` ring rule still lives in
`panel.css`; it belongs beside its hover twin in `focus.css` and should move once
the flow-sizing task's fence opens.
