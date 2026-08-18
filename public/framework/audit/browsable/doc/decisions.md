# audit/browsable — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

The permanent home for the prime objective's other half: not just "how deep"
but "how much of the way in is a picture." Replaces the one-off
`ai/2026-08-16/mastermind-layout/browsable.md` — that file's numbers were
already stale the day it was written (the styled-elements gap it flagged was
closed hours later by `ai/2026-08-16/element-pages/`), which is exactly why
this page's numbers are **computed, not typed**.

## The shape

`findings.json` is a generated baseline, committed beside the page, matching
`ext/DesignTool/audit/`'s pattern — LAW#1 forbids walking the filesystem at
runtime, so the graph is built once by a Node script (not committed —
RULE#12: the machinery isn't part of the site, its conclusion is) and
`page.js` fetches the JSON and renders it. Nothing on this page is hand-typed
except the prose framing.

## Method

The nav graph is a **static parse** of every `page.js` under
`public/framework/`, excluding `core/new/**` (CLAUDE.md: never import these)
and `ai/<date>/**` (task dirs, and `framework/ai/`'s own dated children are a
`route()`-built dynamic tree with no `page.js` to find).

For each file: locate its own `export default new X({ … })` call precisely
(not the first `{` in the file — a nested demo tree or a `code.js()` example
block elsewhere in the same file must never be mistaken for the real config),
then scan that object at bracket-depth 0 for `children:` / `overview:` /
`methods:` / `properties:` / `notes:` / `files:`. A field found only inside a
method body (`content(){ … }`) is at depth ≥1 and is correctly ignored — this
is what keeps documentation prose that merely *mentions* `children:` from
being read as a real field.

**A step counts as visual** only when the parent's own source (comments and
string literals stripped, so prose that just *mentions* a method name can't
false-positive) calls `this.previews()`, `this.walls()`, `this.catalog()`, or
`demo.exhibit()` — or, for a `Doc`, `this.wall()` (singular — a Doc's
declared children default to a plain tab in `Doc.bar()`, but a module that
also calls `wall()` additionally previews those same children as cards on its
Overview, same as `ui/` and `styles/layouts/space/` do). A `Doc`'s `overview:`
demos are always visual — `Doc.overview_section()` auto-injects
`initialize(){ this.catalog(); }`, so there is nothing to detect in source.

BFS from `/framework/` gives click-depth twice: once over every edge ("any
link") and once filtered to visual edges only.

## Regenerate

There is no live "re-measure" button — unlike `ext/DesignTool`'s audit, this
is a pure source parse with no rendering step, so there is nothing a browser
needs to do that a one-off Node script run from a checkout can't. To
regenerate `findings.json`: walk `public/framework/**/page.js` with the two
excludes above; for each file, extract its own config object precisely
(`export default new X(` → the first `{` after it, or after one wrapper call
like `demo.tree(`); read `children:`/`overview:`/`methods:`/`properties:`/
`notes:`/`files:` at depth 0; build edges (dir-form children resolve to a
sibling `page.js`, `demo.page("name", …)` and factory-call children like
`word({ name, … })` become synthetic leaves, a bare `array.map(…)` value
becomes one honest placeholder rather than a guess); BFS twice as above; write
the JSON. This file's own prose is the closest thing to a spec.

## Traps (found the hard way)

- **A lone apostrophe inside a `//` comment reads as opening a string.** This
  codebase's comments are full English prose ("the module's own…") — without
  comment-awareness, everything after that apostrophe vanishes into "inside a
  string" until some later apostrophe happens to close it, silently eating
  every field after it. Every string/bracket scanner here checks for `//` and
  `/* */` before checking for a quote, for exactly this reason.
- **`children: "a " + "b " + "c"` is a real pattern** (`styles/layouts/page.js`),
  not a single string literal — a scanner that stops at the first closing
  quote truncates the whole vocabulary silently.
- **Not every `Doc`-declared child is a plain tab.** `Doc.wall()` (singular)
  lets a module preview its own declared children as cards on its Overview, in
  *addition* to their tab — miss it and every module using it (`ui/`,
  `styles/layouts/space/`) reads as 100% chrome.

## Open

- **"Own docs" is only `hasReadme` + `isDoc` in the committed baseline** — the
  third signal the task asked for ("prose beyond one line") was not computed;
  a page with real prose but no readme and no `files:` tab currently reads as
  "no own docs." Named, not silently dropped.
- **A `children:`/`overview:` value built from `array.map(fn)` cannot be
  resolved to real names from source alone** (`styles/layouts/400/`,
  `ext/DesignTool/library/bad/`, `library/patterns.js` — 4 places) — each
  becomes one `dynamic-list` placeholder node rather than N real ones, so
  `totals.reachable_urls` undercounts by a small, named amount.
- **Depth and visual-reachability numbers differ from the 2026-08-16 judge's
  report by design**, not by drift: independent method, and the site changed
  under it (the styled-elements fix landed between the two). Two checkpoints
  matched exactly (`styles/layouts/` fan-out of 23, `core/View/api/` member
  count of 51), which is the closest thing to a cross-check this setup gets.
