# Slots, children and regions

A layout entry in [core/Layout](/framework/core/Layout/) is data. The two fields a
Section reads are `decl` — the CSS declarations that **are** the arrangement — and
`boxes`, the named tracks:

```js
{ name: "main-aside", title: "Main + aside",
  decl:  { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, min(32%, 26rem))", gap },
  boxes: [ { label: "Main", kind: "prose" }, { label: "Aside", kind: "list" } ] }
```

Applying it is three steps and no cleverness:

1. `decl` goes on one box (`.page-section-render`) with `apply()` — `core/Layout`'s own
   function, so the section and the layout page put the same declarations on the same
   kind of element.
2. One `.page-section-slot` per entry in `boxes`, carrying that box's own `decl`.
3. Each slot is registered as a **region** under the box's name, slugged:
   `Main` → `main`.

## Why regions, and not something new

`Page.container()` already asks `this.parent.regions.get(this.name)` — a Map from a name
to the View a child mounts in. `ext/tabs` fills it. `Page.Frame` fills it for a bar, a
rail, a panel and an aside. A Section filling it for a layout's boxes is the same seam,
already read by core, with no new rule anywhere.

So the wiring between a layout and a page's content is: **the layout names the boxes, the
page names the children, and the two meet by name.** Nothing registers, nothing subscribes,
and there is no configuration step in between.

```js
new Section({
    layout: "main-aside",
    children: {
        Main:  { content(){ p("…"); } },
        Aside: { content(){ p("…"); } },
    },
});
```

## Children the layout did not claim

They still render — after the arrangement, in declaration order. **Content is never
silently dropped.** Pick a layout whose boxes are called something else and the same
children fall out of the slots and stack underneath, visibly, which is the behaviour you
can act on.

It also means the no-layout case needs no special code: with no layout, *every* child is
unclaimed, so a section with children and no layout is simply a stack — which is exactly
what it should be.

## Below its floor, a section stacks

The picker will not offer a layout that does not fit — but a section can be *handed* one,
by its config or by a `page.json`, and then be looked at on a phone. So the width rule is
asked again at draw time, and **below its floor a section draws no layout at all**: its
children follow each other down the box.

That is the owner's own rule (*"below its floor a layout stacks to a named fallback… and
the fallback is the thing being judged there"*), and it is not cosmetic. Measured before
`drawn()` existed: `main-aside` — a plain two-track grid with no stacking of its own — in a
276px box drew **4,433px** of column, with no error and no overflow flag.

⚠ **Stacking means drawing no layout, not drawing the fallback's boxes.** Fifteen of the
sixteen multi-column entries name `stack` as their fallback, and a section's stack *is* its
own children in order. Taking the fallback's boxes instead would hand the content a set of
slot names it was never written for — `First`, `Second`, `Third` — and content in the wrong
slot is worse than content in a stack. If a layout ever names a fallback with meaningful
slots, this is the method to revisit.

The overlay says so, on hover, in one line: *stacked — Main + aside needs 700px*. Never
blocking, and it moves nothing.

⚠ **The box has no size when it is first drawn.** A page is built detached, so every rect
reads zero and the first draw cannot know whether its layout fits. A `ResizeObserver` on the
section answers the moment it does, and again on every width change — drag a demo's handle
across the floor and watch the columns become a stack. It redraws **only when the answer
changed**: a redraw is a DOM change and a DOM change fires the observer, so an unguarded one
is an infinite loop.

## Two things that bite

⚠ **A child's view is appended, never built inside the captor.** A page memoizes
`this.view`, so on the second draw `child.render()` builds nothing at all — a captured
call would append nothing and the slot would come up empty after one pick, with no error.
`mount()` passes the View to `append()`, which moves it either way.

⚠ **A child in a slot is marked `default`.** Nothing *routes* to a slot, and the
arrangement contract in `Page.css` hides an unmarked `.page`. `Frame.region()` carries the
same line for the same reason.

And one piece of CSS, for the same family of reasons: a child page inside a slot drops the
page grid's own gutters (`--gutter-x: 0px`, and `0px` rather than `0` — a unitless zero
inside the template's `calc()` drops the whole grid with nothing thrown). It keeps the
reading measure; it loses an inset the layout has already placed it with.

## Nesting

Layouts do not stack — one layout per section (the mastermind's call, from the owner's
*"can layouts stack? … I don't think this is useful"*). **Composition is nesting
sections**: a child of a section can itself be a Section with its own layout, and because
each one asks its own box's width, the inner one is judged at the width it actually got —
which is how a two-column layout inside a narrow column ends up correctly refusing to
offer itself.
