Budget: $7

# Sub-pages: how much a parent loads today, and when a card becomes a folder

Load the `minion` skill first, then the `page` skill. Card (the owner's words, relayed by voice-app): `/framework/ai/2026/11/06/sub-pages-storage-load-cost-indexes/`. **Measure and propose only: build no storage change.**

Start from these docs (they already hold most of the design, so extend them, don't restart):
- [core/Page/doc/index-jsonl.md](/framework/core/Page/doc/index-jsonl.md): the index.jsonl plan from 2026-11-01, not built.
- [core/Page/doc/recursive-pages.md](/framework/core/Page/doc/recursive-pages.md): "one address, two shapes": embedded by default, its own folder when it needs files.
- [core/Page/doc/files.md](/framework/core/Page/doc/files.md) §1 (D9).
- lazy children as a load depth, from 2026-08-30: `/framework/ai/sessions/2026/08/30/lazy-children/`.

## Q2 first: measure what a parent loads today (the owner's scaling question)

"When a parent page loads, does it instantiate every child page, recursively load every nested page.jsonl, and replay all their deltas?"

1. **Read the code path** of a page.jsonl page loading its children (`core/Page/Jsonl.js`, `Listing.js`, the `pages` List, LivePage if it differs). Say exactly what it fetches and replays: children one level deep, or every level? Only the titles, or every line? Give `file:line`.
2. **Measure it.** Use headless Playwright against your worktree server (never the owner's tabs). Record every request ending `.jsonl` for: `/live/`, `/live/design/`, `/framework/core/Page/`, and one dated sessions day (e.g. `/framework/ai/sessions/2026/11/06/`). Per url, report: jsonl files fetched, total bytes, the deepest folder level fetched, and time to first render.
3. **Two numbers that must agree:** for one url, the file count the code predicts against the count the network shows.
4. **Synthetic tree:** in your worktree only (never committed, deleted after), build a page.jsonl tree 4 levels deep with 5 children per level, 20 lines each. Measure it the same way, then extrapolate to the owner's case (1000 files): what loads before the parent renders?

## Q1: when does a card become its own folder?

1. **List every code path that creates a page folder today:** the `create_page` tool, `pages.add` in `Servex/agents/page_tools.js`, `move_item` / `Item.move_to`, `LivePage`'s `save`, and agents writing files by hand (`/live/design/` was hand-written). One line each, `file:line`.
2. **Propose the auto-upgrade rule** (embedded to `<name>/page.jsonl`). Possible triggers from the owner: its size, gaining sub-items or comments, being edited on its own. Include the naming rule: slug = folder name = path segment; the title is separate; a link label is the title. Recommend ONE trigger set and name the alternative. Say who performs the move (which existing function) and what is left behind (a Ref).
3. Add the result as a short section "When a card becomes a folder" in `core/Page/doc/recursive-pages.md`, in your worktree, committed. It is a proposal, so mark it as one.

## Cards (the deliverable the owner sees)

Post through the item tool at `/live/design/`, every card with `"tab":"Storage"` (the tab already exists; don't touch the `ui` line). Titles of a few words, a one-line subtitle, the visual carries the rest: a table or a code block with numbers and `file:line`. No paragraphs.
- a heading "Storage: load cost and folders";
- "What a parent loads today": a per-url table (files, KB, depth, ms);
- "1000 files: what happens": the extrapolation, as numbers;
- "What makes a folder today": the list of code paths;
- "Proposed: when a card becomes a folder": the trigger set plus the naming rule;
- one card linking `recursive-pages.md` as "the long form".

A Haiku worker posts the indexing cards to the same tab, so leave those alone.

## Fence
- Write only: your task dir, `core/Page/doc/recursive-pages.md` (in the worktree), `/live/design/` cards through the item tool, and synthetic test files in your worktree (deleted after).
- No code change to `core/`, `public/live/*.js` or `Servex/`. Never restart Servex or the dev server, never drive the owner's tabs, never `git stash`.

## Done
One `log` line in your task's session.jsonl: the measurement table, the predicted-vs-network check, the commit, and the card ids. Then stop; the mastermind merges.
