# Fold step 1: Item's file loading moves into the Store

Budget: $4. Load the `minion` skill first, then the `code` skill.

## Why

The owner said yes on 2026-11-09 (relayed by voice-app: "make the best decision you can, as long as it's not destructive"). The plan is at [/live/plan/fold/](/live/plan/fold/); see its card "The one real disagreement: who fetches a file". The decision is that an Item keeps `Item.open(url)`, and how an item's lines arrive and become an object belongs to the Store. Then a second store (for example a Durable Object) never means editing Item.

## The change

Move the **bodies** of these four methods from `public/framework/core/Item/Item.js` into `public/framework/core/Item/Store.js` as statics. Item keeps each name as a one-line forwarder, so **no caller changes**:

| Item method today | line (approx.) | becomes in Store |
|---|---|---|
| `file_url()` | 540 | `static url_of(item)` |
| `load()` | 551 | `static load(item, Item)`, which still calls `Item.open(url, item.parent?.constructor)` |
| `static class_for(entries, fallback)` | 857 | `static class_for(Item, entries, fallback)` |
| `static root_from(entries)` | 871 | `static root_from(Class, entries, Item)` |

Item keeps the forwarders, for example `file_url(){ return this.constructor.Store.url_of(this); }`. `Item.Store` is already set (`Item.Store = Store`, see the top of Store.js).

- ⚠ **Store.js must not import Item.js** (an import cycle; read the comment at the top of Store.js). Pass `Item` or the Class in as an argument, as the table shows.
- Move each method's comment with its body. Leave a one-line comment on each forwarder that names the Store method.
- Callers today, which must still work unchanged: `core/Item/Item.js`, `core/Item/Item.test.mjs`, `core/Page/Jsonl.js`, `core/Page/Page.class.js`, `ux/Dictate/test/chat-sent.mjs`, `public/live/LivePage.js`. Find more with `git grep -n "file_url\|root_from\|class_for" -- public`.

## Tests

- Add to `core/Item/Store.test.mjs`: one block that calls `Store.url_of` for the three cases (`file` only, `path` only, both) and one that calls `Store.root_from` on a line-1-with-id file and on a first-line-without-id file. Assert after each call.
- Run every test under `core/Item/`, `core/Page/` and `core/Task/` before and after the change. The same pass/fail counts are required both times; give both counts in your log.

## Docs, in the same commit

- `core/Item/readme.md`: one line saying the Store owns file loading (`url_of`, `load`, `class_for`, `root_from`) and Item forwards.
- If `core/Item/doc/` names `file_url` or `root_from` as Item's own, fix that line.

## How

- Work in a worktree: `node Server/worktree-up.mjs fold-1`. Commit by exact path.
- Smoke-test it: `node Server/smoke.mjs <worktree>` must show no FAIL. Then load at least these in the worktree's own url and confirm they draw with no console error: `/live/`, `/live/plan/fold/`, `/framework/core/Page/`, and one session page under `/framework/ai/sessions/`.
- **Do not merge.** Log the branch, the commits, both test counts and the smoke result as `log` lines on your task, then close it with `close_task` (outcome plus evidence). The mastermind reviews and merges.
- Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash, delete recursively in the main tree, or touch `core/List/` or `page_tools.js` (another agent is working there).
