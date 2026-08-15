# The rail — tabs, previews, or neither

## Original verdict: neither — `classdoc()` returns the page and the author picks

Eric proposed `classdoc()` end with `return page.tabs()`, making the drill-down free.
Tim's counter was decisive: `tabs()` renders every name into one bar with **no overflow
handling at all**, and `View` has ~35 candidate methods. A bar is right for five and
unusable for twenty, and nothing in `tabs()` will ever tell you which side of that line
you are on.

## Revised — a VERTICAL bar changed the arithmetic

The objection above is about a bar that runs out of *width*. A left rail runs out of
*height*, of which a docs page has plenty: twenty names down the side is an API
sidebar, and it reads fine.

Two things made it cheap. **`.tabs.vertical` is CSS only** — same JS, same urls, same
default, same marking, axis swapped. And **the overview is an ordinary child page**, so
`tabs()`'s existing "first child is the panel's `.default`, and its link points at the
parent url" behaviour is the whole feature.

The low-level `classdoc(page, Class, meta, names)` is unchanged and still exported,
which is what keeps the original objection answered: a page that wants two classes, or
previews instead of a rail, composes it itself.

**One bug fell out, and it had been live for as long as `tabs()` has:** the default
tab's href **is** the page's url, so it is a prefix of every sibling's and
`mark_links()` gave it `.in-path` on every tab in the set. Every bar on the site showed
two selected tabs. Fixed with a `tab-default` class.

## Revised again — one rail was two lists in a trenchcoat

The flat rail ran `overview · guides · properties · methods · notes`, and once
`core/View` documented every member it was **fifty entries**, with the design notes
below the fold under the plumbing. Three unrelated questions — *what is this?*, *what
can I call?*, *why is it like this?* — sharing one nav.

**Verdict: a horizontal bar of groups above the rail.** Overview · API · Docs, each a
real page, each rail scoped to one question.

| shape | cost |
|---|---|
| a `mode` flag on the class page, one flat set of children | no url per tab, so no history, no reload, no marking |
| three sibling pages, `View`, `View API`, `View Docs` | three call sites, three titles, and a class page that is a menu |
| **a group page per tab, children of the class page** | **one `add()` each; `tabs()` already does the rest** |

Nesting **has** to follow the chain: `Page.container()` mounts a child in
`parent.regions`, and a page outside the active chain is `display: none` — rail and all.
So a member of API is a child of API, and the url says so: `/View/api/append/`.

The cost is that member urls moved. Weighed and accepted: flat urls were only
available by making the groups view-only, which is the row above.

## Group order, and why notes read the top level of `doc/`

```
overview · declared children · api · docs
```

A declared child (`children: "guide"`) belongs beside the class it is a guide to, and it
resolves from `<class>/guide/page.js` — moving it inside a group would mean moving the
directory, so it stays a top-level tab. A sub page *of the overview* is the other key,
`overview: "demos"`, and it resolves from `<class>/overview/demos/page.js`. One key per
shape, the filesystem answering both.

Notes read the **top level** of `doc/`, because that is where a readme's *"see
./doc/capturing.md"* already points. One file, two readers: the maintainer via the
readme's citation, the site via the note page.

**What a property page can show is decided by what can be read without running
anything:** an accessor's function (`descriptor.get`), a primitive prototype or static
default (`capture = true`), and for an instance field — nothing, honestly. The prose is
the page, and that is the common case, not a degraded one.

**Rejected: a parallel ext** (`propdoc`, `notedoc`) — two more modules for two smaller
versions of the same job. **Rejected: reflecting properties off an instance** — that
means *constructing* one, and for `App` that boots a second site.
