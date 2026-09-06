# Props — what a layout declares

**Every one of them is a plain page prop.** No schema, no registry, no validation layer. A
filter reads `page.columns`, `page.tags`, `page.widths[0]`, and that is the whole mechanism —
which is the owner's own instruction: *each layout can prescribe properties (just page props),
and the filters can filter them.*

Here is one entry in full. Nothing is required except `name`, `title` and `boxes`; everything
else falls back to a default on `Layout.prototype`.

```js
{
    name: "rail-main-aside",           // the url segment: /framework/core/Layout/rail-main-aside/
    title: "Rail + main + aside",
    columns: 3,                        // the band it lands in

    intro: "A fixed rail, then 70 / 30 of what is left…",   // the sentence the page opens with
    when:  "A documentation site: navigation, the article, its table of contents.",
    note:  "…",                        // the long caption, optional, verbatim from the source
    see:   "…",                        // markdown links to what it relates to, optional

    room: "rail",                      // which of the five framework words it compiles to
    word: { label: ".cols-row.cols-rail-main-aside", href: "/framework/styles/layouts/cols/" },
    config: 'div.c("cols-row cols-rail-main-aside", () => { … })',

    decl: { display: "grid", "grid-template-columns": "…", gap },   // the layout itself
    boxes: [                           // the tracks; `kind` is which fixture pours in
        { label: "Rail",     kind: "list"  },
        { label: "Article",  kind: "prose", repeat: 2 },
        { label: "Contents", kind: "list"  },
    ],

    widths: [1000, 3440],              // the range it is PROVEN at
    fallback: "stack",                 // what it becomes below the floor
    grows: true,                       // content length cannot break it
    wraps: false,                      // a fixed number of tracks

    tags: ["docs-three-region", "rail-and-content", "toc-rail", "docs"],
    accepts: "any", allowed_in: "any", denies: [],

    variations:   ["rail-and-content", "shell"],
    alternatives: ["scroll"],
    approved: "2026-09-06",
}
```

## The ones that are easy to get wrong

**`widths` — the ceiling is 3440 for all thirty, and that is not laziness.** Every layout in
the catalogue is proven to the top of the strip, and above a ceiling a layout *holds and
centres* rather than scaling up (the owner, addendum 4). The number that carries information is
the **floor**: it is where the layout page's viewport opens, it is LayoutRule #1, and it is what
makes "a 3440 section inside a column" a thing the checker can see.

**`grows` and `overflow` are the vertical twin of the width range.** Width goes across; growth
goes down. A stack takes endless content, so `grows: true` and nothing more is asked. A bounded
box — a fixed height, an equal-height row, an inner-scroll rail — takes `grows: false`, and then
`overflow` is **required**: `"scroll"`, `"clip"` or `"truncate"`. A bounded layout that declares
nothing is a draft with no run needed, because the question it dodges is the one the fixtures
would have asked.

**`room` is not `width`.** Core's `Page.words()` does `this.width ??= this.room`, which would
turn `room: "page"` into the class `page-w-page`. `Layout` overrides `words()` to do nothing for
exactly this reason. `room` here means the framework layout word the arrangement compiles to.

**`decl`, not `rules`.** `rules` means LayoutRules everywhere else in this module. The
declarations that ARE the layout are `decl`, which is what `ext/DesignTool/library` calls them.

**`slots` is derived.** The plan asked for a `slots:` map of name → fixture kind; it is
`boxes.map(box => [box.label, box.kind])` and writing it twice is a way for the two to disagree.
`Layout.prototype.slots()` returns it.

## Where the defaults live

On `Layout.prototype`, at the bottom of `Layout.js` — **never as class fields.** A subclass's
field initializers run *after* `super()` has finished, so a field would overwrite the config
that `assign()` had just put on the instance. On the prototype, a declared value shadows a
default the ordinary way and nothing has to know about the order.
