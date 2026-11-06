# tabs-page: proof (worktree/qf-3)

Commits: aebf52031 (phase B), 4b61d7900 (the topic-leaf line kept), 5f6bfbe6b (round 2: one title, one Files button, no gap), 94db61f0f (docs). The worker's log: [minion-tabs-page/session.jsonl](../../../session-7caa4528/minion-tabs-page/session.jsonl).

## The sitewide scroll rule (`public/styles.css`), main against the worktree

The `overflow-y` of every `.pages` region, at 400 and 1200, on 9 urls. After 4b61d7900, the only differences are the intended ones:

| url | main | worktree |
|---|---|---|
| `/live/demos/tabs-page/alpha/` | hidden, 909 of 749 px (cannot scroll) | scroll |
| `/live/` | scroll | scroll (shorter: the smaller title) |
| `/framework/`, `/framework/core/`, `/framework/core/Page/`, `/framework/core/Page/doc/`, `/framework/ai/`, `/web/`, `/live/demos/tabs-page/` | same | same |

Before 4b61d7900, `/framework/`'s outer region went from hidden to scroll (a dead scrollbar gutter). That line was put back.

## Tabs, at 400 px (worktree)

| check | result |
|---|---|
| tab row, 7 tabs | `tab-bar`: 538 px of tabs in 368 px, `overflow-x: auto`, `nowrap` |
| selected tab in view | Alpha, Gamma, Eta: yes |
| Files on Alpha | opens Alpha's own `page.jsonl` |
| Files on Gamma, Eta | opens the parent's `page.jsonl` (they have no folder) |
| the panel | x 24 to 384, page width stays 400 |
| titles | Alpha and Gamma show only "Tabs (plain Page)" |
| `/imagine/paging/` (a page.js page with tabs) | unchanged |
| `/framework/core/Page/tool/` (a jsonl page) | gains the Files button, as intended |

The shots were taken to the scratchpad and not kept (png files are gitignored).

Tests: the worker ran the `core/Page` node tests (3/3 passed) and `Server/smoke.mjs` (clean). `merge.mjs` runs smoke again.
