# One tree under `framework/ai` (decision, 2026-10-13)

The owner: "I don't like having that date directory right in the AI folder… We have several twenty twenty-six directories… port everything over to one single data structure" ([requirements-8.md](../../requirements-8.md), asks 3–4).

## Where things stand

- **The flat day folders are gone.** `ai/2026-10-12/` and `ai/2026-10-13/` moved into the store on 2026-10-13 (commit `df3e46742`); nothing can make one again ([why-the-day-folder-came-back.md](why-the-day-folder-came-back.md)).
- **Two year trees are left:** the sessions store `ai/sessions/YYYY/MM/DD/` (sessions and their tasks) and the card tree `ai/YYYY/MM/DD/<card>/` (the owner's Inbox cards, written by `Servex/cards/Cards.js`).

## The decision: cards move into the sessions store (option b)

```
ai/sessions/YYYY/MM/DD/session-<id8>/<task>/     a session and the tasks it ran (as today)
ai/sessions/YYYY/MM/DD/cards/<card>/             the day's Inbox cards (was ai/YYYY/MM/DD/<card>/)
ai/sessions/YYYY/MM/DD/day.jsonl                 the day's log (as today)
```

Measured by [`one-tree-census.mjs`](../one-tree-census.mjs) (numbers, not memory):

| | (a) the store moves up to `ai/YYYY/MM/DD/` | (b) cards move into `ai/sessions/YYYY/MM/DD/cards/` ✅ |
|---|---|---|
| What moves | 54 days of the store, 40,867 files | 639 card folders, 869 files |
| Links to rewrite (md/js/html) | 3,591 in 1,171 files | 251 in 174 files |
| Same-name folders to merge | 164 | 0 |
| Records left on the old address (.json/.jsonl, never rewritten) | 36,638 | 6,331, of them 656 card ids |

(b) is about fifteen times smaller, needs no folder merges, and is what the owner said on 2026-10-12: "I actually kind of think they should all be in the sessions folder" ([task-folders.md](../../../../../../../../doc/task-folders.md)). The alternative (a) gives shorter URLs (`ai/2026/…`) and is rejected for its size and its 164 merges.

## The dry run

[`one-tree-plan.mjs`](../one-tree-plan.mjs) wrote [`one-tree-manifest.json`](../one-tree-manifest.json): 639 card folders and 21 card-day files, every one with its new path, **0 targets already taken**, and the 251 mentions in 174 files that the relink would rewrite (222 of them inside `ai/` itself; the code ones are `Servex/cards/Cards.js`, `Servex/agents/Layers.js`, `Servex/TaskLoop.js`, two tests and two pages).

## Why it was not applied today (the proof that failed)

The brief's condition was "every mention relinked". The dry run shows it is not: a card's **id is its path** (`2026/10/13/<slug>`), and 656 records carry that id (`cards.jsonl`, `asks.jsonl`, task logs). Records are never rewritten (CLAUDE.md, never destructive), so every card reader must first turn an id into a folder: `Cards.js`, `Layers.js` (`public/framework/ai/${card}`), `Sessions.js`, `on-landing.mjs`, the `prompt-relay`/`reply-relay` hooks, and the Inbox (`ai/rail/`). Until that resolver exists, the moved cards would vanish from the Inbox, so the four-page proof (`/framework/ai/`, the Inbox, a session page, a card page) cannot pass. Changing a dozen callers of a core id is also the "major surgery" CLAUDE.md asks to raise first. The Inbox rebuild (`inbox-data`) has landed, so nothing else blocks the next step.

## What is ready, and the order to apply it

1. `Cards.dir(id)` in `Servex/cards/Cards.js`: id → `ai/sessions/YYYY/MM/DD/cards/<slug>/`, falling back to the old `ai/YYYY/MM/DD/<slug>/` while both exist; every reader above calls it (one resolver, CLAUDE.md law 6). `create_card` writes the new place.
2. The router: `/framework/ai/YYYY/MM/DD/<card>/` answers from the new folder (the same redirect `StoreFolder` gives old task urls).
3. The move: `TaskMove` with the manifest (sha1 snapshot, `--verify --run last`, `--undo` reverses that run only; proven on a worktree copy today), then `--relink --run last`.
4. Proof: `check_page` on the four pages in the worktree, zero failed requests; `one-tree-census.mjs` shows 0 card folders left at `ai/YYYY/`.
