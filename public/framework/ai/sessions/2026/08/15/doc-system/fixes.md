# The implementation wave — scope, and what was deliberately left

The audit produced roughly a hundred ranked recommendations. This wave implements
**only the real bugs**, and the reason is CLAUDE.md's own rule:

> Small, local, obviously-correct fixes don't need [a proposal]; anything changing
> an API name, a call order, or where a responsibility lives does.

So a missing `.catch()` gets fixed. Deleting `View.html()`, folding `List` into
`Item`, extracting a shared `raf_drag()` — all well-argued, none obviously correct —
stay written down for Mike. **A sunk edit presents an unsettled direction as
decided, and then argues for itself.**

## Not done, and not because it was forgotten

- **Committing `ext/Panel` and `ext/editor`.** 972 lines, no git history. It is the
  single highest-risk item the audit found — and CLAUDE.md says commit only when
  asked. Flagged at the top of Priorities instead.
- **Every deletion** (`append_pojo`, `html()`, `App.log_label`, `is.proto`,
  `is.mobile`, `md.c`, three Sidebar handles). Each verified dead by grep, each a
  removal of public surface.
- **Every dedup** (the saver chooser, `raf_drag()`, the rail stylesheet, the
  three-clause drag guard). Each crosses module boundaries.
- **Every rename** (`List.find`, `Router.root`, the two `Timeline`s, `lane`).

## The assignments — one file group each, no overlap

| # | files | the fix |
|---|---|---|
| A | `core/App/App.js` | `instantiate()` has no `.catch()` — a throw in `config()`/`render()` leaves `app.ready` pending forever |
| B | `ext/Saver/Saver.js`, `ext/Saver/FileSaver.js`, `ext/Panel/workspace.js` | `drain()` doesn't reset `writing` on a rejected write (every later save returns a dead promise); a **failed** load is indistinguishable from an absent one, so `workspace()` seeds over real data |
| C | `ext/Draggable/Draggable.js` | `destroy()` mid-gesture leaks the ghost and placeholder into the DOM forever |
| D | `ext/editor/page.js` | opening the page rewrites `/data/editor.json` untouched — `changed()` runs so a badge has a value |
| E | `ext/Timeline/Timeline.js` | a still-running item's lane frees at its **start**, not now, so a later bar packs into an open one |
| F | `ext/tabs/tabs.js` | the `filling` promise has no `.catch()` — a throwing child leaves the bar blank with no console trace |
| ~~G~~ | ~~`ext/LayoutTool/audit/pages.js`~~ | **already fixed** — the rename pass globbed `*.js`, so it caught this one. But its auditor found the *generated* baseline `audit/findings.json` still carries 14 dead classdoc rows, and regenerating it needs a full Playwright crawl. Left as a recommendation. |

Each agent owns its row and nothing else. Each writes the fix, updates the module's
`doc/*.md` where the fix changes what the docs claim, and verifies.
