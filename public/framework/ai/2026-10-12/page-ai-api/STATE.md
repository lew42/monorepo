# page-ai-api: state

- ✅ Model written: [`core/Page/doc/ai-api.md`](/framework/core/Page/doc/ai-api.md) (worktree `worktree/page-ai-api`, commit 0ca227795). Two tools: `page_set` (write) + `page_read` (look); `pages.add/rename/remove` for subpages; old names are aliases.
- ⏳ Build: @minion-page-ai-api-build (Sonnet), brief [build/requirements.md](build/requirements.md): `Subpages` class, `page_set` pages key + ids, session subpage resolve, descriptions, session page draws parts live.
- ⬜ Merge, one Servex restart, then the Haiku live proof (heading + 3 cards + subpage on its own session page, timed by a headless browser).
- ⬜ Layout check 400/1200/1920/3440, readme links (core/Page, Servex/agents), finish-task.

## Decisions
- One write tool; `page_add`, `page_call`, `page_log`, `create_page` kept as aliases (alternative: keep them first-class).
- `pages` is turned into a folder + the existing `{"file"}` line by the tool (alternative: a `pages` verb in `Page.set()`; rejected while Page.class.js is frozen by the split plan).
- Removed subpages go to `<parent>/_removed/<name>-<time>/` (alternative: a repo-level archive dir).

## Coordination
- send_to_agent to @mastermind-voice-to-session-page and @mastermind-page-split-plan was refused (messaging fence: only parent, children, or recent senders). Their briefs already say: use this task's tools / do not edit Page.class.js. This task does not edit Page.class.js.
