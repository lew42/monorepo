# Readme maps: the Dictate family (slice 4)

Budget: $4. Load the `minion` skill first.

**The ask** (the owner, 2026-11-06/07, relayed by voice-app 2026-11-08; record: [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/), task readme-maps): readmes are the index ([agents.md law 11](/framework/ai/agents.md)).

- [ ] Each readme is a map of its system, so a reader can tell what is built from what is planned.
- [ ] Each readme has search terms that find past work fast.
- [ ] No file in the folder is unlinked from every readme.

**The model to copy:** slice 3, commit 51cf5ecd0 (`git show 51cf5ecd0 -- Servex/readme.md Servex/map.md`). Read it first and match its shape exactly.

**Additive only.** Append new sections and create the two new map files; rewrite nothing that is there. Docs only, no code. Work in the main tree (no worktree).

## The family (decided by the mastermind)

- `public/framework/ux/Dictate/` — the mic widget, voice chat and every voice surface. Its subfolders `VoiceChat/`, `surfaces/`, `playground/`, `variants/`, `v1/`, `demo/`, `workspace/`, `ai/`, `doc/`, `test/`, `tasks/`.
- `public/framework/audio/` — the building blocks: `MicStream/`, `Recorder/`, `Transcriber/`, `Whisper/`, `Voice/`, `Recite/` (plus `v1/` and the older top-level folders `LevelMeter/`, `MicPicker/`, `PushToTalk/`, `mic-to-text/`, `push-to-talk/`, `sound-recorder/`).
- `public/framework/ext/Session/` is NOT mapped (another system), but the "How it connects" chain ends there, so cite its file:line.

## Fence

You may edit or create exactly these:
- `public/framework/ux/Dictate/readme.md` (append) and `public/framework/ux/Dictate/map.md` (new)
- `public/framework/audio/readme.md` (append) and `public/framework/audio/map.md` (new)
- One appended link line in each of: `ux/Dictate/VoiceChat/readme.md`, `ux/Dictate/surfaces/readme.md`, `audio/MicStream/readme.md`, `audio/Recorder/readme.md`, `audio/Transcriber/readme.md`, `audio/Whisper/readme.md`, `audio/Voice/readme.md`, `audio/Recite/readme.md`: `Every file in this folder, one line each: [map.md](../map.md#<anchor>)` (path relative to that readme; `../../map.md` for the Dictate subfolders' depth if needed — check it resolves).
- `public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/readme-maps-dictate/` (your `orphans.txt`, `terms.txt`)

Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`, never commit (the mastermind commits). rg is not installed: use `git grep`. Search with `git ls-files` / `git grep` scoped to these folders, never `find /`.

## Why two map files

`ux/Dictate/` has ~41 files at its top level and its readme is already 157 lines; `audio/` has six module folders. A table that long would push each readme far past the ~100-line readme limit. So the full file tables go in a sibling `map.md` (one `##` section per folder, so the sub-readmes can link an anchor), and each readme gets a short `## Map` section that links it.

## Deliverables

1. **The file tables** (`ux/Dictate/map.md`, `audio/map.md`). Title `# Map: ux/Dictate/` (or `audio/`), one line on what the family is, then one `## <folder>/` section per folder that holds code: the top level, and each code subfolder (`VoiceChat/`, `surfaces/`, `MicStream/` …).
   - A table with one row per file at the top level of that folder: `| File | What it does |`, linked (`[Dictate.js](./Dictate.js)`, paths relative to map.md). Read the head of each file (its class comment and exports) before you write its line; never guess from the name. One short line each, no prose. A `.css` file that only styles its same-named `.js` may share that row (`Dictate.js` · `Dictate.css`).
   - All tests in a folder go in ONE row listing every test file name. Screenshots (`*.png`) in a folder share one row.
   - One row per folder you do not expand (`tasks/`, `doc/`, `playground/`, `variants/`, `v1/`, the old audio folders …): what it holds, in a few words, linking its readme if it has one. Data files (`*.jsonl`) in a folder share one row.
2. **In `ux/Dictate/readme.md` and `audio/readme.md`, a `## Map` section**, placed just before the readme's `## More` (Dictate: before line 142 `## More`; audio: before line 77 `## More`). It holds:
   - One line: "Every file, one line each: [map.md](./map.md)".
   - **"How it connects"**: the 3–6 main links as JavaScript, one per line, each with the file:line where it happens. Find the real lines with `git grep -n`. The floor voice-app named: **mic → sentences → session record**, i.e. the microphone (`MicStream` / `getUserMedia`) → chunks → `Whisper` / `Transcriber` → text → sentences in `Dictate` → sent and written to the voice session record (`ext/Session`, or wherever the code actually writes it: follow the calls, don't assume). Also: which pages mount the widget (`surfaces/`), and what reads replies aloud (`Recite`). Write both what it calls and what calls it. `audio/readme.md` already has a section "How `ux/Dictate` assembles them" (line 32): do not repeat it; the audio chain may be shorter and link it.
   - **"Design"**: which `doc/*.md` files hold the design, architecture first. Only docs that exist; one line each.
3. **A `## Search terms` section** in both readmes, right after Map: the words that find this family's past work in `git log`, transcripts and session records. Class names, method names, old names (`DictationBar`, `push-to-talk`), the owner's own words ("dictate", "mic", "whisper", "voice chat"). For EACH term, run `git grep -l -i '<term>' -- public/framework/ai/sessions | wc -l` (files) and `git log --oneline -S '<term>' | wc -l` (commits), and write the numbers beside it: `` `MicStream` (sessions 41 files · 12 commits) ``. Drop a term with 0 and 0. Aim for 8–15 terms per readme, each term in only one of the two readmes. Put the raw command output in `terms.txt`.
4. **Unlinked files.** By script, list every file at the top level of `ux/Dictate/`, `ux/Dictate/VoiceChat/`, `ux/Dictate/surfaces/`, `ux/Dictate/doc/`, `audio/`, `audio/doc/` and each of the six audio module folders (and their `doc/`), whose basename appears in NO `readme.md` or `map.md` in that family tree. Write the list to `orphans.txt` with a count per folder, before and after. Each file the map links fixes itself. For a `doc/*.md` still unlinked, add one line for it under "Design" (a few words on what it is), or, if it is clearly dead, list it in `orphans.txt` with why and leave it.

Links are file paths relative to the file they are in.

## Report

When done, append one log line with the item tool:
`item({path: "/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/", delta: {"readme-maps-dictate": {"log": {"text": "<what you added>; orphans before → after per folder; terms checked"}}}})`
If the item tool refuses you, put it in your reply instead. Then reply in under ten lines: lines added per file, orphans before → after, the How-it-connects lines you were least sure of, and anything you could not settle.
