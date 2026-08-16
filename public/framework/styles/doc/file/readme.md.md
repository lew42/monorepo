## What this file is

The maintainer's record for the whole CSS strategy: the ladder, the four
layers, the escalation ratchet, and a "recent, and worth knowing" section that
functions as a running changelog of the load-bearing decisions. It is the
single most-cited file in this module — every subdirectory's own readme links
back to it, and it links out to five `doc/*.md` breakouts for anything that
grew past two paragraphs.

## The five-way breakout

`ownership.md`, `cascade.md`, `theme.md`, `audits.md`, `scrolling.md` each
carry one strand of the argument (where a rule goes, the layer ratchet, the
base-theme reframe, the eviction list, the app-shell-vs-document-scroll
decision) at a length this file deliberately doesn't. This pass wired all
five into `page.js`'s `notes:`, so each now has a url of its own instead of
being reachable only through this file's inline links.

## Recent, and worth knowing

This section is the file's changelog in miniature — `.surface`/`.wash`/
`.muted` becoming classes, `.measure` closing a gap the file had listed as
open twice, `.flex.auto > *` gaining `min-width: 0`. Read it before the
`doc/*.md` breakouts; it is the fastest way to find out what changed since
you last read this file.

## Open

Three items, none large: `app.css_audit()` (a dev-only class-diff tool,
~30 lines, still unbuilt), the deliberate choice to leave
`color-scheme: light` pinned at `:root`, and two remaining hardcoded colours
(`Page.css`'s hover shadow, `/styles.css`'s legacy `body.theme-1` block).

## Improvements

1. **The "Who uses this" section (added this pass) should be kept current by
   hand** — nothing crawls imports, so a new consumer of `sections/*.js` (the
   most string-imported file group in the framework, via `ext/Panel`) will
   silently drift out of date the way every hand-maintained caller list does.
   *(simple, useful)*
2. **A stale link surfaced while tracing callers**:
   `core/Page/overview/landing/` (reached via
   `framework/ai/2026-08-12/unify/page.js`) links
   `/framework/styles/layouts/cards/`, which this same file's own "What is
   here, and what the merge deleted" table records as removed. Outside this
   audit's fence (the link lives in `core/Page/` and `framework/ai/`) — flagged
   for whoever owns those files. *(simple, important)*
