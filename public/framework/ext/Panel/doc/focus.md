# Focus, and the panel that reads it

`properties` is a `T` entry like any other, and the panel that wears it inspects
whichever panel is **focused** — its template, tone, alignment and sizing, as
live controls. Two of them side by side both track the same panel, because an
inspector is a panel: layering, resizing, dragging and persistence all come from
the workspace it is already in.

The recommendation this implements, with the four candidates it was chosen over:
[sidebar strategy](/framework/ai/2026-08-15/panel-ui-overhaul/doc/sidebar-strategy.md).

## The invariant: one selection per PAGE (2026-08-19)

**At every moment exactly one panel on the page is selected, or none. Every live
view of it wears the orange ring, nothing else does, and the rail names that
panel or says nothing is selected.** `focus.js` is the only writer of
`.panel.focus`, and one function is the only place it is written:

```js focus.js
function rings(root, target){
    document.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
    if (target) pair(root).els.get(target)?.forEach(el => el.classList.add("focus"));
}
```

Clearing the **document** rather than one workspace is the whole page-wide half.
Before this, `land()` cleared only inside the target's own `.panel-workspace`,
so the previous ring survived — in the other pane of a demo, in another root on
the same page, or in a hidden viewport box. Measured on
`/framework/ext/Panel/`: two clicks left two rings, a third left three, and the
end state was the owner's own report — the rail saying *"nothing selected"* over
two rings that no further Escape could clear.

**Every live view, not one.** A `Workspace` draws N boxes of ONE root (the
viewport set is seven), and `paint.js`'s `views` WeakMap holds **one** entry per
item — the last box drawn. Landing through it painted the ring into a hidden twin
pane while the visible box showed nothing. So "exactly one selection" means one
*panel*, and as many rings as that panel has drawn views. A viewport switch then
cannot show a stale ring, because none of them is stale.

**Roots let go of each other with no registry.** Every root listens for the
`panel-focus` it did not send:

```js focus.js
listen("panel-focus", e => { if (e.detail?.root() !== root) drop(root, false); });
```

`false` is "quietly" — the announcement that made us let go is already in flight,
and a second one would fight it. A `null` detail (a real deselect anywhere on the
page) matches too, which is what makes Escape page-wide.

**Pairing the tree with the DOM needs no ids.** `view()` draws the tree by
recursion; `pair(root)` walks the same shape again over each live box and hands
back both directions at once — item → its elements, element → its item. That one
map is what makes "every live view" reachable, and what lets the click and the
hover share a single `drill()`.

## Focus is a selection, and selections do not serialize

```js focus.js
export const focused = item => { const root = item.root(); return root.find(root.focus); };
```

`root.focus` is an **id on the root panel's instance**, exactly where
`root.templates` already rides — assigned by the view, never by `hydrate()`, and
absent from `toJSON()`, which emits `type`, `id`, `data` and `items` only. A
panels.json diff across a session of clicking confirms it: the file gains
`template`, `tone`, `align` and `mode` from the inspector's own writes and
nothing else.

An **id** rather than a node, for the reason `ext/editor` records: a structural
verb can leave a remembered object detached from the tree it came out of. Reading
through `root.find(id)` means a focused panel that has left the document simply
resolves to nothing.

## What takes focus, and what does not

A click on a panel's **own bar or body** — nothing else:

```js workspace.js
.click(e => {
    if (e.target.closest(".panel-bar, .panel-body")?.parentElement !== $panel.el) return;
    if (!inspects(item)) focus(item, $panel);
});
```

The `parentElement` test is what makes the **innermost** panel win: a click in a
nested leaf bubbles through every ancestor's handler, and only the leaf's own
body answers to it. No listener stops anybody's event, which is what keeps the
templates' own interactive content (`space`'s dice, a section band's buttons)
working.

⚠ **A grip is deliberately outside that test.** The divider between two panels
lives in `.panel-items`, and `setPointerCapture` retargets the click at the end
of a resize — so before this rule, dragging a seam focused the split that owned
it. A drag is not a selection.

**An inspector never takes focus.** `focus: true` on a `T` entry means "this
entry reads the focused panel", and `inspects()` is the one predicate over it. A
clicked inspector that focused itself would be holding controls that edit the
panel the controls are inside — one click on `template` and the surface you were
using is a clock. The consequence is that an inspector's own words are edited
from its own bar, which is where a lone panel's properties have always lived.

**Deselecting is Escape**, anyone dispatching `panel-unfocus` on the document —
the dev rail's `page` button is the second one — **or clicking off** (below). A
click *inside* a panel cannot be the toggle: the test above answers to a click
anywhere in a panel's **body**, so using what is inside a panel would be how you
let go of it. Restricting the toggle to the bar was the other candidate and is
worse — the bar is a row of buttons, and every one of them would drop the
selection as a side effect.

## Clicking off (2026-08-19)

The owner: *"clicking off doesn't help"*. It does now. A click on anything that
is **not** a workspace and **not** a surface that acts on the selection drops it:

```js focus.js
const OFF = ".panel-workspace, .panel-workspace-wrap, .drawer, .panel-flow-bar, .dev-bar, dialog, [popover]";
listen("click", e => { if (!e.target.closest?.(OFF)) drop(root); }, true);
```

Page prose, a heading, the background — all of them mean "nothing, please". The
rail, the workspace's own bar (its `+` adds beside the **focused** panel), the
flow strip, the dev rail and anything in the top layer are named, because a click
there is part of using the selection, not leaving it.

⚠ **Capture phase**, the same trap `ext/layout` records beside its own listener:
a control that redraws its bar has **detached** the clicked button by the time a
bubbling listener runs, and `closest()` on a detached node reads as a click
outside. Measured — every viewport switch in the playground silently dropped the
selection until this moved to capture.

⚠ **A landing always announces**, even onto the panel already selected. It used
to return early; `ext/layout` redraws the shared rail from its own document click
(below), so a click that announced nothing left our ring over somebody else's
rail. Re-announcing is the compensation, not the cure.

**And the selection is announced on the document**, because an `Item` event only
reaches something holding the root, and nothing outside a workspace ever does:

```js focus.js
const announce = item => document.dispatchEvent(new CustomEvent("panel-focus", { detail: item ?? null }));
```

`dev/DevBar/layout.js` listens and points `ext/LayoutTool` at the focused panel,
so clicking a panel measures *that panel* — 13 nodes and 129px rather than the
page's 948 and 1328 — and Escape puts the tool back on `.app`. Two event names
and the `.panel.focus` class are the whole contract; neither module imports the
other, and nothing here knows whether anybody is listening.

⚠ The listeners are bound to the **document** and unbind themselves once
`$root.el.isConnected` goes false, the same self-cancelling shape
`properties.js` uses: the root outlives every DOM it draws, so nothing else was
ever going to remove them.

**Focus clears when its panel leaves the tree**, and nothing takes its place:

```js focus.js
root.on("remove", () => queueMicrotask(() => {
    if (!root.focus || root.find(root.focus)) return;
    delete root.focus;
    root.emit("focus", null);
}));
```

Falling back to the parent was the alternative and reads worse: closing a panel
would silently point every inspector at a split nobody selected. The empty state
says what to do instead. ⚠ The microtask is load-bearing — `Item.move()` is a
`remove` followed by an `insert`, so a synchronous check would unfocus a panel
in the middle of being dragged.

## Two rings: the one you have, and the one a click would take

```css panel.css
.panel-workspace .panel.focus::after       { box-shadow: inset 0 0 0 2px var(--prim); }
```
```css focus.css
.panel-workspace .panel.panel-hover::before { box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--prim) 55%, transparent); }
```

Both are pseudo-elements, `inset: 0`, `z-index: 2`, inert — so they cost the panel
no border box and nothing moves when either appears. Solid is the selection;
lighter is the offer.

*(The `:has(.panel-props)` guard the ring once carried is gone — 2026-08-16, the
rail became a document-level surface, so there is always a reader.)*

## Hover says what a click selects — from the same `drill()`

The owner, 2026-08-19: *"whenever hovering, we should get a strong visual feedback
of what will be selected when we click. it seems sometimes this doesn't happen."*

CSS cannot express the answer: inside an unopened group the **group** is what a
click takes, and that depends on `root.focus`. So `.panel-hover` is written by JS,
from the **same `drill()`** the click runs — one function, two readers, which is
the only way the two can never disagree:

- inside an unopened group → the **group** lights;
- once that group is the selection → the **child** lights;
- the selected panel itself → **nothing** (its own ring already says so);
- an **inspector** → nothing, because a click on one takes no selection.

⚠ **A selection change re-asks.** `mark()` runs again at the end of every landing
and every drop: drilling into a group changes what the next click would take with
the pointer standing perfectly still.

**The `+` on a repeating run rides the same class** (`repeat.css`) — hidden until
its panel is the hovered target or the selection, so it inherits the group gate
for free (the owner: *"the + … should probably only appear when hovered"*, and
*"that hover should be restricted to when the parent is selected"*). ⚠ `opacity`,
never `display` or `visibility: hidden` — the tile is a real grid item and has to
keep its slot, or every card beside it moves the moment you point at one.
Measured: twelve tile rects, zero moved.

## How the inspector re-renders — and unbinds

Two listeners on the root, because `Item` events bubble up to it: `focus` (the
selection moved) and `change` (any panel's data changed — `Item.emit` does not
say which, and re-reading the focused panel is cheaper than caring).

```js properties.js
const hear = () => { $props.el.closest(".panel-workspace") ? render() : stop(); };
const stop = () => { root.off("focus", hear); root.off("change", hear); };
```

The root outlives every panel drawn from it, so a listener bound to it survives
the DOM it was drawing — a template switch, a structural redraw, a close. Rather
than a teardown hook the module does not have, each listener asks whether it is
still in a workspace and **unbinds itself** if it is not: one wasted round, then
gone. (`clock`'s self-cancelling timer is the same shape.) `emit()` iterates a
copy of its listener list, so unbinding during a dispatch is safe.

⚠ **Every refill is inside `$el.empty(fn)`** — `render()` never builds a factory
after an `await`, and the entry itself is the lazy-import-resolving-to-a-function
shape the rest of `templates.js` uses.

## Writing back: `set()`, then `repaint()`

Every chip is `target.set(key, value)` — the same call the bar makes, so the
root's own listener saves and no second write path exists. What the inspector
does *not* have is the target's DOM, which the bar gets for free from
`view()`. Hence one exported function:

```js paint.js
export function repaint(item){
    const seen = views.get(item);
    if (!seen) return item;

    sizing(item, seen.$panel);
    seen.$items?.[item.get("dir") === "col" ? "ac" : "rc"]("v");
    if (seen.$body) paint(item, seen.$body);
    return item;
}
```

`views` is a `WeakMap` rewritten on every draw. The alternative was making
`change` redraw the whole tree, which is precisely the thing `mount()` refuses to
do — a control whose own event destroys the element holding it. Redrawing *one
other panel* has no such problem.

## What the inspector offers is what the bar offers

A leaf gets `template`, `tone`, `align`, `mode`; a split gets `dir`. ⚠ `hug` on a
split collapses it to 0px — measured: a hugged split's children size themselves
from a parent that is sizing itself from them, and the result is a panel with no
box left to point at. The bar withholds the button for the same reason (it sits
inside `if ($body)`), and the grip's hug/fill menu — the last door that could
still reach a split — now filters it too (`mode !== "hug" || item.leaf()`),
offering `fill` on both sides and leaving hug's grid cell blank beside a split.

The template picker is the bar's popover with room: icons, `auto-fill`ed to
whatever width the region has, so a 28-entry vocabulary is four rows in a rail
and two in a wide one. Word sets keep their declared column count, because
`align` is a 3×3 or it is not a picture of the nine placements.

## A second selection, one level down, in a different file

`text.js` announces `panel-text` on the document — the identical shape, filling
the identical rail — for a run of prose *inside* a leaf's body. It is not built
on this mechanism; it is a second, independent `let selected` living in
`text.js`, with its own `stopPropagation()` so picking a word never also
focuses the panel underneath it. Two selections, never both showing at once,
because the last thing you pointed at is the thing the rail is showing.

## Groups — Figma-style drill-down (2026-08-19)

*"we might want to drag and drop whole sections, like in Figma... instead of hovering
sub-section panels directly, you have to first select the Group... this also makes it
easier to select parent vs child (first click selects parent, always, second click allows
selection of next level, etc)"* (the owner)

**A group is a RULE on a split, not a class** — the accepted strategy says never a fourth
`Panel` subclass. `size.js`'s `grouped(item)` is the one predicate: `item.data.group` if set,
else `"on"` for a document root's own direct children (its sections) and `"off"` everywhere
else — today's plain innermost-wins, unchanged, unless a split says otherwise. `sizing()` —
already the sole writer of a panel's own classes — writes `.panel-group` from it.

**The click drills; Escape backs out — one function, reversed.** `focus.js`'s `drill(item)`
walks the clicked panel's ancestor chain, OUTERMOST first, filtered to the grouped splits on
it:

```js focus.js
function drill(item){
	const root = item.root();
	const current = root.focus ? root.find(root.focus) : null;
	if (current === item) return item;

	const groups = groups_on(item);
	if (!groups.length) return item;

	const idx = groups.indexOf(current);
	if (idx === -1) return groups[0];
	return idx < groups.length - 1 ? groups[idx + 1] : item;
}
```

No group on the path → `item`, exactly the old behaviour. A group on the path and nothing
selected → the outermost one. Already inside the focused group → one group further in, or the
leaf once no deeper group is left. The panel already focused → itself, checked FIRST — without
it a re-click of an already-focused **leaf** (never itself a group) reads as "nothing selected
on this path" and jumps back out to the outermost group. `step_out()` is the same walk read
backwards: the group just inside the current selection, then the one outside that, then `null`
— a real unfocus, only once nothing is left to step out of.

**Landing on a panel that isn't the one clicked needs its DOM**, which `focus()` never held
before groups existed. It briefly borrowed `views` (`paint.js`'s WeakMap) — one entry per
item, so the ring landed in whichever box was drawn last, which is how a drill onto a group
painted a hidden twin pane. `pair(root)` replaced it, and `focus()` is now the whole call:

```js focus.js
export function focus(item){
	land(item.root(), drill(item));
}
```

⚠ Import direction: `focus.js` reads `size.js` (for `grouped()`) and `View` (for its own
stylesheet) and nothing else in this directory; the `paint.js` edge is gone. The edge to
watch is that `size.js` must never import `focus.js` back — its own dependency chain runs
through `tools.js` → `toolbar.js` → `size.js`, which would close the loop instantly.
(`workspace.js`'s `view()` still calls `focus(item, $panel)`; the second argument is ignored
and can go when that file is next open.)

**Hover is gated at the group boundary, one level of "innermost wins" collapsed onto it.**
`panel.css`: inside a `.panel-group` that is not `.focus` and holds no `.focus` descendant, a
descendant panel's own `.panel-bar`/`.panel-edge`/`.panel-display` go inert (`opacity: 0`,
`pointer-events: none` — the bar's BUTTONS too, `.panel-bar *`, matching toolbar.css's own
two-part reveal or a gated bar stays draggable) and the group's own bar/edges light on hover
instead — reaching into toolbar.css's and split.css's classes from panel.css rather than
editing either file. Higher specificity than their base reveal rules, so file load order
cannot flip it. The instant the group (or anything under it) holds `.focus`, the guard drops
and ordinary innermost-wins resumes underneath, unchanged. (That gate is about *chrome*
— which bar and which edges answer the pointer. The **ring** that says what a click would
take is `.panel-hover`, above, and it obeys the same door because it comes from `drill()`.)

**Dragging a whole section needs no PanelDrag change** — every panel with a parent already
gets a bar handle (`workspace.js`'s `view()`, unconditional on leaf vs split), so a section's
`PanelDrag` instance is exactly as capable as a leaf's. Verified headless: a 2-child section
dragged by its own handle moves as one, count and subtree intact.

Proven headless, six numbered checks against a document root with 2 sections (each a 2-column
split): hover-before-click gates correctly, click #1 lands on the group, click #2 lands one
level in (the leaf — the column split under it is never itself a group by default), Escape
returns one level, `group: off` restores the old direct-click behaviour, and a whole-section
drag reorders with counts equal. Zero console errors on this page and on `ext/editor` (0
`.panel-group` elements there — none of its five regions is a document root).

**The toggle is the rail's alone again (2026-08-19, the bar sweep).** It was briefly on the
bar too; the sweep took every word off the bar, and `properties.js`'s `group_words()` — one
button that lights, like `wrap` — is the only place it is drawn.

## Still open

- **The workspace's own words are not here.** `grow` is the grip's, and a
  panel's size is still edited by dragging a seam. Whether the inspector should
  grow a number field for it is unanswered.
- **`ext/editor` has not adopted it.** Its `properties` region is still
  hand-rolled from `ext/layout`'s word registry, inspecting the selected
  *block*, which is a different subject to a panel. Nothing about this change
  touches it: the editor's five regions carry no `focus: true`, so no panel in
  it takes focus and no ring is drawn.
- **A second inspector is a second full re-render on every change.** Fine at two;
  the listener count is one pair per inspector per draw, pruned lazily.


## The rail is SHARED, and three ways that bit (2026-08-19)

`ext/drawer` is one rail per document. `ext/Panel` fills it, and so does
`ext/layout` — whose `page.js` loads with the nav on every page under
`/framework/`. Three bugs fell out of that, all found by the bar sweep, all
pre-existing, and all of them exactly the smell the owner named: *"a certain
action will either keep something selected, and clicking off deselects it from
the right sidebar, but keeps an orange selection visual."*

**1. The first click on any rail control handed the rail away.**
`ext/layout/panel.js` wires `$rail.on("click", refresh)` **once** and never
unwires it. With no layout selection, `refresh()` falls through to `redraw()` and
redraws the rail as ext/layout's *"nothing selected"* — so clicking `tone` in the
panel rail made the panel's words vanish, and re-selecting the panel did not
bring them back. Measured 2026-08-19: a plain `.panel-btn` did it as surely as a
dropdown. **Patched here**, in `properties.js`, by claiming the click:

```js properties.js
const row = fn => div.c("panel-props-row", fn).on("click", e => e.stopPropagation());
```

On the ROW and bubbling — a capture guard on the drawer would eat the button's
own handler before it ran. The **real** fix is an ownership test in `ext/layout`
(out of that task's fence): `refresh()` should return when the rail is not its
own. Until then, every module sharing `ext/drawer` loses the rail on its own
first click.

**2. The rail never redrew itself.** `properties()` — the inspector drawn *inside*
a workspace — listens for `change`. `fields()`, which `tools.js` draws into the
drawer, has no listener at all, so every control rendered its lit state **once**:
pick `cells` and the trigger still said `toc`; pick `grid` and the grid rows never
appeared, because `live_words()` had already been read. The owner read that,
correctly, as *"the template switcher dropdown doesn't seem to do anything."*
Re-announcing the SELECTION is the redraw — `tools.js` fills the rail from
`panel-focus`, so nothing else has to know:

```js properties.js
document.dispatchEvent(new CustomEvent("panel-focus", { detail: target }));
```

The rail's **scroll position** is restored a frame later, because an `empty()`
throws it away and a long rail jumping to the top on every click is its own bug.

**3. `repaint()` redrew a panel nobody was looking at.** `paint.js`'s `views` is a
WeakMap holding **one** entry per item. `/framework/ext/Panel/` draws sixteen
workspaces; the entry points at whichever rendering was drawn last, so picking a
template in the rail painted a copy in another workspace while the ring sat on the
one you clicked — the owner: *"works on refresh, but not on dropdown → select."*
`apply()` now paints the focused body when `views` disagrees with it. One view per
item is `paint.js`'s to fix.

## Selection still needs care

None of the above is the whole story, and the next person to touch this should
know what is unsettled:

- **Escape is overloaded.** `focus.js` drops the selection on it; `ext/Dropdown`
  had to stop it so that closing a list did not also close the panel. Anything
  else that opens on this rail owes the same courtesy.
- **`ext/layout`'s `refresh()` still has no ownership test**, so it redraws the
  shared rail on every click that is not its own. Announcing every landing (above)
  compensates; the fix belongs in that module.
- **The `.panel.focus` ring rule still lives in `panel.css`**, away from its hover
  twin in `focus.css`. It should move — left alone 2026-08-19 only because
  `panel.css` belonged to a task running at the same time.
- **Multi-select and multi-edit are unbuilt**, and with grouping they are one
  design, not three. A rail that edits *n* panels needs a story for a word two of
  them disagree on, and `focus` is a single id today.

## Item selection — a cell, one level up from a run (2026-08-19)

The owner: *"even though each item isn't a panel itself, they could easily act
like it… they should at least be selectable, so the sidebar can display
flex/grid properties per item."* **The verdict: no subclass.** An item is an
ELEMENT that carries words, not a `Panel` — no chrome, no tree cost, and the
words transfer verbatim the moment the chrome around them is removed. A `Panel`
per cell would mean a bar, a body, drag handles and a saved node for every one
of twelve boxes; the words are the only part anyone asked for.

**The shape is `text.js`'s run selection, one level up.** A DIRECT CHILD of a
flex/grid body, not a subtree — `text.js` already draws the click delegation,
the already-focused-panel gate and the module-scope selection state a run
uses; item selection rides the SAME listener rather than a second one, because
a click that reaches a bare cell (no `<p>`/`<h1>`/… under it) has already
failed the run `SELECTOR` and the two can never both be showing.

```js text.js
if (!panel_focus || !["flex", "grid"].includes(item.get("display"))) return;
const cell = [...root.children].find(c => c === e.target || c.contains(e.target));
```

**Drill-down is the same rule as a run's: the leaf first, then its item.** The
FIRST click on a cell bubbles past this (the panel is not yet `.focus`) to
`workspace.js`'s own panel click handler, which focuses the leaf exactly as it
always did. Only a SECOND click, inside the already-focused leaf, reaches the
item branch and selects the cell.

**Escape steps back ONE level — an item to its leaf — before focus.js ever
sees the key.** `text.js` registers its own `keydown` listener at MODULE load
(before any workspace mounts, so before `focus.js`'s own per-mount one exists)
and calls `stopImmediatePropagation()` only when an item is selected; with
none selected the key passes through untouched and focus.js's own Escape
(stepping the LEAF out) runs exactly as it did before this task.

**No `apply()` for a word write on an item.** Every other control on this rail
calls `apply(target)`, which calls `repaint()`, which throws the body away and
rebuilds it — fine for a leaf's own word, fatal for an item's: it would drop
the very DOM node (`sel.el`) the click just wrote to, mid-edit. An item word
instead writes the custom property on `sel.el` directly (no flash, no
rebuild) and persists through `persist.js`'s `set_item()`; `panel-item`
(`tools.js`, mirroring `panel-focus`) is the redraw signal that refills the
rail with the new `on` state.

**A repaint from elsewhere (a leaf word, a template swap) still loses the
selection** — `sel.el` goes with the old DOM. Self-healing, not fixed:
`text.js`'s `item_selection()` clears itself when the element is no longer
connected, so a stale read shows the leaf's own rows again rather than a
ghost selection. The WORDS survive regardless — `items_apply()` replays them
from `data.items` onto whichever child now carries the same key.

**Proven headless:** `ai/2026-08-19/panel-items/` — click, select, set `grow`
on one cell only, `self → align-self: center`, grid `span → grid-column:
span 2`, a forced `repaint()` keeps both, `toJSON → hydrate` round-trips
`data.items` exactly, two Escapes (item then leaf), zero console errors.
