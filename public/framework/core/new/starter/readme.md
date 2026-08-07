# new/starter — a working strip-down

Three classes, **~210 lines**, and it runs. Nothing here is imported by the real
site; `core/` is untouched.

```
0/
  App.js                boot, and the root page's container
  Page.class.js         a node: content, children, and how it places itself
  Router.js             url -> page, and the swap
  site/                 a demo site that explains itself
    page.js             /            overview
    app/ page/ router/  the trio — API tables + who calls what
    loading/            chain → screen;  resolve/ is url → chain
    nesting/  dynamic/  chain + "nothing was rebuilt"; route()
    inline/             add() — pages with no file, incl. inline tabs + takeover
    layouts/            the four arrangements, each one working
      replace/          1 · the default
      column/           2 · opt-in/ (3 columns) vs plain/ (the open problem)
      tabs/             3 · one/ two/ three/, a relocated $pages
      takeover/         4 · full/ — activate() goes straight to the App
    modes/              replace vs columns vs bare — all one class
      flat/             a/ a/deep/ — plain files that become equal columns
      bare/             deep/ — chrome hidden without moving the page
      link/             can a link choose the mode? (no)
    state/ areas/ beyond/   the open questions
  drive.mjs             Playwright — --tour=basics | layouts | smoke | reload | all
  server.js             serves site/ over public/, + DevSocket live reload
```

`site/pages/` was folded into `site/page/` — having `/page/` and `/pages/` mean
different things was worse than the rename.

## The demo's layout

Two full-height columns, no header. The sidebar's gray bleeds to the left edge
while its nav sits at the sidebar's *right*, so the nav and the content read as
a centered pair. Every page scrolls itself — see "Scroll: the scroller was on
the wrong element" below.

The chrome is built once in `site/app.js`'s `render()` override, **outside**
`$pages`, so navigation can't touch it.

## Run it

```bash
node public/framework/core/new/starter/server.js        # http://localhost:8100/, with live reload
node public/framework/core/new/starter/drive.mjs        # the browser tours — see below
```

There is no unit-test directory. `test/` held a jsdom harness that had rotted:
jsdom was never installed, so it had not run in a long time, and it asserted on
`style.display` — which is always empty now that visibility is CSS. `drive.mjs`
covers more, in a real browser, with no dependency to install.

### Live reload

The server is the repo's real `Server` + `DevSocket` plugin, not a copy — it
subclasses `Server` to override two things and nothing else:

```js
class StarterServer extends Server {
    initialize_express(){ /* site/ first, then public/, fallback site/index.html */ }
    listen(port = process.env.PORT || 8100, host = "0.0.0.0"){ return super.listen(port, host); }
}

StarterServer.use(DevSocket);
```

`use()` is registered on **`StarterServer`, not `Server`** — `Events` gives every
subclass its own static `_events`, so the main dev server's plugin list is
untouched.

The client half is one line in `site/app.js`, because the site opts in, not the
framework — `App` knows nothing about sockets:

```js
socket: Socket.singleton(),
```

Two things worth knowing:

- **`LiveReload` does `chokidar.watch("public")` — a path relative to the working
  directory.** Run the server from anywhere but the repo root and it watches
  nothing, silently. `server.js` now does `process.chdir(root)` for exactly that
  reason; the static roots are absolute, so nothing else notices.
- **`drive.mjs` sets `window.$BLOCKRELOAD` on every page**, so saving a file
  mid-tour can't reload one out from under the script. The client `Socket` already
  honoured that flag. The live-reload step **clears it for itself**, right after its
  `goto` — `Socket.reload()` reads the flag when the reload arrives rather than when
  the socket connects, so clearing it there is both enough and late enough. That is
  what lets `all` contain the step instead of excluding it; the alternative was a
  tour-wide `if` that quietly made `all` mean "all but two".

The live-reload step proves the chain by editing `site/styles.css` for real and
putting it back in a `finally`:

```
socket connected: true   ·   page reloaded on file change: true
```

Nothing here is in `package.json` — no dependency, no npm script. This is a
prototype, and the repo's three-package dependency list is worth more than the
convenience (see "Never add a dependency without asking" in CLAUDE.md).

## Logging — `console` directly, and why there is no logger

There **was** a `trace.js` helper. It's deleted, because a logging wrapper puts
its own file and line on every message: devtools showed `trace.js:29` for all of
them, so the one thing the source link is for — jumping to the code that logged —
never worked. `console.log` is now called at the site that has something to say.

The cost is that indentation can't be tracked in a shared counter any more. That
turned out to be the right trade, because the correct tool was already there:

```js
console.groupCollapsed(`router.activate(${page.log_label()})`);   // devtools indents & folds
…
console.groupEnd();
```

**Groups wrap synchronous work only.** A group opened before an `await` stays
open across it and swallows every unrelated message until it closes, so anything
async (`App.start`, `Router.load`, `Router.load_segments`, `Page.child`) logs flat
lines with a `↳` for sub-steps instead. `Router.activate` and `Page.render` are
synchronous start to finish and are real groups.

### Naming

Every line begins with the thing that logged it, so the log reads as calls:

```
app.load_root() — import("/page.js"), the walk needs an origin
▾ page{/}.child("nesting")
    ↳ import("/nesting/page.js")
    ↳ resolved page{/nesting/}
▾ router.activate(page{/nesting/})      ← collapsed group
    from    /
    to      / › /nesting/
    shared  1 — / untouched
```

`page{<url>}` comes from `Page.log_label()`; `App.log_label()` returns `"app"`.
The prefix is deliberate: it is **strictly** a logging name, leaving `label()`
free for a human-facing short name (nav links, breadcrumbs). Pages are
identified by **path, not title** — two pages can share a title, never a url. App
and Page both having `log_label()` is the same symmetry that lets them both be a
container: `container.log_label()` and `container.$pages` work without knowing which
one you got.

No `%c` formatting anywhere. That keeps `drive.mjs`'s console handler fully
synchronous — decoding format strings needs an `await`, and awaiting in that
handler lets messages interleave and the group-depth counter drift.

### `drive.mjs`

Runs a real Chromium through a tour, mirrors the console into the terminal, and
prints the `.page` tree after each step (`▸` visible, `·` content hidden). It
rebuilds group indentation from Playwright's `startGroupCollapsed`/`endGroup`
message types, so a folded group in the browser is an indented block here.

Playwright is a **global** tool, not a dependency, resolved from `npm root -g` at
runtime — nobody who just wants the dev server has to download a browser:

```bash
npm i -g playwright && npx playwright install chromium   # once

node public/framework/core/new/starter/drive.mjs --step        # Enter advances each step
node public/framework/core/new/starter/drive.mjs --tour=layouts
node public/framework/core/new/starter/drive.mjs --headless --close   # just the log
```

Tours: `basics` · `layouts` · `smoke` · `reload` · `all` (default), where **`all`
is all four** — 53 steps. It used to be `basics.concat(layouts)`, so the two tours
most likely to catch a rename were the two it silently skipped. `reload` runs last,
because it edits a watched file. The browser stays open unless you pass `--close`.

### Every early return needs its own `groupEnd()`

`console.group` has no scope — it's a counter. A method that opens one and then
returns early from a branch leaves it open **forever**, and since the next
navigation opens more, the console drifts one level right per click and never
comes back. Measured before the fix, `router.activate` was logging at depth 4
instead of 2 on the second navigation.

Two exits were missing theirs: `Page.child`'s memory-hit branch (which fires on
almost every revisit) and `Router.load_segments`'s 404 branch. Both now close
before returning. The rule is per **exit path**, not per method — `load_segments`
correctly has one `console.group` and two `console.groupEnd`s.

## A child never writes its own path

`add()` used to take a fully-built Page, so an inline child had to spell out
`url: "/inline/alpha/"` — a second copy of its parent's location, and one more
thing to forget when the parent moves. Now `add()` derives it, because it already
knows both halves:

```js
add(name, child){
    const page = child instanceof Page ? child
        : new Page(is.fn(child) ? { content: child } : child);

    page.assign({
        name, parent: this, app: this.app,
        url:   page.url   ?? this.url + name + "/",   // MY url + the name I gave it
        title: page.title ?? name,
    });
}
```

Three shapes, cheapest first — **a function is the content**:

```js
this.add("alpha", () => p("hi"));                    // content fn
this.add("beta",  { title: "Beta", content(){ … } }); // options
this.add("full",  new Page({ … }));                  // a Page you built
```

An explicit `url` still wins (`??`), so nothing that had one broke. `route()`
dropped its `url:` too, since `child()` already funnels the result through
`add()` — visible in the console as the url being filled in:

```
new page{…} constructed — "Item 42", children []
page{/dynamic/}.add("42") → page{/dynamic/42/}
```

**The constructor had to stop assuming a url.** It read `this.meta.url`
unconditionally, so a Page with neither `meta` nor `url` threw. Both derivations
are now guarded, and `log_label()` prints `page{…}` until a parent adopts it — which
is why the trace above reads the way it does.

## Names: derive inside, once

`add()` used to patch defaults on from outside — `title: page.title ?? name` — so
`new Page({ name: "intro" })` and `parent.add("intro", …)` produced *different
objects*. All of it now lives in one idempotent method the constructor and
`add()` both call:

```js
naming(){
    this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
                 : this.parent && this.name ? this.parent.url + this.name + "/"
                 : undefined;
    this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
    this.title ??= this.name;
    this.label ??= this.title;
}
```

A page.js starts from `meta` and works out its name; an inline page starts from
its `name` and works out its url. Same method, opposite directions. Every line is
`??=`, so it is idempotent and an explicit value always wins — which is what lets
`add()` simply call it again after supplying `name` and `parent`.

The general rule is now in CLAUDE.md under "Derive inside the class, not at the
call site".

### `name` is hyphenated; the alias is not

`name` is not free to choose — it is the Map key, the url segment, **and** the
directory on disk, and `child()` is handed a raw url segment by the router. Making
it underscored would mean converting on every lookup and would break
`children: "opt-in plain"` matching its folders.

So the underscore form is an alias, made once in `add()`:

```js
alias(name, page){
    const key = name.replaceAll("-", "_");
    if (!(key in this)) this[key] = page;    // page.opt_in, never clobbering
}
```

`if (!(key in this))` matters: a child named `url` or `title` must not overwrite
the page it attaches to.

### `title`, `label`, `seo_title()`

| | | |
|---|---|---|
| `title` | data | the `<h1>`, and the default for the rest |
| `label` | data | short form for links and tabs — `preview()` and `link()` use it |
| `seo_title()` | method | `"new/starter — Four layouts"`, for `document.title` only |

`title` and `label` are plain properties because that is what they are; only
`seo_title()` computes, because it needs `app.title`, which a page cannot know at
construction. It collapses to just the title when the two would repeat, so `/`
reads `new/starter` rather than `new/starter — new/starter`.

## `layout` → `classes`, plus an automatic `page-{name}`

`layout` was a name invented for what was literally `.ac(this.layout)` — a
concept where there was only a class string. Two honest mechanisms replace it:

```js
render(){ … .ac(this.name && "page-" + this.name).ac(this.classes) }
```

```css
.page-column.active-ancestor { display: grid; }   /* style THIS page */
.columns.active-ancestor     { display: grid; }   /* style pages LIKE this one */
```

Every page classes itself, so a site can style one page without that page knowing
anything; `classes` is for the reusable case. Neither is framework vocabulary —
`columns` and `tabs` are class names the *site's* stylesheet defines.

Live, three deep:

```
page active-ancestor
page page-layouts active-ancestor
page page-column columns active-ancestor
page page-opt-in columns active-ancestor
page page-deep active-page
```

**Known limit,** logged rather than solved: `page-{name}` is not unique. `/a/b/`
and `/nested/a/b/` both yield `.page-a .page-b`, and scoping cannot separate them
— only specificity, which silently favours the longer selector rather than the
intended one. Full-path classes would be unique and unreadable. Not chosen.

## Retention is the default, and visibility is CSS

`keep` is gone. It was a base-class flag with one consumer, and the default it
opted out of was wrong:

> **`render()` holds `this.view` forever.** Detaching a page frees nothing. It
> only throws away scroll position and focus.

So pages stay mounted once shown, and what you can SEE is decided entirely by
CSS, from the `.active-page` / `.active-ancestor` classes `Router.mark()` already
maintained for link highlighting:

```css
.page:not(.active-page):not(.active-ancestor) { display: none; }   /* not in the chain */
.page.active-ancestor > .page-content { display: none; }           /* replace: step aside */
```

`.showing` is gone too — it was a second class meaning exactly what
`.active-ancestor` already meant. `activate()` appends (only if not already
mounted — re-appending an attached node MOVES it and reordered siblings on every
revisit), and `deactivate()` now does nothing at all.

The layout surface is down to **two** knobs: `$pages` and `layout`.

## Scroll: the scroller was on the wrong element

The old symptom, reported as *"the scroll position of the previous page is
somewhat maintained"*: `overflow-y` was on `.main`, part of the chrome, so **one**
scroller was shared by every page and its offset bled across navigations.

`overflow-y` now lives on `.page-content`, so every page scrolls itself:

```
/nesting/deep/   scrolled to 532
/nesting/     →  0        never visited — opens at the top
/nesting/deep/ →  532      its own scroller, untouched
```

Both behaviours are what you'd expect and **neither is implemented** — no
`scrollTop` is read or written anywhere. It falls out of the structure. The
earlier readme entry saying per-page scroll was impossible without writing it is
superseded: it was impossible with one shared scroller, which was the actual bug.

## Columns are a grid, because flex-basis and padding don't mix

`flex: 1 1 0` sizes the **content box**, so an item's padding is added on top of
its share. The padded column came out exactly 80px wider than the bare one, every
time — 569 / 490 instead of 529 / 529. Two dead ends before the fix:

| tried | result |
|---|---|
| `padding-inline: max(2.5rem, calc((100% - 46rem)/2))` to centre | percentages resolve against the **containing block**, so every column was padded as if it were full width |
| `margin-inline: auto` for centring | auto margins absorb flex free space — a centred column is not a shared one |

A `1fr` grid track is sized before padding, so the split is exact whatever the
children carry:

```css
.page.columns.active-ancestor { display: grid; grid-template-columns: 1fr 1fr; }
```

Only an **ancestor** splits; as the leaf, a columns page is an ordinary page.
Measured: `529 | 529`, and `529 | 264 | 264` three deep. Width halves per nesting
level — inherent to nesting, and the reason a real column UI would need one grid
with N tracks rather than N nested grids.

`.pages` is also full-width now. It used to carry `max-width: 46rem`, so the
whole content area was capped and columns split *that*; the cap moved to
`.page-content` (`max-width` + `margin-inline: auto`), which is the thing that
should be readable-width.

## Two flex traps the columns rework walked into

Both were mine, both were caused by making `.page-content` a flex item, and
neither throws — you only see them by looking.

**1. A flex item with non-visible overflow can be crushed to zero.** The
automatic minimum size (`min-height: auto`) that normally stops a flex item
collapsing **does not apply** when the item is a scroll container. `.code` carries
`overflow: hidden` to clip its border-radius, so once `.page-content` became
`display: flex; flex-direction: column`, every code block on a columns page
measured **0px tall**. `.page-content` is `display: block` again; it never needed
to be flex.

**2. Auto margins on the cross axis disable `stretch`.** `margin-inline: auto`
centres a flex item — and by doing so switches it from `stretch` to
shrink-to-fit, which floors at the item's **min-content** width. A 528px column
therefore held a 593px page and pushed the document 65px past the viewport. The
fix is a definite cross size, which restores the containing block as the
reference:

```css
.page-content { width: 100%; max-width: 46rem; margin-inline: auto; }
```

Also hardened: `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`, never bare
`1fr`. `1fr` means `minmax(auto, 1fr)`, and that auto floor is the item's
min-content — one long `<pre>` and the track refuses to shrink.

A sweep over all 34 urls now reports `overflow=0px` and zero collapsed code
blocks on every page.

## opt-in vs plain, said out loud

The two children of `/layouts/column/` were doing visibly different things and the
page never said so:

```
opt-in    carries layout: "columns" too   →   splits again.  3 columns.
plain     an ordinary page.js             →   REPLACES.      2 columns, the
                                                             right one is a switcher.
```

That contrast is the whole demo, so it's now the first thing the page says.

## `show(child)` / `hide(child)` are gone

Two objections, and they turned out to be the same one:

1. **`Page.show()` shadowed `View.show()`.** `View` has `show()`/`hide()` meaning
   *display:none or not*. `Page` had `show(child)`/`hide(child)` meaning *place a
   child*. Same names, unrelated jobs, one object graph.
2. **`child.activate()` and `parent.show(child)` were one action wearing two
   names.** Every `activate()` was `container().show(this)` and nothing else.

So a page now places **itself**, and what a parent supplies is a *place*:

```js
activate(){
    const parent = this.container();
    parent.$pages.append(this.render().show());
    parent.view?.ac("showing");
}
```

`App` therefore has no `show()`/`hide()` **at all** — it owes a Page exactly one
thing, `$pages`, and is otherwise just the container above the root.

### The layout surface is now three pieces of data

| | | |
|---|---|---|
| `$pages` | the view my children mount into | a **property** — `content()` can point it anywhere |
| `layout` | an inert class string on my `.page` | CSS does the rest |
| `keep` | hide my children instead of detaching them | one word |

Which collapses three of the four layouts to data:

```js
new Page({ })                                            // replace  (default)
new Page({ layout: "columns" })                          // columns
new Page({ layout: "tabs", keep: true,                   // tabs
           content(){ this.$pages = div.c("tab-panel") } })
new Page({ activate(){ this.app.takeover(this) } })      // takeover — the escape hatch
```

`render()` does `this.$pages ??= div.c("pages")`, so a page that says nothing gets
the default slot and a page that assigns `$pages` in `content()` keeps its own.
`??=` is the whole mechanism — no override, no hook, no registration.

**"replace" is now one CSS rule**, not JS: `.page.showing > .page-content
{ display: none }`. `columns` and `tabs` beat it at three classes to two, which
is why neither needs `!important` and neither touches JS.

### What did NOT change

`Router.activate(page)` still diffs the chain and calls `deactivate()` then
`activate()` on the pages that differ. All four layouts were re-verified by
`--tour=layouts` and behave exactly as before — three columns for `opt-in`, two
for `plain`, tab state preserved, takeover hiding and restoring the chrome.

## `Router.show(page)` became `Router.activate(page)`

The router has exactly one field, `active`. The method that sets it is now named
for it, and the pair reads as one idea: `router.activate(page)` → `router.active`.

It also lines up the two tiers without colliding, because they're on different
objects and mean the level they're on:

```js
router.activate(page)   // make THIS the current page: diff the chain, swap the tail
page.activate()         // I am entering the chain: container().show(this)
```

## `find()` became `load_segments()`

`find(url)` walked the segments and was called by `load()` and nothing else — no
page, doc, or test used it. A general-purpose name on a strictly-internal step
invites callers it was never designed for, so it now shares its caller's prefix:
`load()` and `load_segments()`.

Resolving a url *without* navigating is a plausible future feature (prefetch,
link validation). If it's ever actually wanted, that's the moment to give it a
name of its own — not before.

### Scroll, before the scroller moved (superseded)

`nesting/page.js` said *"that's why scroll position … survive[s]"* and
`nesting/deep/page.js` said *"same DOM node, same scroll."* Both were wrong, and
an earlier measurement here (`643 → 220 → 643`) made it look right by accident.

Measured properly, following the round trip a reader actually takes:

```
/nesting/          scrolled to 150
/nesting/deep/  →  150      same container, the number carries over
                   scrolled to 363
/nesting/       →  363      ← NOT 150
```

There is **one** scroll container — `.main`, part of the chrome — shared by every
page, and nothing in `new/starter` or `View` reads or writes `scrollTop` (grep it). The
offset simply persists across a navigation, clamped to whatever content is now in
it. Deep's scroll position therefore follows you back up to Nesting.

The browser gives no help either: `history.scrollRestoration` restores the
**document**, and the document doesn't scroll here — a nested div does.

**No scroll control was added.** Per-page scroll memory would belong in the
layout, next to the `hide()`/`remove()` decision, not in the base classes — but
the current answer is "let the browser do what it wants," and the docs now say
that instead of the opposite.

## The whole model, in one paragraph

A **Page** is a node with a url, some content, and a list of child *names*. The
**Router** turns a url into a page by walking one segment at a time, asking each
page for its child. Every page it walks through stays in the chain. When the url
changes, only the part of the chain that differs is swapped — shared leading
pages are never touched. A page shows its own child, so how a child appears is
the parent's decision, not the framework's.

## Where the words live

| | |
|---|---|
| `page.child(name)` | one segment → a page. the map, then the filesystem, then `route()` |
| `page.add(name, child)` | attach a child — fn, options, or Page. derives its url |
| `page.chain()` | `[root … me]` |
| `page.container()` | who holds me — my parent, or the app |
| `page.$pages` | **the extension point.** the view my children mount into |
| `page.activate()` / `deactivate()` | put myself in `container().$pages`, or take myself out |
| `router.active` | the current page. the router's only state |
| `router.load_segments(url)` | walk the segments — a step of `load()`, not a second way in |
| `router.shared_depth(a, b)` | how many leading pages two paths have in common |

`App` has the same `$pages` as a Page — that's why the root needs no special
case. The App is just the container above the root.

## What the test proves

```
── chrome ──
PASS  sidebar exists
PASS  chrome untouched              (same node after navigating)

── /nesting/deep/ -> /nesting/ ──
PASS  Nesting not rebuilt           [same DOM node]
PASS  nav exact match               [Nesting]

── /nesting/ -> /dynamic/ ──
PASS  root not rebuilt              [shared prefix untouched]

── dynamic /dynamic/42/ ──
PASS  chain                         [new/starter > Dynamic urls > Item 42]
PASS  url set by route()
PASS  memoized                      [same instance on revisit]
```

`/dynamic/42/` has no `page.js` anywhere. `child("42")` misses the filesystem,
falls through to `route("42")`, and the page builds one. Reloading that url cold
gives the same result, because the walk is identical either way.

## `children` — one Map, three ways to fill it

```js
children: "intro api"       // names — nothing imported, loaded when asked for
children: [intro, api]      // already-imported pages, adopted immediately
children: [intro, "api"]    // both

//  →  Map { "intro" => Page, "api" => null }
```

`null` means *declared but not loaded*. `undefined` means *never heard of it*.
Both are falsy, so `child()` needs **one** lookup to handle both — which is what
collapsed the old `children` + `loaded` pair into a single structure.

**Why a Map and not a plain object.** Object keys that look like integers are
hoisted and sorted numerically:

```js
const o = {}; o.intro = 1; o["42"] = 2; o.api = 3; o["7"] = 4;
Object.keys(o)   →  ["7", "42", "intro", "api"]     // 7 and 42 jumped the queue
[...map.keys()]  →  ["intro", "42", "api", "7"]     // insertion order
```

POJOs *are* reliable for ordering — for string keys. But `route()` produces
children named `42`, `7`, and so on, so this design hits the exact case where
they aren't. Don't "simplify" it back to an object.

## Link marking ran one navigation behind, and not at all on boot

Reported as *"reload Home and the Home link isn't lit; click another link and the
wrong one stays lit."* Two independent causes, both about **when** and **where**
`mark_links()` looked:

```
url /            .active [(none)]     ← cold load: $app is still detached
url /nesting/    .active [Home]       ← marked against the PREVIOUS url
url /nesting/deep/  .active [Nesting]
url /nesting/    .active [Deep]
```

1. **It queried `document`.** On boot `$app` is not appended to `<body>` until
   after `router.load()` finishes — that's deliberate, it's what stops a flash of
   empty layout — so a document query found zero links.
2. **It read `location.pathname`.** `go()` pushes history only *after* the load
   succeeds (a failed navigation must leave no history entry), so during marking
   the browser still showed the url being left.

Both fixes are the same principle the layout tier already follows — **ask the
page, not the browser**, and scope to `$app`, not the document:

```js
root(){ return this.app.$app.el; }              // works while detached
mark_links(this.active.url);                    // the page knows where it is
```

Load-before-push is unchanged. `drive.mjs` prints a LINKS line per step, so url
and marking can be read side by side and this can't silently come back.

### Still open, from the same family

Links inside **async** content are never marked. `previews()` resolves a tick
after `mark()` has run, so preview cards pointing at the current url don't get
`.active` (visible on `/layouts/replace/deeper/` — `.active [(none)]`). Options:
re-mark when async content lands, have `preview()` ask the router for its own
state, or accept it. Not chosen yet.

## `previews()` rendered outside the page — async capturing

`previews()` was `async`, and built its container **after** the await:

```js
async previews(){
    const children = await Promise.all(names.map(name => this.child(name)));
    return div.c("page-previews", () => children.forEach(child => child.preview()));
}
```

`View.captor` is one global with a push/pop stack, and `append_fn` restores it
the moment your function *returns* — for an async function that's its first
`await`, not its last line. So the `div` was built with the captor already
unwound to `$app`, and landed in `body > div.app`, a sibling of `.main`. Nothing
threw; the cards were simply somewhere else. Measured before: `parent = app`.
After: `parent = page-content`.

The fix is the general rule, now in CLAUDE.md: **capture the container
synchronously, append into it asynchronously.**

```js
previews(){
    return div.c("page-previews", async $previews => {
        const children = await Promise.all(names.map(name => this.child(name)));
        children.forEach(child => child && $previews.append(child.preview()));
    });
}
```

The `$previews.append(…)` has to be explicit — after an await there is no
ambient captor worth trusting. `drive.mjs` step 2 asserts the parent, so this
can't silently regress.

## One bug this turn

`Router.mark()` used `view.tc("active-page", flag)` — but **`View.tc(cls)` takes
one argument** and ignores the second, so it toggled unconditionally and the
active classes flip-flopped on every navigation. Now it wipes with a query and
re-applies with `ac()`, which also clears pages that left the chain. `mark_links()`
was added alongside it, so sidebar links get `.active` / `.in-path`.

## Compared to what we have now

| | `core/` today | `new/starter` |
|---|---|---|
| loading | import the target, then **climb** ancestors | walk **down** from root |
| finding the layout owner | `host()` walks `.parent` for a marker | no marker — a page shows its own child |
| ancestors | `load_ancestors()` + `parent_url` + `catch { break }` | fall out of the walk |
| navigating | `$app.empty()` — **everything** rebuilt | only the differing tail |
| knowing the routes | `Page.registry`, a global map | nothing. try the url |
| declaring children | `import` each one (25 modules to show one page) | `children: "a docs"` — names |
| dynamic urls | impossible (registry can't hold them) | `route(name)` |
| lines | Page 209 + Router 68 + App 210 | 95 + 92 + 41 |

The measurement that motivated this: `/framework/core/App/` currently loads **25
modules** to show one page, because every ancestor the climb passes through
imports its whole subtree to adopt it. Names instead of imports removes that.

## The four layouts, all working, with no base-class changes

The site now demonstrates each one, and `drive.mjs --tour=layouts` asserts them.
What this turn established is that **`Page` and `App` already had the seams** —
no `mode` flag, no `Pager` class, nothing added to the trio:

| | opt-in, in the page's own file | measured |
|---|---|---|
| **1 replace** | *nothing* — the default | 4 mounted, 1 visible |
| **2 columns** | `show(child){ this.view.ac("columns").append(child.render().ac("column")) }` | 3 columns when every level opts in |
| **3 tabs** | `show(child){ this.$panel.append(child.render().show()) }` + `hide(child){ child.view.hide() }` | 2 panels mounted, input value survives |
| **4 takeover** | `activate(){ this.app.takeover(this) }` | sidebar gone, then restored |

Two seams, and they answer different questions:

- **`show(child)` / `hide(child)`** — how I arrange a child *inside* me.
- **`container()` / `activate()`** — who shows me *at all*.

Layout 4 is the interesting one: it needed no framework support because
`takeover()` lives in `site/app.js`, where the chrome it hides also lives. `Page`
gained no flag and `App` gained no mode.

**A `mode: "columns"` string was considered and not taken.** It reads well in one
file, but it can only mean something if the base class branches on it — and it
still doesn't reach grandchildren, so it buys ceremony without buying the thing
that's actually missing. The override is the same number of lines and needs no
base-class `if`.

### The tab ordering wrinkle

`show()` appends, and appending an already-mounted node **moves** it. So
`.tab-panel`'s DOM order is visit order, not tab order. Invisible here (one panel
shown at a time) but it would matter for any layout that shows several at once —
that one would need `insert` rather than `append`.

## The column problem, in detail

This is the one thing blocking a real ColumnPager. It is not a bug — it's a
limit of the `show(child)` design, and it's worth understanding before choosing
a fix.

### A page is placed by its PARENT, not by itself

```js
activate(){ this.container().show(this); }      // container() = parent ?? app
```

Read that carefully: when page `b` activates, it calls **`a`'s** `show()`, not
its own. So a 3-deep url runs three *different objects'* `show()` methods:

```
url    /docs/a/b/
chain  [root, docs, a, b]

  activating   whose show() runs   which implementation
  ──────────   ─────────────────   ────────────────────
  root         app.show            App
  docs         root.show           Page default
  a            docs.show           ← YOUR OVERRIDE
  b            a.show              Page default        ← the problem
```

It's a **ladder**, and each rung belongs to a different object. Overriding
`docs.show()` changes exactly one rung.

### What that produces

`/docs/page.js` overrides `show()` to keep its own content visible and put the
child beside it:

```js
show(child){ this.view.append(child.render().ac("column")); }
```

Real DOM after `/docs/a/b/`:

```
page                       ← docs
  page-content             ← docs' content, visible          ✓ override worked
  page column              ← a, placed beside docs           ✓ override worked
    page-content ← HIDDEN  ← a hid its OWN content           ✗ a used the default
    page                   ← b, nested INSIDE a              ✗
      page-content

wanted:  docs | a | b
got:     docs | a>b
```

`a` is an ordinary `page.js` that knows nothing about columns, so when `b`
activated, `a` did the default thing: hide my content, put the child in my place.
Two columns instead of three, and the second one is `b` wrapped in a hollowed-out
`a`.

### Why it can't be fixed by overriding harder

For three columns, `a` would need the override too — and `a/page.js` is a plain
file the topic author doesn't own. Making every page in a subtree carry the
layout is exactly what this design set out to avoid.

The mismatch is structural:

- **`show(child)` expresses a parent→child relationship.** One level.
- **A column layout is a subtree arrangement.** One decision, many levels.

A per-instance method cannot express a property of a subtree, because each
instance only ever sees its own child.

### The rule this exposes

> **"Descendants know nothing" and "nothing searches or propagates" cannot both
> be true.**

If `a` and `b` stay plain, *something* has to connect them to `docs`'s layout —
either by copying behaviour down, or by looking up. There is no third option.
One of those two values has to give.

This is why `core/` has `host()`. It wasn't over-engineering; it was paying this
exact bill.

### Four ways to pay it

| | how | cost |
|---|---|---|
| **A. propagate down** | `add()` copies the parent's `show`/`hide` onto the child | black magic — `a/page.js` behaves like a column with nothing in the file saying so |
| **B. search up** | `activate()` asks the nearest ancestor that defines a layout | this *is* `host()`. The old objection was the ancestor **climb**, which top-down loading already deleted |
| **C. subclass** | descendants are `new ColumnPage({…})` | explicit and WYSIWYG, but every file in the subtree opts in, and moving a page means editing it |
| **D. hand the layout the chain** | the topic gets *all* the pages below it, not one child | one new method; no propagation, no climb |

### Sketch of D

```js
// docs/page.js — arranges everything below it
arrange(pages){
    this.$columns.empty();
    pages.forEach(page => this.$columns.append(page.render().ac("column")));
}
```

```js
// Router.activate(page) — one walk; the chain already exists
const owner = chain.find(page => page.arrange);
owner ? owner.arrange(chain.slice(chain.indexOf(owner) + 1))
      : /* default: each parent shows its own child */;
```

Descendants stay plain, nothing is copied onto anything, and `Page` gains no
state — `arrange` is just a method some pages have.

**The honest cost of D:** `arrange()` receives the whole list, so *it* owns the
"don't rebuild what didn't change" logic that `Router.activate()` currently does for
free. A naive `arrange()` re-renders every column on every navigation —
reintroducing the exact problem this design fixed. Each layout would need to
diff against the previous chain itself.

## `new/2` — built, weighed, deleted

A sibling prototype existed to answer item 1 below — how a topic arranges a subtree
of pages that have never heard of it. It answered it. The answer was **not taken**,
so the directory is gone and this is the whole record of it.

### Rejected: option E, "resolve the arranger once per chain"

Its Router resolved, in one walk down the chain, *who places each page*: an arranger
carries forward past any page that doesn't claim its own children, so `docs` places
`a` **and** `b` while both stay ordinary files. Nothing climbs and nothing is copied,
which is what A and B cost. It worked — three equal columns, measured
`299 | 299 | 299` three deep — and it cost three new names on `Page`:

```js
arrange(child){ … }    // WHERE a page below me goes
subtree(){ … }         // HOW FAR that reaches
arranges(){ return this.arrange !== Page.prototype.arrange; }   // did I bring my own?
```

**Verdict: no.** Three concepts to place a div, one of which is prototype
introspection — behaviour that depends on *how* a method got onto an object, which
is exactly the "nothing to remember" test this codebase is built around. `subtree()`
is a scope flag on the base class, and `arranges()` is unwritable by hand: you
cannot look at a page and say what it does without knowing what `Page.prototype`
holds. The column problem stays open rather than being bought at that price.

Two things it never said out loud, and both are why the price is higher than it
looks. Flat columns come from the arranger appending **every** descendant into one
grid, so the DOM stops mirroring the url. And a leaving page had its view removed
outright — giving up the retention that makes revisits free and per-page scroll
survive here (see "Retention is the default").

### Worth keeping: the delegation shortcut provably over-propagates

The cheap version of E is to let the arranger delegate up the parent link, the way
an arrangement can. It does not work, and the counter-example is small enough to be
worth remembering:

```js
arranger(){ return this.parent?.arranger() ?? this.parent; }   // ✗
// plain chain root → x → y
// y.arranger() → x.arranger() → root.arranger() → undefined ?? root  =  root
```

`y`'s arranger must be `x`, and delegation gives `root`. The default has to both
propagate (so columns reaches `b`) and not propagate (so an ordinary page places its
own child), and one irreducible bit tells them apart — which is exactly what
`subtree()` was, and why it could not simply be deleted. Anyone reaching for the
one-line version should reach for this paragraph first.

### Taken: a failed import is not a missing one

`Page.import()` caught everything and returned `null`, so a **syntax error in a page
you just wrote** rendered as a 404. `Page.missing(error)` now tests the message and
anything that isn't a genuine resolve-failure is logged loudly before the same
`null` comes back — the fallback is unchanged, so nothing that worked stops working:

```
Page.import("/broken/page.js") — the file EXISTS but failed to load:
  SyntaxError: Unexpected identifier 'is'
```

Message-sniffing is a heuristic, because it is the only signal a browser gives.
A wrong guess costs one console line and never behaviour.

### Deferred: two fast clicks race, and nothing guards it

There is no in-flight guard. Click a link, click another before the first import
resolves, and the slow one lands second and paints over the fast one. Measured —
fire `/nesting/deep/` and then `/dynamic/` without waiting, and you end up on
`/nesting/deep/`, the link you clicked first and abandoned:

```
address bar   /nesting/deep/
on screen     page page-deep active-page      ← should be /dynamic/
```

A guard was written and backed out for being clunky. What it cost is worth
recording, because whatever replaces it pays the same bill:

- **A boolean can't do it.** "Something is loading" reads identically for the click
  you just made and the one it superseded, so the loser cannot tell it lost. It
  takes an identity — a counter, or a token object.
- **`go()` needs three outcomes, not two.** It currently pushes history on a truthy
  return and calls `location.assign()` on a falsy one. A superseded navigation is
  neither: pushing writes the stale url into the address bar over the winner's page,
  and assigning hard-reloads the url the user already left. So the guard cannot live
  entirely inside `load()` — `go()` has to be able to see the difference, and that
  is what made every version of it clunky.

Not urgent: it needs two clicks inside one import, and the failure is a wrong page
rather than a broken one. Worth solving properly rather than quickly.

## SOLVED: the column problem was a CSS problem — `display: contents`

Everything under "The column problem, in detail" below is still an accurate
description of the *JS* design, and its conclusion — *"'descendants know nothing'
and 'nothing searches or propagates' cannot both be true"* — was **wrong**,
because it assumed the layout had to be expressed in JS at all. It doesn't. All
four options (propagate down, search up, subclass, hand it the chain) were
paying for something CSS gives away:

```css
.page.flat.active-ancestor { display: grid; grid-auto-flow: column;
                             grid-auto-columns: minmax(0, 1fr); }

.page.flat.active-ancestor .pages,
.page.flat.active-ancestor .page.active-ancestor { display: contents; }

.page.flat.active-ancestor > .page-content,
.page.flat.active-ancestor .page.active-ancestor > .page-content { display: block; }
```

`display: contents` removes a box and keeps its children, so dissolving every
wrapper between the grid and a page's content makes the **nested** DOM lay out
as **one** grid. Measured in a 988px main, three deep:

```
nested (classes: "columns")   494 | 246 | 245     each level halves the remainder
flat   (classes: "flat")      329 | 329 | 329     one grid, equal tracks
```

What it costs: **nothing in JS.** No base-class change, no new method, no
`arrange()` / `subtree()` / `arranges()`, no prototype introspection. `a/` and
`a/deep/` under `/modes/flat/` are plain `page.js` files with a title and some
content — the same files that produced `column | plain⇄deep` before.

Three things worth knowing:

- **It composes.** `.page.flat.active-ancestor .page.active-ancestor` is (0,5,0)
  and the grid rule is (0,3,0), so a `flat` page **inside** a `flat` page matches
  the dissolve rule at higher specificity and joins the outer grid instead of
  starting a second one. Toggling `flat` onto the root page while three deep gives
  five equal tracks — measured `198 × 5`, home included.
- **Retention and per-page scroll survive**, unlike rejected option E: nothing is
  detached and every `.page-content` is still its own scroller.
- **A dissolved box cannot be styled.** The column separator moved from
  `.pages { border-left }` (that box is gone) onto `.page-content`. Anything that
  wanted a background, padding or border on an intermediate `.page` has to move
  down to the content, or that level has to stay a box.

`classes: "columns"` is left in place at `/layouts/column/` — the halving is worth
being able to see. `flat` is the one to use.

## Still unresolved

1. **~~Columns~~** — solved above, in CSS. The JS analysis is kept because the
   reasoning about `show(child)` being a one-level relationship is still correct,
   and because "we considered A/B/C/D/E and took none of them" is worth not
   re-litigating.
2. **Ancestors still render.** `render()` runs for every page in the chain even
   though ancestors' content is hidden — so `previews()` fires and loads one
   level of children per ancestor. Cheaper than today, not free. Lazy render for
   hidden pages would close it.
3. **`route()` pages aren't reachable by their own children.** `route("7")`
   returns a page with no `route()` of its own, so `/docs/comments/7/replies/`
   404s. Probably fine; worth deciding.
4. **No `activate()` hook for pages — and it fails silently.** `activate()` *is*
   the mounting, so overriding it replaces it. Writing the obvious thing renders
   a **blank page** and throws in the child a moment later:

   ```js
   activate(){ this.app.hide_chrome(); }                        // ✗ never mounted
   activate(){ … ; return Page.prototype.activate.call(this); } // the escape hatch
   ```

   Measured while building `/modes/bare/`: `cols: []`, then
   `Cannot read properties of undefined (reading 'el')` from the child hitting
   `parent.$pages`. Assign-objects have no `super`, nothing says the call is
   required, and nothing fails loudly when you forget — it's the sharpest edge in
   the design. **A separate `enter()` / `leave()` pair called by `activate()` /
   `deactivate()` costs two lines and deletes the trap.** Takeover only gets away
   with the override because it deliberately mounts somewhere else.
5. **`app.nav()`** — chrome still isn't wired. `App.render()` is deliberately
   three lines; a site that wants a header overrides `render()`.
6. **`children` is both "declared" and "resolved".** `child()` calls `add()` on a
   successful resolve, so a page someone merely *visited* joins `children`
   permanently. Anything that renders `children` therefore grows as you browse —
   `previews()` on a parent starts showing siblings the visitor happened to open.
   A second collection, or a flag on the entry, would separate the two meanings.
   Carried over from the superseded `new/` sketch, which is where it was first
   written down.
7. **Two fast clicks race.** Nothing guards an in-flight navigation, so the slower
   of two clicks lands last and wins. Measured, and the reason a guard is harder
   than it looks, in "Deferred: two fast clicks race" above.
8. **`Router.click()` drops the query string.** It calls `go(link.pathname)`, so
   `/docs/?mode=flat` arrives as `/docs/`. One word to fix (`+ link.search`), but
   it forces a decision first: are two urls differing only by query the same page
   for the chain diff, or not? Nothing needs it yet — `/modes/link/` argues that a
   mode should live on the page rather than in the url — so it stays broken and
   written down. The one thing it must not do is silently half-work.

## Mode is a class, not a structure — and never a link

`/modes/` is the permutation matrix: replace (nothing), columns (`classes:
"columns"`), flat (`classes: "flat"`), bare (`activate(){ this.app.hide_chrome() }`).
The DOM is **identical** in all four; only CSS differs. Three consequences:

- **A mode can be swapped at runtime with no re-render** — the buttons on
  `/modes/` add and remove one class, and nothing navigates or rebuilds.
- **The home page is not a special case.** Toggling `flat` onto the root makes it
  the first of five equal columns. The root's container is `app.$pages` rather
  than a `.page`'s `.pages`, and that is the *only* asymmetry: the root can be an
  arranger but never an arrangee, because nothing is above it.
- **`bare` beats `takeover`.** Takeover *moves* the view to `$app` and removes it
  on the way out, so a takeover page can't have children in the normal way. Bare
  is one class on `.app` and the page never moves — `/modes/bare/deep/` works,
  and the mode survives exactly as long as the page that declared it stays in the
  chain, which falls out of the chain diff rather than being implemented.

**Mode via the clicked link was considered and rejected** (`/modes/link/`). It's
about four lines — read `data-mode` off the anchor, put the class on the
destination — but the url is the only state that survives a reload, a bookmark or
a paste, so the page you send someone is not the page they open. A mode belongs to
the destination page, or to the url if it's genuinely the reader's choice. Never
to the click.
