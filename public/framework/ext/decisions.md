# Ext — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance. Lives beside the readme rather than in `doc/` because `ext/Doc/` is a module and a case-insensitive filesystem cannot hold both `doc/` and `Doc/`.*

Nineteen opt-in addons: `AITask`, `Ask`, `Draggable`, `JSONL`, `DesignTool`,
`Panel`, `Saver`, `Timeline`, `catalog`, `demo`, `doc`, `drawer`, `editor`,
`files`, `highlight`, `layout`, `markdown`, `tabs`, `toc`. Each has its own
`readme.md`. This file is the rule that decides what lands here rather than in
`core/`, and the traps that only show up once more than one ext is in play.

## What belongs here, and the rule that decides

**Opting in is an import, and the two rules are already stated on this tier's
own `page.js`: core never imports an ext, and vendor the dependency.** Grepping
`core/*.js` for `ext/` finds nothing — the rule holds in practice, not just in
prose. The vendoring half is concrete too: `markdown/` ships `marked.esm.js`,
`highlight/` ships `hljs/`, both committed inside the module rather than pulled
from a CDN at render time (a CDN import would make every render wait on someone
else's uptime, and LAW#4 already forbids adding the npm dependency instead).

**This site opts in for every page, once, in `app.js`.** `markdown`, `demo`,
`tabs`, `catalog`, `drawer`, `files`, `toc`, `highlight` and `AITask` are
imported there directly — which is also why `md()` and `demo()` come straight
from `/app.js` rather than a deeper path. The rest (`Ask`, `JSONL`,
`DesignTool`, `Panel`, `editor`, `Draggable`, `Saver`, `Timeline`) are reached
through their own route (declared in this file's `children:`) or pulled in by
a specific caller — `DevBar` for `Ask`/`JSONL`/`DesignTool`, `Panel`/`editor`
for `Draggable`/`Saver`.

**An ext may lean on an ext, two different ways.** A *soft* lean has no import
either way — `demo` renders highlighted code when `highlight` happens to be
loaded and plain code when it isn't. A *hard* lean is a real import — `Doc`
imports `tabs` for its vertical rail and `files` for its Files tab, and removing
either breaks `Doc` outright. Knowing which kind you're looking at matters before
deleting an ext that looks unused: a soft dependent degrades, a hard one throws.

**An ext may also reach into `dev/Socket`.** `Ask`, `Saver/FileSaver`,
`DesignTool/audit/twin.js` and `JSONL` all import it directly for the dev-only
RPC bridge. That's not a hole in the "core never imports ext" rule — `dev/` is
a different tier with its own boundary (nothing in it may become a required
runtime dependency), and it's `Socket`'s own localhost check that keeps an ext
importing it safe off localhost, not any restraint on the ext's part.

## Traps that cross modules

- **⚠ Two exts patching the same core method compose only by import order, with
  no registry.** `html_unsafe` is currently patched by `ext/highlight` alone —
  fine at one patcher, unplanned at two (`core/View/readme.md`, Open). The same
  shape applies to any core method an ext patches: nothing detects a second
  patcher arriving.
- **⚠ A vendored file is never edited in place.** `marked.esm.js` and
  `hljs/*` are the exception to "core never imports an ext" in spirit as well —
  they're third-party code frozen at a version, not framework code, and a fix
  belongs upstream or in the wrapper (`md.js`, `highlight.js`) around them.

## Open

- **Whether `ext/editor` counts as "in use."** Zero lines of code anywhere in
  the framework import anything it exports — its only integration is being
  named in this file's `children:` string, which makes it a route and nothing
  more. Raised in the 2026-08-16 documentation audit
  (`/framework/audit/overview/organization/`), unresolved.
- **Whether `ext/DesignTool` belongs under `dev/` instead.** 26 files of
  browser measurement tooling, argued both ways in
  `/framework/audit/overview/priorities/` — the owner's call, not decided.
