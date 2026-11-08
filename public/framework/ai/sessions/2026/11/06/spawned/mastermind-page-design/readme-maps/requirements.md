# Readme maps: core/Item, core/List, core/Page (first slice)

Budget: $3. Load the `minion` skill first.

**The ask** (the owner, 2026-11-06/07, relayed 2026-11-08; record: [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/)): readmes are the index ([agents.md law 11](/framework/ai/agents.md)).

- [ ] Each readme is a map of its system: what is built vs planned.
- [ ] Each readme has search terms that find past work fast.
- [ ] No file in the folder is unlinked from every readme.

**Additive only.** Append new sections; rewrite nothing that is there. Docs only, no code. You work in the main tree (no worktree).

## Fence

You may edit exactly three readmes, and write your two scratch files in the fourth path (this folder):
- `public/framework/core/Item/readme.md`
- `public/framework/core/List/readme.md`
- `public/framework/core/Page/readme.md`
- `public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/readme-maps/` (your `orphans.txt`, `terms.txt`)

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never commit (the mastermind commits). rg is not installed: use `git grep`.

## Deliverables, for each of the three folders

1. **A `## Map` section**, placed just before `## Watch out` (List, Item) or just before `## More` (Page).
   - A table, one row per file at the top level of the folder: `| File | What it does |`. Read the file's head (class comment, exports) before you write its line; never guess from the name.
   - Tests (`*.test.mjs`) go in ONE row, listing every test file name (they are named for what they check).
   - One row per subfolder (`doc/`, `tasks/`, `replay/` ...): what it holds, in a few words. Data files (`files.jsonl`, `weight.jsonl`, `inbox.jsonl`, `improvements.jsonl`, `task.jsonl`, `page.jsonl`, `expert.json`) may share one row.
   - Under the table, **"How it connects"**: the 3–5 main links as JavaScript, one per line, each with the file:line where it happens. For example `Item.open(url)` → `Store` (`Item.js:831`). Both what it calls and what calls it (use `git grep -n` across `public/` and `Servex/` for the callers).
   - Then **"Design"**: which `doc/*.md` holds the design (architecture first). Only docs that exist.
2. **A `## Search terms` section**, right after Map: the words that find this module's past work in `git log`, transcripts and session records. Method names, old names, the owner's own words for it. For EACH term, run `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` (files that mention it) and `git log --oneline -S '<term>' | wc -l` (commits), and write the two numbers beside the term, like `` `Item.open` (sessions 41 files · 12 commits) ``. Drop any term with 0 and 0. Aim for 8–15 terms. Put the raw command output in `terms.txt`.
3. **Unlinked files.** By script, list every file at the top level of the folder, and every file directly in its `doc/`, whose name appears in NO `readme.md` inside that folder tree (`git grep -l '<basename>' -- 'public/framework/core/<X>/**/readme.md' 'public/framework/core/<X>/readme.md'`). Write the list to `orphans.txt` with a count per folder. Each file that the Map now links fixes itself; for each `doc/*.md` still unlinked, add it to a `doc/` line under "Design" (one line each, with a few words on what it is), or, if it is clearly dead, list it in `orphans.txt` with why and leave it.

Links in readmes are file paths relative to the readme (`./Item.js`, `./doc/architecture.md`).

## Report

When done, append one log line to the task with the item tool:
`item({path: "/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/", delta: {"readme-maps": {"log": {"text": "<what you added>; orphans before → after per folder; terms checked"}}}})`
Then reply in under ten lines: lines added per readme, orphans before → after, and anything you could not settle.
