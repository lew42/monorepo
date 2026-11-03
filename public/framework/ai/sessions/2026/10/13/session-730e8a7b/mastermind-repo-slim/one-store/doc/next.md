# Next brief: cards into the sessions store (the one-tree apply)

**What it does:** every Inbox card folder moves from `ai/YYYY/MM/DD/<card>/` to `ai/sessions/YYYY/MM/DD/cards/<card>/`, so `framework/ai` has one year tree. The decision and its numbers are in [one-tree.md](one-tree.md); this page is the work order.

**Why there is a step before the move:** a card's id is its path (`2026/10/13/<slug>`), and 656 records carry that id. Records are never rewritten, so every reader first has to turn an id into a folder through one function. Once they all do, the move changes nothing they can see.

## 1. One resolver: `Cards.dir(id)`

Add it to `Servex/cards/Cards.js`. It returns the new folder `ai/sessions/YYYY/MM/DD/cards/<slug>/` when that folder exists, otherwise the old `ai/YYYY/MM/DD/<slug>/`. `Cards.url(id)` returns the matching site path. `create_card` writes to the new place.

## 2. The callers, each switched to `Cards.dir` / `Cards.url` (exact lines, 2026-10-13)

| File | Line | Today |
|---|---|---|
| `Servex/cards/Cards.js` | 22, 65 | `ROOT = …/public/framework/ai`; `folder(id)` joins `root` + id |
| `Servex/agents/Layers.js` | 36, 131–142, 173, 1033 | `CARDS_AT = "/framework/ai/"` + id, both ways (url → id and id → url) |
| `Servex/agents/Sessions.js` | 444, 625, 637 | `` `/framework/ai/${id}/` ``, the "not a known card" check |
| `Server/on-landing.mjs` | 58 | `path.join(root, "public/framework/ai", card)` |
| `.claude/hooks/prompt-relay.mjs` | 122 | builds `/framework/ai/<day>/<slug>-<id8>/` for a new card |
| `public/framework/ai/rail/groups.js` | 114 | `` `/framework/ai/${key}/` `` |
| `Servex/doc/readme-chain.md` | 36 | names `public/framework/ai/${card}` (text) |

Before you start, re-run the search. Lines move, and the census in [`one-tree-census.mjs`](../one-tree-census.mjs) lists every code mention (`Servex/TaskLoop.js`, two tests and two pages were in the dry run too).

## 3. The router

`/framework/ai/YYYY/MM/DD/<card>/` must answer from the new folder. Give it the same static redirect `StoreFolder.moved()` gives old task urls: the move log is `ai/sessions/task-moves.jsonl`.

## 4. The move, scripted

1. Run `node Server/TaskMove.mjs` with [`one-tree-manifest.json`](../one-tree-manifest.json). It covers 639 folders and 21 day files, and 0 of their targets are taken. Regenerate the manifest first with [`one-tree-plan.mjs`](../one-tree-plan.mjs).
2. Run `--verify --run last`. It must report 0 bad.
3. Prove `--undo` on a worktree copy before you touch main.
4. Run `--relink --run last`. Never replay the whole ledger.

## 5. Proof before it lands

- `check_page` passes on `/framework/ai/`, the Inbox, one session page and one card page, with zero failed requests.
- `one-tree-census.mjs` reports 0 card folders left at `ai/YYYY/`.
- `node Server/TaskDirs.mjs --census` still reports 0 day folders and 0 writers.

This changes a core id's dozen callers, so it is major surgery under CLAUDE.md. Do it in a worktree, and merge only once all four pages pass.
