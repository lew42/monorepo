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

## Laziness — removed (Aug 2026)

Declared children are imported at construction. The constructor calls
`load_all_children()` whenever it has a url; `add()` re-triggers it for a page built
standalone, on adoption, because that is when the url arrives.

The old shape was lazy by default with an opt-in:

```js
initialize(){ this.load_all_children(); }   // dead — the constructor does this now
```

**Why it flipped.** The opt-in's own record already contained the finding: *almost
every index page calls it*, because `previews()` and `tabs()` both want real titles.
A default in disguise costs the honesty and nothing else. The measured price is
small and was already being paid on nearly every url: on `/framework/`, 1 → 28
`page.js` fetches and **+51ms to first paint**, flat with depth.

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
shallowness three files away — the no-black-magic failure. It recurses exactly as
far as each page's own `children` list goes.

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
having to *execute* the pages it lists** — which is exactly what the eager imports
pay for today. At ~160 pages, not yet.
