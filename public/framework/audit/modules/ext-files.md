# ext/files

`files()` is a small, well-scoped file browser — a tree of real, fetched files
and the one you clicked — and it earns its place doubly now: it's the "getting
started" example browser at `/framework/start/` *and*, since today's `about`
hook, the mechanism behind `ext/doc`'s Files tab on every documented module on
the site. It had no docs at all before this pass (a `readme.md` that was
entirely undocumented design-record prose, and a plain `Page`, not a `Doc`).
The single most important thing to do to it: fix the unguarded `resp.ok` check
in `file_pane()`'s no-highlight fallback — a real, if currently masked, bug.

## State

| | |
|---|---|
| files | 4 (`files.js`, `files.css`, `page.js`, `readme.md`) |
| lines of JS / CSS | 122 / 97 |
| callers | 2 — `/framework/start/page.js` (no `about`); `ext/doc/Doc.js:106` (`Doc.browser()`, with `about`) |
| docs before | `readme.md` existed but was 100% design record (no conceptual overview, no Decisions/Traps/Open split); `page.js` was a plain `Page`, not a `Doc`; zero `doc/*.md` files |
| docs after | `readme.md` rewritten (overview + short sections + Decisions/Traps/Open); 3 notes (`doc/about.md`, `doc/tree.md`, `doc/fetched.md`); 4 per-file docs (`doc/file/*.md`); `page.js` rewritten as `new Doc({...})` with a second Overview card dogfooding `about` on the module's own files |

## What I changed

- `readme.md` — rewritten from a bare "design record" into overview + three
  short sections (fetched, tree, about) each summarized and linked out +
  Decisions/Traps/Open + a "Who uses it" section.
- `doc/fetched.md`, `doc/tree.md` — the old readme's six numbered sections,
  regrouped by topic and given their own urls (now reachable at
  `/framework/ext/files/docs/fetched/` and `/docs/tree/`).
- `doc/about.md` (new) — the `about` hook's contract, the container-query
  stacking rationale, and the "returned vs. called" capture trap in `show()`.
- `doc/file/files.js.md`, `doc/file/files.css.md`, `doc/file/page.js.md`,
  `doc/file/readme.md.md` (new) — one per file, each with a ranked
  Improvements list.
- `page.js` — rewritten as `new Doc({...})`, `notes: "about tree fetched"`,
  `files:` matching the directory. Added one Overview rail card, **With
  about**, that runs `files()` against this module's own four files with
  `about` wired to their own `doc/file/*.md` — the same wiring `ext/doc` uses,
  shown live rather than only described.
- `public/framework/audit/modules/ext-files.md` — this file.

No `.js` beyond `page.js`, no `.css`, and no behavior changed — every finding
below is a recommendation, not an edit.

## Recommendations

1. **Bug: the plain-text fallback in `file_pane()` never checks `resp.ok`.**
   `files.js:63-69` — `code.file()` (the `ext/highlight` path) throws on a
   non-2xx response; two lines below it, the fallback
   (`pre.c("code-block", () => code().append(fetch(...).then(resp => resp.text())))`)
   does not, so a missing or misspelled path silently renders whatever body
   the SPA fallback served (typically `index.html`) as if it were the file's
   contents. Currently masked because `app.js` always imports `ext/highlight`,
   so `code.file` is truthy everywhere on this site — but `files()` is a
   standalone export, and the fallback exists specifically for a caller that
   doesn't load `ext/highlight`. **simple, important** — mirror `md.file()`'s
   `if (!resp.ok) throw new Error(...)`.
2. **No loading state between a click and the pane resolving.** Both
   `file_pane()` and `about()` can be async, and today the pane is simply
   empty in between. Unnoticeable for a same-origin `.md` fetch; would be
   noticeable the day either does something slower. **simple, useful** — a
   one-line "Loading…" placeholder before the `.empty()` callback runs.
3. **The click handler re-queries every `.file-name` row on every click** to
   toggle `.selected`. Fine at the three-to-six-file scale this module is
   built for by design (see "Kept: no expand/collapse" in `doc/tree.md`); not
   worth changing unless that scale assumption changes first. **simple,
   speculative.**
4. **Outside-the-box idea: let `about` return `null`/`undefined` to skip the
   pane for specific files**, rather than being all-or-nothing per `files()`
   call. Right now `ext/doc`'s `about` always resolves to *something* (a
   "Not written yet" error box from `md.file()` if the `.md` is missing) — a
   module could instead point `about` only at files worth annotating and
   leave the rest as pure source, closer to how a real IDE's "peek docs" only
   lights up where there's something to say. **medium, speculative** — changes
   a public function's contract, so it's a "propose before major surgery" per
   `CLAUDE.md`, not a drive-by.

## Where this module overlaps others

Structurally, none of the suspected five (`Editor`/`Panel`/`ext/layout`/
`DevBar`/`ext/demo`) — `files()` is read-only and has no editing, splitting or
layout-arrangement ambition; it is a tree plus a pane, full stop. The real
overlap is narrower and worth naming anyway: **`ext/files` and `ext/toc`** are
both "read this page's own structure and render a nav for it" (a directory
tree vs. a heading tree), and both exist beside `ext/doc`'s Files/API tabs,
which are also structure-shaped navs (a member list). None of the three shares
code today, and I don't think they should merge — the data sources are too
different (a declared path list, `document.querySelectorAll("h2,h3")`, and a
declared method/property list) — but a future "tree nav" primitive factoring
out `tree()`'s rendering (used only by `files.js` today) is plausible if a
fourth tree-shaped nav shows up.

## Skill feedback

The skill is clear and was easy to follow end to end for a module this size;
one real gap and one thing that cost time:

- **No guidance on `subject`-less modules whose `page.js` still needs an
  Overview rail.** The skill's "Variants are pages, not a wall" section shows
  `overview: "basic variants advanced overrides"` (sibling directories) as the
  primary form and mentions the inline-array form once, in passing, with no
  worked example. For a module with exactly one real demo and one genuinely
  new thing to show side-by-side (this module's `about` hook), it took real
  judgment to decide "one inline overview card" was the right size rather
  than either zero (cramming everything into `content()`) or a whole sibling
  directory for a single card. A short worked example of the inline-object
  form, with guidance on when a variant deserves a full directory vs. an
  inline config, would remove that guessing.
- **The six-artifact table doesn't say what happens to a readme that is
  *already* 100% design record**, as this module's was (titled "files — design
  record", zero conceptual overview). The audit-checklist's step 5 ("the
  readme's sections… break out to `doc/<name>.md`") answers it if you connect
  the dots, but a one-line note — "a readme that's entirely a design record
  gets the same split: overview first, decisions kept inline, everything else
  broken out" — would have saved a re-read of both the skill and
  `ext/doc/readme.md` to confirm the intended shape.
