# Page

`Page` is a titled, linkable, **dormant** unit of content — and a node in a tree.
There's no `page()` helper; a page.js exports `new Page(...)` directly.

A Page knows three things and nothing more:

1. **its content** — `content()` (or a string/view)
2. **its place in a tree** — `children` (declared) + `parent` (adopted)
3. **how to link to itself** — `link()` / `crumb()` / `preview()`

It deliberately does **not** know about routing (that's [Router](../Router/)) or
about layout/structure (that's a [Pager / ColumnPager](../Pager/)). Those are
separate, opt-in concerns. You always write `new Page(...)` — never a subclass —
and opt into a structure by defining `pager()`.

## MVP

```js
import { Page, h1, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Text",
    content(){
        h1("Heading");
        p("Body copy with `inline code`.");
    }
});
```

`render()` builds one `div.c("page")` (title + content), captured wherever the
page is placed. Dormant: creating it renders nothing, so importing a page.js is
always safe.

## The tree — `children` + adoption

A parent declares its children; the constructor **adopts** them (`child.parent =
this`):

```js
import a from "./a/page.js";
import b from "./b/page.js";

export default new Page({ meta: import.meta, title: "Topic", children: [a, b] });
```

- **Imports flow DOWN** (parent imports child). No child ever imports its parent,
  so there's no import cycle.
- **`.parent` links point UP**, wired by adoption. Because a child module is
  imported (and constructed) before its parent, the child already exists when the
  parent runs — plain, safe assignment. (Full analysis, including why mutual
  imports fail: `michael/loading.md`.)

This gives synchronous tree walking: `page.chain` → `[root … page]` and
`page.host()` (nearest ancestor defining `pager()`).

A `root` getter sat alongside these and was deleted — it had **zero** callers.
The `this.root` throughout `ColumnPager`/`TabPager` is the *Pager's* own `root`
property, assigned by the topic's own `new ColumnPager({ root: this })`. Easy to confuse; recorded
so it isn't re-added on a misreading.

## The registry

Every Page with a url registers in `Page.registry` (url → page), so a Router or
ColumnPager resolves a path to a live page **synchronously, no dynamic import**.
This is why eager-loading a topic's subtree (a parent `import`ing its children)
pays off: the whole tree is in the registry, and routing never needs a computed
`import()`.

## Loading — `Page.load` / `Page.module_url`

Page owns **both directions** of the url ⇄ module convention, because they are
inverses of each other and drift apart if they live in different files:

```js
page.url                      // "/docs/x.page.js"  →  "/docs/x"   (instance getter)
Page.module_url("/docs/x")    // "/docs/x"          →  "/docs/x.page.js"
```

```js
Page.load(url)          // import the module, then load_ancestors(); returns the default export
page.load_ancestors()   // climb parent_url importing ancestors until host().pager exists
```

`App.load_page` is the only caller. It used to own this logic (`import_page` +
`load_topic`), which meant App knew about `parent_url`, `host()`, and the
`.page.js` suffix — all Page concepts. Moving it here left `load_page` as eight
duck-typed lines and removed every `instanceof Page` from `App`.

`load_ancestors` is the one concession to layouts: a deep page (`/a/b/c/`) is
imported alone, so the ancestor defining `pager()` isn't loaded. Climbing the
url imports it, and **adoption** wires `.parent` as each ancestor constructs — so
by the time `host()` runs, the chain exists. Already-loaded trees make it a
no-op, because `import()` is cached.

## render() vs activate()

- **`render()`** — the one render path: a `div.page` with the title and
  `content`. What `View.append` calls, what a Pager fills a column with, and what
  a page overrides for custom chrome.
- **`activate()`** — "you are now THE page": document-level side effects only
  (`document.title`, meta description). The App calls it on the target page as
  you navigate; embedded pages render but never activate, so composition can't
  clobber the title. `App.load_page` also calls `page.deactivate?.()` on the way
  out — `Page` has no implementation, but the duck-typed call is kept so a page
  can define one.

### Why there used to be two (`render()` + `body()`)

**The question.** A topic that owns a `ColumnPager` also appears *inside* it, as
a column. If `render()` mounts the layout, rendering that column recurses.

**The old answer.** Two methods: `render()` dispatched to the pager, `body()` was
always plain content, and every layout had to remember to call `body()`. The
split was pure workaround — and the name was wrong besides, since `Page.body()`
and `View.body()` (the `<body>` captor) meant unrelated things.

**The current answer.** The layout moved to its own method. A topic writes
`pager(){ return new ColumnPager({ root: this, app: this.app }); }` in its own
page.js, and `App.load_page` calls `host.pager?.() ?? host`. With `render()` no
longer able to mount anything, there's nothing to recurse into — so it collapsed
to one meaning and `body()` deleted itself.

**Verdict: keep the single render path, and keep `pager()` separate.** They are
two different questions — "draw this page" vs "draw this page's whole subtree" —
and the recursion is what proves it. Full weighing of the alternatives (inert
`Pager:` data, a recursion guard, `layout()`) is in `../Pager/readme.md`.

### Deleted alongside it

`theme` + `deactivate()` (no page ever set `theme`), the `url` setter (no page
ever passed `url:`), the `root` getter, and `Router.routes`. All had **zero**
consumers.

The `url` setter is the one likely to come back: a runtime-built Page (see the
[top-down proposal](/framework/core/Page/simplify/top-down)) has no `import.meta`
to derive a url from. Reintroduce it **with** that caller, not on spec.

## Links (all plain anchors — a Router intercepts the clicks)

- `link(text?)` → `<a class="page-link">` to this page.
- `crumb()` → `<a class="crumb">` (breadcrumb style).
- `preview()` → an `<a class="preview">` card (title + description).
- `previews()` → all `children` as preview cards — call inside `content()`.

Because they're ordinary `<a href>`, an opt-in Router upgrades the clicks to
no-reload navigation with **zero per-link wiring**; with no Router they're just
links (full navigation). Same call, behavior scales to context.

## Open schema

The constructor is `assign(...args)` — any extra property rides along as inert
data. Only `title`, `description`, `classes`, `children`, `col`, and `meta` have
built-in behavior — plus the two optional methods `content()` and `pager()`.

`pager()` is the one hook `Page` reads but never provides: `host()` asks "does
this ancestor define one?", and that's the extent of `Page`'s layout knowledge.
The `new ColumnPager(...)` lives in the topic's own page.js, so the construction
is visible in the file that asked for it. `Page` still imports no Pager.

`col` is the model for how a page should influence a layout it doesn't know
about: it's **just a class string** that the layout puts on the element it owns
(`ColumnPager` puts it on the `.column`). The page states an intent ("I'm mostly
nav"); the layout and the CSS decide what that means, or ignore it entirely. No
new Page API, no layout API — one inert property and a stylesheet.

## Files

- `Page.class.js` — the `Page` class (exported from `/app.js`)
- `page.js` — the navigable doc page (`/framework/core/Page/`)
- `simplify/` — **live audit + open proposals** (`/framework/core/Page/simplify/`):
  what this class still carries and who uses it, whether the tree should move to
  `Pager`, top-down loading, and the registry gate
- Structure & routing live next door: [`../Pager/`](../Pager/), [`../Router/`](../Router/)
