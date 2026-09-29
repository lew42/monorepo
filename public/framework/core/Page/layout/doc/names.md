# Look-alike names — five things called "layout", two called "sections"

The same word names different things in different folders. Each line says what the thing is
and where it sits in the layout system (the three levels on the [layout page](/framework/core/Page/layout/)). Nothing
is moved: each stays where it is and this system links to it. A move would need every importer
updated and a redirect stub left behind, and none of them is in the wrong place — only
confusingly named.

## "Layout"

| name | what it is | level in this system |
|---|---|---|
| [`core/Page/layout/`](/framework/core/Page/layout/) | this system's index: the concepts, the types, how to decide | the index itself |
| [`core/Layout`](/framework/core/Layout/) | a component: 30 named arrangements of things in a box, each proven at seven widths | 3, inside the page (and 2, when the box is the page) |
| [`/layouts/`](/layouts/) | the encyclopedia: every way a page divides its room, named `N-name`, drawn and judged | 2, the page's room |
| [`styles/layouts`](/framework/styles/layouts/) | whole-page layouts written as class strings, on one filterable wall | 2, the page's room |
| [`ext/layout`](/framework/ext/layout/) | a tool: a toolbar and a push-drawer that let a reader arrange a demo live | a tool for demos, not a layout |

**The one pair people mix up most: `core/Layout` vs `/layouts/`.** `core/Layout` is code you
call (`arrangement: "main-aside"`). `/layouts/` is a reference you read before you pick.

## "Sections"

| name | what it is | level in this system |
|---|---|---|
| [`styles/sections`](/framework/styles/sections/) | content bands INSIDE one page: hero, stats, features, pricing, faq, fifteen in all | 3, inside the page |
| [`/layouts/labs/sections/`](/layouts/labs/sections/) | a lab: one band of a page cut into 2, 3 or 4 columns, framed or flush | 2, the page's room |

The owner asked whether `styles/sections` belongs in layout ("sections do need layout").
Decision: it stays in `styles/`, because it is content (parts you fill with words), and this
system references it at level 3. Its own design log answers the same question:
[`styles/sections/doc/decisions.md`](/framework/styles/sections/doc/decisions.md).

## One more collision: "wide" and "fill"

Core's `width: "wide"` (one full track, no second column) and a column's own `fill` (take the
leftover room) are not the owner's "two columns" and "three or more". That is why the shapes
are named **Split** and **Columns** instead — [v1](/framework/core/Page/layout/v1/) has the full note.
