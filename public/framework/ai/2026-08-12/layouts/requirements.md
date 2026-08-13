# Task: the Layout tab — a library of responsive page layouts, mobile → mega

Session: 2026-08-12 (second session, orchestrated). You create new pages and may
edit `ext/classdoc` / `ext/tabs` as needed for the new tab. Do NOT edit
`ext/demo/stage.js`, `responsive.js`, `demo.css`, `exhibit.js` — sibling agents
own those this session; consume their current public APIs (`demo.stage(fn, steer)`,
`demo.responsive(fn, opts)`, `demo.exhibit({stage, def, file, note})`). Do not
edit `framework/ai/2026-08-12/page.js`.

## Before writing any code

1. Load the `code-architecture` skill (Skill tool).
2. Read: `core/Page/page.js` (a classdoc page — note the top-tab strip),
   `ext/classdoc/readme.md` + `classdoc.js`, `styles/layouts/page.js` +
   `detail.js` (the model for a unified rail + detail section),
   `styles/sections/page.js`, `ext/demo/responsive.js` (the two-up),
   `ext/Layout/readme.md` (the control surface / right drawer),
   `ext/catalog/` (previews as a persistent rail).

## The goal

Everything from mobile (390) to mega (3440) is *dynamic*: sidebars, headers,
footers, scrolling sections, sticky headings, nav, toolbars. Mike wants a
browsable library of whole-page layouts where you SEE both extremes at once.

## Part 1 — a "Layout" top tab on the Page class page

`/framework/core/Page/` is a classdoc page with tabs Overview | API | Docs.
Add a **Layout** tab (assumption made under granted autonomy: "a new Page
top-tab section for Layout" = a tab on the Page classdoc, sibling of Overview).
Extend `classdoc`/`tabs` minimally — if classdoc's config can't express an extra
tab today, the smallest visible extension wins (an extra `tabs:`-style key, not
a parallel mechanism).

- The tab's index: a preview rail where **each card shows the layout twice,
  side by side — mobile and mega** — both live renders zoomed to fit (the
  `zoom-25`-style trick; two fixed-width panes zoomed down, like
  `responsive.js`'s `fit()` math). One card, two panes, one link.
- The detail page: `demo.exhibit()` with the **two-up** as its stage
  (`demo.responsive(fn)` in place of `demo.stage(fn)`), so the reader slides
  between mobile and mega. Layout bar + open source below, as always. Extend
  `styles/layouts/detail.js`'s config-factory shape — a `detail`-like factory
  with a two-up stage — do NOT invent a new detail mechanism.

## Part 2 — the library itself

A dozen-ish full page layouts, simplest first. Suggested set (edit freely):
app shell (holy grail revisited), docs site (sidebar + toc), marketing landing,
dashboard, blog article, settings page, chat, media gallery, email client.
Build them out of the existing twelve layout words + page shape words
(`standard pad full fill flex grid …`) — a layout here is still a class-string
lesson, zero or near-zero new CSS.

**Reusable content, not lorem-per-page:** build one reusable "web page" content
structure — a `web()` helper (a function returning header/nav/hero/sections/
footer filler, parameterizable) defined ONCE in the tab's directory — and render
it under every layout. The point Mike named: one page structure renderable in
100 different layouts/nav styles. Layouts take content as an argument.

**Checkboxes, not variants:** where a layout feature is modular (top header
on/off, footer, left rail, right rail, sticky headings, toolbar), it's a toggle
on the detail page, not a with/without sibling page. Put the toggles where the
site already puts controls: the `ext/Layout` bar / right drawer is "the only
interactive control surface" — extend it or hand it the layout's toggles rather
than building a new panel. If a page-thing (Sidebar, $pages, nav rail, tabs) has
properties, those are toggles in a right sidebar, not hard-coded extra examples.

## Deliverables

- The tab, the rail, the detail pages, the `web()` content helper — working,
  linked (a page nobody's parent declares does not exist).
- Every edited/created JS passes `node --check` (copy to `.mjs`). Beware
  backticks inside `` css(`…`) `` template literals — one kills the site.
- A `readme.md` beside the new tab's pages: question → options → weighing →
  verdict for the big calls (where the tab lives, the two-pane card, toggles vs
  variants). One screen.
- `public/framework/ai/2026-08-12/layouts/page.js` — interactive executive
  summary Page (`meta: import.meta`, title "Layouts"): what you built, live
  links to the tab and two or three best detail pages, a live embedded card or
  two, open questions. Model: `framework/ai/2026-08-08/page.js`.
- Do NOT commit. Scratch files in your scratchpad, never the repo.

## Constraints (the ones that bite)

- No build step; native ESM; real-URL imports with `.js`; no bare specifiers.
- Never build DOM after an `await`.
- CSS: every rule in a layer; restate all four layers; climb the ladder — most
  of this library should ship ZERO new CSS.
- Files under ~100 lines; comments near zero; prose via `md()`.
- One demo system, five blocks — extending `detail.js`/`exhibit` is in-bounds,
  a new sibling preview/stage/panel mechanism is not.
- No new npm deps. Windows; dev server may already be on port 80.
