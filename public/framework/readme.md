# Framework — design record

Per-class records live next to their code (`core/Page/readme.md`,
`ext/*/readme.md`, `styles/theme/*/readme.md`). Pager-era records are in
`core/legacy/`. This
file is the cross-cutting one: open questions, alternatives considered, and the
reasoning behind calls that touch more than one class.

Format: **the question → the options → the weighing → a verdict.** A verdict of
*keep* is as valuable as a change — it stops the same idea being re-litigated.

---

## 1. `p()` backticks vs `md()`

**Today.** `p("...`code`...")` runs `backtick_append` — a hand-rolled quarter of
markdown that only does `<code>`. Bold, links and tables silently render as
literal text, which has bitten these docs repeatedly.

Now that `md()` ships in `/app.js`, could `p()` just parse inline markdown?

**No — and it's worth writing down why.** The factories are created once by
`View.elements()` and exported as `const` bindings from `View.js`. An ext can
patch `View.prototype`, but it cannot reassign another module's `const p`.
`md.js` could export its own `p`, but `app.js` does `export * from App.js` and a
second `p` export would be an ambiguity error.

**Verdict: leave `p()` alone; docs use `md()`.** Changing `p()` would also
silently re-render every existing page in the repo (`michael/`, `alex/`, …).
Recorded so it isn't rediscovered a third time.

---

## 2. Factories always capture — and how to opt out

Creating a view appends it to the current captor. That's the framework's best
idea and its sharpest edge: you cannot build a view *for later* inside a capture
without opting out.

```js
new View({ capture: false })      // what md.file does
```

**Alternative: a `detached()` helper**, which works because `prerender` already
guards on `View.captor` being truthy:

```js
export function detached(fn){
    View.set_captor(null);
    const result = fn();
    View.restore_captor();
    return result;
}

const row = detached(() => tr(() => { td("a"); td("b"); }));   // build, place later
```

Five lines, no new concept, and `capture: false` becomes the single-view special
case of it. **Verdict: add it when something needs it.** Nothing does today —
`md.file` is the only detached construction in the codebase — but this is the
answer when the second one appears.

---

## 3. `window.app`

`Router` and `Pager` both reach `window.app`. Three ways to give them an app:

- `window.app` — honest for a real singleton, zero plumbing, no import cycle
  (`app.js` imports `Router`, so `Router` can't import `app.js`), and it's what
  you type in the console.
- `App.current` — a namespaced static, set in the constructor. Tidier, and a
  test can set it. But it is the *same assumption*: one ambient App per
  document. It relocates the global, it doesn't remove it.
- **Inject it** — `new Router(this.router, { app: this })`, read `this.app`.

**Verdict (superseded — this entry previously said "do both, read
`App.current`"): inject the app.** Both globals encode "there is exactly one App
per document," which forbids two apps on a page, an app in an iframe or test
harness, and any instance that isn't the global one. That's a real constraint to
accept in the substrate in exchange for saving one constructor argument.

`window.app` stays — as a **console convenience only**. Nothing under
`framework/` may read it. See the OOP conventions in `CLAUDE.md`: because every
constructor is `Object.assign(this, ...args)`, injection costs one extra object
literal at the call site and needs no constructor change at all.

**Done.** `Router` takes `{ app: this }` from `config_router`; `Pager.leaf()` and
`ColumnPager.close()` read `this.app`. Nothing under `framework/` reads the
global now.

The `Pager` half looked like the hard one — it's a `View` constructed by
`Page.render()`, and `Page` held no app either. The resolution was to notice that
**`Page` can't take `app` in its constructor at all**: pages are built in
userland at module scope (`export default new Page(…)`), so there is no call site
to inject at. `App.load_page` assigns it at *render* time instead — the same
adoption move that already wires `child.parent`. `Page` never uses `app` itself;
it is purely a conduit to the layout tier, which is worth knowing before someone
"cleans up" the forwarding.

Two things this does **not** buy, recorded so they aren't claimed later:

- **Two Apps in one document.** The ES module registry is per-realm, so both
  Apps import the *same* `page.js` module and get the *same* `Page` instance,
  which can only hold one `app`. `Page.registry`, `View.captor` and
  `View.stylesheets` are statics and would clobber each other besides. The real
  isolation boundary for two apps is an **iframe** — separate realm, separate
  registry, separate statics — and there `window.app` is per-frame and correct.
- **Removing the global.** `window.app` stays, as a console convenience.

---

## 4. Odds and ends

- **`Font` is its own file now** — `core/App/Font.js`, next to the only class
  that constructs one. Not moved to `util/`, because `util/page.js`'s own pitch
  is *"plain functions, no classes, no state"* and `Font` is a class with a
  registry. The CDN point stands and is unresolved: the two registered faces are
  `fonts.gstatic.com` urls, the one place in the framework that breaks the
  "vendor the dependency" rule `ext/` is held to. Vendoring costs ~166KB in the
  repo for a look most sites won't load.
- **Three aliases for one function.** `View.stylesheet` (static),
  `App.stylesheet` (static), `app.stylesheet` (instance). Same for
  `View.meta_path` / `App.meta_path`. It is tempting to call the extras noise —
  **don't delete them.** `arya/lib/Page.js` calls `app.stylesheet()`, the
  instance one. See below.

- **The framework has external consumers now.** Removing a public static is a
  breaking change, and `grep public/` before a merge does not see the branches
  about to land. `App.path_to_page_url` was moved to `Page.module_url` while it
  had one caller; the merge then brought in `arya/lib/Router.js`, which calls it
  on every page load, plus two doc pages describing it in prose. It's back as a
  one-line alias — one implementation, two names, and the second name is load-
  bearing. The rule this buys: **rename freely inside `framework/`, alias on the
  way out.** A dev's `lib/` is a downstream package that happens to share a repo.
- **`instantiate()` is an unawaited async call in the constructor.** `new App()`
  returning before load is what makes `window.app = new App()` read well, and
  `app.ready` covers the wait — but a throw anywhere outside `load_page`'s own
  try/catch becomes a silent unhandled rejection. One `.catch(e => this.error(e))`
  in the constructor fixes it.
- **`.page` is styled by the site, emitted by core.** `Page` renders
  `div.page`; the only rule for it lives in `/styles.css`. Someone using the
  framework without this site's stylesheet gets an unstyled page. A minimal
  `.page` default in `framework.css` would fix it — the risk is that this
  site's rule and the framework's then both exist and drift.
- **~~`mark_links` belongs on `App`, not `Router`.~~ It drifted anyway.** This
  bullet said "settled; recorded so it doesn't drift to the Router later," and
  the rewrite put it on `Router` (`Router.js`, called from `mark()`). Left
  visible rather than quietly corrected, because the failure is the interesting
  part: **writing a decision down did not keep it.** A note in a design record is
  not a constraint — only a test or a structural impossibility is. The current
  location is defensible (marking is part of activating a url, which is the
  Router's job); what isn't defensible is a record that spent months asserting
  the opposite of the code.
- **`instanceof` across `core/` and `core/legacy/` is a trap.** Both directories
  ship — `public/` *is* the deploy artifact, and a static host serves by path,
  not by what is linked. A typo'd `../legacy/Page/Page.class.js` resolves
  successfully, to a real file, and yields a *different class* with the same
  name. Nothing throws. Nothing today does an `instanceof Page` across that line;
  `Page.add()` does one internally, which is the one to watch.

---

## 5. Can a theme carry behaviour?

Asked directly: `theme-lew42` is a CSS class today, but it *used to be a class
extending `App`*, and themes might want to ship plugins or behaviour. Settled by
a three-persona council; all three landed in the same place, by different routes.

**Verdict: the theme is CSS. Behaviour is a plain exported function the SITE
calls. Never a class, and never triggered by the class appearing.**

```js
// styles/theme/lew42/lew42.js
export function lew42(app){ app.font("Montserrat"); app.font("Material Icons"); }

// app.js
new App({ config(){ lew42(this); } });
```

The weighing, shortest first:

- **Inheritance imposes an order and a single lineage** on things that have
  neither. `Theme extends App` makes every theme also a complete App variant —
  N themes × M App configurations — and "lew42's fonts with a different Router
  option" has no answer inside a class hierarchy except a deeper chain.
- **The decisive one, which is smaller and harder to argue with: a theme is
  designed to appear more than once on a page.** `theme/guide/page.js` renders
  `.theme-paper` and `.theme-terminal` side by side *to prove that*, and
  `lew42/page.js` renders light and dark together. Behaviour does not survive
  duplication. Two boxes would run it twice; `app.font()` is safe only because
  `Font.load` memoizes by name, for an unrelated reason. A theme that attached a
  listener or started a timer would fire twice and **break its own demo page.**
- A CSS class is a *value the cascade resolves*, any number of times, at any
  depth. That is the property that makes themes composable, and behaviour is
  exactly the thing that doesn't have it.

**If a function isn't enough**, the escalation is `ext/` — the tier that already
exists for "opt-in, may patch core" — or `app.navigated?.()`, which `Router`
already calls on every navigation, duck-typed, for free. **Not** a `Theme`
registry with lifecycle hooks: there is one theme with one behaviour, and an
unused hook is permanent API surface.

---

## 6. Two lessons from running the council itself

Worth recording because both are cheap to repeat and both changed the output.

- **Trace less, execute more.** Two personas reached *opposite* conclusions about
  four lines of string-slicing in `util/source/source.js` — one said `source()`
  drops a method's signature, the other said "I traced it, it works." Running it
  took thirty seconds and settled it (the first was right; the second had
  reasoned carefully to a wrong answer). Any claim about what code *does* is
  cheaper to test than to argue.
- **The best answer was nobody's.** `classdoc` needed Steve's `dedent(String(fn))`
  (keep the signature), Tim's `getOwnPropertyDescriptor` (never invoke a getter),
  and Eric's one-call shape. Each seat found one, none found all three. That is
  the argument for a council over a single deeper pass — not that any member is
  smarter, but that they *look in different places*.

---

## 7. The documentation system — what a doc page is made of now

Cross-cutting, because it changed how every page under `/framework/` is written
rather than any one class. The brief was *"simpler, clearer, easier, on-demand —
start super simple, but have links to more advanced examples."*

**The four pieces, and what each replaced:**

| piece | replaced |
|---|---|
| [`ext/files`](ext/files/) — a tree of real files, fetched | a wall of `code.html()` string literals showing `index.html` in full |
| [`ext/toc`](ext/toc/) — a page's own headings, scroll-spied | scrolling to find a section |
| `demo()`'s third pane — the real DOM, read back | "and this renders…", unverifiable |
| `.tabs.vertical` + `classdoc.page()` — a members nav beside a panel | a grid of preview cards you had to leave the page to use |

**The organising principle: a doc page should answer *"where do I click to see X"*
in one glance.** Screen space is finite, so the three navs it can carry are
deliberately different questions — the site sidebar is *which module*, the vertical
tab bar is *which member of this module*, the toc rail is *which section of this
page*. None of them duplicates another, and a page opts into the two inner ones by
one call each.

### Why the members nav is `tabs()` and not a new class

`.tabs.vertical` is **CSS only** — no new JS, no new API. A bar of links beside its
panel is a bar of links above its panel with the axis swapped, so the urls, the
default tab, the `.active` marking and the labels are all `Page.tabs()`'s. Getting
this for a stylesheet is the strongest evidence so far that the arrangement contract
(`.active-page` / `.active-ancestor` and nothing else) was the right shape.

It did surface one real bug in `tabs()`: the **default tab's href is the page's own
url**, which is a prefix of every sibling's, so `mark_links()` gave it `.in-path` on
every tab in the set — every bar on the site read as having two things selected.
Fixed with a `tab-default` class written where `owns_url` is known, and a
`:not(.tab-default)` in the CSS. Live and unnoticed for as long as tabs have existed,
which is what a flat bar with one member does to your eye.

### `classdoc.page()` — one call for a class page

```js
export default classdoc.page({
    meta: import.meta, title: "View", Class: View,
    methods: "append ac on style stylesheet",
    content(){ … },        // the overview — becomes the first tab
});
```

`ext/classdoc/readme.md` §5 previously decided *"neither tabs nor previews —
`classdoc()` returns the page and the author picks"*, on the grounds that `tabs()`
has no overflow handling and `View` has ~35 candidate methods. **That objection was
about a horizontal bar.** A vertical one handles twenty names fine, so the verdict
changed for the layout and not for the reasoning; the low-level
`classdoc(page, Class, meta, names)` is still there for a page that wants to compose
it differently.

The overview being **a child page** rather than a special case is what makes it cost
nothing: `tabs()` already renders its first child as the panel's `.default` and
points its link at the parent url.

### Trap found: a fixed rail cannot be sticky here

`ext/toc` uses `position: fixed`, and the obvious `sticky` does nothing —
**the region scrolls, not the page**, so a sticky element inside a `.page` sticks to
a box that never moves. Same fact bit the scroll-spy listener (it has to be on
`.pages`, not `window`) and the initial "current" marking, which read the *last*
heading because a `display: none` page measures every rect at 0. Three separate
symptoms, one cause, and all three are silent.

## 8. Known and NOT fixed: ~40 orphaned pages in the sandboxes

Found by crawling every in-app link from `/` rather than by checking a list — which
is the only way this class of bug shows up, and the same method that caught
`/notes/git-branch-names.page.js` last time.

**`alex/`, `arya/`, `castin/` and `edric/` declare no `children` on their index
pages.** Since declaring *is* the registration, every subpage under them 404s while
still being linked from the page above it. Measured: **13 broken routes** reachable in
one crawl, across 48 `page.js` files that no parent names.

`michael/` is the exception and shows what the fix looks like — `children: [pageDoc,
elements, layout, …]`, an eager array, so its 29 pages all resolve. One of them,
`michael/branding/page.js`, still calls `app.nav()`, which no longer exists, so it
renders a load error rather than a page; that one is a stale call, not a routing
problem.

> Corrected: an earlier version of this section said *none* of the four sandboxes
> declared children, michael included. That came from a `grep` whose output was
> truncated by a `head` — the claim was wrong in the direction of alarming, which is
> the direction a design record must not be wrong in. Re-measured per directory.

**Deliberately not fixed here.** These are other people's sandboxes, the fix is a
judgement call per directory (some of that content is dead and should be deleted, not
declared), and restoring reachability would turn some 404s into visible load errors.
It is a conversation, not a silent edit.

**The reusable part is the method, and there are two halves to it.** Both are
scratch scripts rather than repo scripts — a work-in-progress check doesn't earn an
npm script — but the ideas are what matter:

- **Crawl the links.** Follow every in-app anchor from `/` and assert
  `.active-page === 1` per route. This finds every unreachable-but-linked page in one
  pass, and no amount of reading finds any of them. Retry each route once: a shared
  browser page under load produces `networkidle` races that look exactly like real
  failures, and five false alarms in one run is enough to make you stop trusting the
  green.
- **Audit the tree.** Walk `page.js` files on disk and check each one is named in its
  parent's `children`. This is the *inverse* question — the crawl finds pages nothing
  links to, the audit finds pages nothing declares — and it needs no browser.

Run against `/framework/` today: **every page is declared by its parent**, and the
only "undeclared" directory is `start/example/`, which is deliberate (it is a fetched
doc fixture, not a route — see `ext/files/readme.md` §1).

## Fixed since the last pass

- **Four sections of this file described finished work as open questions.** §1
  proposed "optimistic interception" that `Router.go()` already does; §6 proposed
  renaming a `host()` that no longer exists; §2 and §3 narrated `ColumnPager` as
  the live layout tier. Deleted, except §2/§3, whose reasoning moved to
  `core/legacy/Pager/readme.md`. **This is the failure mode to watch in a design
  record**: a stale TODO is worse than a stale fact, because it actively recruits
  someone to redo finished work.
- **The App rewrite silently dropped four public APIs** and took most of the site
  down with them. `app.stylesheet()` is called at module scope by `alex/`,
  `arya/` and `castin/` — all three 404'd. `App.path_to_page_url` had two sandbox
  Routers calling it. `app.font()` had none left, because its docs were the only
  consumer. `app.loaded` went getter → method, which is correct, and broke
  `edric/`. The rule in §4 ("rename freely inside `framework/`, alias on the way
  out") was already written down and was not followed — see §5's note on what a
  written-down decision is worth.
- **`/notes/git-branch-names.page.js` was unreachable.** The `.page.js` sibling
  convention went away with the Router rewrite; every node is a directory now.
  The file sat there, linked from the home page, resolving to nothing.
- **A POJO default export whose key collides with a `Page` method shadows it.**
  `castin/page.js` exported `{ render(){ … } }` in capture style, returning
  nothing; `Page.add()` assigns it onto a real Page, so `activate()` called it
  and read `.el` of `undefined`. `content()` is the seam that shape wants.
- **A 404'd stylesheet froze the app forever.** `View.stylesheet`'s promise only
  resolved on `load`; a `<link>` that 404s fires `error`. `App.load()` awaits
  every stylesheet before `inject()`, so one typo'd url meant a permanently
  blank page. Now resolves (not rejects) on error, with a console warning — a
  missing stylesheet degrades to "unstyled", not "gone".
- **`target="_blank"` and `download` links were hijacked** by the Router and
  navigated in-place.
- **In-page `#hash` links re-rendered the page** instead of scrolling.
- **`styles.css` was unlayered**, so it beat every `@layer theme` rule in the
  framework regardless of specificity — a four-class-deep component rule lost to
  a one-class site rule. Now wrapped in `@layer theme`. Worth knowing generally:
  unlayered CSS outranks *all* layers, so "just add a layer" is not cosmetic.
