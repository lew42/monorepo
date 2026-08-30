# Panels — splitting the height

The ask (2026-08-27): *"multi-panel — split the viewport's height into 2 vertical
areas — and figure out how to get different areas to communicate, cross-page.js."*

**Verdict: no new core word. The words already exist, and one of them is already
called a region.** Live: [Panels](/framework/core/Page/overview/columns/panels/).

## The pattern

```js
export default new Page({
    meta: import.meta,
    classes: "solo flex v gap",                  // full region height, stacked

    initialize(){ this.regions = new Map(); },   // the seam container() reads

    content(){
        div.c("pages surface", $p => { this.regions.set("brief", $p); });
        div.c("pages surface", $p => { this.regions.set("detail", $p); });
    },

    activated(){ this.children.forEach(page => page.activate()); },

    children: {
        Brief:  { classes: "standard default", content(){ … } },
        Detail: { classes: "standard default", content(){ … } },
    },
});
```

Three words do the work, and none of them is new:

| word | where it lives | what it contributes |
|---|---|---|
| `solo` | `Page.css` | `align-self: stretch; min-height: 100%` — the page IS the region's height |
| `flex v` | `framework.css` | stacks; `@layer util` beats `.page`'s own `display: grid` for free |
| `pages` | `Page.css` | `flex: 1 1 auto; min-height: 0; overflow-y: scroll` — **a panel, already** |

`.pages` is the region class. It was written for the app's one page region and it is
exactly the definition of a panel: take your share of the height, floor at zero, scroll
your own content. Writing a `.page-panel` next to it would have been the same four
declarations under a second name.

## Measured (2026-08-27, headless)

| viewport | page height | each panel | scroll independence |
|---|---|---|---|
| 1280×900 | 900 | 347 | top scrolled 400, bottom stayed 0 |
| 1920×900 | 900 | 337 | 400 / 0 |
| 3440×900 | 900 | 323 | 400 / 0 |

Zero console errors at all three. The panels shrink as the viewport widens because
the type scale grows the title above them, not because anything is unstable.

## The honest limit

**The Router activates ONE chain**, so it will never light both panels for you. A page
whose panels each hold a routed subtree can only be "where you are" in one of them.
Two ways out, and the choice is the design:

1. **Both panels are chrome + one is routed** — mark the non-routed panel's page
   `default` and let the other take the route. This is master/detail, and it is the
   same arrangement `ext/tabs` lives with.
2. **Neither is routed** — the parent activates both itself
   (`activated(){ this.children.forEach(page => page.activate()) }`) and both children
   wear `default`. That is what the demo does; the split is a **layout**, and the url
   still names one page.

⚠ Without `default` both panels are `display: none` and nothing throws — the
arrangement contract at the top of `Page.css` hides an unmarked `.page`, and
`warn_if_hidden()` is the only thing that will tell you.

⚠ A captured callback's **return value is appended**. `$p => this.regions.set(…)`
returns the Map and painted a literal `[object Map]` between the panels. Block body,
always.

## Cross-panel communication

The same answer as cross-column: [`nearest()`](/framework/core/Page/doc/roles/).
Both panels' pages are in one tree, so both find the same `this.topic()` and talk
through it — no import between them, no bus. Worked example:
[Refs](/framework/core/Page/overview/columns/refs/).

## What was rejected

- **A `.page-panel` class.** Four declarations `.pages` already has.
- **A `panels()` method** beside `columns()`. `columns()` earns its line because the
  arrangement it turns on is 60 lines of CSS reading classes core stamps; a height
  split is three existing words at the call site and there is nothing for a method to
  hide.
- **`ext/Panel`.** It is a wireframing tool — draggable, resizable boxes for sketching
  a layout — not a page region. Nothing in it routes.
- **A horizontal split.** `columns()` is already that, with a trail and a reveal.
