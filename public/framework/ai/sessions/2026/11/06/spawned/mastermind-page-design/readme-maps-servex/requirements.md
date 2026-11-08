# Readme maps: Servex (slice 3)

Budget: $3. Load the `minion` skill first.

**The ask** (the owner, 2026-11-06/07, relayed by voice-app 2026-11-08; record: [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/), task readme-maps): readmes are the index ([agents.md law 11](/framework/ai/agents.md)).

- [ ] Each readme is a map of its system, so a reader can tell what is built from what is planned.
- [ ] Each readme has search terms that find past work fast.
- [ ] No file in the folder is unlinked from every readme.

**The model to copy:** slice 1, commit 59fcd6650 (`git show 59fcd6650 -- public/framework/core/Item/readme.md`). Read it first and match its shape.

**Additive only.** Append new sections and create the two new map files; rewrite nothing that is there. Docs only, no code. Work in the main tree (no worktree).

## Fence

You may edit or create exactly these:
- `Servex/readme.md` (append) and `Servex/map.md` (new)
- `Servex/agents/readme.md` (append) and `Servex/agents/map.md` (new)
- `Servex/ext/remote/readme.md` (append)
- `public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/readme-maps-servex/` (your `orphans.txt`, `terms.txt`)

Do not touch anything about the MCP tool inventory or the item-tool plan (`/live/plan/item-tool/`); it waits on the owner. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`, never commit (the mastermind commits). rg is not installed: use `git grep`.

## Why two map files

`Servex/` has 52 files at its top level (plus 36 tests) and `Servex/agents/` has 73 (plus 70 tests). A table that long would push each readme far past the ~100-line readme limit. So the full file table goes in a sibling `map.md`, and the readme gets a short `## Map` section that links it. `ext/remote/` (10 files) keeps its table in the readme.

## Deliverables

1. **The file table** (`Servex/map.md`, `Servex/agents/map.md`, and inline in `Servex/ext/remote/readme.md`). The title is `# Map: Servex/` (or `Servex/agents/`), then one line on what the file is.
   - A table with one row per file at the top level of the folder: `| File | What it does |`, linked (`[Agents.js](./Agents.js)`). Read the head of each file (its class comment and exports) before you write its line; never guess from the name. Keep it to one short line each, no prose.
   - All tests (`*.test.mjs`, `*.test.js`) go in ONE row that lists every test file name.
   - One row per subfolder (`doc/`, `roles/`, `ext/openrouter/` ...): what it holds, in a few words, linking its readme if it has one. Data and fixture files may share one row.
2. **In each of the three readmes, a `## Map` section**, placed just before the readme's last section (`## More` or its equivalent; if there is none, at the end). It holds:
   - For Servex and agents, one line: "Every file, one line each: [map.md](./map.md)". For remote, the table itself.
   - **"How it connects"**: the 3–5 main links as JavaScript, one per line, each with the file:line where it happens. Find the real lines with `git grep -n`. The ones voice-app named, as a floor, not a ceiling:
     - spawn: `spawn_agent` → `Agents` → `claude.exe` (via the SDK) → `SpawnLog`
     - an MCP request → its tool → `page_tools` / the `item` tool
     - remote: `/mcp/remote` → `RemoteMCP` → `voice_session`
     Write both what it calls and what calls it.
   - **"Design"**: which `doc/*.md` files hold the design, architecture first. Only docs that exist.
3. **A `## Search terms` section** in each readme, right after Map: the words that find this module's past work in `git log`, transcripts and session records. Method names, tool names, old names, the owner's own words. For EACH term, run `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` (files) and `git log --oneline -S '<term>' | wc -l` (commits), and write the numbers beside it: `` `spawn_agent` (sessions 41 files · 12 commits) ``. Drop a term with 0 and 0. Aim for 8–15 terms per readme. Put the raw command output in `terms.txt`.
4. **Unlinked files.** By script, list every file at the top level of each of the three folders, and every file directly in `Servex/doc/`, `Servex/agents/doc/` and `Servex/agents/roles/`, whose basename appears in NO `readme.md` or `map.md` in that folder tree. Write the list to `orphans.txt` with a count per folder, before and after. Each file the map now links fixes itself. For a `doc/*.md` still unlinked, add one line for it under "Design" (a few words on what it is), or, if it is clearly dead, list it in `orphans.txt` with why and leave it.

Links are file paths relative to the file they are in (`./Agents.js`, `./doc/architecture.md`).

## Report

When done, append one log line with the item tool:
`item({path: "/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/", delta: {"readme-maps-servex": {"log": {"text": "<what you added>; orphans before → after per folder; terms checked"}}}})`
If the item tool refuses you, put it in your reply instead. Then reply in under ten lines: lines added per file, orphans before → after, and anything you could not settle.
