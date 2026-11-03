# Prompt audit, week of 2026-10-14: what is still open

The first full run of the [prompt audit](/framework/ai/doc/prompt-audit.md) over the last 7 days: two VS Code tabs, this one ([e00f55c9](prompt-audit.jsonl)) and the Fable tab ([730e8a7b](../../13/session-730e8a7b/prompt-audit.jsonl)). It cost **$12.00** (Haiku $8.03, Sonnet $3.96), almost double the $6.40 estimate, because each long dictation was counted two or three times (below).

The reviewer listed 117 important open asks, but they are mostly the same few asks repeated. Merged by hand into what is really open:

| # | Still open | Where it stands |
|---|---|---|
| 1 | **Session and task views**: session detail page, task and project views, segmented progress bars, a session completes from its tasks, day view, mobile list, compact grid | Designed in [Figma](/framework/ai/sessions/doc/design-first.md); nothing built yet |
| 2 | **Dictation works**: one dictation code path for the sidebar and the phone sheet, streaming Whisper, the widget cleanup | Planned ([dictation map](sessions-and-tasks/dictation-map/)); waiting behind 1 |
| 3 | **Tasks capture themselves**: every new task lands in the index automatically and defaults into its session's record | Store slices 1–3 done; auto-indexing not built |
| 4 | **One voice assistant per session** (merge the duplicate voice sessions) | Queued |
| 5 | **A dashboard that shows what is done today**, and inbox items that open in the right place | Rejected as a date page; it belongs as a filter on the sessions grid (part of 1) |
| 6 | **Token accounting by module and role**, from a script that keeps it current | Answered once in chat, not built |
| 7 | **Repo prune** (about 24 GB of stale worktrees) after a backup to the E drive, with a checkable inbox item | Not verified done; Fable-tab ask |
| 8 | **Class architecture**: investigate and propose the hierarchy | Ongoing ([items hold items](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md)) |

**Listed as open, actually done:** the permanent tunnel and DNS (servex.lew42.com), Servex and its MCP running.

## What the run taught the audit

- ⬜ **The same prompt counted two or three times.** After a compaction, the transcript repeats earlier prompts with new line numbers (p5 = p4172, p383 = p4436). Drop a prompt whose text matches an earlier one before calling Haiku: that halves the cost and the duplicate loose ends.
- ⬜ **An "answered" state.** Questions and statements answered in chat were marked "rejected"; the reviewer asked for a fifth state.
- ⬜ **Better leads for "done".** Commit subjects alone gave weak evidence; match on the files each commit changed (already the planned next change in the doc).
