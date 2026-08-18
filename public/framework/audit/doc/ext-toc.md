# ext/toc

A small, tight module (121 lines JS, 71 CSS) that scans a page's own `h2`/`h3`
headings into a scroll-spied nav — no declaration, no registration, add a
heading and it's in the rail. It earns its place cleanly: 20 real pages call
it, the design record is unusually careful (five recorded decisions, three
recorded traps, all still accurate), and the code itself needed no fixes. The
single most important thing to do to it isn't in the module at all: the
audit's extra question surfaced a real, currently-latent defect at the
*seam* with `ext/Doc` (below) that deserves a structural guard, not just a
paragraph in a readme.

## State

| | |
|---|---|
| files | 4 (`toc.js`, `toc.css`, `page.js`, `readme.md`) |
| lines of JS / CSS | 121 / 71 |
| callers | 20 call `toc()` (listed in `readme.md`'s new "Who calls it"); 2 more use only the `.toc-skip` opt-out (`framework/stats.js`, `framework/ai/2026-08-12/stage/page.js`) |
| docs before | `readme.md` already a full, accurate design record (Decisions/Traps/Open) but zero conceptual-overview line, zero `doc/*.md`; `page.js` a plain `Page`, not a `Doc` (no Files tab); one stale link, "Next: Classdoc" |
| docs after | `page.js` rewritten as `new Doc({ notes: "skip-list", files: "toc.js toc.css page.js readme.md" })`; `doc/skip-list.md` (breakout of the readme's two-galleries story); 4 `doc/file/*.md`; `readme.md` gains a "Who calls it" section and a fourth Trap; stale link fixed |

## What I changed

- `page.js` — rewritten as `new Doc({...})`. No `subject` (loose function, no
  properties/methods worth a member page — matches the skill's "module of
  loose functions" shape). Added a new closing section, "Only on a plain
  reading page", stating the `overview:` + `toc()` collision found below
  directly on the page, not only in the collapsed design record. Fixed the
  dead "Next: [Classdoc]" link to point at `/framework/ext/Doc/`.
- `readme.md` — added "Who calls it" (the grep in Step 2, as a table) and a
  fourth Trap (the `overview:` collision, verified against actual source of
  `ext/Doc/Doc.js` and `ext/catalog/catalog.js`). Broke the "gallery defeats
  the skip list" section out to `doc/skip-list.md`, summarized to one
  paragraph, linked, added to `notes:`.
- `doc/skip-list.md` (new) — the two-galleries story in full.
- `doc/file/toc.js.md`, `doc/file/toc.css.md`, `doc/file/page.js.md`,
  `doc/file/readme.md.md` (new) — one per file, each with a ranked
  Improvements list.
- `public/framework/audit/modules/ext-toc.md` — this file.

No `toc.js`/`toc.css` edits — every behavioral finding below is a
recommendation, not an edit, per the fences.

## The extra question: does `toc()` still earn a fourth nav?

A `Doc` page already stacks three: the site sidebar, the top section tabs,
and (inside API/Docs/Files) a left sub-section rail. **Answer: not today, and
not by accident if it ever does.**

I checked every `Doc` on the site that declares `overview:` (a left catalog
rail on its *Overview* tab specifically — the only tab `content()`, and so
`toc()`, ever runs on). There are exactly two: `core/Page/page.js` and
`ext/Doc/page.js` itself. **Neither imports `toc`.** Every one of the 20 real
`toc()` callers is a page with no `overview:` — there `toc()` is a genuine
third nav (sidebar + tabs + toc), not a fourth, and it's doing real work: it's
the only index of that page's own prose.

More than that: if a `Doc` ever *did* combine `overview:` with a `toc()` call,
it wouldn't render a fourth nav — it would render **nothing**. `ext/catalog`'s
`screen()` mounts the Overview's active child into the section's own
`$pages` (a `.page-catalog-pages` div), not the site's `.pages`. `toc.css`'s
only rule that turns the rail back on is
`.pages > .page:not(.standard):has(> .toc)` — a *direct*-child selector — and
a catalog's child is never a direct child of `.pages`. The rail would build,
scan, and spy, entirely inertly, `display: none` throughout. Confirmed by
reading `Doc.js` and `catalog.js` line by line, not just grepping for it.

**Verdict: keep it, but write the guard down before the first collision, not
after.** "Delete it" would be wrong — on every page that actually uses it
today, it's the only nav answering "where in *this* prose am I", which
neither the sidebar (site tree) nor the tabs (module sections) can answer.
The real fix is recommendation #1 below.

## Recommendations

1. **Give the `overview:` + `toc()` collision a loud failure, not a silent
   one.** Claim: right now the only thing preventing a fourth-nav bug is that
   nobody has tried it; CLAUDE.md's own doctrine ("a 404 stylesheet no longer
   hangs — it resolves and warns") argues this should warn too, e.g. `fill()`
   checking `$toc.el.parentElement.parentElement === scroller` (or similar)
   and `console.warn`-ing instead of quietly building a dead rail. Cost:
   **simple**, but it edits `toc.js`, outside this audit's fences — written
   down for whoever picks it up. **simple, important.**
2. **`toc(...args)` accepts and `.assign()`s arguments that zero of the 20
   callers pass.** Either it's reserved for a caller that hasn't arrived, or
   it's unused surface. Drop the passthrough or leave it — but the file
   should say which on purpose. **simple, useful.**
3. **`scrollbar-width: none` here vs. `thin` on `ext/catalog`'s own sticky
   rail** — two "sticky rail beside scrolling content" components on the same
   site disagree on whether their own scrollbar is visible. Pick one.
   **simple, speculative.**
4. **Outside-the-box: the scroll-spy geometry `spy()` already computes (each
   heading's position relative to the reading line) is most of a reading-
   progress indicator for free** — a thin fill on `.toc-link.current`'s
   border, proportional to how far through *that section* the reader has
   scrolled, with no new listener and no new measurement. Nobody asked for
   this; flagged because the cost is close to zero given what already exists.
   **medium, speculative.**

## Where this module overlaps others

Not the suspected five (Editor/Panel/`ext/layout`/DevBar/`ext/demo`) — `toc`
touches none of them. The real overlap, and it's a clean one: **this is the
fourth independent implementation of "a linked list of destinations with one
marked current"** on this site alongside `Sidebar` (the site tree, via
`Router.mark_links()`'s `.active`/`.in-path`), `Doc`'s own `this.tabs().ac(
"vertical")` left rail (a declared member list), and `ext/files`' tree (a
declared file list) — a point `ext/files`' own audit already raised from its
side. All four are visually the same shape (a sticky column, links, one
marked row) and structurally different only in **where the list comes
from** — scanned DOM, declared members, declared files, a declared page tree.

I don't think they should merge into one *component* — the "current" logic is
genuinely different in each (scroll position vs. router match vs. click
state), and forcing one abstraction over four data sources is exactly the
kind of option-growing CLAUDE.md warns against. But the **CSS** is
reimplemented four times (a sticky rail, a `current`/`active` border-inline
mark, a hover state) with small, unexplained differences — `toc.css`'s
`scrollbar-width: none` vs. `catalog.css`'s `thin` above is one instance of
that drift. A shared rail *stylesheet* — not a shared component — is the
scoped version of this worth actually doing.

## Skill feedback

**Strongest:** the skill's readme guidance directly contradicts itself for
any module with real design history. It says "Keep the whole readme to **one
screen**," then lists what it carries: "the conceptual overview... Decisions
... Traps... Open" — and Decisions alone, argued honestly (question →
options weighed → verdict), routinely runs past one screen. This module's
readme did before I touched it, and `ext/Doc/readme.md` — the reference
implementation, rewritten today — is ~125 lines for the same reason. I
matched the reference rather than the literal instruction, but I had to
*choose*; the skill should say plainly that Decisions/Traps/Open are exempt
from "one screen," or that "one screen" means the *overview*, not the whole
file.

**Second:** whether a module's own `readme.md` belongs in `files:` (and thus
needs a `doc/file/readme.md.md`) is never stated — only inferable by noticing
`ext/Doc/page.js` itself lists `"readme.md"` in its `files:`. A one-line
example line ("`files:` includes every real file in the module root,
`readme.md` included") would have saved reverse-engineering it from a peer
module.

**Third, smaller:** Step 2's "for each [caller], note what they use it for"
assumes callers differ. With 20 nearly-identical call sites (`toc();` as the
first line, always), a line-per-caller table adds width with zero new
information; the skill doesn't say it's fine to state the common usage once
in prose and table only page + url, which is the judgment call I made.
