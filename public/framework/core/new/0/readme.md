# new/0 — the Router-less MVP

Two classes, **149 lines of code** (270 with comments), and it runs. The point is to lock the App↔Page
interaction and the three UI modes *before* any routing exists, so that when a
Router lands it has nothing to invent — it only replaces `page.activate()` with
`page.go()`.

```
0/
  App.js            boot, the ONE flat container, url -> page, and the marking
  Page.class.js     a node: url, content, children, and how it mounts itself
  server.js         dev-only, port 8200, SPA fallback
  site/             six pages, three modes
    page.js           /              root
    about/            /about/        mode 1 · replace (declares nothing)
    docs/             /docs/         mode 2 · columns
      intro/ guide/                  plain files that become equal columns
    focus/            /focus/        mode 3 · full
  agents/           the design council's proposals — steve, eric, tim
```

```bash
node public/framework/core/new/0/server.js     # http://localhost:8200/
```

## The one structural fact

**Every page's view is a direct child of `app.$pages`, at every depth.** There is
no per-page `$pages`, so the chain is a row of *siblings*, and an arrangement is
a rule about siblings rather than a tree of nested boxes.

That is what makes the three modes almost entirely CSS. `App.mark()` writes
exactly two things — `.active-page` / `.active-ancestor` on the chain, and
`data-mode` on `.app` — and stylesheet does the rest:

```css
.page             { display: none; }                       /* not in the chain */
.page.active-page { display: block; }                      /* 1 · replace, the default */

[data-mode="columns"] .pages { display: grid; grid-auto-flow: column;
                               grid-auto-columns: minmax(0, 1fr); }
[data-mode="columns"] .page.active-ancestor { display: block; }   /* 2 · columns */

[data-mode="full"] .sidebar { display: none; }             /* 3 · full */
```

Measured in a 1400px window:

```
/                 replace   root 1160
/about/           replace   about 1160          (root mounted, hidden)
/docs/            columns   root 580 | docs 580
/docs/intro/      columns   root 387 | docs 387 | intro 387
/focus/           full      focus 1400, sidebar gone
```

Equal at every depth, and `intro/` and `guide/` are plain `page.js` files that
declare nothing. Compare `new/starter`, where nested `.pages` halved the
remainder at each level (494 | 246 | 245) and needed `display: contents` to
flatten. **There is nothing left to flatten.**

## The council's decisions

Three personas proposed independently (`agents/steve/`, `agents/eric/`,
`agents/tim/`). Where they disagreed, the verdict and the dissent:

| | verdict | who dissented, and why it's worth knowing |
|---|---|---|
| **What loads what** | Import `/page.js`, walk the segments in memory | **Tim**, strongly: eager imports mean *any* url loads the entire site — the exact "25 modules for one page" cost starter measured. His alternative (import the first segment, skip the root) needs root to deliberately *not* import its children, which makes root a special case. Taken as-is; laziness is the Router's job. |
| **Chain diff** | None. Nothing is deactivated | **Tim**: with no `deactivate()`, a page holding a socket, timer or `<video>` leaks silently on every navigation away — nothing throws, the tab just gets slower. Two lines to add back (`this.chain` + one `filter`) the day a page owns a real resource. **This is the first thing to add.** |
| **Mode resolution** | `chain.findLast(p => p.mode) ?? "replace"` | **Steve** used `find` (nearest root wins). `findLast` means a deep page can declare `full` inside a `columns` topic — same override direction as CSS. |
| **Mode carrier** | `data-mode` on `.app` | **Eric** put it on `$pages`, which forced `:has()` to reach the sidebar — he flagged it himself. An attribute is also self-clearing; both class versions needed an explicit wipe first. |
| **Ordering** | CSS `order` from the chain index | Unanimous. Re-appending gets DOM order right and resets every column's scroll, because appending an attached node is a detach + attach. |
| **`link()`** | A plain `<a href>` | **Steve** wanted `href` + a click handler calling `activate()`. Eric and Tim both argued interception is always a delegated `document` listener the Router owns, so `link()` never changes. With no Router a click is a real page load — which is precisely what proves the SPA fallback and cold resolution work. |
| **`app` adoption** | `root.adopt(this)`, recursive, once | Eric assigned it inline during `resolve()`, so only chain pages got one. Recursive means *any* page can be activated from anywhere — which is what the demo's buttons need. |
| **`.page-content`** | Cut. One box per page | Eric and Tim kept it. It existed to survive nested-flex traps that no longer have anywhere to happen. **Eric's caveat is the one to remember:** it was also separating *"am I visible"* from *"where do my children go"* — the day a tabs-style mode wants a slot distinct from the page's own `<h1>`, this is what comes back. |

`config()` and `initialize()` stay as empty hooks. All three flagged them; the
lifecycle was fixed by the repo owner, and `config()` is exactly where the Router
lands.

## What the review round caught

The council reviewed the build (`agents/*/report.md`). Three findings were real
and are fixed; the rest are recorded below.

**1. The captor was `$app`, not `$pages`** (Tim). A page's view is built by an
element factory, which auto-appends to the captor — so every `render()` put its
page beside the sidebar, and it only ever looked right because `mount()`
reparented it on the next line. Any *other* caller of `render()` would have
stranded a view in `.app`, invisible only because `.page { display: none }` is the
default. Fixed in both `App.render()` and `site/app.js`; `mount()`'s parentNode
check now means idempotence and nothing else. Verified: a standalone
`page.render()` lands in `.pages`, zero strays.

**2. `page.activate()` was outside the try** (Eric). `load()` guarded only the
import, but `activate()` renders the whole chain and runs every `content()` there
is. A throw in any of them skipped `inject()` entirely — blank white page, no
error view, nothing in the UI saying why. The try now covers both.

**3. `error()` emptied `$app`** (Eric), which is the whole chrome — so the one
page that most needs navigation was the one page without a sidebar. It renders
into `$pages` now, as a `.page.active-page`, and the sidebar survives.

**Corrected in this readme:** it previously said none of the council put
`mark_links()` on `App`. Tim's proposal did, for exactly the reason it's there —
a sidebar built once is only ever correct on boot. That was my error, not a late
add. Steve dissents and would push it down to `site/app.js`; two of three, and
both `core/App` and `starter` put it on App, so it stays.

## `page.activate()` is the verb

```js
activate(){
    this.mount();                            // me and my ancestors, ancestors first
    if (this.title) document.title = this.title;
    this.app.mark(this);                     // classes, order, data-mode, links
}
```

Nothing overrides it, and there is no `enter()` hook — because with mode as data
there is nothing left for a page to *do* on entry. That's the direct answer to
`new/starter`'s sharpest edge, where overriding `activate()` silently unmounted
the page and the escape was `Page.prototype.activate.call(this)`.

The demo's buttons call it directly:

```js
button("Intro").click(() => intro.activate());
```

Verified: mode, `document.title` and the sidebar highlight all follow, with no
reload and no navigation.

## Retention, measured

```
root column scrollTop 250
  → guide.activate()
  → intro.activate()
root column scrollTop 250   ·   same DOM node
```

`render()` holds `this.view` forever, `mount()` refuses to re-append an attached
node, and `order` moves a page visually without touching the DOM. So nothing is
ever rebuilt and no scroll position is ever lost — none of which is implemented,
all of which falls out of the structure.

## What is deliberately absent

`declare()` · `add()` · `alias()` · `route()` · `Page.import()` · `Page.missing()`
· `container()` · `deactivate()` · `go()` · `seo_title()` · `$pages` per page ·
`Page.registry` · `host()` · `load_ancestors()` · `parent_url` · `font()` ·
`config_socket()` · everything Router.

Two the reader is most likely to miss:

- **`alias()`** — no `app.root.docs`; it's `app.root.child("docs")`. One method,
  no generated properties.
- **A syntax error deep in the tree** now surfaces as `App.error()`'s
  "Page Load Error" view, because every page is reachable through the one
  `import("/page.js")` that `load()` wraps in a `try`.

## Open, and what the Router changes

1. **`deactivate()` and the chain diff** — see Tim's dissent above. First thing in.
2. **Eager loading.** Every url imports the whole site. The Router reintroduces
   lazy `child()` imports; until then this is correct and slow, not broken.
3. **`link()` is a real navigation.** By design for now. The Router upgrades every
   anchor at once with one delegated listener, and `Page.link()` does not change.
4. **No history.** `activate()` doesn't touch the url, so a button-driven mode
   change is not bookmarkable and Back doesn't undo it. `go()` is where
   `pushState` lands.
5. **Mode is not in the url** — deliberately. A mode belongs to the destination
   page, because the url is the only state that survives a reload. See
   `new/starter/site/modes/link/` for the argument in full.
6. **A page with no `meta` is silently unreachable** (Steve). `naming()` derives
   `url` from `meta` alone, so `new Page({ title: "Orphan" })` inside a `children`
   array constructs happily with `url` and `name` both `undefined`, and
   `child(name)` can never match it — `undefined === "orphan"` is always false. No
   throw at construction, none at lookup. Nothing does this today because every
   child is an import, but nothing says it's required either.
7. **`/about` and `/about/` both resolve** (Eric). `resolve()` splits on `/` and
   filters empties, so it never compares back against `page.url`. Harmless now —
   marking uses the canonical `page.url` — but two address-bar strings rendering
   as the same page will matter the moment `pushState`, a canonical link, or
   path-keyed analytics treats the url as ground truth.
8. **Mode resolution moved off `Page`** (Tim). His `resolved_mode()` let any page
   answer "what would I resolve to" in isolation; inlining `chain.findLast(...)`
   into `App.mark()` means that knowledge exists only while the chain is being
   marked. Nothing needs it yet. Worth knowing it once existed, so it gets
   rebuilt deliberately rather than by accident.
9. **The sidebar `nav` array is hand-typed** (Tim). Six `[url, text]` pairs that
   agree with six page `title`s because someone matched them, not because one
   derives from the other. Rename a title and the link goes stale silently. The
   fix is to build the nav from `app.root`'s children — which works precisely
   because loading is eager, and stops working the day it isn't.
