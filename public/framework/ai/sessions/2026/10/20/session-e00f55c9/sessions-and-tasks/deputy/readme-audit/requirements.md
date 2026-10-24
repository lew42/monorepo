# Readme audit, pass 1: how far each readme is from the documentation rule

Budget: $10 (Sonnet, medium, for the build; at most $6 of that on Haiku calls). Parent: `mastermind-deputy`, who reviews and merges. Load the `minion` skill first.

## Why

Priority 3 in [priority.md](/framework/ai/priority.md) names "a cheap pass that makes every readme follow the doc rule" as next. The rule is the `documentation` skill, §4 (`.claude/skills/documentation/SKILL.md`, "The documentation rule"): `readme.md` is the folder's index (what the folder is, one line and a link per part, current decisions, no dated logs), `<topic>.md` beside it for an often-read topic, `doc/` for the rest, and a folder over about 10–15 files is grouped into subfolders. The audit was planned in [ai/doc/readme-system.md](/framework/ai/doc/readme-system.md), "A readme audit, on the prompt-audit pattern"; this is its pass 1, with one change: **a script computes everything a script can (CLAUDE.md law 7); Haiku judges only what needs reading.** Pass 2 (proposing and applying fixes) is the next slice, not this one.

## What exists (reuse, don't rebuild; law 6)

- `Server/doc-check.mjs`: checks the links and paths in a task's readmes. Reuse its link check for "dead links" (import it, or extract the function into a shared export if it is not exported; say which).
- `Server/ReadmeOrphans.mjs`: a folder with a readme that its parent readme never names. Reuse its output as the "orphan" field.
- `Server/ReadmeChains.mjs`: walks every folder with a readme (its `SKIP` excludes dated session folders) and writes `public/framework/ai/readmes/chains.json`. Use the same walk and skip, so both agree on which readmes exist.
- `Server/PromptAudit.mjs`: the Haiku call (`spawnSync` of a headless claude turn) and its queue. Reuse that call.
- The Readmes page `/framework/ai/readmes/` (`ReadmesView.js`, readme `public/framework/ai/readmes/readme.md`): an `ext/DataGrid` over `chains.json`.

## What to build

1. **`Server/ReadmeAudit.mjs`, `class ReadmeAudit`** (name and home decided).
   - `node Server/ReadmeAudit.mjs --computed` runs the free checks on every readme. `--haiku --limit N` adds the Haiku judgment to N readmes; `--haiku` with no limit does all that changed. `--path <readme>` does one.
   - It writes `public/framework/ai/readmes/audit.jsonl` (the data lives beside its page), one line per readme: `{readme_audit: {v: 1, path, sha, words, files, unnamed: [], dead_links: [], orphan, docs_folder, dated_lines, crowded, shape, history: [], note}}`. Append-only; the latest line per path wins; a rerun skips a readme whose `sha` has not changed.
   - **Computed:** `words`; `files` (entries in its folder); `unnamed` (files and child folders in its folder that the readme never mentions by name; ignore `files.jsonl`, `page.jsonl`, logs, `shots/`, generated `*.json`); `dead_links` (from doc-check); `orphan` (from ReadmeOrphans); `docs_folder` (a `docs/` folder exists, which the rule forbids); `dated_lines` (lines that carry a date like `2026-10-12` outside a link, a rough count of log-like lines); `crowded` (more than 15 files and no subfolder).
   - **Haiku** (one call per readme, given the readme text and its folder's file names, never the code): `shape` (one word: `index`, `essay`, `log` or `mixed`), `history` (up to 3 lines quoted from the readme that record how something was decided rather than what is true now), `note` (one sentence: the one change that would most improve this readme under the rule).
2. **The Readmes page** shows the audit: columns in the existing grid for words, unnamed, dead links, shape (and the note as the row's tooltip or in its detail panel), read from `audit.jsonl`. Sort by the worst first or let the grid sort. Load the `page` skill before changing it.
3. **Docs:** `ai/readmes/readme.md` names `audit.jsonl` and `ReadmeAudit.mjs` (what writes, what reads); `ai/doc/readme-system.md`'s audit section says pass 1 is built and how to run it, and keeps pass 2 as the next step.
4. **A test**, `Server/ReadmeAudit.test.mjs`: a small fixture folder (in the OS temp dir, never inside `public/`) with a readme that has an unnamed file, a dead link, a dated line and a `docs/` folder; the computed fields come out right.

## Check it

- **Two numbers that must agree:** readmes the walk found, and paths in `audit.jsonl` after `--computed`. Also say how many readmes `chains.json` lists.
- **Haiku calibration first:** run `--haiku --limit 20`, then read 5 of those readmes yourself and say how many of the 5 `shape` and `note` answers you agree with. Only then run the rest (`--haiku`), and log the real cost per readme. Stop at $6 of Haiku spend.
- The page loads on your worktree with no console error (`node Server/smoke.mjs C:/Code/lew42/worktrees/qf-4 /framework/ai/readmes/`), with a headless shot at 1920 saved in this folder.
- Deliverable report (a screen): the counts above, the 10 worst readmes by a simple score you define and state, how many are `index` against `essay`/`log`/`mixed`, and the Haiku cost. Put findings as `log` lines in this folder's `session.jsonl`, not in a findings file.
- Commit at each working step. Reply `ready: <sha>` with the two numbers.

## Where

- Worktree `C:/Code/lew42/worktrees/qf-4` (branch `worktree/qf-4`, server http://127.0.0.1:54107/), already taken for you. Restart its server, after a `Server/` change, from the main tree: `node Server/worktree-restart.mjs qf-4` (it does not work from inside the worktree).
- `audit.jsonl` is written in the worktree and committed there with the code, so it merges with it.
- Edit only: `Server/ReadmeAudit.mjs`, its test, `Server/doc-check.mjs` (only to export its link check, if needed), `public/framework/ai/readmes/*`, `public/framework/ai/doc/readme-system.md`. No readme fixes in this slice: the audit reports, it does not edit.
- Never kill or restart the owner's dev server (port 80, monorepo.localhost) or Servex, never `git stash`, never drive the owner's tabs. Search with Glob or rg scoped to the repo, never `find /`.
- If a skill misled you, add one evidence line to that skill's `improvements.md`.
