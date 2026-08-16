# toc — design record

This page's own headings, as a nav, with the current one marked. Nothing is declared
and nothing is registered: adding a section adds it to the rail.

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

## The skip list

`fill()` only ever indexes headings that are sections of *this* page — a demo, a file
tree, a gallery card are all excluded by a fixed selector, plus `.toc-skip` as the
opt-out the selector can't guess. It's earned that opt-out twice already, most recently
when a stat tile's own big number read as a section. Long form, with the two-galleries
story and the pre-committed trigger that made the second call one word instead of a
redesign: [`doc/skip-list.md`](./doc/skip-list.md).

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
  on the site today (`core/Page/page.js`, `ext/doc/page.js`) — neither imports `toc`,
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
- **The `overview:` + `toc()` pairing (see Traps) has no guard.** Whether the fix
  belongs in `Doc.overview_section()` — skip `toc()`'s effect structurally, or warn —
  or stays a documented rule for the call site, is undecided. Recorded as a
  recommendation in the audit, not applied here: `ext/doc` is a different module.
