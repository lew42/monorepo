# Prompts as records: every owner prompt broken down, tracked and completed

Estimate: $20. Opus, high effort. You are the **prompt mastermind**. Parent: `vscode-mastermind`. Spawn Haiku and Sonnet helpers as you see fit; merge reviewed work yourself (autonomous by default). Coordinate with `mastermind-system-architect` (sessions and tasks flow) and `mastermind-item` (items, the item tool).

## The owner (2026-10-22, tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`, the long prompt about session auditing; read it whole)

The objective ([priority.md](/framework/ai/priority.md)): complete as many tasks as possible every day; every owner prompt becomes tracked tasks or notes; **a prompt is complete when everything it asks is done or documented.** The owner does not trust that past prompts were fully handled: long dictations hide sentences nobody acted on.

## What exists (extend, don't rebuild)

- `ext/Refine/` (the older refine system, wired to Whisper dictation: raw transcript → sentences → cleaned punctuation → refined → tasks; it has a `Prompt.js` class) and its readme and docs: read them, keep the good ideas, say what to drop.
- `Server/PromptAudit.mjs` + [prompt-audit.md](/framework/ai/doc/prompt-audit.md) (two passes, lean Haiku per prompt with no context, a Sonnet reviewer; its weaknesses are written there) and the [7-day report](/framework/ai/sessions/2026/10/20/session-e00f55c9/prompt-audit-week-2026-10-22.md).
- `task/prompt-tasks` (live: each VS Code owner prompt refined by Haiku, asks filed as waiting tasks on the session; being fixed by the architect) and the process system ([process.md](/framework/core/Task/doc/process.md)).

## Design and build

1. **A prompt is an item with completion** (decide the class and home; `ext/Refine/Prompt.js` is the candidate): its sentences or paragraphs, each attributed to an outcome (a task, a doc note with its file, a commit, "no action: a data question", "no action: conversation"), and its completion computed from them. Where prompts are stored (in the session's JSONL, a per-session prompts file, or one file per prompt): decide and say the alternative.
2. **One pipeline, several processes:** the same steps for Whisper, the cloud voice agent and VS Code tabs, live or after the fact; the instructions differ per process (live: file proposals fast; review: find the evidence). Define them as processes.
3. **Session audit, by experiment:** compare on one long session (a) the lean Haiku pass, (b) Haiku given the whole session transcript (over 100k, about 5x per token; let it read in chunks or compact), (c) a node loop that asks a context-loaded agent paragraph by paragraph "what was asked, what was done, where is the evidence". Measure cost and how many asks each finds versus a careful Opus reading of 2 long prompts; pick the process.
4. **Apply it to this tab's session** (`e00f55c9`): every prompt gets its breakdown; anything asked and not done or documented becomes a task on the session (or the note gets written); prompts fully handled are marked complete. Don't create tasks just to check them off.

## Done when

- [ ] The prompt record and its completion, the processes, the experiment's numbers and the pick, written in the module's readme/doc (conclusions only).
- [ ] This session's prompts audited and completed or turned into tasks; the session page shows it.
