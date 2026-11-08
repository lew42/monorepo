# Readme maps, slice 2: the session system (core/Session, ai/sessions)

Budget: $4. Load the `minion` skill first.

**The ask** (the owner, 2026-11-06/07, relayed by voice-app 2026-11-08; record: [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/), task `readme-maps`): readmes are the index ([agents.md law 11](/framework/ai/agents.md)). Each readme is a system map with search terms, so a future agent can tell built from planned and find past work fast; no file that no readme links to.

**The model to copy:** slice 1, commit `59fcd6650` (`git show 59fcd6650 -- public/framework/core/List/readme.md` is the shortest example). Its brief: [../../mastermind-page-design/readme-maps/requirements.md](../../mastermind-page-design/readme-maps/requirements.md). Same three deliverables, same shape, same counting commands.

**Additive only.** Append new sections; rewrite nothing that is there. Docs only, no code. **Work in the worktree `C:/Code/lew42/worktrees/qf-2`** (branch `worktree/qf-2`): every path below is relative to it. Commit there by exact path when done (`git -C C:/Code/lew42/worktrees/qf-2 commit <paths>`); the mastermind merges.

## Fence

You may edit exactly two readmes, and write scratch files in this folder:
- `public/framework/core/Session/readme.md` — Map + Search terms go just before `## More` (line ~170).
- `public/framework/ai/sessions/readme.md` — Map + Search terms go just before `## More` (line ~93). Its existing "Top-level files here" section stays; the Map table may replace nothing, it adds the per-file lines.
- `public/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/readme-maps-sessions/` (your `orphans.txt`, `terms.txt`)

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never merge or push. rg is not installed: use `git grep`.

## Deliverables

1. **`## Map`** in each readme, exactly as slice 1:
   - A table, one row per top-level file (read its head before writing; never guess from the name). Tests in ONE row. One row per subfolder. In `ai/sessions/` the many generated `*.json` / `*.jsonl` record files may be grouped into a few rows by kind (moves and manifests; indexes and trees; costs), naming every file; the year folders `2026/` etc. are ONE row ("one folder per session, by day").
   - **"How it connects"**: 3–6 links as JavaScript, each with `file:line` (open the file and check the line). These five must appear, in whichever of the two readmes they belong (core/Session for the classes, ai/sessions for the scripts and records):
     - `SessionFolders.at(store).of(id)` / `.record_of(id)` / `.create(id, {first})` (`public/framework/core/Session/SessionFolders.mjs`)
     - `session.completion_score()` (`Session.js`) → read by the truth page via `Server/Truth.mjs`
     - `Server/session-query.mjs` (what it answers, who calls it)
     - `Server/ChildLinks.mjs` (child session under parent)
     - `RemoteMCP.voice_session()` (`Servex/ext/remote/RemoteMCP.js`): the cloud voice record, `caller:` and `conv:` keys in `remote.sessions.json`
     Show both what it calls and what calls it (`git grep -n` across `public/`, `Server/`, `Servex/`).
   - **"Design"**: which `doc/*.md` holds the design (architecture first). Only docs that exist.
2. **`## Search terms`**, right after Map, 8–15 terms per readme: method names, old names, the owner's words. Must try at least: `one folder per session`, `twins`, `completion_score`, `record_of`, `SessionFolders`, `voice_session`, `session.jsonl`, `child session`. For EACH: `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` and `git log --oneline -S '<term>' | wc -l`, written as `` `term` (sessions N files · M commits) ``. Drop 0 and 0. Raw output in `terms.txt`. A term goes in one readme only.
3. **Unlinked files**, by script, as slice 1: every top-level file and every file directly in `doc/` of both folders whose basename appears in no `readme.md` in that folder tree. Write before → after counts per folder to `orphans.txt`. Link each remaining `doc/*.md` under "Design" with a few words, or list it in `orphans.txt` with why (clearly dead, generated).

Links are file paths relative to the readme (`./Session.js`, `./doc/identity.md`, `../../../../Server/Truth.mjs`).

## Report

Append one log line with the item tool:
`item({path: "/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/", delta: {tasks: {"t17-readme-maps": {log: {text: "<what you added>; orphans before → after per folder; terms checked"}}}}})`
Then reply in under ten lines: lines added per readme, orphans before → after, anything you could not settle.
