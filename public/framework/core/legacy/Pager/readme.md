# Pager, ColumnPager, TabPager

Design record. The friendly version is [`page.js`](./page.js) → `/framework/core/Pager/`.

A **Pager** is a `div.pager` that shows one page and can swap it. A **structure**
is a Pager subclass whose `render()` arranges a page tree — `ColumnPager` (a
drill-down) and `TabPager` (a tab bar) are the two that ship.

## Pager — the MVP

Deliberately dumb: **no history, no URLs, no activation.**

```js
show(page){ this.empty(); this.append(page); this.active = page; return this; }
```

That plus `leaf()` is the entire class. Two usage modes:

| mode | who drives it | what `root`/`leaf()` mean |
|---|---|---|
| **manual** | you: `pager.show(page)` | unused |
| **mounted** | a topic: `pager(){ … }` | `root` = the topic, `leaf()` = the page being viewed |

Mounted, the **topic builds it itself**, in its own `page.js`:

```js
pager(){ return new ColumnPager({ root: this, app: this.app }); }
```

`App.load_page` just calls `host.pager?.() ?? host`. Nothing in `App` or `Page`
imports a Pager or knows what one is — the `new` is in the file that wanted it,
where you'll actually look for it.

The argument object is a plain assign-object, so **no subclass needs a
constructor**. (It used to be `new this.pager(this)` with
`constructor(root){ super({ root }) }` copy-pasted into every subclass. Passing
the object deleted that boilerplate everywhere.)

### Why `pager()` and not `render()`

**The question.** A topic could just override `render()` to return its layout.
That reads best of all — so why doesn't it work?

**Because the topic is inside its own chain.** `ColumnPager.columns()` takes
`chain.slice(-2)` and fills each column with `pg.render()`. On `/michael/` the
chain is `[michael]`, so the single column **is** michael — and `render()` would
build another ColumnPager inside itself, forever.

**Alternatives weighed.**

- **`Pager: ColumnPager` as inert data, App does the `new`.** Tried it. No
  recursion, but the construction happens in a file you have to go hunting for —
  you read the topic, see a class sitting there as data, and nothing tells you
  who instantiates it. Rejected as too magic.
- **A recursion guard in `render()`** (`if (this.mounted) …`). Strictly worse:
  hidden state, and the bug returns the moment a second container renders a topic.
- **`layout()`** — good name, but `michael/page.js` already imports a child page
  called `layout`. Collisions in the one file that needs the method most.

**Verdict: `pager()`.** Lowercase because it's a method returning an instance,
named for what it returns, and it makes the two questions explicit: `render()` =
"draw this page", `pager()` = "draw this page's whole subtree".

That property is also why adding `app` cost nothing. Injecting a dependency into
an assign-based constructor is one more key in an object literal — no signature
to change, no subclass to touch. It's the concrete payoff of the convention.

### `leaf()` — ask the App, don't read the URL

```js
leaf(){
    const page = this.app?.page;
    return page?.chain?.includes(this.root) ? page : this.root;
}
```

The App has *already* resolved the target page before it renders us (`app.page`
is set before `$app.append(page.host())`). A layout re-deriving it from
`window.location` + `Page.registry` was a second, independently-fallible answer
to a question already answered. The `chain.includes(root)` guard means a Pager
mounted somewhere unexpected degrades to showing its own root instead of
rendering someone else's subtree.

`this.app`, not `window.app` — the app is injected down the chain
(`App.load_page` → `Page` → `Pager`). The optional chaining is still load-bearing
after the change, but for a different reason: a **standalone** `new Pager()` (the
TabPager panel, a demo on this page) has no app and never did. It falls back to
`this.root`, same as before.

This is the general rule for structures: **layouts are told, they don't ask.**
The remaining URL knowledge in the whole layout tier is now zero — see
`App.mark_links` for how active states happen without it.

## ColumnPager — the drill-down

```js
export default new Page({
    meta: import.meta,
    title: "Docs",
    children: [intro, api],
    pager(){ return new ColumnPager({ root: this, app: this.app }); },
});
```

A **topic** declares the pager; its descendants are plain Pages that know nothing
about it. When any descendant is the target, `Page.host()` walks up to the topic,
the App mounts the ColumnPager, and it renders `leaf().chain`.

Because clicking a link and hard-reloading a url run the same chain logic, `/a/b/`
looks identical either way — no per-page layout knowledge, no hash router.

- Columns are filled with plain `page.render()` — a Page never mounts its own layout, so
  a topic never recurses into its own ColumnPager.
- Only the last two of the chain are columns; the rest become breadcrumbs.
- Navigation is plain `<a href>` — the Router intercepts globally, and
  `App.mark_links` applies `.active` / `.in-path`. No handlers, no url checks.
- Below `45em` (a container query on its own width, not the viewport) the sidebar
  goes off-canvas behind a burger and only the focused column shows.

```
.column-pager
  .sidebar            brand + the topic's children
  .backdrop           dims content behind the off-canvas sidebar
  .main
    .topbar           burger + breadcrumbs
    .columns
      .column.secondary   the parent, acting as nav
      .column.active      the focused page
```

## Extending: the three levers, cheapest first

The question that drives this file: *when a layout needs to look different, what
is the smallest thing that can change?* Three answers, and you should always try
them in this order.

### 1. A class on the element — for **appearance**

A page declares `col: "narrow"` and `ColumnPager.column()` puts it on the
`.column`. That's the whole mechanism:

```js
.ac(pg.col)   // ColumnPager.column()
```

```css
.column.secondary.narrow { flex: 0 1 18em; }
.column.secondary.wide   { flex: 2 1 0; }
```

Sizing applies while the page is the **left** column — i.e. while it's acting as
nav. The focused column always fills, so a single-column view never leaves dead
space. That asymmetry is deliberate: "how wide is this page" is not a property of
the page, it's a property of the *role the page is playing right now*.

This covers the motivating case exactly: a page that's a heading, a line, and a
list of previews (`/framework/`, `/framework/core/`, `/framework/util/`) shouldn't
get half the screen; a page of prose should. Since `col` is an inert string, a
site can define `col: "sidebar-ish"` and style it without touching either class.

### 2. Override a method — for **structure**

`render()` is decomposed so that every piece is its own method:

```
render → sidebar → brand
                 → nav
       → topbar  → crumbs
       → columns → column → col_bar
```

A topic supplies a subclass:

```js
pager(){
    return new class extends ColumnPager {
        brand(){ return a("Acme").href("/").ac("brand"); }
        nav(){ div.c("sidebar-nav", () => site_links.forEach(l => l.render())); }
    }({ root: this, app: this.app });
}
```

Only the method you name changes; everything else — chain resolution, columns,
breadcrumbs, the container query, `close()` — is inherited. This is the answer to
"the sidebar needs restyling, but building it into ColumnPager feels wrong": it
*is* built in, as a **default you can replace in four lines**, and the class stays
one file with no options object.

**Name the subclass and CSS scoping comes free.** `classify()` walks the
constructor chain, so `class DocsPager extends ColumnPager {}` — empty — renders
`div.docs-pager.column-pager.pager`, and `.docs-pager > .sidebar { … }` styles
one topic without touching the others. Before this, two ColumnPager topics were
indistinguishable to CSS. (A class *field* — `classes = "docs"` — does **not**
work: fields initialize after `super()` returns, and `classify()` runs inside it.)

Data-only knobs, for when a subclass is overkill: `brand`, `logo`, `home` (passed
through to the Sidebar) and `col` (read by `column()`). Resist adding more —
every knob is API surface, and the subclass already covers everything.

### The sidebar isn't ours

`sidebar()` returns a **`Sidebar`** (`core/Sidebar/`), not markup of our own:

```js
sidebar(){
    return new Sidebar({
        logo: this.root.logo,
        logo_url: this.root.home ?? "/",
        brand: this.root.brand ?? this.root.title,
        brand_url: this.root.url,
        pages: this.root.children,
    });
}
```

```
[ 🖼 Framework ]
   │      └── brand_url = root.url — back to this section's landing page
   └── logo_url = "/" — the site root
```

Two destinations on purpose: in a drill-down the logo leaves the section and the
text returns to the top of it. On a homepage both are `/`.

It was extracted here because **a sidebar is not a ColumnPager idea.** While its
CSS lived in `ColumnPager.css` the only way for anything else to have one was to
copy 50 lines of it. Now `ColumnPager.css` says only where it goes:

```css
.column-pager > .sidebar { flex: 0 0 var(--sidebar); }
```

Same split as `Page.css`: the component owns its look, the layout owns its
placement. `Sidebar.link()` is duck-typed — a `Page` brings its own `link()`,
a plain `{title, url}` needs no import — so a sidebar can list a loaded page
tree *or* a hardcoded list of sections a site doesn't want to eager-load.

### 3. A new subclass — for a **different arrangement**

When the layout isn't the drill-down at all:

```js
export class Split extends Pager {
    render(){
        const [left, right] = this.leaf().chain.slice(-2);
        div.c("left", () => left.render());
        div.c("right", () => right.render());
    }
}
```

Nothing navigational changes — links stay links, the Router still intercepts, the
App still activates the leaf. Only the arrangement differs. `TabPager` is the
shipped proof.

## TabPager — and what it proves

```js
render(){
    this.pages = this.pages ?? this.root?.children ?? [];
    div.c("tab-bar", () => this.pages.forEach(page =>
        this.tabs.push(span.c("tab", page.title).click(() => this.select(page)))));

    this.panel = new Pager().ac("tab-panel");   // ← the base class, used as a part
    this.select(...);
}

select(page){ …mark the tab…; this.panel.show(page); }
```

Twenty lines, and the panel **is** a plain `Pager`. That matters: `ColumnPager`
extends `Pager` but never calls `show()`, which made the base class look like
inheritance-for-its-own-sake. `TabPager` uses it by composition, which is the
better relationship and the honest justification for `Pager` existing.

**Tabs are in-page, not url-driven** — clicking swaps the panel and changes no
url. That's the right default (tabs are usually a view state, not a location),
and it makes tabs usable on any page with three dormant Pages and no routing at
all. Mounted as a topic's layout it opens on `leaf()`, so a deep url still lands
on the right tab; if you want tab clicks to push history, don't add a mode — write
the six-line url-driven variant that renders `leaf()` the way ColumnPager does and
leaves the links as links.

## Variations worth building (and which lever each needs)

| variation | lever | notes |
|---|---|---|
| narrow nav column | **class** (`col: "narrow"`) | shipped |
| wide focus column | **class** (`col` on the neighbour) | shipped |
| three visible columns | class | `.columns { --cols: 3 }` + `chain.slice(-3)`; the `slice` is the only code |
| no sidebar (breadcrumbs only) | class | `.column-pager.no-sidebar > .sidebar { display: none }` |
| sidebar on the right | class | `flex-direction: row-reverse` |
| full-bleed / no chrome page | class | `col: "bare"` → hide that column's `.col-bar` |
| collapsible sidebar sections | **method** (`nav()`) | needs grandchildren; a `nav()` override that recurses |
| custom brand / logo | **method** (`brand()`) or `root.brand` | shipped |
| a search box in the topbar | **method** (`topbar()`) | |
| stacked/accordion instead of columns | **subclass** | different arrangement of the same chain |
| tabs | **subclass** (`TabPager`) | shipped |
| master–detail with a list, not previews | **subclass** | |
| carousel / wizard | manual `Pager` + `show()` | no tree involved |

The pattern to notice: **appearance is CSS, structure is a method, arrangement is
a class.** If a change needs a new property on `Pager`, it's probably one of the
first two wearing a disguise.

## Open questions

- **`.col-bar`** (the `/path` + `✕` strip on every column) is developer chrome. It
  reads as an IDE, not a document. Candidate for `col: "bare"`, or for moving the
  close affordance into the breadcrumb.
- **`.column-pager` fights the height chain.** `body:has(.column-pager)` and
  `.app:has(.column-pager)` in `ColumnPager.css` reach outside the component to
  pin `height: 100%`. It works, but a component reaching up to `body` is a smell.
  Alternative: `.app { display: grid; height: 100% }` unconditionally in
  `framework.css`, so no layout has to opt in.
- **Re-render granularity.** Navigating within a topic re-renders the whole
  ColumnPager. `Pager.show()` exists precisely to swap one region — the focused
  column could use it, keeping sidebar scroll position across navigations. Not
  done: it needs the App to distinguish "same host" from "new host", which is the
  first real state this tier would own.
- **Two columns is hard-coded** (`chain.slice(-2)`). Making it `this.cols ?? 2`
  is one line, but the container query and the `.secondary` role naming both
  assume two. Do it when a third column is actually wanted.

## Files

- `Pager.js` / `Pager.css` — the base: `show()` + `leaf()`
- `ColumnPager.js` / `ColumnPager.css` — the drill-down
- `TabPager.js` / `TabPager.css` — the tab bar
- Loading strategy & the tree these walk: `michael/loading.md`
