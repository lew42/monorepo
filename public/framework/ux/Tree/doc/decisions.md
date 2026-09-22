# Tree — decisions

Landed 2026-08-21, the first `ux/`. Task log:
[`ai/2026-08-21/ux-tree/`](/framework/ai/2026-08-21/ux-tree/).

## What the listeners actually were

The graduation rested on a claim two audits disagreed about, so it was settled first. A
shallow inventory reported *no event listeners anywhere in `ui/`*; the deeper audit
reported click listeners in `tree.js`. The deeper one is right, and the disagreement is
mechanical: `tree.js` installs its listeners through **View's `.click()` helper**, which
calls `addEventListener` inside `core/View`. A grep for `addEventListener` across `ui/`
returns nothing while two listeners are live.

There were exactly two — one on the `▸` (`stopPropagation`, then flip the open class), one
on every row (select and fire) — plus a `rows` Map and a `selected_row` in the closure, and
`update()`/`select()` bolted onto the returned View. All three graduation criteria, in
forty lines.

**The lesson generalises past this module:** in a framework whose base class wraps
`addEventListener`, "does it have listeners" cannot be answered by grepping for the DOM
API. Grep for the wrapper.

## Splitting, and why it had to be additive

The rule was already written: the CSS stays. What decided the *shape* of the split was the
caller census — `ext/Playground/Playground.js` imports `tree` straight from
`/framework/ui/tree/tree.js` and uses both the factory and `.select()`. It sits outside
this task's fence, and a graduation that breaks a live rail is not a graduation.

So `tree()` stays, byte-compatible, and `class Tree` is **new code beside it** rather than
a replacement of it. The class imports `ui/tree/tree.js` for its stylesheet — a `ux`
importing a `ui` template, the direction that is allowed — and wears the same
`.ui-tree-*` classes, so the two tiers cannot drift apart while both exist.

Rejected: making `tree()` markup-only (breaks Playground's tree rail today), and filing a
proposal that leaves Playground broken until someone applies it. The remaining cost is
~45 lines of closure living on in `ui/` until `ext/Playground` takes the class — a
one-line import change, and the only thing blocking it is fence, not design.

## The names that had to dodge `View`

Every method on a `View` subclass shadows the base class silently. Three would have:

| the obvious name | what it would have broken | shipped as |
|---|---|---|
| `Item.toggle()` | `View.toggle()` — show/hide by computed style | `flip()` |
| `Row.text()` | `View.text()` — the getter/setter every caller uses | `label()` |
| `Row.toggle()` | same as the first, on the `▸` | `caret()` |

`render()` is the one deliberate override: on a `View` it *is* the hook. (On a `Page` it
collides — that warning is about `Page`, not `View`.)

`classify()` adds a class for every constructor in the chain, so these emit `.tree`,
`.tree-item`, `.tree-row`, `.tree-keys`, `.tree-keys-row`. All five were censused against
the live CSS before the first line was written; the only near hit is `ext/demo`'s
`.tree-preview`, which needs that exact token. **A subclass name here is a class name on
the page** — the same trap that gave a playground's `Rail` the page sidebar's shape.

## State on the instance, defaults on the prototype

`View`'s constructor runs `assign()`, `prerender()` and `initialize()` — so the whole
render happens **inside `super()`**, before a subclass's class fields initialize. A
`tag = "ul"` field arrives too late to make a `<ul>`. Defaults go on the prototype, the
way `View` itself declares `capture`.

## Parts as statics: what it actually bought

`Tree.Item` and `Tree.Row` hang off the constructor and are reached through the live class
(`this.constructor.Item`, `this.tree.constructor.Row`). `TreeKeys` sets **one** static:

```js
TreeKeys.Row = class TreeKeysRow extends Tree.Row { … };   // tabindex, and a focus listener
```

`Tree.Item` travels down the chain untouched, and `Tree.Row` is unaffected, so a plain
`Tree` still has no tab stops. Rows-in-DOM-order came free too: `rows` is a `Map` and
items are built depth-first, so `[...rows.values()]` is the row order the arrows walk —
`TreeKeys` added no state of its own for it.

**The keyboard map is a property, not a switch.** `TreeKeys.prototype.keys` maps a key
name to a method name, so a subclass adds a gesture in one line without touching `key()`.

## Visibility is asked of the DOM, never of layout

`moves()` finds the reachable rows with
`.ui-tree-item:not(.ui-tree-open) > .ui-tree-children .ui-tree-row`, not with
`offsetParent` or a rect. A hidden tab evaluates fine and does not lay out — every
geometry read comes back frozen — and the roving index has to be right there too.

## The one CSS rule

`.ux-tree-keys .ui-tree-row:focus` — `:focus`, not `:focus-visible`, because the focus is
*moved by script* on an arrow key and whether that counts as "visible" is a UA heuristic.
Negative `outline-offset`, because the framework's positive 3px is drawn outside the row
and a 14em rail clips it. Everything else a tree looks like is the template's, and both
tiers read the same tokens, so a config word re-skins either one.

## Parked

- **`TreeDrag` (drag-reorder).** Built 2026-08-21 as designed here — see below.
- **ARIA.** No `role="tree"` / `aria-expanded`. Half a set of roles reads worse than none,
  and `aria-expanded` has to be kept in sync with `flip()`, which is a real design pass
  rather than three attributes.
- **`ui.tree`'s eventual removal.** Whether `tree()` and the `ui.tree` entry go once
  `ext/Playground` moves is the owner's call, not this task's.

## TreeDrag, built (2026-08-21)

The design above held: `class TreeDrag extends Tree`, one static replaced
(`TreeDrag.Row`), zero changes to `Tree.js` or `TreeKeys.js`. Task log:
[`ai/2026-08-21/ux-treedrag/`](/framework/ai/2026-08-21/ux-treedrag/).

**Reuse call — `ext/Draggable`'s `Sortable`, extended, not hand-rolled.** Kept whole:
pointer capture, the ghost, the placeholder, Escape-cancels, and the `.drag-source`
inline-display fix (`ext/Draggable/doc/decisions.md`, 2026-08-19) — the previously
debugged half. Overridden: `Sortable.release()` commits through `item.move()` against a
`core/Item` tree, and `TreeDrag`'s nodes are the same plain, parent-less data `Tree`
already reads — the exact reason this design parked a `moved(node, into, at)` writer
instead of a mutator. `before()`/`row()` also assume a container's *direct* children
**are** the registered draggables — true for `ext/Panel` and `ext/editor`'s flatter
shapes, false here: a row sits inside an `<li>` beside its own `<ul class="ui-tree-
children">`, one layer removed. `locate()` is hand-rolled from the target row's own
rect instead of an `$items` container — the middle half of a branch row's height reads
as "into", the rest as "before/after" that row — and `release()`/`show()` follow it.

**A dedicated grip, not the whole row.** `Draggable.grab()` calls `start()` on *every*
pointerdown, no movement threshold — a whole-row handle hides the row and shows the
ghost on a plain click-to-select, and because the row's `<li>` collapses out from under
the still-hidden row, the layout reflows *during* the click and `release()`'s hit-test
can land on a neighbour, firing a spurious `moved()`. `ext/Panel`'s own handle is "the
grip alone, never the bar" for the same reason, stated but not explained there — traced
here from `Draggable.js`'s own event order rather than from a bug report. TreeDrag ships
a small `⠿` grip (`.ux-tree-drag-grip`); the row's existing click-to-select is
untouched.

**The writer contract.** `moved(node, into, at)` — `into` is the parent node the row
lands under (`null` for the root list), `at` is the index it lands at **after** removal
from wherever it was, so the caller's own splice-out-then-splice-in never adjusts for
its own shift. `TreeDrag` never touches `nodes`; the demo (`ux/Tree/drag/page.js`) is
the worked caller.

**What it cost.** `TreeDrag.js` is under 160 lines for three parts (`TreeDrag`,
`TreeDrag.Row`, `TreeDrag.Drag`) plus two small pure functions — `contains()` (the
descendant guard, node-data shaped, since there is no `Item.contains()` here) and
`locate_parent()` (nodes carry no parent pointer, so "whose child is this" is a walk,
re-derived at every commit rather than stored). `TreeKeys` needed neither: it inherited
rows-in-DOM-order for free. That is the one piece of `Tree`'s "state on the instance,
never on the node" design (above) that a mutating extension pays for and a read-only
one (`TreeKeys`) does not.

Proved headless (`ai/2026-08-21/ux-treedrag/`, screenshots in the same dir): drop onto a
folder appends inside (`drag-into-*.png`), drop between two siblings reorders with the
insertion line visible mid-drag (`drag-between-*.png`), Escape mid-drag leaves the tree
byte-identical (`drag-escape-*.png`), and the printed `moved()` payload matched every
shot. `/framework/ux/Tree/` and `/keys/` re-verified at 360 and 3440: zero overflow,
zero non-LiveReload console errors, one Enter-selects proof on `/keys/` still passes.

---

# The merge — one tree (2026-09-17)

Task log: [`ai/2026-09-17/tree-component/`](/framework/ai/2026-09-17/tree-component/).
**Everything above this line is the record as it was written, and three of its claims are
now superseded — each one is named below.**

## What was wrong, and it was structural

`TreeKeys` and `TreeDrag` were **siblings**: both `extends Tree`, each replacing
`Tree.Row`. JavaScript has single inheritance, so **no tree could have the arrow keys and
the drag at the same time.** Nobody wrote that down, because each extension was correct on
its own; it only shows when a consumer wants both — and one did. The page CMS
(`/imagine/paging/make/`) needed a draggable page tree, could not take `TreeDrag` and
still have a keyboard, and wrote its own tree instead: 343 lines, with no expand and
collapse at all.

So there were three trees on the site. That is the whole case for the merge.

## The comparison that settled it

| | rows from | expand / collapse | keyboard | drag | selection | marks + acts |
|---|---|---|---|---|---|---|
| `ux/Tree`, before | a nodes array | chevron | only in `TreeKeys` | only in `TreeDrag`, 2 targets | on the tree | none |
| `ui/tree` | hand-written markup | baked into the data | none | none | baked into the data | none |
| `make/tree.js` | a page tree | **none — always open** | none | grip, 3 targets | a picked path | star, `+`, `×` |
| `ux/Tree`, merged | a nodes array, **or a `Page`** | chevron + arrows | **always on** | grip, 3 targets | on the tree | star, `+`, `×` |

Two near-trees were checked and are not trees. **`core/Sidebar`** is a flat list of links
with one level of grouping — no nesting, no expand, no drag — and should *not* consume this
class: a tree would add nesting nothing asks for. **`demo.tree()`** (`ext/demo`) is a demo
*page shape* that wraps a whole mini app; the name is the only thing it shares.

**The decision: the merged tree lives in `ux/Tree`, as one class.** `ui/tree` stays the
markup and CSS it wears. `TreeKeys.js` and `TreeDrag.js` stay as back-compat shims so the
documented API keeps working; new code takes `Tree`.

**The alternative — Make's tree as the base — and its caveat.** Make's tree has the better
drag and is the worse tree. Its rows carry a *path* into `made.js`, its drop commits through
`page.move_to()`, it renders every level open (which is why a deep page tree there is a
wall), and it lives in `/imagine/`, where nothing in `framework/` may import it. Taking it
as the base would have meant deleting its writer half and adding folding, the keyboard and
a nodes-array source — more work than lifting its one good idea into `ux/Tree`. **Make
becomes a consumer of this class in a later task**, where it would lose roughly 200 of its
343 lines and gain folding and the keyboard.

## The three targets, which is Make's model

A row is three drop targets and which one you get is where on it you let go: its **top
edge** is *above it*, its **middle** is *inside it*, its **bottom edge** is *below it*. The
edge band is a third of the row, **capped at 10px**, so the middle — nesting, which is what
a tree is for — is always the biggest of the three.

That cap is a measurement, not a taste, and Make's own file records why: `Sortable.locate()`
takes the innermost registered container under the cursor, and every row in a page tree *is*
one, so "anywhere on a row means inside it" left the 4px gap between two rows as the only
place to say *before it*.

**Supersedes** the 2026-08-21 rule above ("the middle half of a branch row's height reads as
into, the rest as before/after"): two targets, and the band was a fraction with no cap. A
node that cannot hold children (`holds()` answers that, and a subclass overrides it — a page
tree, where any page can hold pages, is the case) has no middle at all: the row splits in
half so you can still reorder against a leaf.

## One event, and the tree never writes

```js
move({ node, into, index })   // a drop landed
act(name, node)               // "default", "add" or "remove" was pressed
```

`into` is the node it now belongs to, `null` for the root list; `index` is counted **after**
the node is taken out of wherever it was, so a consumer's splice-out-then-splice-in never
corrects for its own shift. All three gestures arrive as that one event — the consumer never
branches on *above / inside / below*, only on where the node now is.

`TreeDrag`'s `moved(node, into, at)` is the same three facts in the old spelling, kept on the
shim.

## Adapt: the whole thing is four lines

```js
adapt_to(node){
    if (!this.adapt || !node) return this;

    this.rows.forEach($row => $row.item.close());
    for (let item = this.rows.get(node)?.item; item; item = item.up) item.open();

    return this;
}
```

Everything shuts, then the chain from the root down to the selected row re-opens — the
selected row **included**, so you see your ancestors, your siblings at every level, and your
own children. Measured on the module page's five-level tree: **138 rows with every branch
open, 12 at depth four with `adapt` on.**

It is off by default, because a tree somebody opened by hand should stay the way they left
it, and the chevrons still work while it is on — adapt re-folds on the *next* selection, so
opening a second branch to peek at it is not taken away from you. The owner said getting
this right takes practice; the switch is one property (`adapt: true`) and one method to
override, so the next try is a small change rather than a rewrite.

## Two latent bugs, found by reading

1. **`moves()` was not in DOM order any more.** It read `[...rows.values()]`, and the
   comment above it claimed that was DOM order — true only while every row was built
   depth-first and synchronously. A lazily-loaded branch sets its rows on the Map long after
   its neighbours, so the arrows would have walked out of order the day branches could
   arrive late. It reads the DOM now and maps back through a `by_el` Map. **Supersedes**
   "rows-in-DOM-order came free" above.
2. **`locate_parent()` tested `n.children &&`.** A function is truthy, so an unopened lazy
   branch would have thrown inside the recursion on the first drop. It tests `is.arr()`.

## Where the CSS went

**Supersedes "the one CSS rule".** `.ui-tree-row:focus` moved **into the template**
(`ui/tree/tree.js`), beside `:hover` and `.ui-tree-selected`, because a focus ring is a rule
about a *state* and that is exactly what `ui/` is for — and the keyboard is no longer a
named subclass whose class could scope it. `Tree.css` now holds only what a *class* put on
the screen: the grip, the two drop cues, the star and the row buttons.

One template fix came with it: `.ui-tree-text` had `overflow: hidden` and `text-overflow:
ellipsis` but no `min-width: 0`, so a flex item's floor was its content width and a long
label pushed the row wider instead of truncating — which is what pushed the new row buttons
off the end of a narrow rail.

## Still parked

- **ARIA.** Still no `role="tree"` / `aria-expanded`. Unchanged, and now worth more: with
  the keyboard in the base class, every tree on the site would gain the roles at once.
- **Make as a consumer.** Named above; a later task, and out of this one's fence.
- **A `selected` that survives `draw()`.** `draw()` still resets it, and the caller still
  owns the data — the module page shows the one line that costs (`node.open = $row.item.opened()`
  before the redraw). Worth revisiting only if a third consumer writes the same line.

## A branch row can be a link too (2026-09-18)

`Row.prerender()` used to decide the tag as `!kids && href`, so a row with children could
never be an `<a>` — `/layouts/shell/Shell.js` carried its own `StdShellRow` override just to
get past it. The merge above already simplified the condition to plain `this.node.href`, so
a branch with an href is now a real anchor by inheritance; the Shell override was dead code
and is deleted. One bug came with the fix and is fixed alongside it: `caret()`'s click
handler only called `stopPropagation()`, which stops other *listeners* but not the anchor's
own default navigation, so clicking the chevron on a branch-as-link row folded it **and**
followed the link. `caret()`, `mark()` and `button()` now `preventDefault()` too. Verified
headless on `/layouts/shell/` (8 rows, all real `<a>`, chevron click leaves the url
unchanged and flips `.ui-tree-open` true→false, a label click navigates, Enter on the
focused branch row follows its `href`) and on the module page (568 rows, zero console
errors, every href row an anchor, every href-less branch still a `<div>`).

## Three fixes left by yesterday's landings (2026-09-18)

`tree-fixes` (`ai/2026-09-18/tree-fixes/`). All three were found and worked around by
other tasks that could not edit this module — fixed here, at the source, so nothing has
to work around them any more.

1. **`leaf: true` (`core/Page/readme.md`) now means what it says to a `root:` tree.**
   `Tree.node_of()` used to draw a Page's own `children.size` as a branch even when that
   page had declared itself a leaf — "I present myself, not my children." Fixed by adding
   `!child.leaf` to the branch check. Verified on `/framework/`'s real sidebar
   (`root: this`, added the same day — below): `AI` and `UX` (both `leaf: true`) draw with
   no expand caret at all, while `Core` (not a leaf) still opens to its real 10 children.
2. **A drop's own click no longer reaches the row.** The pointer goes down on the grip and
   up on the row, so the browser fires a `click` on the row right after `Tree.Drag.release()`
   reports the move — and a row's click means "select me," which could cancel whatever the
   consumer's `onMove` had just asked (Make's confirm question was the case that found it).
   `release()` now calls `swallow_click()`: a capturing listener on the tree's own root,
   ahead of the row's own bubble-phase one, removed the next tick either way. Unit-verified:
   the very next click on a row is swallowed, a later one is not.
3. **A drop into a closed branch lands last, not first.** `Tree.Drag.commit()` used to count
   `into.children` to mean "as its last child," and an unopened branch still holds a
   *function* there, not an array — so it always counted zero. Every node now carries
   `count` (`child.children.size`, read off the live Page synchronously, whether the branch
   has ever been opened or not); `commit()` uses it only when there is no loaded array to
   count instead. Make's `real.js` carried guards for both of these (`imagine/paging/make/
   doc/decisions.md` §5); both are now deleted there as dead code.
