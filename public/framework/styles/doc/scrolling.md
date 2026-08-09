# Scrolling and the one painted box

Split out of `readme.md`.

## 14. Does the document scroll, or does the page?

**The bug that forced the question.** `framework.css` had `html { height: 100% }`,
`body { min-height: 100% }`, `.app { height: 100% }` — and the third rule did
nothing at all. A percentage height resolves against the parent's **height**, and
`min-height` doesn't give body one, so `100%` was indefinite and computed to
`auto`. Measured on `/framework/`: `.app` was **591px inside a 900px viewport**,
with the shell's background stopping 309px above the fold.

That is not a typo, it is a fork in the design, and the site had been sitting on
the wrong side of it for as long as `Page.css` has existed:

| | document scroll | app shell |
|---|---|---|
| scroller | `<html>` | each `.page` |
| sidebar stays put | `position: sticky` | for free |
| scroll reset on navigate | must be written | free (a fresh box) |
| mobile URL bar collapses | yes | no |
| find-in-page over a long doc | natural | per pane |

**What made it lopsided:** `Page.css` was already written for the app shell and
had been for months. `.page { min-height: 0; overflow-y: auto }` with the comment
*"every page scrolls itself"*, `.pages { flex: 1 1 auto; min-height: 0 }` — the
`min-height: 0` in both exists for exactly one purpose, letting a flex child
scroll. None of it did anything. Measured: `overflow-y: auto` on a `.page` whose
`scrollHeight` equalled its `clientHeight` on every route.

**Verdict: app shell.** One rule changed — `body { min-height: 100% }` →
`height: 100%` — and a tier of existing machinery started working. The cheaper
option (delete the dead rules, `min-height: 100vh`, sticky sidebar) would have
been deleting the design to match the accident.

**The cost, and it is real:** the `100%` chain is only as good as its weakest
link, and there is no warning when one is missing. `.default` proved it twice —
a region's index content is page-shaped but is not a `.page`, so it missed first
`overflow-y` and then `min-height`, and inside a topic (which clips) that is not
a missing scrollbar but **445px of the home page unreachable**.

### 14a. Then the region took the scrolling, not the page

`.page { overflow-y: auto }` was right about *something* scrolling and wrong about
*what*. A `.page` is also `max-width: 60em; margin-inline: auto`, so its scrollbar
rendered at the **sheet's** right edge — 85px inside the window, floating in the
grey. A scrollbar belongs to a viewport and a sheet is not one. Worse, a page
inside a tab panel got a scroller nested in its ancestor's: `/framework/ext/markdown/`
had two, the inner one at x=586 in the middle of the content, and you had to
exhaust it before the outer moved.

Moving `overflow-y` up to `.pages` fixes both and needs **no `.page-inner`** — the
page keeps its measure and is simply a block in a scrolling column.

Two things that came with it, both non-obvious:

- **`align-items: flex-start` is required, and `stretch` is a trap.** In a
  single-line flex container with a *definite* cross size — which the app shell
  guarantees — the line's cross size is the CONTAINER's, not the content's. So
  every page was pinned to the region height and its content spilled out of the
  bottom, painting past the end of its own background. Measured: `height: 900px`
  with `scrollHeight: 4241`. `flex-start` lets it size to content; `min-height: 100%`
  is what still makes a short page fill. Two declarations because they are two
  cases. A topic wants the opposite and says `align-self: stretch`.
- **One shared position, so navigation must reset it.** `Router.activate()` now
  does `page.view.el.closest(".pages")?.scrollTo(0, 0)`. This looks unnecessary
  until it isn't: the browser clamps `scrollTop` to the new content height, so
  navigating to a *short* page self-corrects and reads as working. Measured
  leaking 1500px only between two pages that both exceed the region.

### 14b. `overflow-y: scroll`, and which regions opt out

`scroll` rather than `auto` so the gutter is always reserved and navigation stops
shifting content sideways. But the gutter is wrong on any region you are *not*
reading — dead space, and it pushes the real scrollbar back off the window edge,
undoing the whole point. So `/styles.css` hides the others:

```css
.pages:not(:has(> .page.active-page)):not(:has(> .default)),
.pages:has(> .page.topic.active-page) { overflow-y: hidden; }
```

The obvious form — `:has(> .page.topic.active-ancestor:has(.page.active-page))` —
is **invalid: `:has()` cannot be nested**, and it drops silently. The un-nested
version is wrong for a subtler reason: **the root page is a topic and is an
active-ancestor on every route in the site**, so it matched `app.$pages` always,
including `/notes/`, where a long page would then clip with no scrollbar.

> The same latent bug is still live in `hides-nav`: `.app:has(.page.hides-nav.active-ancestor)`
> matches on every route for exactly that reason, so the global nav is hidden
> site-wide rather than only inside topics. Not fixed here — it is currently
> indistinguishable from intent.

---

## 15. One background, on `.app`, and nothing paints over it

> **SUPERSEDED — the sheet is the region default; see core/Page/readme.md.** The
> narrative below is told in the present tense and describes a `papers` opt-in that
> no longer exists: `.pages` now hands every page `--measure` and `--page-pad`
> itself, so the word nobody should have had to type became the default nobody
> types. The background verdict — a page is a hole onto the shell — survived
> unchanged, and is why this section is kept rather than deleted.

`.app { background: var(--wash) }` was correct-looking and invisible: `/styles.css`
also said `.page { background: var(--surface) }`, which painted every page white
edge to edge — including full-bleed topics — so the grey had never once been seen.

Deleting the blanket `.page` background exposes the other half: only pages inside
a `.pages.papers` region get padding and a measure, and `app.$pages` was a bare
`.pages`. `/notes/`, `/alex/` and every other top-level section had **zero
padding**, flush against the viewport edge, and had simply been white-on-white the
whole time. One word in `app.js` — `div.c("pages papers")` — gives the app's own
region the measure, and `.page.topic` opts out.

**`papers` then lost its background too**, which is the part worth writing down.
The rule said `background: white`, then `var(--surface)`, and both contradicted
the header four lines above them in `Page.css`: *structure only, the site decides
backgrounds*. What `papers` actually provides is a MEASURE — a column width,
centred, with room to breathe — and a measure is structure. The sheet is one line
in `/styles.css` for a site that wants one.

This site doesn't. With `.page` and `.pages` transparent, a page is a hole onto
the shell, and that is what lets a **content block** be the white thing: a code
box, a preview card, a demo. While `.page` painted `--surface`, white was the
floor and nothing standing on it could read as raised — a white card on a white
sheet is a border and a prayer.

The grey stays on `.app` rather than `.pages` so there is exactly one painted box
in the whole stack. Worth knowing that `.theme-lew42` paints
`background: var(--surface)` on that same element, so this wins by `@layer site`
and not by specificity — the two must keep targeting the same element for the
layer order to decide it, which is the trap §7 of the theme's own record warns
about.

---

