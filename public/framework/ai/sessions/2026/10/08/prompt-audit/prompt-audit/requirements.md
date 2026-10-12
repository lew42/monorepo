# Prompt audit — what did the owner ask for that never got built?

Owner (2026-10-07): "I feel like I've asked for many things that aren't getting built. Last week we hit a bunch of walls and had to stop a bunch of in-flight tasks. Not sure if we have a task queue that reveals any of this." Also: focus on the prompt refinement system (`ext/Refine`, prompt/refine strings) — has anything been built?

Budget: $1.50. Haiku, low effort. This is a SEARCH task: **compute, don't read hundreds of files.** Use node scripts / grep to shortlist; read only the shortlisted lines. Batch reads (many files in ONE turn). If a source has nothing, "none" is success — say so and stop.

## Sources (start here, in this order)
1. `public/framework/ai/asks.jsonl` — the owner's routed asks, with owner agent, card and status.
2. `public/framework/ai/todo.md` and the task dirs' `task.jsonl` (`landed_at` missing = never landed; stopped/aborted outcomes).
3. `public/framework/ai/cards.jsonl`, `servex-queue.json`, and the `prompts` log (find it: `Servex` logs under `%LOCALAPPDATA%/lew42/servex/logs/` and `public/framework/ai/log.jsonl`).
4. `ext/Refine/` and a string search for `refine` / `prompt` in readmes and `doc/*.md`.

## Deliverables (numbered; a short report is `report.md` in this dir — one screen, plain sentences, links)
1. A script `audit.mjs` (in this dir) that lists every ask/task from asks.jsonl and task.jsonl with its final state (landed / stopped / never started / stale), counted by week. Run it; save `audit.json`.
2. The top ~15 owner asks that look unbuilt or stopped, each with: what was asked (quote), where it lives, its state, and what the evidence is. No guessing: "unknown" is allowed.
3. What exists of prompt refinement today (files, what it does, whether it is wired in). Two sentences.
4. How many tasks were stopped in flight last week and why (usage wall? error?) if the logs say.

## Rules
Do not edit anything outside this dir. Commit your own files with clear attribution. Land with `finish-task`.
