# core/Page: start here

If you are about to work on `core/Page` (as its mastermind, a minion, or a new reader), this is your first page. It lists where the work comes in, what has been done, how to test, and what is next door. Each item is one line and a link.

## 1. Read, in this order

1. [`../readme.md`](../readme.md): the index of the module.
2. [`classes.md`](classes.md): the 23 files, one line each (what extends what, and who calls it).
3. [`loading.md`](loading.md): how a url becomes a page, one folder name at a time.
4. [`jsonl.md`](jsonl.md) and [`streaming.md`](streaming.md): the `page.jsonl` log and how a line reaches the screen.

## 2. Where work comes in

- **The inbox:** [`../inbox.jsonl`](../inbox.jsonl) holds the asks routed to this module (one line each, with its source). Read it with the Servex tool `module_inbox core/Page`. The [inbox tab](inbox-tab.md) shows it on the page.
- **The owner's asks, merged:** [`asks.md`](asks.md) (open first) and [`refined-asks.md`](refined-asks.md).
- **The expert:** [`../expert.json`](../expert.json) lists the docs a fresh expert loads. Ask it with `ask_expert core/Page …`.

## 3. What has been done

- **The work log, computed from git:** `node Server/ModuleLog.mjs public/framework/core/Page --by week` (also `--since 2026-09-01`, `--json`). It grades tasks as landed, committed but not closed, or never started. Caveat (2026-10-15): most commits name no task, so many show as "orphan" commits.
- **The decisions:** [`architecture.md`](architecture.md) (current), [`decisions.md`](decisions.md) (older history).

## 4. Test before you land

| test | covers | run |
|---|---|---|
| `core/Page/Page.test.mjs` | the real `Page` in node: a `page.jsonl` replays, typed parts become their classes, an unknown part type is reported, the item tool refuses a bad line | `node public/framework/core/Page/Page.test.mjs` |
| `Servex/agents/page_tools.test.mjs` | the page tools (`page_set`, `page_read`, …) on a temp `page.jsonl` | `node Servex/agents/page_tools.test.mjs` |
| `core/Item/Item.test.mjs` | `Item` fields (the base of `Page`) | `node public/framework/core/Item/Item.test.mjs` |
| `Template/Template.test.mjs` | templates, in headless Chromium | `node public/framework/core/Page/Template/Template.test.mjs` |

Not covered by any test: a tab subpage (a `{"tab":…}` line), or a list change inside one. Then `node Server/smoke.mjs <worktree>` before `node Server/merge.mjs <worktree>`.

## 5. Next door

- [core/Router](/framework/core/Router/) ([readme](../../Router/readme.md)) owns everything between "the url changed" and "the DOM shows it": it catches clicks, walks the url calling `page.child(name)` once per folder name, marks the active links and resets the scroll. `core/Page` owns what a name resolves to (`Page.child()`, `route()`, importing `page.js`).
- [ext/JSONL](/framework/ext/JSONL/) owns the socket tail (`live()`) that `page.jsonl` streams through.
- [core/Item](/framework/core/Item/) is the base class: `Page` is an `Item` with a url.
