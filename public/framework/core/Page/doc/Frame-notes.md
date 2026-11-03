# PageFrame: history and design decisions

## THE PAGE FRAME

A page says a word and this is what draws it: the chrome its `arrangement` word asks for, its children drawn the way its `navigation` word says, and its content in the middle. `Page.render()` builds one only when the page said a word that needs a box, so a page that says none of the six has no frame at all and renders exactly the markup it rendered before this file existed.

It is the graduated half of `imagine/paging/stage.js` — the lab's renderer, one level up, where every page can reach it. What did NOT come with it is the lab's FURNITURE: the canned filter rows, the eight sample articles, the caption that measures the box. Core ships boxes; what goes in one is the page's own.

### Class naming trap

⚠ `PageFrame`, never `Frame` or `Stage`. `View.classify()` mints a CSS class from every constructor name in the chain, so a class called `Stage` wears the framework's own `.stage` — `container-type: inline-size; overflow: hidden` — and shrink-wraps itself: 307px inside a 1546px frame, with nothing thrown (measured 2026-09-05). That is why the lab's class is called `PagingStage`.

### Constructor field trap

⚠ NEVER PASS IT A `name`. `classify()` ends with `if (this.name) this.ac(this.name)`, so a `name` field becomes a bare, unprefixed CSS class.

### Import cycle trap

⚠ IT IMPORTS `View`, NEVER `Page`. It reaches its page through `this.page`, so there is no parent↔child import cycle — and that kind of cycle breaks only on a deep reload, which is the worst moment to find one.

## SWAPS: which navigation words rearrange the box

`expand` grows the row, `columns` is `Page.columns()` and the retired `takeover` was `width: "full"`: all three were MEANT to move things, and reserving there would hide the very thing they do.

⚠ `tabs` IS DELIBERATELY NOT HERE — LEAVE IT OUT. It is the one place this list differs from the paging lab's own `swaps` flag, and the difference is not an oversight: `ext/tabs` brings its OWN panel and fills this same `regions` Map, so adding `tabs` here reserves a second panel and the child is drawn twice, once in each. Whoever reads the lab's list and this one side by side: the lab reserves for `tabs` because the lab draws its own tab strip; core delegates to `ext/tabs`, which has already done it. (Decided 2026-09-06, slice 2.)

## THE BOX and CONTENT colour

The box is the ONLY element wearing the CONTENT colour, which is the second of the two independent colour controls — the first is the page's own background, and `word_classes()` puts that, and only that, on the page.

⚠ ONE WORD, ONE CLASS, ONE ELEMENT. `page-surface-*` was stamped up on the page as well for one build, so `surface: "card"` drew a bordered, shadowed card and then drew a second one inside it. `Page.word_classes()` is where that was fixed and why.

## Box height reservation

⚠ THE BOX RESERVES ITS HEIGHT. The page's own content and the region a child mounts in share ONE grid cell, so the browser has measured both and opening a child cannot resize the box. The one you are not reading is hidden but still MEASURED: `visibility`, never `display: none` — a display-hidden panel is not measured, which is the whole thing being bought. (`imagine/paging`'s first demo said "the box did not move" over a line reading "the box is 335px shorter" before this rule existed.)

## content() routing

A page with content of its own AND tabs: its content becomes the first tab (the page's own url), so a child tab replaces it instead of stacking above it. A page with only children keeps today's shape. (2026-10-09)

The page's own content is drawn, plus the child list when the navigation word draws that list INSIDE the box: `expand` draws the rows themselves, and `rail` lists the rows you navigate FROM (`columns` is drawn by `Columns.js`, and `takeover` is retired).

## Navigation vs arrangement

⚠ A RAIL IS NOT A PANEL. A navigation rail lists MY children; an arrangement panel is anything else — a filter, a contents list, the properties of what you are reading. `imagine/paging/blocks.js` has said so in words since 2026-09-05 and its renderer drew the children for both, which made the distinction the vocabulary insists on invisible on screen.

## rows(): the same list, drawn in three places

THE SAME ROWS, LISTED INSIDE THE BOX — what the rail and `expand` are made of. One drawing, so a label here is the label everywhere else: `nav_for()` is the page's own answer for a child's url, label and icon.

⚠ A LIST WITH NOTHING IN IT SAYS SO. A page with no children handing back an empty box is how the lab ended up listing four strangers on somebody's page.

## expand: browser <details>, no routing

A `<details>` per child, and the browser's own gesture: there is no JavaScript in it at all. The row grows downward and nothing above it moves. It is the one navigation word that never changes the address, so an opened row cannot be linked to or reached with Back.

⚠ THE ROW IS THE CHILD'S REGION, so navigating to a child mounts it in the same box it opened in — one seam, not two.

## chrome: bar, panel, aside

CORE SHIPS BOXES, NEVER FURNITURE. Each of these opens a REGION under a fixed name and a declared child of that name mounts in it — exactly the way an `ext/tabs` child mounts in a panel today. The lab draws four canned filter rows and four canned property rows inside these; those stayed in the lab.

⚠ `bar`, `panel` and `aside` are Map KEYS, never fields or methods on `Page`. All three are already page words somewhere — `layouts/labs/blogx/Blog.js` declares `rail()` and `aside()` as page methods, `framework/ui/page.js` declares `bar()` — and a Map key shadows nothing.

## region(): shared Map and default render

ONE REGION: the Map `Page.container()` already reads, plus the child it holds, drawn as `default`. The `default` matters — nothing ROUTES to a bar, so without it the arrangement contract would hide the child the region was opened for.

⚠ `app` is handed down here the way `Page.child()` and `render_column()` do it: a child that is never routed to still needs it to mark its own links.
