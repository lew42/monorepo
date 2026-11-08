# Mentions index: past work and counts (study only, no build)

Budget: $3. Load the `minion` skill first. Sonnet.

**The ask** (the owner, 2026-11-06/07, relayed by voice-app 2026-11-08; record: [cloud-voice-app-20261106](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/)): when a prompt mentions `@Page` (or any module or class), that tags it; each module then lists the prompts that mention it, so you can open Page and see every ask about it. Your job is the facts for the plan; the mastermind writes the plan.

**Work in the worktree `C:/Code/lew42/worktrees/qf-4`** (branch `worktree/qf-4`). Read the main tree's data if the worktree lacks it (session logs are the same). Write ONLY into this folder in the worktree: `public/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/mentions-plan/`. Commit there by exact path; never merge or push. rg is not installed: use `git grep`. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.

## 1. Past work (a table, `past-work.md`, one screen)

What exists or was planned for mentions, @-tags, `#Name`, glossaries, vocabulary tags. Start from these, then `git grep -l -i` for `mention`, `glossary`, `vocabulary`, `refs.js`:
- `public/framework/ext/Mention/` (readme, `doc/architecture.md`, `maps/refs.js`, `maps/people.js`, `sync.mjs`, `files.jsonl`, `tasks/`)
- `public/framework/ai/sessions/2026/09/30/mentions/`, `2026/09/01/vocabulary-tags/`, `2026/10/03/list-events/mention-auto-sync/` and `ref-content-rows/`
- `public/framework/ai/indexing-past-work.md` (the index map), `Server/PastWork.mjs`, `core/Session/SessionIndex*`, `ext/Refine` (prompt cards, coverage)

Per row: what it is, built or planned, live or dead (is it imported or run anywhere today? `git grep` the caller and give it), and its file. Prove "dead" with the empty grep. End with: does anything already map a prompt to the modules it names? Yes or no, with the file.

## 2. Counts (a node script `count.mjs` in this folder; raw output `counts.json`)

The prompts: this week's owner prompts (2026-11-02 to 2026-11-08).
- VS Code tabs: `Prompt` lines and `refined.sentences` in `public/framework/ai/sessions/2026/11/0[2-8]/**/session.jsonl` (format: `indexing-past-work.md` §2, row "VS Code tab"). Count each prompt once.
- The cloud transcript: the owner's turns in `public/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/session.jsonl` (and `2026/11/08/cloud-voice-app-20261108/` if it has them). Say which field holds the owner's words.

The vocabulary: the names in `ext/Mention/maps/refs.js` (+ `people.js` for `@`), plus the terms in every `## Search terms` section of a readme (`git grep -n '## Search terms'`).

Count, and write all of it in `counts.json`:
- prompts in total, per source
- **explicit**: prompts containing `@Name` or `#Name` where Name is in the maps; and `@Word`/`#Word` NOT in the maps (list the top 20 unknown words)
- **implicit**: prompts containing a map name as a whole word, case-sensitive for capitalised names (`Page`, `Task`), and prompts matching a Search-terms term
- the top 20 names by number of prompts, and how many prompts tag 0, 1, 2–3, 4+ names
- two numbers that must agree: the sum over prompts of names tagged = the sum over names of prompts tagging it
- 5 sample prompts (first 120 characters) with the names they tag, and 5 implicit matches you judge FALSE (e.g. "page" meaning a web page, not the Page class): an honest false-positive estimate out of 20 random implicit hits

## Report

Append one log line with the item tool:
`item({path: "/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/", delta: {tasks: {"t18-mentions-plan": {log: {text: "<past-work yes/no in a sentence>; prompts N; explicit N; implicit N; false-positive est. N/20"}}}}})`
Then reply in under ten lines.
