# Panel chrome — phase 2

What phase 1 shipped, what the rest of Mike's brief asks for, and the three
places where guessing would cost real work. Written 2026-08-16, against
`ext/Panel` as it stands after the icon-button pass.

## Shipped (phase 1)

Every button in the module is a transparent icon square: no border, no
background until hovered, a `--prim` tint for the value the panel currently
wears. One definition in `toolbar.css` replaced three near-identical copies
(`grip.css`, `templates.css` each kept one). `glyphs.js` is the shared
vocabulary — `close_fullscreen`/`open_in_full` for hug/fill, a compass of eight
arrows and a dot for the 3×3, colour swatches for tone.

Two bugs came out of it. The **template trigger went stale** after a pick
(`pop()` built its label once, and `change` deliberately never redraws a bar) —
so a panel's own icon disagreed with what it held until a reload. And the
inspector's pickers **scattered** once buttons became fixed-size in `1fr`
tracks. Both fixed and measured.

---

## 1. Alignment, and what conflicts actually mean

The brief asks for alignment "for both contents and relative to parent" and
asks how conflicting values interact. **They don't conflict — they are two
different subjects**, and one of them is conditional on sizing:

| | subject | conflict |
|---|---|---|
| `align` (shipped) | what sits **inside** my body | none — nobody else has an opinion about my contents |
| `self` (proposed) | where **I** sit in my parent's slot | none — but it is *meaningless* unless I am smaller than my slot |

**The rule that falls out: self-alignment exists only on an axis where the
panel hugs.** A filling panel already occupies its whole slot; there is nothing
left to align. So hug unlocks the control and fill greys it out — not a
conflict-resolution policy bolted on afterwards, but what "fill" already means.
This is why per-axis sizing (§3) has to land before or with self-alignment:
with one `mode` for both axes, the control is either on for both or off for
both, which is exactly the case nobody wants.

### ⚠ The flex asymmetry — a real trap

`.panel-items` is a **flex** container. In flex a child may override the
parent's cross-axis alignment (`align-self`) and there is **no `justify-self`
at all** — main-axis placement belongs to the parent alone. So today:

- a panel in a **row**: its vertical placement is its own call, its horizontal placement is its parent's
- a panel in a **column**: exactly reversed

Exposing that asymmetry as a 3×3 picker would be a control that silently does
nothing on one axis depending on which way its parent runs. Two ways out:

- **(a) Accept it** — grey out the axis the child cannot control, and let the
  greying explain the model. Zero new CSS.
- **(b) Make `.panel-items` a grid** on the split's axis. Grid has both
  `justify-self` and `align-self`, so a child controls both axes symmetrically.
  `--panel-grow` translates to `fr` units 1:1 — the grip is already writing
  exactly the fractions grid tracks want — but every flex assumption in
  `panel.css`, `grip.js` and `PanelDrag.js` has to be re-checked.

(b) is the better model and the bigger edit. **This is decision D2.**

## 2. Overlays that show layout state

Four candidates, in the order I would build them:

1. **Edge ticks.** Each edge draws how the panel sizes on *that* axis — a solid
   bar for fill, an inward caret for hug, the number for a fixed extent. The
   mark sits on the edge it describes, which makes it readable with no legend,
   and it is the same geometry the edge strips (§5) already need.
2. **The slot ghost.** On focus, draw the panel's *slot* as a dashed rect and
   the panel's own box solid inside it. One picture that shows hug-vs-fill and
   self-alignment together — the two things that are otherwise invisible
   precisely when they matter.
3. **The class ribbon.** The resolved classes (`panel hug focus`) as a mono
   strip along the bottom edge on hover. Directly answers "current css
   classes", costs one line, and is the one I would put behind a dev toggle
   rather than ship on.
4. **Align-on-the-thing.** While the align menu is open, draw the 3×3 as nine
   dots over the panel body itself and let the pick happen there. Removes the
   200px round trip between the control and the thing it moves.

1 and 2 are the same drawing seen two ways and should land together.

## 3. Size — per-axis, and what it costs

`mode` is one word for both axes today. The ask is `w` and `h`, each
`fill | hug | fixed | %`.

**The migration is free**, and that is a real argument for doing it: defaults
live in `Panel.get()` rather than in `data`, so `get("w")` can read
`data.w ?? (data.mode === "hug" ? "hug" : "fill")` and every document already
on disk keeps working with nothing rewritten.

**The CSS is not free.** `panel.css` has six rules branching on `.hug` and on
what the body holds, and every one of them becomes per-axis — including the
`min(var(--panel-hug), 100cq…)` cap, which needs an inline and a block
version. This is the module's trap-heaviest neighbourhood (`container-type`
measures a box as if it were empty; a hugged panel measured 0px for every
template before `--panel-hug` existed), so it wants measuring rather than
reasoning.

**One thing per-axis sizing genuinely fixes:** `hug` on a split currently
collapses it to 0px and all three doors withhold it. Per-axis, a *row* of
panels can safely hug its **block** axis — only hugging the axis the split runs
along is the collapse. That turns a blanket prohibition into a precise one.

## 4. Position and display

**`display: flex | grid | flow` — build it.** `.panel-body` is already
`display: grid` with one 100% column; letting a leaf choose is a direct
extension, needs no new sizing currency, and touches nothing the traps live in.

**`position` — this one does not mean what it looks like.** A panel with
`position: fixed` or `absolute` leaves the flow, which means it has no slot,
its grip has nothing to resize, and its siblings reflow into the hole. On a
`Panel` the property is not merely unhelpful, it is undefined. It is one of two
other things:

- **the payload's** — "position the *content* of this panel", which belongs to
  `ext/layout`'s word registry over a body, not to `Panel.data`; or
- **a floating panel** — a palette window over the workspace, which is a new
  *kind* of panel (no slot, no grip, its own z-order and drag), not a value on
  the existing one.

Guessing between those two is most of the work either way. **This is decision D3.**

## 5. Splitting — inside vs outside, and the edge strips

`divide(dir)` conflates them today by reading the parent: same axis → a
sibling, different axis → become a split. The brief wants both on purpose.

**The edge strips resolve "outside" for free.** Pointing at an edge supplies
both arguments the existing signature already takes — "add a panel above" is
`divide("col", new Panel(), true)`. Nothing new is needed for that half.

What is genuinely missing is **inside**: split *this* panel in two regardless
of what its parent runs. That is `divide()`'s else-branch, unconditionally:

```js
divide(dir, made, before)   // reads the parent — unchanged, and what drag-to-edge uses
split(dir, made)            // always becomes a split; my content moves to a first child
```

Two verbs, `divide` calling `split` in its else branch. Small, and it changes
`Panel`'s API, so it is proposed rather than done (RULE#1).

### The strip mechanics

Every piece already exists in `grip.js`:

- four strips per panel, revealed while the pointer is anywhere in the panel —
  "much before the user's mouse gets there", as asked
- position along the edge tracks the pointer through `--strip-pos`, written
  from a rAF-coalesced `pointermove` (`coalesce()` is already there)
- `pointerenter` on the strip freezes the tracking, `pointerleave` resumes —
  exactly how the grip's pill freezes under an open menu

Each strip holds the three verbs the edge is the argument for: **add a panel
here**, **hug/fill this axis** (the arrow points in or out, and the edge says
which axis), **align myself toward this edge**. That the edge answers all three
is the reason this is one control and not three.

**⚠ Two collisions, and they are the reason for D1.** The top strip lands
exactly where the bar is. Every shared edge already belongs to a grip. And the
innermost-only gate (`.panel:hover:not(:has(.panel:hover))`) has to cover
strips too, or a four-deep nest lights sixteen of them.

---

## The three decisions

- **D1 — do the edge strips replace the top bar, or sit beside it?** Four
  strips plus a bar is a lot of chrome for a panel a few ems tall; but
  template and tone have no edge meaning, so something has to keep them.
- **D2 — flex or grid for `.panel-items`?** Grid is the symmetric model that
  makes a 3×3 self-align control honest; flex is what everything is written
  against today.
- **D3 — what is `position` on a panel?** The payload's business, or a new
  floating-panel kind?

`display` needs no decision — it is small and I would ship it with whatever
D1–D3 turn into.
