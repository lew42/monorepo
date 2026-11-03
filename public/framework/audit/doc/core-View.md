# core/View

`View` is the one class the entire framework is built from — a chainable wrapper
over a DOM element, ~60 tag factories generated off it, and one piece of global
state (`View.captor`) that makes nesting calls read like the tree they produce. It
earns its place without argument: everything else in this audit is fit and finish.
Before this pass the module was already unusually well documented (readme,
41/41 method docs, 10/10 property docs, two design notes) — the one real gap was
structural, not conceptual: `page.js` had no `files:` list and the module had no
`doc/file/*.md` at all, so the Files tab did not exist for the file every reader
opens first. The single most important thing to do to this module is not a
documentation fix — it's `readme.md` §Proposed items 3 and 4 (`html()`'s silent
markup→text downgrade, and `hide`/`show`/`toggle` writing unoverridable inline
styles): both are real correctness/architecture bugs, already found, already
written down, and still unapplied.

## State

| | |
|---|---|
| files | 3 module files (`View.js`, `page.js`, `readme.md`) + 56 doc files = 59 |
| lines of JS / CSS | 471 (`View.js`) + 87 (`page.js`) = 558 JS / 0 CSS (no stylesheet of its own) |
| callers | ~50+ direct importers across `framework/` (every core class, ~30 `ext/` modules, `ui/`, `dev/DevBar/`), plus every `page.js` on the site indirectly via `/app.js`'s `export * from "../View/View.js"` chain. Representative: `core/App/App.js`, `core/Page/Page.class.js`, `core/Sidebar/Sidebar.js`, `ext/Doc/Doc.js`, `ext/demo/*`, `ext/layout/*`, `ext/highlight/highlight.js`, `ext/markdown/md.js` |
| docs before | `readme.md` (Decisions/Traps/Proposed/Open, already excellent), `page.js` (`Doc`, no `files:`), 41/41 `doc/method/*.md`, 10/10 `doc/property/*.md`, 2 notes (`capturing.md`, `lifecycle.md`), **0** `doc/file/*.md` |
| docs after | + `files: "View.js page.js readme.md"` in `page.js`, + `doc/file/View.js.md`, `doc/file/page.js.md`, `doc/file/readme.md.md`, + `## Used by` section in `readme.md` |

## What I changed

- **`page.js`** — added `files:` (was entirely absent — the Files tab silently did
  not exist).
- **`doc/file/View.js.md`, `doc/file/page.js.md`, `doc/file/readme.md.md`** —
  written from scratch (artifact #5 of the six was missing).
- **`readme.md`** — added `## Used by`, grepped across all of `public/` (step 2 of
  the brief); this module had no callers section before.
- Verified: `classdoc` — zero references. Every name in `methods:`/`properties:`
  has its `.md`; every doc file's claims cross-checked against `View.js`'s current
  source and spot-verified against live call-site greps (zero-caller claims for
  `html()`, `.lazy(`, `append_pojo`/`append_prop`, `has_class`/`toggle_class`,
  `.ctrl(`, and `View.parent` all held up). `node --check` clean, `curl` → 200.
- Left untouched: `View.js` itself (out of fences — behaviour changes are
  recommendations only) and the 51 pre-existing `doc/method|property/*.md` +
  `doc/*.md` notes, which were already accurate and did not need rewriting.

## Recommendations

1. **Fix `html()`'s silent capability downgrade, or delete it.** Without
   `Element.setHTML`, it warns and writes the value as **text** — the same call
   renders markup on one browser and prints angle brackets on another, and it has
   zero live callers (everything uses `html_unsafe`). *Simple, important.* Already
   fully argued in `readme.md` §Proposed 4 and `doc/method/html.md`.
2. **Replace `hide`/`show`/`toggle` with a `.hidden` utility class.** Inline
   `display: none` is the top rung of the CSS ladder — nothing downstream can ever
   override it — and `toggle()` reads the *computed* style, so a view already
   hidden by CSS silently toggles to hidden on its first call. One caller
   (`Sidebar`) to change. *Medium, important.*
3. **Delete `append_pojo`/`append_prop`.** Zero callers in `public/`, and the
   collision guard (`if (!this[prop])`) checks the **prototype chain**, so
   `append({ text: "hi" })` silently drops the value because `View.prototype.text`
   exists. This is the one `append()` branch nothing built on the site has ever
   used. *Simple, important.*
4. **Delete `View.body()`'s dead `init()` key.** The constructor calls
   `initialize()`, never `init()` — the promised `View.set_captor(this)` has never
   run, and both callers set the captor explicitly on the next line, which is why
   nobody noticed. *Simple, important — genuine dead code, not speculative.*
5. **Fold `has_class`→`hc` and `toggle_class`→`tc`.** Each long form is called
   only by its own two-letter twin; the codebase has already voted with every real
   call site. *Simple, useful.*
6. **Move `ctrl()` to `ext/demo`.** 18 lines, one caller outside `framework/`, and
   it emits `.class-ctrls`, which no stylesheet on the site styles — a component
   that ships markup and no CSS. Core would be free of the only member that builds
   a multi-element UI. *Medium, useful.*
7. **Outside-the-box: let `View.captor` be inspectable from the console in dev.**
   Nothing today lets a developer ask "what would append right now?" without
   reading source — a getter like `window.__captor` (dev-server-gated, same spirit
   as `framework/dev/Socket` only running on localhost) would turn the single
   highest-consequence trap in the framework into something you can *query*
   instead of only reason about. Costs a few lines, touches the one piece of
   global state everyone is warned never to misuse, so it wants a second opinion
   before anyone writes it. *Medium effort, speculative — ranked last on purpose.*

## Where this module overlaps others

None, cleanly — `View` is the substrate, not a peer. But two things worth naming
from where I sit: **`View.stylesheet()`'s promise-settling contract is duplicated
knowledge** — `App.styles_loaded()` (in `core/App/`) depends on every promise in
`View.stylesheets` resolving, and that invariant is stated in both modules'
readmes independently rather than owned by one and cited by the other; a future
pass could make `App`'s doc point at `View`'s instead of restating it. And
**`ctrl()` is the one place `View` already agrees with the audit brief's own
suspicion** — a core class quietly grew a demo-control widget, which is exactly
the "Editor/Panel/ext/layout/DevBar/demo, five names for one thing" pattern the
brief calls out, just caught one level lower (inside `core/`, not between exts).

## Skill feedback

**Strongest point:** the skill's own worked example (`doc/file/*.md` in
`ext/Doc/`) quietly **contradicts its own stated structure**. §4 says every file
doc ends with "a ranked list of improvements last" and gives a two-item example —
but none of the five actual `doc/file/*.md` files shipped in `ext/Doc/` (the
module the skill tells you to read first, per the brief's step 0.3) has an
`## Improvements` section at all. I followed the shipped precedent (omit it when
there's nothing worth ranking; write it when there is) rather than the prose,
since it produced better files, but an agent trying to follow the skill literally
would either pad three short files with invented "improvements" or silently
deviate and never say so. The skill should say explicitly: *the section is
optional — omit it rather than manufacture content.*

Second: "**A module with no callers is itself a finding**" (brief step 2) has no
parallel guidance for the opposite extreme — a module with ~50+ direct callers
and effectively universal indirect use. Listing every caller (as the letter of
the instruction implies) is both impossible and useless for a foundation class;
I summarized by category with representative examples instead, but had to guess
where "enough" was. A line like *"for a module used everywhere, summarize by
category — the finding that matters is the shape of the usage, not the count"*
would remove that guess.

Third, minor: the skill never states whether `readme.md` itself needs a
`doc/file/readme.md.md`. I only knew to write one because `ext/Doc/`'s own
directory does (`doc/file/readme.md.md` exists there) — the brief's step 3 says
"one for EVERY file in the module," which does technically cover it, but it reads
at first as being about code files, and I'd have skipped it without that example.
