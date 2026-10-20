# Tab session record: every VS Code tab's session folder gets session.jsonl

Budget: $6. Sonnet, medium effort. Queued by the system architect, 2026-10-20 (decision `d-how-does-a-vs-code`, option A, in [the architect's task log](../system-architect/)). Start after [session-record](../session-record/) lands: it owns the hooks this touches.

## Why

The owner (2026-10-20, section 9 of [owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md)): every session folder must have `session.jsonl`, the one session log. Today a VS Code tab's store folder (`ai/sessions/YYYY/MM/DD/session-<id8>/`) holds only `cache.jsonl` and `index.json`. The owner's prompts ARE logged by code already (`.claude/hooks/prompt-relay.mjs`, as `Prompt` items through `page_add`), but into the old flat folder `public/framework/ai/YYYY/MM/DD/session-<id8>/page.jsonl` (`session_page_url()`), so the tab's own session page never shows them. Retyping prompts through tool calls costs output tokens; the hook is the right writer.

## Deliverables

1. **SessionStart hook** (`.claude/hooks/session-page.mjs`, or a sibling hook): for a tab not started by Servex, append line 1 `{"session":{"id","kind":"vscode-tab","cwd","at"}}` to the store folder's `session.jsonl` (path from `TaskDirs.session_dir(id)` / `SessionRecord.start_file`; never hand-built). Once only: a resume appends nothing new.
2. **prompt-relay**: `session_page_url()` returns `/framework/ai/sessions/<session id>/`. The page tool already resolves that url to the store folder (verified: a `page_log` on `/framework/ai/sessions/607e82b5-…/` wrote `ai/sessions/2026/10/20/session-607e82b5/page.jsonl`). The prompts then sit in `page.jsonl` beside `session.jsonl`. Nothing is copied twice.
3. **Readers follow**: `Server/DayPromptsRefine.mjs` (walks `ai/YYYY/MM/DD/<slug>/page.jsonl`) also walks the store; `Servex/agents/Echo.js` and `ext/Refine/RefineExplorer.js` read the url the hook passes, so check they still find the item. `Server/AskTally.mjs` reads the raw transcripts and is unaffected.
4. Old prompt pages (13 days under `public/framework/ai/2026/10/`) stay where they are; a move script (dry run, manifest, `git mv`) is a follow-up, not this task.
5. Update [ai/sessions/readme.md](/framework/ai/sessions/) "On disk" (a tab folder now holds `session.jsonl` + `page.jsonl`) and [context-loss.md](/framework/ai/doc/context-loss.md).

Proof: open a fresh tab, type one prompt, and show both files in the store folder. Land with `finish-task`.
