# Declaring children — and the CMS question

## Three jobs, and one line used to do all three

A parent needs three separate things, and they are usually discussed as one:

| | question | who knows the answer |
|---|---|---|
| **discovery** | which children exist? | the filesystem |
| **presentation** | what order, what label, what icon? | a human |
| **laziness** | which of them do I load now? | the router, at click time |

`children: "start faq versus core ext styles util dev"` used to answer all three
with one string — discovery *was* the list, presentation was its *order*, laziness
was that they were names and not imports. That is why it kept winning on "easiest
and cleanest": not one decision cheaply made, but three that collapsed into one
token each.

**Two of the three have since been taken off it.**

## Laziness — a depth, not a flag (Aug 2026)

**`depth` is how many levels below me get fetched, and it is the one number that
decides what a url costs.**

```js
depth: 2   // the default — my children AND theirs: walls(), a two-level sidebar
depth: 1   // only my children: a card wall, a rail, one list
depth: 0   // none of them — /blog/ draws its whole front from posts.js
```

Nothing is fetched in the constructor. A module page constructs *itself* at import,
so a constructor that loaded its subtree would pull the whole site down from
whatever url you opened — measured 2026-08-30: **every** page under `/framework/`
cost 261 `page.js` modules and 1.08 MB, whatever the destination, and 67–84% of
them drew nothing. The caller budgets instead:

- `load_all_children(levels)` — idempotent; `loaded` is what is already there, so a
  revisit is free and a deeper ask tops up. It hands each child `levels - 1`.
- `child(name, levels)` — the Router passes **nothing**, which means the child loads
  to its own `depth`. So navigating into a page is what deepens it.
- `leaf: true` spends **none** of a parent's budget. It already means "I present
  myself, not my children" — `walls()` and `framework/page.js`'s `sections()` both
  skip a leaf — so its subtree waits until you open it. That alone is 50 modules on
  `/framework/`.

The result, cold, same screens (2026-08-30 · [the cost](/framework/ai/2026-08-30/eager-load-cost/) ·
[the fix](/framework/ai/2026-08-30/lazy-children/)):

| url | before | after |
|---|---:|---:|
| `/framework/` | 261 · 1080 KB | **57 · 279 KB** |
| `/framework/core/Page/` | 261 · 1080 KB | **95 · 379 KB** |
| `/imagine/` | 92 · 316 KB | **20 · 120 KB** |
| `/blog/` | 6 · 17 KB | **2 · 14 KB** |

**Rejected: a nav stub** — letting a `children:` entry carry `{title, icon,
description}` as data, so a card could be drawn without the module. It works, but
it only reaches what someone hand-writes a stub for: on `/framework/` at most 49 of
the 204 wasted modules, because the rest are drawn live on their own page. The
overhead was never depth 1 — it was **depth 3 and below**, which one number removes
and no amount of authoring would.

**Rejected: a manifest of titles.** Same objection, plus the data is then written
twice and rots. `blog/posts.js` is the exception that proves it: a post is not a
declared child at all.

The old shape was lazy by default with an opt-in, `initialize(){ this.load_all_children(); }`.
That is dead — a page states its reach, and nobody calls the loader by hand.

**What went with it:**

- `lazy: true` as a proposed escape — never built, and now has nothing to escape.
- The redraw machinery. Every consumer used to draw names first and subscribe to
  `loading` to redraw: `previews()` emptied and refilled its cards,
  `/framework/page.js` rebuilt its whole Sidebar and re-ran `mark_links()`. That
  existed because `load_all_children()` fired inside the constructor, *before*
  adoption handed the page its `app`, so the promise had nowhere to be awaited.
  `Router.load()` awaits the entering chain's `loading` now (`allSettled`, for
  `styles_loaded()`'s reason), so `activate()` stays synchronous — which is also
  the only shape `document.startViewTransition()` accepts.

**Two bug classes worth keeping, because they recur anywhere a late redraw
survives:** *recompute the data, don't just re-render* — `Sidebar`'s `pages` is an
array evaluated once at construction, so re-running `render()` faithfully redrew the
stale list, and it looked exactly like the promise never firing. And *anything that
renders links late must re-run `mark_links()`* — `Router.mark()` has already been
and gone.

**Rejected: full recursion.** `load_all_children()` meaning "import every
descendant". An ancestor's one line would override a descendant's deliberate
shallowness three files away — the no-black-magic failure. That is exactly what the
constructor's own call had quietly become, and `depth` is the answer: an ancestor
spends a budget, and `leaf` — the child's own word — refuses it.

## Discovery — a probe, not a registry

`child()` resolves a segment in three steps: memory, then `route()`, then
`Page.load(this.url + name + "/")`. So a folder nobody declared **still works when
routed to**.

The old verdict was the opposite: *"the declaration is the registration — a name
nobody declared is a 404, loudly, on the first click."* That loudness was the
argument for keeping a hand-typed list honest, and it was aimed at the wrong
failure. A 404 for a `page.js` that plainly exists on disk is not a report; it is a
puzzle, and the fix is always the same one line. **A forgotten declaration should
cost the menu entry, not the url.**

Two properties of the probe worth stating:

- **It costs one failed import per genuine 404**, and nothing at all for a url that
  resolves. `Page.load()` distinguishes *missing* from *broken* — a module that
  throws is not a module that isn't there, or a syntax error in a page you just
  wrote becomes a silent 404.
- **`route()` runs for undeclared names only** (`known === undefined`), so a
  catalogue route can never shadow a declared child.

**A browser still cannot list a directory.** `import()` takes a path; there is no
way to ask a static host what is in `/docs/`. The probe guesses one name at a time
because that is the only thing available without a generated file.

### A `.md` file is a page (Aug 2026)

A fourth step, last so a real `page.js` always wins: when nothing claims `x`,
`Page.file()` fetches `<my url>x.md`, and a hit becomes a page — title from the
file's first `# `, body rendered by `md.file` (which the fetch primes, so it is one
request, not two). Report deliverables and design notes stop being raw text in the
browser without anybody declaring anything.

- **The gate is the content-type, not the status.** The SPA fallback answers every
  miss with `index.html` at **200**; a response whose type says `html` is the 404.
- **It costs one fetch on a would-be-404 and nothing else** — the `page.js` probe has
  already missed by then. A name with neither a page nor a `.md` still 404s.
- **The `.md` url stays the file.** `Router` hands any path ending in `.ext` to the
  browser, so `x.md` is the raw file and `x/` is the page — the escape hatch is free.
- **core does not import ext.** The `import()` of `ext/markdown` is dynamic, inside
  the fallback, so the edge exists only on a url that uses it.

**Beside, and no deeper** — the matching rewrite in `md.resolve` turns a link to a
`.md` *beside the page you are on* into its route, and leaves every other `.md` link
alone. That is not caution, it is the same rule: the fallback only ever looks for a
sibling of a page, so a link rewritten by path alone invents urls nothing serves —
measured Aug 2026, 153 links across the site, 134 of them `ext/Doc` member files
(`doc/method/append.md`) whose page is `api/append/`.

## Urls with no folder at all

For anything catalogue-shaped, `route()` claims segments the parent could not list
in advance:

```js
route(name){
    const entry = catalogue[name];
    return entry && { title: entry.title, content(){ … } };
}
```

`styles/sections/` does exactly this: nine urls, one object, no directories. When
your children come from data rather than from decisions, this is the answer and
`children` is the wrong tool.

## Presentation — what `children` is still for

Which children, and **in what order**. A filesystem cannot answer the second one:
`api` before `guide` before `intro` is alphabetical, and alphabetical is not a
curriculum.

### Option — `/directory.json`, the whole tree in one file

A generated manifest, one fetch, every url on the site.

**What it buys:** discovery stops being hand-maintained; a sitemap, a search index
and a build-time link check all fall out of the same file. For a CMS it is not
optional — a CMS *has* a content index, and pretending otherwise means writing one
twice.

**What it does not buy:** order, labels or icons. So the manifest grows entries —
and an entry with a label and an order in it **is this declaration, moved further
from the page it describes.**

**And it can be stale in a way nothing detects:** the file exists, the manifest
doesn't mention it, the page silently isn't there. (The probe now covers exactly
that case, which weakens the objection but doesn't remove it — a manifest is also
what a *build* would check.)

### Option — `./page.json` beside each `page.js`

The strongest of the three, for one specific reason: **metadata you can read
without executing code.**

```
about/
  page.json   { "title": "About", "icon": "info", "children": ["team", "jobs"] }
  page.js     content(){ … }
```

A nav becomes a fetch of a small JSON file, not an import of a module —
prefetchable, cacheable, inspectable, and generatable by a CMS that has no business
writing JS. **The cost is two files per page**, and a rule about which one owns
`title` when both say it. That is real: this framework's whole thesis is that a page
is one file you read top to bottom.

### The verdict, and it is not one of the three

**Discovery generated; presentation declared; the generated half a *default*, not a
source of truth.**

```
/directory.json     generated — every page.js on disk, in filesystem order
children: "…"       optional — overrides order, and narrows the set
label:, icon:       on the child itself — never on the parent's list
```

A page that says nothing gets its real children in filesystem order — right for a
blog, a docs folder, a CMS collection. A page that cares says so, and its
declaration wins. It does **not** need a build step: `Server/` already runs
`chokidar`, and production is a static copy of whatever the dev server last wrote
("nothing may depend on server-side logic **at runtime**" — a JSON file on disk
does not). Fetch it once at boot, in parallel with the root page.

**The point of building it is not to stop typing `children`. It is to stop a nav
having to *execute* the pages it lists** — which is still what a nav pays for,
`depth` having only bounded it to the levels actually drawn. At ~160 pages, not yet.
