# ext/Doc

**The module this audit was built to create, audited by the session that wrote it —
so read this one knowing its author is not independent.** `Doc extends Page` turns a
module's `readme.md`, `doc/**/*.md` and file list into a browsable page: Overview ·
…declared children… · API · Docs · Files, with top tabs as sections and a left rail
as sub sections. It replaced `ext/classdoc` on 2026-08-15.

## State

| | |
|---|---|
| files | 5 module files (`Doc.js` 216, `Doc.css` 82, `page.js`, `readme.md`, one overview page) |
| callers | 6 at migration (`core/View`, `core/Page`, `core/App`, `core/Router`, `core/Sidebar`, `dev/Socket`), ~25 after the audit |
| docs | readme, 3 notes, 8 method pages, 1 property page, 5 file docs |

## What changed from `classdoc`

**It became a class.** `classdoc`'s own record argued against a subclass because it
had *"no named parts to override."* That was true of a shape fixed at three tabs and
stopped being true the moment a module wanted a fourth. `Doc` names `sections()`,
`section()`, `api()`, `members()`, `member_page()`, `bar()`, `well()` and `render()`.
The composable `classdoc(page, Class, meta, names)` form was deleted — zero callers.

**`Class:` became `subject:`**, accepting a class, a function with properties, a
namespace object, or nothing. `member()` in `util/source` grew one guard
(`subject.prototype &&`) to cover all four.

**A Files tab**, on `ext/files`' new `about` hook: the module tree, then
`doc/file/<path>.md`, then the fetched source. The list is declared, not crawled —
`directory.json` is gitignored, so a crawler-driven tab would be blank in production.

**A filename label on code blocks**, one `data-file` attribute with two emitters:
`code.js(src, "/app.js")` and a markdown fence's info string.

## Recommendations

1. **`files:` goes stale silently and nothing detects it.** *(simple, important)*
   A file added to a module and not to the list is simply absent from its Files tab.
   Identical failure mode to `methods:`, and the audit found the analogous rot
   everywhere. The cheapest real fix is not a crawler but a **dev-only check**: in
   `files_section()`, when on localhost, fetch the dev server's `directory.json` and
   `console.warn` the difference. It stays out of the production path entirely,
   which is the constraint that killed the crawler.
2. **`api_section()`'s guard defeats an `api()` override.** *(simple, important)*
   A subclass whose members come entirely from `members()` calls gets no API tab and
   never runs, because the guard tests `this.methods`. Detectable in `sections()`
   with one `getPrototypeOf` check. Written up in `doc/method/api.md`.
3. **A missing `.md` renders `.md-error` per member.** *(simple, useful)*
   The copy now reads *"Not written yet"* rather than *"Error loading"*, which is
   honest, but a Files tab on an unaudited module is a column of them. Consider a
   quieter treatment for `doc/file/` specifically — an empty pane with one muted
   line, since "no prose yet" is the expected state of a new module, not a fault.
4. **`Doc.is_class` reads source text.** *(simple, useful)*
   Correct here — no build step, no transpilation — and it would answer `false` for
   a pre-ES6 `function Foo(){}` constructor. There are none; recorded so the next
   reader knows it was chosen rather than missed.
5. **The `well()` header is the only place on the site wanting a recessed token.**
   *(medium, speculative)* `--well` is a hand-rolled shadow because the theme's
   `wash → tint → surface` ladder only goes lighter. If a second caller ever appears,
   this belongs in the theme, not here.
6. **Outside the box: invert the relationship and let the docs generate the list.**
   *(large, speculative)* Every list in `page.js` exists because nothing crawls. But
   the *files* are the truth — `doc/method/append.md` existing IS the claim that
   `append` should be documented. A build-free reversal is impossible on static
   hosting; a dev-server-generated `doc.json` committed alongside is not. It would
   trade "the list goes stale" for "the manifest goes stale", which is only a win if
   the manifest is generated. Ranked last deliberately: it argues with the no-build
   constraint, which is the framework's whole thesis.

## Where this module overlaps others

**With `ext/tabs` and `ext/catalog`: correctly, by construction.** `Doc` adds no
layout JS at all — both nav levels are `tabs()`, and the Overview is `catalog()`.
That is the strongest evidence the arrangement contract was the right shape.

**With `ext/files`: newly, and deliberately.** The Files tab is `files()` plus one
hook rather than a second browser. This is the "name which block you extend"
rule from CLAUDE.md working as intended.

**The real question this audit raised:** four separate modules now render "a list
with a current mark beside a panel" — `Sidebar`, `Doc`'s member rail, `ext/toc`'s
rail, `ext/files`' tree. `ext/toc`'s auditor counted the same four independently.
Nobody thinks the *components* should merge (the "current" logic genuinely differs),
but the rail CSS is written four times with unexplained drift between them —
`scrollbar-width: none` here, `thin` there. **A shared rail stylesheet is the
scoped, cheap win**, and it is the one unification finding two independent auditors
reached without being asked about each other.

## Skill feedback

The `documentation` skill was written by this session, so its blind spots did not
show up here — they showed up in the 28 agents that used it, and five of their
findings were folded back in the same day: `readme.md` documents itself; the
Improvements heading is never omitted; never hand-cite a line number; a module with
two classes overrides `api()`; "one screen" governs the overview, not the record.

The honest verdict on the exercise: **a skill written by the person who built the
system cannot be tested by that person.** Every one of those five holes was
invisible from the inside and obvious to the first outsider who hit it.
