<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Marked lines  what breaks if the writers switch  A scan  so the switch can be made safely" (words: marked, lin, break, writer, switch, scan, can, made, safely)

## Tasks (8, best first)
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-20 [writers](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-v2/writers/) — The assistants write the conversation — fd32ba0f4 on michael/dev, live since the 04:02 Servex restart. - ✅ one Prompt per spoken thought in the session's session.jsonl, written live while the owner talks (Servex/agents/Sessions.js say → PromptLines.js) - ✅ bo…
- 2026-10-20 [marked-lines-readers](/framework/ai/sessions/2026/10/20/session-e00f55c9/marked-lines-readers/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/marked-lines-readers/requirements.md
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-14 [Object-oriented review: function bags ranked, 5 made classes, 10 modu…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/oo-census/) — Landed on michael/dev (6a5f12b25). EditSwitch, AICost, DesignScore, LayoutControls and one more are classes with shims at the old paths; the ranked census is code/patterns/doc/oo-census.md (it says which callers were not rewritten and which class names are gu…
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…

## Modules that exist now (files outside the module that import it)
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files

## Docs and readmes
- [Who writes a line](/framework/core/Page/jsonl/doc/writers.md) — Seven things can add a line to a page.jsonl. None of them ever rewrite the file — every one of them only appends. | writer | what it append…
- [Decide: can the collapse be done without touching the activ…](/framework/core/Page/layout/switcher/doc/decide.md) — Yes. The narrow-width dropdown is a CSS-only, container-query addition in [switcher.css](../switcher.css) that reacts to classes core/Route…
- [One writer: every record line goes through one entry point](/framework/core/Item/doc/one-writer.md) — What it is. Every line written to a record file (session.jsonl, task.jsonl, page.jsonl, improvements.jsonl) goes through one function, reco…
- [ErrorLog — a UI error becomes one log line a session can fo…](/framework/ext/ErrorLog/readme.md) — ErrorLog.watch(stateFn) catches a page's uncaught errors and rejections; app.js calls it once on every page (since 2026-10-24). ErrorLog.re…
- [How a chat is made: mic to screen](/framework/ux/Dictate/doc/pipeline.md) — The whole path of one spoken sentence, with the file that does each step. Line numbers were read from the code on 2026-10-25; if one has dr…
- [How a line travels: out, ack, in, catch-up](/framework/core/Item/doc/transport.md) — What this is. An item's change is one line in a .jsonl file. This page follows that line from the tab that made it to every tab that shows …
- [Page storage and streaming — one line in a file, one redraw…](/framework/core/Page/doc/streaming.md) — A page keeps its data in plain text files inside its own folder. Anything can add a line to one of those files, and every open browser tab …
- [Subpages: a page.jsonl line, never a page.js edit](/framework/core/Page/doc/subpages.md) — A subpage is made by appending a line to its parent's page.jsonl. No agent edits a page.js, and the old children: "a b c" string is not tou…

## Sessions tagged with these words
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-8f866486/) — kind/owner model/sonnet work/read-only task/usage-pace-line framework/ai · $0.34
- 2026/10/13 [Minion arch timeline](/framework/ai/sessions/2026/10/13/session-19f42d95/) — kind/agent model/haiku mod/ui/timeline task/mastermind-repo-slim docs/architecture · $0.20

## Owner asks
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 UI: System class; /framework/ui/ library of approved blocks; class pills; masonry; siblin… (servex-mastermind-opus (spawn after the 10 PM weekly reset), queued)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, landed)

## Commits
- 7217da3b5 chat round 3: two moving cursors replace the per-prompt stamp; fix the paragraph-gap renderer bug

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Marked lines: what breaks if the writers switch? A scan, so the switch can be made safely

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Marked lines: what breaks if the writers switch? A scan, so the switch can be made safely"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
