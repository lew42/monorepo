# toc — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## Decisions

**Declared list, or scan the page?** Scan. `children` is a declared string because a
child costs a network request; a heading is already in the DOM. And the failure modes
are opposite: a drifting `children` entry costs a **menu entry**, quietly and forever,
while a drifting *heading* list points at a section that doesn't exist **on the page
the reader is looking at**. The rule that reconciles them: **declare what costs a
network request, derive what is already in your hand.**

**When does it scan?** `toc()` is called at the top of `content()` so it renders at the
top of the page — and at that moment there are no headings.

| option | why not |
|---|---|
| call `toc()` last | it then renders last, and a nav below the content it indexes is not a nav |
| `toc(() => { …all content… })` | wraps every page's whole body in a callback to buy a scan; the call site pays for the implementation |
| scan in `activated()` | runs after paint — one frame of an empty rail, every navigation |
| `requestAnimationFrame` | same, worse: a whole frame later |
| **place now, fill in a microtask** | ✓ |

**Verdict: place synchronously, fill in a microtask** — the framework's blessed shape
for late content. The container is captured while the captor is correct, and the
filling names its target rather than trusting an ambient captor that is long gone. The
timing is the part worth knowing: a microtask runs when the current task's stack
empties, which is after `render()` returns and after `activate()` appends it, but
**before the browser gets to paint**. There is no frame in which an empty rail is on
screen. (Same argument `ext/highlight` makes for patching `html_unsafe` instead of
sweeping the document afterwards.)

**Rejected: `IntersectionObserver` for the spy.** The textbook answer, and wrong for
this job: between two widely spaced headings **nothing is intersecting**, and the
honest reading of the callbacks is "no section is current" — never what a reader wants.
Every workaround (remember the last one that left, add a tall `rootMargin`, observe
sections instead of headings) reintroduces *"the last heading above the line"* by a
longer route. **Ask the geometry directly:** one `passive` scroll listener and a loop
over an array almost always under twenty items. Exact at every scroll position,
including the top and the bottom, in six lines.

**`current`, not `active`.** `Router.mark_links()` owns `.active` and `.in-path`, and
it **skips `#` hrefs** — a fragment link is a scroll, not a destination — so it would
never clear an `.active` this ext had set. Two owners for one class is how a stale
highlight happens.

**`sticky` in a grid track, not `fixed`.** It shipped as `fixed`, because the obvious
`sticky` did nothing: **the region scrolls, not the page**, so a sticky element inside
a `.page` sticks to a box that never moves. `fixed` worked and reserved no space, so
the rail and the prose were placed by two unrelated numbers and overlapped on the way
to the breakpoint that hid it. The rail is a **real column** now — a grid track with
`position: sticky` and `align-self: start`, because a *stretched* grid item is already
as tall as its track and has nothing to stick within. `fixed` is recorded in `toc.css`
as the bug, not the fix.

## Fixed 2026-09-18 — `:not(.standard)` excluded almost every caller, so the rail never painted anywhere

`ai/2026-09-18/dead-nav/`. Two studies the same day (`overlap-study`, `web/nav/doc/study/mechanisms`)
independently found the same thing: **23 `toc()` call sites in source, 0 visible in production.**
The cause was `toc.css`'s own grid rule, `.pages > .page:not(.standard):has(> .toc)` — written to
avoid a `grid-template-columns` clash with a "breakout" page that owns its own template. The
premise was right; the selector was wrong. `.standard` is the page's DEFAULT class now
(`Page.class.js`: `.ac(this.classes ?? "standard")` — every page gets it unless `classes:` is set
explicitly, and the only pages that ever did (`classes: "full"`/`"fill"`) are legacy aliases
nothing current still uses), so `:not(.standard)` excluded nearly every real page, including
every one that calls `toc()`.

**The options considered:**

| option | why not |
|---|---|
| declare the calls dead, delete `toc()` and its 23 call sites | the "docs three-region" approved layout (`/layouts/doc/studies/approved/`) names this exact shape — "an article long enough to want its own ToC — every blog post has it free" — as one of the site's five locked-in layouts; killing the component contradicts a layout the owner already approved |
| keep `:not(.standard)`, add a second class to opt breakout pages OUT instead | inverts the fix for a case (`.full`/`.fill`) that no current page uses, and re-creates the exact bug the day a future page picks a legacy class name back up |
| **drop the `:not(.standard)` guard entirely, rely on specificity** | ✓ |

**Verdict: show it — drop the guard.** `core/Page/Page.css`'s own `.page:has(> .page-related)` rule
(the related-sidebar, landed the same day) proves the guard was never load-bearing: that rule has
no `:not()` at all and still always wins over the base `.page` rule, because THREE
classes/pseudo-classes — `.pages > .page:has(...)`, specificity (0,3,0) — beats the base rule's
plain `.page`, (0,1,0), on specificity alone, regardless of which `<link>` loaded last. The
`:not(.standard)` guard was solving a load-order problem that specificity already solved for free.

**Verified headless, port 8142, 1920px, after the fix:**

- **8 of the 15 real, direct `toc()` call sites now draw a rail** — `/framework/core/` (2
  headings), `/framework/faq/` (26), `/framework/start/` (5), `/framework/styles/layers/base/`
  (4), `/framework/styles/layers/theme/` (7), `/framework/styles/layers/util/` (9),
  `/framework/styles/` (6), `/framework/versus/` (7) — every one of them a plain `Page`
  (`classes: "standard"`, not wrapped by anything else).
- **The other 7 still don't, and it is not this bug**: `core/App`, `core/Router`, `core/Sidebar`,
  `ext/demo`, `ext/markdown`, `ext/toc` (this page!) and `util/markup` are all `ext/Doc` pages —
  their real, on-screen `.page.active-page` is `Doc`'s own tabbed shell (`class="page doc-page
  page--<Name>"`), and the OVERVIEW tab's content (where `toc()` actually runs) is mounted one
  level deeper, inside that shell, never a direct child of `.pages`. `toc.css`'s
  `.pages > .page:has(> .toc)` selector requires a direct child by design (Traps, above) and
  correctly does not match a grandchild. This is the SAME structural gap this file's own "Open"
  section already named for the narrower `overview:` case — today's count shows it is not a
  one-off: every `Doc`-shaped caller hits it. Left open here on purpose: the fix belongs in
  `ext/Doc`, a different module, outside this task's fence (`ai/2026-09-18/dead-nav/requirements.md`).
- `/framework/styles/layouts/toc-studio/` and `/layouts/practice/reader/` were already visible
  before this fix and still are after — neither goes through this grid rule at all (toc-studio
  inline-styles its own `display: block; position: sticky`; reader wraps the call in its own
  `.std-practice-toc` div, so `:has(> .toc)` never matched either way). Unaffected, not broken.
- **Blog posts (`blog/Post.js`) are unaffected for the same structural reason**: `this.$toc =
  div.c("blog-toc")` wraps the real `toc()` call, so `.toc` is a grandchild of `.page`, not a
  direct child, regardless of `.standard`. Blog's own rail is out of this task's fence.
- **The brief's "fewer than three headings draws none" is not what the code does** — re-read
  `fill()` above: it removes itself only at `!headings.length`, i.e. **zero** headings, never a
  minimum of three. Confirmed empirically: `/framework/core/` has exactly 2 headings indexed and
  drew a rail anyway. Corrected here so nobody re-derives a three-heading floor that was never
  real.

**The related-sidebar overlap, checked and clear.** No real page has both `related:` and `toc()`
yet, so the check was made synthetically, headless, with no source file touched: a
`.page-related` node (the real markup `related_aside()` builds) was injected as the last child of
`/framework/versus/`'s already-passing `.page` via `page.evaluate()`, at 1920. Result: **no
overlap** — `toc`'s rule wins on specificity ((0,3,0) beats `page-related`'s (0,2,0)), so its
2-track template (`main` + `toc`) replaces the 3-track `related` template outright; `.page-related`'s
`grid-column: related` then resolves to nothing and the item falls back to column 1, landing in
the main reading column, stacked after the last content block — the exact "folds under, never
away" behaviour `Page.css` already documents for `.page-related` below ITS OWN 70em breakpoint,
just triggered here by a losing specificity fight instead of a narrow viewport. Nobody hits this
today (no page declares both), so no fix is forced; the next page that wants both a related aside
and a toc rail gets a plain block instead of a dedicated third column above 82em until someone
teaches one of the two grids about the other — `core/Page/Page.css` is outside this task's fence.

## Fixed 2026-09-18 (later the same day) — the `.pages >` prefix, not the shell, was the gap

`ai/2026-09-18/cleanup-2/`. The section above left the 7 `Doc`-based callers broken and
recommended a change inside `ext/Doc`'s own render. Reading `ext/Doc/Doc.js` first (`code`
skill: read before guessing) found something simpler: `toc()` does not render directly
inside `.doc-section` at all — a Doc module's "Overview" tab is built by `catalog()`, which
wraps the module's `content()` (where `toc()` runs) inside its own "intro" child page, a
real `.page.page--intro`. So the element actually carrying `.toc` as a direct child is
ANOTHER real `.page`, just nested several layers inside the Doc shell's own
`.page.doc-page > .tabs > .tab-panel`, never a direct child of `.pages`.

`core/Page/Page.css`'s own `.page:has(> .page-related)` rule — landed the same day as the
`:not(.standard)` fix above — already reaches that exact same nested `.page` with no
`.pages >` prefix at all, and was never shown to need one. **Fix: drop `.pages >` from
`toc.css`'s two selectors** (the grid rule and its `> .toc` seat rule), matching
`.page-related`'s own shape exactly. Specificity: (0,3,0) → (0,2,0) — the numbers cited
above are now one step lower, still comfortably above the base `.page` rule's (0,1,0), so
every claim above about specificity beating the base rule still holds, just at the smaller
number. Two selectors changed; `ext/Doc/Doc.css` was never touched.

**Verified headless, port 8143, 1920px:** all 15 real `toc()` call sites now draw a rail,
not just the 8 from the fix above — the 7 `Doc` pages this section used to name
(`core/App`, `core/Router`, `core/Sidebar`, `ext/demo`, `ext/markdown`, `ext/toc`,
`util/markup`) all draw now too, each with a link count matching its own `content()`'s real
`h2`/`h3` count. The 8 plain pages that already worked still do — the specificity drop from
(0,3,0) to (0,2,0) changes nothing about which rule wins. At 1280 and 400 (below the 82em
breakpoint) `.toc` still correctly stays `display: none` on every page checked — no
regression. The related-sidebar overlap check above was re-run on a `Doc` page
(`/framework/core/App/`, synthetic `.page-related` injected as a sibling of the real,
visible `.toc`): still no overlap, still folds into the main column, same as the plain-page
case.

## The skip list

`fill()` only ever indexes headings that are sections of *this* page — a demo, a file
tree, a gallery card are all excluded by a fixed selector, plus `.toc-skip` as the
opt-out the selector can't guess. It's earned that opt-out twice already, most recently
when a stat tile's own big number read as a section. Long form, with the two-galleries
story and the pre-committed trigger that made the second call one word instead of a
redesign: [`skip-list.md`](./skip-list.md).

## Who calls it

Grepped across all of `public/`: **20 pages** call `toc();` as the first line of
`content()`, every one a page with no `overview:` rail of its own. Same call, same
reason, everywhere — there is no variant usage to distinguish.

| page | url |
|---|---|
| ext/toc *(this page)* | `/framework/ext/toc/` |
| core/App | `/framework/core/App/` |
| core/Sidebar | `/framework/core/Sidebar/` |
| core/Router | `/framework/core/Router/` |
| core | `/framework/core/` |
| ext/demo | `/framework/ext/demo/` |
| ext/markdown | `/framework/ext/markdown/` |
| ext/highlight | `/framework/ext/highlight/` |
| styles | `/framework/styles/` |
| styles/layers/base | `/framework/styles/layers/base/` |
| styles/layers/theme | `/framework/styles/layers/theme/` |
| styles/layers/util | `/framework/styles/layers/util/` |
| styles/elements/code | `/framework/styles/elements/code/` |
| styles/elements/text | `/framework/styles/elements/text/` |
| styles/elements/misc | `/framework/styles/elements/misc/` |
| util/source | `/framework/util/source/` |
| util/markup | `/framework/util/markup/` |
| faq | `/framework/faq/` |
| start | `/framework/start/` |
| versus | `/framework/versus/` |

`.toc-skip` (the opt-out, not `toc()` itself) has two more consumers that never call
`toc()` in their own file: `framework/stats.js` (a stat tile's value) and a prototype
at `framework/ai/2026-08-12/stage/page.js`. No file imports `toc` without calling it —
this module has no dead importers.

## Traps

- **⚠ A hidden page measures every rect at 0,0**, so every heading reads as "above the
  line" and the LAST one wins — which is how the rail first shipped showing the bottom
  section selected on arrival. `offsetParent` is null exactly when an ancestor is
  `display: none`, which is the whole of the case.
- **⚠ The scroll listener has to be on `.pages`, not `window`.** Same cause as the
  sticky bug, third symptom. All three are silent.
- **⚠ `toc.css` is ASCII only, comments included.** A host that serves CSS with no
  charset decodes UTF-8 as Windows-1252; this file once shipped double-encoded
  em-dashes in every heading.
- **⚠ `toc()` silently no-ops inside a `Doc` that also declares `overview:`.** A
  catalog's active child mounts into the section's own `$pages` (`ext/catalog`'s
  `screen()`), not the site's — so its rendered `.page` is never a *direct* child of
  `.pages`, and `.pages > .page:not(.standard):has(> .toc)` — the only rule that turns
  `display: none` back on — never matches. The rail builds, scans and spies, and shows
  nothing; nothing errors. Verified against the only two `overview:`-declaring `Doc`s
  on the site today (`core/Page/page.js`, `ext/Doc/page.js`) — neither imports `toc`,
  so nobody has hit this yet. The first page that wants both needs this line, not a
  repeat of the debugging.

## Open

- **No `h4`.** The scale's `h4` is an uppercase annotation, not a section, and
  including it made the rail read as a list of labels. If a page ever wants three
  levels, the filter is one string.
- **Nothing re-scans.** A page renders once and is cached, so a `content()` that
  appends a heading later (from a promise) is not in the nav. `md.file()` is the
  realistic case. Fixable with a `MutationObserver`, at the price of the thing the
  spy rejected; not worth it until a page wants it.
- **One listener per toc, never removed.** Bounded by pages visited, not by
  navigations. Measured as nothing; written down in case a future `Page` starts
  discarding views.
- ~~**`ext/Doc`'s own tabbed shell nests `toc()`'s output one level too deep.**~~
  **Fixed 2026-09-18** (`ai/2026-09-18/cleanup-2/`) — see the dated section below. Left
  here, struck through rather than deleted, so the "was this ever considered" question
  a later reader has is answered without them going to git log for it.
